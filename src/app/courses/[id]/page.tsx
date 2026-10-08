import { PlayCircle, CheckCircle2, Lock, Clock, Award, FileText, Star } from "lucide-react";
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
    <div className="space-y-8 max-w-7xl mx-auto pb-20 animate-in fade-in slide-in-from-bottom-4 relative">
      {/* Decorative background blobs */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-400/10 rounded-full blur-[100px] pointer-events-none z-0"></div>
      <div className="absolute top-[500px] left-0 w-[600px] h-[600px] bg-teal-400/10 rounded-full blur-[120px] pointer-events-none z-0"></div>

      {/* Course Hero */}
      <div className="bg-white/60 backdrop-blur-xl border border-white relative z-10 shadow-2xl shadow-emerald-500/5 rounded-3xl p-8 md:p-12 mb-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="flex flex-col justify-center">
            <div className="flex items-center gap-4 mb-6">
              <span className="text-sm font-bold px-4 py-1.5 bg-gradient-to-r from-emerald-400 to-teal-500 text-white rounded-full shadow-lg shadow-emerald-500/30">
                {course.category}
              </span>
              {reviews.length > 0 && (
                <div className="flex items-center gap-1 text-yellow-500 font-bold bg-yellow-50 px-3 py-1.5 rounded-full border border-yellow-200 w-fit">
                  <Star size={16} className="fill-yellow-500" />
                  <span>{averageRating}</span>
                  <span className="text-slate-400 text-xs ml-1 font-medium">({reviews.length})</span>
                </div>
              )}
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 max-w-2xl leading-tight mb-6">
              {course.title}
            </h1>
            <p className="text-slate-600 text-lg leading-relaxed">
              {course.description || "Learn and master the core concepts of this subject from scratch. Perfect for beginners and advanced professionals."}
            </p>
          </div>
          
          <div className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-white aspect-video bg-slate-100 group">
            {course.thumbnail ? (
              <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-100 to-sky-100 flex items-center justify-center">
                <PlayCircle size={64} className="text-emerald-300 drop-shadow-md" />
              </div>
            )}
            <Link href={`/courses/${course.id}/play`} className="absolute inset-0 flex items-center justify-center cursor-pointer">
               <div className="w-20 h-20 bg-white/30 backdrop-blur-md rounded-full flex items-center justify-center shadow-xl border border-white/50 group-hover:scale-110 transition-transform">
                 <PlayCircle size={40} className="text-white fill-emerald-500/80" />
               </div>
               {!isPurchased && firstLectureId && (
                 <div className="absolute bottom-6 bg-emerald-600 text-white font-bold px-4 py-1.5 rounded-full text-sm shadow-lg">
                   Watch Free Preview
                 </div>
               )}
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Course Content / Syllabus */}
        <div className="lg:col-span-2 space-y-8">
          <div className="glass-card-light p-8 border border-slate-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-900">Course Curriculum</h2>
              {user && totalLectures > 0 && (
                <div className="flex flex-col items-end">
                  <span className="text-sm font-bold text-emerald-600 mb-1">{progressPercentage}% Complete</span>
                  <div className="w-32 h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full transition-all duration-1000" style={{ width: `${progressPercentage}%` }}></div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="space-y-4">
              {curriculum.length === 0 ? (
                <p className="text-slate-400">The instructor is still preparing the curriculum for this course.</p>
              ) : (
                curriculum.map((section: any, sIdx: number) => (
                  <div key={section.id || sIdx} className="border border-slate-200 rounded-xl overflow-hidden bg-white">
                    <div className="p-4 bg-white font-semibold flex justify-between items-center border-b border-slate-200">
                      <span className="text-slate-900">Module {sIdx + 1}: {section.title}</span>
                      <span className="text-sm text-slate-500 font-normal">{section.lectures?.length || 0} Lectures</span>
                    </div>
                    <div className="p-4 space-y-3">
                      {section.lectures?.map((lecture: any, lIdx: number) => {
                        const isFirstLecture = lecture.id === firstLectureId;
                        return (
                          <div key={lecture.id || lIdx} className="flex items-start gap-3 text-sm">
                            {lecture.type === 'video' ? (
                              <PlayCircle size={18} className="text-emerald-600 shrink-0 mt-0.5" />
                            ) : (
                              <FileText size={18} className="text-slate-500 shrink-0 mt-0.5" />
                            )}
                            <div className="flex-1 flex justify-between items-center pr-2">
                              <p className={`font-medium ${completedLectures.includes(lecture.id) ? 'text-green-400 line-through opacity-80' : 'text-slate-600'}`}>{lecture.title}</p>
                              {isFirstLecture && !isPurchased && (
                                <Link href={`/courses/${id}/play?lectureId=${lecture.id}`}>
                                   <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-bold hover:bg-emerald-200 cursor-pointer transition-colors shadow-sm whitespace-nowrap">Free Preview</span>
                                </Link>
                              )}
                            </div>
                          </div>
                        );
                      })}
                      {(!section.lectures || section.lectures.length === 0) && (
                        <p className="text-slate-400 text-sm">No lectures in this module yet.</p>
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
          <div className="glass-card-light p-6 sticky top-24 border border-slate-200">
            <CoursePurchaseCard 
              courseId={id} 
              price={course.price} 
              isPurchasedInitial={isPurchased} 
            />
            
            <p className="text-center text-xs text-slate-500 mt-4">Full Lifetime Access • 30-Day Money-Back Guarantee</p>
            
            <div className="mt-8 space-y-4">
              <h3 className="font-bold text-slate-900 mb-4">This course includes:</h3>
              <div className="flex items-center gap-3 text-sm text-slate-600">
                <PlayCircle size={16} className="text-emerald-600" />
                {totalLectures} Video Lectures
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-600">
                <CheckCircle2 size={16} className="text-green-400" />
                Full source code & assignments
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-600">
                <Award size={16} className="text-yellow-400" />
                Certificate of completion
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-600">
                <Clock size={16} className="text-violet-400" />
                Access on mobile and TV
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
