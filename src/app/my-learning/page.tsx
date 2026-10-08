import Link from "next/link";
import { BookOpen, Search, PlayCircle } from "lucide-react";
import prisma from "@/lib/prisma";
import { getUserFromCookie } from "@/lib/auth";

export const dynamic = 'force-dynamic';

export default async function MyLearningPage() {
  const user = await getUserFromCookie();
  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-800 mb-4">Please log in to view your learning</h2>
          <Link href="/login" className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Go to Login</Link>
        </div>
      </div>
    );
  }
  
  const dbUser = await prisma.user.findUnique({
    where: { id: user.userId },
    include: { purchasedCourses: true, wishlist: true }
  });
  const enrolledCourses = dbUser?.purchasedCourses || [];

  let recommendedCourses: any[] = [];
  if (dbUser) {
    const interestedCategories = new Set<string>();
    dbUser.purchasedCourses?.forEach((c: any) => { if (c.category) interestedCategories.add(c.category); });
    dbUser.wishlist?.forEach((c: any) => { if (c.category) interestedCategories.add(c.category); });
    if (dbUser.viewedCategories) {
      dbUser.viewedCategories.forEach((cat: string) => interestedCategories.add(cat));
    }
    
    const categoryArray = Array.from(interestedCategories);
    const purchasedIds = enrolledCourses.map((c: any) => c.id);
    
    if (categoryArray.length > 0) {
      recommendedCourses = await prisma.course.findMany({
        where: {
          id: { notIn: purchasedIds },
          status: 'published',
          category: { in: categoryArray }
        },
        take: 4
      });
    }
    
    if (recommendedCourses.length < 4) {
      const extraCourses = await prisma.course.findMany({
        where: {
          id: { notIn: [...purchasedIds, ...recommendedCourses.map((c: any) => c.id)] },
          status: 'published'
        },
        take: 4 - recommendedCourses.length
      });
      recommendedCourses = [...recommendedCourses, ...extraCourses];
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">My Learning</h1>
          <p className="text-slate-500 mt-1">Pick up right where you left off, Student.</p>
        </div>
        
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <input 
            type="text" 
            placeholder="Search my courses..." 
            className="w-full bg-slate-100 border border-slate-200 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-blue-500 transition-colors text-slate-900"
          />
        </div>
      </div>

      {enrolledCourses.length === 0 ? (
        <div className="bg-white/60 backdrop-blur-md border border-white shadow-xl rounded-3xl p-12 text-center flex flex-col items-center justify-center space-y-4">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-100 to-sky-100 flex items-center justify-center text-emerald-600 mb-2 shadow-inner border border-white">
            <BookOpen size={40} />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900">You aren't enrolled in any courses yet</h2>
          <p className="text-slate-500 max-w-md mx-auto text-lg">Browse our catalog to find your next favorite course and expand your skill set.</p>
          <Link href="/courses">
            <button className="bg-slate-900 hover:bg-slate-800 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl mt-4">Explore Catalog</button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {enrolledCourses.map((course: any) => (
            <Link href={`/courses/${course.id}/play`} key={course.id.toString()} className="group">
              <div className="bg-white/70 backdrop-blur-md border border-white shadow-lg hover:shadow-2xl hover:border-emerald-300 rounded-2xl p-5 flex flex-col transition-all hover:-translate-y-1 h-full cursor-pointer relative z-10">
              <div className="flex gap-4 mb-6">
                <div className="w-24 h-24 rounded-lg bg-gray-800 overflow-hidden flex-shrink-0">
                  {course.thumbnail ? (
                    <img src={course.thumbnail} className="w-full h-full object-cover" alt="thumbnail"/>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <BookOpen className="text-gray-600" size={24} />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-slate-900 line-clamp-2">{course.title}</h3>
                  <p className="text-sm text-slate-500 mt-1">{course.category}</p>
                </div>
              </div>
              
              <div className="mt-auto space-y-4">
                <div className="w-full bg-slate-100 rounded-full h-1.5">
                  <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: '12%' }}></div>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-sm font-bold text-emerald-600">0% Complete</span>
                  <button className="px-5 py-2 bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white border border-emerald-200 hover:border-emerald-600 rounded-lg text-sm font-bold transition-colors">
                    Resume
                  </button>
                </div>
              </div>
            </div>
            </Link>
          ))}
        </div>
      )}

      {/* Dynamic Recommendations Section */}
      {recommendedCourses.length > 0 && (
        <section className="space-y-6 pt-10 mt-10 border-t border-slate-200 animate-in fade-in slide-in-from-bottom-4 delay-300">
          <h2 className="text-2xl font-bold text-slate-900">Recommended for You</h2>
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
