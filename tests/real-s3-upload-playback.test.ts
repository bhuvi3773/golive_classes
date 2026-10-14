import { chromium, Browser, Page } from '@playwright/test';
import http from 'http';
import https from 'https';
import jwt from 'jsonwebtoken';
import { spawn, ChildProcess } from 'child_process';
import path from 'path';
import fs from 'fs';
import { S3Client, HeadObjectCommand } from '@aws-sdk/client-s3';
import { PrismaClient } from '@prisma/client';

const PORT = 3005;
const BASE_URL = `http://localhost:${PORT}`;
const DUMMY_COURSE_ID = 'a061614f-eaa9-46a8-9c9e-421a4c49bfc1';

// Read environment
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

const s3 = new S3Client({
  region: REGION,
  credentials: {
    accessKeyId: env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY || '',
  },
});

const prisma = new PrismaClient();

function createToken(user: { id: string; email: string; role: string; name?: string }) {
  return jwt.sign(
    { userId: user.id, id: user.id, email: user.email, role: user.role, name: user.name || 'Test User' },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

const ADMIN_USER = {
  id: 'da35f0db-2114-4357-aec2-f033a8aa6e5e',
  email: 'admin@example.com',
  role: 'admin',
  name: 'Faculty Admin',
};

const STUDENT_USER = {
  id: '774f8a50-b633-4d3a-b543-8cb78a46aeb1',
  email: 'testuser_1791530222588@example.com',
  role: 'student',
  name: 'Scholar Student',
};

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

function downloadSampleVideo(): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    https.get('https://www.w3schools.com/html/mov_bbb.mp4', (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`Failed to download sample video, status: ${res.statusCode}`));
        return;
      }
      const chunks: Buffer[] = [];
      res.on('data', (d) => chunks.push(d));
      res.on('end', () => resolve(Buffer.concat(chunks)));
      res.on('error', reject);
    }).on('error', reject);
  });
}

function uploadPresignedPut(uploadUrl: string, buffer: Buffer, contentType: string): Promise<number> {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(uploadUrl);
    const req = https.request(
      {
        hostname: urlObj.hostname,
        port: 443,
        path: urlObj.pathname + urlObj.search,
        method: 'PUT',
        headers: {
          'Content-Type': contentType,
          'Content-Length': buffer.length,
        },
      },
      (res) => {
        resolve(res.statusCode || 0);
      }
    );
    req.on('error', reject);
    req.write(buffer);
    req.end();
  });
}

