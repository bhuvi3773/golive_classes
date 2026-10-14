import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import Razorpay from 'razorpay';
import { CourseRepository } from '@/lib/repositories/course.repository';
import { UserRepository } from '@/lib/repositories/user.repository';
import { getUserFromCookie } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const user = await getUserFromCookie();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Preview Guard: Disable paid checkout in preview environments without querying unmigrated Order table
    if (
      process.env.VERCEL_ENV === 'preview' ||
      process.env.DISABLE_CHECKOUT === 'true' ||
      process.env.NEXT_PUBLIC_DISABLE_CHECKOUT === 'true'
    ) {
      return NextResponse.json(
        { error: 'Paid checkout is paused in this preview environment.' },
        { status: 503 }
      );
    }

    const { courseId } = await req.json();
    if (!courseId) return NextResponse.json({ error: 'Course ID is required' }, { status: 400 });

    const course = await CourseRepository.findById(courseId);
    if (!course) return NextResponse.json({ error: 'Course not found' }, { status: 404 });

    // Reject free courses from payment gateway checkout
    if (course.price === 0) {
      return NextResponse.json(
        { error: 'This course is free. Please enroll directly without checkout.' },
        { status: 400 }
      );
    }

    if (course.status !== 'published') {
      return NextResponse.json({ error: 'This course is not open for enrollment.' }, { status: 400 });
    }

    // Verify user is not already enrolled
    const dbUser = await UserRepository.findById(user.userId);
    if (dbUser && dbUser.purchasedCourses.some((c: any) => c.id === courseId)) {
      return NextResponse.json({ error: 'You are already enrolled in this course.' }, { status: 400 });
    }

    const expectedCurrency = 'INR';
    const amountInPaise = Math.round(course.price * 100);

    // 1. Safe Reuse: Check for an existing pending order for the same user & course within 30 minutes
    const PENDING_ORDER_EXPIRATION_MS = 30 * 60 * 1000; // 30 minutes
    const thirtyMinutesAgo = new Date(Date.now() - PENDING_ORDER_EXPIRATION_MS);

    const existingPendingOrder = await prisma.order.findFirst({
      where: {
        userId: user.userId,
        courseId: course.id,
        status: 'created',
        createdAt: { gte: thirtyMinutesAgo },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (existingPendingOrder) {
      // Verify that the pending order's amount and currency match current server-side course data
      if (
        existingPendingOrder.amountInPaise === amountInPaise &&
        existingPendingOrder.currency === expectedCurrency &&
        existingPendingOrder.orderId
      ) {
        return NextResponse.json({
          id: existingPendingOrder.orderId,
          amount: existingPendingOrder.amountInPaise,
          currency: existingPendingOrder.currency,
          status: existingPendingOrder.status,
          courseId: course.id,
          reused: true,
        });
      }
    }

    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
       console.error("Razorpay keys missing in .env");
       return NextResponse.json({ error: 'Payment gateway configuration missing' }, { status: 500 });
    }

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });





    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: expectedCurrency,
      receipt: `rcpt_${courseId.substring(0, 8)}_${user.userId.substring(0, 8)}_${Date.now()}`.substring(0, 40),
      notes: {
        courseId: course.id,
        userId: user.userId,
      }
    });

    // Safeguard: Persist order in database before returning to client
    try {
      await prisma.order.create({
        data: {
          orderId: order.id,
          userId: user.userId,
          courseId: course.id,
          amountInPaise,
          currency: expectedCurrency,
          status: 'created',
        }
      });
    } catch (dbError) {
      // Non-sensitive diagnostic log: do not log keys, cards, or full tokens
      console.error(`[Order Persistence Error] Failed to persist order record for user=${user.userId}, course=${course.id}`);
      return NextResponse.json(
        { error: 'Failed to initialize order tracking record. Please try again.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ...order,
      courseId: course.id,
      reused: false,
    });
  } catch (error: any) {
    console.error('Razorpay Create Order Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
