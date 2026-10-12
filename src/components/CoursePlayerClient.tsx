"use client";

import { useRef, useState } from "react";
import SecureVideoPlayer, { SecureVideoPlayerRef } from "./SecureVideoPlayer";
import CourseDiscussions from "./CourseDiscussions";
import CourseNotes from "./CourseNotes";
import QuizPlayer from "./QuizPlayer";
import AssignmentPlayer from "./AssignmentPlayer";
import MarkCompleteButton from "./MarkCompleteButton";
import { FileText, MessageSquare, StickyNote } from "lucide-react";

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
    <div className="flex-1 bg-[#F8F4EC] flex flex-col relative overflow-y-auto text-[#1B2E26]">
      <div className="bg-[#121E19] w-full shrink-0 relative aspect-video md:max-h-[70vh] flex flex-col shadow-inner">
        {activeLecture?.type === 'quiz' ? (
           <QuizPlayer 
             quizData={activeLecture.quizData || { questions: [] }} 
             courseId={course.id.toString()}
             lectureId={Number(activeLectureId)}
             isCompleted={completedLectures.includes(Number(activeLectureId))}
           />
        ) : activeLecture?.type === 'assignment' ? (
           <AssignmentPlayer 
             lecture={activeLecture} 
             courseId={course.id.toString()}
             lectureId={Number(activeLectureId)}
             isCompleted={completedLectures.includes(Number(activeLectureId))}
           />
        ) : activeLecture?.type === 'video' && activeLecture?.content ? (
           <div className="w-full h-full flex flex-col items-center justify-center animate-in fade-in relative">
              <SecureVideoPlayer ref={videoRef} src={activeLecture.content} userEmail={userEmail || "Student"} />
              <div className="absolute top-4 left-4 z-10 bg-[#24483C]/85 backdrop-blur-md text-[#F8F4EC] px-3.5 py-1.5 rounded-xl text-xs font-medium border border-[#E9DFCC]/30 pointer-events-none shadow-sm flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#C96F4A] animate-pulse"></span>
                <span>Active Lecture: {activeLecture.title}</span>
              </div>
              <div className="absolute bottom-4 right-4 z-20">
                <MarkCompleteButton 
                  courseId={course.id.toString()} 
                  lectureId={Number(activeLectureId)} 
                  isCompleted={completedLectures.includes(Number(activeLectureId))} 
                />
              </div>
           </div>
        ) : (
           <div className="flex-1 text-[#DCE6D8]/80 flex flex-col items-center justify-center animate-in fade-in py-20 px-4 text-center">
             <FileText size={48} className="mb-4 text-[#DCE6D8]/50" />
             <h3 className="font-serif text-xl font-bold text-[#F8F4EC] mb-2">{activeLecture?.title || "No Module Selected"}</h3>
             <p className="text-sm text-[#DCE6D8]/70 max-w-sm">Content for this module is being finalized by academy faculty.</p>
             {activeLecture && (
               <div className="mt-6">
                <MarkCompleteButton 
                  courseId={course.id.toString()} 
                  lectureId={Number(activeLectureId)} 
                  isCompleted={completedLectures.includes(Number(activeLectureId))} 
                />
               </div>
             )}
           </div>
        )}
      </div>
      
      <div className="w-full max-w-5xl mx-auto py-8 px-4 sm:px-6">
        {/* Tabs for Discussions and Notes */}
        <div className="flex gap-6 border-b border-[#E9DFCC] mb-6">
          <button 
            onClick={() => setActiveTab('discussions')}
            className={`pb-3 font-medium text-xs uppercase tracking-wider flex items-center gap-2 transition-colors border-b-2 ${
              activeTab === 'discussions' 
                ? 'border-[#24483C] text-[#24483C] font-bold' 
                : 'border-transparent text-[#556960] hover:text-[#1B2E26]'
            }`}
          >
            <MessageSquare size={16} />
            Academic Q&A / Discussions
          </button>
          {activeLecture?.type === 'video' && (
            <button 
              onClick={() => setActiveTab('notes')}
              className={`pb-3 font-medium text-xs uppercase tracking-wider flex items-center gap-2 transition-colors border-b-2 ${
                activeTab === 'notes' 
                  ? 'border-[#24483C] text-[#24483C] font-bold' 
                  : 'border-transparent text-[#556960] hover:text-[#1B2E26]'
              }`}
            >
              <StickyNote size={16} />
              Scholar Notes
            </button>
          )}
        </div>

        <div className="bg-[#FAF7F0] border border-[#E9DFCC] rounded-2xl shadow-sm overflow-hidden">
          {activeTab === 'discussions' ? (
            <CourseDiscussions courseId={course.id.toString()} lectureId={Number(activeLectureId)} currentUser={dbUser} />
          ) : (
            <CourseNotes courseId={course.id.toString()} lectureId={Number(activeLectureId)} getCurrentTime={getCurrentTime} onSeek={handleSeek} />
          )}
        </div>
      </div>
    </div>
  );
}
