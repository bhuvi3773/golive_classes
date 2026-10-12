import { getUserFromCookie } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { Award, Printer } from "lucide-react";

export default async function CertificateViewPage({ params }: { params: Promise<{ courseId: string }> }) {
  const user = await getUserFromCookie();
  if (!user) redirect('/login');

  const resolvedParams = await params;
  const course = await prisma.course.findUnique({ where: { id: resolvedParams.courseId } });
  const dbUser = await prisma.user.findUnique({
    where: { id: user.userId },
    include: { purchasedCourses: true }
  });
  
  if (!course || !dbUser) notFound();
  
  const isOwner = dbUser.purchasedCourses && dbUser.purchasedCourses.some((c: any) => c.id === course.id);
  if (!isOwner) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] p-4">
        <div className="editorial-card p-10 text-center max-w-md w-full bg-[#FFFFFF]">
          <h1 className="text-xl font-bold text-[#C96F4A] mb-2">Enrollment Required</h1>
          <p className="text-[#4A5E54] text-sm">You must enroll in and complete this course to earn an academic certificate.</p>
        </div>
      </div>
    );
  }

  // Verify completion
  const progress = await prisma.progress.findUnique({
    where: { userId_courseId: { userId: user.userId, courseId: course.id } }
  });
  const totalLectures = (course.curriculum as any)?.reduce((acc: number, sec: any) => acc + (sec.lectures?.length || 0), 0) || 0;
  const completedLectures = progress?.completedLectures?.length || 0;
  
  if (totalLectures === 0 || completedLectures < totalLectures) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] p-4">
        <div className="editorial-card p-10 text-center max-w-md w-full bg-[#FFFFFF]">
          <h1 className="text-xl font-bold text-[#1B2E26] mb-2">Curriculum In Progress</h1>
          <p className="text-[#4A5E54] text-sm">You must complete 100% of all lectures and assignments to unlock this certificate.</p>
        </div>
      </div>
    );
  }

  const date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] space-y-8 animate-in fade-in pb-16">
      {/* Formal Academic Diploma Frame */}
      <div className="w-full max-w-4xl bg-[#FDFCF9] text-[#1B2E26] rounded-xl p-6 sm:p-14 aspect-[1.4/1] shadow-xl relative overflow-hidden border-[14px] border-[#24483C] mx-auto">
        
        {/* Subtle Certificate Corner Accents */}
        <div className="absolute top-2 left-2 w-8 h-8 border-t-2 border-l-2 border-[#C96F4A]"></div>
        <div className="absolute top-2 right-2 w-8 h-8 border-t-2 border-r-2 border-[#C96F4A]"></div>
        <div className="absolute bottom-2 left-2 w-8 h-8 border-b-2 border-l-2 border-[#C96F4A]"></div>
        <div className="absolute bottom-2 right-2 w-8 h-8 border-b-2 border-r-2 border-[#C96F4A]"></div>
        
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-center space-y-5">
          <Award size={56} className="text-[#C96F4A] mb-1" />
          
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-extrabold text-[#24483C] uppercase tracking-widest">
            Certificate of Mastery
          </h1>
          
          <p className="text-sm sm:text-base text-[#4A5E54] uppercase tracking-wider font-medium mt-4">This certifies that</p>
          
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#1B2E26] border-b-2 border-[#E9DFCC] pb-2 px-10">
            {dbUser.name}
          </h2>
          
          <p className="text-sm sm:text-base text-[#4A5E54]">has successfully fulfilled all curriculum requirements for</p>
          
          <h3 className="text-xl sm:text-2xl md:text-3xl font-serif font-bold text-[#24483C] px-4 max-w-xl">
            {course.title}
          </h3>
          
          <div className="flex justify-between w-full max-w-2xl mt-8 pt-8 border-t border-[#E9DFCC]">
            <div className="text-center">
              <p className="font-bold text-[#1B2E26] text-sm">{date}</p>
              <p className="text-xs text-[#72857C] uppercase tracking-wider">Date Conferred</p>
            </div>
            
            <div className="text-center">
              <p className="font-serif italic text-lg font-bold text-[#24483C]">GoLive Academy</p>
              <p className="text-xs text-[#72857C] uppercase tracking-wider">Office of Academic Affairs</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Print / Save Notice */}
      <div className="editorial-card bg-[#FFFFFF] border border-[#E9DFCC] shadow-sm text-[#4A5E54] px-6 py-4 flex items-center gap-4 w-full max-w-4xl mx-auto rounded-xl">
        <div className="bg-[#EEF3EC] p-2.5 rounded-full text-[#24483C] border border-[#DCE6D8] shrink-0">
          <Printer size={18} />
        </div>
        <span className="text-xs sm:text-sm">
          To export your verified credential, press <strong className="text-[#1B2E26]">Ctrl + P</strong> (Windows) or <strong className="text-[#1B2E26]">Cmd + P</strong> (Mac) and choose <em>"Save as PDF"</em>.
        </span>
      </div>
    </div>
  );
}
