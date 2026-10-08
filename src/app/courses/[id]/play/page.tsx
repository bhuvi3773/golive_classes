import { getUserFromCookie } from "@/lib/auth";
import { CourseRepository } from "@/lib/repositories/course.repository";
import { redirect } from "next/navigation";
import SecureVideoPlayer from "@/components/SecureVideoPlayer";
import Link from "next/link";
import { CheckCircle, PlayCircle, FileText, ChevronLeft, Award } from "lucide-react";
import { ProgressRepository } from "@/lib/repositories/progress.repository";
import MarkCompleteButton from "@/components/MarkCompleteButton";
import CoursePlayerClient from "@/components/CoursePlayerClient";

export const dynamic = 'force-dynamic';

export default async function CoursePlayPage({ params, searchParams }: { params: Promise<{ id: string }>, searchParams: Promise<{ lectureId?: string }> }) {
  const user = await getUserFromCookie();
  if (!user) {
    redirect('/login');
  }

  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const course = await CourseRepository.findById(resolvedParams.id);
  
  if (!course) {
    redirect('/courses');
  }

  const curriculum = (course.curriculum as any) || [];
  let firstLectureId: number | null = null;
  if (curriculum.length > 0 && curriculum[0].lectures && curriculum[0].lectures.length > 0) {
    firstLectureId = curriculum[0].lectures[0].id;
  }

  let activeLecture: any = null;
  let activeLectureId = resolvedSearchParams.lectureId ? Number(resolvedSearchParams.lectureId) : null;
  
  // Find the selected lecture or default to the first available lecture
  for (const section of curriculum) {
    for (const lecture of section.lectures) {
      if (!activeLectureId) {
        activeLectureId = lecture.id;
        activeLecture = lecture;
        break;
      }
      if (activeLectureId === lecture.id) {
        activeLecture = lecture;
        break;
      }
    }
    if (activeLecture) break;
  }

  const { UserRepository } = await import('@/lib/repositories/user.repository');
  const dbUser = await UserRepository.findById(user.userId);
  const isOwner = dbUser && dbUser.purchasedCourses && dbUser.purchasedCourses.some((c: any) => c.id === course.id);
  
  if (!isOwner) {
    // If they don't own it and they are trying to access a lecture that is NOT the first lecture, redirect them
    if (activeLectureId !== firstLectureId) {
      redirect(`/courses/${course.id}`);
    } else {
      // Send follow-up / recommendation email asynchronously for free demo watchers
      import('@/lib/email').then(async ({ sendCourseRecommendationEmail }) => {
        if (dbUser.email) {
          const prisma = (await import('@/lib/prisma')).default;
          const recommendations = await prisma.course.findMany({
            where: { category: course.category, id: { not: course.id }, status: 'published' },
            take: 2
          });
          sendCourseRecommendationEmail(dbUser.email, dbUser.name || 'Student', course.title, recommendations).catch(console.error);
        }
      }).catch(console.error);
    }
  }

  let progress = await ProgressRepository.findProgress(user.userId, course.id);
  const completedLectures = progress?.completedLectures || [];

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] overflow-hidden">
      {/* Header */}
      <div className="bg-white h-14 border-b border-slate-200 flex items-center px-4 shrink-0 justify-between">
        <div className="flex items-center gap-4">
          <Link href={`/courses/${course.id}`} className="text-slate-500 hover:text-slate-900 transition-colors">
            <ChevronLeft size={24} />
          </Link>
          <h1 className="text-slate-900 font-bold text-sm md:text-base line-clamp-1">{course.title}</h1>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden flex-col lg:flex-row">
        
        {/* Main Content Area */}
        <CoursePlayerClient 
          course={course}
          activeLecture={activeLecture}
          activeLectureId={activeLectureId}
          completedLectures={completedLectures}
          userEmail={user.email}
          dbUser={dbUser}
        />

        {/* Sidebar Curriculum List */}
        <div className="w-full lg:w-80 xl:w-96 bg-[#12141f] border-l border-slate-200 flex flex-col overflow-y-auto shrink-0 border-t lg:border-t-0">
          <div className="p-4 border-b border-slate-200 bg-white sticky top-0 z-10">
            <h2 className="text-slate-900 font-bold text-lg">Course Content</h2>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {curriculum.map((section: any, sIdx: number) => (
              <div key={section.id || sIdx} className="mb-2">
                <h3 className="text-sm font-bold text-slate-600 mb-2 px-1">
                  Section {sIdx + 1}: {section.title}
                </h3>
                <div className="space-y-1">
                  {section.lectures?.map((lecture: any, lIdx: number) => {
                    const isFirstLecture = lecture.id === firstLectureId;
                    const isLocked = !isOwner && !isFirstLecture;
                    
                    return (
                      <Link 
                        href={isLocked ? '#' : `/courses/${course.id}/play?lectureId=${lecture.id}`}
                        key={lecture.id || lIdx} 
                        className={`w-full text-left px-3 py-3 rounded-lg flex items-start gap-3 transition-colors ${
                          activeLectureId === lecture.id 
                            ? 'bg-emerald-50 border border-emerald-300 text-emerald-600' 
                            : isLocked 
                              ? 'opacity-60 cursor-not-allowed hover:bg-slate-50' 
                              : 'hover:bg-slate-100 text-slate-500'
                        }`}
                        onClick={(e) => {
                          if (isLocked) {
                            e.preventDefault();
                          }
                        }}
                      >
                        <div className="mt-0.5">
                          {isLocked ? (
                            <div className="text-slate-400" title="Locked (Requires Purchase)">🔒</div>
                          ) : (
                            <CheckCircle size={16} className={completedLectures.includes(lecture.id) ? 'text-green-500' : activeLectureId === lecture.id ? 'text-blue-500' : 'text-gray-600'} />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className={`text-sm font-medium leading-tight ${activeLectureId === lecture.id ? 'text-blue-300' : 'text-slate-600'}`}>
                            {lIdx + 1}. {lecture.title} {isFirstLecture && !isOwner && <span className="ml-2 text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-bold">Free Preview</span>}
                          </p>
                          <div className="flex items-center gap-1 mt-1 text-xs opacity-70">
                            {lecture.type === 'video' ? <PlayCircle size={12} /> : lecture.type === 'quiz' ? <Award size={12} /> : lecture.type === 'assignment' ? <FileText size={12} /> : <FileText size={12} />}
                            <span className="capitalize">{lecture.type || 'Article'}</span>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
            {curriculum.length === 0 && (
              <p className="text-slate-400 text-sm text-center py-8">Curriculum is empty.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
