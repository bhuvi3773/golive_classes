# GoLive Classes – Final Production Plan

**Database:** Keep current MongoDB  
**Keys Strategy:** Build everything first. Add Razorpay, AWS, and Email keys only at the very end when the application is 100% working.

This plan is written so a coding agent can follow it step-by-step without confusion.

---

## Phase 1: Critical Session & Auth Hardening

**Goal:** Fix session bug and complete authentication security.

### Tasks
1. Fix the `auth-token` cookie in the login route:
   - Add `maxAge: 60 * 60 * 24 * 7` (7 days)
   - Add `sameSite: 'lax'`
   - Keep `httpOnly: true` and `secure: process.env.NODE_ENV === 'production'`

2. Apply the exact same cookie settings to the Google OAuth login callback.

3. Verify that logout completely clears the cookie.

4. Make sure browser back button cannot access protected pages after logout.

5. Add rate limiting to these routes (login already has it):
   - Register
   - Forgot Password
   - Reset Password
   - Resend OTP

6. Confirm that blocked users cannot remain logged in.

**Done when:** Session behavior is correct and predictable.

---

## Phase 2: Fully Working Forgot Password

**Goal:** Add a complete and working Forgot Password feature.

### Tasks
1. On the Login page, make sure the “Forgot password?” link is visible and works.
2. Create / improve the Forgot Password page (`/forgot-password`).
3. When user enters email:
   - Generate a secure reset token
   - Save the token + expiry time in the user document
   - Send a password reset email (use existing email system)
4. Create / improve the Reset Password page (`/reset-password`).
5. User clicks the link in email → lands on reset page with token.
6. User enters new password → password is updated → token is cleared.
7. Add proper validation and error messages (invalid token, expired token, etc.).
8. Protect against token reuse.

**Done when:** A user can fully reset their password using email without any errors.

---

## Phase 3: Real Payment Gateway (Razorpay) – Fully Working

**Goal:** Build a complete working payment system.  
**Important:** Do not put real Razorpay keys yet. Use environment variables. Keys will be added at the end.

### Tasks
1. Finish the Create Order API (`/api/checkout/razorpay/create-order`).
2. Update the Checkout page and CheckoutForm so it opens the real Razorpay checkout.
3. Create Payment Verification API that:
   - Verifies the Razorpay signature
   - Only after successful verification adds the course to `user.purchasedCourses`
4. Update the “Buy Now” / “Enroll” button to go to the real checkout page.
5. Enforce ownership checks on:
   - Course Player
   - My Learning page
   - Progress tracking
   - Certificates
6. Implement Free First Lecture Preview:
   - First lecture is free for everyone
   - Any later lecture requires purchase → redirect to checkout if not owned

**Environment variables to prepare (keys will be added later):**
```env
NEXT_PUBLIC_RAZORPAY_KEY_ID=
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
```

**Done when:** The full payment flow works end-to-end (order → payment → access granted).

---

## Phase 4: Transactional Email System (Udemy-style)

**Goal:** Send automatic emails when important actions happen.  
**Important:** Do not put real SMTP / email keys yet. Use environment variables.

### Required Emails
1. User clicks “Enroll” or “Buy Now” → send confirmation / interest email.
2. User watches a free demo / first lecture → send follow-up email.
3. Successful course purchase → send purchase confirmation email.
4. Password reset email (already needed in Phase 2).
5. Welcome / registration verification email (already exists – keep it working).

### Tasks
1. Create clean reusable email functions for each type of email.
2. Trigger the correct email at the right moment in the code.
3. Make sure emails look professional (good subject + clean HTML body).
4. Handle email sending failures gracefully (do not crash the main flow).

**Environment variables to prepare (keys will be added later):**
```env
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
EMAIL_FROM=
```

**Done when:** All important user actions correctly trigger emails.

---

## Phase 5: Student Experience Features

### Tasks
1. Course Reviews & Ratings (1–5 stars + comments)
2. Purchase History & Invoices inside the Profile page
3. Q&A / Discussion Board inside the Course Player
4. Video Notes & Bookmarks (notes tied to video timestamps)

**Done when:** All four features work completely for students.

---

## Phase 6: Dashboard Completions

### Tasks
1. Instructor Revenue / Sales Analytics  
   - Show real earnings and number of sales

2. Super Admin Platform Settings  
   - Build the currently placeholder Platform Settings page

**Done when:** Both dashboards display real data.

---

## Phase 7: Production Polish

### Tasks
1. Remove all remaining mock / placeholder text
2. Add clean empty states on every list page
3. Improve error handling and user-friendly messages
4. Remove leftover `console.log` and internal TODO comments
5. Final mobile responsiveness check
6. Confirm Live Classes page shows real upcoming launches

**Done when:** The website looks and feels fully production-ready.

---

## Phase 8: AWS S3 Storage Setup (Last Phase)

**Goal:** Move videos and large media files to AWS S3.  
**Important:** Do not add real AWS keys yet. Build the complete integration using environment variables. Keys will be added at the end.

### What will be stored on S3
- Course videos
- Large media files
- Certificates / invoice PDFs (if generated)

### What stays on Cloudinary
- Profile images / avatars
- Course thumbnails

### Tasks
1. Install AWS SDK packages (`@aws-sdk/client-s3` and `@aws-sdk/s3-request-presigner`).
2. Create a clean S3 utility file (upload, get signed URL, delete).
3. Update the upload API so videos go to S3.
4. Generate signed URLs for private video playback.
5. Keep existing Cloudinary logic for images.
6. Test upload and playback thoroughly.

**Environment variables to prepare (keys will be added later):**
```env
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=
AWS_S3_BUCKET_NAME=
```

**Done when:** Videos are uploaded to S3 and can be played securely using signed URLs.

---

## Final Step (Only After Everything Above Works)

When the entire application is 100% working:

1. Add real Razorpay keys
2. Add real Email / SMTP keys
3. Add real AWS S3 keys
4. Create and link Terms & Conditions and Privacy Policy pages
5. Final live testing with real keys

---

## Strict Rules for the Coding Agent

- Follow the phases in exact order
- Never put real secret keys in the code
- Always use environment variables for Razorpay, Email, and AWS
- Test after every major feature
- Do not leave the application in a broken state
- Keep MongoDB as the database
- Build everything so the application works even before real keys are added (use placeholders or test mode where needed)

---

## Current Status (Already Done)

- Hardcoded credentials removed
- Public users cannot register as Instructor
- Upload endpoint is secured
- Middleware protects Super Admin
- JWT_SECRET is required
- Live Classes page uses real data
- Models for Reviews, Notes, Discussions, Launches exist

---

**End of Plan**
