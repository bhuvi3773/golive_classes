import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { UserRepository } from '@/lib/repositories/user.repository';
import prisma from '@/lib/prisma';
import { getUserFromCookie } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const user = await getUserFromCookie();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { courseId, lectureId } = await req.json();

    if (!courseId || !lectureId) {
      return NextResponse.json({ error: 'courseId and lectureId are required' }, { status: 400 });
    }

    // Check if user owns the course
    const userRecord = await UserRepository.findById(user.userId);
    if (!userRecord || !userRecord.purchasedCourses || !userRecord.purchasedCourses.some((c: any) => c.id === courseId)) {
      return NextResponse.json({ error: 'You must purchase this course to save progress.' }, { status: 403 });
    }

    // Find or create progress record for this user and course
    let progress = await prisma.progress.findUnique({
      where: { userId_courseId: { userId: user.userId, courseId } }
    });

    let completedLectures = progress?.completedLectures || [];
    if (!completedLectures.includes(lectureId)) {
      completedLectures.push(lectureId);
    }

    progress = await prisma.progress.upsert({
      where: { userId_courseId: { userId: user.userId, courseId } },
      update: {
        completedLectures,
        lastAccessedLecture: lectureId,
      },
      create: {
        userId: user.userId,
        courseId,
        completedLectures: [lectureId],
        lastAccessedLecture: lectureId,
      }
    });

    return NextResponse.json(progress, { status: 200 });
  } catch (error) {
    console.error('Update Progress Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const user = await getUserFromCookie();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get('courseId');

    if (courseId) {
      const progress = await prisma.progress.findUnique({
        where: { userId_courseId: { userId: user.userId, courseId } }
      });
      return NextResponse.json(progress || { completedLectures: [] }, { status: 200 });
    } else {
      const allProgress = await prisma.progress.findMany({
        where: { userId: user.userId }
      });
      return NextResponse.json(allProgress, { status: 200 });
    }
  } catch (error) {
    console.error('Fetch Progress Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
