# GoLive Classes – Glassmorphism UI Redesign Plan

This document outlines the step-by-step phased approach to redesigning the GoLive Classes platform. The strict rule is: **Visuals only. Zero changes to business logic, routing, or state.**

---

### Phase 1: Global Foundation & CSS Tokens
**Goal:** Establish the root styling, background gradients, and reusable glass classes so we don't duplicate code.
- **`globals.css`**: Define the main body background (deep blue to soft teal/purple elegant gradient).
- **Glass Utilities**: Create global CSS classes (e.g., `.glass-panel`, `.glass-card`, `.glass-modal`, `.glass-input`) utilizing `backdrop-blur`, semi-transparent backgrounds (`bg-white/10` or `bg-slate-900/40`), and subtle borders.
- **Root Layouts**: Ensure `src/app/layout.tsx` and `LayoutWrapper.tsx` properly host the global background without breaking min-heights.

### Phase 2: Navigation & Shell
**Goal:** Make the persistent navigation elements feel premium and floating.
- **Public Navbar**: Update `PublicNavbar.tsx` to a sleek, frosted glass header.
- **Dashboard Sidebar**: Update `Sidebar.tsx` to act as a floating, semi-transparent panel with glowing active states for links.
- **Top Header**: Update `TopHeader.tsx` (search bar, profile dropdown) to match the glass aesthetic.

### Phase 3: The Public Face (Homepage & Auth)
**Goal:** Ensure the first impression is stunning and modern.
- **Homepage (`/`)**: 
  - Redesign the Hero section with dynamic text gradients and a glowing CTA button.
  - Convert Stats, Features, and Testimonials into floating `.glass-card` components.
- **Auth Pages (`/login`, `/register`, `/forgot-password`, `/reset-password`)**:
  - Center the forms over the beautiful gradient background.
  - Wrap the forms in a stunning `.glass-modal` with premium, highly legible inputs and buttons.

### Phase 4: Course Discovery
**Goal:** Make browsing courses visually engaging.
- **Course Cards**: Completely redesign the universal course card (used everywhere). Make it a glass card with smooth hover animations, subtle shadows, and crisp text.
- **Course Catalog (`/courses`)**: Restyle the grid and search/filter inputs.
- **Course Detail Page (`/courses/[id]`)**: 
  - Create a cinematic hero banner using the course thumbnail as a blurred background.
  - Use glass panels for the curriculum list, reviews, and the sticky purchase card.

### Phase 5: Student Experience (Dashboard & Player)
**Goal:** Keep the learning environment distraction-free but beautiful.
- **My Learning & Profile (`/my-learning`, `/profile`)**: Apply the glass layouts to user stats, purchase history, and progress bars.
- **Course Player (`/courses/[id]/play`)**: 
  - Adopt a "Dark Mode Glass" aesthetic for the player to reduce eye strain (dark blurred backgrounds, emerald accents for completed videos).
  - Restyle the Q&A, Notes, and Curriculum sidebar to match.

### Phase 6: Admin & Instructor Dashboards
**Goal:** Make data management look as good as the public site.
- **Tables & Forms**: Convert all data tables, inputs, and settings forms in the Instructor, Admin, and Superadmin panels into clean glass containers.
- **Analytics Cards**: Ensure revenue and student counts pop with elegant styling.

---
**Execution Strategy:** We will execute this exactly one phase at a time. After each phase, we will pause so you can view the live site and ensure no functionality is broken before moving on.
