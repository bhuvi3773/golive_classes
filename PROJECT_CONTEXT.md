# GoLiveClasses — Durable Project Context & Handover

## 1. Project Purpose & Architecture

**GoLiveClasses** is a full-stack Learning Management System (LMS) designed for course delivery, student progress tracking, live session announcements, assessments, certificate issuance, and comprehensive administrative oversight.

### Architecture Overview
* **Framework**: Next.js 16.3.8 (App Router, Turbopack enabled `next dev --turbo`)
* **Core Libraries**: React 19.2.8, React DOM 19.2.8, TypeScript 5
* **Styling**: Tailwind CSS v4 (`tailwindcss ^4`, `@tailwindcss/postcss ^4`), Vanilla CSS utilities
* **Database & ORM**: PostgreSQL managed via Prisma ORM 5.22.0 (`@prisma/client`, `prisma`)
* **Architecture Pattern**: Layered App Router pattern:
  * UI Layer (`src/app/**/page.tsx`, `src/components/**`)
  * API / Service Layer (`src/app/api/**/route.ts`)
  * Repository Data-Access Layer (`src/lib/repositories/**.repository.ts`)
  * Database Client (`src/lib/prisma.ts`)

---

## 2. Repository Structure & Key Locations

```text
├── .agents/
│   └── skills/                   # 9 workspace agent skills (ui-ux-pro-max, banner-design, brand, etc.)
├── prisma/
│   └── schema.prisma             # Primary PostgreSQL schema (10 models)
├── public/                       # Static public assets, logos, and icons
├── scripts/
│   ├── add-dummy-course.ts       # Test course seeding utility
│   ├── check-users.ts            # User status inspection utility
│   ├── seed-admin.ts             # Superadmin account provisioning utility
│   └── update-dummy-video.js     # Video link update utility for browser testing
├── src/
│   ├── app/                      # App router: pages and route handlers
│   │   ├── admin/                # Course creation, curriculum management, categories, launches
│   │   ├── analytics/            # Student and instructor analytics
│   │   ├── api/                  # 30+ REST endpoints for auth, courses, progress, checkout, etc.
│   │   ├── certificates/         # Certificate views and course completion verification
│   │   ├── checkout/             # Razorpay order checkout UI
│   │   ├── courses/              # Course catalog, details, and video player (/play)
│   │   ├── my-learning/          # Enrolled course dashboard and progress tracking
│   │   ├── profile/              # Student/instructor profile editing
│   │   ├── superadmin/           # User blocking/role control and platform settings
│   │   ├── wishlist/             # Saved course management
│   │   ├── layout.tsx            # Global RootLayout with Inter font
│   │   └── page.tsx              # Homepage
│   ├── components/               # Shared client and server components
│   │   ├── admin/                # QuizBuilder, AssignmentBuilder
│   │   ├── CoursePlayerClient.tsx# Video curriculum player with active lecture switching
│   │   ├── SecureVideoPlayer.tsx # Custom HTML5 video player
│   │   ├── Sidebar.tsx           # Collapsible application navigation bar
│   │   └── TopHeader.tsx         # User status, search bar, profile quick-access
│   ├── lib/
│   │   ├── repositories/         # 7 data repository abstractions
│   │   ├── auth.ts               # JWT verification & blocked user revocation check
│   │   ├── cloudinary.ts         # Cloudinary asset uploader
│   │   ├── email.ts              # Nodemailer SMTP email service
│   │   ├── prisma.ts             # Prisma client singleton
│   │   ├── rateLimit.ts          # In-memory IP rate limiter for auth endpoints
│   │   └── s3.ts                 # AWS SDK v3 S3 client for video storage
│   └── middleware.ts             # Route guard for auth tokens and protected routes
├── tests/
│   ├── api/                      # Playwright API tests (auth, courses)
│   ├── global-setup.ts           # E2E test setup
│   └── ui.spec.ts                # Navigation and smoke tests
├── package.json
└── playwright.e2e.config.ts      # Test database protection & isolation config
```

---

## 3. Routes & Major Features

