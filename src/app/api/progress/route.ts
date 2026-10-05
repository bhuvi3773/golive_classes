import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Progress from '@/models/Progress';
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

    await connectToDatabase();

    // Find or create progress record for this user and course
    let progress = await Progress.findOne({ userId: user.userId, courseId });

    if (!progress) {
      progress = new Progress({
        userId: user.userId,
        courseId,
        completedLectures: [lectureId],
        lastAccessedLecture: lectureId
      });
    } else {
      if (!progress.completedLectures.includes(lectureId)) {
        progress.completedLectures.push(lectureId);
      }
      progress.lastAccessedLecture = lectureId;
      progress.updatedAt = new Date();
    }

    await progress.save();

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

    await connectToDatabase();

    if (courseId) {
      const progress = await Progress.findOne({ userId: user.userId, courseId });
      return NextResponse.json(progress || { completedLectures: [] }, { status: 200 });
    } else {
      const allProgress = await Progress.find({ userId: user.userId });
      return NextResponse.json(allProgress, { status: 200 });
    }
  } catch (error) {
    console.error('Fetch Progress Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
