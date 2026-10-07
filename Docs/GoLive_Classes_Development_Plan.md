# GoLive Classes – Development Plan

**Status**: Storage work is paused.  
Keep the current storage solution (local uploads + MongoDB) for now.  
Improve video storage and image storage later after the core website is stable and functional.

This plan covers every remaining task from the audit and the new requirements.  
No storage migration is included in the phases below.

---

## Phase 1: Critical Security Fixes (Must Do First)

These issues put the platform and users at risk. Complete this phase before adding new features.

### Tasks
1. Remove all hardcoded credentials from the repository
   - Delete or empty `ADMIN_CREDENTIALS.md`
   - Remove MongoDB connection strings and passwords from all files inside the `scratch/` folder
   - Add `scratch/` to `.gitignore` if it still contains sensitive scripts

2. Fix open instructor registration
   - Do not allow public users to select “Instructor” role during signup
   - Only Super Admin should be able to promote a user to Teacher/Admin

3. Secure the file upload endpoint (`/api/upload`)
   - Add authentication check
   - Restrict upload to logged-in Teachers and Super Admins only
   - Add basic file type and size validation

4. Fix JWT secret handling
   - Remove the fallback `'fallback-secret'`
   - Ensure `JWT_SECRET` is always set in environment variables
   - Fail securely if the secret is missing

5. Protect Super Admin routes
   - Add `/superadmin` paths to the middleware matcher
   - Keep the existing role check inside the layout

6. Add basic rate limiting (at least on login, register, and password reset)

7. Clean up the repository
   - Remove or secure any remaining temporary scripts that contain secrets

**Done when**: No credentials are visible in the public repo and sensitive endpoints require proper authentication.

---

## Phase 2: Core Functionality Fixes

Make the existing features actually work correctly.

### Tasks
1. Fix purchase detection
   - Remove the hardcoded `http://localhost:3000` fetch in the course detail page
   - Correctly check whether the current user has the course in `purchasedCourses`

2. Implement real enrollment after payment
   - Integrate a payment gateway (Razorpay recommended for India, or Stripe)
   - On successful payment, add the course ID to the user’s `purchasedCourses` array
   - Update the “Buy Now” button so it triggers the real payment flow

3. Fix My Learning page
   - Show only courses the user has actually purchased
   - Remove the current “pretend” logic that shows the first two published courses

4. Protect progress tracking
   - Only allow marking lectures complete if the user owns the course

5. Make course ownership consistent across:
   - Course detail page
   - Course player
   - Certificates page
   - My Learning page

**Done when**: A user can buy a course, see it in My Learning, and access the full content only after purchase.

---

## Phase 3: Free Preview + Payment Gate Feature

### Requirement
Users can watch the **first lecture** of any course for free.  
When they try to watch any later lecture, they are redirected to the payment gateway.

### Tasks
1. Update the course player logic
   - Allow playback of the first lecture (index 0) without purchase
   - For any lecture after the first one, check ownership
   - If not owned → redirect to checkout / payment page

2. Update the course detail page
   - Clearly show that the first lecture is free to preview
   - Keep “Buy Now” / “Enroll” visible

3. Ensure video URLs for non-preview lectures are not easily accessible without ownership (basic protection)

**Done when**: Anyone can watch the first video. Moving to the second video forces payment.

---

## Phase 4: Live Classes / Upcoming Updates Page

### Requirement
The Live Classes page must show real information about upcoming course launches (this week and this month).  
It must not be a page of hardcoded placeholders.

### Tasks
1. Create a data model for Upcoming Launches / Announcements
   - Fields such as: title, description, launch date, category, type (course launch / live session), status

2. Add Super Admin (or Teacher) ability to create and manage these announcements

3. Rebuild the `/live-classes` page
   - Fetch real data from the database
   - Show sections for:
     - Courses launching this week
     - Courses launching this month
     - Upcoming live sessions (if any)
   - Remove all hardcoded fake data and static dates

4. Add a simple empty state when there are no upcoming launches

**Done when**: The page displays real, editable upcoming course launches instead of placeholder content.

---

## Phase 5: Standard E-Learning Features

Implement the most important missing features that users expect from a proper e-learning platform.

### Priority Order
1. Course reviews and ratings (1–5 stars + comments)
2. Working certificates (generate only after real completion)
3. Q&A / discussion section inside the course player
4. Student notes or bookmarks on videos
5. Purchase history and basic invoices inside the user profile
6. Instructor earnings / sales overview (basic version)
7. Better search and category filtering on the courses page
8. Email notifications for important events (enrollment, password reset already partially exists)

**Done when**: The core student and instructor experience matches standard expectations of platforms like Udemy.

---

## Phase 6: Polish & Quality Improvements

1. Fix UI inconsistencies between the marketing homepage and the logged-in experience
2. Replace all placeholder course data (titles like “pthon”, dummy descriptions, missing images)
3. Improve mobile responsiveness of the course player and admin dashboards
4. Add proper loading and error states across key pages
5. Clean up unused or incomplete admin links

---

## Explicit Note on Storage

- **Do not work on video storage or image storage in the current phases.**
- Keep using the existing local upload system and MongoDB for now.
- Storage improvements (moving videos to a proper streaming service and images to object storage) will be handled in a later phase after the website is functionally stable.

---

## Recommended Order of Work

1. Phase 1 – Security  
2. Phase 2 – Core Functionality  
3. Phase 3 – Free Preview + Payment Gate  
4. Phase 4 – Live Classes / Upcoming Launches page  
5. Phase 5 – Standard Features  
6. Phase 6 – Polish  

This order fixes the biggest risks first, then makes the product usable, then adds the conversion feature and the new Live page requirement.

---

**End of Plan**
