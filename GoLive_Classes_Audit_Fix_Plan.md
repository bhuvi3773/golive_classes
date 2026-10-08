# GoLive Classes - Audit Fix Plan

Based on the live site code audit, this is the comprehensive plan to address all missing LMS features and bugs (excluding the pending AWS S3 and Razorpay integrations).

## Phase 1: Public Accessibility & Navigation
1. **Public Course Catalog**:
   - Remove the `redirect('/login')` guard in `src/app/courses/page.tsx` and `src/app/courses/[id]/page.tsx` so unauthenticated users can browse.
   - Gracefully handle `user = null` for the recommendation section on the courses page (show popular courses instead of personalized).
2. **Sidebar Consistency**:
   - Fix `src/app/layout.tsx` to hide the left `<Sidebar />` on public pages (like Home and Courses) for unauthenticated users, replacing it with a clean Top Navbar layout.

## Phase 2: Core Feature Bugs & Gating
1. **Recommendations Infinite Loading**:
   - Fix `src/app/recommendations/page.tsx` which is still using legacy MongoDB syntax (`course._id` instead of `course.id`), causing the UI to break.
2. **Free First-Lecture Preview**:
   - Update `src/app/courses/[id]/play/page.tsx`. Currently, it blocks all unowned access. Allow access if the requested `lectureId` is the first lecture in the course, acting as a marketing preview.

## Phase 3: Student Experience & Compliance
1. **Purchase History / Invoices**:
   - Add a dedicated "Purchase History" tab or section inside `src/app/profile/page.tsx` to display real purchased courses and prices.
2. **Certificates Logic Verification**:
   - Ensure the certificates page strictly verifies that `progress.completedLectures === totalLectures` and the user owns the course before issuing a certificate.
3. **Legal Pages**:
   - Create `src/app/terms/page.tsx` and `src/app/privacy/page.tsx` with standard LMS legal text. Required for production checkout flows.

## Phase 4: Homepage & Content Polish
1. **Homepage Cleanup**:
   - Remove "pthon" placeholders in featured courses.
   - Adjust the marketing statistics to reflect realistic numbers for a fresh platform.
   - Update testimonials to include realistic dummy data or real data.
