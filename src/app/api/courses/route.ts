import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
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
    const courseData = {
      title: (body.title && typeof body.title === 'string' && body.title.trim()) || 'Untitled Course',
      description: (body.description && typeof body.description === 'string') ? body.description : 'Course syllabus overview goes here...',
      category: (body.category && typeof body.category === 'string' && body.category.trim()) ? body.category.trim() : 'General',
      price: typeof body.price === 'number' ? body.price : (parseFloat(body.price) || 0),
      thumbnail: typeof body.thumbnail === 'string' ? body.thumbnail : '',
      status: typeof body.status === 'string' ? body.status : 'draft',
      curriculum: body.curriculum ?? [],
      goals: Array.isArray(body.goals) ? body.goals.filter((g: any) => typeof g === 'string') : [],
      requirements: Array.isArray(body.requirements) ? body.requirements.filter((r: any) => typeof r === 'string') : [],
      targetAudience: Array.isArray(body.targetAudience) ? body.targetAudience.filter((t: any) => typeof t === 'string') : [],
    };

    const newCourse = await CourseRepository.create(courseData);
    return NextResponse.json(newCourse, { status: 201 });
  } catch (error: any) {
    console.error('Course creation error:', error);
    return NextResponse.json({ error: error?.message || 'Failed to create course' }, { status: 500 });
  }
}
