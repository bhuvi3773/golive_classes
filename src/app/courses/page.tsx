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
    <div className="space-y-10 pb-16">

      {!query ? (
        <>
          {/* Welcome Banner */}
          <div className="w-full bg-[#24483C] text-[#F8F4EC] rounded-2xl p-5 sm:p-8 border border-[#19332A] relative overflow-hidden shadow-md">
            <div className="relative z-10">
              <span className="text-xs uppercase tracking-wider text-[#DCE6D8] font-bold">Academic Portal</span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#FFFFFF] mt-1 mb-2">Welcome back, {user.name || "Scholar"}!</h1>
              <p className="text-[#DCE6D8] font-normal text-sm md:text-base">Explore structured modules, build practical projects, and advance your technical craft.</p>
            </div>
          </div>

          {/* Categories Section */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-[#1B2E26]">Academic Disciplines</h2>

            {categories.length === 0 ? (
              <p className="text-sm text-[#72857C]">More disciplines coming soon.</p>
            ) : (
              <div className="flex flex-wrap gap-2.5">
                {categories.map((cat) => (
                  <Link
                    href={`/courses?q=${encodeURIComponent(cat.name)}`}
                    key={cat.id.toString()}
                    className="px-4 py-2 rounded-full bg-[#FFFFFF] border border-[#E9DFCC] hover:border-[#24483C] hover:bg-[#24483C] hover:text-[#F8F4EC] transition-all cursor-pointer font-semibold text-xs text-[#2C3E35] shadow-xs"
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
        <div className="pb-4 border-b border-[#E9DFCC]">
          <h1 className="text-2xl font-bold text-[#1B2E26]">
            {courses.length} result{courses.length !== 1 ? 's' : ''} for "{query}"
          </h1>
        </div>
      )}

      {/* Courses Section */}
      <section className="space-y-6">
        {!query && (
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-[#E9DFCC] pb-3">
            <div>
              <h2 className="text-2xl font-bold text-[#1B2E26]">Curriculum Catalog</h2>
              <p className="text-xs text-[#72857C] mt-0.5">Courses currently open for enrollment</p>
            </div>
            <span className="text-xs text-[#24483C] font-semibold uppercase tracking-wider">{courses.length} Total Modules</span>
          </div>
        )}

        {courses.length === 0 ? (
          <div className="text-center p-12 bg-[#FFFFFF] rounded-2xl border border-[#E9DFCC]">
            {query ? (
              <>
                <h3 className="text-xl font-bold text-[#1B2E26] mb-2">No matching curriculum found</h3>
                <p className="text-[#4A5E54] text-sm">We couldn't find any courses matching "{query}". Try adjusting your keywords or browsing categories above.</p>
              </>
            ) : (
              <p className="text-[#72857C] text-sm">No courses available yet. Check back soon!</p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {courses.map((course) => (
              <Link href={`/courses/${course.id}`} key={course.id.toString()} className="editorial-card rounded-xl flex flex-col h-full bg-[#FFFFFF] group relative overflow-hidden">
                {/* Thumbnail */}
                <div className="w-full aspect-video bg-[#F4EFE6] relative overflow-hidden border-b border-[#E9DFCC]">
                  {course.thumbnail ? (
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-[#EEF3EC] flex items-center justify-center">
                      <BookOpen size={30} className="text-[#24483C]/30" />
                    </div>
                  )}
                  {/* Category Badge */}
                  <div className="absolute top-2.5 right-2.5 bg-[#FFFFFF]/90 backdrop-blur-md px-3 py-1 rounded-full text-[11px] font-bold text-[#24483C] border border-[#E9DFCC] shadow-xs">
                    {course.category}
                  </div>

                  {/* Hover Overlay Play Button */}
                  <div className="absolute inset-0 bg-[#1B2E26]/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="bg-[#FFFFFF] p-2.5 rounded-full shadow-md">
                      <PlayCircle size={22} className="text-[#24483C]" />
                    </div>
                  </div>
                </div>

                {/* Course Details */}
                <div className="p-5 flex flex-col flex-1">
                  <h3 className="text-base font-bold text-[#1B2E26] line-clamp-2 leading-snug group-hover:text-[#24483C] transition-colors">
                    {course.title}
                  </h3>

                  {/* Ratings */}
                  <div className="flex items-center gap-1 mt-2.5">
                    <span className="text-xs font-bold text-[#C96F4A]">4.8</span>
                    <div className="flex items-center text-[#C96F4A]">
                      <Star size={11} fill="currentColor" />
                      <Star size={11} fill="currentColor" />
                      <Star size={11} fill="currentColor" />
                      <Star size={11} fill="currentColor" />
                      <Star size={11} className="text-[#D8CCB5]" />
                    </div>
                    <span className="text-[11px] text-[#72857C]">(1,204)</span>
                  </div>

                  {/* Price */}
                  <div className="font-extrabold text-xl text-[#24483C] mt-auto pt-4 border-t border-[#E9DFCC] flex items-center justify-between">
                    <span>${course.price}</span>
                    <span className="text-xs font-semibold text-[#4A5E54] group-hover:text-[#24483C] transition-colors">Details →</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Dynamic Recommendations Section */}
      {recommendedCourses.length > 0 && (
        <section className="space-y-6 pt-8 border-t border-[#E9DFCC]">
          <div>
            <h2 className="text-xl font-bold text-[#1B2E26]">{recommendTitle}</h2>
            <p className="text-xs text-[#72857C]">Suggested based on your learning trajectory</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {recommendedCourses.map(course => (
              <Link href={`/courses/${course.id}`} key={course.id.toString()} className="editorial-card rounded-xl flex flex-col h-full bg-[#FFFFFF] group relative overflow-hidden">
                <div className="w-full aspect-video bg-[#F4EFE6] relative overflow-hidden border-b border-[#E9DFCC]">
                  {course.thumbnail ? (
                    <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="absolute inset-0 bg-[#EEF3EC] flex items-center justify-center">
                      <BookOpen size={30} className="text-[#24483C]/30" />
                    </div>
                  )}
                  <div className="absolute top-2.5 right-2.5 bg-[#FFFFFF]/90 backdrop-blur-md px-3 py-1 rounded-full text-[11px] font-bold text-[#24483C] border border-[#E9DFCC] shadow-xs">
                    {course.category}
                  </div>
                </div>
                <div className="p-5 flex flex-col flex-1">
                  <h3 className="text-base font-bold text-[#1B2E26] line-clamp-2 leading-snug group-hover:text-[#24483C] transition-colors">
                    {course.title}
                  </h3>
                  <div className="font-extrabold text-xl text-[#24483C] mt-auto pt-4 border-t border-[#E9DFCC] flex items-center justify-between">
                    <span>${course.price}</span>
                    <span className="text-xs font-semibold text-[#4A5E54] group-hover:text-[#24483C]">View →</span>
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
