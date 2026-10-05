import { getUserFromCookie } from "@/lib/auth";
import connectToDatabase from "@/lib/mongodb";
import Course from "@/models/Course";
import { redirect } from "next/navigation";
import SecureVideoPlayer from "@/components/SecureVideoPlayer";
import Link from "next/link";
import { CheckCircle, PlayCircle, FileText, ChevronLeft, Award } from "lucide-react";
import Progress from "@/models/Progress";
import MarkCompleteButton from "@/components/MarkCompleteButton";
import QuizPlayer from "@/components/QuizPlayer";
import AssignmentPlayer from "@/components/AssignmentPlayer";

export const dynamic = 'force-dynamic';

export default async function CoursePlayPage({ params, searchParams }: { params: Promise<{ id: string }>, searchParams: Promise<{ lectureId?: string }> }) {
  const user = await getUserFromCookie();
  if (!user) {
    redirect('/login');
  }

  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  await connectToDatabase();
  
  const course = await Course.findById(resolvedParams.id);
  
  if (!course) {
    redirect('/courses');
  }

  let progress = await Progress.findOne({ userId: user.userId, courseId: course._id });
  const completedLectures = progress?.completedLectures || [];

  const curriculum = course.curriculum || [];
  
  let activeLecture: any = null;
  let activeLectureId = resolvedSearchParams.lectureId;
  
  // Find the selected lecture or default to the first available lecture
  for (const section of curriculum) {
    for (const lecture of section.lectures) {
      if (!activeLectureId) {
        activeLectureId = lecture.id;
        activeLecture = lecture;
        break;
      }
      if (activeLectureId == lecture.id) {
        activeLecture = lecture;
        break;
      }
    }
    if (activeLecture) break;
  }

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] overflow-hidden">
      {/* Header */}
      <div className="bg-[#1e2130] h-14 border-b border-white/10 flex items-center px-4 shrink-0 justify-between">
        <div className="flex items-center gap-4">
          <Link href={`/courses/${course._id}`} className="text-gray-400 hover:text-white transition-colors">
            <ChevronLeft size={24} />
          </Link>
          <h1 className="text-white font-bold text-sm md:text-base line-clamp-1">{course.title}</h1>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden flex-col lg:flex-row">
        
        {/* Main Content Area */}
        <div className="flex-1 bg-black flex flex-col relative overflow-hidden">
          {activeLecture?.type === 'quiz' ? (
             <QuizPlayer 
               quizData={activeLecture.quizData || { questions: [] }} 
               courseId={course._id.toString()}
               lectureId={Number(activeLectureId)}
               isCompleted={completedLectures.includes(Number(activeLectureId))}
             />
          ) : activeLecture?.type === 'assignment' ? (
             <AssignmentPlayer 
               lecture={activeLecture} 
               courseId={course._id.toString()}
               lectureId={Number(activeLectureId)}
               isCompleted={completedLectures.includes(Number(activeLectureId))}
             />
          ) : activeLecture?.type === 'video' && activeLecture?.content ? (
             <div className="w-full h-full flex flex-col items-center justify-center animate-in fade-in relative">
                <SecureVideoPlayer src={activeLecture.content} userEmail={user.email || "Student"} />
                <div className="absolute top-4 left-4 z-10 bg-black/60 backdrop-blur text-white px-4 py-2 rounded-lg text-sm font-medium border border-white/10 pointer-events-none">
                  Currently Playing: {activeLecture.title}
                </div>
                <div className="absolute bottom-4 right-4 z-20">
                  <MarkCompleteButton 
                    courseId={course._id.toString()} 
                    lectureId={Number(activeLectureId)} 
                    isCompleted={completedLectures.includes(Number(activeLectureId))} 
                  />
                </div>
             </div>
          ) : (
             <div className="flex-1 text-gray-500 flex flex-col items-center justify-center animate-in fade-in">
               <FileText size={48} className="mb-4 opacity-50" />
               <p className="text-lg text-white mb-2">{activeLecture?.title || "No content"}</p>
               <p>Content for this lecture is not available.</p>
               {activeLecture && (
                 <div className="mt-8">
                  <MarkCompleteButton 
                    courseId={course._id.toString()} 
                    lectureId={Number(activeLectureId)} 
                    isCompleted={completedLectures.includes(Number(activeLectureId))} 
                  />
                 </div>
               )}
             </div>
          )}
        </div>

        {/* Sidebar Curriculum List */}
        <div className="w-full lg:w-80 xl:w-96 bg-[#12141f] border-l border-white/10 flex flex-col overflow-y-auto shrink-0 border-t lg:border-t-0">
          <div className="p-4 border-b border-white/10 bg-[#1e2130] sticky top-0 z-10">
            <h2 className="text-white font-bold text-lg">Course Content</h2>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {curriculum.map((section: any, sIdx: number) => (
              <div key={section.id || sIdx} className="mb-2">
                <h3 className="text-sm font-bold text-gray-300 mb-2 px-1">
                  Section {sIdx + 1}: {section.title}
                </h3>
                <div className="space-y-1">
                  {section.lectures?.map((lecture: any, lIdx: number) => (
                    <Link 
                      href={`/courses/${course._id}/play?lectureId=${lecture.id}`}
                      key={lecture.id || lIdx} 
                      className={`w-full text-left px-3 py-3 rounded-lg flex items-start gap-3 transition-colors ${activeLectureId == lecture.id ? 'bg-blue-500/10 border border-blue-500/30 text-blue-400' : 'hover:bg-white/5 text-gray-400'}`}
                    >
                      <div className="mt-0.5">
                        <CheckCircle size={16} className={completedLectures.includes(lecture.id) ? 'text-green-500' : activeLectureId == lecture.id ? 'text-blue-500' : 'text-gray-600'} />
                      </div>
                      <div className="flex-1">
                        <p className={`text-sm font-medium leading-tight ${activeLectureId == lecture.id ? 'text-blue-300' : 'text-gray-300'}`}>
                          {lIdx + 1}. {lecture.title}
                        </p>
                        <div className="flex items-center gap-1 mt-1 text-xs opacity-70">
                          {lecture.type === 'video' ? <PlayCircle size={12} /> : lecture.type === 'quiz' ? <Award size={12} /> : lecture.type === 'assignment' ? <FileText size={12} /> : <FileText size={12} />}
                          <span className="capitalize">{lecture.type || 'Article'}</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
            {curriculum.length === 0 && (
              <p className="text-gray-500 text-sm text-center py-8">Curriculum is empty.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
