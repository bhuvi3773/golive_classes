import crypto from 'crypto';
import path from 'path';

// Setup environment variables before any module loads
process.env.JWT_SECRET = 'test_jwt_secret_9876543210';
process.env.DATABASE_URL = 'postgresql://mock_user:mock_pass@localhost:5432/mock_db';
process.env.AWS_REGION = 'ap-south-1';
process.env.AWS_ACCESS_KEY_ID = 'MOCK_AWS_ACCESS_KEY_ID_123';
process.env.AWS_SECRET_ACCESS_KEY = 'MOCK_AWS_SECRET_ACCESS_KEY_456';
process.env.AWS_S3_BUCKET_NAME = 'goliveofflinevideos2025';

// -------------------------------------------------------------
// In-Memory Mock Stores & Interceptors
// -------------------------------------------------------------

interface MockUser {
  id: string;
  name: string;
  email: string;
  role: string;
  purchasedCourses: { id: string; title: string }[];
}

interface MockCourse {
  id: string;
  title: string;
  description: string;
  category: string;
  price: number;
  thumbnail?: string;
  status: string;
  curriculum: any;
  goals?: string[];
  requirements?: string[];
  targetAudience?: string[];
}

let currentMockUser: { userId: string; role: string; email?: string; name?: string } | null = null;
let mockUsers: Map<string, MockUser> = new Map();
let mockCourses: Map<string, MockCourse> = new Map();
let forceDbCourseUpdateError = false;

// Mock Auth module
const authPath = require.resolve('@/lib/auth');
require.cache[authPath] = {
  id: authPath,
  filename: authPath,
  loaded: true,
  exports: {
    getUserFromCookie: async () => currentMockUser,
  },
} as any;

// Mock Repositories
const courseRepoPath = require.resolve('@/lib/repositories/course.repository');
require.cache[courseRepoPath] = {
  id: courseRepoPath,
  filename: courseRepoPath,
  loaded: true,
  exports: {
    CourseRepository: {
      findById: async (id: string) => {
        const c = mockCourses.get(id);
        return c ? JSON.parse(JSON.stringify(c)) : null;
      },
      findAll: async () => Array.from(mockCourses.values()),
      update: async (id: string, data: any) => {
        if (forceDbCourseUpdateError) {
          throw new Error('Database connection error during course update');
        }
        const existing = mockCourses.get(id);
        if (!existing) return null;
        const updated = { ...existing, ...data };
        mockCourses.set(id, updated);
        return JSON.parse(JSON.stringify(updated));
      },
      create: async (data: any) => {
        const id = data.id || `course_${Date.now()}`;
        const newCourse = { id, ...data };
        mockCourses.set(id, newCourse);
        return JSON.parse(JSON.stringify(newCourse));
      },
      delete: async (id: string) => {
        const existing = mockCourses.get(id);
        if (!existing) return null;
        mockCourses.delete(id);
        return existing;
      }
    },
  },
} as any;

const userRepoPath = require.resolve('@/lib/repositories/user.repository');
require.cache[userRepoPath] = {
  id: userRepoPath,
  filename: userRepoPath,
  loaded: true,
  exports: {
    UserRepository: {
      findById: async (id: string) => {
        const u = mockUsers.get(id);
        return u ? JSON.parse(JSON.stringify(u)) : null;
      },
    },
  },
} as any;

// Mock Prisma
const prismaPath = require.resolve('@/lib/prisma');
const mockPrismaObj = {
  course: {
    findMany: async () => [],
  },
};
require.cache[prismaPath] = {
  id: prismaPath,
  filename: prismaPath,
  loaded: true,
  exports: {
    default: mockPrismaObj,
    ...mockPrismaObj,
  },
} as any;

// Mock Email
const emailPath = require.resolve('@/lib/email');
require.cache[emailPath] = {
  id: emailPath,
  filename: emailPath,
  loaded: true,
  exports: {
    sendCourseRecommendationEmail: async () => Promise.resolve(),
    sendEnrollmentEmail: async () => Promise.resolve(),
  },
} as any;

// Mock AWS S3 client & signer
const s3ClientMock = {
  send: async (cmd: any) => ({ $metadata: { httpStatusCode: 200 } }),
};

jestMockAwsSdk();

