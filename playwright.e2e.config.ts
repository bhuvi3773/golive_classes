import { defineConfig } from '@playwright/test';
import path from 'path';
import fs from 'fs';

const envTestPath = path.resolve(__dirname, '.env.test');
const envLocalPath = path.resolve(__dirname, '.env.local');
const envPath = path.resolve(__dirname, '.env');

if (!fs.existsSync(envTestPath)) {
  throw new Error('.env.test file is missing. Aborting safe test isolation.');
}

const content = fs.readFileSync(envTestPath, 'utf8');
const match = content.match(/DATABASE_URL="?([^"\n]+)"?/);
const testDbUrl = match ? match[1] : null;

if (!testDbUrl) {
  throw new Error('DATABASE_URL is missing or empty in .env.test. Aborting.');
}

if (testDbUrl.includes('golive_test_db') && testDbUrl.includes('user:password')) {
  throw new Error('DATABASE_URL in .env.test is using the placeholder. Please configure a real test database. Aborting.');
}

// Compare against dev/prod databases to ensure isolation
const knownProdUrls = new Set<string>();
for (const p of [envLocalPath, envPath]) {
  if (fs.existsSync(p)) {
    const pContent = fs.readFileSync(p, 'utf8');
    const pMatch = pContent.match(/DATABASE_URL="?([^"\n]+)"?/);
    if (pMatch && pMatch[1]) {
      knownProdUrls.add(pMatch[1]);
    }
  }
}

if (knownProdUrls.has(testDbUrl)) {
  throw new Error('DATABASE_URL in .env.test matches a known development/production database. Aborting to prevent data loss.');
}

export default defineConfig({
  testDir: './tests',
  testMatch: /.*\.spec\.ts/, 
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1, // Single worker to avoid DB state collisions during mutation tests
  reporter: 'html',
  globalSetup: require.resolve('./tests/global-setup.ts'),
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'e2e-isolated',
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: false,
    timeout: 120 * 1000,
    env: {
      // Explicitly pass only the parsed URL from .env.test.
      // This prevents Next.js from silently falling back to .env or .env.local.
      DATABASE_URL: testDbUrl,
    }
  },
});
