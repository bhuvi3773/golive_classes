import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import UpcomingLaunch from '@/models/UpcomingLaunch';
import { getUserFromCookie } from '@/lib/auth';

export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserFromCookie();

    if (!user || (user.role !== 'admin' && user.role !== 'superadmin')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    
    // params.id requires await in Next.js 15+
    const { id } = await context.params;
    
    const deletedLaunch = await UpcomingLaunch.findByIdAndDelete(id);

    if (!deletedLaunch) {
      return NextResponse.json({ error: 'Launch not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Launch deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Delete Launch Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserFromCookie();

    if (!user || (user.role !== 'admin' && user.role !== 'superadmin')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const { id } = await context.params;
    
    const body = await req.json();
    body.updatedAt = new Date();

    const updatedLaunch = await UpcomingLaunch.findByIdAndUpdate(id, body, { new: true });

    if (!updatedLaunch) {
      return NextResponse.json({ error: 'Launch not found' }, { status: 404 });
    }

    return NextResponse.json(updatedLaunch, { status: 200 });
  } catch (error: any) {
    console.error('Update Launch Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
