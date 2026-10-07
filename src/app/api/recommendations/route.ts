import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Course from '@/models/Course';
import User from '@/models/User';
import { getUserFromCookie } from '@/lib/auth';
import mongoose from 'mongoose';

export async function GET(req: Request) {
  try {
    const user = await getUserFromCookie();
    await connectToDatabase();

    if (!user) {
      // If not logged in, return most popular (for now just randomly sorted or newest)
      const popularCourses = await Course.find({ status: 'published' }).limit(10);
      return NextResponse.json({ recommendations: popularCourses, type: 'general' });
    }

    const dbUser = await User.findById(user.userId).populate('purchasedCourses wishlist');
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
    const purchasedIds = dbUser.purchasedCourses.map((c: any) => c._id);

    let recommendations: any[] = [];
    let type = 'personalized';

    if (categoryArray.length > 0) {
      // Find courses in those categories that the user hasn't bought
      recommendations = await Course.find({
        _id: { $nin: purchasedIds },
        status: 'published',
        category: { $in: categoryArray }
      }).limit(12);
    }

    // If we didn't find enough personalized recommendations, backfill with general ones
    if (recommendations.length < 4) {
      const extraCourses = await Course.find({
        _id: { $nin: [...purchasedIds, ...recommendations.map(r => r._id)] },
        status: 'published'
      }).limit(12 - recommendations.length);
      
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
