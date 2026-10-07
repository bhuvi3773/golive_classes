import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Course from '@/models/Course';
import { getUserFromCookie } from '@/lib/auth';
import User from '@/models/User';
import { sendCourseRecommendationEmail } from '@/lib/email';

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

    await connectToDatabase();
    
    // params.id requires await in Next.js 15+
    const { id } = await context.params;
    const courseId = id;
    
    const deletedCourse = await Course.findByIdAndDelete(courseId);

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
    await connectToDatabase();
    const { id } = await context.params;
    
    const course = await Course.findById(id);
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
          const dbUser = await User.findById(user.userId);
          // Check ownership
          if (dbUser && dbUser.purchasedCourses && dbUser.purchasedCourses.includes(course._id)) {
            isOwner = true;
          }
          
          // Only send if they haven't already purchased this course
          if (dbUser && !isOwner) {
            
            // Find 3 recommended courses in the same category
            const recommendations = await Course.find({
              _id: { $ne: course._id },
              category: course.category,
              status: 'published'
            }).limit(3);

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
         const dbUser = await User.findById(user.userId);
         if (dbUser && dbUser.purchasedCourses && dbUser.purchasedCourses.includes(course._id)) {
           isOwner = true;
         }
      }
    }

    // Sanitize course data if not owner or admin
    let courseData = course.toObject();
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

    await connectToDatabase();
    const { id } = await context.params;
    
    const body = await req.json();

    const updatedCourse = await Course.findByIdAndUpdate(id, body, { new: true });

    if (!updatedCourse) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    return NextResponse.json(updatedCourse, { status: 200 });
  } catch (error: any) {
    console.error('Update Course Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
