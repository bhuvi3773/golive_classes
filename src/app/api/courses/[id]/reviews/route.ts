import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Review from '@/models/Review';
import User from '@/models/User';
import { getUserFromCookie } from '@/lib/auth';

export async function GET(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    await connectToDatabase();
    const { id } = await context.params;

    const reviews = await Review.find({ courseId: id })
      .populate('userId', 'name avatar')
      .sort({ createdAt: -1 });

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

    await connectToDatabase();
    const { id } = await context.params;
    const { rating, comment } = await req.json();

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Valid rating between 1 and 5 is required' }, { status: 400 });
    }

    if (!comment || comment.trim() === '') {
      return NextResponse.json({ error: 'Comment is required' }, { status: 400 });
    }

    // Verify ownership
    const dbUser = await User.findById(user.userId);
    if (!dbUser || !dbUser.purchasedCourses || !dbUser.purchasedCourses.some((c: any) => c.toString() === id)) {
      return NextResponse.json({ error: 'You must purchase this course to leave a review' }, { status: 403 });
    }

    // Check if already reviewed
    const existingReview = await Review.findOne({ courseId: id, userId: user.userId });
    if (existingReview) {
      return NextResponse.json({ error: 'You have already reviewed this course' }, { status: 400 });
    }

    const review = new Review({
      courseId: id,
      userId: user.userId,
      rating,
      comment
    });

    await review.save();

    // Populate user info before returning
    await review.populate('userId', 'name avatar');

    return NextResponse.json(review, { status: 201 });
  } catch (error: any) {
    console.error('Submit Review Error:', error);
    if (error.code === 11000) {
      return NextResponse.json({ error: 'You have already reviewed this course' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
