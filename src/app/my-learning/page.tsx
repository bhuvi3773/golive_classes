import Link from "next/link";
import { BookOpen, Search, PlayCircle } from "lucide-react";
import prisma from "@/lib/prisma";
import { getUserFromCookie } from "@/lib/auth";

export const dynamic = 'force-dynamic';

export default async function MyLearningPage() {
  const user = await getUserFromCookie();
  if (!user) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <div className="text-center bg-[#FAF7F0] p-12 rounded-2xl border border-[#E9DFCC] shadow-sm max-w-md w-full text-[#1B2E26]">
          <div className="w-16 h-16 rounded-2xl bg-[#DCE6D8] text-[#24483C] flex items-center justify-center mx-auto mb-4">
            <BookOpen size={28} />
          </div>
          <h2 className="font-serif text-2xl font-bold text-[#1B2E26] mb-2">Academic Sign In Required</h2>
          <p className="text-[#556960] text-sm mb-6">Please log in to your academy account to view your enrolled courses and lecture progress.</p>
          <Link href="/login" className="inline-block px-6 py-3 bg-[#24483C] text-[#F8F4EC] rounded-xl hover:bg-[#1B2E26] text-sm font-semibold uppercase tracking-wider transition-colors shadow-sm">
            Go to Login
          </Link>
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
    <div className="space-y-8 text-[#1B2E26]">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#E9DFCC]">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-[#C96F4A]">Academic Dashboard</span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#1B2E26] tracking-tight">My Active Learning</h1>
          <p className="text-[#556960] text-sm mt-0.5">Every skill has a journey. Continue where you left off.</p>
        </div>
        
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#556960]" size={16} />
          <input 
            type="text" 
            placeholder="Search enrolled courses..." 
            className="w-full bg-[#FAF7F0] border border-[#E9DFCC] rounded-xl pl-10 pr-4 py-2.5 text-xs focus:outline-none focus:border-[#24483C] transition-colors text-[#1B2E26] placeholder:text-[#556960]/60 shadow-sm"
          />
        </div>
      </div>

      {enrichedCourses.length === 0 ? (
        <div className="bg-[#FAF7F0] border border-[#E9DFCC] shadow-sm rounded-2xl p-6 sm:p-12 text-center flex flex-col items-center justify-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-[#DCE6D8] flex items-center justify-center text-[#24483C] shadow-sm border border-[#24483C]/20">
            <BookOpen size={32} />
          </div>
          <h2 className="font-serif text-2xl font-bold text-[#1B2E26]">No Active Enrolments Yet</h2>
          <p className="text-[#556960] max-w-md mx-auto text-sm leading-relaxed">
            Explore our curated academic catalogue to enroll in your next masterclass and earn recognized certificates.
          </p>
          <Link href="/courses">
            <button className="bg-[#24483C] hover:bg-[#1B2E26] text-[#F8F4EC] px-6 py-3 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all shadow-sm mt-2">
              Browse Academic Catalogue
            </button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {enrichedCourses.map((course: any) => (
            <Link href={course.playUrl} key={course.id.toString()} className="group">
              <div className="bg-[#FAF7F0] border border-[#E9DFCC] hover:border-[#24483C]/40 rounded-2xl p-5 flex flex-col transition-all shadow-sm hover:shadow-md h-full cursor-pointer">
                <div className="flex gap-4 mb-5">
                  <div className="w-20 h-20 rounded-xl bg-[#E9DFCC] overflow-hidden shrink-0 border border-[#E9DFCC]">
                    {course.thumbnail ? (
                      <img src={course.thumbnail} className="w-full h-full object-cover" alt="thumbnail"/>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[#556960]">
                        <BookOpen size={24} />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#C96F4A] block mb-0.5">
                      {course.category}
                    </span>
                    <h3 className="font-serif text-base font-bold text-[#1B2E26] line-clamp-2 leading-snug group-hover:text-[#24483C] transition-colors">
                      {course.title}
                    </h3>
                  </div>
                </div>
                
                <div className="mt-auto space-y-3 pt-3 border-t border-[#E9DFCC]/70">
                  <div className="w-full bg-[#E9DFCC] rounded-full h-1.5 overflow-hidden">
                    <div className="bg-[#24483C] h-1.5 rounded-full transition-all" style={{ width: `${course.progressPercentage}%` }}></div>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-[#24483C]">{course.progressPercentage}% Completed</span>
                    <span className="px-3 py-1 bg-[#DCE6D8] text-[#24483C] rounded-lg text-xs font-semibold uppercase tracking-wider group-hover:bg-[#24483C] group-hover:text-[#F8F4EC] transition-colors">
                      Resume Study
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Dynamic Recommendations Section */}
      {recommendedCourses.length > 0 && (
        <section className="space-y-6 pt-8 mt-10 border-t border-[#E9DFCC]">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-[#C96F4A]">Personalized Pathways</span>
            <h2 className="font-serif text-2xl font-bold text-[#1B2E26]">Recommended For Your Journey</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {recommendedCourses.map(course => (
              <Link href={`/courses/${course.id}`} key={course.id.toString()} className="group flex flex-col h-full bg-[#FAF7F0] rounded-2xl border border-[#E9DFCC] hover:border-[#24483C]/40 shadow-sm hover:shadow-md transition-all overflow-hidden cursor-pointer">
                <div className="w-full aspect-video bg-[#E9DFCC] relative overflow-hidden">
                  {course.thumbnail ? (
                    <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <div className="absolute inset-0 bg-[#DCE6D8] flex items-center justify-center text-[#24483C]">
                      <PlayCircle size={32} />
                    </div>
                  )}
                  <div className="absolute top-2.5 right-2.5 bg-[#FAF7F0]/90 backdrop-blur-sm px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider text-[#24483C] border border-[#E9DFCC]">
                    {course.category}
                  </div>
                </div>
                <div className="p-4 flex flex-col flex-1">
                  <h3 className="font-serif text-sm font-bold text-[#1B2E26] line-clamp-2 leading-snug group-hover:text-[#24483C] transition-colors">
                    {course.title}
                  </h3>
                  <div className="font-serif font-bold text-sm text-[#C96F4A] mt-auto pt-3">
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
