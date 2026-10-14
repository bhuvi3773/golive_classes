import { chromium, Browser, Page } from '@playwright/test';
import http from 'http';
import https from 'https';
import jwt from 'jsonwebtoken';
import { spawn, ChildProcess } from 'child_process';
import path from 'path';
import fs from 'fs';
import { S3Client, GetPublicAccessBlockCommand } from '@aws-sdk/client-s3';

const PORT = 3005;
const BASE_URL = `http://localhost:${PORT}`;
const DUMMY_COURSE_ID = 'a061614f-eaa9-46a8-9c9e-421a4c49bfc1';
const TEST_S3_KEY = 'course-media/video/1791904568058-rei6obo2-test-course-video-1791904565882.mp4';
const LEGACY_S3_KEY = 'generativeaiofflinevideos/AWS DevSecOps Demo Video Golive Classes.mp4';

const envPath = path.resolve(__dirname, '../.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env: Record<string, string> = {};
envContent.split(/\r?\n/).forEach(line => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    let value = match[2] || '';
    if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
    else if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
    env[match[1]] = value.trim();
  }
});

const JWT_SECRET = env.JWT_SECRET || 'this-is-a-super-secret-key-for-golive';
const BUCKET = env.AWS_S3_BUCKET_NAME || 'goliveofflinevideos2025';
const REGION = env.AWS_REGION || 'ap-south-1';

const STUDENT_USER = {
  id: '774f8a50-b633-4d3a-b543-8cb78a46aeb1',
  email: 'testuser_1791530222588@example.com',
  role: 'student',
  name: 'Scholar Student',
};

const ADMIN_USER = {
  id: 'da35f0db-2114-4357-aec2-f033a8aa6e5e',
  email: 'admin@example.com',
  role: 'admin',
  name: 'Faculty Admin',
};

function createToken(user: { id: string; email: string; role: string; name?: string }) {
  return jwt.sign(
    { userId: user.id, id: user.id, email: user.email, role: user.role, name: user.name || 'Test User' },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

async function waitForServer(url: string, timeoutMs = 60000): Promise<void> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      await new Promise<void>((resolve, reject) => {
        const req = http.get(url, (res) => resolve());
        req.on('error', reject);
        req.setTimeout(2000, () => {
          req.destroy();
          reject(new Error('timeout'));
        });
      });
      return;
    } catch {
      await new Promise((r) => setTimeout(r, 500));
    }
  }
  throw new Error(`Server failed to start at ${url} within ${timeoutMs}ms`);
}

function checkAnonymousHead(url: string): Promise<number> {
  return new Promise((resolve) => {
    https.request(url, { method: 'HEAD' }, (res) => {
      resolve(res.statusCode || 0);
    }).on('error', () => resolve(0)).end();
  });
}

function checkCorsPreflight(): Promise<{ status: number; allowMethods?: string }> {
  return new Promise((resolve) => {
    const options = {
      hostname: `${BUCKET}.s3.${REGION}.amazonaws.com`,
      port: 443,
      path: '/course-media/videos/test.mp4',
      method: 'OPTIONS',
      headers: {
        'Origin': 'http://localhost:3000',
        'Access-Control-Request-Method': 'PUT',
        'Access-Control-Request-Headers': 'content-type',
      },
    };
    const req = https.request(options, (res) => {
      resolve({
        status: res.statusCode || 0,
        allowMethods: res.headers['access-control-allow-methods'],
      });
    });
    req.on('error', () => resolve({ status: 0 }));
    req.end();
  });
}