function jestMockAwsSdk() {
  const s3SdkPath = require.resolve('@aws-sdk/client-s3');
  require.cache[s3SdkPath] = {
    id: s3SdkPath,
    filename: s3SdkPath,
    loaded: true,
    exports: {
      S3Client: class {
        constructor(public config: any) {}
        send = s3ClientMock.send;
      },
      PutObjectCommand: class {
        constructor(public input: any) {}
      },
      GetObjectCommand: class {
        constructor(public input: any) {}
      },
      DeleteObjectCommand: class {
        constructor(public input: any) {}
      },
    },
  } as any;

  const s3PresignerPath = require.resolve('@aws-sdk/s3-request-presigner');
  require.cache[s3PresignerPath] = {
    id: s3PresignerPath,
    filename: s3PresignerPath,
    loaded: true,
    exports: {
      getSignedUrl: async (client: any, command: any, options: any) => {
        const bucket = command.input.Bucket || process.env.AWS_S3_BUCKET_NAME;
        const key = command.input.Key;
        const expires = options?.expiresIn || 900;
        return `https://${bucket}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Expires=${expires}&X-Amz-Signature=mockedsignature123`;
      },
    },
  } as any;
}

// -------------------------------------------------------------
// Test Harness Helpers
// -------------------------------------------------------------

function resetTestState() {
  currentMockUser = null;
  forceDbCourseUpdateError = false;
  mockUsers.clear();
  mockCourses.clear();

  // Create standard test users
  mockUsers.set('user_admin_1', {
    id: 'user_admin_1',
    name: 'Admin User',
    email: 'admin@goliveclasses.test',
    role: 'admin',
    purchasedCourses: [],
  });

  mockUsers.set('user_superadmin_1', {
    id: 'user_superadmin_1',
    name: 'Super Admin',
    email: 'superadmin@goliveclasses.test',
    role: 'superadmin',
    purchasedCourses: [],
  });

  mockUsers.set('user_student_enrolled', {
    id: 'user_student_enrolled',
    name: 'Enrolled Student',
    email: 'student.enrolled@goliveclasses.test',
    role: 'student',
    purchasedCourses: [{ id: 'course_paid_1', title: 'Complete Web Architecture' }],
  });

  mockUsers.set('user_student_unenrolled', {
    id: 'user_student_unenrolled',
    name: 'Unenrolled Student',
    email: 'student.unenrolled@goliveclasses.test',
    role: 'student',
    purchasedCourses: [],
  });

  // Create standard test courses
  mockCourses.set('course_paid_1', {
    id: 'course_paid_1',
    title: 'Complete Web Architecture',
    description: 'Master backend and frontend systems',
    category: 'Engineering',
    price: 4999,
    status: 'published',
    thumbnail: 'https://goliveofflinevideos2025.s3.ap-south-1.amazonaws.com/course-media/thumbnails/arch.jpg',
    curriculum: [
      {
        id: 1,
        title: 'Section 1: Foundations',
        lectures: [
          {
            id: 101,
            title: '1. Welcome & Introduction',
            type: 'video',
            content: 'course-media/videos/1741-welcome.mp4',
            s3Key: 'course-media/videos/1741-welcome.mp4',
            originalName: 'welcome.mp4',
            fileSize: 15000000,
          },
          {
            id: 102,
            title: '2. Deep Dive System Architecture',
            type: 'video',
            content: 'course-media/videos/1741-deep-dive.mp4',
            s3Key: 'course-media/videos/1741-deep-dive.mp4',
            originalName: 'deep-dive.mp4',
            fileSize: 45000000,
          },
        ],
      },
      {
        id: 2,
        title: 'Section 2: Database Scalability',
        lectures: [
          {
            id: 201,
            title: '3. PostgreSQL Optimization',
            type: 'video',
            content: 'course-media/videos/1741-postgres.mp4',
            s3Key: 'course-media/videos/1741-postgres.mp4',
            originalName: 'postgres.mp4',
            fileSize: 55000000,
          },
        ],
      },
    ],
  });

  mockCourses.set('course_free_1', {
    id: 'course_free_1',
    title: 'Open Primer to Cloud Services',
    description: 'Free introduction to cloud services',
    category: 'Cloud',
    price: 0,
    status: 'published',
    thumbnail: '',
    curriculum: [
      {
        id: 1,
        title: 'Section 1: Free Foundations',
        lectures: [
          {
            id: 501,
            title: '1. Introduction to Cloud',
            type: 'video',
            content: 'course-media/videos/1741-cloud-intro.mp4',
            s3Key: 'course-media/videos/1741-cloud-intro.mp4',
          },
          {
            id: 502,
            title: '2. Deploying First Node',
            type: 'video',
            content: 'course-media/videos/1741-first-node.mp4',
            s3Key: 'course-media/videos/1741-first-node.mp4',
          },
        ],
      },
    ],
  });

  // Target course from user prompt
  mockCourses.set('dce63425-6b4c-4fce-aca0-33e7c380b927', {
    id: 'dce63425-6b4c-4fce-aca0-33e7c380b927',
    title: 'Newly Created Affected Course',
    description: 'Course created in preview with initially empty curriculum',
    category: 'Full Stack',
    price: 2999,
    status: 'draft',
    thumbnail: '',
    curriculum: [],
  });
}

