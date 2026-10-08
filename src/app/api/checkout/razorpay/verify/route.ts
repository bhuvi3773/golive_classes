import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import crypto from 'crypto';
import { CourseRepository } from '@/lib/repositories/course.repository';
import { UserRepository } from '@/lib/repositories/user.repository';
import { sendEnrollmentEmail } from '@/lib/email';
import { getUserFromCookie } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const user = await getUserFromCookie();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, courseId } = await req.json();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !courseId) {
      return NextResponse.json({ error: 'Missing payment details' }, { status: 400 });
    }

    if (!process.env.RAZORPAY_KEY_SECRET) {
      console.error("Razorpay secret missing in .env");
      return NextResponse.json({ error: 'Payment gateway configuration missing' }, { status: 500 });
    }

    // Verify signature
    const text = `${razorpay_order_id}|${razorpay_payment_id}`;
    const generated_signature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(text)
      .digest('hex');

    if (generated_signature !== razorpay_signature) {
      return NextResponse.json({ error: 'Invalid payment signature. Payment verification failed.' }, { status: 400 });
    }

    // Add course to user's purchasedCourses array
    await CourseRepository.addPurchase(user.userId, courseId);

    const course = await CourseRepository.findById(courseId);
    const dbUser = await UserRepository.findById(user.userId);
    if (course && dbUser) {
      sendEnrollmentEmail(dbUser.email, dbUser.name || 'Student', course.title, course.id).catch(console.error);
    }

    return NextResponse.json({ success: true, message: 'Payment verified and course enrolled successfully' });
  } catch (error: any) {
    console.error('Razorpay Verify Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
