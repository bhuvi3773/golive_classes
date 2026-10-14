import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import crypto from 'crypto';
import prisma from '@/lib/prisma';
import { CourseRepository } from '@/lib/repositories/course.repository';
import { UserRepository } from '@/lib/repositories/user.repository';
import { sendEnrollmentEmail } from '@/lib/email';

export async function POST(req: Request) {
  try {
    // 1. Preview Guard: Consistent with create-order and verify routes
    if (
      process.env.VERCEL_ENV === 'preview' ||
      process.env.DISABLE_CHECKOUT === 'true' ||
      process.env.NEXT_PUBLIC_DISABLE_CHECKOUT === 'true'
    ) {
      return NextResponse.json(
        { error: 'Payment webhook is paused in this preview environment.' },
        { status: 503 }
      );
    }

    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error('[Razorpay Webhook Error] RAZORPAY_WEBHOOK_SECRET is not configured on the server.');
      return NextResponse.json(
        { error: 'Webhook configuration missing on server' },
        { status: 500 }
      );
    }

    const signature = req.headers.get('x-razorpay-signature');
    if (!signature) {
      console.warn('[Razorpay Webhook] Missing x-razorpay-signature header');
      return NextResponse.json(
        { error: 'Missing webhook signature header' },
        { status: 400 }
      );
    }

    // 2. Read raw unparsed body for cryptographic HMAC verification
    const rawBody = await req.text();
    if (!rawBody) {
      return NextResponse.json(
        { error: 'Empty webhook request body' },
        { status: 400 }
      );
    }

    // 3. Timing-safe cryptographic HMAC-SHA256 signature verification
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(rawBody)
      .digest('hex');

    const sigBuffer = Buffer.from(signature, 'utf-8');
    const expBuffer = Buffer.from(expectedSignature, 'utf-8');

    if (sigBuffer.length !== expBuffer.length || !crypto.timingSafeEqual(sigBuffer, expBuffer)) {
      console.warn('[Razorpay Webhook] Invalid webhook signature detected');
      return NextResponse.json(
        { error: 'Invalid webhook signature' },
        { status: 400 }
      );
    }

    // 4. Safely parse JSON after signature validation
    let eventData: any;
    try {
      eventData = JSON.parse(rawBody);
    } catch (parseErr) {
      console.error('[Razorpay Webhook] Failed to parse webhook JSON body');
      return NextResponse.json(
        { error: 'Malformed JSON payload' },
        { status: 400 }
      );
    }

    const event = eventData.event;
    const payload = eventData.payload;

    // 5. Filter supported events: only process successful payment capture/order fulfillment
    if (event !== 'payment.captured' && event !== 'order.paid') {
      // Acknowledge receipt of other events (e.g. payment.failed) to prevent repeated retries
      return NextResponse.json(
        { received: true, ignored: true, event },
        { status: 200 }
      );
    }

    const paymentEntity = payload?.payment?.entity;
    const orderEntity = payload?.order?.entity;

    const orderId = paymentEntity?.order_id || orderEntity?.id;
    const paymentId = paymentEntity?.id;
    const paymentAmount = paymentEntity?.amount ?? orderEntity?.amount_paid ?? orderEntity?.amount;
    const paymentCurrency = paymentEntity?.currency ?? orderEntity?.currency ?? 'INR';
    const paymentStatus = paymentEntity?.status;

    if (!orderId) {
      console.warn('[Razorpay Webhook] Webhook payload missing order_id');
      return NextResponse.json(
        { error: 'Order ID missing in webhook payload' },
        { status: 400 }
      );
    }

    // 6. Authoritative database lookup
    const order = await prisma.order.findUnique({
      where: { orderId },
    });

    if (!order) {
      console.warn(`[Razorpay Webhook] Order record not found in database for orderId=${orderId}`);
      return NextResponse.json(
        { error: 'Order record not found' },
        { status: 404 }
      );
    }

    // 7. Idempotency Check: If already fulfilled, return 200 immediately
    if (order.status === 'paid') {
      return NextResponse.json({
        success: true,
        message: 'Order already fulfilled and course enrolled successfully',
        idempotent: true,
      }, { status: 200 });
    }

    if (order.status !== 'created') {
      return NextResponse.json(
        { error: `Order is in invalid state '${order.status}' for fulfillment` },
        { status: 400 }
      );
    }

    // 8. Amount and currency validation against database order
    if (paymentAmount !== undefined && paymentAmount !== order.amountInPaise) {
      console.error(`[Razorpay Webhook] Amount mismatch for order=${orderId}: expected ${order.amountInPaise}, got ${paymentAmount}`);
      return NextResponse.json(
        { error: 'Payment amount mismatch against expected order amount' },
        { status: 400 }
      );
    }

    if (paymentCurrency && paymentCurrency !== order.currency) {
      console.error(`[Razorpay Webhook] Currency mismatch for order=${orderId}: expected ${order.currency}, got ${paymentCurrency}`);
      return NextResponse.json(
        { error: 'Payment currency mismatch against expected order currency' },
        { status: 400 }
      );
    }

    // 9. Payment capture status check
    if (paymentStatus && paymentStatus !== 'captured' && event !== 'order.paid') {
      return NextResponse.json(
        { error: `Payment status is '${paymentStatus}'. Fulfillment requires captured status.` },
        { status: 400 }
      );
    }

    // 10. Replay protection: Ensure payment ID hasn't been credited to another order
    if (paymentId) {
      const duplicatePayment = await prisma.order.findFirst({
        where: {
          paymentId,
          id: { not: order.id },
        },
      });

      if (duplicatePayment) {
        return NextResponse.json(
          { error: 'This payment has already been credited to another transaction' },
          { status: 400 }
        );
      }
    }

    // 11. Transaction-safe atomic fulfillment using conditional state transition (updateMany)
    const fulfillmentResult = await prisma.$transaction(async (tx) => {
      const updateResult = await tx.order.updateMany({
        where: {
          id: order.id,
          status: 'created',
        },
        data: {
          status: 'paid',
          paymentId: paymentId || order.paymentId || `pay_wh_${Date.now()}`,
          signature: signature,
        },
      });

      if (updateResult.count === 0) {
        // Concurrency conflict: another concurrent process (e.g. client /verify route) fulfilled the order
        return { fulfilled: false };
      }

      await tx.user.update({
        where: { id: order.userId },
        data: {
          purchasedCourses: {
            connect: { id: order.courseId },
          },
        },
      });

      return { fulfilled: true };
    });

    if (!fulfillmentResult.fulfilled) {
      // Re-read order to confirm it was fulfilled concurrently
      const currentOrder = await prisma.order.findUnique({ where: { id: order.id } });
      if (currentOrder?.status === 'paid') {
        return NextResponse.json({
          success: true,
          message: 'Order already fulfilled concurrently',
          idempotent: true,
        }, { status: 200 });
      }
      return NextResponse.json(
        { error: 'Order could not be fulfilled due to a state transition conflict' },
        { status: 409 }
      );
    }

    // 12. Send enrollment confirmation email asynchronously
    const course = await CourseRepository.findById(order.courseId);
    const dbUser = await UserRepository.findById(order.userId);
    if (course && dbUser) {
      sendEnrollmentEmail(dbUser.email, dbUser.name || 'Student', course.title, course.id)
        .catch((err) => console.error('[Webhook Enrollment Email Error]:', err?.message || err));
    }

    return NextResponse.json({
      success: true,
      message: 'Payment confirmed via webhook and course enrolled successfully',
    }, { status: 200 });
  } catch (error: any) {
    console.error('Razorpay Webhook Error:', error?.message || 'Unknown error');
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
