// Setup environment variables before any module loads
process.env.JWT_SECRET = 'test_jwt_secret_live_classes_12345';
process.env.DATABASE_URL = 'postgresql://mock_user:mock_pass@localhost:5432/mock_db';

// -------------------------------------------------------------
// In-Memory Mock Store & Module Interceptors
// -------------------------------------------------------------

interface MockUser {
  id: string;
  name: string;
  email: string;
  role: string;
  purchasedCourses: { id: string; title: string; category: string }[];
}

interface MockLaunch {
  id: string;
  title: string;
  description: string;
  launchDate: Date;
  category: string;
  type: string;
  status: string;
  instructorName: string;
  thumbnail: string;
  link: string;
}

let currentMockUser: { userId: string; role: string; email?: string; name?: string } | null = null;
let mockUsers: Map<string, MockUser> = new Map();
let mockLaunches: Map<string, MockLaunch> = new Map();

// Mock Prisma FIRST
const mockPrisma = {
  upcomingLaunch: {
    findMany: async (args?: any) => {
      let list = Array.from(mockLaunches.values());
      if (args?.where?.status?.in) {
        list = list.filter(l => args.where.status.in.includes(l.status));
      }
      return list;
    },
    findUnique: async (args: any) => {
      return mockLaunches.get(args?.where?.id) || null;
    },
  },
};

(global as any).prisma = mockPrisma;
const prismaPath = require.resolve('@/lib/prisma');
const prismaExports = Object.assign(mockPrisma, {
  prisma: mockPrisma,
  default: mockPrisma,
  __esModule: true,
});
require.cache[prismaPath] = {
  id: prismaPath,
  filename: prismaPath,
  loaded: true,
  exports: prismaExports,
} as any;

// Mock Auth module
const authPath = require.resolve('@/lib/auth');
require.cache[authPath] = {
  id: authPath,
  filename: authPath,
  loaded: true,
  exports: {
    getUserFromCookie: async () => currentMockUser,
  },
} as any;

// Mock User repository
const userRepoPath = require.resolve('@/lib/repositories/user.repository');
require.cache[userRepoPath] = {
  id: userRepoPath,
  filename: userRepoPath,
  loaded: true,
  exports: {
    UserRepository: {
      findById: async (id: string) => mockUsers.get(id) || null,
    },
  },
} as any;

// Import target modules AFTER mocks are installed in require.cache
const {
  canUserAccessLaunchLink,
  sanitizeLaunchForUser,
} = require('@/lib/repositories/launch.repository');
const { GET: getLaunchesRoute } = require('@/app/api/launches/route');
const { GET: getSingleLaunchRoute } = require('@/app/api/launches/[id]/route');
const { default: LiveClassesPage } = require('@/app/live-classes/page');

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

// Helper to recursively traverse React element tree without circular errors
function jsxContainsText(element: any, target: string): boolean {
  if (!element) return false;
  if (typeof element === 'string') return element.includes(target);
  if (typeof element === 'number') return String(element).includes(target);
  if (element.props) {
    if (element.props.href && String(element.props.href).includes(target)) return true;
    if (element.props.src && String(element.props.src).includes(target)) return true;
    if (element.props.children) {
      if (Array.isArray(element.props.children)) {
        return element.props.children.some((child: any) => jsxContainsText(child, target));
      }
      return jsxContainsText(element.props.children, target);
    }
  }
  return false;
}