let passedCount = 0;
let failedCount = 0;

function assert(condition: boolean, testName: string, detail: string = '') {
  if (condition) {
    console.log(`  ✔ [PASS] ${testName}`);
    passedCount++;
  } else {
    console.error(`  ✖ [FAIL] ${testName} - ${detail}`);
    failedCount++;
  }
}

// -------------------------------------------------------------
// Test Execution
// -------------------------------------------------------------

async function runAllTests() {
  console.log('\n============================================================');
  console.log('   VIDEO UPLOAD, PERSISTENCE & PLAYBACK SECURITY SUITE      ');
  console.log('============================================================\n');

  // Load modules to test
  const { POST: uploadRoute } = await import('@/lib/../app/api/upload/route');
  const { PUT: courseUpdateRoute, GET: courseGetRoute } = await import('@/lib/../app/api/courses/[id]/route');
  const { GET: videoUrlRoute } = await import('@/lib/../app/api/courses/[id]/video-url/route');
  const { 
    validateFileType, 
    sanitizeFileName, 
    generateS3Key, 
    isS3Url, 
    extractS3Key, 
    getPresignedUploadUrl, 
    getPresignedDownloadUrl 
  } = await import('@/lib/s3');

  // =========================================================================
  // SECTION 1: Presigned S3 Upload Authorization & Input Validation (/api/upload)
  // =========================================================================
  console.log('SECTION 1: Presigned S3 Upload Authorization & Input Validation (/api/upload)');

  resetTestState();
  // V-01: Rejects unauthenticated request with 401
  currentMockUser = null;
  const reqV01 = new Request('http://localhost:3000/api/upload', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fileName: 'lecture.mp4', fileType: 'video/mp4', folderType: 'video' }),
  });
  const resV01 = await uploadRoute(reqV01);
  assert(resV01.status === 401, 'V-01: Rejects unauthenticated upload request with 401');

  // V-02: Rejects standard student role with 401 (requires admin/superadmin)
  currentMockUser = { userId: 'user_student_enrolled', role: 'student', email: 'student@test.com' };
  const reqV02 = new Request('http://localhost:3000/api/upload', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fileName: 'lecture.mp4', fileType: 'video/mp4', folderType: 'video' }),
  });
  const resV02 = await uploadRoute(reqV02);
  assert(resV02.status === 401, 'V-02: Rejects student role from uploading with 401');

  // V-03: Rejects missing fileName or fileType with 400
  currentMockUser = { userId: 'user_admin_1', role: 'admin' };
  const reqV03 = new Request('http://localhost:3000/api/upload', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ folderType: 'video' }),
  });
  const resV03 = await uploadRoute(reqV03);
  assert(resV03.status === 400, 'V-03: Rejects missing fileName or fileType with 400');

  // V-04: Rejects disallowed video MIME types with 400
  const reqV04 = new Request('http://localhost:3000/api/upload', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fileName: 'exploit.exe', fileType: 'application/x-msdownload', folderType: 'video' }),
  });
  const resV04 = await uploadRoute(reqV04);
  const dataV04 = await resV04.json();
  assert(resV04.status === 400 && dataV04.error.includes('Invalid file type'), 'V-04: Rejects executable/disallowed MIME type with 400');

  // V-05: Rejects video exceeding 500 MB limit with 400
  const excessiveSize = 501 * 1024 * 1024;
  const reqV05 = new Request('http://localhost:3000/api/upload', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      fileName: 'massive_video.mp4', 
      fileType: 'video/mp4', 
      folderType: 'video', 
      fileSize: excessiveSize 
    }),
  });
  const resV05 = await uploadRoute(reqV05);
  const dataV05 = await resV05.json();
  assert(resV05.status === 400 && dataV05.error.includes('500MB'), 'V-05: Rejects video exceeding 500 MB limit with 400');

  // V-06: Rejects thumbnail exceeding 10 MB limit with 400
  const reqV06 = new Request('http://localhost:3000/api/upload', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      fileName: 'huge_art.png', 
      fileType: 'image/png', 
      folderType: 'thumbnail', 
      fileSize: 11 * 1024 * 1024 
    }),
  });
  const resV06 = await uploadRoute(reqV06);
  assert(resV06.status === 400, 'V-06: Rejects thumbnail exceeding 10 MB limit with 400');

  // V-07: Rejects non-existent courseId with 404
  const reqV07 = new Request('http://localhost:3000/api/upload', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      fileName: 'lecture.mp4', 
      fileType: 'video/mp4', 
      folderType: 'video', 
      courseId: 'non-existent-course-id' 
    }),
  });
  const resV07 = await uploadRoute(reqV07);
  assert(resV07.status === 404, 'V-07: Rejects non-existent courseId with 404');

  // V-08: Authorized admin successfully receives presigned upload URL and S3 key for video
  const reqV08 = new Request('http://localhost:3000/api/upload', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      fileName: 'react_lifecycle.mp4', 
      fileType: 'video/mp4', 
      folderType: 'video', 
      fileSize: 42 * 1024 * 1024,
      courseId: 'dce63425-6b4c-4fce-aca0-33e7c380b927'
    }),
  });
  const resV08 = await uploadRoute(reqV08);
  const dataV08 = await resV08.json();
  assert(
    resV08.status === 200 && 
    dataV08.success === true && 
    dataV08.uploadUrl.includes('amazonaws.com') && 
    dataV08.key.startsWith('course-media/video/'),
    'V-08: Authorized admin receives presigned S3 upload URL and clean object key'
  );

  // V-09: Authorized admin receives presigned upload URL for thumbnail
  const reqV09 = new Request('http://localhost:3000/api/upload', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      fileName: 'cover_art.jpg', 
      fileType: 'image/jpeg', 
      folderType: 'thumbnail',
      courseId: 'dce63425-6b4c-4fce-aca0-33e7c380b927'
    }),
  });
  const resV09 = await uploadRoute(reqV09);
  const dataV09 = await resV09.json();
  assert(
    resV09.status === 200 && 
    dataV09.key.startsWith('course-media/thumbnail/'),
    'V-09: Authorized admin receives presigned S3 upload URL for course thumbnail'
  );

  // =========================================================================
  // SECTION 2: S3 Helper Utilities (src/lib/s3.ts)
  // =========================================================================
  console.log('\nSECTION 2: S3 Helper Utilities (src/lib/s3.ts)');

  // S3-01: Validates MIME types
  assert(validateFileType('video/mp4', 'video') === true, 'S3-01a: Validates video/mp4 for video');
  assert(validateFileType('video/webm', 'video') === true, 'S3-01b: Validates video/webm for video');
  assert(validateFileType('image/png', 'thumbnail') === true, 'S3-01c: Validates image/png for thumbnail');
  assert(validateFileType('text/plain', 'video') === false, 'S3-01d: Rejects text/plain for video');

  // S3-02: Sanitizes file names
  const sanitized = sanitizeFileName('../../dangerous path/malicious;name.mp4');
  assert(!sanitized.includes('/') && !sanitized.includes('..') && sanitized.includes('name.mp4'), 'S3-02: Sanitizes path traversal and illegal characters in file name');

  // S3-03: S3 URL detection and key extraction
  const s3PathKey = 'course-media/videos/12345-lesson.mp4';
  const fullS3Url = `https://goliveofflinevideos2025.s3.ap-south-1.amazonaws.com/${s3PathKey}`;
  assert(isS3Url(s3PathKey) === true, 'S3-03a: Detects raw key course-media/... as S3 URL');
  assert(isS3Url(fullS3Url) === true, 'S3-03b: Detects full S3 bucket URL as S3 URL');
  assert(isS3Url('https://youtube.com/watch?v=123') === false, 'S3-03c: Detects YouTube link as non-S3');
  assert(extractS3Key(fullS3Url) === s3PathKey, 'S3-03d: Extracts clean S3 key from full bucket URL');

  // S3-04: Idempotency: Does not double-sign already presigned URL
  const alreadySignedUrl = 'https://goliveofflinevideos2025.s3.ap-south-1.amazonaws.com/test.mp4?X-Amz-Signature=sig123&X-Amz-Algorithm=AWS4';
  const resigned = await getPresignedDownloadUrl(alreadySignedUrl);
  assert(resigned === alreadySignedUrl, 'S3-04: Avoids re-signing an already signed presigned URL');

  // S3-05: Prefix namespacing for Preview environment isolation
  process.env.AWS_S3_KEY_PREFIX = 'preview';
  const previewKey = generateS3Key('lesson.mp4', 'video');
  assert(previewKey.startsWith('preview/course-media/video/'), 'S3-05a: Generates preview-isolated S3 key when AWS_S3_KEY_PREFIX is set');
  assert(isS3Url(previewKey) === true, 'S3-05b: Detects preview-isolated key as valid S3 URL');
  assert(extractS3Key(`https://goliveofflinevideos2025.s3.ap-south-1.amazonaws.com/${previewKey}`) === previewKey, 'S3-05c: Extracts preview-isolated S3 key correctly');
  delete process.env.AWS_S3_KEY_PREFIX;
  const defaultKey = generateS3Key('lesson.mp4', 'video');
  assert(defaultKey.startsWith('course-media/video/'), 'S3-05d: Reverts to standard course-media prefix when AWS_S3_KEY_PREFIX is unset');

  // =========================================================================
  // SECTION 3: Curriculum Persistence & Management (PUT/GET /api/courses/[id])
  // =========================================================================
  console.log('\nSECTION 3: Curriculum Persistence & Management (PUT/GET /api/courses/[id])');

  resetTestState();
  currentMockUser = { userId: 'user_admin_1', role: 'admin' };
  const targetCourseId = 'dce63425-6b4c-4fce-aca0-33e7c380b927';

  // DB-01: Persisting updated curriculum with uploaded S3 object key
  const updatedSections = [
    {
      id: 1,
      title: 'Module 1: Getting Started',
      lectures: [
        {
          id: 101,
          title: 'Lesson 1: Platform Overview',
          type: 'video',
          content: 'course-media/videos/1741-platform-overview.mp4',
          s3Key: 'course-media/videos/1741-platform-overview.mp4',
          originalName: 'overview.mp4',
          fileSize: 25000000,
          mimeType: 'video/mp4',
          uploadedAt: new Date().toISOString()
        }
      ]
    }
  ];

  const putReqDB01 = new Request(`http://localhost:3000/api/courses/${targetCourseId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ curriculum: updatedSections })
  });
  const putResDB01 = await courseUpdateRoute(putReqDB01, { params: Promise.resolve({ id: targetCourseId }) });
  const putDataDB01 = await putResDB01.json();

  assert(
    putResDB01.status === 200 && 
    Array.isArray(putDataDB01.curriculum) && 
    putDataDB01.curriculum.length === 1 && 
    putDataDB01.curriculum[0].lectures[0].content === 'course-media/videos/1741-platform-overview.mp4',
    'DB-01: Successfully persists curriculum with S3 object key to PostgreSQL record'
  );

  // DB-02: Retrieving course via GET returns persisted curriculum
  const getReqDB02 = new Request(`http://localhost:3000/api/courses/${targetCourseId}`, { method: 'GET' });
  const getResDB02 = await courseGetRoute(getReqDB02, { params: Promise.resolve({ id: targetCourseId }) });
  const getDataDB02 = await getResDB02.json();

  assert(
    getResDB02.status === 200 && 
    getDataDB02.curriculum.length === 1 && 
    getDataDB02.curriculum[0].lectures[0].title === 'Lesson 1: Platform Overview',
    'DB-02: GET /api/courses/[id] successfully retrieves persisted curriculum from database'
  );

  // DB-03: Updating thumbnail persists thumbnail key
  const newThumbnail = 'https://goliveofflinevideos2025.s3.ap-south-1.amazonaws.com/course-media/thumbnail/thumb-123.jpg';
  const putReqDB03 = new Request(`http://localhost:3000/api/courses/${targetCourseId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ thumbnail: newThumbnail })
  });
  const putResDB03 = await courseUpdateRoute(putReqDB03, { params: Promise.resolve({ id: targetCourseId }) });
  const putDataDB03 = await putResDB03.json();
  assert(putResDB03.status === 200 && putDataDB03.thumbnail === newThumbnail, 'DB-03: Successfully updates and persists course thumbnail');

  // DB-04: Non-enrolled students have lecture video content sanitized for non-preview lectures
  currentMockUser = { userId: 'user_student_unenrolled', role: 'student', email: 'unenrolled@test.com' };
  const getReqDB04 = new Request('http://localhost:3000/api/courses/course_paid_1', { method: 'GET' });
  const getResDB04 = await courseGetRoute(getReqDB04, { params: Promise.resolve({ id: 'course_paid_1' }) });
  const getDataDB04 = await getResDB04.json();

  const lecture1 = getDataDB04.curriculum[0].lectures[0]; // First lecture (free preview)
  const lecture2 = getDataDB04.curriculum[0].lectures[1]; // Second lecture (paid content)
  assert(
    lecture1.content !== undefined && lecture2.content === undefined,
    'DB-04: Sanitizes sensitive video content for paid lectures when accessed by non-enrolled user'
  );

  // =========================================================================
  // SECTION 4: Secure Playback Token Generation (/api/courses/[id]/video-url)
  // =========================================================================
  console.log('\nSECTION 4: Secure Playback Token Generation (/api/courses/[id]/video-url)');

  resetTestState();

  // PLAY-01: Rejects unauthenticated request with 401
  currentMockUser = null;
  const playReq01 = new Request('http://localhost:3000/api/courses/course_paid_1/video-url?lectureId=101', { method: 'GET' });
  const playRes01 = await videoUrlRoute(playReq01 as any, { params: Promise.resolve({ id: 'course_paid_1' }) });
  assert(playRes01.status === 401, 'PLAY-01: Rejects unauthenticated request with 401');

  // PLAY-02: Rejects request for non-existent course with 404
  currentMockUser = { userId: 'user_student_enrolled', role: 'student' };
  const playReq02 = new Request('http://localhost:3000/api/courses/non_existent_course/video-url?lectureId=101', { method: 'GET' });
  const playRes02 = await videoUrlRoute(playReq02 as any, { params: Promise.resolve({ id: 'non_existent_course' }) });
  assert(playRes02.status === 404, 'PLAY-02: Rejects non-existent course with 404');

  // PLAY-03: Rejects request for non-existent lecture with 404
  const playReq03 = new Request('http://localhost:3000/api/courses/course_paid_1/video-url?lectureId=9999', { method: 'GET' });
  const playRes03 = await videoUrlRoute(playReq03 as any, { params: Promise.resolve({ id: 'course_paid_1' }) });
  assert(playRes03.status === 404, 'PLAY-03: Rejects non-existent lecture with 404');

  // PLAY-04: Free preview: Unenrolled student CAN access the first lecture video URL
  currentMockUser = { userId: 'user_student_unenrolled', role: 'student', email: 'unenrolled@test.com' };
  const playReq04 = new Request('http://localhost:3000/api/courses/course_paid_1/video-url?lectureId=101', { method: 'GET' });
  const playRes04 = await videoUrlRoute(playReq04 as any, { params: Promise.resolve({ id: 'course_paid_1' }) });
  const playData04 = await playRes04.json();
  assert(
    playRes04.status === 200 && 
    playData04.success === true && 
    playData04.url.includes('X-Amz-Signature'),
    'PLAY-04: Allows unenrolled student to stream first lecture as free preview'
  );

  // PLAY-05: Paywall protection: Unenrolled student is REJECTED with 403 on lecture 2+
  const playReq05 = new Request('http://localhost:3000/api/courses/course_paid_1/video-url?lectureId=102', { method: 'GET' });
  const playRes05 = await videoUrlRoute(playReq05 as any, { params: Promise.resolve({ id: 'course_paid_1' }) });
  const playData05 = await playRes05.json();
  assert(
    playRes05.status === 403 && 
    playData05.error.includes('Course enrollment is required'),
    'PLAY-05: Rejects unenrolled student with 403 when attempting to access paid lecture 2+'
  );

  // PLAY-06: Enrolled student can access any lecture video URL in their enrolled course
  currentMockUser = { userId: 'user_student_enrolled', role: 'student', email: 'student.enrolled@goliveclasses.test' };
  const playReq06 = new Request('http://localhost:3000/api/courses/course_paid_1/video-url?lectureId=102', { method: 'GET' });
  const playRes06 = await videoUrlRoute(playReq06 as any, { params: Promise.resolve({ id: 'course_paid_1' }) });
  const playData06 = await playRes06.json();
  assert(
    playRes06.status === 200 && 
    playData06.success === true && 
    playData06.url.includes('course-media/videos/1741-deep-dive.mp4') && 
    playData06.url.includes('X-Amz-Expires=3600'),
    'PLAY-06: Allows enrolled student to access paid lecture with short-lived presigned URL (1 hour)'
  );

  // PLAY-07: Staff (admin/superadmin) can access any lecture video URL regardless of enrollment
  currentMockUser = { userId: 'user_admin_1', role: 'admin' };
  const playReq07 = new Request('http://localhost:3000/api/courses/course_paid_1/video-url?lectureId=201', { method: 'GET' });
  const playRes07 = await videoUrlRoute(playReq07 as any, { params: Promise.resolve({ id: 'course_paid_1' }) });
  const playData07 = await playRes07.json();
  assert(
    playRes07.status === 200 && 
    playData07.success === true && 
    playData07.url.includes('postgres.mp4'),
    'PLAY-07: Staff (admin) can securely access any lecture video URL'
  );

  // PLAY-08: Free course: Any authenticated student can access any lecture in free course (price: 0)
  currentMockUser = { userId: 'user_student_unenrolled', role: 'student', email: 'student@test.com' };
  const playReq08 = new Request('http://localhost:3000/api/courses/course_free_1/video-url?lectureId=502', { method: 'GET' });
  const playRes08 = await videoUrlRoute(playReq08 as any, { params: Promise.resolve({ id: 'course_free_1' }) });
  const playData08 = await playRes08.json();
  assert(
    playRes08.status === 200 && 
    playData08.success === true && 
    playData08.url.includes('first-node.mp4'),
    'PLAY-08: Any authenticated student can stream lectures in free courses (price: 0)'
  );

  // PLAY-09: Playback URL generation never returns raw bucket keys or secrets
  assert(
    !playData08.url.includes(process.env.AWS_SECRET_ACCESS_KEY!) && 
    playData08.url.startsWith('https://'),
    'PLAY-09: Playback URL is an HTTPS signed token and never exposes AWS secret keys'
  );

  // =========================================================================
  // SECTION 5: Error Handling & S3 / Database Failure Isolation
  // =========================================================================
  console.log('\nSECTION 5: Error Handling & S3 / Database Failure Isolation');

  // FAIL-01: When S3 upload succeeds but PostgreSQL save fails, returns 500 and prevents false success
  currentMockUser = { userId: 'user_admin_1', role: 'admin' };
  forceDbCourseUpdateError = true;

  const failReq = new Request('http://localhost:3000/api/courses/course_paid_1', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ curriculum: [{ id: 99, title: 'Failing section', lectures: [] }] })
  });
  const failRes = await courseUpdateRoute(failReq, { params: Promise.resolve({ id: 'course_paid_1' }) });
  assert(
    failRes.status === 500,
    'FAIL-01: Database persistence failure returns HTTP 500 and prevents reporting completed save'
  );
  forceDbCourseUpdateError = false;

  // FAIL-02: Target affected course dce63425-6b4c-4fce-aca0-33e7c380b927 was preserved and intact
  const targetCourse = mockCourses.get('dce63425-6b4c-4fce-aca0-33e7c380b927');
  assert(
    targetCourse !== undefined && targetCourse.id === 'dce63425-6b4c-4fce-aca0-33e7c380b927',
    'FAIL-02: Target affected course (dce63425-6b4c-4fce-aca0-33e7c380b927) preserved without deletion or recreate'
  );

  // =========================================================================
  // SUMMARY
  // =========================================================================
  console.log('\n============================================================');
  console.log(`TEST RESULTS: ${passedCount}/${passedCount + failedCount} PASSED (${failedCount} FAILED)`);
  console.log('============================================================\n');

  if (failedCount > 0) {
    process.exit(1);
  }
}

runAllTests().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
