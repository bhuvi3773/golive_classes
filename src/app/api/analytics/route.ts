import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { UserRepository } from '@/lib/repositories/user.repository';
import prisma from '@/lib/prisma';
import { getUserFromCookie } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    const user = await getUserFromCookie();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const dbUser = await UserRepository.findById(user.userId);
    if (!dbUser) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const role = dbUser.role;

    // Calculate Student Analytics for ALL roles (everyone can be a student)
    const purchasedArray = dbUser.purchasedCourses || [];
    const purchasedCount = purchasedArray.length;
    const progressDocs = await prisma.progress.findMany({ where: { userId: dbUser.id } });
    
    const courseProgressStats = purchasedArray.map(course => {
      const progressDoc = progressDocs.find(p => p.courseId === course.id);
      const curriculum = (course.curriculum as any[]) || [];
      const totalLectures = curriculum.reduce((acc: number, sec: any) => acc + (sec.lectures?.length || 0), 0);
      const completedCount = progressDoc ? progressDoc.completedLectures.length : 0;
      const percentage = totalLectures > 0 ? Math.round((completedCount / totalLectures) * 100) : 0;
      return {
        _id: course.id,
        title: course.title,
        category: course.category,
        thumbnail: course.thumbnail,
        percentage
      };
    });

    const studentStats = {
      enrolledCourses: purchasedCount,
      activeProgress: progressDocs.length,
      certificatesEarned: 0,
      courseProgressStats,
      hoursLearned: Math.round(purchasedCount * 4.5)
    };

    if (role === 'student') {
      return NextResponse.json({
        role: 'student',
        stats: studentStats,
        studentStats
      });
    }

    if (role === 'admin') {
      // Teacher Analytics: Total students enrolled in their courses
      const allUsers = await prisma.user.findMany({ where: { purchasedCourses: { some: {} } } });
      const myCourses = await prisma.course.findMany(); // In a real app with 'instructor' field, filter by instructor.
      
      // Calculate total enrollments across platform (as a placeholder for teacher's own courses)
      const topCourses = await prisma.course.findMany({ where: { status: 'published' }, take: 5 });
      
      return NextResponse.json({
        role: 'admin', // Teacher
        stats: {
          totalRevenue: 0, // Mock
          totalStudents: allUsers.length,
          topSelling: topCourses
        },
        studentStats
      });
    }

    if (role === 'superadmin') {
      // Superadmin Analytics: Platform wide
      const totalUsers = await prisma.user.count();
      const totalCourses = await prisma.course.count();
      const publishedCourses = await prisma.course.count({ where: { status: 'published' } });
      
      // Mock highly selling courses (in reality, count from Users' purchasedCourses)
      // To get real counts:
      const users = await prisma.user.findMany({ include: { purchasedCourses: true } });
      const courseCounts: Record<string, number> = {};
      users.forEach(u => {
        u.purchasedCourses?.forEach(c => {
          courseCounts[c.id] = (courseCounts[c.id] || 0) + 1;
        });
      });
      
      const sortedIds = Object.keys(courseCounts).sort((a, b) => courseCounts[b] - courseCounts[a]).slice(0, 5);
      const topSelling = await prisma.course.findMany({ where: { id: { in: sortedIds } } });

      return NextResponse.json({
        role: 'superadmin',
        stats: {
          totalUsers,
          totalCourses,
          publishedCourses,
          topSelling,
          totalRevenue: Object.values(courseCounts).reduce((a, b) => a + b * 50, 0) // Mock $50 per course
        },
        studentStats
      });
    }

    return NextResponse.json({ error: 'Invalid role' }, { status: 400 });

  } catch (error) {
    console.error('Analytics error:', error);
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}

