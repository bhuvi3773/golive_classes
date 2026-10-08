# Remaining LMS Implementation Plan

Based on a cross-check of your audit report prompt against the actual live codebase, here is the detailed plan of exactly what is **still missing** (excluding AWS S3 and Razorpay integrations). 

*(Note: The audit mentioned the session cookie missing `maxAge` and the free preview gating being incomplete—I verified the codebase and both of these are actually **already fixed and working properly!** The dummy course titles like "pthon" are also coming from your database, not the code).*

### 1. Fix Public Access & Layout (Highest Priority)
- **Public Course Catalog**: Remove the hardcoded `redirect('/login')` guard inside `src/app/courses/page.tsx`. Currently, anyone clicking "Courses" gets kicked to the login screen.
- **Sidebar Consistency**: Update `src/app/layout.tsx` to completely hide the left `<Sidebar />` on public routes (Home, Courses, Live) if the user is unauthenticated.

### 2. Fix Recommendations Infinite Loading Bug
- **MongoDB vs Prisma Syntax**: The `src/app/recommendations/page.tsx` is still using legacy MongoDB syntax (`course._id` instead of `course.id`). When React tries to map `course._id` as a key, it fails silently and spins infinitely. This needs to be updated to Prisma syntax.

### 3. Homepage Content Polish
- **Marketing Stats**: The stats section (50K+ Students, 95% Placement) is hardcoded. We need to either make these dynamic or change them to more realistic "new platform" metrics to build trust without looking fake.
- **Testimonials**: The testimonials section is looping over an array `[1, 2, 3]` and rendering the exact same copy-pasted text. We need to insert 3 distinct, high-quality, realistic testimonials.

### 4. Missing Student Features
- **Purchase History & Invoices**: The `src/app/profile/page.tsx` is missing a dedicated "Purchase History" section showing the student's past orders and amounts paid.
- **Legal Pages**: The LMS completely lacks a Terms & Conditions (`/terms`) and Privacy Policy (`/privacy`) page, which are strictly required by Razorpay before they approve the final production payment gateway.
