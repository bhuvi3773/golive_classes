import { PlayCircle, CheckCircle2, Lock, Clock, Award, FileText } from "lucide-react";
import Link from "next/link";
import connectToDatabase from "@/lib/mongodb";
import Course from "@/models/Course";
import Progress from "@/models/Progress";
import { getUserFromCookie } from "@/lib/auth";
import { notFound } from "next/navigation";
import CoursePurchaseCard from "@/components/CoursePurchaseCard";

export default async function CourseDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const id = (await params).id;
  await connectToDatabase();
  const course = await Course.findById(id);

  if (!course) {
    notFound();
  }

  const curriculum = course.curriculum || [];
  const totalLectures = curriculum.reduce((acc: number, sec: any) => acc + (sec.lectures?.length || 0), 0);

  const user = await getUserFromCookie();
  let completedLectures: number[] = [];
  let isPurchased = false;
  if (user) {
    const progress = await Progress.findOne({ userId: user.userId, courseId: course._id });
    if (progress) {
      completedLectures = progress.completedLectures;
    }
    
    // Check if user purchased this course
    const authUser = await fetch(`http://localhost:3000/api/auth/me`, {
      headers: { cookie: `auth-token=${(await import("next/headers")).cookies().then(c => c.get('auth-token')?.value || '')}` }
    }).then(res => res.json()).catch(() => ({}));
    
    if (authUser?.user?.purchasedCourses?.includes(id)) {
      isPurchased = true;
    }
  }

  const progressPercentage = totalLectures > 0 ? Math.round((completedLectures.length / totalLectures) * 100) : 0;

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-20 animate-in fade-in slide-in-from-bottom-4">
      {/* Course Hero */}
      <div className="glass-card overflow-hidden border border-white/10">
        <div className="h-64 md:h-96 bg-[#1a1d2d] relative">
          {course.thumbnail ? (
            <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover opacity-30" />
          ) : (
            <>
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
            </>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#1e2130] to-transparent"></div>
          
          <div className="absolute inset-0 flex flex-col justify-end p-8 md:p-12">
            <span className="text-sm font-semibold px-3 py-1 bg-blue-500/20 text-blue-400 rounded w-fit mb-4 border border-blue-500/30">
              {course.category}
            </span>
            <h1 className="text-3xl md:text-5xl font-extrabold text-white max-w-3xl leading-tight">
              {course.title}
            </h1>
            <p className="text-gray-300 mt-4 max-w-2xl text-lg line-clamp-2">
              {course.description || "Learn and master the core concepts of this subject from scratch. Perfect for beginners and advanced professionals."}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Course Content / Syllabus */}
        <div className="lg:col-span-2 space-y-8">
          <div className="glass-card p-8 border border-white/10">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Course Curriculum</h2>
              {user && totalLectures > 0 && (
                <div className="flex flex-col items-end">
                  <span className="text-sm font-bold text-blue-400 mb-1">{progressPercentage}% Complete</span>
                  <div className="w-32 h-2 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full transition-all duration-1000" style={{ width: `${progressPercentage}%` }}></div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="space-y-4">
              {curriculum.length === 0 ? (
                <p className="text-gray-500">The instructor is still preparing the curriculum for this course.</p>
              ) : (
                curriculum.map((section: any, sIdx: number) => (
                  <div key={section.id || sIdx} className="border border-white/10 rounded-xl overflow-hidden bg-white/[0.02]">
                    <div className="p-4 bg-[#1e2130] font-semibold flex justify-between items-center border-b border-white/10">
                      <span className="text-white">Module {sIdx + 1}: {section.title}</span>
                      <span className="text-sm text-gray-400 font-normal">{section.lectures?.length || 0} Lectures</span>
                    </div>
                    <div className="p-4 space-y-3">
                      {section.lectures?.map((lecture: any, lIdx: number) => (
                        <div key={lecture.id || lIdx} className="flex items-start gap-3 text-sm">
                          {lecture.type === 'video' ? (
                            <PlayCircle size={18} className="text-blue-400 shrink-0 mt-0.5" />
                          ) : (
                            <FileText size={18} className="text-gray-400 shrink-0 mt-0.5" />
                          )}
                          <div>
                            <p className={`font-medium ${completedLectures.includes(lecture.id) ? 'text-green-400 line-through opacity-80' : 'text-gray-300'}`}>{lecture.title}</p>
                          </div>
                        </div>
                      ))}
                      {(!section.lectures || section.lectures.length === 0) && (
                        <p className="text-gray-500 text-sm">No lectures in this module yet.</p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Purchase Card */}
        <div className="lg:col-span-1">
          <div className="glass-card p-6 sticky top-24 border border-white/10">
            <CoursePurchaseCard 
              courseId={id} 
              price={course.price} 
              isPurchasedInitial={isPurchased} 
            />
            
            <p className="text-center text-xs text-gray-400 mt-4">Full Lifetime Access • 30-Day Money-Back Guarantee</p>
            
            <div className="mt-8 space-y-4">
              <h3 className="font-bold text-white mb-4">This course includes:</h3>
              <div className="flex items-center gap-3 text-sm text-gray-300">
                <PlayCircle size={16} className="text-blue-400" />
                {totalLectures} Video Lectures
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-300">
                <CheckCircle2 size={16} className="text-green-400" />
                Full source code & assignments
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-300">
                <Award size={16} className="text-yellow-400" />
                Certificate of completion
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-300">
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
