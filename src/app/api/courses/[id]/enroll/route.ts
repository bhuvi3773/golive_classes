import { NextResponse } from 'next/server';
import { CourseRepository } from '@/lib/repositories/course.repository';
import { UserRepository } from '@/lib/repositories/user.repository';
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

    const course = await CourseRepository.findById(courseId);
    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    // Strict server-side verification: Direct enrollment is ONLY permitted for free courses (price === 0)
    if (course.price !== 0) {
      return NextResponse.json(
        {
          error: 'Tuition payment required. Paid courses cannot be enrolled in directly.',
          requiresPayment: true,
          courseId: course.id,
          price: course.price
        },
        { status: 402 }
      );
    }

    if (course.status !== 'published') {
      return NextResponse.json({ error: 'This course is not available for enrollment.' }, { status: 400 });
    }

    const user = await UserRepository.findById(userPayload.userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if already enrolled (idempotent)
    const alreadyPurchased = user.purchasedCourses.some(c => c.id === courseId);
    if (!alreadyPurchased) {
      await CourseRepository.addPurchase(user.id, courseId);

      // Fire and forget email notification
      sendEnrollmentEmail(user.email, user.name || 'Student', course.title, course.id)
        .catch(err => console.error("Email failed:", err));
    }

    return NextResponse.json({ success: true, message: 'Successfully enrolled' });
  } catch (error) {
    console.error('Enrollment error:', error);
    return NextResponse.json({ error: 'Failed to enroll in course' }, { status: 500 });
  }
}
