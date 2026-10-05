import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';
import Course from '@/models/Course'; // Ensure course model is loaded
import { getUserFromCookie } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    const authUser = await getUserFromCookie();
    if (!authUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectToDatabase();
    const user = await User.findById(authUser.userId).populate('wishlist');
    
    return NextResponse.json(user?.wishlist || [], { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const authUser = await getUserFromCookie();
    if (!authUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { courseId } = await req.json();
    if (!courseId) return NextResponse.json({ error: 'Course ID required' }, { status: 400 });

    await connectToDatabase();
    const user = await User.findById(authUser.userId);
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const index = user.wishlist.indexOf(courseId);
    let isAdded = false;

    if (index === -1) {
      user.wishlist.push(courseId);
      isAdded = true;
    } else {
      user.wishlist.splice(index, 1);
    }

    await user.save();
    
    return NextResponse.json({ success: true, isAdded, wishlist: user.wishlist }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
