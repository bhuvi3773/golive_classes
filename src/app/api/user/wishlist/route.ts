import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { UserRepository } from '@/lib/repositories/user.repository';
import { getUserFromCookie } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    const authUser = await getUserFromCookie();
    if (!authUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const user = await UserRepository.findById(authUser.userId);
    
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

    let user = await UserRepository.findById(authUser.userId);
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const isAdded = user.wishlist.some(c => c.id === courseId);

    if (!isAdded) {
      await UserRepository.addToWishlist(authUser.userId, courseId);
    } else {
      await UserRepository.removeFromWishlist(authUser.userId, courseId);
    }

    user = await UserRepository.findById(authUser.userId);
    
    return NextResponse.json({ success: true, isAdded: !isAdded, wishlist: user?.wishlist }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
