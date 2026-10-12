# Project Changes for Recording & Testing

This document tracks all the modifications made to the project to facilitate testing, screen recording, and resolving runtime errors.

## 1. UI & Layout Adjustments
- **Logo Alignment:** Modified `src/app/page.tsx` to resize the logo and adjust the container padding/dimensions so it aligns neatly within the 80px header on both desktop and mobile devices.

## 2. Video Player Security Exceptions
*File: `src/components/SecureVideoPlayer.tsx`*

To allow you to properly screen record the video for your superiors without obstructions or restrictions, the following anti-piracy features were **disabled**:
- **Dynamic Watermark Removed:** Deleted the moving text overlay that normally tracks across the video.
- **Right-Click Enabled:** Removed the `onContextMenu={(e) => e.preventDefault()}` handler to allow native browser context menus.
- **Download/Fullscreen Restrictions Removed:** Removed the `controlsList="nodownload nofullscreen noremoteplayback"` attributes from the `<video>` element.
- **Keyboard Shortcuts Enabled:** Removed the `useEffect` block that was intercepting and blocking `Ctrl+S` (Save Page) and other inspection shortcuts.

## 3. Dummy Course Data Creation
- **Course Inserted:** Created a "Dummy Video Course for Testing" directly in the PostgreSQL database using a Prisma script (`scripts/add-dummy-course.ts`).
- **Video Link Updated:** Updated the test curriculum video link to a highly reliable w3schools MP4 (`https://www.w3schools.com/html/mov_bbb.mp4`) via a secondary script (`scripts/update-dummy-video.js`) to fix a browser `NotSupportedError`/CORS issue with the original sample video.

## 4. Runtime Bug Fixes (Database Schema Mismatches)
- **`_id` to `id` Migration:** The codebase had leftover MongoDB properties (`course._id`), but the current Prisma PostgreSQL schema uses `course.id`. This mismatch was causing a runtime `Cannot read properties of undefined (reading 'toString')` crash on the course player page.
- **Files Fixed Globally:** Ran a script to find and replace all instances of `._id` to `.id` across:
  - `src/components/CoursePlayerClient.tsx`
  - `src/components/CourseDiscussions.tsx`
  - `src/components/CourseNotes.tsx`
  - `src/components/CoursePurchaseCard.tsx`
  - `src/components/CourseReviews.tsx`
  - `src/lib/email.ts`

## 5. Server Component Crash Fix
- **Next.js Error Boundary Fix:** The course play page (`src/app/courses/[id]/play/page.tsx`) was throwing an `"Event handlers cannot be passed to Client Component props"` error. This happened because an `onClick` event handler was placed on a `<Link>` tag inside a Server Component. 
- **Resolution:** Removed the `onClick` block from the locked/unlocked curriculum sidebar links so the server could render the page correctly without crashing.

## 6. Administrative Access
- Recovered and verified the primary Admin credentials for testing access:
  - **Email:** `admin@example.com`
  - **Password:** `Admin123!`
