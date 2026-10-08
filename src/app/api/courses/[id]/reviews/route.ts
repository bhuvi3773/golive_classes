import { NextResponse } from 'next/server';
import { ReviewRepository } from '@/lib/repositories/review.repository';
import { UserRepository } from '@/lib/repositories/user.repository';
import prisma from '@/lib/prisma';
import { getUserFromCookie } from '@/lib/auth';

export async function GET(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;

    const reviews = await ReviewRepository.findByCourse(id);

    return NextResponse.json(reviews, { status: 200 });
  } catch (error) {
    console.error('Fetch Reviews Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const user = await getUserFromCookie();
    if (!user || !user.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;
    const { rating, comment } = await req.json();

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Valid rating between 1 and 5 is required' }, { status: 400 });
    }

    if (!comment || comment.trim() === '') {
      return NextResponse.json({ error: 'Comment is required' }, { status: 400 });
    }

    // Verify ownership
    const dbUser = await UserRepository.findById(user.userId);
    if (!dbUser || !dbUser.purchasedCourses || !dbUser.purchasedCourses.some(c => c.id === id)) {
      return NextResponse.json({ error: 'You must purchase this course to leave a review' }, { status: 403 });
    }

    // Verify > 50% completion
    const course = await prisma.course.findUnique({ where: { id } });
    const progress = await prisma.progress.findUnique({ where: { userId_courseId: { userId: user.userId, courseId: id } } });
    
    const curriculum = (course?.curriculum as any) || [];
    const totalLectures = curriculum.reduce((acc: number, sec: any) => acc + (sec.lectures?.length || 0), 0);
    const completedCount = progress?.completedLectures?.length || 0;
    
    if (totalLectures > 0 && completedCount / totalLectures <= 0.5) {
      return NextResponse.json({ error: 'You must complete at least 50% of the course to leave a review' }, { status: 403 });
    }

    // Check if already reviewed
    const existingReview = await prisma.review.findFirst({
      where: { courseId: id, userId: user.userId }
    });
    
    if (existingReview) {
      return NextResponse.json({ error: 'You have already reviewed this course' }, { status: 400 });
    }

    const review = await ReviewRepository.create(user.userId, id, rating, comment);
    
    // Fetch it again to include the populated user for the frontend
    const populatedReview = await prisma.review.findUnique({
      where: { id: review.id },
      include: { user: { select: { id: true, name: true, avatar: true } } }
    });

    return NextResponse.json(populatedReview, { status: 201 });
  } catch (error: any) {
    console.error('Submit Review Error:', error);
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'You have already reviewed this course' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
