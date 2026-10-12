import { getUserFromCookie } from "@/lib/auth";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { Award, Lock, ExternalLink } from "lucide-react";

export default async function CertificatesPage() {
  const user = await getUserFromCookie();
  if (!user) return <div className="p-8 text-slate-900 text-center">Please login.</div>;

  const dbUser = await prisma.user.findUnique({
    where: { id: user.userId },
    include: { purchasedCourses: true }
  });
  
  if (!dbUser || !dbUser.purchasedCourses) {
    return <div className="p-8 text-white text-center">No purchased courses found.</div>;
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
    <div className="space-y-8 animate-in fade-in max-w-6xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">My Certificates</h1>
        <p className="text-slate-400">View and download certificates for your completed courses.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {coursesWithProgress.map((item, idx) => (
          <div key={idx} className={`glass-card rounded-xl border p-6 flex flex-col shadow-lg transition-all ${item.isCompleted ? 'border-teal-500/50 hover:shadow-xl hover:border-teal-500' : 'border-white/5 opacity-70'}`}>
            <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${item.isCompleted ? 'bg-teal-500/20 text-teal-400 border border-teal-500/30' : 'bg-slate-800 text-slate-500 border border-white/10'}`}>
              <Award size={24} />
            </div>
            
            <h3 className="font-bold text-white text-lg line-clamp-2 mb-2">{item.course.title}</h3>
            
            <div className="mt-auto pt-4 space-y-4">
              <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden shadow-inner border border-white/5">
                <div 
                  className={`h-full rounded-full transition-all duration-1000 ${item.isCompleted ? 'bg-teal-500 shadow-[0_0_10px_rgba(20,184,166,0.5)]' : 'bg-slate-700'}`} 
                  style={{ width: `${item.totalLectures > 0 ? (item.completedLectures / item.totalLectures) * 100 : 0}%` }}
                ></div>
              </div>
              
              {item.isCompleted ? (
                <Link href={`/certificates/${item.course.id}`}>
                  <button className="w-full bg-teal-500/10 hover:bg-teal-500 text-teal-400 hover:text-white border border-teal-500/20 hover:border-teal-500 py-2 rounded-lg font-bold text-sm transition-colors flex justify-center items-center gap-2">
                    <ExternalLink size={16} /> View Certificate
                  </button>
                </Link>
              ) : (
                <button disabled className="w-full bg-slate-800/50 text-slate-500 py-2 rounded-lg font-bold text-sm flex justify-center items-center gap-2 cursor-not-allowed border border-white/5">
                  <Lock size={16} /> Complete Course to Unlock
                </button>
              )}
            </div>
          </div>
        ))}
        {coursesWithProgress.length === 0 && (
          <div className="col-span-full py-16 text-center text-slate-400">
            <div className="glass-card border border-white/10 shadow-2xl rounded-3xl p-12 text-center flex flex-col items-center justify-center space-y-4 max-w-md mx-auto">
              <Award className="w-16 h-16 text-slate-600 mb-2" />
              <h2 className="text-xl font-bold text-white">No certificates yet</h2>
              <p className="text-slate-400">Enroll in courses and complete them to earn your certificates.</p>
              <Link href="/courses" className="mt-4 bg-teal-500 hover:bg-teal-400 text-slate-900 px-6 py-2.5 rounded-xl font-bold transition-all">
                Browse Courses
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
