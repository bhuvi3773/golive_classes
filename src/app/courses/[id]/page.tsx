import { PlayCircle, CheckCircle2, Lock, Clock, Award, FileText, Star, BookOpen } from "lucide-react";
import Link from "next/link";
import { CourseRepository } from "@/lib/repositories/course.repository";
import { ProgressRepository } from "@/lib/repositories/progress.repository";
import { getUserFromCookie } from "@/lib/auth";
import { UserRepository } from "@/lib/repositories/user.repository";
import { notFound } from "next/navigation";
import CoursePurchaseCard from "@/components/CoursePurchaseCard";
import CourseReviews from "@/components/CourseReviews";

export default async function CourseDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const id = (await params).id;
  const course = await CourseRepository.findById(id);

  if (!course) {
    notFound();
  }

  const reviews = (course as any).reviews || [];
  const averageRating = reviews.length > 0 
    ? (reviews.reduce((acc: number, r: any) => acc + r.rating, 0) / reviews.length).toFixed(1) 
    : 0;

  const curriculum = (course.curriculum as any) || [];
  const totalLectures = curriculum.reduce((acc: number, sec: any) => acc + (sec.lectures?.length || 0), 0);
  let firstLectureId: number | null = null;
  if (curriculum.length > 0 && curriculum[0].lectures && curriculum[0].lectures.length > 0) {
    firstLectureId = curriculum[0].lectures[0].id;
  }

  const user = await getUserFromCookie();
  let completedLectures: number[] = [];
  let isPurchased = false;
  if (user) {
    const progress = await ProgressRepository.findProgress(user.userId, course.id);
    if (progress) {
      completedLectures = progress.completedLectures;
    }
    
    // Fetch user from DB directly since this is a Server Component
    const dbUser = await UserRepository.findById(user.userId);
    if (dbUser) {
      if (dbUser.purchasedCourses && dbUser.purchasedCourses.some((c) => c.id === id)) {
        isPurchased = true;
      }
      
      // Track category view for recommendations
      if (course.category) {
        const viewedCategories = (dbUser.viewedCategories as string[]) || [];
        if (!viewedCategories.includes(course.category)) {
          viewedCategories.push(course.category);
          // Keep only the last 10 viewed categories to prevent unbounded growth
          if (viewedCategories.length > 10) viewedCategories.shift();
          await UserRepository.update(dbUser.id, { viewedCategories });
        }
      }
    }
  }

  const progressPercentage = totalLectures > 0 ? Math.round((completedLectures.length / totalLectures) * 100) : 0;

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-20">
      {/* Course Hero */}
      <div className="editorial-card rounded-2xl p-8 md:p-12 mb-10 bg-[#FFFFFF]">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="flex flex-col justify-center">
            <div className="flex items-center gap-3 mb-5">
              <span className="text-xs font-bold px-3 py-1 bg-[#EEF3EC] text-[#24483C] rounded-full border border-[#DCE6D8]">
                {course.category}
              </span>
              {reviews.length > 0 && (
                <div className="flex items-center gap-1 text-[#C96F4A] font-bold bg-[#C96F4A]/10 px-3 py-1 rounded-full border border-[#C96F4A]/20 text-xs">
                  <Star size={14} className="fill-[#C96F4A]" />
                  <span>{averageRating}</span>
                  <span className="text-[#72857C] text-[11px] ml-0.5">({reviews.length} reviews)</span>
                </div>
              )}
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold text-[#1B2E26] leading-tight mb-4">
              {course.title}
            </h1>
            <p className="text-[#4A5E54] text-base md:text-lg leading-relaxed">
              {course.description || "Master core concepts and production applications with structured curriculum, projects, and exercises."}
            </p>
          </div>
          
          <div className="relative rounded-xl overflow-hidden shadow-md border border-[#E9DFCC] aspect-video bg-[#F4EFE6] group">
            {course.thumbnail ? (
              <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
            ) : (
              <div className="absolute inset-0 bg-[#EEF3EC] flex items-center justify-center">
                <BookOpen size={56} className="text-[#24483C]/30" />
              </div>
            )}
            <Link href={`/courses/${course.id}/play`} className="absolute inset-0 flex items-center justify-center cursor-pointer">
               <div className="w-16 h-16 bg-[#FFFFFF]/90 backdrop-blur-md rounded-full flex items-center justify-center shadow-lg border border-[#E9DFCC] group-hover:scale-105 transition-transform">
                 <PlayCircle size={32} className="text-[#24483C]" />
               </div>
               {!isPurchased && firstLectureId && (
                 <div className="absolute bottom-5 bg-[#24483C] text-[#F8F4EC] font-bold px-4 py-1.5 rounded-full text-xs shadow-sm">
                   Free Preview Available
                 </div>
               )}
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Course Content / Syllabus */}
        <div className="lg:col-span-2 space-y-8">
          <div className="editorial-card p-8 bg-[#FFFFFF]">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#E9DFCC]">
              <div>
                <h2 className="text-2xl font-bold text-[#1B2E26]">Course Syllabus</h2>
                <p className="text-xs text-[#72857C] mt-0.5">{curriculum.length} Sections • {totalLectures} Lectures</p>
              </div>
              {user && totalLectures > 0 && (
                <div className="flex flex-col items-end">
                  <span className="text-xs font-bold text-[#24483C] mb-1">{progressPercentage}% Completed</span>
                  <div className="w-32 h-2 bg-[#E9DFCC] rounded-full overflow-hidden">
                    <div className="h-full bg-[#24483C] rounded-full transition-all duration-700" style={{ width: `${progressPercentage}%` }}></div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="space-y-4">
              {curriculum.length === 0 ? (
                <p className="text-[#72857C] text-sm">The syllabus for this course is currently being prepared.</p>
              ) : (
                curriculum.map((section: any, sIdx: number) => (
                  <div key={section.id || sIdx} className="border border-[#E9DFCC] rounded-xl overflow-hidden bg-[#FFFFFF]">
                    <div className="p-4 bg-[#FDFCF9] font-semibold flex justify-between items-center border-b border-[#E9DFCC]">
                      <span className="text-[#1B2E26] text-sm md:text-base">Module {sIdx + 1}: {section.title}</span>
                      <span className="text-xs text-[#72857C] font-normal">{section.lectures?.length || 0} Lectures</span>
                    </div>
                    <div className="p-4 space-y-2.5">
                      {section.lectures?.map((lecture: any, lIdx: number) => {
                        const isFirstLecture = lecture.id === firstLectureId;
                        return (
                          <div key={lecture.id || lIdx} className="flex items-start gap-3 text-sm py-1">
                            {lecture.type === 'video' ? (
                              <PlayCircle size={16} className="text-[#24483C] shrink-0 mt-0.5" />
                            ) : (
                              <FileText size={16} className="text-[#72857C] shrink-0 mt-0.5" />
                            )}
                            <div className="flex-1 flex justify-between items-center pr-2">
                              <p className={`text-sm ${completedLectures.includes(lecture.id) ? 'text-[#72857C] line-through font-normal' : 'text-[#2C3E35] font-medium'}`}>{lecture.title}</p>
                              {isFirstLecture && !isPurchased && (
                                <Link href={`/courses/${id}/play?lectureId=${lecture.id}`}>
                                   <span className="text-[11px] bg-[#EEF3EC] text-[#24483C] px-2.5 py-0.5 rounded-full font-bold hover:bg-[#DCE6D8] cursor-pointer transition-colors border border-[#DCE6D8] whitespace-nowrap">Free Preview</span>
                                </Link>
                              )}
                            </div>
                          </div>
                        );
                      })}
                      {(!section.lectures || section.lectures.length === 0) && (
                        <p className="text-[#72857C] text-xs">No lectures published in this module yet.</p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
          
          <CourseReviews courseId={id} isPurchased={isPurchased} />
        </div>

        {/* Purchase Card */}
        <div className="lg:col-span-1">
          <div className="editorial-card p-6 sticky top-24 bg-[#FFFFFF]">
            <CoursePurchaseCard 
              courseId={id} 
              price={course.price} 
              isPurchasedInitial={isPurchased} 
            />
            
            <p className="text-center text-xs text-[#72857C] mt-4">Full Lifetime Access • Certificate Included</p>
            
            <div className="mt-8 space-y-3.5 pt-6 border-t border-[#E9DFCC]">
              <h3 className="font-bold text-[#1B2E26] text-sm">Course Inclusions:</h3>
              <div className="flex items-center gap-3 text-xs md:text-sm text-[#4A5E54]">
                <PlayCircle size={16} className="text-[#24483C]" />
                {totalLectures} Focused Lectures
              </div>
              <div className="flex items-center gap-3 text-xs md:text-sm text-[#4A5E54]">
                <CheckCircle2 size={16} className="text-[#24483C]" />
                Interactive quizzes & exercises
              </div>
              <div className="flex items-center gap-3 text-xs md:text-sm text-[#4A5E54]">
                <Award size={16} className="text-[#C96F4A]" />
                Verified completion certificate
              </div>
              <div className="flex items-center gap-3 text-xs md:text-sm text-[#4A5E54]">
                <Clock size={16} className="text-[#4A5E54]" />
                Learn at your own pace
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
