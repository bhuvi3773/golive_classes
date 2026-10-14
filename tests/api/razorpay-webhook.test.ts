import crypto from 'crypto';

// Setup environment variables before any module loads
process.env.RAZORPAY_KEY_ID = 'rzp_test_MockKey123456';
process.env.RAZORPAY_KEY_SECRET = 'mock_secret_key_abcdef123456';
process.env.RAZORPAY_WEBHOOK_SECRET = 'mock_webhook_secret_xyz987654321';
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
  purchasedCourses: { id: string; title: string }[];
}

interface MockCourse {
  id: string;
  title: string;
  price: number;
  status: string;
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

let currentMockUser: { userId: string; role: string; email?: string; name?: string } | null = null;
let mockUsers: Map<string, MockUser> = new Map();
let mockCourses: Map<string, MockCourse> = new Map();
let mockOrders: Map<string, MockOrder> = new Map();
let sentEmails: { to: string; courseTitle: string }[] = [];
let mockPaymentFetchResponse: any = null;

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
    findFirst: async ({ where }: any) => {
      for (const o of mockOrders.values()) {
        if (where.paymentId && o.paymentId !== where.paymentId) continue;
        if (where.id?.not && o.id === where.id.not) continue;
        if (where.status && o.status !== where.status) continue;
        return { ...o };
      }
      return null;
    },
    create: async ({ data }: { data: any }) => {
      const newOrder: MockOrder = {
        id: `ord_${Date.now()}_${Math.random().toString(36).substring(7)}`,
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

// Mock Razorpay SDK constructor
const razorpayPath = require.resolve('razorpay');
function MockRazorpay(this: any) {
  this.payments = {
    fetch: async (paymentId: string) => mockPaymentFetchResponse,
  };
}
(MockRazorpay as any).prototype = {};
require.cache[razorpayPath] = {
  id: razorpayPath,
  filename: razorpayPath,
  loaded: true,
  exports: Object.assign(MockRazorpay, { default: MockRazorpay, __esModule: true }),
} as any;

// -------------------------------------------------------------
// Import Handlers Under Test AFTER mocks
// -------------------------------------------------------------
const { POST: webhookHandler } = require('@/app/api/checkout/razorpay/webhook/route');
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
    currentMockUser = null;
    mockUsers.clear();
    mockCourses.clear();
    mockOrders.clear();
    sentEmails = [];
    mockPaymentFetchResponse = null;

    mockUsers.set('user_alice', {
      id: 'user_alice',
      name: 'Alice Scholar',
      email: 'alice@example.com',
      role: 'student',
      purchasedCourses: [],
    });

    mockCourses.set('course_fullstack', {
      id: 'course_fullstack',
      title: 'Full-Stack Modern Web Engineering',
      price: 499,
      status: 'published',
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
    toBeTruthy() {
      if (!actual) throw new Error(`Expected truthy value, got ${actual}`);
    },
    toBeFalsy() {
      if (actual) throw new Error(`Expected falsy value, got ${actual}`);
    },
    toContain(substr: string) {
      if (!actual || !actual.includes(substr)) {
        throw new Error(`Expected '${actual}' to contain '${substr}'`);
      }
    },
  };
}

// -------------------------------------------------------------
// Helpers
// -------------------------------------------------------------
function computeWebhookSignature(body: string, secret = process.env.RAZORPAY_WEBHOOK_SECRET!): string {
  return crypto.createHmac('sha256', secret).update(body).digest('hex');
}

function createWebhookRequest(bodyStr: string, signature?: string): Request {
  const headers = new Headers();
  headers.set('Content-Type', 'application/json');
  if (signature !== undefined) {
    headers.set('x-razorpay-signature', signature);
  }
  return new Request('http://localhost:3000/api/checkout/razorpay/webhook', {
    method: 'POST',
    headers,
    body: bodyStr,
  });
}

function createCapturedWebhookPayload(orderId: string, paymentId: string, amount = 49900, currency = 'INR') {
  return JSON.stringify({
    entity: 'event',
    account_id: 'acc_test123',
    event: 'payment.captured',
    contains: ['payment'],
    payload: {
      payment: {
        entity: {
          id: paymentId,
          order_id: orderId,
          amount,
          currency,
          status: 'captured',
          method: 'upi',
        },
      },
    },
  });
}

function createOrderPaidWebhookPayload(orderId: string, paymentId: string, amount = 49900, currency = 'INR') {
  return JSON.stringify({
    entity: 'event',
    account_id: 'acc_test123',
    event: 'order.paid',
    contains: ['order', 'payment'],
    payload: {
      order: {
        entity: {
          id: orderId,
          amount,
          amount_paid: amount,
          currency,
          status: 'paid',
        },
      },
      payment: {
        entity: {
          id: paymentId,
          order_id: orderId,
          amount,
          currency,
          status: 'captured',
        },
      },
    },
  });
}

// -------------------------------------------------------------
// MAIN TEST SUITE
// -------------------------------------------------------------
async function runAllWebhookTests() {
  console.log('\n============================================================');
  console.log('      BATCH R2: RAZORPAY WEBHOOK AUTOMATED TEST SUITE       ');
  console.log('============================================================\n');

  // -----------------------------------------------------------
  // SUITE 1: Webhook Signature & Security
  // -----------------------------------------------------------
  console.log('SECTION 1: Signature Verification & Request Validation');

  await runTest('WH-SIG-01: Rejects request missing x-razorpay-signature header with 400', async () => {
    const body = createCapturedWebhookPayload('order_1', 'pay_1');
    const req = createWebhookRequest(body); // No signature
    const res = await webhookHandler(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe('Missing webhook signature header');
  });

  await runTest('WH-SIG-02: Rejects empty body with 400', async () => {
    const emptyBody = '';
    const sig = computeWebhookSignature(emptyBody);
    const req = createWebhookRequest(emptyBody, sig);
    const res = await webhookHandler(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe('Empty webhook request body');
  });

  await runTest('WH-SIG-03: Rejects invalid cryptographic HMAC signature with 400', async () => {
    const body = createCapturedWebhookPayload('order_1', 'pay_1');
    const badSig = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
    const req = createWebhookRequest(body, badSig);
    const res = await webhookHandler(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe('Invalid webhook signature');
  });

  await runTest('WH-SIG-04: Rejects signature generated with incorrect secret with 400', async () => {
    const body = createCapturedWebhookPayload('order_1', 'pay_1');
    const sigWithWrongSecret = computeWebhookSignature(body, 'wrong_secret_key_123456');
    const req = createWebhookRequest(body, sigWithWrongSecret);
    const res = await webhookHandler(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe('Invalid webhook signature');
  });

  await runTest('WH-SIG-05: Returns 500 when RAZORPAY_WEBHOOK_SECRET is unconfigured on server', async () => {
    const saved = process.env.RAZORPAY_WEBHOOK_SECRET;
    delete process.env.RAZORPAY_WEBHOOK_SECRET;
    try {
      const body = createCapturedWebhookPayload('order_1', 'pay_1');
      const req = createWebhookRequest(body, 'any_signature');
      const res = await webhookHandler(req);
      expect(res.status).toBe(500);
      const data = await res.json();
      expect(data.error).toBe('Webhook configuration missing on server');
    } finally {
      process.env.RAZORPAY_WEBHOOK_SECRET = saved;
    }
  });

  // -----------------------------------------------------------
  // SUITE 2: Event Filtering & Non-Fulfillment Events
  // -----------------------------------------------------------
  console.log('\nSECTION 2: Event Filtering & Malformed Payloads');

  await runTest('WH-EVT-01: Rejects malformed JSON body with 400', async () => {
    const malformed = '{"event": "payment.captured", "payload":';
    const sig = computeWebhookSignature(malformed);
    const req = createWebhookRequest(malformed, sig);
    const res = await webhookHandler(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe('Malformed JSON payload');
  });

  await runTest('WH-EVT-02: Acknowledges non-fulfillment events (e.g. payment.failed) with 200 ignored', async () => {
    const failedEvent = JSON.stringify({
      entity: 'event',
      event: 'payment.failed',
      payload: { payment: { entity: { id: 'pay_failed_1' } } },
    });
    const sig = computeWebhookSignature(failedEvent);
    const req = createWebhookRequest(failedEvent, sig);
    const res = await webhookHandler(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.received).toBe(true);
    expect(data.ignored).toBe(true);
    expect(data.event).toBe('payment.failed');
  });

  await runTest('WH-EVT-03: Rejects payload missing order_id with 400', async () => {
    const noOrderId = JSON.stringify({
      entity: 'event',
      event: 'payment.captured',
      payload: { payment: { entity: { id: 'pay_no_order', amount: 49900 } } },
    });
    const sig = computeWebhookSignature(noOrderId);
    const req = createWebhookRequest(noOrderId, sig);
    const res = await webhookHandler(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe('Order ID missing in webhook payload');
  });

  // -----------------------------------------------------------
  // SUITE 3: Order State & Payment Validation
  // -----------------------------------------------------------
  console.log('\nSECTION 3: Order State & Payment Validation');

  await runTest('WH-VAL-01: Returns 404 when order does not exist in database', async () => {
    const body = createCapturedWebhookPayload('order_not_in_db', 'pay_1');
    const sig = computeWebhookSignature(body);
    const req = createWebhookRequest(body, sig);
    const res = await webhookHandler(req);
    expect(res.status).toBe(404);
    const data = await res.json();
    expect(data.error).toBe('Order record not found');
  });

  await runTest('WH-VAL-02: Rejects when payment amount does not match order tuition with 400', async () => {
    const order = await mockPrisma.order.create({
      data: {
        orderId: 'order_price_check',
        userId: 'user_alice',
        courseId: 'course_fullstack',
        amountInPaise: 49900, // 499 INR
        currency: 'INR',
        status: 'created',
      },
    });

    const body = createCapturedWebhookPayload(order.orderId, 'pay_underpaid', 100); // 1 INR
    const sig = computeWebhookSignature(body);
    const req = createWebhookRequest(body, sig);
    const res = await webhookHandler(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe('Payment amount mismatch against expected order amount');

    // Confirm student was not enrolled
    const alice = mockUsers.get('user_alice')!;
    expect(alice.purchasedCourses.length).toBe(0);
  });

  await runTest('WH-VAL-03: Rejects when payment currency does not match order currency with 400', async () => {
    const order = await mockPrisma.order.create({
      data: {
        orderId: 'order_curr_check',
        userId: 'user_alice',
        courseId: 'course_fullstack',
        amountInPaise: 49900,
        currency: 'INR',
        status: 'created',
      },
    });

    const body = createCapturedWebhookPayload(order.orderId, 'pay_usd', 49900, 'USD');
    const sig = computeWebhookSignature(body);
    const req = createWebhookRequest(body, sig);
    const res = await webhookHandler(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe('Payment currency mismatch against expected order currency');
  });

  await runTest('WH-VAL-04: Rejects when payment status is not captured with 400', async () => {
    const order = await mockPrisma.order.create({
      data: {
        orderId: 'order_uncaptured',
        userId: 'user_alice',
        courseId: 'course_fullstack',
        amountInPaise: 49900,
        currency: 'INR',
        status: 'created',
      },
    });

    const body = JSON.stringify({
      entity: 'event',
      event: 'payment.captured',
      payload: {
        payment: {
          entity: {
            id: 'pay_authorized_only',
            order_id: order.orderId,
            amount: 49900,
            currency: 'INR',
            status: 'authorized', // Not captured
          },
        },
      },
    });
    const sig = computeWebhookSignature(body);
    const req = createWebhookRequest(body, sig);
    const res = await webhookHandler(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toContain('Fulfillment requires captured status');
  });

  await runTest('WH-VAL-05: Replay attack defense - Rejects when paymentId is already credited to another order', async () => {
    // Existing completed order
    await mockPrisma.order.create({
      data: {
        orderId: 'order_prev_paid',
        paymentId: 'pay_already_credited_123',
        signature: 'sig_prev',
        userId: 'user_alice',
        courseId: 'course_fullstack',
        amountInPaise: 49900,
        currency: 'INR',
        status: 'paid',
      },
    });

    // New order
    const newOrder = await mockPrisma.order.create({
      data: {
        orderId: 'order_attempting_replay',
        userId: 'user_alice',
        courseId: 'course_fullstack',
        amountInPaise: 49900,
        currency: 'INR',
        status: 'created',
      },
    });

    const body = createCapturedWebhookPayload(newOrder.orderId, 'pay_already_credited_123');
    const sig = computeWebhookSignature(body);
    const req = createWebhookRequest(body, sig);
    const res = await webhookHandler(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe('This payment has already been credited to another transaction');
  });

  // -----------------------------------------------------------
  // SUITE 4: Interrupted Browser Recovery & Reliable Enrollment
  // -----------------------------------------------------------
  console.log('\nSECTION 4: Interrupted Browser Recovery & Enrollment');

  await runTest('WH-REC-01: Interrupted Browser Recovery - Fulfills order, enrolls student, and sends email', async () => {
    // Student initiated checkout but closed tab right after bank debit
    const order = await mockPrisma.order.create({
      data: {
        orderId: 'order_tab_closed_101',
        userId: 'user_alice',
        courseId: 'course_fullstack',
        amountInPaise: 49900,
        currency: 'INR',
        status: 'created',
      },
    });

    const paymentId = 'pay_recovered_555';
    const body = createCapturedWebhookPayload(order.orderId, paymentId);
    const sig = computeWebhookSignature(body);
    const req = createWebhookRequest(body, sig);
    const res = await webhookHandler(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);

    // 1. Verify DB order updated to 'paid'
    const updated = await mockPrisma.order.findUnique({ where: { orderId: order.orderId } });
    expect(updated?.status).toBe('paid');
    expect(updated?.paymentId).toBe(paymentId);

    // 2. Verify student was enrolled in course
    const alice = mockUsers.get('user_alice')!;
    expect(alice.purchasedCourses.some(c => c.id === 'course_fullstack')).toBe(true);

    // 3. Verify confirmation email was dispatched
    expect(sentEmails.some(e => e.to === 'alice@example.com')).toBe(true);
  });

  await runTest('WH-REC-02: Successfully processes order.paid event payload format', async () => {
    const order = await mockPrisma.order.create({
      data: {
        orderId: 'order_paid_event_202',
        userId: 'user_alice',
        courseId: 'course_fullstack',
        amountInPaise: 49900,
        currency: 'INR',
        status: 'created',
      },
    });

    const paymentId = 'pay_order_paid_event';
    const body = createOrderPaidWebhookPayload(order.orderId, paymentId);
    const sig = computeWebhookSignature(body);
    const req = createWebhookRequest(body, sig);
    const res = await webhookHandler(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);

    const updated = await mockPrisma.order.findUnique({ where: { orderId: order.orderId } });
    expect(updated?.status).toBe('paid');
  });

  // -----------------------------------------------------------
  // SUITE 5: Idempotency & Duplicate Deliveries
  // -----------------------------------------------------------
  console.log('\nSECTION 5: Idempotency & Duplicate Webhook Deliveries');

  await runTest('WH-IDEM-01: Duplicate delivery for already paid order returns 200 idempotent without duplicate writes/emails', async () => {
    const order = await mockPrisma.order.create({
      data: {
        orderId: 'order_already_fulfilled',
        paymentId: 'pay_original_999',
        signature: 'sig_orig',
        userId: 'user_alice',
        courseId: 'course_fullstack',
        amountInPaise: 49900,
        currency: 'INR',
        status: 'paid', // already paid
      },
    });

    // Student already has the course
    const alice = mockUsers.get('user_alice')!;
    alice.purchasedCourses.push({ id: 'course_fullstack', title: 'Full-Stack Modern Web Engineering' });

    const body = createCapturedWebhookPayload(order.orderId, 'pay_original_999');
    const sig = computeWebhookSignature(body);
    const req = createWebhookRequest(body, sig);
    const res = await webhookHandler(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.idempotent).toBe(true);

    // Verify course is only present once in student record
    const count = alice.purchasedCourses.filter(c => c.id === 'course_fullstack').length;
    expect(count).toBe(1);

    // Verify NO duplicate enrollment email was sent
    expect(sentEmails.length).toBe(0);
  });

  // -----------------------------------------------------------
  // SUITE 6: Concurrency & Race Conditions with Client /verify
  // -----------------------------------------------------------
  console.log('\nSECTION 6: Race Conditions with Client Verification Route');

  await runTest('WH-RACE-01: Client /verify runs first, webhook arrives 5 seconds later - Both succeed seamlessly', async () => {
    const order = await mockPrisma.order.create({
      data: {
        orderId: 'order_race_verify_first',
        userId: 'user_alice',
        courseId: 'course_fullstack',
        amountInPaise: 49900,
        currency: 'INR',
        status: 'created',
      },
    });

    const paymentId = 'pay_race_1';
    const clientSig = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(`${order.orderId}|${paymentId}`)
      .digest('hex');

    mockPaymentFetchResponse = {
      id: paymentId,
      order_id: order.orderId,
      amount: 49900,
      currency: 'INR',
      status: 'captured',
    };

    // 1. Client /verify runs first
    currentMockUser = { userId: 'user_alice', role: 'student' };
    const verifyReq = new Request('http://localhost:3000/api/checkout/razorpay/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        razorpay_order_id: order.orderId,
        razorpay_payment_id: paymentId,
        razorpay_signature: clientSig,
        courseId: 'course_fullstack',
      }),
    });
    const verifyRes = await verifyHandler(verifyReq);
    expect(verifyRes.status).toBe(200);
    expect(sentEmails.length).toBe(1);

    // 2. Webhook arrives shortly after
    const webhookBody = createCapturedWebhookPayload(order.orderId, paymentId);
    const webhookSig = computeWebhookSignature(webhookBody);
    const webhookReq = createWebhookRequest(webhookBody, webhookSig);
    const webhookRes = await webhookHandler(webhookReq);
    expect(webhookRes.status).toBe(200);
    const webhookData = await webhookRes.json();
    expect(webhookData.idempotent).toBe(true);

    // Verify student is enrolled exactly once and only 1 email was sent in total
    const alice = mockUsers.get('user_alice')!;
    const enrollments = alice.purchasedCourses.filter(c => c.id === 'course_fullstack');
    expect(enrollments.length).toBe(1);
    expect(sentEmails.length).toBe(1);
  });

  await runTest('WH-RACE-02: Webhook runs first, client /verify arrives 5 seconds later - Both succeed seamlessly', async () => {
    const order = await mockPrisma.order.create({
      data: {
        orderId: 'order_race_webhook_first',
        userId: 'user_alice',
        courseId: 'course_fullstack',
        amountInPaise: 49900,
        currency: 'INR',
        status: 'created',
      },
    });

    const paymentId = 'pay_race_2';

    // 1. Webhook arrives first
    const webhookBody = createCapturedWebhookPayload(order.orderId, paymentId);
    const webhookSig = computeWebhookSignature(webhookBody);
    const webhookReq = createWebhookRequest(webhookBody, webhookSig);
    const webhookRes = await webhookHandler(webhookReq);
    expect(webhookRes.status).toBe(200);
    expect(sentEmails.length).toBe(1);

    // 2. Client /verify arrives second
    currentMockUser = { userId: 'user_alice', role: 'student' };
    const clientSig = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(`${order.orderId}|${paymentId}`)
      .digest('hex');

    const verifyReq = new Request('http://localhost:3000/api/checkout/razorpay/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        razorpay_order_id: order.orderId,
        razorpay_payment_id: paymentId,
        razorpay_signature: clientSig,
        courseId: 'course_fullstack',
      }),
    });
    const verifyRes = await verifyHandler(verifyReq);
    expect(verifyRes.status).toBe(200);
    const verifyData = await verifyRes.json();
    expect(verifyData.idempotent).toBe(true);

    const alice = mockUsers.get('user_alice')!;
    const enrollments = alice.purchasedCourses.filter(c => c.id === 'course_fullstack');
    expect(enrollments.length).toBe(1);
    expect(sentEmails.length).toBe(1);
  });

  // -----------------------------------------------------------
  // SUITE 7: Preview Environment Guard
  // -----------------------------------------------------------
  console.log('\nSECTION 7: Preview Environment Guard');

  await runTest('WH-PREV-01: Returns 503 when preview environment flag is set', async () => {
    process.env.VERCEL_ENV = 'preview';
    try {
      const body = createCapturedWebhookPayload('order_prev_test', 'pay_prev');
      const sig = computeWebhookSignature(body);
      const req = createWebhookRequest(body, sig);
      const res = await webhookHandler(req);
      expect(res.status).toBe(503);
      const data = await res.json();
      expect(data.error).toBe('Payment webhook is paused in this preview environment.');
    } finally {
      delete process.env.VERCEL_ENV;
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

runAllWebhookTests().catch(err => {
  console.error('Fatal Webhook Test Error:', err);
  process.exit(1);
});