### Public Pages
* `/` (`src/app/page.tsx`): Homepage and value proposition.
* `/courses` (`src/app/courses/page.tsx`): Course catalog with search, category filtering, and sorting.
* `/courses/[id]` (`src/app/courses/[id]/page.tsx`): Course details, syllabus breakdown, instructor information, reviews, and enrollment/buy CTA.
* `/live-classes` (`src/app/live-classes/page.tsx`): Upcoming webinars and scheduled live sessions.
* `/privacy` (`src/app/privacy/page.tsx`): Privacy policy (untracked).
* `/terms` (`src/app/terms/page.tsx`): Terms of service (untracked).

### Authentication & Account Recovery
* `/login` (`src/app/login/page.tsx`): Email/password and Google OAuth login.
* `/register` (`src/app/register/page.tsx`): Account registration with verification trigger.
* `/verify-email` (`src/app/verify-email/page.tsx`): 6-digit OTP verification code entry.
* `/forgot-password` (`src/app/forgot-password/page.tsx`): Password reset request form.
* `/reset-password` (`src/app/reset-password/page.tsx`): Token-based password reset form.
* `/profile-setup` (`src/app/profile-setup/page.tsx`): Post-registration onboarding and interest setup.

### Student Learning Area (Protected)
* `/my-learning` (`src/app/my-learning/page.tsx`): Dashboard showing enrolled courses, completion percentage, and last accessed lectures.
* `/courses/[id]/play` (`src/app/courses/[id]/play/page.tsx`): Immersive course video player, lecture list, inline quizzes, assignments, discussions, and personal notes.
* `/certificates` (`src/app/certificates/page.tsx`): Student certificates listing.
* `/certificates/[courseId]` (`src/app/certificates/[courseId]/page.tsx`): Formal certificate view with completion credentials and student name.
* `/wishlist` (`src/app/wishlist/page.tsx`): Saved courses with quick checkout or removal.
* `/profile` (`src/app/profile/page.tsx`): Profile settings, avatar upload, and headline/bio editor.
* `/checkout/[id]` (`src/app/checkout/[id]/page.tsx`): Course checkout with Razorpay payment modal.
* `/analytics` (`src/app/analytics/page.tsx`): Learning metrics for students, revenue metrics for instructors.

### Instructor / Admin Area (`role: admin` or `superadmin`)
* `/admin` (`src/app/admin/page.tsx`): Admin overview, revenue metrics, top-selling courses.
* `/admin/courses` (`src/app/admin/courses/page.tsx`): Course catalog management table.
* `/admin/courses/new` (`src/app/admin/courses/new/page.tsx`): Course builder (details, price, category, goals, requirements).
* `/admin/courses/[id]/manage` (`src/app/admin/courses/[id]/manage/page.tsx`): Section and lecture builder, video file uploader, quizzes, and assignments.
* `/admin/categories` (`src/app/admin/categories/page.tsx`): Category creation and management.
* `/admin/launches` (`src/app/admin/launches/page.tsx`): Upcoming live class and webinar scheduling.

### Superadmin Area (`role: superadmin`)
* `/superadmin` (`src/app/superadmin/page.tsx`): System-wide analytics, user count, published course count, gross revenue.
* `/superadmin/users` (`src/app/superadmin/users/page.tsx`): User list, search, role management, and instant account blocking/unblocking.
* `/superadmin/settings` (`src/app/superadmin/settings/page.tsx`): Platform commission rate, site name, contact email, and instructor self-registration toggle.

---

## 4. Authentication, Authorization & Roles

### Mechanism
* **Session Management**: Custom JSON Web Token (JWT) signed with `JWT_SECRET` and stored in an HTTP-only cookie named `auth-token`.
* **Token Lifetime**: 7 days (`maxAge: 7 * 24 * 60 * 60`).
* **Route Protection via Edge Middleware** (`src/middleware.ts`):
  * Guarded routes: `/my-learning`, `/profile`, `/profile-setup`, `/admin`, `/superadmin`.
  * Redirects unauthenticated requests to `/login` with strict `Cache-Control: no-store` headers to avoid browser cache leakage.
  * Redirects authenticated users accessing `/login` or `/register` to `/`.
* **Server-Side Authorization** (`src/lib/auth.ts`):
  * `getUserFromCookie()` decodes the JWT and queries `UserRepository.findById()`.
  * **Immediate Revocation**: If a user is marked `isBlocked: true` in PostgreSQL, `getUserFromCookie()` immediately returns `null`, even if the JWT has not expired.
