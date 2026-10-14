import http from 'http';
import path from 'path';
import fs from 'fs';
import { spawn, ChildProcess } from 'child_process';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const PORT = 3005;
const BASE_URL = `http://localhost:${PORT}`;

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

// Set process env
Object.assign(process.env, env);

import { 
  verifyEmailTransport, 
  sendVerificationEmail, 
  sendPasswordResetEmail, 
  sendEnrollmentEmail,
  sendCourseRecommendationEmail 
} from '../src/lib/email';

const prisma = new PrismaClient();

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

async function runEmailTests() {
  console.log('='.repeat(70));
  console.log('       GOLIVECLASSES REAL GMAIL EMAIL INTEGRATION TEST SUITE       ');
  console.log('='.repeat(70));

  let passed = 0;
  let failed = 0;
  const recordPass = (msg: string) => { passed++; console.log(`  ✔ [PASS] ${msg}`); };
  const recordFail = (msg: string, err?: any) => { failed++; console.log(`  ✖ [FAIL] ${msg}:`, err || ''); };

  const testEmail = process.env.SMTP_USER;
  if (!testEmail) {
    recordFail('Pre-check: SMTP_USER is not configured in .env.local');
    process.exit(1);
  }

  // Section 1: Direct SMTP Transport Verification
  console.log('\n[1/5] Verifying Gmail SMTP Connection & Authentication...');
  const verifyResult = await verifyEmailTransport();
  if (verifyResult.success) {
    recordPass(`Gmail SMTP verification: ${verifyResult.message}`);
  } else {
    recordFail('Gmail SMTP verification', verifyResult.message);
  }

  // Section 2: Direct Email Function Executions (Sent to user's configured address)
  console.log('\n[2/5] Testing Direct Email Template Dispatch via Gmail SMTP...');
  
  // 2a: Verification Email
  const verifSent = await sendVerificationEmail(testEmail, '938472');
  if (verifSent) {
    recordPass('sendVerificationEmail dispatched successfully via Gmail SMTP');
  } else {
    recordFail('sendVerificationEmail dispatch');
  }

  // 2b: Password Reset Email
  const resetSent = await sendPasswordResetEmail(testEmail, 'sample-reset-token-e2e-test');
  if (resetSent) {
    recordPass('sendPasswordResetEmail dispatched successfully via Gmail SMTP');
  } else {
    recordFail('sendPasswordResetEmail dispatch');
  }

  // 2c: Enrollment Email
  const enrollSent = await sendEnrollmentEmail(testEmail, 'Scholar', 'DevOps & Cloud Architecture', 'a061614f-eaa9-46a8-9c9e-421a4c49bfc1');
  if (enrollSent) {
    recordPass('sendEnrollmentEmail dispatched successfully via Gmail SMTP');
  } else {
    recordFail('sendEnrollmentEmail dispatch');
  }

  // 2d: Recommendations Email
  const recsSent = await sendCourseRecommendationEmail(testEmail, 'Scholar', 'DevOps & Cloud Architecture', [
    { id: 'course-1', title: 'Kubernetes Mastery', category: 'DevOps' },
  ]);
  if (recsSent) {
    recordPass('sendCourseRecommendationEmail dispatched successfully via Gmail SMTP');
  } else {
    recordFail('sendCourseRecommendationEmail dispatch');
  }

  // Section 3: Next.js Server Spin-up for API Integration Tests
  console.log('\n[3/5] Starting Next.js Production Server for API Integration...');
  let serverProc: ChildProcess | null = null;
  try {
    await waitForServer(`${BASE_URL}/login`, 2000);
    console.log(`Server already active on ${BASE_URL}`);
  } catch {
    console.log(`Spawning Next.js server on port ${PORT}...`);
    serverProc = spawn('npx', ['next', 'start', '-p', String(PORT)], {
      cwd: path.resolve(__dirname, '..'),
      stdio: 'pipe',
      shell: true,
      env: { ...process.env, PORT: String(PORT) },
    });
    serverProc.stdout?.on('data', () => {});
    serverProc.stderr?.on('data', () => {});
    await waitForServer(`${BASE_URL}/login`, 45000);
    console.log(`✓ Next.js server operational on ${BASE_URL}`);
  }

  // Temporary test user email with timestamp to avoid collision
  const timestamp = Date.now();
  const testScholarEmail = `test_scholar_${timestamp}@gmail.com`;
  const initialPassword = 'InitialSecurePass123!';
  const updatedPassword = 'NewUpdatedPass456!';

  try {
    // Section 4: End-to-End Registration & Verification Flow via API
    console.log('\n[4/5] Testing E2E Registration & Verification API Flow with Real Email Dispatch...');
    
    // 4a: Register
    const regRes = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'x-forwarded-for': '127.0.0.10',
      },
      body: JSON.stringify({
        name: 'Automated Test Scholar',
        email: testScholarEmail,
        password: initialPassword,
        role: 'student',
      }),
    });
    const regData = await regRes.json();
    if (regRes.status === 201 && regData.email === testScholarEmail) {
      recordPass(`POST /api/auth/register succeeded (HTTP 201). Verification email dispatched.`);
    } else {
      recordFail('POST /api/auth/register', JSON.stringify(regData));
    }

    // Check user in database
    const createdUser = await prisma.user.findUnique({
      where: { email: testScholarEmail },
    });
    if (createdUser && createdUser.verificationCode && !createdUser.isVerified) {
      recordPass(`User persisted in DB with hashed verificationCode (isVerified: false)`);
    } else {
      recordFail('User DB persistence verification');
    }

    // 4b: Test verification attempt with wrong code
    const wrongVerifyRes = await fetch(`${BASE_URL}/api/auth/verify`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'x-forwarded-for': '127.0.0.11',
      },
      body: JSON.stringify({
        email: testScholarEmail,
        code: '000000',
      }),
    });
    if (wrongVerifyRes.status === 400) {
      recordPass('POST /api/auth/verify correctly rejects invalid code with HTTP 400');
    } else {
      recordFail('Invalid code rejection', `Expected 400, got ${wrongVerifyRes.status}`);
    }

    // 4b-2: Test verification attempt with expired code
    await prisma.user.update({
      where: { email: testScholarEmail },
      data: {
        verificationCode: crypto.createHash('sha256').update('888888').digest('hex'),
        verificationCodeExpiresAt: new Date(Date.now() - 1000 * 60 * 60), // Expired 1 hour ago
      },
    });
    const expiredVerifyRes = await fetch(`${BASE_URL}/api/auth/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-forwarded-for': '127.0.0.16',
      },
      body: JSON.stringify({
        email: testScholarEmail,
        code: '888888',
      }),
    });
    const expiredVerifyData = await expiredVerifyRes.json();
    if (expiredVerifyRes.status === 400 && expiredVerifyData.error?.includes('expired')) {
      recordPass('POST /api/auth/verify correctly rejects expired OTP with HTTP 400 ("expired")');
    } else {
      recordFail('Expired OTP rejection', `Expected 400 expired, got ${expiredVerifyRes.status}: ${JSON.stringify(expiredVerifyData)}`);
    }

    // 4c: Complete verification by setting matching OTP
    const validOtp = '719342';
    const hashedValidOtp = crypto.createHash('sha256').update(validOtp).digest('hex');
    await prisma.user.update({
      where: { email: testScholarEmail },
      data: {
        verificationCode: hashedValidOtp,
        verificationCodeExpiresAt: new Date(Date.now() + 15 * 60 * 1000),
      },
    });

    const verifyRes = await fetch(`${BASE_URL}/api/auth/verify`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'x-forwarded-for': '127.0.0.12',
      },
      body: JSON.stringify({
        email: testScholarEmail,
        code: validOtp,
      }),
    });
    const verifyData = await verifyRes.json();
    if (verifyRes.status === 200 && verifyData.message.includes('verified')) {
      recordPass('POST /api/auth/verify successfully verified account with HTTP 200');
    } else {
      recordFail('POST /api/auth/verify', JSON.stringify(verifyData));
    }

    // 4d: Verify re-attempt when already verified is rejected
    const reVerifyRes = await fetch(`${BASE_URL}/api/auth/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-forwarded-for': '127.0.0.17',
      },
      body: JSON.stringify({
        email: testScholarEmail,
        code: validOtp,
      }),
    });
    const reVerifyData = await reVerifyRes.json();
    if (reVerifyRes.status === 400 && reVerifyData.error?.includes('already verified')) {
      recordPass('POST /api/auth/verify correctly rejects re-verification of already verified account (HTTP 400)');
    } else {
      recordFail('Re-verification rejection', `Expected 400 already verified, got ${reVerifyRes.status}: ${JSON.stringify(reVerifyData)}`);
    }

    const verifiedUser = await prisma.user.findUnique({ where: { email: testScholarEmail } });
    if (verifiedUser?.isVerified === true) {
      recordPass('User status confirmed updated to isVerified: true in database');
    } else {
      recordFail('User isVerified DB check');
    }

    // Section 5: End-to-End Password Recovery Flow via API
    console.log('\n[5/5] Testing E2E Forgot & Reset Password Flow via API...');

    // 5a: Forgot password request
    const forgotRes = await fetch(`${BASE_URL}/api/auth/forgot-password`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'x-forwarded-for': '127.0.0.13',
      },
      body: JSON.stringify({ email: testScholarEmail }),
    });
    const forgotData = await forgotRes.json();
    if (forgotRes.status === 200 && forgotData.message.includes('password reset link has been sent')) {
      recordPass('POST /api/auth/forgot-password succeeded (HTTP 200). Reset email dispatched.');
    } else {
      recordFail('POST /api/auth/forgot-password', JSON.stringify(forgotData));
    }

    // Verify reset token in DB
    const userWithToken = await prisma.user.findUnique({ where: { email: testScholarEmail } });
    if (userWithToken?.resetPasswordToken && userWithToken?.resetPasswordExpiresAt) {
      recordPass('Reset token hash and expiration saved in database');
    } else {
      recordFail('DB reset token check');
    }

    // 5b-1: Reject invalid reset token
    const invalidTokenRes = await fetch(`${BASE_URL}/api/auth/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-forwarded-for': '127.0.0.18',
      },
      body: JSON.stringify({
        token: 'completely-invalid-reset-token-999',
        password: updatedPassword,
      }),
    });
    const invalidTokenData = await invalidTokenRes.json();
    if (invalidTokenRes.status === 400 && invalidTokenData.error?.includes('Invalid or expired')) {
      recordPass('POST /api/auth/reset-password correctly rejects invalid token with HTTP 400');
    } else {
      recordFail('Invalid reset token rejection', `Expected 400, got ${invalidTokenRes.status}: ${JSON.stringify(invalidTokenData)}`);
    }

    // 5b-2: Reject expired reset token
    const expiredToken = 'expired-token-sample-abc';
    await prisma.user.update({
      where: { email: testScholarEmail },
      data: {
        resetPasswordToken: crypto.createHash('sha256').update(expiredToken).digest('hex'),
        resetPasswordExpiresAt: new Date(Date.now() - 1000 * 60 * 60), // Expired 1 hour ago
      },
    });
    const expiredTokenRes = await fetch(`${BASE_URL}/api/auth/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-forwarded-for': '127.0.0.19',
      },
      body: JSON.stringify({
        token: expiredToken,
        password: updatedPassword,
      }),
    });
    const expiredTokenData = await expiredTokenRes.json();
    if (expiredTokenRes.status === 400 && expiredTokenData.error?.includes('Invalid or expired')) {
      recordPass('POST /api/auth/reset-password correctly rejects expired token with HTTP 400');
    } else {
      recordFail('Expired reset token rejection', `Expected 400, got ${expiredTokenRes.status}: ${JSON.stringify(expiredTokenData)}`);
    }

    // 5b-3: Reset password using valid matching token
    const testResetToken = 'plain-token-reset-xyz-123';
    const hashedResetToken = crypto.createHash('sha256').update(testResetToken).digest('hex');
    await prisma.user.update({
      where: { email: testScholarEmail },
      data: {
        resetPasswordToken: hashedResetToken,
        resetPasswordExpiresAt: new Date(Date.now() + 60 * 60 * 1000),
      },
    });

    const resetRes = await fetch(`${BASE_URL}/api/auth/reset-password`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'x-forwarded-for': '127.0.0.14',
      },
      body: JSON.stringify({
        token: testResetToken,
        password: updatedPassword,
      }),
    });
    const resetData = await resetRes.json();
    if (resetRes.status === 200 && resetData.message.includes('successfully reset')) {
      recordPass('POST /api/auth/reset-password succeeded with valid token (HTTP 200)');
    } else {
      recordFail('POST /api/auth/reset-password', JSON.stringify(resetData));
    }

    // 5b-4: Replay attack prevention - reusing the same reset token is rejected
    const replayResetRes = await fetch(`${BASE_URL}/api/auth/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-forwarded-for': '127.0.0.20',
      },
      body: JSON.stringify({
        token: testResetToken,
        password: 'AnotherPassword789!',
      }),
    });
    const replayResetData = await replayResetRes.json();
    if (replayResetRes.status === 400 && replayResetData.error?.includes('Invalid or expired')) {
      recordPass('REPLAY DEFENSE: Re-submitting already consumed reset token rejected with HTTP 400');
    } else {
      recordFail('Replay attack rejection', `Expected 400, got ${replayResetRes.status}: ${JSON.stringify(replayResetData)}`);
    }

    // 5c: Verify login with the new password
    const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'x-forwarded-for': '127.0.0.15',
      },
      body: JSON.stringify({
        email: testScholarEmail,
        password: updatedPassword,
        role: 'student',
      }),
    });
    const loginData = await loginRes.json();
    if (loginRes.status === 200 && loginData.role === 'student' && loginData.message.includes('successfully')) {
      recordPass('POST /api/auth/login successfully authenticated with the newly updated password');
    } else {
      recordFail('Login with updated password', JSON.stringify(loginData));
    }

  } finally {
    // Clean up temporary test user
    console.log('\nCleaning up temporary test scholar from database...');
    try {
      await prisma.user.deleteMany({
        where: { email: testScholarEmail },
      });
      console.log('✓ Cleaned up temporary test user cleanly.');
    } catch (e: any) {
      console.log('Cleanup note:', e.message);
    }

    if (serverProc) {
      serverProc.kill('SIGINT');
    }
    await prisma.$disconnect();
  }

  console.log('\n' + '='.repeat(70));
  console.log(`GMAIL EMAIL INTEGRATION TEST SUMMARY:`);
  console.log(`  PASSED CHECKS: ${passed}`);
  console.log(`  FAILED CHECKS: ${failed}`);
  console.log('='.repeat(70));

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runEmailTests().catch((err) => {
  console.error('Fatal execution error:', err);
  process.exit(1);
});
