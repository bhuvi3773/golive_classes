"use client";

import { useRef, useState } from "react";
import SecureVideoPlayer, { SecureVideoPlayerRef } from "./SecureVideoPlayer";
import CourseDiscussions from "./CourseDiscussions";
import CourseNotes from "./CourseNotes";
import QuizPlayer from "./QuizPlayer";
import AssignmentPlayer from "./AssignmentPlayer";
import MarkCompleteButton from "./MarkCompleteButton";
import { FileText } from "lucide-react";

export default function CoursePlayerClient({ 
  course, 
  activeLecture, 
  activeLectureId, 
  completedLectures, 
  userEmail, 
  dbUser 
}: any) {
  const videoRef = useRef<SecureVideoPlayerRef>(null);
  const [activeTab, setActiveTab] = useState<'discussions' | 'notes'>('discussions');

  const getCurrentTime = () => {
    if (videoRef.current) {
      return videoRef.current.getCurrentTime();
    }
    return 0;
  };

  const handleSeek = (time: number) => {
    if (videoRef.current) {
      videoRef.current.seekTo(time);
    }
  };

  return (
    <div className="flex-1 bg-[#fafafa] flex flex-col relative overflow-y-auto">
      <div className="bg-black w-full shrink-0 relative aspect-video md:max-h-[70vh] flex flex-col">
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
              <SecureVideoPlayer ref={videoRef} src={activeLecture.content} userEmail={userEmail || "Student"} />
              <div className="absolute top-4 left-4 z-10 bg-black/60 backdrop-blur text-white px-4 py-2 rounded-lg text-sm font-medium border border-white/20 pointer-events-none">
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
           <div className="flex-1 text-slate-400 flex flex-col items-center justify-center animate-in fade-in py-20">
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
      
      <div className="w-full max-w-5xl mx-auto py-8 px-4">
        {/* Tabs for Discussions and Notes */}
        <div className="flex gap-4 border-b border-slate-200 mb-6">
          <button 
            onClick={() => setActiveTab('discussions')}
            className={`pb-3 font-medium text-sm transition-colors border-b-2 ${activeTab === 'discussions' ? 'border-emerald-500 text-slate-900' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          >
            Q&A / Discussions
          </button>
          {activeLecture?.type === 'video' && (
            <button 
              onClick={() => setActiveTab('notes')}
              className={`pb-3 font-medium text-sm transition-colors border-b-2 ${activeTab === 'notes' ? 'border-emerald-500 text-slate-900' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
            >
              My Notes
            </button>
          )}
        </div>

        {activeTab === 'discussions' ? (
          <CourseDiscussions courseId={course._id.toString()} lectureId={Number(activeLectureId)} currentUser={dbUser} />
        ) : (
          <CourseNotes courseId={course._id.toString()} lectureId={Number(activeLectureId)} getCurrentTime={getCurrentTime} onSeek={handleSeek} />
        )}
      </div>
    </div>
  );
}
