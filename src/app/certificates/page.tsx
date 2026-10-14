import { getUserFromCookie } from "@/lib/auth";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { Award, Lock, ExternalLink } from "lucide-react";

export default async function CertificatesPage() {
  const user = await getUserFromCookie();
  if (!user) return <div className="p-8 text-[#1B2E26] text-center">Please login to access credentials.</div>;

  const dbUser = await prisma.user.findUnique({
    where: { id: user.userId },
    include: { purchasedCourses: true }
  });
  
  if (!dbUser || !dbUser.purchasedCourses) {
    return <div className="p-8 text-[#1B2E26] text-center">No enrolled courses found.</div>;
  }

  // Get progress for all purchased courses
  const coursesWithProgress = await Promise.all(dbUser.purchasedCourses.map(async (course: any) => {
    const progress = await prisma.progress.findUnique({
      where: { userId_courseId: { userId: user.userId, courseId: course.id } }
    });
    const curriculum = course.curriculum as any || [];
    const totalLectures = curriculum.reduce((acc: number, sec: any) => acc + (sec.lectures?.length || 0), 0) || 0;
    const completedLectures = progress?.completedLectures?.length || 0;
    const isCompleted = totalLectures > 0 && completedLectures >= totalLectures;
    
    return {
      course,
      totalLectures,
      completedLectures,
      isCompleted
    };
  }));

  return (
    <div className="space-y-8 animate-in fade-in max-w-6xl mx-auto pb-16">
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-[#C96F4A]">Credentials</span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1B2E26] mt-0.5 mb-1">Academic Certificates</h1>
        <p className="text-[#4A5E54] text-sm">Verified certificates awarded upon 100% completion of course syllabus and exercises.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {coursesWithProgress.map((item, idx) => (
          <div key={idx} className={`editorial-card rounded-xl p-5 sm:p-6 flex flex-col bg-[#FFFFFF] ${item.isCompleted ? 'border-[#24483C]/40 shadow-sm' : 'border-[#E9DFCC] opacity-80'}`}>
            <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${item.isCompleted ? 'bg-[#EEF3EC] text-[#24483C] border border-[#DCE6D8]' : 'bg-[#F4EFE6] text-[#72857C] border border-[#E9DFCC]'}`}>
              <Award size={24} className={item.isCompleted ? "text-[#C96F4A]" : "text-[#72857C]"} />
            </div>
            
            <h3 className="font-bold text-[#1B2E26] text-base line-clamp-2 mb-2 leading-snug">{item.course.title}</h3>
            
            <div className="mt-auto pt-4 space-y-3.5">
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-[#72857C] font-medium">
                  <span>Progress</span>
                  <span>{item.totalLectures > 0 ? Math.round((item.completedLectures / item.totalLectures) * 100) : 0}%</span>
                </div>
                <div className="w-full bg-[#E9DFCC] rounded-full h-2 overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-700 ${item.isCompleted ? 'bg-[#24483C]' : 'bg-[#72857C]'}`} 
                    style={{ width: `${item.totalLectures > 0 ? (item.completedLectures / item.totalLectures) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>
              
              {item.isCompleted ? (
                <Link href={`/certificates/${item.course.id}`}>
                  <button className="w-full bg-[#24483C] hover:bg-[#19332A] text-[#F8F4EC] py-2 rounded-lg font-semibold text-xs transition-colors flex justify-center items-center gap-2 shadow-xs">
                    <ExternalLink size={14} /> View Certificate
                  </button>
                </Link>
              ) : (
                <button disabled className="w-full bg-[#F4EFE6] text-[#72857C] py-2 rounded-lg font-semibold text-xs flex justify-center items-center gap-1.5 cursor-not-allowed border border-[#E9DFCC]">
                  <Lock size={14} /> Complete Course to Unlock
                </button>
              )}
            </div>
          </div>
        ))}
        {coursesWithProgress.length === 0 && (
          <div className="col-span-full py-16 text-center text-[#72857C]">
            <div className="editorial-card rounded-2xl p-12 text-center flex flex-col items-center justify-center space-y-3 max-w-md mx-auto bg-[#FFFFFF]">
              <Award className="w-12 h-12 text-[#D8CCB5] mb-2" />
              <h2 className="text-lg font-bold text-[#1B2E26]">No certificates earned yet</h2>
              <p className="text-[#4A5E54] text-sm">Enroll in modules and complete every lecture and assignment to unlock verified certificates.</p>
              <Link href="/courses" className="mt-3 bg-[#24483C] hover:bg-[#19332A] text-[#F8F4EC] px-6 py-2 rounded-lg text-sm font-semibold transition-all">
                Browse Curriculum
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
