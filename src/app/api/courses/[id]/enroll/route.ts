import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';
import Course from '@/models/Course';
import { getUserFromCookie } from '@/lib/auth';
import { sendEnrollmentEmail } from '@/lib/email';

export async function POST(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const userPayload = await getUserFromCookie();
    if (!userPayload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;
    const courseId = id;
    await connectToDatabase();

    const course = await Course.findById(courseId);
    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    const user = await User.findById(userPayload.userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if already purchased
    const alreadyPurchased = user.purchasedCourses.some((id: any) => id.toString() === courseId);
    if (!alreadyPurchased) {
      user.purchasedCourses.push(courseId as any);
      await user.save();
      
      // Fire and forget email notification
      sendEnrollmentEmail(user.email, user.name || 'Student', course.title, course._id.toString()).catch(err => console.error("Email failed:", err));
    }

    return NextResponse.json({ success: true, message: 'Successfully enrolled' });
  } catch (error) {
    console.error('Enrollment error:', error);
    return NextResponse.json({ error: 'Failed to enroll in course' }, { status: 500 });
  }
}
