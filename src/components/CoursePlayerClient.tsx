"use client";

import { useRef, useState, useEffect } from "react";
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

  const [videoSrc, setVideoSrc] = useState<string>(() => {
    if (activeLecture?.type === 'video' && activeLecture?.content) {
      if (activeLecture.content.startsWith('http') && (!activeLecture.content.includes('amazonaws.com') || activeLecture.content.includes('X-Amz-Signature'))) {
        return activeLecture.content;
      }
    }
    return '';
  });
  const [videoError, setVideoError] = useState<string | null>(null);
  const [isLoadingVideo, setIsLoadingVideo] = useState<boolean>(false);

  useEffect(() => {
    if (activeLecture?.type !== 'video' || !activeLecture?.content) {
      setVideoSrc('');
      setVideoError(null);
      setIsLoadingVideo(false);
      return;
    }

    // If it's already an active presigned URL or external streaming link
    if (activeLecture.content.startsWith('http') && (!activeLecture.content.includes('amazonaws.com') || activeLecture.content.includes('X-Amz-Signature'))) {
      setVideoSrc(activeLecture.content);
      setVideoError(null);
      setIsLoadingVideo(false);
      return;
    }

    // Otherwise, fetch short-lived secure playback URL from authenticated endpoint
    let isMounted = true;
    setIsLoadingVideo(true);
    setVideoError(null);

    fetch(`/api/courses/${course.id}/video-url?lectureId=${activeLectureId}`)
      .then(res => res.json())
      .then(data => {
        if (!isMounted) return;
        if (data.success && data.url) {
          setVideoSrc(data.url);
          setVideoError(null);
        } else {
          setVideoError(data.error || "Unable to retrieve secure video stream.");
        }
      })
      .catch(err => {
        if (!isMounted) return;
        setVideoError(err.message || "Network error loading video stream.");
      })
      .finally(() => {
        if (isMounted) setIsLoadingVideo(false);
      });

    return () => {
      isMounted = false;
    };
  }, [course?.id, activeLectureId, activeLecture?.content, activeLecture?.type]);

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
              {isLoadingVideo ? (
                <div className="flex flex-col items-center justify-center py-20 text-[#DCE6D8]/80 text-center px-4">
                  <div className="w-10 h-10 border-2 border-[#C96F4A] border-t-transparent rounded-full animate-spin mb-4" />
                  <p className="font-serif text-sm">Authorizing secure media playback...</p>
                </div>
              ) : videoError ? (
                <div className="flex flex-col items-center justify-center py-16 px-6 text-center max-w-md">
                  <div className="w-12 h-12 rounded-full bg-red-900/30 border border-red-500/30 flex items-center justify-center text-red-400 mb-4">
                    <FileText size={24} />
                  </div>
                  <h4 className="font-serif text-lg font-bold text-[#F8F4EC] mb-2">Media Stream Unavailable</h4>
                  <p className="text-xs text-[#DCE6D8]/80 mb-4 leading-relaxed">{videoError}</p>
                  <button 
                    onClick={() => {
                      setIsLoadingVideo(true);
                      setVideoError(null);
                      fetch(`/api/courses/${course.id}/video-url?lectureId=${activeLectureId}`)
                        .then(res => res.json())
                        .then(data => {
                          if (data.success && data.url) {
                            setVideoSrc(data.url);
                          } else {
                            setVideoError(data.error || "Unable to retrieve secure video stream.");
                          }
                        })
                        .catch(err => setVideoError(err.message))
                        .finally(() => setIsLoadingVideo(false));
                    }}
                    className="px-4 py-2 bg-[#24483C] hover:bg-[#1B2E26] text-[#F8F4EC] border border-[#E9DFCC]/30 rounded-lg text-xs font-semibold transition-colors"
                  >
                    Retry Authorization
                  </button>
                </div>
              ) : videoSrc ? (
                <>
                  <SecureVideoPlayer ref={videoRef} src={videoSrc} userEmail={userEmail || "Student"} />
                  <div className="absolute top-2.5 left-2.5 sm:top-4 sm:left-4 z-10 bg-[#24483C]/85 backdrop-blur-md text-[#F8F4EC] px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-xl text-[11px] sm:text-xs font-medium border border-[#E9DFCC]/30 pointer-events-none shadow-sm flex items-center gap-1.5 sm:gap-2 max-w-[70%]">
                    <span className="w-2 h-2 rounded-full bg-[#C96F4A] animate-pulse shrink-0"></span>
                    <span className="truncate">Active: {activeLecture.title}</span>
                  </div>
                  <div className="hidden sm:block absolute bottom-4 right-4 z-20">
                    <MarkCompleteButton 
                      courseId={course.id.toString()} 
                      lectureId={Number(activeLectureId)} 
                      isCompleted={completedLectures.includes(Number(activeLectureId))} 
                    />
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-[#DCE6D8]/80 text-center px-4">
                  <FileText size={48} className="mb-4 text-[#DCE6D8]/50" />
                  <p className="font-serif text-sm">No video stream available for this lecture.</p>
                </div>
              )}
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

      {/* Mobile Player Actions Bar */}
      {activeLecture?.type === 'video' && videoSrc && (
        <div className="sm:hidden px-4 py-3 bg-[#FAF7F0] border-b border-[#E9DFCC] flex items-center justify-between gap-3 shadow-xs">
          <span className="text-xs font-serif font-bold text-[#1B2E26] truncate">
            {activeLecture?.title}
          </span>
          <div className="shrink-0">
            <MarkCompleteButton 
              courseId={course.id.toString()} 
              lectureId={Number(activeLectureId)} 
              isCompleted={completedLectures.includes(Number(activeLectureId))} 
            />
          </div>
        </div>
      )}
      
      <div className="w-full max-w-5xl mx-auto py-6 sm:py-8 px-3 sm:px-6">
        {/* Tabs for Discussions and Notes */}
        <div className="flex gap-4 sm:gap-6 border-b border-[#E9DFCC] mb-6 overflow-x-auto scrollbar-none">
          <button 
            onClick={() => setActiveTab('discussions')}
            className={`pb-3 font-medium text-xs uppercase tracking-wider flex items-center gap-2 transition-colors border-b-2 shrink-0 whitespace-nowrap ${
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
              className={`pb-3 font-medium text-xs uppercase tracking-wider flex items-center gap-2 transition-colors border-b-2 shrink-0 whitespace-nowrap ${
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
