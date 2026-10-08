import Link from "next/link";
import { PlayCircle, Star, Clock, BookOpen } from "lucide-react";
import prisma from "@/lib/prisma";
import { getUserFromCookie } from "@/lib/auth";
import { redirect } from "next/navigation";

export const dynamic = 'force-dynamic';

export default async function CoursesPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const user = await getUserFromCookie();
  
  const resolvedParams = await searchParams;
  const query = resolvedParams.q || "";

  const categories = await prisma.category.findMany();

  let filter: any = { status: 'published' };
  if (query) {
    filter = {
      ...filter,
      OR: [
        { title: { contains: query, mode: 'insensitive' } },
        { category: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } }
      ]
    };
  }

  const courses = await prisma.course.findMany({
    where: filter,
    orderBy: { createdAt: 'desc' }
  });

  // Recommendations Logic
  let recommendedCourses: any[] = [];
  let recommendTitle = "Recommended for You";

  let dbUser = null;
  if (user) {
    dbUser = await prisma.user.findUnique({
      where: { id: user.userId },
      include: { purchasedCourses: true, wishlist: true }
    });
  }
  
  const interestedCategories = new Set<string>();

  if (dbUser) {
    dbUser.purchasedCourses?.forEach((c: any) => { if (c.category) interestedCategories.add(c.category); });
    dbUser.wishlist?.forEach((c: any) => { if (c.category) interestedCategories.add(c.category); });
    if (dbUser.viewedCategories) {
      dbUser.viewedCategories.forEach((cat: string) => interestedCategories.add(cat));
    }
  }

  // If searching, try to recommend related items if we have low search results, or just generally add the query context
  if (query) {
    const matchedCategory = categories.find(c => c.name.toLowerCase().includes(query.toLowerCase()));
    if (matchedCategory) interestedCategories.add(matchedCategory.name);
    recommendTitle = `Because you searched for "${query}"`;
  }

  const categoryArray = Array.from(interestedCategories);
  const purchasedIds = dbUser?.purchasedCourses ? dbUser.purchasedCourses.map((c: any) => c.id) : [];
  const shownCourseIds = courses.map(c => c.id);
  const excludeIds = [...purchasedIds, ...shownCourseIds];

  if (categoryArray.length > 0) {
    recommendedCourses = await prisma.course.findMany({
      where: {
        id: { notIn: excludeIds },
        status: 'published',
        category: { in: categoryArray }
      },
      take: 4
    });
  }

  // Backfill with popular/new courses if we don't have enough personalized recommendations
  if (recommendedCourses.length < 4) {
    const extraCourses = await prisma.course.findMany({
      where: {
        id: { notIn: [...excludeIds, ...recommendedCourses.map(c => c.id)] },
        status: 'published'
      },
      take: 4 - recommendedCourses.length
    });
    recommendedCourses = [...recommendedCourses, ...extraCourses];
    if (recommendedCourses.length > 0 && !query) {
      recommendTitle = "More Courses You Might Like";
    }
  }

  return (
    <div className="space-y-8 pb-16">

      {!query ? (
        <>
          {/* Welcome Banner */}
          <div className="w-full bg-gradient-to-r from-slate-100 to-slate-200 rounded-2xl p-8 border border-slate-200 relative overflow-hidden animate-in fade-in slide-in-from-bottom-4">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2"></div>
            <div className="relative z-10">
              <h1 className="text-3xl font-bold text-slate-900 mb-2">Welcome {user ? `back, ${user.name || "Student"}` : "to GoLive"}!</h1>
              <p className="text-slate-500">Ready to learn something new today? Let's dive in.</p>
            </div>
          </div>

          {/* Categories Section - Udemy Style (Pills) */}
          <section className="space-y-4 animate-in fade-in slide-in-from-bottom-4 delay-75">
            <h2 className="text-2xl font-bold text-slate-900">Top Categories</h2>

            {categories.length === 0 ? (
              <p className="text-sm text-slate-400">More categories coming soon.</p>
            ) : (
              <div className="flex flex-wrap gap-3">
                {categories.map((cat) => (
                  <Link
                    href={`/courses?q=${encodeURIComponent(cat.name)}`}
                    key={cat.id.toString()}
                    className="px-5 py-3 rounded-full bg-white border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50 hover:text-emerald-700 transition-all cursor-pointer font-bold text-sm text-slate-700 shadow-sm"
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>
            )}
          </section>
        </>
      ) : (
        /* Search Results Header */
        <div className="pb-4 border-b border-slate-200 animate-in fade-in">
          <h1 className="text-2xl font-bold text-slate-900">
            {courses.length} result{courses.length !== 1 ? 's' : ''} for "{query}"
          </h1>
        </div>
      )}

      {/* Courses Section - Udemy Style Grid */}
      <section className="space-y-6 animate-in fade-in slide-in-from-bottom-4 delay-150">
        {!query && (
          <div className="flex items-end justify-between">
            <h2 className="text-2xl font-bold text-slate-900">Featured Courses</h2>
            <span className="text-sm text-emerald-600 font-medium hover:text-blue-300 cursor-pointer">See all</span>
          </div>
        )}

        {courses.length === 0 ? (
          <div className="text-center p-12 bg-slate-50 border border-slate-200 rounded-2xl">
            {query ? (
              <>
                <h3 className="text-xl font-bold text-slate-900 mb-2">No results found</h3>
                <p className="text-slate-400">We couldn't find any courses matching "{query}". Try adjusting your search or browsing categories.</p>
              </>
            ) : (
              <p className="text-slate-400">No courses available yet. Check back soon!</p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {courses.map((course) => (
              <Link href={`/courses/${course.id}`} key={course.id.toString()} className="group flex flex-col h-full bg-white/70 backdrop-blur-md rounded-2xl border border-white shadow-lg hover:shadow-xl hover:border-emerald-300 transition-all duration-300 overflow-hidden cursor-pointer relative z-10 hover:-translate-y-1">
                {/* Thumbnail */}
                <div className="w-full aspect-video bg-slate-100 relative overflow-hidden">
                  {course.thumbnail ? (
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-tr from-emerald-100 to-sky-100 flex items-center justify-center">
                      <PlayCircle size={32} className="text-emerald-300" />
                    </div>
                  )}
                  {/* Category Badge */}
                  <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-extrabold text-emerald-700 shadow-sm border border-emerald-100">
                    {course.category}
                  </div>
                  {/* Hover Overlay Play Button */}
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="bg-white/20 backdrop-blur-md p-3 rounded-full">
                      <PlayCircle size={24} className="text-slate-900 fill-white" />
                    </div>
                  </div>
                </div>

                {/* Course Details */}
                <div className="p-4 flex flex-col flex-1">
                  <h3 className="text-sm font-bold text-slate-900 line-clamp-2 leading-tight group-hover:text-emerald-600 transition-colors">
                    {course.title}
                  </h3>

                  {/* Ratings */}
                  <div className="flex items-center gap-1 mt-2">
                    <span className="text-xs font-bold text-yellow-500">4.8</span>
                    <div className="flex items-center text-yellow-500">
                      <Star size={12} fill="currentColor" />
                      <Star size={12} fill="currentColor" />
                      <Star size={12} fill="currentColor" />
                      <Star size={12} fill="currentColor" />
                      <Star size={12} className="text-gray-300" />
                    </div>
                    <span className="text-xs text-slate-400">(1,204)</span>
                  </div>

                  {/* Price */}
                  <div className="font-bold text-base text-slate-900 mt-auto pt-4">
                    ${course.price}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Dynamic Recommendations Section */}
      {recommendedCourses.length > 0 && (
        <section className="space-y-6 pt-10 mt-10 border-t border-slate-200 animate-in fade-in slide-in-from-bottom-4 delay-300">
          <h2 className="text-2xl font-bold text-slate-900">{recommendTitle}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {recommendedCourses.map(course => (
              <Link href={`/courses/${course.id}`} key={course.id.toString()} className="group flex flex-col h-full bg-white/70 backdrop-blur-md rounded-2xl border border-white shadow-lg hover:shadow-xl hover:border-emerald-300 transition-all duration-300 overflow-hidden cursor-pointer relative z-10 hover:-translate-y-1">
                <div className="w-full aspect-video bg-slate-100 relative overflow-hidden">
                  {course.thumbnail ? (
                    <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-tr from-emerald-100 to-sky-100 flex items-center justify-center">
                      <PlayCircle size={32} className="text-emerald-300" />
                    </div>
                  )}
                  <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-extrabold text-emerald-700 shadow-sm border border-emerald-100">
                    {course.category}
                  </div>
                </div>
                <div className="p-4 flex flex-col flex-1">
                  <h3 className="text-sm font-bold text-slate-900 line-clamp-2 leading-tight group-hover:text-emerald-600 transition-colors">
                    {course.title}
                  </h3>
                  <div className="font-bold text-base text-slate-900 mt-auto pt-2">
                    ${course.price}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