* **Role Hierarchy**:
  * `student`: Default role. Can enroll, purchase, view lectures, save notes, take quizzes, post discussions, and earn certificates.
  * `admin`: Instructor/Course creator. Can manage courses, sections, lectures, categories, and launches.
  * `superadmin`: Platform operator. Can manage all courses, platform settings, commission rates, and block/delete user accounts.

---

## 5. Database Schema & Repositories

### Prisma Models (`prisma/schema.prisma`)
1. **User**: `id`, `name`, `email`, `password`, `role`, `purchasedCourses` (M:N Course), `wishlist` (M:N Course), `viewedCategories`, `avatar`, `phone`, `headline`, `bio`, `github`, `linkedin`, `isVerified`, `verificationCode`, `isBlocked`, `authProvider`, `googleId`.
2. **Course**: `id`, `title`, `description`, `category`, `price`, `thumbnail`, `status` (`draft` | `published`), `curriculum` (JSON array of sections and lectures), `goals`, `requirements`, `targetAudience`.
3. **Category**: `id`, `name`, `description`.
4. **Progress**: Composite unique on `(userId, courseId)`, `completedLectures` (Int array), `lastAccessedLecture`, `completedAt`.
5. **Review**: Composite unique on `(courseId, userId)`, `rating` (1-5), `comment`.
6. **Discussion**: `courseId`, `lectureId`, `userId`, `title`, `text`.
7. **DiscussionReply**: `discussionId` (onDelete: Cascade), `userId`, `text`.
8. **UpcomingLaunch**: `title`, `description`, `launchDate`, `category`, `type`, `status`, `instructorName`.
9. **VideoNote**: `courseId`, `lectureId`, `userId`, `timestamp`, `text`.
10. **PlatformSetting**: Singleton record for `commissionRate`, `allowInstructorRegistration`, `siteName`, `contactEmail`.

### Data Access Repositories (`src/lib/repositories/`)
* `user.repository.ts`: User lookup, creation, wishlist management, and profile updates.
* `course.repository.ts`: Course querying, filtering, creation, updating, and purchase association.
* `progress.repository.ts`: Progress tracking, lecture completion toggles, and completion timestamping.
* `review.repository.ts`: Course ratings and reviews creation/lookup.
* `discussion.repository.ts`: Forum thread creation, lecture-specific querying, and replies.
* `note.repository.ts`: Video timestamped notes.
* `launch.repository.ts`: Live session launches and scheduling.

---

## 6. External Integrations & Verified Status

