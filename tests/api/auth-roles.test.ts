import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Setup test environment variables
process.env.JWT_SECRET = 'test_jwt_secret_auth_roles_9876543210';
process.env.DATABASE_URL = 'postgresql://mock_user:mock_pass@localhost:5432/mock_db';

// -------------------------------------------------------------
// In-Memory Mock Store & Mocks
// -------------------------------------------------------------

interface MockUser {
  id: string;
  name: string;
  email: string;
  password: string;
  role: string;
  isVerified: boolean;
  isBlocked: boolean;
  authProvider?: string;
  lastLoginAt?: Date;
  purchasedCourses?: any[];
  wishlist?: any[];
}

let mockUsers: Map<string, MockUser> = new Map();
let mockCookieStore = new Map<string, { value: string; options?: any }>();

// Mock next/headers
const nextHeadersPath = require.resolve('next/headers');
require.cache[nextHeadersPath] = {
  id: nextHeadersPath,
  filename: nextHeadersPath,
  loaded: true,
  exports: {
    cookies: async () => ({
      get: (name: string) => mockCookieStore.get(name),
      set: (name: string, value: string, options?: any) => {
        mockCookieStore.set(name, { value, options });
      },
      delete: (name: string) => {
        mockCookieStore.delete(name);
      },
    }),
  },
} as any;

// Mock rate limit
const rateLimitPath = require.resolve('@/lib/rateLimit');
require.cache[rateLimitPath] = {
  id: rateLimitPath,
  filename: rateLimitPath,
  loaded: true,
  exports: {
    checkRateLimit: () => true,
    getIP: () => '127.0.0.1',
  },
} as any;

// Mock UserRepository
const userRepoPath = require.resolve('@/lib/repositories/user.repository');
require.cache[userRepoPath] = {
  id: userRepoPath,
  filename: userRepoPath,
  loaded: true,
  exports: {
    UserRepository: {
      findByEmail: async (email: string) => {
        for (const user of mockUsers.values()) {
          if (user.email.toLowerCase() === email.toLowerCase()) {
            return { ...user };
          }
        }
        return null;
      },
      findById: async (id: string) => {
        const u = mockUsers.get(id);
        return u ? { ...u, purchasedCourses: u.purchasedCourses || [], wishlist: u.wishlist || [] } : null;
      },
      updateLastLogin: async (id: string) => {
        const u = mockUsers.get(id);
        if (u) {
          u.lastLoginAt = new Date();
        }
        return u;
      },
      update: async (id: string, data: any) => {
        const u = mockUsers.get(id);
        if (u) {
          Object.assign(u, data);
        }
        return u;
      },
    },
  },
} as any;

// Import target modules after mocks are installed
const { POST: loginRoute } = require('@/app/api/auth/login/route');
const { getUserFromCookie } = require('@/lib/auth');
const { GET: meRoute } = require('@/app/api/auth/me/route');

// -------------------------------------------------------------
// Test Runner Harness
// -------------------------------------------------------------

let passedCount = 0;
let failedCount = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    console.log(`  ✔ [PASS] ${message}`);
    passedCount++;
  } else {
    console.error(`  ✖ [FAIL] ${message}`);
    failedCount++;
  }
}

