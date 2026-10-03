import { getUserFromCookie } from "@/lib/auth";
import connectToDatabase from "@/lib/mongodb";
import Course from "@/models/Course";
import { redirect } from "next/navigation";
import SecureVideoPlayer from "@/components/SecureVideoPlayer";
import Link from "next/link";
import { CheckCircle, PlayCircle, FileText, ChevronLeft } from "lucide-react";

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

  const curriculum = course.curriculum || [];
  
  let currentVideoUrl = "";
  let currentVideoTitle = "No video available";
  let activeLectureId = resolvedSearchParams.lectureId;
  
  // Find the selected video or default to the first available video
  for (const section of curriculum) {
    for (const lecture of section.lectures) {
      if (lecture.type === 'video' && lecture.content) {
        if (!activeLectureId || activeLectureId == lecture.id) {
          currentVideoUrl = lecture.content;
          currentVideoTitle = lecture.title;
          activeLectureId = lecture.id; // lock in the first one if not set
          break;
        }
      }
    }
    if (currentVideoUrl && (!resolvedSearchParams.lectureId || activeLectureId == resolvedSearchParams.lectureId)) break;
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
        
        {/* Main Video Area */}
        <div className="flex-1 bg-black flex flex-col items-center justify-center relative overflow-hidden">
          {currentVideoUrl ? (
            <div className="w-full h-full max-h-full flex items-center justify-center p-4 animate-in fade-in">
              <SecureVideoPlayer src={currentVideoUrl} userEmail={user.email} />
            </div>
          ) : (
            <div className="text-gray-500 flex flex-col items-center animate-in fade-in">
              <PlayCircle size={48} className="mb-4 opacity-50" />
              <p>No video content uploaded yet.</p>
            </div>
          )}
          <div className="absolute top-4 left-4 bg-black/60 backdrop-blur text-white px-4 py-2 rounded-lg text-sm font-medium border border-white/10">
            Currently Playing: {currentVideoTitle}
          </div>
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
                        <CheckCircle size={16} className={activeLectureId == lecture.id ? 'text-blue-500' : 'text-gray-600'} />
                      </div>
                      <div className="flex-1">
                        <p className={`text-sm font-medium leading-tight ${activeLectureId == lecture.id ? 'text-blue-300' : 'text-gray-300'}`}>
                          {lIdx + 1}. {lecture.title}
                        </p>
                        <div className="flex items-center gap-1 mt-1 text-xs opacity-70">
                          {lecture.type === 'video' ? <PlayCircle size={12} /> : <FileText size={12} />}
                          <span>{lecture.type === 'video' ? 'Video' : 'Article'}</span>
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