| Service | Configuration Variable Names | Code Integration Point | Verified Status |
| :--- | :--- | :--- | :--- |
| **PostgreSQL** | `DATABASE_URL` | `src/lib/prisma.ts` | **Active / Functional** (Required for all data persistence) |
| **AWS S3** | `AWS_REGION`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_S3_BUCKET_NAME` | `src/lib/s3.ts`, `src/app/api/upload/route.ts` | **Implemented** (Target for large video files `>50MB`) |
| **Cloudinary** | `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` | `src/lib/cloudinary.ts`, `src/app/api/upload/route.ts` | **Implemented** (Target for thumbnails and avatars) |
| **Razorpay** | `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `NEXT_PUBLIC_RAZORPAY_KEY_ID` | `src/app/api/checkout/razorpay/**` | **Implemented** (Creates orders, validates HMAC SHA-256 signatures) |
| **Google OAuth** | `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `NEXT_PUBLIC_APP_URL` | `src/app/api/auth/google/**` | **Implemented** (Redirects and exchanges tokens via Google Auth Library) |
| **Nodemailer SMTP** | `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `EMAIL_FROM` | `src/lib/email.ts` | **Implemented with Fallback** (Logs to console if credentials are unconfigured or placeholder) |

---

## 7. Existing Tests & Build Commands

* **TypeScript Compilation**: `npx tsc --noEmit` — **Passing** with 0 errors.
* **ESLint**: `npm run lint` — Runs `eslint`. Currently reports 125 issues (29 errors, 96 warnings) primarily relating to React 19 / Next.js 16 conventions (`set-state-in-effect`, unescaped entities, `<img>` usage).
* **End-to-End Suite**: `npm run test:e2e` (`playwright.e2e.config.ts`):
  * Safe test isolation: Requires a dedicated `.env.test` file.
  * Aborts automatically if `.env.test` is missing or shares connection strings with production/development databases to prevent data corruption.
* **Build Command**: `npm run build` (`prisma generate && next build`).

---

## 8. Current Git State & Working-Tree Risks

### Branch Information
* **Current Branch**: `recovery/stable-pre-redesign`
* **Recent Commits**:
  * `054c5b4`: `test: add UI navigation tests and update playwright config`
  * `8e3ec4a`: `chore: ignore generated testing artifacts`
  * `cac9237`: `style: Batch 1 - Design tokens and layout shell`
  * `0971570`: `fix: resolve TS null check in play page` (Last known stable baseline reference)
  * `e56f192`: `feat: complete production polish and AWS S3 integration`

### Working Tree Dirty State
There are **46 modified/deleted files** and **17 untracked files/directories**:
1. **Critical Modified Code at Risk of Accidental Discard**:
   * `src/components/SecureVideoPlayer.tsx`: Anti-piracy modifications (watermark and right-click block removed for testing/recording).
   * `src/lib/email.ts` & `src/lib/repositories/progress.repository.ts`: Fixes replacing legacy MongoDB `._id` with Prisma `.id`.
   * Modified pages across `src/app/**`: Part of a prior design pass applying dark mesh/glassmorphic styling.
2. **Untracked Critical Files**:
   * `playwright.e2e.config.ts`, `tests/global-setup.ts`: Safe E2E testing framework.
   * `scripts/add-dummy-course.ts`, `scripts/update-dummy-video.js`: Course and video test setup.
   * `src/app/privacy/page.tsx`, `src/app/terms/page.tsx`: Legal compliance pages.
   * `.agents/skills/*`: Installed agent skills including `ui-ux-pro-max`.

---

## 9. Approved Design Direction

### Visual Identity: Warm Editorial Academy — “Every Skill Has a Journey”
* **Palette**:
  * Warm ivory: `#F8F4EC` (Primary background and canvas)
  * Forest green: `#24483C` (Primary brand, editorial headers, deep accents)
  * Terracotta: `#C96F4A` (Accent, key interactive elements, badges)
  * Sand: `#E9DFCC` (Secondary surfaces, cards, subtle borders)
  * Soft sage: `#DCE6D8` (Muted highlights, success indicators, tags)
* **Design Principles**:
  * Editorial and welcoming aesthetic rather than generic dark SaaS templates.
  * Clear typographic hierarchy and structured whitespace.
  * Homepage structured as a progressive learning journey: Introduction → Discover Interests → Choose a Path → Curated Courses → Practical Outcomes → Next Steps.
  * Distinct, purpose-driven page layouts (avoiding uniform card grids across every view).
  * Respect `prefers-reduced-motion` and ensure minimum 4.5:1 text contrast.
  * Verified WCAG non-text contrast (3:1 minimum for interactive controls and focus indicators).

---

## 10. Mandatory Safety Constraints & Approval Workflow

1. **Read-Only / Approval-First Rule**: No application source code modifications or visual alterations will take place without explicit approval of specific batches.
2. **Data & Migration Safety**: Never execute database wipe scripts, push destructive migrations, or run destructive Git commands (`git reset --hard`, `git clean -fd`).
3. **Preservation of Functionality**:
   * All API contracts and query parameters must remain intact.
   * Authentication checks and route protection in `src/middleware.ts` must never be weakened.
   * Direct enrollment, Razorpay checkout, S3 uploads, and video playback must continue functioning seamlessly.
4. **Batch Execution Order**:
   * **Phase A**: Read-Only Audit & Handover (`PROJECT_CONTEXT.md`) — **Current Stage**.
   * **Phase B**: Design System Specification & Token Mapping.
   * **Phase C**: Plan Review & User Approval.
   * **Phase D**: Incremental Implementation (Batch 1: Design Tokens & CSS; Batch 2: Homepage; Batch 3: Public Catalog; Batch 4: Auth; Batch 5: Student Learning & Player; Batch 6: Admin/Superadmin).
   * **Phase E**: Regression Testing & Quality Verification.
