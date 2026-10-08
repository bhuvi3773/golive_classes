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
    return <div className="p-8 text-slate-900 text-center">No purchased courses found.</div>;
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
        <h1 className="text-3xl font-bold text-slate-900 mb-2">My Certificates</h1>
        <p className="text-slate-500">View and download certificates for your completed courses.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {coursesWithProgress.map((item, idx) => (
          <div key={idx} className={`rounded-xl border p-6 flex flex-col bg-white shadow-sm ${item.isCompleted ? 'border-emerald-300' : 'border-slate-200 opacity-70'}`}>
            <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${item.isCompleted ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
              <Award size={24} />
            </div>
            
            <h3 className="font-bold text-slate-900 text-lg line-clamp-2 mb-2">{item.course.title}</h3>
            
            <div className="mt-auto pt-4 space-y-4">
              <div className="w-full bg-black/40 rounded-full h-2">
                <div 
                  className={`h-full rounded-full ${item.isCompleted ? 'bg-green-500' : 'bg-blue-500'}`} 
                  style={{ width: `${item.totalLectures > 0 ? (item.completedLectures / item.totalLectures) * 100 : 0}%` }}
                ></div>
              </div>
              
              {item.isCompleted ? (
                <Link href={`/certificates/${item.course.id}`}>
                  <button className="w-full bg-slate-900 hover:bg-slate-800 text-white py-2 rounded-lg font-bold text-sm transition-colors flex justify-center items-center gap-2">
                    <ExternalLink size={16} /> View Certificate
                  </button>
                </Link>
              ) : (
                <button disabled className="w-full bg-slate-100 text-slate-400 py-2 rounded-lg font-bold text-sm flex justify-center items-center gap-2 cursor-not-allowed">
                  <Lock size={16} /> Complete Course to Unlock
                </button>
              )}
            </div>
          </div>
        ))}
        {coursesWithProgress.length === 0 && (
          <div className="col-span-full py-12 text-center text-slate-400">
            You haven't enrolled in any courses yet.
          </div>
        )}
      </div>
    </div>
  );
}
