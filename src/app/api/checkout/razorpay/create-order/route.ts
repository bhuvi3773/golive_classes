import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import connectToDatabase from '@/lib/mongodb';
import Course from '@/models/Course';
import { getUserFromCookie } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const user = await getUserFromCookie();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { courseId } = await req.json();
    if (!courseId) return NextResponse.json({ error: 'Course ID is required' }, { status: 400 });

    await connectToDatabase();
    const course = await Course.findById(courseId);
    if (!course) return NextResponse.json({ error: 'Course not found' }, { status: 404 });

    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
       console.error("Razorpay keys missing in .env");
       return NextResponse.json({ error: 'Payment gateway configuration missing' }, { status: 500 });
    }

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    // Razorpay works in the smallest currency unit (e.g. paise for INR).
    // Assuming course.price is a standard amount (e.g. 499 means 499 INR)
    const amountInPaise = Math.round(course.price * 100);

    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: 'INR', // You can make this dynamic if needed
      receipt: `rcpt_${courseId}_${user.userId}`.substring(0, 40),
    });

    return NextResponse.json(order);
  } catch (error: any) {
    console.error('Razorpay Create Order Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
