import { NextResponse } from 'next/server';
import { CourseRepository } from '@/lib/repositories/course.repository';
import { UserRepository } from '@/lib/repositories/user.repository';
import { getUserFromCookie } from '@/lib/auth';
import { sendCourseRecommendationEmail } from '@/lib/email';
import prisma from '@/lib/prisma';

export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserFromCookie();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (user.role !== 'admin' && user.role !== 'superadmin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // params.id requires await in Next.js 15+
    const { id } = await context.params;
    
    const deletedCourse = await CourseRepository.delete(id);

    if (!deletedCourse) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Course deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Delete Course Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    
    const course = await CourseRepository.findById(id);
    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    const user = await getUserFromCookie();
    let isOwner = false;
    let isAdmin = user && (user.role === 'admin' || user.role === 'superadmin');

    if (user && user.userId) {
      // Fire off a background task to send recommendation emails if a user is logged in
      (async () => {
        try {
          const dbUser = await UserRepository.findById(user.userId);
          // Check ownership
          if (dbUser && dbUser.purchasedCourses && dbUser.purchasedCourses.some(c => c.id === course.id)) {
            isOwner = true;
          }
          
          // Only send if they haven't already purchased this course
          if (dbUser && !isOwner) {
            
            // Find 3 recommended courses in the same category
            const recommendations = await prisma.course.findMany({
              where: {
                id: { not: course.id },
                category: course.category,
                status: 'published'
              },
              take: 3
            });

            if (recommendations.length > 0) {
              await sendCourseRecommendationEmail(
                user.email as string,
                user.name || 'Student',
                course.title,
                recommendations
              );
            }
          }
        } catch (e) {
          console.error("Failed to send background recommendation email:", e);
        }
      })();
      
      // We also need to synchronously check ownership for the current request
      if (!isOwner) {
         const dbUser = await UserRepository.findById(user.userId);
         if (dbUser && dbUser.purchasedCourses && dbUser.purchasedCourses.some(c => c.id === course.id)) {
           isOwner = true;
         }
      }
    }

    // Sanitize course data if not owner or admin
    let courseData = JSON.parse(JSON.stringify(course));
    if (!isOwner && !isAdmin) {
      if (courseData.curriculum && courseData.curriculum.length > 0) {
        let firstLectureId: number | null = null;
        if (courseData.curriculum[0].lectures && courseData.curriculum[0].lectures.length > 0) {
          firstLectureId = courseData.curriculum[0].lectures[0].id;
        }

        courseData.curriculum.forEach((section: any) => {
          if (section.lectures) {
            section.lectures.forEach((lecture: any) => {
              if (lecture.id !== firstLectureId) {
                // Remove content for non-preview lectures
                delete lecture.content;
                delete lecture.quizData;
              }
            });
          }
        });
      }
    }

    return NextResponse.json(courseData, { status: 200 });
  } catch (error) {
    console.error('Get Course Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserFromCookie();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (user.role !== 'admin' && user.role !== 'superadmin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await context.params;
    
    const body = await req.json();

    const updatedCourse = await CourseRepository.update(id, body);

    if (!updatedCourse) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    return NextResponse.json(updatedCourse, { status: 200 });
  } catch (error: any) {
    console.error('Update Course Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
