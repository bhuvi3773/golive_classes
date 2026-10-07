import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import UpcomingLaunch from '@/models/UpcomingLaunch';
import { getUserFromCookie } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const admin = searchParams.get('admin');

    await connectToDatabase();
    
    let query = {};
    if (!admin) {
      // For public users, only show scheduled or live
      query = { status: { $in: ['scheduled', 'live'] } };
    } else {
      // For admin view, check permissions
      const user = await getUserFromCookie();
      if (!user || (user.role !== 'admin' && user.role !== 'superadmin')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    const launches = await UpcomingLaunch.find(query).sort({ launchDate: 1 });
    return NextResponse.json(launches, { status: 200 });
  } catch (error) {
    console.error('Fetch Launches Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getUserFromCookie();
    if (!user || (user.role !== 'admin' && user.role !== 'superadmin')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const body = await req.json();

    const newLaunch = new UpcomingLaunch({
      ...body,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    await newLaunch.save();
    return NextResponse.json(newLaunch, { status: 201 });
  } catch (error: any) {
    console.error('Create Launch Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
