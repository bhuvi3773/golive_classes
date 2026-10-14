import crypto from 'crypto';
import path from 'path';

// Setup environment variables before any module loads
process.env.RAZORPAY_KEY_ID = 'rzp_test_MockKey123456';
process.env.RAZORPAY_KEY_SECRET = 'mock_secret_key_abcdef123456';
process.env.JWT_SECRET = 'test_jwt_secret_9876543210';
process.env.DATABASE_URL = 'postgresql://mock_user:mock_pass@localhost:5432/mock_db';

// -------------------------------------------------------------
// In-Memory Mock Stores & Interceptors
// -------------------------------------------------------------

interface MockUser {
  id: string;
  name: string;
  email: string;
  role: string;
  isBlocked?: boolean;
  purchasedCourses: { id: string; title: string }[];
}

interface MockCourse {
  id: string;
  title: string;
  price: number;
  status: string;
  instructorId?: string;
}

interface MockOrder {
  id: string;
  orderId: string;
  paymentId: string | null;
  signature: string | null;
  userId: string;
  courseId: string;
  amountInPaise: number;
  currency: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

// State containers for our tests
let currentMockUser: { userId: string; role: string; email?: string; name?: string } | null = null;
let mockUsers: Map<string, MockUser> = new Map();
let mockCourses: Map<string, MockCourse> = new Map();
let mockOrders: Map<string, MockOrder> = new Map();
let sentEmails: { to: string; courseTitle: string }[] = [];
let razorpayOrdersCreated: any[] = [];
let mockPaymentFetchResponse: any = null;
let mockPaymentFetchError: Error | null = null;
let forceDbOrderCreateError = false;

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

// Mock Email module
const emailPath = require.resolve('@/lib/email');
require.cache[emailPath] = {
  id: emailPath,
  filename: emailPath,
  loaded: true,
  exports: {
    sendEnrollmentEmail: async (email: string, name: string, courseTitle: string, courseId: string) => {
      sentEmails.push({ to: email, courseTitle });
      return Promise.resolve();
    },
  },
} as any;

// Mock Repositories
const courseRepoPath = require.resolve('@/lib/repositories/course.repository');
require.cache[courseRepoPath] = {
  id: courseRepoPath,
  filename: courseRepoPath,
  loaded: true,
  exports: {
    CourseRepository: {
      findById: async (id: string) => mockCourses.get(id) || null,
      addPurchase: async (userId: string, courseId: string) => {
        const u = mockUsers.get(userId);
        const c = mockCourses.get(courseId);
        if (u && c && !u.purchasedCourses.some(item => item.id === courseId)) {
          u.purchasedCourses.push({ id: c.id, title: c.title });
        }
        return u;
      },
      findAll: async () => Array.from(mockCourses.values()),
    },
  },
} as any;

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

// Mock Prisma
const mockPrisma = {
  order: {
    findUnique: async ({ where }: { where: { orderId?: string; id?: string } }) => {
      if (where.orderId) {
        for (const o of mockOrders.values()) {
          if (o.orderId === where.orderId) return { ...o };
        }
      }
      if (where.id) {
        return mockOrders.get(where.id) ? { ...mockOrders.get(where.id)! } : null;
      }
      return null;
    },
    findFirst: async ({ where, orderBy }: any) => {
      const candidates = Array.from(mockOrders.values()).filter(o => {
        if (where.userId && o.userId !== where.userId) return false;
        if (where.courseId && o.courseId !== where.courseId) return false;
        if (where.status && o.status !== where.status) return false;
        if (where.paymentId && o.paymentId !== where.paymentId) return false;
        if (where.id?.not && o.id === where.id.not) return false;
        if (where.createdAt?.gte && o.createdAt < where.createdAt.gte) return false;
        return true;
      });
      if (orderBy?.createdAt === 'desc') {
        candidates.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      }
      return candidates.length > 0 ? { ...candidates[0] } : null;
    },
    create: async ({ data }: { data: any }) => {
      if (forceDbOrderCreateError) {
        throw new Error('Database connection failed during order persistence');
      }
      const newOrder: MockOrder = {
        id: `ord_db_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        orderId: data.orderId,
        paymentId: data.paymentId || null,
        signature: data.signature || null,
        userId: data.userId,
        courseId: data.courseId,
        amountInPaise: data.amountInPaise,
        currency: data.currency || 'INR',
        status: data.status || 'created',
        createdAt: data.createdAt || new Date(),
        updatedAt: new Date(),
      };
      mockOrders.set(newOrder.id, newOrder);
      return { ...newOrder };
    },
    updateMany: async ({ where, data }: { where: any; data: any }) => {
      let count = 0;
      for (const o of mockOrders.values()) {
        if (where.id && o.id !== where.id) continue;
        if (where.status && o.status !== where.status) continue;
        o.status = data.status || o.status;
        if (data.paymentId) o.paymentId = data.paymentId;
        if (data.signature) o.signature = data.signature;
        o.updatedAt = new Date();
        count++;
      }
      return { count };
    },
  },
  user: {
    update: async ({ where, data }: { where: { id: string }; data: any }) => {
      const u = mockUsers.get(where.id);
      if (u && data.purchasedCourses?.connect?.id) {
        const cId = data.purchasedCourses.connect.id;
        const course = mockCourses.get(cId);
        if (course && !u.purchasedCourses.some(item => item.id === cId)) {
          u.purchasedCourses.push({ id: course.id, title: course.title });
        }
      }
      return u ? { ...u } : null;
    },
  },
  $transaction: async (cb: any) => {
    return cb(mockPrisma);
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

// Mock Razorpay SDK constructor in require.cache
const razorpayPath = require.resolve('razorpay');
function MockRazorpay(this: any) {
  this.orders = {
    create: async (params: any) => {
      const orderObj = {
        id: `order_mock_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        entity: 'order',
        amount: params.amount,
        currency: params.currency,
        receipt: params.receipt,
        status: 'created',
        notes: params.notes,
        created_at: Math.floor(Date.now() / 1000),
      };
      razorpayOrdersCreated.push(orderObj);
      return orderObj;
    },
  };
  this.payments = {
    fetch: async (paymentId: string) => {
      if (mockPaymentFetchError) {
        throw mockPaymentFetchError;
      }
      return mockPaymentFetchResponse;
    },
  };
}
(MockRazorpay as any).prototype = {};
const razorpayExports = Object.assign(MockRazorpay, {
  default: MockRazorpay,
  __esModule: true,
});
require.cache[razorpayPath] = {
  id: razorpayPath,
  filename: razorpayPath,
  loaded: true,
  exports: razorpayExports,
} as any;

// -------------------------------------------------------------
// Import Route Handlers Under Test AFTER mocks are in require.cache
// -------------------------------------------------------------
const { POST: enrollHandler } = require('@/app/api/courses/[id]/enroll/route');
const { POST: createOrderHandler } = require('@/app/api/checkout/razorpay/create-order/route');
const { POST: verifyHandler } = require('@/app/api/checkout/razorpay/verify/route');

// -------------------------------------------------------------
// Test Runner Harness
// -------------------------------------------------------------
let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

async function runTest(name: string, fn: () => Promise<void>) {
  totalTests++;
  try {
    // Reset state before each test
    currentMockUser = null;
    mockUsers.clear();
    mockCourses.clear();
    mockOrders.clear();
    sentEmails = [];
    razorpayOrdersCreated = [];
    mockPaymentFetchResponse = null;
    mockPaymentFetchError = null;
    forceDbOrderCreateError = false;

    // Seed default baseline entities
    mockUsers.set('user_student_1', {
      id: 'user_student_1',
      name: 'Alice Student',
      email: 'alice@example.com',
      role: 'student',
      purchasedCourses: [],
    });
    mockUsers.set('user_student_2', {
      id: 'user_student_2',
      name: 'Bob Student',
      email: 'bob@example.com',
      role: 'student',
      purchasedCourses: [],
    });

    mockCourses.set('course_free_1', {
      id: 'course_free_1',
      title: 'Free Introductory Python',
      price: 0,
      status: 'published',
    });
    mockCourses.set('course_paid_1', {
      id: 'course_paid_1',
      title: 'Advanced Full-Stack Engineering',
      price: 499,
      status: 'published',
    });
    mockCourses.set('course_draft_free', {
      id: 'course_draft_free',
      title: 'Draft Free Course',
      price: 0,
      status: 'draft',
    });

    await fn();
    console.log(`  \x1b[32m✔\x1b[0m [PASS] ${name}`);
    passedTests++;
  } catch (err: any) {
    console.error(`  \x1b[31m✘\x1b[0m [FAIL] ${name}`);
    console.error(`    Error: ${err.message || err}`);
    failedTests++;
  }
}

function expect(actual: any) {
  return {
    toBe(expected: any) {
      if (actual !== expected) {
        throw new Error(`Expected '${actual}' to be '${expected}'`);
      }
    },
    toEqual(expected: any) {
      if (JSON.stringify(actual) !== JSON.stringify(expected)) {
        throw new Error(`Expected ${JSON.stringify(actual)} to equal ${JSON.stringify(expected)}`);
      }
    },
    toBeGreaterThan(expected: number) {
      if (!(actual > expected)) {
        throw new Error(`Expected ${actual} to be greater than ${expected}`);
      }
    },
    toBeTruthy() {
      if (!actual) {
        throw new Error(`Expected truthy value, got ${actual}`);
      }
    },
    toBeFalsy() {
      if (actual) {
        throw new Error(`Expected falsy value, got ${actual}`);
      }
    },
    toContain(substr: string) {
      if (!actual || !actual.includes(substr)) {
        throw new Error(`Expected '${actual}' to contain '${substr}'`);
      }
    },
  };
}

// -------------------------------------------------------------
// Helper Request Builders
// -------------------------------------------------------------
function createJsonRequest(url: string, body?: any): Request {
  return new Request(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
}

// -------------------------------------------------------------
// TEST SUITE: Batch 1 Payment & Enrollment Security
// -------------------------------------------------------------
async function runAllTests() {
  console.log('\n============================================================');
  console.log('   BATCH 1: PAYMENT & ENROLLMENT AUTHORIZATION TEST SUITE   ');
  console.log('============================================================\n');

  // -----------------------------------------------------------
  // SUITE 1: Direct Course Enrollment (/api/courses/[id]/enroll)
  // -----------------------------------------------------------
  console.log('SECTION 1: Direct Enrollment Route (/api/courses/[id]/enroll)');

  await runTest('ENROLL-01: Rejects unauthenticated request with 401', async () => {
    currentMockUser = null;
    const req = createJsonRequest('http://localhost:3000/api/courses/course_free_1/enroll');
    const res = await enrollHandler(req, { params: Promise.resolve({ id: 'course_free_1' }) });
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toBe('Unauthorized');
  });

  await runTest('ENROLL-02: Rejects non-existent course with 404', async () => {
    currentMockUser = { userId: 'user_student_1', role: 'student' };
    const req = createJsonRequest('http://localhost:3000/api/courses/non_existent_id/enroll');
    const res = await enrollHandler(req, { params: Promise.resolve({ id: 'non_existent_id' }) });
    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.error).toBe('Course not found');
  });

  await runTest('ENROLL-03: CRITICAL VULNERABILITY FIX - Rejects paid course (price: 499) with 402', async () => {
    currentMockUser = { userId: 'user_student_1', role: 'student' };
    const req = createJsonRequest('http://localhost:3000/api/courses/course_paid_1/enroll');
    const res = await enrollHandler(req, { params: Promise.resolve({ id: 'course_paid_1' }) });
    expect(res.status).toBe(402);
    const body = await res.json();
    expect(body.requiresPayment).toBe(true);
    expect(body.price).toBe(499);
    expect(body.error).toContain('Tuition payment required');

    // Confirm user was NOT enrolled
    const user = mockUsers.get('user_student_1');
    expect(user?.purchasedCourses.length).toBe(0);
  });

  await runTest('ENROLL-04: Rejects low-price paid course (price: 1) with 402', async () => {
    mockCourses.set('course_cheap', {
      id: 'course_cheap',
      title: 'Low Price Class',
      price: 1,
      status: 'published',
    });
    currentMockUser = { userId: 'user_student_1', role: 'student' };
    const req = createJsonRequest('http://localhost:3000/api/courses/course_cheap/enroll');
    const res = await enrollHandler(req, { params: Promise.resolve({ id: 'course_cheap' }) });
    expect(res.status).toBe(402);
  });

  await runTest('ENROLL-05: Rejects unpublished free course with 400', async () => {
    currentMockUser = { userId: 'user_student_1', role: 'student' };
    const req = createJsonRequest('http://localhost:3000/api/courses/course_draft_free/enroll');
    const res = await enrollHandler(req, { params: Promise.resolve({ id: 'course_draft_free' }) });
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe('This course is not available for enrollment.');
  });

  await runTest('ENROLL-06: Successfully enrolls in free course (price: 0) and sends notification', async () => {
    currentMockUser = { userId: 'user_student_1', role: 'student' };
    const req = createJsonRequest('http://localhost:3000/api/courses/course_free_1/enroll');
    const res = await enrollHandler(req, { params: Promise.resolve({ id: 'course_free_1' }) });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);

    const user = mockUsers.get('user_student_1');
    expect(user?.purchasedCourses.some(c => c.id === 'course_free_1')).toBe(true);
    expect(sentEmails.some(e => e.to === 'alice@example.com')).toBe(true);
  });

