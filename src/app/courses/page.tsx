import Link from "next/link";
import { PlayCircle, Star, Clock, BookOpen } from "lucide-react";
import prisma from "@/lib/prisma";
import { getUserFromCookie } from "@/lib/auth";
import { redirect } from "next/navigation";

export const dynamic = 'force-dynamic';

export default async function CoursesPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const user = await getUserFromCookie();
  
  if (!user) {
    redirect('/login');
  }
  
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

  const dbUser = await prisma.user.findUnique({
    where: { id: user.userId },
    include: { purchasedCourses: true, wishlist: true }
  });
  
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
          <div className="w-full bg-slate-900/60 backdrop-blur-2xl rounded-2xl p-8 border border-white/10 relative overflow-hidden shadow-2xl animate-in fade-in slide-in-from-bottom-4">
            <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
            <div className="absolute bottom-0 left-1/4 w-48 h-48 bg-teal-500/10 rounded-full blur-[60px] translate-y-1/2 pointer-events-none"></div>
            <div className="relative z-10">
              <h1 className="text-3xl font-extrabold text-white mb-2 drop-shadow-sm">Welcome back, {user.name || "Student"}!</h1>
              <p className="text-slate-300 font-medium">Ready to learn something new today? Let's dive in.</p>
            </div>
          </div>

          {/* Categories Section - Udemy Style (Pills) */}
          <section className="space-y-4 animate-in fade-in slide-in-from-bottom-4 delay-75">
            <h2 className="text-2xl font-bold text-white">Top Categories</h2>

            {categories.length === 0 ? (
              <p className="text-sm text-slate-400">More categories coming soon.</p>
            ) : (
              <div className="flex flex-wrap gap-3">
                {categories.map((cat) => (
                  <Link
                    href={`/courses?q=${encodeURIComponent(cat.name)}`}
                    key={cat.id.toString()}
                    className="px-5 py-2.5 rounded-full bg-slate-800/50 border border-white/10 hover:border-teal-500/50 hover:bg-teal-500/20 hover:text-teal-300 transition-all cursor-pointer font-bold text-sm text-slate-300 shadow-lg shadow-black/20"
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
        <div className="pb-4 border-b border-white/10 animate-in fade-in">
          <h1 className="text-2xl font-bold text-white">
            {courses.length} result{courses.length !== 1 ? 's' : ''} for "{query}"
          </h1>
        </div>
      )}

      {/* Courses Section - Udemy Style Grid */}
      <section className="space-y-6 animate-in fade-in slide-in-from-bottom-4 delay-150">
        {!query && (
          <div className="flex items-end justify-between">
            <h2 className="text-2xl font-bold text-white">Featured Courses</h2>
            <span className="text-sm text-teal-400 font-medium hover:text-cyan-300 transition-colors cursor-pointer">See all</span>
          </div>
        )}

        {courses.length === 0 ? (
          <div className="text-center p-12 glass-card rounded-2xl">
            {query ? (
              <>
                <h3 className="text-xl font-bold text-white mb-2">No results found</h3>
                <p className="text-slate-400">We couldn't find any courses matching "{query}". Try adjusting your search or browsing categories.</p>
              </>
            ) : (
              <p className="text-slate-400">No courses available yet. Check back soon!</p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {courses.map((course) => (
              <Link href={`/courses/${course.id}`} key={course.id.toString()} className="glass-card rounded-3xl flex flex-col h-full group hover:border-teal-400/40 relative z-10 transition-all duration-300">
                {/* Thumbnail */}
                <div className="w-full aspect-video bg-slate-900 relative overflow-hidden border-b border-white/5">
                  {course.thumbnail ? (
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-105 opacity-80 mix-blend-overlay transition-transform duration-500"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-tr from-teal-900/50 to-slate-900 flex items-center justify-center">
                      <PlayCircle size={32} className="text-white/30" />
                    </div>
                  )}
                  {/* Category Badge */}
                  <div className="absolute top-3 right-3 bg-slate-900/80 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-extrabold text-teal-300 border border-teal-500/30 shadow-lg shadow-black/50">
                    {course.category}
                  </div>
                  {/* Hover Overlay Play Button */}
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="bg-slate-900/50 backdrop-blur-md p-3 rounded-full border border-white/20">
                      <PlayCircle size={24} className="text-white fill-teal-500/80" />
                    </div>
                  </div>
                </div>

                {/* Course Details */}
                <div className="p-6 flex flex-col flex-1">
                  <h3 className="text-xl font-bold text-white line-clamp-2 leading-tight group-hover:text-teal-400 transition-colors">
                    {course.title}
                  </h3>
                  
                  {/* description is currently missing from the original card layout, but we can add it for consistency or keep it as is, wait, the original didn't have description in this view, just title, rating, price. Let's keep the structure identical. */}

                  {/* Ratings */}
                  <div className="flex items-center gap-1 mt-2">
                    <span className="text-xs font-bold text-yellow-500">4.8</span>
                    <div className="flex items-center text-yellow-500">
                      <Star size={12} fill="currentColor" />
                      <Star size={12} fill="currentColor" />
                      <Star size={12} fill="currentColor" />
                      <Star size={12} fill="currentColor" />
                      <Star size={12} className="text-slate-600" />
                    </div>
                    <span className="text-xs text-slate-400">(1,204)</span>
                  </div>

                  {/* Price */}
                  <div className="font-bold text-2xl text-white mt-auto pt-4 flex items-center justify-between">
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
        <section className="space-y-6 pt-10 mt-10 border-t border-white/10 animate-in fade-in slide-in-from-bottom-4 delay-300">
          <h2 className="text-2xl font-bold text-white">{recommendTitle}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {recommendedCourses.map(course => (
              <Link href={`/courses/${course.id}`} key={course.id.toString()} className="glass-card rounded-3xl flex flex-col h-full group hover:border-teal-400/40 relative z-10 transition-all duration-300">
                <div className="w-full aspect-video bg-slate-900 relative overflow-hidden border-b border-white/5">
                  {course.thumbnail ? (
                    <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 opacity-80 mix-blend-overlay transition-transform duration-500" />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-tr from-teal-900/50 to-slate-900 flex items-center justify-center">
                      <PlayCircle size={32} className="text-white/30" />
                    </div>
                  )}
                  <div className="absolute top-3 right-3 bg-slate-900/80 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-extrabold text-teal-300 border border-teal-500/30 shadow-lg shadow-black/50">
                    {course.category}
                  </div>
                </div>
                <div className="p-6 flex flex-col flex-1">
                  <h3 className="text-xl font-bold text-white line-clamp-2 leading-tight group-hover:text-teal-400 transition-colors">
                    {course.title}
                  </h3>
                  <div className="font-bold text-2xl text-white mt-auto pt-4 flex items-center justify-between">
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
