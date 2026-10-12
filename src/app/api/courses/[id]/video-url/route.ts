import { NextRequest, NextResponse } from "next/server";
import { getUserFromCookie } from "@/lib/auth";
import { CourseRepository } from "@/lib/repositories/course.repository";
import { UserRepository } from "@/lib/repositories/user.repository";
import { getPresignedDownloadUrl, isS3Url, extractS3Key } from "@/lib/s3";

export const dynamic = "force-dynamic";

/**
 * GET /api/courses/[id]/video-url?lectureId=123
 * Securely retrieves a short-lived presigned download URL for a course video.
 * Enforces course enrollment, instructor/admin permissions, and free preview rules.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserFromCookie();
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    const resolvedParams = await params;
    const courseId = resolvedParams.id;
    if (!courseId) {
      return NextResponse.json(
        { success: false, error: "Course ID is required" },
        { status: 400 }
      );
    }

    const { searchParams } = new URL(request.url);
    const lectureIdParam = searchParams.get("lectureId");
    if (!lectureIdParam) {
      return NextResponse.json(
        { success: false, error: "Lecture ID is required" },
        { status: 400 }
      );
    }
    const lectureId = Number(lectureIdParam);

    const course = await CourseRepository.findById(courseId);
    if (!course) {
      return NextResponse.json(
        { success: false, error: "Course not found" },
        { status: 404 }
      );
    }

    const curriculum = (course.curriculum as any) || [];
    let requestedLecture: any = null;
    let firstLectureId: number | null = null;

    if (curriculum.length > 0 && curriculum[0].lectures && curriculum[0].lectures.length > 0) {
      firstLectureId = curriculum[0].lectures[0].id;
    }

    for (const section of curriculum) {
      for (const lecture of (section.lectures || [])) {
        if (lecture.id === lectureId) {
          requestedLecture = lecture;
          break;
        }
      }
      if (requestedLecture) break;
    }

    if (!requestedLecture) {
      return NextResponse.json(
        { success: false, error: "Lecture not found in course curriculum" },
        { status: 404 }
      );
    }

    // Role-based authorization
    const isStaff = ["admin", "superadmin"].includes(user.role?.toLowerCase());
    
    // Check enrollment
    const dbUser = await UserRepository.findById(user.userId);
    const isEnrolled = dbUser?.purchasedCourses?.some((c: any) => c.id === course.id);
    const isFirstLecture = firstLectureId !== null && lectureId === firstLectureId;

    // Access granted if: staff, enrolled student, or first lecture (free preview)
    const hasAccess = isStaff || isEnrolled || isFirstLecture;

    if (!hasAccess) {
      return NextResponse.json(
        {
          success: false,
          error: "Access denied. Course enrollment is required to view this lecture."
        },
        { status: 403 }
      );
    }

    const rawContent = requestedLecture.content;
    if (!rawContent) {
      return NextResponse.json({
        success: true,
        url: "",
        message: "No content available for this lecture yet"
      });
    }

    // Check if content is an S3 asset or key
    if (isS3Url(rawContent) || rawContent.startsWith("courses/")) {
      const s3Key = extractS3Key(rawContent);
      if (!s3Key) {
        return NextResponse.json(
          { success: false, error: "Invalid S3 storage key" },
          { status: 500 }
        );
      }

      // Generate short-lived presigned URL (1 hour)
      const presignedUrl = await getPresignedDownloadUrl(s3Key, 3600);
      if (!presignedUrl) {
        return NextResponse.json(
          { success: false, error: "Failed to generate secure playback token" },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        url: presignedUrl,
        expiresIn: 3600,
        isS3: true
      });
    }

    // Return non-S3 content as-is (e.g. YouTube, Vimeo, external link)
    return NextResponse.json({
      success: true,
      url: rawContent,
      isS3: false
    });
  } catch (error: any) {
    console.error("Error generating secure video URL:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error retrieving secure video URL" },
      { status: 500 }
    );
  }
}