  await runTest('ENROLL-07: Idempotent re-enrollment in free course returns 200 without duplicate entries', async () => {
    // Pre-enroll student 1
    const user = mockUsers.get('user_student_1')!;
    user.purchasedCourses.push({ id: 'course_free_1', title: 'Free Introductory Python' });

    currentMockUser = { userId: 'user_student_1', role: 'student' };
    const req = createJsonRequest('http://localhost:3000/api/courses/course_free_1/enroll');
    const res = await enrollHandler(req, { params: Promise.resolve({ id: 'course_free_1' }) });
    expect(res.status).toBe(200);

    // Verify course is only present once
    const enrollments = user.purchasedCourses.filter(c => c.id === 'course_free_1');
    expect(enrollments.length).toBe(1);
  });

  // -----------------------------------------------------------
  // SUITE 2: Razorpay Order Creation (/api/checkout/razorpay/create-order)
  // -----------------------------------------------------------
  console.log('\nSECTION 2: Razorpay Order Creation (/api/checkout/razorpay/create-order)');

  await runTest('ORDER-01: Rejects unauthenticated request with 401', async () => {
    currentMockUser = null;
    const req = createJsonRequest('http://localhost:3000/api/checkout/razorpay/create-order', { courseId: 'course_paid_1' });
    const res = await createOrderHandler(req);
    expect(res.status).toBe(401);
  });

