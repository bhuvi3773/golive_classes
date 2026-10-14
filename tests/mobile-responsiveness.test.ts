import { chromium, Browser, Page } from '@playwright/test';
import http from 'http';
import jwt from 'jsonwebtoken';
import { spawn, ChildProcess } from 'child_process';
import path from 'path';

const PORT = 3005;
const BASE_URL = `http://localhost:${PORT}`;

const VIEWPORTS = [
  { name: '320px (iPhone SE small)', width: 320, height: 667 },
  { name: '360px (Galaxy S8 / Android)', width: 360, height: 740 },
  { name: '375px (iPhone mini / SE2)', width: 375, height: 667 },
  { name: '390px (iPhone 12/13/14)', width: 390, height: 844 },
  { name: '430px (iPhone 14/15 Pro Max)', width: 430, height: 932 },
  { name: '768px (iPad portrait)', width: 768, height: 1024 },
  { name: '1024px (iPad landscape / laptop)', width: 1024, height: 768 },
  { name: '1280px (Desktop)', width: 1280, height: 800 },
];

import fs from 'fs';

let envSecret = process.env.JWT_SECRET;
if (!envSecret && fs.existsSync(path.resolve(__dirname, '../.env.local'))) {
  const envContent = fs.readFileSync(path.resolve(__dirname, '../.env.local'), 'utf8');
  const m = envContent.match(/JWT_SECRET=([^\r\n]+)/);
  if (m) envSecret = m[1].trim();
}
const JWT_SECRET = envSecret || 'this-is-a-super-secret-key-for-golive';