async function runAllTests() {
  console.log('============================================================');
  console.log('       LIVE-CLASS ACCESS SECURITY & DATA EXPOSURE SUITE     ');
  console.log('============================================================\n');

  function resetStore() {
    mockUsers.clear();
    mockLaunches.clear();
    currentMockUser = null;

    // Users
    mockUsers.set('user_student_non_enrolled', {
      id: 'user_student_non_enrolled',
      name: 'Unenrolled Student',
      email: 'unenrolled@golive.test',
      role: 'student',
      purchasedCourses: [],
    });

    mockUsers.set('user_student_fullstack', {
      id: 'user_student_fullstack',
      name: 'FullStack Student',
      email: 'fullstack@golive.test',
      role: 'student',
      purchasedCourses: [
        { id: 'c_fullstack_1', title: 'Next.js Pro', category: 'Full Stack Web Development' }
      ],
    });

    mockUsers.set('user_admin_1', {
      id: 'user_admin_1',
      name: 'Professor Bob',
      email: 'admin@golive.test',
      role: 'admin',
      purchasedCourses: [],
    });

    mockUsers.set('user_superadmin_1', {
      id: 'user_superadmin_1',
      name: 'Provost Carol',
      email: 'superadmin@golive.test',
      role: 'superadmin',
      purchasedCourses: [],
    });

    // Launches
    mockLaunches.set('launch_live_fullstack', {
      id: 'launch_live_fullstack',
      title: 'Full Stack Live Review',
      description: 'Live architecture workshop',
      launchDate: new Date(),
      category: 'Full Stack Web Development',
      type: 'live-session',
      status: 'live',
      instructorName: 'Professor Bob',
      thumbnail: 'https://cdn.example.com/thumb1.jpg',
      link: 'https://zoom.us/j/111222333?pwd=secretpassword1',
    });

    mockLaunches.set('launch_live_devops', {
      id: 'launch_live_devops',
      title: 'Kubernetes Live Cohort',
      description: 'Hands on cluster deployment',
      launchDate: new Date(),
      category: 'Cloud Architecture & DevOps',
      type: 'live-session',
      status: 'live',
      instructorName: 'DevOps Lead',
      thumbnail: 'https://cdn.example.com/thumb2.jpg',
      link: 'https://meet.google.com/abc-defg-hij',
    });

    mockLaunches.set('launch_scheduled_webinar', {
      id: 'launch_scheduled_webinar',
      title: 'Global Engineering Masterclass',
      description: 'Open to all enrolled students',
      launchDate: new Date(Date.now() + 86400000),
      category: 'General',
      type: 'webinar',
      status: 'scheduled',
      instructorName: 'Guest Keynote',
      thumbnail: 'https://cdn.example.com/thumb3.jpg',
      link: 'https://zoom.us/j/999888777?pwd=webinarsecret',
    });
  }

  // =========================================================================
  // SECTION 1: Authorization Helper Unit Tests
  // =========================================================================
  console.log('SECTION 1: Authorization Helper Unit Tests (canUserAccessLaunchLink)');
  resetStore();

  const fullstackLaunch = mockLaunches.get('launch_live_fullstack')!;
  const devopsLaunch = mockLaunches.get('launch_live_devops')!;
  const webinarLaunch = mockLaunches.get('launch_scheduled_webinar')!;

  // UNIT-01: Guest is denied
  assert(
    canUserAccessLaunchLink(null, [], fullstackLaunch) === false,
    'UNIT-01: Unauthenticated visitor (role: null) denied access to meeting URL'
  );

  // UNIT-02: Non-enrolled student is denied
  assert(
    canUserAccessLaunchLink('student', [], fullstackLaunch) === false,
    'UNIT-02: Non-enrolled student denied access to category-restricted session'
  );

  // UNIT-03: Enrolled student gets access to matching category
  assert(
    canUserAccessLaunchLink('student', ['Full Stack Web Development'], fullstackLaunch) === true,
    'UNIT-03: Enrolled student granted access to matching category session (case-insensitive)'
  );

  // UNIT-04: Enrolled student denied access to non-matching category
  assert(
    canUserAccessLaunchLink('student', ['Full Stack Web Development'], devopsLaunch) === false,
    'UNIT-04: Student enrolled in Full Stack denied access to Cloud Architecture & DevOps session'
  );

  // UNIT-05: Enrolled student gets access to webinar
  assert(
    canUserAccessLaunchLink('student', ['Full Stack Web Development'], webinarLaunch) === true,
    'UNIT-05: Enrolled student granted access to global webinar/masterclass'
  );

  // UNIT-06: Non-enrolled student denied access to webinar
  assert(
    canUserAccessLaunchLink('student', [], webinarLaunch) === false,
    'UNIT-06: Non-enrolled student denied access to webinar meeting URL'
  );

  // UNIT-07: Admin granted access to all sessions
  assert(
    canUserAccessLaunchLink('admin', [], devopsLaunch) === true,
    'UNIT-07: Admin granted full access across all categories without enrollment requirement'
  );

  // UNIT-08: Superadmin granted access to all sessions
  assert(
    canUserAccessLaunchLink('superadmin', [], devopsLaunch) === true,
    'UNIT-08: Superadmin granted full access across all categories'
  );

  // UNIT-09: sanitizeLaunchForUser correctly strips or preserves link
  const sanitizedDenied = sanitizeLaunchForUser(fullstackLaunch, false);
  const sanitizedAllowed = sanitizeLaunchForUser(fullstackLaunch, true);
  assert(
    sanitizedDenied.link === null && sanitizedAllowed.link === fullstackLaunch.link,
    'UNIT-09: sanitizeLaunchForUser replaces link with null when unauthorized and preserves link when authorized'
  );

  // =========================================================================
  // SECTION 2: Public & Student API Security (GET /api/launches)
  // =========================================================================
  console.log('\nSECTION 2: Public & Student API Security (GET /api/launches)');
  resetStore();

  // API-01: Unauthenticated guest never receives meeting links
  currentMockUser = null;
  const guestReq = new Request('http://localhost:3000/api/launches');
  const guestRes = await getLaunchesRoute(guestReq);
  const guestData = await guestRes.json();
  const guestLeaked = guestData.some((l: any) => l.link !== null);
  assert(
    guestRes.status === 200 &&
    guestData.length >= 2 &&
    !guestLeaked,
    'API-01: [SECURITY] Unauthenticated visitor calling GET /api/launches receives sessions with ALL links set to null'
  );

  // API-02: Non-enrolled student never receives meeting links
  currentMockUser = { userId: 'user_student_non_enrolled', role: 'student' };
  const unenrolledReq = new Request('http://localhost:3000/api/launches');
  const unenrolledRes = await getLaunchesRoute(unenrolledReq);
  const unenrolledData = await unenrolledRes.json();
  const unenrolledLeaked = unenrolledData.some((l: any) => l.link !== null);
  assert(
    unenrolledRes.status === 200 &&
    !unenrolledLeaked,
    'API-02: [SECURITY] Non-enrolled student calling GET /api/launches receives sessions with ALL links set to null'
  );

  // API-03: Enrolled student only receives link for matching category
  currentMockUser = { userId: 'user_student_fullstack', role: 'student' };
  const enrolledReq = new Request('http://localhost:3000/api/launches');
  const enrolledRes = await getLaunchesRoute(enrolledReq);
  const enrolledData = await enrolledRes.json();

  const fsSession = enrolledData.find((l: any) => l.category === 'Full Stack Web Development');
  const devopsSession = enrolledData.find((l: any) => l.category === 'Cloud Architecture & DevOps');
  const webSession = enrolledData.find((l: any) => l.type === 'webinar');

  assert(
    fsSession?.link === 'https://zoom.us/j/111222333?pwd=secretpassword1' &&
    devopsSession?.link === null &&
    webSession?.link === 'https://zoom.us/j/999888777?pwd=webinarsecret',
    'API-03: [RBAC] Enrolled student receives meeting link for enrolled category and webinar, but Cloud DevOps link is stripped (null)'
  );

  // API-04: Admin receives all meeting links
  currentMockUser = { userId: 'user_admin_1', role: 'admin' };
  const adminReq = new Request('http://localhost:3000/api/launches');
  const adminRes = await getLaunchesRoute(adminReq);
  const adminData = await adminRes.json();
  const adminAllHaveLinks = adminData.every((l: any) => typeof l.link === 'string' && l.link.startsWith('http'));
  assert(
    adminRes.status === 200 && adminAllHaveLinks,
    'API-04: Faculty/Admin receives full meeting links for all live sessions'
  );

  // API-05: Superadmin receives all meeting links
  currentMockUser = { userId: 'user_superadmin_1', role: 'superadmin' };
  const superReq = new Request('http://localhost:3000/api/launches');
  const superRes = await getLaunchesRoute(superReq);
  const superData = await superRes.json();
  const superAllHaveLinks = superData.every((l: any) => typeof l.link === 'string' && l.link.startsWith('http'));
  assert(
    superRes.status === 200 && superAllHaveLinks,
    'API-05: Superadmin receives full meeting links for all live sessions'
  );

  // API-06: GET /api/launches?admin=true blocks unauthorized users with 401
  currentMockUser = { userId: 'user_student_fullstack', role: 'student' };
  const studentAdminQueryReq = new Request('http://localhost:3000/api/launches?admin=true');
  const studentAdminQueryRes = await getLaunchesRoute(studentAdminQueryReq);
  assert(
    studentAdminQueryRes.status === 401,
    'API-06: Student calling GET /api/launches?admin=true is rejected with HTTP 401 Unauthorized'
  );

  // =========================================================================
  // SECTION 3: Single Launch Security (GET /api/launches/[id])
  // =========================================================================
  console.log('\nSECTION 3: Single Launch Security (GET /api/launches/[id])');
  resetStore();

  // ID-01: Guest gets sanitized launch with link: null
  currentMockUser = null;
  const guestSingleReq = new Request('http://localhost:3000/api/launches/launch_live_fullstack');
  const guestSingleRes = await getSingleLaunchRoute(guestSingleReq, { params: Promise.resolve({ id: 'launch_live_fullstack' }) });
  const guestSingleData = await guestSingleRes.json();
  assert(
    guestSingleRes.status === 200 &&
    guestSingleData.id === 'launch_live_fullstack' &&
    guestSingleData.link === null,
    'ID-01: Guest requesting single launch by ID receives sanitized record with link: null'
  );

  // ID-02: Non-enrolled student gets sanitized launch with link: null
  currentMockUser = { userId: 'user_student_non_enrolled', role: 'student' };
  const unenrolledSingleReq = new Request('http://localhost:3000/api/launches/launch_live_fullstack');
  const unenrolledSingleRes = await getSingleLaunchRoute(unenrolledSingleReq, { params: Promise.resolve({ id: 'launch_live_fullstack' }) });
  const unenrolledSingleData = await unenrolledSingleRes.json();
  assert(
    unenrolledSingleRes.status === 200 && unenrolledSingleData.link === null,
    'ID-02: Non-enrolled student requesting single launch receives link: null'
  );

  // ID-03: Enrolled student gets full link for their enrolled category
  currentMockUser = { userId: 'user_student_fullstack', role: 'student' };
  const enrolledSingleReq = new Request('http://localhost:3000/api/launches/launch_live_fullstack');
  const enrolledSingleRes = await getSingleLaunchRoute(enrolledSingleReq, { params: Promise.resolve({ id: 'launch_live_fullstack' }) });
  const enrolledSingleData = await enrolledSingleRes.json();
  assert(
    enrolledSingleRes.status === 200 &&
    enrolledSingleData.link === 'https://zoom.us/j/111222333?pwd=secretpassword1',
    'ID-03: Enrolled student requesting single launch in enrolled category receives verified meeting link'
  );

  // ID-04: Enrolled student denied link for different category
  const devopsSingleReq = new Request('http://localhost:3000/api/launches/launch_live_devops');
  const devopsSingleRes = await getSingleLaunchRoute(devopsSingleReq, { params: Promise.resolve({ id: 'launch_live_devops' }) });
  const devopsSingleData = await devopsSingleRes.json();
  assert(
    devopsSingleRes.status === 200 && devopsSingleData.link === null,
    'ID-04: Student requesting single launch in non-enrolled category receives link: null'
  );

  // ID-05: Non-existent launch returns 404
  const notFoundReq = new Request('http://localhost:3000/api/launches/non_existent_id');
  const notFoundRes = await getSingleLaunchRoute(notFoundReq, { params: Promise.resolve({ id: 'non_existent_id' }) });
  assert(
    notFoundRes.status === 404,
    'ID-05: Requesting non-existent launch ID returns HTTP 404'
  );

  // =========================================================================
  // SECTION 4: Live Classes Page Security (LiveClassesPage SSR)
  // =========================================================================
  console.log('\nSECTION 4: Live Classes Page Security (LiveClassesPage SSR)');
  resetStore();

  // PAGE-01: Guest SSR render contains NO meeting URLs
  currentMockUser = null;
  const guestPageJsx = await LiveClassesPage();
  const guestHasZoom = jsxContainsText(guestPageJsx, 'zoom.us');
  const guestHasMeet = jsxContainsText(guestPageJsx, 'meet.google.com');
  assert(
    !guestHasZoom && !guestHasMeet,
    'PAGE-01: [SSR SECURITY] Guest rendered page output does not leak any Zoom or Google Meet URLs'
  );

  // PAGE-02: Non-enrolled student SSR render contains NO meeting URLs
  currentMockUser = { userId: 'user_student_non_enrolled', role: 'student' };
  const unenrolledPageJsx = await LiveClassesPage();
  const unenrolledHasZoom = jsxContainsText(unenrolledPageJsx, 'zoom.us');
  const unenrolledHasMeet = jsxContainsText(unenrolledPageJsx, 'meet.google.com');
  assert(
    !unenrolledHasZoom && !unenrolledHasMeet,
    'PAGE-02: [SSR SECURITY] Non-enrolled student rendered page output does not leak any meeting URLs'
  );

  // PAGE-03: Enrolled student SSR render includes their authorized meeting URL
  currentMockUser = { userId: 'user_student_fullstack', role: 'student' };
  const enrolledPageJsx = await LiveClassesPage();
  const enrolledHasMeetingLink = jsxContainsText(enrolledPageJsx, 'zoom.us/j/111222333?pwd=secretpassword1');
  assert(
    enrolledHasMeetingLink,
    'PAGE-03: [SSR AUTHORIZED] Enrolled student rendered page includes their authorized live session link'
  );

  // PAGE-04: Admin SSR render includes meeting URL
  currentMockUser = { userId: 'user_admin_1', role: 'admin' };
  const adminPageJsx = await LiveClassesPage();
  const adminHasMeetingLink = jsxContainsText(adminPageJsx, 'zoom.us/j/111222333?pwd=secretpassword1');
  assert(
    adminHasMeetingLink,
    'PAGE-04: Faculty/Admin rendered page includes active meeting URL'
  );

  // PAGE-05: Superadmin SSR render includes meeting URL
  currentMockUser = { userId: 'user_superadmin_1', role: 'superadmin' };
  const superPageJsx = await LiveClassesPage();
  const superHasMeetingLink = jsxContainsText(superPageJsx, 'zoom.us/j/111222333?pwd=secretpassword1');
  assert(
    superHasMeetingLink,
    'PAGE-05: Superadmin rendered page includes active meeting URL'
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
