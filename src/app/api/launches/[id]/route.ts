import { NextResponse } from 'next/server';
import { LaunchRepository, canUserAccessLaunchLink, sanitizeLaunchForUser } from '@/lib/repositories/launch.repository';
import { UserRepository } from '@/lib/repositories/user.repository';
import { getUserFromCookie } from '@/lib/auth';

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const launch = await LaunchRepository.findById(id);

    if (!launch) {
      return NextResponse.json({ error: 'Launch not found' }, { status: 404 });
    }

    const sessionUser = await getUserFromCookie();
    let enrolledCategories = new Set<string>();

    if (sessionUser && sessionUser.role === 'student') {
      const dbUser = await UserRepository.findById(sessionUser.userId);
      if (dbUser && dbUser.purchasedCourses) {
        dbUser.purchasedCourses.forEach((c: any) => {
          if (c.category) enrolledCategories.add(c.category.toLowerCase().trim());
        });
      }
    }

    const canAccess = canUserAccessLaunchLink(sessionUser?.role, enrolledCategories, launch);
    const sanitized = sanitizeLaunchForUser(launch, canAccess);

    return NextResponse.json(sanitized, { status: 200 });
  } catch (error) {
    console.error('Get Launch Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserFromCookie();

    if (!user || (user.role !== 'admin' && user.role !== 'superadmin')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // params.id requires await in Next.js 15+
    const { id } = await context.params;
    
    const deletedLaunch = await LaunchRepository.delete(id);

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

    const { id } = await context.params;
    
    const body = await req.json();
    body.updatedAt = new Date();

    const updatedLaunch = await LaunchRepository.update(id, body);

    if (!updatedLaunch) {
      return NextResponse.json({ error: 'Launch not found' }, { status: 404 });
    }

    return NextResponse.json(updatedLaunch, { status: 200 });
  } catch (error: any) {
    console.error('Update Launch Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