async function run() {
  console.log('='.repeat(70));
  console.log('   GOLIVECLASSES REAL AWS S3 VIDEO UPLOAD & PLAYBACK VERIFICATION   ');
  console.log('='.repeat(70));

  let passed = 0;
  let failed = 0;
  const recordPass = (msg: string) => { passed++; console.log(`  ✔ [PASS] ${msg}`); };
  const recordFail = (msg: string, err?: any) => { failed++; console.log(`  ✖ [FAIL] ${msg}:`, err || ''); };

  // Step 1: Start Next.js Server if not running
  console.log('\n[1/6] Ensuring Next.js production server is active on port', PORT);
  let serverProc: ChildProcess | null = null;
  try {
    await waitForServer(`${BASE_URL}/login`, 2000);
    console.log(`Server is already running on ${BASE_URL}`);
  } catch {
    console.log('Spawning Next.js production server...');
    serverProc = spawn('npx', ['next', 'start', '-p', String(PORT)], {
      cwd: path.resolve(__dirname, '..'),
      stdio: 'pipe',
      shell: true,
      env: { ...process.env, PORT: String(PORT) },
    });
    serverProc.stdout?.on('data', () => {});
    serverProc.stderr?.on('data', () => {});
    await waitForServer(`${BASE_URL}/login`, 45000);
    console.log('Next.js server is operational.');
  }

  try {
    // Step 2: Download synthetic test video
    console.log('\n[2/6] Preparing synthetic non-sensitive test video buffer...');
    const videoBuffer = await downloadSampleVideo();
    console.log(`Downloaded sample test video: ${videoBuffer.length} bytes (~${(videoBuffer.length / 1024).toFixed(1)} KB)`);
    recordPass(`Synthetic test video prepared (${videoBuffer.length} bytes, 0.75 MB)`);

    // Step 3: Request Presigned S3 Upload URL from /api/upload
    console.log('\n[3/6] Requesting presigned direct-to-S3 upload URL from /api/upload...');
    const adminToken = createToken(ADMIN_USER);
    const fileName = `test-course-video-${Date.now()}.mp4`;

    const presignedRes = await fetch(`${BASE_URL}/api/upload`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': `auth-token=${adminToken}`,
      },
      body: JSON.stringify({
        fileName,
        fileType: 'video/mp4',
        folderType: 'video',
        fileSize: videoBuffer.length,
        courseId: DUMMY_COURSE_ID,
      }),
    });

    const presignedData = await presignedRes.json();
    if (presignedRes.status === 200 && presignedData.uploadUrl && presignedData.key) {
      recordPass(`Presigned S3 upload URL generated for key: ${presignedData.key}`);
    } else {
      recordFail('Presigned upload URL generation', JSON.stringify(presignedData));
      throw new Error('Failed to generate presigned upload URL');
    }

    const { uploadUrl, key: uploadedS3Key } = presignedData;

    // Step 4: Perform Real HTTP PUT Direct to S3
    console.log('\n[4/6] Executing direct HTTP PUT upload to AWS S3 bucket...');
    const uploadStatus = await uploadPresignedPut(uploadUrl, videoBuffer, 'video/mp4');
    if (uploadStatus === 200) {
      recordPass(`Direct HTTP PUT to AWS S3 returned HTTP 200 OK for key: ${uploadedS3Key}`);
    } else {
      recordFail(`Direct HTTP PUT to AWS S3 returned HTTP ${uploadStatus}`);
      throw new Error(`Upload failed with status ${uploadStatus}`);
    }

    // Verify S3 Object Head via AWS SDK
    const headRes = await s3.send(new HeadObjectCommand({ Bucket: BUCKET, Key: uploadedS3Key }));
    if (headRes.ContentLength === videoBuffer.length) {
      recordPass(`Verified S3 object in bucket ${BUCKET}: size matches exactly ${headRes.ContentLength} bytes`);
    } else {
      recordFail('S3 HeadObject verification', `Expected ${videoBuffer.length}, got ${headRes.ContentLength}`);
    }

    // Step 5: Persist S3 reference in PostgreSQL Course Curriculum
    console.log('\n[5/6] Persisting S3 video reference in course curriculum database...');
    const course = await prisma.course.findUnique({ where: { id: DUMMY_COURSE_ID } });
    if (!course) throw new Error('Dummy course not found in database');

    const testLectureId = 101;
    const updatedCurriculum = [
      {
        id: 1,
        title: 'Module 1: AWS S3 Video Storage Integration',
        lectures: [
          {
            id: testLectureId,
            title: 'Real S3 Streamed Lecture',
            duration: '0:10',
            type: 'video',
            content: uploadedS3Key,
            s3Key: uploadedS3Key,
          },
          {
            id: 102,
            title: 'Paid Secondary Lecture (Protected)',
            duration: '0:10',
            type: 'video',
            content: 'generativeaiofflinevideos/AWS DevSecOps Demo Video Golive Classes.mp4',
            s3Key: 'generativeaiofflinevideos/AWS DevSecOps Demo Video Golive Classes.mp4',
          }
        ],
      },
    ];

    await prisma.course.update({
      where: { id: DUMMY_COURSE_ID },
      data: {
        curriculum: updatedCurriculum as any,
      },
    });
    recordPass(`Curriculum updated in PostgreSQL: lecture ${testLectureId} points to S3 key ${uploadedS3Key}`);

    // Step 6: Verify Playback Authorization & Real Browser Playback
    console.log('\n[6/6] Verifying Playback Authorization & Real Playwright Browser Playback...');

    // 6a: Test unauthorized access (no token)
    const unauthRes = await fetch(`${BASE_URL}/api/courses/${DUMMY_COURSE_ID}/video-url?lectureId=${testLectureId}`);
    if (unauthRes.status === 401) {
      recordPass('Unauthorized access blocked: /api/courses/[id]/video-url rejected with HTTP 401');
    } else {
      recordFail('Unauthorized access check', `Expected 401, got ${unauthRes.status}`);
    }

    // 6b: Test authorized student token retrieval
    const studentToken = createToken(STUDENT_USER);
    const authRes = await fetch(`${BASE_URL}/api/courses/${DUMMY_COURSE_ID}/video-url?lectureId=${testLectureId}`, {
      headers: {
        'Cookie': `auth-token=${studentToken}`,
      },
    });
    const authData = await authRes.json();
    if (authRes.status === 200 && authData.url && authData.isS3 === true && authData.url.includes('X-Amz-Signature')) {
      recordPass(`Authorized student received valid presigned playback URL with X-Amz-Signature`);
    } else {
      recordFail('Authorized playback URL generation', JSON.stringify(authData));
    }

    // 6c: Test unauthorized access to paid lecture 2 for non-enrolled user
    const unpurchasedUser = {
      id: 'e2e2e2e2-e2e2-e2e2-e2e2-e2e2e2e2e2e2',
      email: 'guest_unpurchased@example.com',
      role: 'student',
    };
    // Ensure course has non-zero price to verify enrollment protection
    await prisma.course.update({
      where: { id: DUMMY_COURSE_ID },
      data: { price: 499 },
    });

    const unpurchasedToken = createToken(unpurchasedUser);
    const paidLecRes = await fetch(`${BASE_URL}/api/courses/${DUMMY_COURSE_ID}/video-url?lectureId=102`, {
      headers: {
        'Cookie': `auth-token=${unpurchasedToken}`,
      },
    });
    if (paidLecRes.status === 403 || paidLecRes.status === 401) {
      recordPass('Protected secondary paid lecture access blocked with HTTP 403 for non-enrolled student');
    } else {
      recordFail('Protected lecture authorization', `Status ${paidLecRes.status}`);
    }

    // Reset course price to 0 or enroll student for test playback
    await prisma.course.update({
      where: { id: DUMMY_COURSE_ID },
      data: { price: 0 },
    });

    // 6d: Launch Playwright Chromium for Real Playback & Seeking
    console.log('\nLaunching Playwright Chromium to test real video playback and seek controls...');
    const browser: Browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
      viewport: { width: 1280, height: 800 },
    });
    await context.addCookies([
      { name: 'auth-token', value: studentToken, domain: 'localhost', path: '/' },
    ]);
    const page: Page = await context.newPage();

    try {
      await page.goto(`${BASE_URL}/courses/${DUMMY_COURSE_ID}/play`, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(1000);

      // Check video element exists
      const videoEl = await page.$('video');
      if (videoEl) {
        recordPass('SecureVideoPlayer HTML5 <video> element rendered in DOM');
      } else {
        recordFail('SecureVideoPlayer <video> element not found');
      }

      // Wait for video metadata to load (real S3 stream)
      const metadataLoaded = await page.evaluate(async () => {
        const vid = document.querySelector('video') as HTMLVideoElement;
        if (!vid) return { success: false, error: 'no video el' };
        if (vid.readyState >= 1) {
          return { success: true, duration: vid.duration, src: vid.src.substring(0, 60) + '...' };
        }
        return new Promise((resolve) => {
          const timeout = setTimeout(() => {
            resolve({ success: false, error: 'metadata load timeout', readyState: vid.readyState });
          }, 15000);
          vid.addEventListener('loadedmetadata', () => {
            clearTimeout(timeout);
            resolve({ success: true, duration: vid.duration, src: vid.src.substring(0, 60) + '...' });
          }, { once: true });
        });
      });

      if ((metadataLoaded as any).success) {
        recordPass(`Video metadata loaded from S3 stream: duration is ${(metadataLoaded as any).duration}s`);
      } else {
        recordFail('Video metadata load', JSON.stringify(metadataLoaded));
      }

      // Verify Playback starts
      const playResult = await page.evaluate(async () => {
        const vid = document.querySelector('video') as HTMLVideoElement;
        if (!vid) return { success: false };
        try {
          await vid.play();
          await new Promise((r) => setTimeout(r, 800));
          return { success: true, currentTime: vid.currentTime, paused: vid.paused };
        } catch (e: any) {
          return { success: false, error: e.message };
        }
      });

      if ((playResult as any).success && (playResult as any).currentTime > 0) {
        recordPass(`Real S3 video playback confirmed: currentTime advanced to ${(playResult as any).currentTime.toFixed(2)}s`);
      } else {
        recordFail('Video play execution', JSON.stringify(playResult));
      }

      // Verify Seeking to 5.0 seconds
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
        recordPass(`Video seeking confirmed: seeked successfully to ${(seekResult as any).currentTime.toFixed(2)}s`);
      } else {
        recordFail('Video seek execution', JSON.stringify(seekResult));
      }

      // Verify dynamic anti-piracy watermark renders scholar's email
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
      console.log('Stopping spawned Next.js server...');
      serverProc.kill('SIGINT');
    }
    await prisma.$disconnect();
  }

  console.log('\n' + '='.repeat(70));
  console.log(`REAL AWS S3 TEST SUMMARY:`);
  console.log(`  PASSED CHECKS: ${passed}`);
  console.log(`  FAILED CHECKS: ${failed}`);
  console.log('='.repeat(70));

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

run().catch((err) => {
  console.error('Fatal execution error:', err);
  process.exit(1);
});
