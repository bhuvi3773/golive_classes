import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { LaunchRepository, canUserAccessLaunchLink, sanitizeLaunchForUser } from '@/lib/repositories/launch.repository';
import { UserRepository } from '@/lib/repositories/user.repository';
import prisma from '@/lib/prisma';
import { getUserFromCookie } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const admin = searchParams.get('admin');

    const sessionUser = await getUserFromCookie();

    if (admin) {
      // For admin view, check permissions
      if (!sessionUser || (sessionUser.role !== 'admin' && sessionUser.role !== 'superadmin')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      const launches = await prisma.upcomingLaunch.findMany({
        orderBy: { launchDate: 'asc' }
      });
      return NextResponse.json(launches, { status: 200 });
    }

    // For public / student view, only show scheduled or live sessions
    let enrolledCategories = new Set<string>();
    if (sessionUser && sessionUser.role === 'student') {
      const dbUser = await UserRepository.findById(sessionUser.userId);
      if (dbUser && dbUser.purchasedCourses) {
        dbUser.purchasedCourses.forEach((c: any) => {
          if (c.category) enrolledCategories.add(c.category.toLowerCase().trim());
        });
      }
    }

    const launches = await prisma.upcomingLaunch.findMany({
      where: { status: { in: ['scheduled', 'live'] } },
      orderBy: { launchDate: 'asc' }
    });

    const sanitizedLaunches = launches.map((l: any) => {
      const canAccess = canUserAccessLaunchLink(sessionUser?.role, enrolledCategories, l);
      return sanitizeLaunchForUser(l, canAccess);
    });

    return NextResponse.json(sanitizedLaunches, { status: 200 });
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
