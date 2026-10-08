import { NextResponse } from 'next/server';
import { CourseRepository } from '@/lib/repositories/course.repository';
import { getUserFromCookie } from '@/lib/auth';

// GET all published courses (public)
export async function GET(req: Request) {
  try {
    const user = await getUserFromCookie();
    const { searchParams } = new URL(req.url);
    const isAdminView = searchParams.get('admin') === 'true';

    let courses;
    if (isAdminView && (user?.role === 'admin' || user?.role === 'superadmin')) {
      courses = await CourseRepository.findAll();
    } else {
      courses = await CourseRepository.findPublished();
    }
    return NextResponse.json(courses, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch courses' }, { status: 500 });
  }
}

// POST new course (Admin only)
export async function POST(req: Request) {
  try {
    const user = await getUserFromCookie();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (user.role !== 'admin' && user.role !== 'superadmin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const newCourse = await CourseRepository.create(body);
    return NextResponse.json(newCourse, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create course' }, { status: 500 });
  }
}
