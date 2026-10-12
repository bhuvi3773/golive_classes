import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import crypto from 'crypto';
import Razorpay from 'razorpay';
import { CourseRepository } from '@/lib/repositories/course.repository';
import { UserRepository } from '@/lib/repositories/user.repository';
import { sendEnrollmentEmail } from '@/lib/email';
import { getUserFromCookie } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const user = await getUserFromCookie();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Preview Guard: Disable payment verification in preview environments without querying unmigrated Order table
    if (
      process.env.VERCEL_ENV === 'preview' ||
      process.env.DISABLE_CHECKOUT === 'true' ||
      process.env.NEXT_PUBLIC_DISABLE_CHECKOUT === 'true'
    ) {
      return NextResponse.json(
        { error: 'Payment verification is paused in this preview environment.' },
        { status: 503 }
      );
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, courseId } = await req.json();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !courseId) {
      return NextResponse.json({ error: 'Missing required payment details' }, { status: 400 });
    }

    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      console.error("Razorpay keys missing in environment configuration");
      return NextResponse.json({ error: 'Payment gateway configuration missing' }, { status: 500 });
    }

    // 1. Authoritative order lookup from database
    const order = await prisma.order.findUnique({
      where: { orderId: razorpay_order_id }
    });

    if (!order) {
      return NextResponse.json({ error: 'Order record not found' }, { status: 404 });
    }

    // 2. Order ownership verification
    if (order.userId !== user.userId) {
      return NextResponse.json({ error: 'Forbidden: Order does not belong to the current authenticated user' }, { status: 403 });
    }

    // 3. Course binding verification
    if (order.courseId !== courseId) {
      return NextResponse.json({ error: 'Course ID does not match order record' }, { status: 400 });
    }

    // 4. Idempotent check: If order is already paid, return success without duplicate writes
    if (order.status === 'paid') {
      return NextResponse.json({
        success: true,
        message: 'Payment already verified and course enrolled successfully',
        idempotent: true
      }, { status: 200 });
    }

    if (order.status !== 'created') {
      return NextResponse.json({ error: 'Order is not in an active verification state' }, { status: 400 });
    }

    // 5. Timing-safe cryptographic signature verification
    const text = `${razorpay_order_id}|${razorpay_payment_id}`;
    const generatedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(text)
      .digest('hex');

    const sigBuffer = Buffer.from(razorpay_signature, 'utf-8');
    const expBuffer = Buffer.from(generatedSignature, 'utf-8');

    if (sigBuffer.length !== expBuffer.length || !crypto.timingSafeEqual(sigBuffer, expBuffer)) {
      // Safe failure: Do NOT mark the order as failed in DB to allow legitimate retry attempts
      console.warn(`[Security] Invalid signature attempt for order=${order.orderId} by user=${user.userId}`);
      return NextResponse.json({ error: 'Invalid payment signature' }, { status: 400 });
    }

    // 6. Trusted gateway verification via Razorpay SDK (fetch payment status directly)
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    let payment: any;
    try {
      payment = await razorpay.payments.fetch(razorpay_payment_id);
    } catch (fetchErr: any) {
      console.error(`[Razorpay Gateway Error] Failed to fetch payment=${razorpay_payment_id}:`, fetchErr?.message || fetchErr);
      // Gateway error: safe failure, do not mark order failed in DB
      return NextResponse.json(
        { error: 'Payment gateway verification temporarily unavailable. Please retry.' },
        { status: 502 }
      );
    }

    if (payment.order_id !== order.orderId) {
      return NextResponse.json({ error: 'Payment does not belong to the specified order' }, { status: 400 });
    }

    if (payment.amount !== order.amountInPaise) {
      return NextResponse.json({ error: 'Payment amount mismatch against expected tuition' }, { status: 400 });
    }

    if (payment.currency !== order.currency) {
      return NextResponse.json({ error: 'Payment currency mismatch' }, { status: 400 });
    }

    // Strict capture check: grant enrollment only when Razorpay confirms the payment is 'captured'
    if (payment.status !== 'captured') {
      return NextResponse.json({
        error: `Payment status is '${payment.status}'. Enrollment requires captured payment status.`
      }, { status: 400 });
    }

    // 7. Replay protection: Ensure payment ID has not been used by any other order
    const duplicatePayment = await prisma.order.findFirst({
      where: {
        paymentId: razorpay_payment_id,
        id: { not: order.id },
      }
    });

    if (duplicatePayment) {
      return NextResponse.json({ error: 'This payment has already been credited to another transaction' }, { status: 400 });
    }

    // 8. Transaction-safe atomic fulfillment using conditional state transition (updateMany)
    const fulfillmentResult = await prisma.$transaction(async (tx) => {
      const updateResult = await tx.order.updateMany({
        where: {
          id: order.id,
          status: 'created',
        },
        data: {
          status: 'paid',
          paymentId: razorpay_payment_id,
          signature: razorpay_signature,
        },
      });

      if (updateResult.count === 0) {
        // Concurrency conflict: another concurrent request already fulfilled this order
        return { fulfilled: false };
      }

      await tx.user.update({
        where: { id: order.userId },
        data: {
          purchasedCourses: {
            connect: { id: order.courseId }
          }
        }
      });

      return { fulfilled: true };
    });

    if (!fulfillmentResult.fulfilled) {
      // Re-read order to confirm it was fulfilled concurrently
      const currentOrder = await prisma.order.findUnique({ where: { id: order.id } });
      if (currentOrder?.status === 'paid') {
        return NextResponse.json({
          success: true,
          message: 'Payment already verified and course enrolled successfully',
          idempotent: true
        }, { status: 200 });
      }
      return NextResponse.json({ error: 'Order could not be fulfilled due to a state transition conflict' }, { status: 409 });
    }

    // 9. Send enrollment confirmation email asynchronously
    const course = await CourseRepository.findById(courseId);
    const dbUser = await UserRepository.findById(user.userId);
    if (course && dbUser) {
      sendEnrollmentEmail(dbUser.email, dbUser.name || 'Student', course.title, course.id)
        .catch(err => console.error("Enrollment email error:", err?.message || err));
    }

    return NextResponse.json({ success: true, message: 'Payment verified and course enrolled successfully' });
  } catch (error: any) {
    console.error('Razorpay Verify Error:', error?.message || 'Unknown error');
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
