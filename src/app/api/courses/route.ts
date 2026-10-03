import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Course from '@/models/Course';
import { getUserFromCookie } from '@/lib/auth';

// GET all published courses (public)
export async function GET(req: Request) {
  try {
    await connectToDatabase();
    // We can add query params to filter by 'draft' if Admin is fetching
    const user = await getUserFromCookie();
    
    const { searchParams } = new URL(req.url);
    const isAdminView = searchParams.get('admin') === 'true';

    let filter = { status: 'published' };
    if (isAdminView && user?.role === 'admin') {
      filter = {} as any; // Admin sees everything
    }

    const courses = await Course.find(filter).sort({ createdAt: -1 });
    return NextResponse.json(courses, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch courses' }, { status: 500 });
  }
}

// POST new course (Admin only)
export async function POST(req: Request) {
  try {
    const user = await getUserFromCookie();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    await connectToDatabase();
    
    const newCourse = await Course.create(body);
    return NextResponse.json(newCourse, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create course' }, { status: 500 });
  }
}
