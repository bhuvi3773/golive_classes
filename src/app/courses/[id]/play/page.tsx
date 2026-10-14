import { getUserFromCookie } from "@/lib/auth";
import { CourseRepository } from "@/lib/repositories/course.repository";
import { redirect } from "next/navigation";
import Link from "next/link";
import { CheckCircle, PlayCircle, FileText, ChevronLeft, Award, Lock } from "lucide-react";
import { ProgressRepository } from "@/lib/repositories/progress.repository";
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

  let progress = await ProgressRepository.findProgress(user.userId, course.id);
  const completedLectures = progress?.completedLectures || [];

  let activeLecture: any = null;
  let activeLectureId = resolvedSearchParams.lectureId ? Number(resolvedSearchParams.lectureId) : null;
  
  // Find the selected lecture or default to the best available lecture
  if (!activeLectureId) {
    let firstIncompleteId = null;
    let isLastAccessedValid = false;

    // Validate if lastAccessedLecture exists in curriculum
    for (const section of curriculum) {
      for (const lecture of (section.lectures || [])) {
        if (!firstIncompleteId && !completedLectures.includes(lecture.id)) {
          firstIncompleteId = lecture.id;
        }
        if (progress?.lastAccessedLecture === lecture.id) {
          isLastAccessedValid = true;
        }
      }
    }

    if (isLastAccessedValid) {
      activeLectureId = progress!.lastAccessedLecture;
    } else if (firstIncompleteId) {
      activeLectureId = firstIncompleteId;
    } else {
      activeLectureId = firstLectureId;
    }
  }

  for (const section of curriculum) {
    for (const lecture of (section.lectures || [])) {
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
  const isStaff = ["admin", "superadmin"].includes(user.role?.toLowerCase() || "");
  const isFree = Number(course.price) === 0;
  const hasAccess = isOwner || isStaff || isFree;
  
  if (!hasAccess) {
    // If they don't own it and are not staff, and trying to access a lecture that is NOT the first lecture, redirect them
    if (activeLectureId !== firstLectureId) {
      redirect(`/courses/${course.id}`);
    } else {
      // Send follow-up / recommendation email asynchronously for free demo watchers
      import('@/lib/email').then(async ({ sendCourseRecommendationEmail }) => {
        if (dbUser && dbUser.email) {
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

  // Resolve private S3 video content to short-lived presigned URL
  let playableLecture = activeLecture;
  const rawLectureContent = activeLecture?.content || activeLecture?.s3Key;
  if (activeLecture?.type === 'video' && rawLectureContent) {
    const { isS3Url, extractS3Key, getPresignedDownloadUrl } = await import('@/lib/s3');
    if (isS3Url(rawLectureContent) || rawLectureContent.startsWith('courses/') || rawLectureContent.startsWith('course-media/')) {
      const s3Key = extractS3Key(rawLectureContent);
      if (s3Key) {
        try {
          const presignedUrl = await getPresignedDownloadUrl(s3Key, 3600);
          if (presignedUrl) {
            playableLecture = { ...activeLecture, content: presignedUrl };
          }
        } catch (err) {
          console.error("Failed to generate presigned download URL for course video:", err);
        }
      }
    }
  }

  return (
    <div className="flex flex-col min-h-[calc(100vh-64px)] lg:h-[calc(100vh-64px)] lg:overflow-hidden bg-[#F8F4EC] text-[#1B2E26] w-full">
      {/* Player Topbar */}
      <div className="bg-[#FAF7F0] h-14 border-b border-[#E9DFCC] flex items-center px-3 sm:px-4 shrink-0 justify-between shadow-sm">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <Link 
            href={`/courses/${course.id}`} 
            className="p-1.5 rounded-lg text-[#556960] hover:text-[#24483C] hover:bg-[#E9DFCC]/50 transition-colors shrink-0"
            title="Return to course overview"
          >
            <ChevronLeft size={22} />
          </Link>
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-[10px] font-bold uppercase tracking-wider bg-[#DCE6D8] text-[#24483C] px-2 py-0.5 rounded shrink-0">
              Player
            </span>
            <h1 className="font-serif font-bold text-xs sm:text-sm md:text-base text-[#1B2E26] truncate">{course.title}</h1>
          </div>
        </div>
        <div className="text-xs text-[#556960] font-mono hidden sm:block shrink-0">
          {completedLectures.length} Completed
        </div>
      </div>

      <div className="flex flex-1 flex-col lg:flex-row lg:overflow-hidden min-h-0">
        {/* Main Content Area */}
        <CoursePlayerClient 
          course={course}
          activeLecture={playableLecture}
          activeLectureId={activeLectureId}
          completedLectures={completedLectures}
          userEmail={user.email}
          dbUser={dbUser}
        />

        {/* Sidebar Curriculum List */}
        <div className="w-full lg:w-80 xl:w-96 bg-[#FAF7F0] lg:border-l border-[#E9DFCC] flex flex-col overflow-y-auto shrink-0 border-t lg:border-t-0 max-h-[50vh] lg:max-h-none">
          <div className="p-3.5 sm:p-4 border-b border-[#E9DFCC] bg-[#FAF7F0] sticky top-0 z-10 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#C96F4A]">Curriculum</span>
              <h2 className="font-serif text-sm sm:text-base font-bold text-[#1B2E26]">Syllabus Modules</h2>
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#DCE6D8] text-[#24483C]">
              {curriculum.length} Sections
            </span>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {curriculum.map((section: any, sIdx: number) => (
              <div key={section.id || sIdx} className="mb-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#3D5A4C] mb-2 px-1">
                  Section {sIdx + 1}: {section.title}
                </h3>
                <div className="space-y-1">
                  {section.lectures?.map((lecture: any, lIdx: number) => {
                    const isFirstLecture = lecture.id === firstLectureId;
                    const isLocked = !hasAccess && !isFirstLecture;
                    const isActive = activeLectureId === lecture.id;
                    const isCompleted = completedLectures.includes(lecture.id);
                    
                    return (
                      <Link 
                        href={isLocked ? '#' : `/courses/${course.id}/play?lectureId=${lecture.id}`}
                        key={lecture.id || lIdx} 
                        className={`w-full text-left px-3 py-2.5 rounded-xl flex items-start gap-3 transition-colors ${
                          isActive 
                            ? 'bg-[#DCE6D8] border border-[#24483C]/30 text-[#24483C] shadow-sm' 
                            : isLocked 
                              ? 'opacity-60 cursor-not-allowed hover:bg-[#E9DFCC]/20 text-[#556960]' 
                              : 'hover:bg-[#E9DFCC]/40 text-[#1B2E26]'
                        }`}
                      >
                        <div className="mt-0.5 shrink-0">
                          {isLocked ? (
                            <Lock size={15} className="text-[#556960]" />
                          ) : (
                            <CheckCircle size={16} className={isCompleted ? 'text-[#24483C]' : isActive ? 'text-[#C96F4A]' : 'text-[#556960]/50'} />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-xs font-medium leading-snug line-clamp-2 ${isActive ? 'font-bold text-[#24483C]' : 'text-[#1B2E26]'}`}>
                            {lIdx + 1}. {lecture.title} 
                            {isFirstLecture && !isOwner && (
                              <span className="ml-1.5 text-[10px] bg-[#C96F4A]/10 text-[#C96F4A] border border-[#C96F4A]/30 px-1.5 py-0.2 rounded font-bold uppercase">
                                Free Preview
                              </span>
                            )}
                          </p>
                          <div className="flex items-center gap-1.5 mt-1 text-[11px] text-[#556960]">
                            {lecture.type === 'video' ? <PlayCircle size={11} /> : lecture.type === 'quiz' ? <Award size={11} /> : <FileText size={11} />}
                            <span className="capitalize">{lecture.type || 'Lecture'}</span>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
            {curriculum.length === 0 && (
              <p className="text-[#556960] text-xs text-center py-8">Syllabus content is being compiled.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
