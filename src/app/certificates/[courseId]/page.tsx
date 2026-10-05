import { getUserFromCookie } from "@/lib/auth";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";
import Course from "@/models/Course";
import Progress from "@/models/Progress";
import { notFound, redirect } from "next/navigation";
import { Award } from "lucide-react";

export default async function CertificateViewPage({ params }: { params: Promise<{ courseId: string }> }) {
  const user = await getUserFromCookie();
  if (!user) redirect('/login');

  const resolvedParams = await params;
  await connectToDatabase();
  
  const course = await Course.findById(resolvedParams.courseId);
  const dbUser = await User.findById(user.userId);
  
  if (!course || !dbUser) notFound();

  // Verify completion
  const progress = await Progress.findOne({ userId: user.userId, courseId: course._id });
  const totalLectures = course.curriculum?.reduce((acc: number, sec: any) => acc + (sec.lectures?.length || 0), 0) || 0;
  const completedLectures = progress?.completedLectures?.length || 0;
  
  if (totalLectures === 0 || completedLectures < totalLectures) {
    return (
      <div className="p-12 text-center">
        <h1 className="text-2xl font-bold text-red-500 mb-4">Certificate Not Unlocked</h1>
        <p className="text-gray-400">You must complete 100% of the course to view this certificate.</p>
      </div>
    );
  }

  const date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] space-y-8 animate-in fade-in">
      <div className="w-full max-w-4xl bg-white text-gray-900 rounded-xl p-2 sm:p-12 aspect-[1.4/1] shadow-2xl relative overflow-hidden border-[16px] border-blue-900 mx-auto">
        
        {/* Certificate Background Elements */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-70 -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-violet-100 rounded-full mix-blend-multiply filter blur-3xl opacity-70 translate-x-1/2 translate-y-1/2"></div>
        
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-center space-y-6">
          <Award size={64} className="text-blue-600 mb-2" />
          
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-blue-900 uppercase tracking-widest">
            Certificate of Completion
          </h1>
          
          <p className="text-lg md:text-xl text-gray-600 mt-8">This is to certify that</p>
          
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 border-b-2 border-blue-200 pb-2 px-12">
            {dbUser.name}
          </h2>
          
          <p className="text-lg md:text-xl text-gray-600">has successfully completed the course</p>
          
          <h3 className="text-2xl md:text-3xl font-bold text-blue-800 px-4">
            {course.title}
          </h3>
          
          <div className="flex justify-between w-full max-w-2xl mt-12 pt-12 border-t border-gray-200">
            <div className="text-center">
              <p className="font-bold text-gray-800">{date}</p>
              <p className="text-sm text-gray-500">Date Completed</p>
            </div>
            
            <div className="text-center">
              <p className="font-bold text-gray-800 font-serif italic text-xl">GoLive Admin</p>
              <p className="text-sm text-gray-500">Instructor / Platform</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-blue-900/20 border border-blue-500/30 text-blue-200 px-6 py-4 rounded-lg flex items-center gap-3">
        <Award size={20} className="text-blue-400" />
        <span>To save your certificate, press <strong>Ctrl + P</strong> (Windows) or <strong>Cmd + P</strong> (Mac) and select "Save as PDF".</span>
      </div>
    </div>
  );
}
