# GoLive LMS - Pending Tasks & Placeholders
*To be built tomorrow or in future sessions.*

## Student Experience
- [ ] **Purchase History & Invoices:** Build a billing history page inside `/profile` so students can view and download receipts.
- [ ] **Course Reviews & Ratings:** Build a review system (1-5 stars + comments) on the Course Player and display them on the Course Details page.
- [ ] **Q&A Discussion Board:** Add a Q&A tab inside the Course Player where students can ask questions and teachers can reply.
- [ ] **Video Notes & Bookmarks:** Allow students to save personal text notes at specific video timestamps.
- [ ] **Payment Integration:** Implement actual Stripe/Razorpay payment gateways instead of the current dummy "Buy Now" flow.

## Super Admin Dashboard
- [ ] **Platform Settings:** Build out the placeholder "Platform Settings" link in the HQ Dashboard (e.g., site-wide configs, commission rates).

## Teacher Dashboard
- [ ] **Instructor Revenue/Sales:** Show actual earnings, payouts, and sales analytics in the Teacher Dashboard.

## Environment Variables Needed
- [ ] Add the following Razorpay keys to `.env.local` to enable checkout:
  ```env
  NEXT_PUBLIC_RAZORPAY_KEY_ID="your_razorpay_key_id"
  RAZORPAY_KEY_ID="your_razorpay_key_id"
  RAZORPAY_KEY_SECRET="your_razorpay_key_secret"
  ```
