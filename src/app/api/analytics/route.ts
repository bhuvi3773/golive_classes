import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Course from '@/models/Course';
import User from '@/models/User';
import Progress from '@/models/Progress';
import { getUserFromCookie } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    const user = await getUserFromCookie();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    await connectToDatabase();
    const dbUser = await User.findById(user.userId);
    if (!dbUser) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const role = dbUser.role;

    // Calculate Student Analytics for ALL roles (everyone can be a student)
    const purchasedArray = dbUser.purchasedCourses || [];
    const purchasedCount = purchasedArray.length;
    const progressDocs = await Progress.find({ userId: dbUser._id });
    
    const purchasedCoursesFull = await Course.find({ _id: { $in: purchasedArray } });
    const courseProgressStats = purchasedCoursesFull.map(course => {
      const progressDoc = progressDocs.find(p => p.courseId.toString() === course._id.toString());
      const totalLectures = (course.curriculum || []).reduce((acc: number, sec: any) => acc + (sec.lectures?.length || 0), 0);
      const completedCount = progressDoc ? progressDoc.completedLectures.length : 0;
      const percentage = totalLectures > 0 ? Math.round((completedCount / totalLectures) * 100) : 0;
      return {
        _id: course._id.toString(),
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
      const allUsers = await User.find({ purchasedCourses: { $exists: true, $not: {$size: 0} } });
      const myCourses = await Course.find(); // In a real app with 'instructor' field, filter by instructor.
      
      // Calculate total enrollments across platform (as a placeholder for teacher's own courses)
      const topCourses = await Course.find({ status: 'published' }).limit(5); // Mock
      
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
      const totalUsers = await User.countDocuments();
      const totalCourses = await Course.countDocuments();
      const publishedCourses = await Course.countDocuments({ status: 'published' });
      
      // Mock highly selling courses (in reality, count from Users' purchasedCourses)
      // To get real counts:
      const users = await User.find();
      const courseCounts: Record<string, number> = {};
      users.forEach(u => {
        u.purchasedCourses?.forEach(cid => {
          courseCounts[cid.toString()] = (courseCounts[cid.toString()] || 0) + 1;
        });
      });
      
      const sortedIds = Object.keys(courseCounts).sort((a, b) => courseCounts[b] - courseCounts[a]).slice(0, 5);
      const topSelling = await Course.find({ _id: { $in: sortedIds } });

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