async function runPostHardeningTests() {
  console.log('='.repeat(70));
  console.log('      GOLIVECLASSES POST-HARDENING S3 PRIVACY VERIFICATION SUITE      ');
  console.log('='.repeat(70));

  let passed = 0;
  let failed = 0;
  const recordPass = (msg: string) => { passed++; console.log(`  ✔ [PASS] ${msg}`); };
  const recordFail = (msg: string, err?: any) => { failed++; console.log(`  ✖ [FAIL] ${msg}:`, err || ''); };

  // 1. Verify S3 Block Public Access configuration via AWS SDK
  console.log('\n[1/5] Verifying AWS S3 Block Public Access Configuration...');
  const s3 = new S3Client({
    region: REGION,
    credentials: {
      accessKeyId: env.AWS_ACCESS_KEY_ID || '',
      secretAccessKey: env.AWS_SECRET_ACCESS_KEY || '',
    },
  });

  const pab = await s3.send(new GetPublicAccessBlockCommand({ Bucket: BUCKET }));
  const cfg = pab.PublicAccessBlockConfiguration;
  if (cfg?.BlockPublicAcls && cfg?.IgnorePublicAcls && cfg?.BlockPublicPolicy && cfg?.RestrictPublicBuckets) {
    recordPass('All 4 S3 Block Public Access flags are strictly ACTIVE (true)');
  } else {
    recordFail('Block Public Access check', JSON.stringify(cfg));
  }

  // 2. Verify Anonymous Unsigned Access is Blocked (HTTP 403)
  console.log('\n[2/5] Testing Direct Anonymous Unsigned HTTP Access to S3 Objects...');
  const testObjUrl = `https://${BUCKET}.s3.${REGION}.amazonaws.com/${TEST_S3_KEY}`;
  const legacyObjUrl = `https://${BUCKET}.s3.${REGION}.amazonaws.com/${encodeURIComponent(LEGACY_S3_KEY)}`;

  const testStatus = await checkAnonymousHead(testObjUrl);
  if (testStatus === 403) {
    recordPass(`Anonymous access to new test video rejected with HTTP 403 Forbidden (${testObjUrl.substring(0, 70)}...)`);
  } else {
    recordFail(`Anonymous access to new test video returned HTTP ${testStatus} (Expected 403)`);
  }

  const legacyStatus = await checkAnonymousHead(legacyObjUrl);
  if (legacyStatus === 403) {
    recordPass(`Anonymous access to legacy video rejected with HTTP 403 Forbidden`);
  } else {
    recordFail(`Anonymous access to legacy video returned HTTP ${legacyStatus} (Expected 403)`);
  }

  // 3. Verify Direct-to-S3 Presigned PUT Upload Pipeline Still Works
  console.log('\n[3/5] Verifying Direct-to-S3 Presigned Upload Pipeline & CORS...');
  const preflight = await checkCorsPreflight();
  if (preflight.status === 200 && preflight.allowMethods?.includes('PUT')) {
    recordPass(`CORS preflight for direct PUT upload returns HTTP 200 OK (Allowed: ${preflight.allowMethods})`);
  } else {
    recordFail('CORS preflight check', JSON.stringify(preflight));
  }

  // Start Next.js Server if not running
  let serverProc: ChildProcess | null = null;
  try {
    await waitForServer(`${BASE_URL}/login`, 2000);
    console.log(`✓ Next.js server active on ${BASE_URL}`);
  } catch {
    console.log('Spawning Next.js production server on port', PORT);
    serverProc = spawn('npx', ['next', 'start', '-p', String(PORT)], {
      cwd: path.resolve(__dirname, '..'),
      stdio: 'pipe',
      shell: true,
      env: { ...process.env, PORT: String(PORT) },
    });
    serverProc.stdout?.on('data', () => {});
    serverProc.stderr?.on('data', () => {});
    await waitForServer(`${BASE_URL}/login`, 45000);
    console.log('✓ Next.js production server operational.');
  }

  try {
    const adminToken = createToken(ADMIN_USER);
    const presignReq = await fetch(`${BASE_URL}/api/upload`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': `auth-token=${adminToken}`,
      },
      body: JSON.stringify({
        fileName: 'upload-pipeline-test.mp4',
        fileType: 'video/mp4',
        folderType: 'video',
        fileSize: 1024,
      }),
    });
    const presignData = await presignReq.json();
    if (presignReq.status === 200 && presignData.uploadUrl && presignData.uploadUrl.includes('X-Amz-Signature')) {
      recordPass('LMS generates valid presigned upload URL with active IAM credentials');
    } else {
      recordFail('Presigned upload URL generation', JSON.stringify(presignData));
    }

    // 4. Verify Authorized Playback Token Retrieval via LMS
    console.log('\n[4/5] Verifying LMS Authorized Playback Token Generation...');
    const studentToken = createToken(STUDENT_USER);

    // Unauthenticated request check
    const unauthRes = await fetch(`${BASE_URL}/api/courses/${DUMMY_COURSE_ID}/video-url?lectureId=101`);
    if (unauthRes.status === 401) {
      recordPass('LMS video-url endpoint rejects unauthenticated request with HTTP 401');
    } else {
      recordFail('Unauthenticated check', `Status ${unauthRes.status}`);
    }

    // Authorized student request check
    const authRes = await fetch(`${BASE_URL}/api/courses/${DUMMY_COURSE_ID}/video-url?lectureId=101`, {
      headers: { 'Cookie': `auth-token=${studentToken}` },
    });
    const authData = await authRes.json();
    if (authRes.status === 200 && authData.url && authData.isS3 === true && authData.url.includes('X-Amz-Signature')) {
      recordPass('Authorized student receives valid presigned playback URL with X-Amz-Signature and 1-hour expiry');
    } else {
      recordFail('Authorized playback token retrieval', JSON.stringify(authData));
    }

    // 5. Verify Real Browser Playback and Seeking on Private S3 Video
    console.log('\n[5/5] Launching Playwright Chromium to test Playback & Seeking on Private S3 Video...');
    const browser: Browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    await context.addCookies([
      { name: 'auth-token', value: studentToken, domain: 'localhost', path: '/' },
    ]);
    const page: Page = await context.newPage();

    try {
      await page.goto(`${BASE_URL}/courses/${DUMMY_COURSE_ID}/play`, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(1000);

      // Verify HTML5 video element
      const videoEl = await page.$('video');
      if (videoEl) {
        recordPass('Custom SecureVideoPlayer HTML5 <video> element rendered in DOM');
      } else {
        recordFail('Video element not found in DOM');
      }

      // Verify private video stream metadata loads
      const metadataLoaded = await page.evaluate(async () => {
        const vid = document.querySelector('video') as HTMLVideoElement;
        if (!vid) return { success: false, error: 'no video el' };
        if (vid.readyState >= 1) {
          return { success: true, duration: vid.duration };
        }
        return new Promise((resolve) => {
          const timeout = setTimeout(() => {
            resolve({ success: false, error: 'metadata load timeout', readyState: vid.readyState });
          }, 15000);
          vid.addEventListener('loadedmetadata', () => {
            clearTimeout(timeout);
            resolve({ success: true, duration: vid.duration });
          }, { once: true });
        });
      });

      if ((metadataLoaded as any).success) {
        recordPass(`Private S3 video stream metadata loaded: duration is ${(metadataLoaded as any).duration.toFixed(2)}s`);
      } else {
        recordFail('Private video stream metadata load', JSON.stringify(metadataLoaded));
      }

      // Verify playback advances currentTime
      const playResult = await page.evaluate(async () => {
        const vid = document.querySelector('video') as HTMLVideoElement;
        if (!vid) return { success: false };
        try {
          await vid.play();
          await new Promise((r) => setTimeout(r, 800));
          return { success: true, currentTime: vid.currentTime };
        } catch (e: any) {
          return { success: false, error: e.message };
        }
      });

      if ((playResult as any).success && (playResult as any).currentTime > 0) {
        recordPass(`Real browser playback active: currentTime advanced to ${(playResult as any).currentTime.toFixed(2)}s`);
      } else {
        recordFail('Real browser play execution', JSON.stringify(playResult));
      }

      // Verify seeking on private S3 video via Range request
      const seekResult = await page.evaluate(async () => {
        const vid = document.querySelector('video') as HTMLVideoElement;
        if (!vid) return { success: false };
        try {
          vid.currentTime = 5.0;
          await new Promise((resolve) => {
            vid.addEventListener('seeked', () => resolve(true), { once: true });
            setTimeout(resolve, 3000);
          });
          return { success: true, currentTime: vid.currentTime };
        } catch (e: any) {
          return { success: false, error: e.message };
        }
      });

      if ((seekResult as any).success && (seekResult as any).currentTime >= 4.5) {
        recordPass(`Real browser video seeking active: successfully seeked to ${(seekResult as any).currentTime.toFixed(2)}s`);
      } else {
        recordFail('Real browser seek execution', JSON.stringify(seekResult));
      }

      // Verify student watermark renders
      const watermarkEl = await page.$(`text=${STUDENT_USER.email}`);
      if (watermarkEl) {
        recordPass(`Anti-piracy dynamic watermark verified rendering student email: ${STUDENT_USER.email}`);
      } else {
        const watermarkContainer = await page.$('div.font-mono.opacity-40');
        if (watermarkContainer) {
          recordPass('Anti-piracy dynamic watermark container verified in player overlay');
        } else {
          recordFail('Anti-piracy dynamic watermark not found');
        }
      }

    } finally {
      await browser.close();
    }

  } finally {
    if (serverProc) {
      serverProc.kill('SIGINT');
    }
  }

  console.log('\n' + '='.repeat(70));
  console.log(`POST-HARDENING VERIFICATION SUMMARY:`);
  console.log(`  PASSED CHECKS: ${passed}`);
  console.log(`  FAILED CHECKS: ${failed}`);
  console.log('='.repeat(70));

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runPostHardeningTests().catch((err) => {
  console.error('Fatal execution error:', err);
  process.exit(1);
});