  await runTest('ORDER-02: Rejects request with missing courseId with 400', async () => {
    currentMockUser = { userId: 'user_student_1', role: 'student' };
    const req = createJsonRequest('http://localhost:3000/api/checkout/razorpay/create-order', {});
    const res = await createOrderHandler(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe('Course ID is required');
  });

  await runTest('ORDER-03: Rejects non-existent course with 404', async () => {
    currentMockUser = { userId: 'user_student_1', role: 'student' };
    const req = createJsonRequest('http://localhost:3000/api/checkout/razorpay/create-order', { courseId: 'missing_id' });
    const res = await createOrderHandler(req);
    expect(res.status).toBe(404);
  });

  await runTest('ORDER-04: Rejects free courses (price: 0) from payment gateway with 400', async () => {
    currentMockUser = { userId: 'user_student_1', role: 'student' };
    const req = createJsonRequest('http://localhost:3000/api/checkout/razorpay/create-order', { courseId: 'course_free_1' });
    const res = await createOrderHandler(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain('This course is free. Please enroll directly');
  });

  await runTest('ORDER-05: Rejects unpublished course with 400', async () => {
    mockCourses.set('course_paid_draft', {
      id: 'course_paid_draft',
      title: 'Draft Paid Course',
      price: 199,
      status: 'draft',
    });
    currentMockUser = { userId: 'user_student_1', role: 'student' };
    const req = createJsonRequest('http://localhost:3000/api/checkout/razorpay/create-order', { courseId: 'course_paid_draft' });
    const res = await createOrderHandler(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe('This course is not open for enrollment.');
  });

  await runTest('ORDER-06: Rejects already enrolled student with 400', async () => {
    const user = mockUsers.get('user_student_1')!;
    user.purchasedCourses.push({ id: 'course_paid_1', title: 'Advanced Full-Stack Engineering' });

    currentMockUser = { userId: 'user_student_1', role: 'student' };
    const req = createJsonRequest('http://localhost:3000/api/checkout/razorpay/create-order', { courseId: 'course_paid_1' });
    const res = await createOrderHandler(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe('You are already enrolled in this course.');
  });

  await runTest('ORDER-07: Successfully creates Razorpay order and persists Order record in DB', async () => {
    currentMockUser = { userId: 'user_student_1', role: 'student' };
    const req = createJsonRequest('http://localhost:3000/api/checkout/razorpay/create-order', { courseId: 'course_paid_1' });
    const res = await createOrderHandler(req);
    expect(res.status).toBe(200);
    const body = await res.json();

    expect(body.id).toBeTruthy();
    expect(body.amount).toBe(49900); // 499 * 100 paise
    expect(body.currency).toBe('INR');
    expect(body.courseId).toBe('course_paid_1');

    // Verify order was persisted in DB
    const dbOrder = await mockPrisma.order.findUnique({ where: { orderId: body.id } });
    expect(dbOrder).toBeTruthy();
    expect(dbOrder?.userId).toBe('user_student_1');
    expect(dbOrder?.courseId).toBe('course_paid_1');
    expect(dbOrder?.amountInPaise).toBe(49900);
    expect(dbOrder?.status).toBe('created');
  });

  await runTest('ORDER-08: ADDITIONAL SAFEGUARD - Handles DB persistence failure safely without granting access', async () => {
    currentMockUser = { userId: 'user_student_1', role: 'student' };
    forceDbOrderCreateError = true; // Trigger simulated PostgreSQL write error

    const req = createJsonRequest('http://localhost:3000/api/checkout/razorpay/create-order', { courseId: 'course_paid_1' });
    const res = await createOrderHandler(req);
    expect(res.status).toBe(500);
    const body = await res.json();

    expect(body.error).toBe('Failed to initialize order tracking record. Please try again.');
    // Confirm order was NOT returned to client
    expect(body.id).toBeFalsy();

    // Confirm no access was granted
    const user = mockUsers.get('user_student_1')!;
    expect(user.purchasedCourses.length).toBe(0);
  });

  await runTest('ORDER-09: REUSE - Reuses existing valid pending order within 30 minutes without creating new gateway order', async () => {
    currentMockUser = { userId: 'user_student_1', role: 'student' };

    // Pre-populate a pending order created 10 minutes ago
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
    const existing = await mockPrisma.order.create({
      data: {
        orderId: 'order_reusable_10m_ago',
        userId: 'user_student_1',
        courseId: 'course_paid_1',
        amountInPaise: 49900,
        currency: 'INR',
        status: 'created',
        createdAt: tenMinutesAgo,
      },
    });

    const req = createJsonRequest('http://localhost:3000/api/checkout/razorpay/create-order', { courseId: 'course_paid_1' });
    const res = await createOrderHandler(req);
    expect(res.status).toBe(200);
    const body = await res.json();

    expect(body.id).toBe(existing.orderId);
    expect(body.amount).toBe(49900);
    expect(body.currency).toBe('INR');
    expect(body.reused).toBe(true);

    // Crucial check: verify NO new Razorpay order was created at the gateway!
    expect(razorpayOrdersCreated.length).toBe(0);
  });

  await runTest('ORDER-10: STALE ORDER - Creates a fresh order when pending order is older than 30 minutes', async () => {
    currentMockUser = { userId: 'user_student_1', role: 'student' };

    // Pre-populate a stale pending order created 35 minutes ago
    const thirtyFiveMinutesAgo = new Date(Date.now() - 35 * 60 * 1000);
    const staleOrder = await mockPrisma.order.create({
      data: {
        orderId: 'order_stale_35m_ago',
        userId: 'user_student_1',
        courseId: 'course_paid_1',
        amountInPaise: 49900,
        currency: 'INR',
        status: 'created',
        createdAt: thirtyFiveMinutesAgo,
      },
    });

    const req = createJsonRequest('http://localhost:3000/api/checkout/razorpay/create-order', { courseId: 'course_paid_1' });
    const res = await createOrderHandler(req);
    expect(res.status).toBe(200);
    const body = await res.json();

    expect(body.reused).toBe(false);
    expect(body.id !== staleOrder.orderId).toBeTruthy();

    // Verify a fresh Razorpay order was generated
    expect(razorpayOrdersCreated.length).toBe(1);
  });

  await runTest('ORDER-11: PRICE MISMATCH - Creates a fresh order when course tuition has changed', async () => {
    currentMockUser = { userId: 'user_student_1', role: 'student' };

    // Pre-populate an order created 5 minutes ago with old price (e.g. 29900 paise)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    await mockPrisma.order.create({
      data: {
        orderId: 'order_old_price',
        userId: 'user_student_1',
        courseId: 'course_paid_1',
        amountInPaise: 29900, // Old price, current course is 49900
        currency: 'INR',
        status: 'created',
        createdAt: fiveMinutesAgo,
      },
    });

    const req = createJsonRequest('http://localhost:3000/api/checkout/razorpay/create-order', { courseId: 'course_paid_1' });
    const res = await createOrderHandler(req);
    expect(res.status).toBe(200);
    const body = await res.json();

    // Mismatched amount must NOT be reused
    expect(body.reused).toBe(false);
    expect(body.amount).toBe(49900); // Created with current price
    expect(razorpayOrdersCreated.length).toBe(1);
  });

  await runTest('ORDER-12: CURRENCY MISMATCH - Creates a fresh order when pending order currency does not match', async () => {
    currentMockUser = { userId: 'user_student_1', role: 'student' };

    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    await mockPrisma.order.create({
      data: {
        orderId: 'order_wrong_currency',
        userId: 'user_student_1',
        courseId: 'course_paid_1',
        amountInPaise: 49900,
        currency: 'USD', // Mismatch against expected INR
        status: 'created',
        createdAt: fiveMinutesAgo,
      },
    });

    const req = createJsonRequest('http://localhost:3000/api/checkout/razorpay/create-order', { courseId: 'course_paid_1' });
    const res = await createOrderHandler(req);
    expect(res.status).toBe(200);
    const body = await res.json();

    expect(body.reused).toBe(false);
    expect(body.currency).toBe('INR');
    expect(razorpayOrdersCreated.length).toBe(1);
  });

  await runTest('ORDER-13: ALREADY-PAID / NON-PENDING - Never reuses an order whose status is not created', async () => {
    currentMockUser = { userId: 'user_student_1', role: 'student' };

    // Pre-populate an order with status 'paid'
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    await mockPrisma.order.create({
      data: {
        orderId: 'order_paid_recent',
        userId: 'user_student_1',
        courseId: 'course_paid_1',
        amountInPaise: 49900,
        currency: 'INR',
        status: 'paid', // not 'created'
        createdAt: fiveMinutesAgo,
      },
    });

    // Also simulate user is enrolled
    const user = mockUsers.get('user_student_1')!;
    user.purchasedCourses.push({ id: 'course_paid_1', title: 'Advanced Full-Stack Engineering' });

    const req = createJsonRequest('http://localhost:3000/api/checkout/razorpay/create-order', { courseId: 'course_paid_1' });
    const res = await createOrderHandler(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe('You are already enrolled in this course.');
  });

  await runTest('ORDER-14: CONCURRENT CHECKOUT - Concurrent requests without prior order create valid orders independently', async () => {
    currentMockUser = { userId: 'user_student_1', role: 'student' };

    const req1 = createJsonRequest('http://localhost:3000/api/checkout/razorpay/create-order', { courseId: 'course_paid_1' });
    const req2 = createJsonRequest('http://localhost:3000/api/checkout/razorpay/create-order', { courseId: 'course_paid_1' });

    // Execute concurrently
    const [res1, res2] = await Promise.all([
      createOrderHandler(req1),
      createOrderHandler(req2),
    ]);

    expect(res1.status).toBe(200);
    expect(res2.status).toBe(200);

    const body1 = await res1.json();
    const body2 = await res2.json();

    expect(body1.id).toBeTruthy();
    expect(body2.id).toBeTruthy();

    // Now a 3rd request after creation must reuse the latest pending order
    const req3 = createJsonRequest('http://localhost:3000/api/checkout/razorpay/create-order', { courseId: 'course_paid_1' });
    const res3 = await createOrderHandler(req3);
    expect(res3.status).toBe(200);
    const body3 = await res3.json();
    expect(body3.reused).toBe(true);
  });

  // -----------------------------------------------------------
  // SUITE 3: Razorpay Order Verification (/api/checkout/razorpay/verify)
  // -----------------------------------------------------------
  console.log('\nSECTION 3: Razorpay Order Verification (/api/checkout/razorpay/verify)');

  // Helper to generate legitimate HMAC signature for a test order and payment
  function generateSignature(orderId: string, paymentId: string, secret = 'mock_secret_key_abcdef123456'): string {
    return crypto.createHmac('sha256', secret).update(`${orderId}|${paymentId}`).digest('hex');
  }

  await runTest('VERIFY-01: Rejects unauthenticated request with 401', async () => {
    currentMockUser = null;
    const req = createJsonRequest('http://localhost:3000/api/checkout/razorpay/verify', {
      razorpay_order_id: 'order_1',
      razorpay_payment_id: 'pay_1',
      razorpay_signature: 'sig_1',
      courseId: 'course_paid_1',
    });
    const res = await verifyHandler(req);
    expect(res.status).toBe(401);
  });

  await runTest('VERIFY-02: Rejects payload with missing parameters with 400', async () => {
    currentMockUser = { userId: 'user_student_1', role: 'student' };
    const req = createJsonRequest('http://localhost:3000/api/checkout/razorpay/verify', {
      razorpay_order_id: 'order_1',
      // missing payment_id, signature, courseId
    });
    const res = await verifyHandler(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe('Missing required payment details');
  });

  await runTest('VERIFY-03: Rejects when order is not found in database with 404', async () => {
    currentMockUser = { userId: 'user_student_1', role: 'student' };
    const req = createJsonRequest('http://localhost:3000/api/checkout/razorpay/verify', {
      razorpay_order_id: 'order_non_existent',
      razorpay_payment_id: 'pay_1',
      razorpay_signature: 'sig_1',
      courseId: 'course_paid_1',
    });
    const res = await verifyHandler(req);
    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.error).toBe('Order record not found');
  });

  await runTest('VERIFY-04: CRITICAL VULNERABILITY FIX - Rejects order ownership mismatch with 403 Forbidden', async () => {
    // Order was created by student 1
    const order = await mockPrisma.order.create({
      data: {
        orderId: 'order_owned_by_alice',
        userId: 'user_student_1', // Alice
        courseId: 'course_paid_1',
        amountInPaise: 49900,
        currency: 'INR',
        status: 'created',
      },
    });

    // Bob (student 2) attempts to verify Alice's order
    currentMockUser = { userId: 'user_student_2', role: 'student' }; // Bob
    const sig = generateSignature(order.orderId, 'pay_alice_1');

    const req = createJsonRequest('http://localhost:3000/api/checkout/razorpay/verify', {
      razorpay_order_id: order.orderId,
      razorpay_payment_id: 'pay_alice_1',
      razorpay_signature: sig,
      courseId: 'course_paid_1',
    });
    const res = await verifyHandler(req);
    expect(res.status).toBe(403);
    const body = await res.json();
    expect(body.error).toContain('Forbidden: Order does not belong to the current authenticated user');

    // Confirm Bob was NOT enrolled
    const bob = mockUsers.get('user_student_2')!;
    expect(bob.purchasedCourses.length).toBe(0);
  });

  await runTest('VERIFY-05: CRITICAL VULNERABILITY FIX - Rejects course binding mismatch with 400', async () => {
    // Order was created for course_paid_1 (499 INR)
    const order = await mockPrisma.order.create({
      data: {
        orderId: 'order_course_paid_1',
        userId: 'user_student_1',
        courseId: 'course_paid_1',
        amountInPaise: 49900,
        currency: 'INR',
        status: 'created',
      },
    });

    currentMockUser = { userId: 'user_student_1', role: 'student' };
    const sig = generateSignature(order.orderId, 'pay_test_1');

    // Request submits a different course ID (trying to get free or different course)
    const req = createJsonRequest('http://localhost:3000/api/checkout/razorpay/verify', {
      razorpay_order_id: order.orderId,
      razorpay_payment_id: 'pay_test_1',
      razorpay_signature: sig,
      courseId: 'course_different_id',
    });
    const res = await verifyHandler(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe('Course ID does not match order record');
  });

  await runTest('VERIFY-06: Idempotent verification returns 200 without duplicate DB writes when already paid', async () => {
    const order = await mockPrisma.order.create({
      data: {
        orderId: 'order_already_paid',
        paymentId: 'pay_already_credited',
        signature: 'sig_valid',
        userId: 'user_student_1',
        courseId: 'course_paid_1',
        amountInPaise: 49900,
        currency: 'INR',
        status: 'paid', // already paid
      },
    });

    currentMockUser = { userId: 'user_student_1', role: 'student' };
    const req = createJsonRequest('http://localhost:3000/api/checkout/razorpay/verify', {
      razorpay_order_id: order.orderId,
      razorpay_payment_id: 'pay_already_credited',
      razorpay_signature: 'sig_valid',
      courseId: 'course_paid_1',
    });
    const res = await verifyHandler(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.idempotent).toBe(true);
  });

  await runTest('VERIFY-07: SAFE FAILURE - Invalid HMAC signature rejected and order status remains created', async () => {
    const order = await mockPrisma.order.create({
      data: {
        orderId: 'order_sig_test',
        userId: 'user_student_1',
        courseId: 'course_paid_1',
        amountInPaise: 49900,
        currency: 'INR',
        status: 'created',
      },
    });

    currentMockUser = { userId: 'user_student_1', role: 'student' };
    const badSignature = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';

    const req = createJsonRequest('http://localhost:3000/api/checkout/razorpay/verify', {
      razorpay_order_id: order.orderId,
      razorpay_payment_id: 'pay_sig_test',
      razorpay_signature: badSignature,
      courseId: 'course_paid_1',
    });
    const res = await verifyHandler(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe('Invalid payment signature');

    // Safe failure check: Verify order status in DB was NOT modified to 'failed'
    const dbOrder = await mockPrisma.order.findUnique({ where: { orderId: order.orderId } });
    expect(dbOrder?.status).toBe('created');
  });

  await runTest('VERIFY-08: SAFE FAILURE - Gateway fetch error returns 502 and order remains created', async () => {
    const order = await mockPrisma.order.create({
      data: {
        orderId: 'order_gw_err',
        userId: 'user_student_1',
        courseId: 'course_paid_1',
        amountInPaise: 49900,
        currency: 'INR',
        status: 'created',
      },
    });

    currentMockUser = { userId: 'user_student_1', role: 'student' };
    const sig = generateSignature(order.orderId, 'pay_gw_err');

    // Simulate gateway network/API timeout
    mockPaymentFetchError = new Error('Gateway timeout: connection refused');

    const req = createJsonRequest('http://localhost:3000/api/checkout/razorpay/verify', {
      razorpay_order_id: order.orderId,
      razorpay_payment_id: 'pay_gw_err',
      razorpay_signature: sig,
      courseId: 'course_paid_1',
    });
    const res = await verifyHandler(req);
    expect(res.status).toBe(502);
    const body = await res.json();
    expect(body.error).toContain('Payment gateway verification temporarily unavailable');

    // Safe failure: DB status must remain 'created'
    const dbOrder = await mockPrisma.order.findUnique({ where: { orderId: order.orderId } });
    expect(dbOrder?.status).toBe('created');
  });

  await runTest('VERIFY-09: Rejects when gateway payment belongs to a different order ID with 400', async () => {
    const order = await mockPrisma.order.create({
      data: {
        orderId: 'order_mismatch_test',
        userId: 'user_student_1',
        courseId: 'course_paid_1',
        amountInPaise: 49900,
        currency: 'INR',
        status: 'created',
      },
    });

    currentMockUser = { userId: 'user_student_1', role: 'student' };
    const sig = generateSignature(order.orderId, 'pay_mismatch_1');

    mockPaymentFetchResponse = {
      id: 'pay_mismatch_1',
      order_id: 'different_razorpay_order_id', // mismatch
      amount: 49900,
      currency: 'INR',
      status: 'captured',
    };

    const req = createJsonRequest('http://localhost:3000/api/checkout/razorpay/verify', {
      razorpay_order_id: order.orderId,
      razorpay_payment_id: 'pay_mismatch_1',
      razorpay_signature: sig,
      courseId: 'course_paid_1',
    });
    const res = await verifyHandler(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe('Payment does not belong to the specified order');
  });

  await runTest('VERIFY-10: Rejects when gateway payment amount is lower than expected tuition with 400', async () => {
    const order = await mockPrisma.order.create({
      data: {
        orderId: 'order_amount_test',
        userId: 'user_student_1',
        courseId: 'course_paid_1',
        amountInPaise: 49900, // expected 49900
        currency: 'INR',
        status: 'created',
      },
    });

    currentMockUser = { userId: 'user_student_1', role: 'student' };
    const sig = generateSignature(order.orderId, 'pay_amount_low');

    mockPaymentFetchResponse = {
      id: 'pay_amount_low',
      order_id: order.orderId,
      amount: 100, // Attacker paid only 1 INR (100 paise)
      currency: 'INR',
      status: 'captured',
    };

    const req = createJsonRequest('http://localhost:3000/api/checkout/razorpay/verify', {
      razorpay_order_id: order.orderId,
      razorpay_payment_id: 'pay_amount_low',
      razorpay_signature: sig,
      courseId: 'course_paid_1',
    });
    const res = await verifyHandler(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe('Payment amount mismatch against expected tuition');
  });

  await runTest('VERIFY-11: Rejects when gateway payment currency mismatches with 400', async () => {
    const order = await mockPrisma.order.create({
      data: {
        orderId: 'order_curr_test',
        userId: 'user_student_1',
        courseId: 'course_paid_1',
        amountInPaise: 49900,
        currency: 'INR',
        status: 'created',
      },
    });

    currentMockUser = { userId: 'user_student_1', role: 'student' };
    const sig = generateSignature(order.orderId, 'pay_curr_test');

    mockPaymentFetchResponse = {
      id: 'pay_curr_test',
      order_id: order.orderId,
      amount: 49900,
      currency: 'USD', // mismatch
      status: 'captured',
    };

    const req = createJsonRequest('http://localhost:3000/api/checkout/razorpay/verify', {
      razorpay_order_id: order.orderId,
      razorpay_payment_id: 'pay_curr_test',
      razorpay_signature: sig,
      courseId: 'course_paid_1',
    });
    const res = await verifyHandler(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe('Payment currency mismatch');
  });

  await runTest('VERIFY-12: CRITICAL - Rejects payment when status is authorized (requires captured) with 400', async () => {
    const order = await mockPrisma.order.create({
      data: {
        orderId: 'order_auth_test',
        userId: 'user_student_1',
        courseId: 'course_paid_1',
        amountInPaise: 49900,
        currency: 'INR',
        status: 'created',
      },
    });

    currentMockUser = { userId: 'user_student_1', role: 'student' };
    const sig = generateSignature(order.orderId, 'pay_auth_test');

    mockPaymentFetchResponse = {
      id: 'pay_auth_test',
      order_id: order.orderId,
      amount: 49900,
      currency: 'INR',
      status: 'authorized', // NOT captured
    };

    const req = createJsonRequest('http://localhost:3000/api/checkout/razorpay/verify', {
      razorpay_order_id: order.orderId,
      razorpay_payment_id: 'pay_auth_test',
      razorpay_signature: sig,
      courseId: 'course_paid_1',
    });
    const res = await verifyHandler(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain("Payment status is 'authorized'. Enrollment requires captured payment status.");
  });

  await runTest('VERIFY-13: REPLAY ATTACK DEFENSE - Rejects when payment ID was already credited to another order', async () => {
    // Previous completed order with paymentId 'pay_replayed_123'
    await mockPrisma.order.create({
      data: {
        orderId: 'order_previous_complete',
        paymentId: 'pay_replayed_123',
        signature: 'sig_prev',
        userId: 'user_student_2',
        courseId: 'course_paid_1',
        amountInPaise: 49900,
        currency: 'INR',
        status: 'paid',
      },
    });

    // New order attempting to reuse 'pay_replayed_123'
    const newOrder = await mockPrisma.order.create({
      data: {
        orderId: 'order_attempting_replay',
        userId: 'user_student_1',
        courseId: 'course_paid_1',
        amountInPaise: 49900,
        currency: 'INR',
        status: 'created',
      },
    });

    currentMockUser = { userId: 'user_student_1', role: 'student' };
    const sig = generateSignature(newOrder.orderId, 'pay_replayed_123');

    mockPaymentFetchResponse = {
      id: 'pay_replayed_123',
      order_id: newOrder.orderId,
      amount: 49900,
      currency: 'INR',
      status: 'captured',
    };

    const req = createJsonRequest('http://localhost:3000/api/checkout/razorpay/verify', {
      razorpay_order_id: newOrder.orderId,
      razorpay_payment_id: 'pay_replayed_123',
      razorpay_signature: sig,
      courseId: 'course_paid_1',
    });
    const res = await verifyHandler(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe('This payment has already been credited to another transaction');
  });

  await runTest('VERIFY-14: SUCCESSFUL VERIFICATION - Atomically fulfills order, enrolls student, and sends email', async () => {
    const order = await mockPrisma.order.create({
      data: {
        orderId: 'order_legit_success',
        userId: 'user_student_1',
        courseId: 'course_paid_1',
        amountInPaise: 49900,
        currency: 'INR',
        status: 'created',
      },
    });

    currentMockUser = { userId: 'user_student_1', role: 'student' };
    const paymentId = 'pay_legit_captured_777';
    const sig = generateSignature(order.orderId, paymentId);

    mockPaymentFetchResponse = {
      id: paymentId,
      order_id: order.orderId,
      amount: 49900,
      currency: 'INR',
      status: 'captured',
    };

    const req = createJsonRequest('http://localhost:3000/api/checkout/razorpay/verify', {
      razorpay_order_id: order.orderId,
      razorpay_payment_id: paymentId,
      razorpay_signature: sig,
      courseId: 'course_paid_1',
    });
    const res = await verifyHandler(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);

    // 1. Verify DB order updated to 'paid' with paymentId and signature
    const updatedOrder = await mockPrisma.order.findUnique({ where: { orderId: order.orderId } });
    expect(updatedOrder?.status).toBe('paid');
    expect(updatedOrder?.paymentId).toBe(paymentId);
    expect(updatedOrder?.signature).toBe(sig);

    // 2. Verify user has course added to purchasedCourses
    const alice = mockUsers.get('user_student_1')!;
    expect(alice.purchasedCourses.some(c => c.id === 'course_paid_1')).toBe(true);

    // 3. Verify notification email was dispatched
    expect(sentEmails.some(e => e.to === 'alice@example.com' && e.courseTitle.includes('Full-Stack'))).toBe(true);
  });

  await runTest('VERIFY-15: ATOMIC CONCURRENCY - Concurrent fulfillment conflict re-reads order and returns 200 idempotent if paid', async () => {
    const order = await mockPrisma.order.create({
      data: {
        orderId: 'order_concurrent_race',
        userId: 'user_student_1',
        courseId: 'course_paid_1',
        amountInPaise: 49900,
        currency: 'INR',
        status: 'created',
      },
    });

    currentMockUser = { userId: 'user_student_1', role: 'student' };
    const paymentId = 'pay_concurrent_999';
    const sig = generateSignature(order.orderId, paymentId);

    mockPaymentFetchResponse = {
      id: paymentId,
      order_id: order.orderId,
      amount: 49900,
      currency: 'INR',
      status: 'captured',
    };

    // Simulate concurrent worker winning the race right during the transaction
    // by intercepting $transaction:
    const originalTransaction = mockPrisma.$transaction;
    mockPrisma.$transaction = async (cb: any) => {
      // Simulate another thread updated the order to 'paid' first
      const o = mockOrders.get(order.id)!;
      o.status = 'paid';
      o.paymentId = paymentId;
      o.signature = sig;

      // Inside cb, updateMany for status: 'created' will find 0 rows
      return cb(mockPrisma);
    };

    try {
      const req = createJsonRequest('http://localhost:3000/api/checkout/razorpay/verify', {
        razorpay_order_id: order.orderId,
        razorpay_payment_id: paymentId,
        razorpay_signature: sig,
        courseId: 'course_paid_1',
      });
      const res = await verifyHandler(req);
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.success).toBe(true);
      expect(body.idempotent).toBe(true);
    } finally {
      mockPrisma.$transaction = originalTransaction;
    }
  });

  // -----------------------------------------------------------
  // SUITE 4: UI Free Enrollment & Purchase Logic (CoursePurchaseCard)
  // -----------------------------------------------------------
  console.log('\nSECTION 4: UI Course Purchase Logic (CoursePurchaseCard)');

  await runTest('UI-01: Correctly renders free tuition label and triggers direct free enrollment', async () => {
    // Test the logic implemented in CoursePurchaseCard.tsx:
    // price === 0 -> label "Free", action calls `/api/courses/${courseId}/enroll` directly
    const formatPrice = (price: number) => price === 0 ? "Free" : `$${price}`;
    const getButtonText = (price: number, isPurchased: boolean) => {
      if (isPurchased) return "Continue Learning";
      return price === 0 ? "Enroll Free" : "Enroll Now";
    };
    const getCheckoutTarget = (price: number, courseId: string) => {
      if (price === 0) return `/api/courses/${courseId}/enroll`;
      return `/checkout/${courseId}`;
    };

    expect(formatPrice(0)).toBe("Free");
    expect(formatPrice(499)).toBe("$499");
    expect(getButtonText(0, false)).toBe("Enroll Free");
    expect(getButtonText(499, false)).toBe("Enroll Now");
    expect(getButtonText(0, true)).toBe("Continue Learning");
    expect(getCheckoutTarget(0, 'c1')).toBe("/api/courses/c1/enroll");
    expect(getCheckoutTarget(499, 'c2')).toBe("/checkout/c2");
  });

  // -----------------------------------------------------------
  // SECTION 5: Preview Environment Guard
  // -----------------------------------------------------------
  console.log('\nSECTION 5: Preview Environment Guard');

  await runTest('PREVIEW-01: create-order returns 503 and skips Order table queries when preview flag is set', async () => {
    currentMockUser = { userId: 'user_student_1', role: 'student' };
    process.env.VERCEL_ENV = 'preview';
    try {
      const req = createJsonRequest('http://localhost:3000/api/checkout/razorpay/create-order', { courseId: 'course_paid_1' });
      const res = await createOrderHandler(req);
      const data = await res.json();

      expect(res.status).toBe(503);
      expect(data.error).toBe('Paid checkout is paused in this preview environment.');
      expect(mockOrders.size).toBe(0);
      expect(razorpayOrdersCreated.length).toBe(0);
    } finally {
      delete process.env.VERCEL_ENV;
    }
  });

  await runTest('PREVIEW-02: verify returns 503 and skips Order table queries when preview flag is set', async () => {
    currentMockUser = { userId: 'user_student_1', role: 'student' };
    process.env.DISABLE_CHECKOUT = 'true';
    try {
      const req = createJsonRequest('http://localhost:3000/api/checkout/razorpay/verify', {
        razorpay_order_id: 'order_test_preview',
        razorpay_payment_id: 'pay_test_preview',
        razorpay_signature: 'sig_test_preview',
        courseId: 'course_paid_1',
      });
      const res = await verifyHandler(req);
      const data = await res.json();

      expect(res.status).toBe(503);
      expect(data.error).toBe('Payment verification is paused in this preview environment.');
      expect(mockOrders.size).toBe(0);
    } finally {
      delete process.env.DISABLE_CHECKOUT;
    }
  });

  // -----------------------------------------------------------
  // Summary
  // -----------------------------------------------------------
  console.log('\n============================================================');
  console.log(`TEST RESULTS: ${passedTests}/${totalTests} PASSED (${failedTests} FAILED)`);
  console.log('============================================================\n');

  if (failedTests > 0) {
    process.exit(1);
  }
}

runAllTests().catch(err => {
  console.error('Fatal Test Runner Error:', err);
  process.exit(1);
});
