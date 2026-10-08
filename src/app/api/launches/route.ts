import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { LaunchRepository } from '@/lib/repositories/launch.repository';
import prisma from '@/lib/prisma';
import { getUserFromCookie } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const admin = searchParams.get('admin');

    let query: any = {};
    if (!admin) {
      // For public users, only show scheduled or live
      query = { status: { in: ['scheduled', 'live'] } };
    } else {
      // For admin view, check permissions
      const user = await getUserFromCookie();
      if (!user || (user.role !== 'admin' && user.role !== 'superadmin')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    const launches = await prisma.upcomingLaunch.findMany({
      where: query,
      orderBy: { launchDate: 'asc' }
    });
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

    const body = await req.json();

    const newLaunch = await LaunchRepository.create({
      ...body,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    return NextResponse.json(newLaunch, { status: 201 });
  } catch (error: any) {
    console.error('Create Launch Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