async function runAllTests() {
  console.log('============================================================');
  console.log('      AUTHENTICATION, ROLE & SESSION AUDIT TEST SUITE       ');
  console.log('============================================================\n');

  const hashedPassword = await bcrypt.hash('CorrectPassword123!', 10);

  function resetStore() {
    mockUsers.clear();
    mockCookieStore.clear();

    // Standard Student
    mockUsers.set('user_student_1', {
      id: 'user_student_1',
      name: 'Alice Student',
      email: 'student@golive.test',
      password: hashedPassword,
      role: 'student',
      isVerified: true,
      isBlocked: false,
    });

    // Faculty / Admin
    mockUsers.set('user_admin_1', {
      id: 'user_admin_1',
      name: 'Bob Professor',
      email: 'admin@golive.test',
      password: hashedPassword,
      role: 'admin',
      isVerified: true,
      isBlocked: false,
    });

    // Super Admin
    mockUsers.set('user_superadmin_1', {
      id: 'user_superadmin_1',
      name: 'Carol Provost',
      email: 'superadmin@golive.test',
      password: hashedPassword,
      role: 'superadmin',
      isVerified: true,
      isBlocked: false,
    });

    // Unverified User
    mockUsers.set('user_unverified_1', {
      id: 'user_unverified_1',
      name: 'Dave Unverified',
      email: 'unverified@golive.test',
      password: hashedPassword,
      role: 'student',
      isVerified: false,
      isBlocked: false,
    });

    // Blocked User
    mockUsers.set('user_blocked_1', {
      id: 'user_blocked_1',
      name: 'Eve Blocked',
      email: 'blocked@golive.test',
      password: hashedPassword,
      role: 'student',
      isVerified: true,
      isBlocked: true,
    });
  }

  // =========================================================================
  // SECTION 1: Student Login & Role Enforcement
  // =========================================================================
  console.log('SECTION 1: Student Login & Role Enforcement (/api/auth/login)');
  resetStore();

  // AUTH-01: Rejects unverified user with 403 and requireVerification flag
  const unverifiedReq = new Request('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'unverified@golive.test', password: 'CorrectPassword123!', role: 'student' }),
  });
  const unverifiedRes = await loginRoute(unverifiedReq);
  const unverifiedBody = await unverifiedRes.json();
  assert(
    unverifiedRes.status === 403 && unverifiedBody.requireVerification === true,
    'AUTH-01: Rejects unverified user with HTTP 403 and requireVerification: true'
  );

  // AUTH-02: Rejects suspended/blocked user with 403
  const blockedReq = new Request('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'blocked@golive.test', password: 'CorrectPassword123!', role: 'student' }),
  });
  const blockedRes = await loginRoute(blockedReq);
  const blockedBody = await blockedRes.json();
  assert(
    blockedRes.status === 403 && blockedBody.error?.includes('suspended'),
    'AUTH-02: Rejects suspended user with HTTP 403 and clear suspension message'
  );

  // AUTH-03: Rejects student attempting to login with Faculty role (requestedRole: 'instructor')
  const studentAsFacultyReq = new Request('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'student@golive.test', password: 'CorrectPassword123!', role: 'instructor' }),
  });
  const studentAsFacultyRes = await loginRoute(studentAsFacultyReq);
  const studentAsFacultyBody = await studentAsFacultyRes.json();
  assert(
    studentAsFacultyRes.status === 403 && studentAsFacultyBody.error === 'This account does not have Teacher privileges.',
    'AUTH-03: Rejects student selecting Faculty role with HTTP 403 "This account does not have Teacher privileges."'
  );

  // AUTH-04: Rejects student attempting to claim admin or superadmin via API payload
  const studentAsAdminReq = new Request('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'student@golive.test', password: 'CorrectPassword123!', role: 'admin' }),
  });
  const studentAsAdminRes = await loginRoute(studentAsAdminReq);
  assert(
    studentAsAdminRes.status === 403,
    'AUTH-04a: Rejects student attempting to claim admin via API with HTTP 403'
  );

  const studentAsSuperReq = new Request('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'student@golive.test', password: 'CorrectPassword123!', role: 'superadmin' }),
  });
  const studentAsSuperRes = await loginRoute(studentAsSuperReq);
  assert(
    studentAsSuperRes.status === 403,
    'AUTH-04b: Rejects student attempting to claim superadmin via API with HTTP 403'
  );

  // AUTH-05: Successfully logs in legitimate student with Learner role
  mockCookieStore.clear();
  const validStudentReq = new Request('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'student@golive.test', password: 'CorrectPassword123!', role: 'student' }),
  });
  const validStudentRes = await loginRoute(validStudentReq);
  const validStudentBody = await validStudentRes.json();
  const studentCookie = mockCookieStore.get('auth-token');
  assert(
    validStudentRes.status === 200 &&
    validStudentBody.role === 'student' &&
    studentCookie !== undefined &&
    studentCookie.value.length > 20,
    'AUTH-05: Successfully authenticates student, returns role: "student", and sets auth-token cookie'
  );

  // =========================================================================
  // SECTION 2: Admin / Teacher Login Enforcement
  // =========================================================================
  console.log('\nSECTION 2: Admin / Teacher Login Enforcement (/api/auth/login)');
  resetStore();

  // AUTH-06: Allows admin to log in with Faculty role (requestedRole: 'instructor')
  mockCookieStore.clear();
  const adminFacultyReq = new Request('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@golive.test', password: 'CorrectPassword123!', role: 'instructor' }),
  });
  const adminFacultyRes = await loginRoute(adminFacultyReq);
  const adminFacultyBody = await adminFacultyRes.json();
  const adminCookie = mockCookieStore.get('auth-token');
  assert(
    adminFacultyRes.status === 200 &&
    adminFacultyBody.role === 'admin' &&
    adminCookie !== undefined,
    'AUTH-06: Allows admin to authenticate in Faculty mode, returns role: "admin", and sets auth-token'
  );

  // AUTH-07: Allows admin to log in with role: 'admin' via direct API
  const adminDirectReq = new Request('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@golive.test', password: 'CorrectPassword123!', role: 'admin' }),
  });
  const adminDirectRes = await loginRoute(adminDirectReq);
  assert(
    adminDirectRes.status === 200,
    'AUTH-07: Allows admin to authenticate with role: "admin" directly'
  );

  // AUTH-08: Rejects admin attempting to log in via Learner role (requestedRole: 'student')
  const adminAsLearnerReq = new Request('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@golive.test', password: 'CorrectPassword123!', role: 'student' }),
  });
  const adminAsLearnerRes = await loginRoute(adminAsLearnerReq);
  const adminAsLearnerBody = await adminAsLearnerRes.json();
  assert(
    adminAsLearnerRes.status === 403 &&
    adminAsLearnerBody.error === 'Please select the Teacher role to log in to your account.',
    'AUTH-08: Rejects admin selecting Learner role with prompt to select Teacher role'
  );

  // =========================================================================
  // SECTION 3: Superadmin Login Fix Verification
  // =========================================================================
  console.log('\nSECTION 3: Superadmin Login Fix Verification (/api/auth/login)');
  resetStore();

  // AUTH-09: CRITICAL FIX - Allows superadmin to log in using Faculty role (requestedRole: 'instructor')
  mockCookieStore.clear();
  const superFacultyReq = new Request('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'superadmin@golive.test', password: 'CorrectPassword123!', role: 'instructor' }),
  });
  const superFacultyRes = await loginRoute(superFacultyReq);
  const superFacultyBody = await superFacultyRes.json();
  const superCookie = mockCookieStore.get('auth-token');
  assert(
    superFacultyRes.status === 200 &&
    superFacultyBody.role === 'superadmin' &&
    superCookie !== undefined,
    'AUTH-09: [CRITICAL FIX] Allows superadmin to log in via Faculty/Instructor mode without 403 rejection'
  );

  // AUTH-10: Allows superadmin to log in with role: 'superadmin' directly
  const superDirectReq = new Request('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'superadmin@golive.test', password: 'CorrectPassword123!', role: 'superadmin' }),
  });
  const superDirectRes = await loginRoute(superDirectReq);
  const superDirectBody = await superDirectRes.json();
  assert(
    superDirectRes.status === 200 && superDirectBody.role === 'superadmin',
    'AUTH-10: Allows superadmin to log in directly with role: "superadmin"'
  );

  // AUTH-11: Rejects superadmin attempting to log in via Learner role (role: 'student')
  const superAsLearnerReq = new Request('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'superadmin@golive.test', password: 'CorrectPassword123!', role: 'student' }),
  });
  const superAsLearnerRes = await loginRoute(superAsLearnerReq);
  assert(
    superAsLearnerRes.status === 403,
    'AUTH-11: Directs superadmin away from Learner tab with prompt to select Teacher role'
  );

  // AUTH-12: Password & Credential Verification
  const wrongPasswordReq = new Request('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'superadmin@golive.test', password: 'WrongPassword999', role: 'instructor' }),
  });
  const wrongPasswordRes = await loginRoute(wrongPasswordReq);
  assert(
    wrongPasswordRes.status === 401,
    'AUTH-12: Rejects incorrect password with HTTP 401'
  );

  // AUTH-13: Missing or Nonexistent Account
  const nonExistentReq = new Request('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'ghost@golive.test', password: 'Password123!', role: 'student' }),
  });
  const nonExistentRes = await loginRoute(nonExistentReq);
  assert(
    nonExistentRes.status === 401,
    'AUTH-13: Rejects non-existent email with HTTP 401'
  );

  // =========================================================================
  // SECTION 4: Live Database Role Synchronization (getUserFromCookie)
  // =========================================================================
  console.log('\nSECTION 4: Live Database Role Synchronization (getUserFromCookie)');
  resetStore();

  // SESSION-01: Returns null when cookie is absent
  mockCookieStore.clear();
  const noUser = await getUserFromCookie();
  assert(noUser === null, 'SESSION-01: Returns null when no auth-token cookie is present');

  // SESSION-02: Returns null for malformed or invalid JWT signature
  mockCookieStore.set('auth-token', { value: 'invalid.token.structure' });
  const badTokenUser = await getUserFromCookie();
  assert(badTokenUser === null, 'SESSION-02: Returns null for malformed or unsigned token');

  // SESSION-03: Returns active student user matching DB record
  const studentToken = jwt.sign(
    { userId: 'user_student_1', role: 'student' },
    process.env.JWT_SECRET!,
    { expiresIn: '7d' }
  );
  mockCookieStore.set('auth-token', { value: studentToken });
  const activeStudent = await getUserFromCookie();
  assert(
    activeStudent !== null &&
    activeStudent.userId === 'user_student_1' &&
    activeStudent.role === 'student' &&
    activeStudent.email === 'student@golive.test' &&
    activeStudent.name === 'Alice Student',
    'SESSION-03: Returns session user with accurate id, userId, role, email, and name'
  );

  // SESSION-04: CRITICAL ROLE SYNC - Student promoted to admin in DB gets instant admin role
  // (Old JWT has role: 'student', but DB user now has role: 'admin')
  const userInDb = mockUsers.get('user_student_1')!;
  userInDb.role = 'admin'; // Role change in PostgreSQL
  const promotedUser = await getUserFromCookie();
  assert(
    promotedUser !== null && promotedUser.role === 'admin',
    'SESSION-04: [ROLE SYNC] Promoted user immediately reflects live DB role ("admin") despite stale JWT ("student")'
  );

  // SESSION-05: CRITICAL ROLE SYNC - Admin elevated to superadmin gets instant superadmin role
  userInDb.role = 'superadmin'; // Promoted to superadmin in PostgreSQL
  const elevatedUser = await getUserFromCookie();
  assert(
    elevatedUser !== null && elevatedUser.role === 'superadmin',
    'SESSION-05: [ROLE SYNC] Superadmin promotion immediately reflects live DB role ("superadmin")'
  );

  // SESSION-06: SECURITY REVOCATION - Demoted admin immediately loses admin privileges
  const adminToken = jwt.sign(
    { userId: 'user_admin_1', role: 'admin' },
    process.env.JWT_SECRET!,
    { expiresIn: '7d' }
  );
  mockCookieStore.set('auth-token', { value: adminToken });
  const adminDb = mockUsers.get('user_admin_1')!;
  adminDb.role = 'student'; // Demoted to student in PostgreSQL
  const demotedUser = await getUserFromCookie();
  assert(
    demotedUser !== null && demotedUser.role === 'student',
    'SESSION-06: [SECURITY] Demoted admin immediately reflects role: "student", cutting off stale admin privileges'
  );

  // SESSION-07: SECURITY REVOCATION - Blocked user immediately returns null
  adminDb.isBlocked = true; // Suspended in PostgreSQL
  const blockedSession = await getUserFromCookie();
  assert(
    blockedSession === null,
    'SESSION-07: [SECURITY] Suspended/blocked user session is immediately revoked (returns null)'
  );

  // SESSION-08: DELETED USER REVOCATION - Deleted user returns null
  mockUsers.delete('user_admin_1'); // Deleted from PostgreSQL
  const deletedSession = await getUserFromCookie();
  assert(
    deletedSession === null,
    'SESSION-08: [SECURITY] Deleted user immediately returns null'
  );

  // =========================================================================
  // SECTION 5: Downstream API Integration (/api/auth/me)
  // =========================================================================
  console.log('\nSECTION 5: Downstream API Integration (/api/auth/me)');
  resetStore();

  // ME-01: Returns user: null when unauthenticated
  mockCookieStore.clear();
  const unauthMeRes = await meRoute();
  const unauthMeBody = await unauthMeRes.json();
  assert(
    unauthMeRes.status === 200 && unauthMeBody.user === null,
    'ME-01: GET /api/auth/me returns { user: null } when unauthenticated'
  );

  // ME-02: Returns user with live DB role when authenticated
  const superToken = jwt.sign(
    { userId: 'user_superadmin_1', role: 'superadmin' },
    process.env.JWT_SECRET!,
    { expiresIn: '7d' }
  );
  mockCookieStore.set('auth-token', { value: superToken });
  const authMeRes = await meRoute();
  const authMeBody = await authMeRes.json();
  assert(
    authMeRes.status === 200 &&
    authMeBody.user?.role === 'superadmin' &&
    authMeBody.user?.email === 'superadmin@golive.test',
    'ME-02: GET /api/auth/me returns current user profile with live DB role "superadmin"'
  );

  // =========================================================================
  // SUMMARY
  // =========================================================================
  console.log('\n============================================================');
  console.log(`TEST RESULTS: ${passedCount}/${passedCount + failedCount} PASSED (${failedCount} FAILED)`);
  console.log('============================================================\n');

  if (failedCount > 0) {
    process.exit(1);
  }
}

runAllTests().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
