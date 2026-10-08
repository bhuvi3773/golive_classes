# GoLive Classes – Clean Migration Plan to Render (PostgreSQL)

**Goal:** Replace MongoDB with PostgreSQL (hosted on Render) in a clean, safe, and error-free way.  
No rushing. No breaking the current working application.

---

## Important Rules for the Coding Agent

1. Never delete or break the existing MongoDB code until the new PostgreSQL version is fully working and tested.
2. Create the new database layer cleanly (prefer Prisma + PostgreSQL).
3. Keep the application running on MongoDB while building the PostgreSQL version side-by-side if needed.
4. Do not mix Mongoose and Prisma in the same file.
5. Every change must be tested before moving to the next step.
6. No partial migrations that leave the app in a broken state.
7. Always create proper TypeScript types.
8. Use environment variables correctly. Never hardcode keys.

---

## Recommended Technology Choice

- **Database:** PostgreSQL (hosted on Render)
- **ORM:** Prisma (cleanest and safest for Next.js)
- **Auth:** Keep the current custom JWT auth
- **File Storage:** 
  - Videos & large media → AWS S3 (later phase)
  - Profile images & thumbnails → Cloudinary (current)

---

## Phase 0: Preparation (Do This First)

1. Create a PostgreSQL database on Render at https://render.com
2. Save this value securely (do not commit it):
   - External Database connection string (URI)
3. Create a full backup of the current MongoDB database.
4. Confirm current application is working and committed on GitHub.

**Required from you before starting code changes:**
- Render External Database connection string URL (starting with `postgresql://...`)

---

## Phase 1: Setup Prisma + PostgreSQL (No Business Logic Change Yet)

1. Install required packages:
   ```bash
   npm install prisma @prisma/client
   npm install -D prisma
   ```
2. Initialize Prisma:
   ```bash
   npx prisma init
   ```
3. Configure `prisma/schema.prisma` with the Render connection string.
4. Create the first clean schema that matches current data needs (User, Course, Progress, etc.).
5. Run `npx prisma db push` or create migrations.
6. Generate Prisma Client.
7. Create a clean database client file (example: `src/lib/prisma.ts`).

**Done when:** Prisma connects successfully to the Render database and basic models are created. Current MongoDB app still works normally.

---

## Phase 2: Create Clean Database Schema

Design proper PostgreSQL tables for:

- User
- Course
- Category
- Progress
- Review
- Discussion / Q&A
- VideoNote
- UpcomingLaunch
- PlatformSetting
- Purchase / Payment records (important)

Rules:
- Use proper relations (foreign keys)
- Use UUIDs or auto-increment IDs consistently
- Add createdAt / updatedAt timestamps
- Add necessary indexes (email, courseId, userId, etc.)
- Keep the schema clean and normalized

**Done when:** Full schema is defined in Prisma and pushed to PostgreSQL.

---

## Phase 3: Build New Data Access Layer

Create clean repository/service functions using Prisma for:

- Auth related queries (find user by email, create user, update last login, etc.)
- Course CRUD
- Progress tracking
- Wishlist
- Reviews
- Discussions
- Notes
- Launches
- Purchases

Do **not** replace the old Mongoose code yet. Build the new functions in parallel (new files).

**Done when:** All major database operations have clean Prisma versions and are unit-tested or manually verified.

---

## Phase 4: Switch API Routes One by One (Safest Way)

Migrate in this strict order:

1. Auth routes (register, login, me, logout, password reset)
2. User profile routes
3. Courses (read first, then write)
4. Progress
5. Wishlist
6. Reviews
7. Discussions
8. Notes
9. Admin / Super Admin routes
10. Checkout & Purchase recording

After each route group:
- Test thoroughly
- Confirm no crashes
- Confirm data is correctly written to PostgreSQL
- Confirm the deployment to Vercel/Render works

Only after a route works 100% on PostgreSQL, remove the old Mongoose code for that route.

**Done when:** All API routes use Prisma + PostgreSQL and MongoDB code is fully removed.

---

## Phase 5: Data Migration (Existing Data)

1. Write a one-time migration script that reads from MongoDB and inserts into PostgreSQL.
2. Migrate in this order:
   - Users
   - Categories
   - Courses
   - Progress
   - Reviews, Notes, Discussions
   - Purchases / Wishlist
3. Verify counts and critical relationships after migration.
4. Keep the MongoDB backup safe.

**Done when:** All existing data is correctly present in PostgreSQL and verified.

---

## Phase 6: Final Cleanup & Testing

1. Remove all Mongoose models and `mongoose` dependency.
2. Remove old MongoDB connection file.
3. Update environment variables (remove `MONGODB_URI`).
4. Full regression testing:
   - Register / Login / Logout
   - Course browsing & details
   - Free preview + Purchase flow
   - My Learning
   - Progress tracking
   - Admin & Super Admin panels
   - Live Classes / Upcoming launches
5. Fix any remaining TypeScript or runtime errors.
6. Confirm the application runs cleanly with only PostgreSQL.

**Done when:** Application runs completely on PostgreSQL with zero MongoDB code left and no crashes.

---

## Later Phases (After PostgreSQL Migration is Stable)

These remain the same as the previous plan and should only start after PostgreSQL migration is 100% complete:

- Complete real Razorpay payment integration
- Student features (if any still pending)
- Dashboard analytics
- Production polish
- AWS S3 for videos (last)

---

## Environment Variables (Final Set for Render/PostgreSQL)

```env
# PostgreSQL
DATABASE_URL="postgresql://..."          # from Render (External Database URL)

# Keep existing ones
JWT_SECRET=...
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```

---

## Success Criteria (Must All Pass)

- No MongoDB or Mongoose code remains
- Application starts without errors
- All major user flows work
- Data is correctly saved and read from PostgreSQL
- No runtime crashes related to database
- TypeScript compiles cleanly

---

## Current Status

- Project currently uses MongoDB + Mongoose
- User has decided to move fully to PostgreSQL hosted on Render
- Migration must be clean and safe
- Coding agent must follow the phases in order and test after every major step

---

**End of Plan**