function createToken(user: { id: string; email: string; role: string; name?: string }) {
  return jwt.sign(
    { userId: user.id, id: user.id, email: user.email, role: user.role, name: user.name || 'Test User' },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

const SUPERADMIN_USER = {
  id: 'ad6394f1-fe2a-4b88-a1d9-fd24251907e9',
  email: 'superadmin@goliveclasses.com',
  role: 'superadmin',
  name: 'Super Admin',
};

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

const DUMMY_COURSE_ID = 'a061614f-eaa9-46a8-9c9e-421a4c49bfc1';

async function waitForServer(url: string, timeoutMs = 60000): Promise<void> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      await new Promise<void>((resolve, reject) => {
        const req = http.get(url, (res) => {
          resolve();
        });
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

async function checkPageOverflow(page: Page): Promise<{ hasOverflow: boolean; scrollWidth: number; innerWidth: number }> {
  return await page.evaluate(() => {
    const docEl = document.documentElement;
    const body = document.body;
    const scrollWidth = Math.max(docEl.scrollWidth, body.scrollWidth);
    const innerWidth = window.innerWidth;
    // Allow up to 1px rounding error
    return {
      hasOverflow: scrollWidth > innerWidth + 1.5,
      scrollWidth,
      innerWidth,
    };
  });
}

async function runTests() {
  console.log('='.repeat(65));
  console.log('   GOLIVECLASSES FULL MOBILE RESPONSIVENESS VERIFICATION SUITE   ');
  console.log('='.repeat(65));

  // 1. Start Next.js production server
  console.log(`\n[1/4] Starting Next.js production server on port ${PORT}...`);
  const serverProc: ChildProcess = spawn(
    'npx',
    ['next', 'start', '-p', String(PORT)],
    {
      cwd: path.resolve(__dirname, '..'),
      stdio: 'pipe',
      shell: true,
      env: { ...process.env, PORT: String(PORT) },
    }
  );

  // Drain stdout and stderr so the OS pipe buffer does not fill up and block Next.js
  serverProc.stdout?.on('data', () => {});
  serverProc.stderr?.on('data', () => {});

  try {
    await waitForServer(`${BASE_URL}/login`);
    console.log(`✓ Next.js server operational on ${BASE_URL}`);

    // 2. Launch Playwright
    console.log('\n[2/4] Initializing Playwright Chromium instance...');
    const browser: Browser = await chromium.launch({ headless: true });

    let passedChecks = 0;
    let failedChecks = 0;
    const failures: string[] = [];

    const recordPass = (name: string) => {
      passedChecks++;
      console.log(`  ✔ [PASS] ${name}`);
    };

    const recordFail = (name: string, reason: string) => {
      failedChecks++;
      failures.push(`${name}: ${reason}`);
      console.log(`  ✖ [FAIL] ${name} -> ${reason}`);
    };

    // Helper to test page in a context across all viewports via resizing
    async function testRoute(
      title: string,
      route: string,
      token: string | null,
      requiredElements?: string[]
    ) {
      console.log(`\n--- Testing Route: ${title} (${route}) ---`);
      const context = await browser.newContext({
        viewport: { width: 1280, height: 800 },
        deviceScaleFactor: 1,
      });

      if (token) {
        await context.addCookies([
          {
            name: 'auth-token',
            value: token,
            domain: 'localhost',
            path: '/',
            httpOnly: true,
          },
        ]);
      }

      const page = await context.newPage();
      const consoleErrors: string[] = [];
      page.on('pageerror', (err) => consoleErrors.push(err.message));

      try {
        const res = await page.goto(`${BASE_URL}${route}`, { waitUntil: 'domcontentloaded', timeout: 35000 });
        const status = res?.status() || 0;

        if (status >= 400 && status !== 404) {
          recordFail(`${title} [Status]`, `HTTP status ${status}`);
          await context.close();
          return;
        }

        await page.waitForTimeout(500);

        for (const vp of VIEWPORTS) {
          await page.setViewportSize({ width: vp.width, height: vp.height });
          await page.waitForTimeout(150);

          const overflow = await checkPageOverflow(page);
          if (overflow.hasOverflow) {
            recordFail(
              `${title} @ ${vp.name} [Overflow]`,
              `Scroll width ${overflow.scrollWidth}px > Viewport ${overflow.innerWidth}px`
            );
          } else {
            recordPass(`${title} @ ${vp.name} [No Overflow] (${overflow.scrollWidth}px <= ${overflow.innerWidth}px)`);
          }

          if (requiredElements) {
            for (const sel of requiredElements) {
              const el = await page.$(sel);
              if (!el) {
                recordFail(`${title} @ ${vp.name} [Element: ${sel}]`, 'Element not found in DOM');
              }
            }
          }
        }

        if (consoleErrors.length > 0) {
          recordFail(`${title} [Console Errors]`, consoleErrors.join('; '));
        }
      } catch (err: any) {
        recordFail(`${title} [Exception]`, err.message);
      } finally {
        await context.close();
      }
    }

    // 3. Run Viewport Tests Across All Routes
    console.log('\n[3/4] Executing Viewport Tests across Public, Student, Faculty, & Superadmin pages...');

    // Public pages
    await testRoute('Public Landing Page', '/', null);
    await testRoute('Authentication Login', '/login', null, ['input[type="email"]', 'input[type="password"]']);
    await testRoute('Authentication Register', '/register', null, ['input[type="email"]']);
    await testRoute('Forgot Password', '/forgot-password', null, ['input[type="email"]']);
    await testRoute('Terms & Conditions', '/terms', null);
    await testRoute('Privacy Policy', '/privacy', null);

    // Student & Catalog Pages (Student Token)
    const studentToken = createToken(STUDENT_USER);
    await testRoute('Catalog / Courses', '/courses', studentToken);
    await testRoute('Live Classes', '/live-classes', studentToken);
    await testRoute('My Learning Dashboard', '/my-learning', studentToken);
    await testRoute('Curated Recommendations', '/recommendations', studentToken);
    await testRoute('Academic Wishlist', '/wishlist', studentToken);
    await testRoute('Scholar Certificates List', '/certificates', studentToken);
    await testRoute('Scholar Profile', '/profile', studentToken);
    await testRoute('Course Detail Page', `/courses/${DUMMY_COURSE_ID}`, studentToken);
    await testRoute('Course Video Player', `/courses/${DUMMY_COURSE_ID}/play`, studentToken);

    // Faculty / Admin Pages (Admin Token)
    const adminToken = createToken(ADMIN_USER);
    await testRoute('Faculty Admin Dashboard', '/admin', adminToken);
    await testRoute('Faculty Curricula Catalog', '/admin/courses', adminToken);
    await testRoute('Faculty Author New Course', '/admin/courses/new', adminToken);
    await testRoute('Faculty Curriculum Editor', `/admin/courses/${DUMMY_COURSE_ID}/manage`, adminToken);
    await testRoute('Faculty Cohort Launches', '/admin/launches', adminToken);
    await testRoute('Faculty Disciplines', '/admin/categories', adminToken);

    // Superadmin Pages (Superadmin Token)
    const superadminToken = createToken(SUPERADMIN_USER);
    await testRoute('Superadmin Audits HQ', '/superadmin', superadminToken);
    await testRoute('Superadmin Scholar Roster', '/superadmin/users', superadminToken);
    await testRoute('Superadmin Platform Config', '/superadmin/settings', superadminToken);

    // 4. Interactive Mobile Navigation & Drawer Tests
    console.log('\n[4/4] Verifying Interactive Mobile Navigation & Drawers (320px & 375px)...');

    for (const testWidth of [320, 375]) {
      const navContext = await browser.newContext({
        viewport: { width: testWidth, height: 667 },
      });
      await navContext.addCookies([
        { name: 'auth-token', value: studentToken, domain: 'localhost', path: '/' },
      ]);
      const navPage = await navContext.newPage();

      try {
        await navPage.goto(`${BASE_URL}/my-learning`, { waitUntil: 'domcontentloaded' });

        // Check mobile bottom navigation bar exists
        const bottomNav = await navPage.$('nav.fixed.bottom-0');
        if (bottomNav) {
          recordPass(`Mobile Bottom Nav @ ${testWidth}px renders fixed at bottom`);
        } else {
          recordFail(`Mobile Bottom Nav @ ${testWidth}px`, 'Bottom navigation not found');
        }

        // Open drawer via "More" button
        const moreBtn = await navPage.$('button:has-text("More")');
        if (moreBtn) {
          await moreBtn.click();
          await navPage.waitForTimeout(300);

          // Check drawer overlay is visible
          const drawer = await navPage.$('div[aria-label="Navigation and academic tools"]');
          const isDrawerVisible = await drawer?.isVisible();
          if (isDrawerVisible) {
            recordPass(`Mobile Navigation Drawer @ ${testWidth}px opens on tap`);

            // Verify drawer contains learning and authorized shortcuts
            const drawerText = await drawer?.innerText();
            const hasWishlist = drawerText?.includes('Wishlist');
            const hasForYou = drawerText?.includes('For You');
            const hasCertificates = drawerText?.includes('Certificates');
            const hasAnalytics = drawerText?.includes('Analytics');

            if (hasWishlist && hasForYou && hasCertificates && hasAnalytics) {
              recordPass(`Mobile Drawer @ ${testWidth}px exposes Wishlist, For You, Certificates, & Analytics`);
            } else {
              recordFail(`Mobile Drawer Content @ ${testWidth}px`, `Missing expected drawer navigation items. Found: ${drawerText}`);
            }

            // Test Escape key closes drawer
            await navPage.keyboard.press('Escape');
            await navPage.waitForTimeout(300);
            const closedAfterEscape = !(await drawer?.isVisible().catch(() => false));
            if (closedAfterEscape) {
              recordPass(`Mobile Drawer @ ${testWidth}px closes via Escape key`);
            } else {
              recordFail(`Mobile Drawer Escape @ ${testWidth}px`, 'Drawer did not close on Escape key');
            }
          } else {
            recordFail(`Mobile Navigation Drawer @ ${testWidth}px`, 'Drawer did not become visible');
          }
        }
      } catch (err: any) {
        recordFail(`Mobile Nav Interaction @ ${testWidth}px`, err.message);
      } finally {
        await navContext.close();
      }
    }

    // Interactive Superadmin Mobile Header & Tabs below 768px
    for (const testWidth of [360, 430]) {
      const saContext = await browser.newContext({
        viewport: { width: testWidth, height: 800 },
      });
      await saContext.addCookies([
        { name: 'auth-token', value: superadminToken, domain: 'localhost', path: '/' },
      ]);
      const saPage = await saContext.newPage();

      try {
        await saPage.goto(`${BASE_URL}/superadmin`, { waitUntil: 'domcontentloaded' });
        await saPage.waitForTimeout(400);

        // Verify mobile header & tabs are visible
        const mobileTabs = await saPage.$('div.md\\:hidden nav');
        if (mobileTabs) {
          const tabText = (await mobileTabs.innerText()).toLowerCase();
          const hasAudits = tabText.includes('audits');
          const hasScholars = tabText.includes('scholars');
          const hasSettings = tabText.includes('settings');

          if (hasAudits && hasScholars && hasSettings) {
            recordPass(`Superadmin Mobile Header & Tabs @ ${testWidth}px renders Audits, Scholars, & Settings`);
          } else {
            recordFail(`Superadmin Mobile Tabs @ ${testWidth}px`, `Missing tabs: ${tabText}`);
          }
        } else {
          recordFail(`Superadmin Mobile Tabs @ ${testWidth}px`, 'Mobile tab bar not found in SuperAdmin layout');
        }
      } catch (err: any) {
        recordFail(`Superadmin Mobile View @ ${testWidth}px`, err.message);
      } finally {
        await saContext.close();
      }
    }

    await browser.close();

    console.log('\n' + '='.repeat(65));
    console.log(`MOBILE RESPONSIVENESS TEST SUMMARY:`);
    console.log(`  TOTAL CHECKS: ${passedChecks + failedChecks}`);
    console.log(`  PASSED:       ${passedChecks}`);
    console.log(`  FAILED:       ${failedChecks}`);
    console.log('='.repeat(65));

    if (failures.length > 0) {
      console.log('\nFAILURES DETAILS:');
      failures.forEach((f) => console.log('  - ' + f));
      process.exit(1);
    } else {
      console.log('\nALL VIEWPORTS & INTERACTIVE CHECKS PASSED WITH ZERO OVERFLOW!');
      process.exit(0);
    }
  } finally {
    console.log('\nStopping Next.js test server process...');
    serverProc.kill('SIGINT');
  }
}

runTests().catch((err) => {
  console.error('Fatal Test Runner Error:', err);
  process.exit(1);
});
