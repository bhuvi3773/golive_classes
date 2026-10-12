import Link from "next/link";
import { BookOpen, Search, PlayCircle } from "lucide-react";
import prisma from "@/lib/prisma";
import { getUserFromCookie } from "@/lib/auth";

export const dynamic = 'force-dynamic';

export default async function MyLearningPage() {
  const user = await getUserFromCookie();
  if (!user) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center glass-card p-12 rounded-2xl border border-white/10">
          <h2 className="text-2xl font-bold text-white mb-4">Please log in to view your learning</h2>
          <Link href="/login" className="px-6 py-2 bg-teal-500 text-slate-900 rounded-lg hover:bg-teal-400 font-bold transition-colors">Go to Login</Link>
        </div>
      </div>
    );
  }
  
  const dbUser = await prisma.user.findUnique({
    where: { id: user.userId },
    include: { purchasedCourses: true, wishlist: true }
  });
  
  const userProgresses = await prisma.progress.findMany({
    where: { userId: user.userId }
  });
  
  const enrolledCourses = dbUser?.purchasedCourses || [];
  
  const enrichedCourses = enrolledCourses.map((course: any) => {
    const progress = userProgresses.find(p => p.courseId === course.id);
    const completedIds = progress?.completedLectures || [];
    const lastAccessed = progress?.lastAccessedLecture;
    
    let totalLectures = 0;
    let completedCount = 0;
    let firstIncompleteId = null;
    let firstLectureId = null;
    let isLastAccessedValid = false;

    const curriculum = (course.curriculum as any[]) || [];
    
    for (const section of curriculum) {
      for (const lecture of (section.lectures || [])) {
        if (!firstLectureId) firstLectureId = lecture.id;
        
        totalLectures++;
        if (completedIds.includes(lecture.id)) {
          completedCount++;
        } else if (!firstIncompleteId) {
          firstIncompleteId = lecture.id;
        }

        if (lastAccessed && lastAccessed === lecture.id) {
          isLastAccessedValid = true;
        }
      }
    }

    const progressPercentage = totalLectures === 0 ? 0 : Math.min(100, Math.round((completedCount / totalLectures) * 100));
    
    let resumeLectureId = null;
    if (isLastAccessedValid) {
      resumeLectureId = lastAccessed;
    } else if (firstIncompleteId) {
      resumeLectureId = firstIncompleteId;
    } else if (firstLectureId) {
      resumeLectureId = firstLectureId;
    }

    const playUrl = resumeLectureId ? `/courses/${course.id}/play?lectureId=${resumeLectureId}` : `/courses/${course.id}/play`;

    return { ...course, progressPercentage, playUrl };
  });

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
          <h1 className="text-3xl font-extrabold text-white">My Learning</h1>
          <p className="text-slate-400 mt-1">Pick up right where you left off, Student.</p>
        </div>
        
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <input 
            type="text" 
            placeholder="Search my courses..." 
            className="w-full bg-slate-800/50 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-colors text-white placeholder:text-slate-500"
          />
        </div>
      </div>

      {enrichedCourses.length === 0 ? (
        <div className="glass-card border border-white/10 shadow-2xl rounded-3xl p-12 text-center flex flex-col items-center justify-center space-y-4">
          <div className="w-20 h-20 rounded-full bg-teal-500/10 flex items-center justify-center text-teal-400 mb-2 shadow-inner border border-teal-500/20">
            <BookOpen size={40} />
          </div>
          <h2 className="text-2xl font-extrabold text-white">You aren't enrolled in any courses yet</h2>
          <p className="text-slate-400 max-w-md mx-auto text-lg">Browse our catalog to find your next favorite course and expand your skill set.</p>
          <Link href="/courses">
            <button className="bg-teal-500 hover:bg-teal-400 text-slate-900 px-8 py-3 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl mt-4">Explore Catalog</button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {enrichedCourses.map((course: any) => (
            <Link href={course.playUrl} key={course.id.toString()} className="group">
              <div className="glass-card border border-white/10 shadow-lg hover:shadow-2xl hover:border-teal-500/50 rounded-2xl p-5 flex flex-col transition-all hover:-translate-y-1 h-full cursor-pointer relative z-10">
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
                  <h3 className="text-lg font-bold text-white line-clamp-2">{course.title}</h3>
                  <p className="text-sm text-slate-400 mt-1">{course.category}</p>
                </div>
              </div>
              
              <div className="mt-auto space-y-4">
                <div className="w-full bg-slate-800 rounded-full h-1.5">
                  <div className="bg-teal-500 shadow-[0_0_10px_rgba(20,184,166,0.5)] h-1.5 rounded-full" style={{ width: `${course.progressPercentage}%` }}></div>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-sm font-bold text-teal-400">{course.progressPercentage}% Complete</span>
                  <button className="px-5 py-2 bg-teal-500/10 hover:bg-teal-500 text-teal-400 hover:text-white border border-teal-500/20 hover:border-teal-500 rounded-lg text-sm font-bold transition-colors">
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
        <section className="space-y-6 pt-10 mt-10 border-t border-white/10 animate-in fade-in slide-in-from-bottom-4 delay-300">
          <h2 className="text-2xl font-bold text-white">Recommended for You</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {recommendedCourses.map(course => (
              <Link href={`/courses/${course.id}`} key={course.id.toString()} className="group flex flex-col h-full glass-card rounded-2xl border border-white/10 shadow-lg hover:shadow-xl hover:border-teal-500/50 transition-all duration-300 overflow-hidden cursor-pointer relative z-10 hover:-translate-y-1">
                <div className="w-full aspect-video bg-slate-800 relative overflow-hidden">
                  {course.thumbnail ? (
                    <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-tr from-teal-900/40 to-slate-800 flex items-center justify-center">
                      <PlayCircle size={32} className="text-teal-500" />
                    </div>
                  )}
                  <div className="absolute top-2 right-2 bg-slate-900/80 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-extrabold text-teal-400 shadow-sm border border-white/10">
                    {course.category}
                  </div>
                </div>
                <div className="p-4 flex flex-col flex-1">
                  <h3 className="text-sm font-bold text-white line-clamp-2 leading-tight group-hover:text-teal-400 transition-colors">
                    {course.title}
                  </h3>
                  <div className="font-bold text-base text-white mt-auto pt-2">
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
