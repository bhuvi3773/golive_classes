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

    if (role === 'admin' || role === 'superadmin') {
      const users = await prisma.user.findMany({ include: { purchasedCourses: true } });
      const totalCoursesCount = await prisma.course.count();
      const publishedCoursesCount = await prisma.course.count({ where: { status: 'published' } });
      
      const courseCounts: Record<string, number> = {};
      let totalRevenue = 0;
      let totalStudents = 0;

      users.forEach(u => {
        if (u.purchasedCourses && u.purchasedCourses.length > 0) {
          totalStudents++;
          u.purchasedCourses.forEach(c => {
            courseCounts[c.id] = (courseCounts[c.id] || 0) + 1;
            totalRevenue += (c.price || 0);
          });
        }
      });

      const sortedIds = Object.keys(courseCounts).sort((a, b) => courseCounts[b] - courseCounts[a]).slice(0, 5);
      const topSelling = await prisma.course.findMany({ where: { id: { in: sortedIds } } });
      
      const settings = await prisma.platformSetting.findFirst();
      const commissionRate = settings?.commissionRate || 20;

      if (role === 'admin') {
        const instructorRevenue = totalRevenue * (1 - (commissionRate / 100));
        return NextResponse.json({
          role: 'admin',
          stats: {
            totalRevenue: instructorRevenue.toFixed(2),
            totalStudents,
            topSelling
          },
          studentStats
        });
      } else {
        return NextResponse.json({
          role: 'superadmin',
          stats: {
            totalUsers: users.length,
            totalCourses: totalCoursesCount,
            publishedCourses: publishedCoursesCount,
            topSelling,
            totalRevenue: totalRevenue.toFixed(2)
          },
          studentStats
        });
      }
    }

    return NextResponse.json({ error: 'Invalid role' }, { status: 400 });

  } catch (error) {
    console.error('Analytics error:', error);
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}
