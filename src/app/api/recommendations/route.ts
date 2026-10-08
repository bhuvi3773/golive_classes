import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import prisma from '@/lib/prisma';
import { UserRepository } from '@/lib/repositories/user.repository';
import { getUserFromCookie } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    const user = await getUserFromCookie();
    if (!user) {
      // If not logged in, return most popular (for now just randomly sorted or newest)
      const popularCourses = await prisma.course.findMany({
        where: { status: 'published' },
        take: 10
      });
      return NextResponse.json({ recommendations: popularCourses, type: 'general' });
    }

    const dbUser = await UserRepository.findById(user.userId);
    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Extract categories user is interested in based on purchases and wishlist
    const interestedCategories = new Set<string>();
    
    dbUser.purchasedCourses.forEach((course: any) => {
      if (course.category) interestedCategories.add(course.category);
    });
    
    dbUser.wishlist.forEach((course: any) => {
      if (course.category) interestedCategories.add(course.category);
    });
    
    if (dbUser.viewedCategories) {
      dbUser.viewedCategories.forEach((cat: string) => interestedCategories.add(cat));
    }

    const categoryArray = Array.from(interestedCategories);
    const purchasedIds = dbUser.purchasedCourses.map((c: any) => c.id);

    let recommendations: any[] = [];
    let type = 'personalized';

    if (categoryArray.length > 0) {
      // Find courses in those categories that the user hasn't bought
      recommendations = await prisma.course.findMany({
        where: {
          id: { notIn: purchasedIds },
          status: 'published',
          category: { in: categoryArray }
        },
        take: 12
      });
    }

    // If we didn't find enough personalized recommendations, backfill with general ones
    if (recommendations.length < 4) {
      const extraCourses = await prisma.course.findMany({
        where: {
          id: { notIn: [...purchasedIds, ...recommendations.map(r => r.id)] },
          status: 'published'
        },
        take: 12 - recommendations.length
      });
      
      recommendations = [...recommendations, ...extraCourses];
      if (categoryArray.length === 0) type = 'general';
    }

    return NextResponse.json({ 
      recommendations,
      type,
      categories: categoryArray
    });

  } catch (error) {
    console.error('Error fetching recommendations:', error);
    return NextResponse.json({ error: 'Failed to fetch recommendations' }, { status: 500 });
  }
}
