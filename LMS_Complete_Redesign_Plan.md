# LMS Website Redesign — Complete Project Plan

## 1. Objective

Redesign the entire existing Next.js Learning Management System (LMS), including public pages, authentication pages, student pages, admin pages, and super admin pages.

**Chosen visual direction:** Mesh Gradients + Frosted UI + Clean Cards.

The finished website should feel professional, consistent, visually excellent, easy to navigate, and carefully aligned. Every page should have clear content groups, readable typography, consistent spacing, responsive layouts, and a unified design system.

The current website has been recovered and is working again. Protect that working state above all else.

---

## 2. Non-Negotiable Rules

### Absolutely no deployment

- **NEVER deploy, publish, release, or trigger a deployment.**
- **NEVER push code to GitHub.**
- **NEVER merge branches or modify `main`.**
- **NEVER modify the live website or production configuration.**
- Do not execute commands or actions that could trigger deployment workflows.
- Keep all redesign work local on a dedicated redesign branch.
- If an action might affect production or trigger a deployment, stop and ask for explicit approval.

### Preserve the working application

- Do not rewrite the application from scratch.
- Do not replace the existing architecture with another framework.
- Do not change existing URLs, API contracts, database schemas, authentication providers, role permissions, or business logic merely to achieve a visual effect.
- Do not remove existing pages or features.
- Do not modify environment variables or OAuth settings without approval.
- Do not delete or overwrite `.env` files, untracked files, ignored files, local databases, uploads, credentials, certificates, or important configuration.
- Do not run destructive Git commands or discard uncommitted work without first inspecting the impact and obtaining approval.
- Do not install new dependencies, introduce a CSS framework, or make unrelated refactors without explaining the reason and obtaining approval.
- Do not weaken authentication, authorization, email verification, or security checks to make tests pass.
- Do not claim a feature works unless the relevant test was actually performed.

If a requested visual change risks breaking functionality, stop, explain the risk, and request approval.

---

## 3. Phase 0 — Inspect and Protect the Project

Before editing any code:

1. Confirm the correct repository and project directory.
2. Inspect the current Git branch, `git status`, and recent commits.
3. Verify the recovered working commit and identify the existing recovery branch.
4. Inspect package scripts, Next.js version, routing structure, styling system, and dependencies.
5. Identify shared layouts, components, middleware, API routes, authentication, database access, and role checks.
6. Inspect existing automated tests and record the baseline build/test results.
7. Capture baseline screenshots of important pages when practical.
8. Identify local environment files, ignored files, untracked files, local data, and configuration that must be preserved.
9. Confirm a safe recovery point and create a dedicated redesign branch only after verifying that the process will preserve current work.

Use read-only inspection first, for example:

```bash
git status --short --branch
git log -20 --oneline
npm run
```

Inspect remotes if needed, but redact any credentials embedded in remote URLs before sharing output.

Do not blindly run `git reset --hard`, `git clean`, `git stash`, `git checkout`, or other potentially destructive commands. Explain their consequences and obtain approval before any risky operation.

**Approval gate:** Do not change code until the inspection and protection report is presented and approved.

---

## 4. Phase 1 — Complete Route and Feature Inventory

Inspect the actual repository and list every existing route, page, layout, and important component. Do not invent pages or omit existing routes.

Group routes by purpose, based on what actually exists:

- Public pages
- Login, registration, verification, and authentication-related pages
- Student dashboard and learning pages
- Course catalogue and course detail pages
- Admin dashboard and management pages
- Super admin dashboard and platform-management pages
- User profiles and settings
- Legal pages
- Other existing forms, detail pages, reports, and secondary routes

For every page, record:

- Route and purpose
- Current layout and visual issues
- Shared components used
- Important interactions
- Data-fetching and API dependencies
- Authentication and role requirements
- Existing tests and how the page will be verified

Identify high-risk shared components whose changes could affect multiple routes, including root layouts, navigation, middleware, authentication components, and shared data-access code.

**Approval gate:** Present the complete page inventory and risk assessment before implementation.

---

## 5. Phase 2 — Define the Design System

Write a design specification before redesigning individual pages.

### Visual direction

Use **Mesh Gradients + Frosted UI + Clean Cards**.

- Use subtle mesh gradients in selected backgrounds and hero sections.
- Use frosted/translucent surfaces selectively, such as a navigation panel or hero panel.
- Make clean, clearly defined cards the foundation of the interface.
- Use restrained blue, violet, and cyan accents with neutral backgrounds and strong text contrast.
- Keep the interface professional, calm, modern, and suitable for extended learning sessions.
- Avoid excessive neon, heavy blur, excessive glow, decorative clutter, and unnecessary animation.

### Design tokens

Define reusable values for:

- Primary, secondary, accent, background, surface, border, text, success, warning, and error colors
- Typography family, sizes, weights, line heights, and heading hierarchy
- Content widths and responsive breakpoints
- Spacing scale and grid gaps
- Card padding, radius, border, shadow, and hover behavior
- Buttons and button variants
- Inputs, selects, textareas, and validation states
- Tables, badges, status labels, and dialogs
- Focus indicators and accessibility states
- Loading, empty, success, and error states

### Card and page layout principles

- Every page should have a clear title and, where appropriate, a concise description and primary action.
- Group related content into cards with consistent padding and alignment.
- Use consistent grid columns, section spacing, and page margins.
- Avoid unnecessary nested cards and excessive visual borders.
- Keep long text, tables, forms, and important information on sufficiently opaque, readable surfaces.
- Make the layout adapt to mobile, tablet, laptop, and wide desktop screens.
- Maintain consistent alignment across headings, action buttons, card edges, tables, and forms.

### Consistency without forcing identical pages

Use the same visual language throughout the application, while allowing each page layout to reflect its purpose. A course player, user-management table, and analytics dashboard should not be forced into the same structure.

**Approval gate:** Present the design specification and representative mockup or sample page for approval before expanding implementation.

---

## 6. Phase 3 — Build or Refine Reusable Components

Audit existing components before creating new ones. Reuse working components wherever practical.

Potential shared components, depending on the existing application:

- Page container and content-width wrapper
- Page title and section header
- Standard content card
- Course card
- Dashboard statistic card
- Form section/card
- Buttons and button variants
- Input, select, and textarea controls
- Search, filter, pagination, and table components
- Status badges
- Confirmation dialog
- Toast/feedback states
- Loading, empty, and error states
- Responsive sidebar, header, and navigation

Requirements:

1. Avoid duplicated styles and one-off spacing fixes.
2. Keep visual styling separate from business logic and data fetching.
3. Preserve server/client component boundaries in Next.js.
4. Do not change API contracts, authentication behavior, permissions, or data models as part of styling.
5. Avoid broad edits to root layouts or shared components without assessing their impact on all routes.

**Approval gate:** Validate the shared components on representative public, student, admin, and super admin pages before widespread reuse.

---

## 7. Phase 4 — Redesign All Page Groups Incrementally

Do not redesign the entire application in one uncontrolled operation.

The proposed order is:

1. Public and authentication pages
2. Student dashboard and learning pages
3. Admin dashboard and management pages
4. Super admin dashboard and platform-management pages
5. Remaining settings, forms, detail pages, reports, and secondary routes

Adjust the order only when the actual route inventory or dependencies justify it.

For every batch:

1. Record the current behavior and baseline appearance.
2. Identify the exact pages and files expected to change.
3. Explain the visual improvements and potential regression risks.
4. Implement only the approved batch.
5. Run relevant tests and build checks.
6. Inspect terminal and browser-console errors.
7. Test page navigation, interactions, and responsive behavior.
8. Compare before-and-after screenshots where practical.
9. Report the changed files and test results.
10. Stop for review and approval before the next significant batch.

Preserve existing content, URLs, API integrations, forms, and interactions unless a functional change is separately approved.

---

## 8. Page-Specific Quality Requirements

### Public and authentication pages

- Clear visual hierarchy and accessible form fields.
- Consistent buttons, inputs, validation, and error states.
- Preserve existing Google Sign-In and other authentication flows.
- Preserve registration, verification, redirects, and logout behavior.
- Do not change OAuth callback URLs or provider settings without approval.

### Student pages

- Organized course cards and course details.
- Clear learning progress and course status.
- Consistent course catalogue filters and actions.
- Preserve enrollment, course access, video playback, and progress tracking.
- Keep learning content readable and uncluttered.

### Admin pages

- Consistent sidebar and header.
- Aligned dashboard statistics cards.
- Structured tables with readable columns, filters, pagination, and actions where those features already exist.
- Organized management forms and clear validation feedback.
- Consistent spacing and predictable page-level actions.
- Preserve existing admin operations and role restrictions.

### Super admin pages

- Apply the same professional visual quality as all other areas.
- Organize platform-management, users, roles, permissions, settings, reports, and audit-related sections wherever they exist.
- Use clear tables, filters, status indicators, and confirmation dialogs for sensitive actions.
- Make privileged actions visually distinguishable and understandable.
- Preserve all existing super admin permissions and security checks.
- Never grant extra privileges or change role assignments as part of a visual redesign.

### All pages

- Consistent alignment, spacing, typography, and component behavior.
- No clipped content, unintended overlap, broken grids, or horizontal overflow.
- Clear loading, empty, error, success, and disabled states where relevant.
- Usable keyboard navigation, visible focus indicators, accessible labels, and adequate contrast.

---

## 9. Phase 5 — Regression Testing

After every meaningful implementation step, run the relevant checks available in the project:

- Linting
- Type checking
- Unit tests
- Integration tests
- Existing Playwright/browser tests
- Production build command, such as `npm run build`, where appropriate
- Local browser checks and screenshot comparisons

Do not assume every project has every test command. Inspect `package.json` and use the actual configured scripts.

Verify:

- Homepage and all inventoried routes
- Direct URL access and page refreshes
- Navigation links
- Login and registration
- Google Sign-In and verification flows where the local environment permits
- Student course access and learning journeys
- Admin operations
- Super admin operations and role-based access
- Existing API requests and database operations
- Forms, filters, tables, dialogs, loading states, and error handling
- Desktop, tablet, and mobile layouts
- Browser-console errors and failed network requests

Do not claim complete authentication or admin verification if credentials, OAuth, SMTP, database access, or another required local dependency is unavailable. Report limitations honestly.

Do not delete or weaken tests merely to make the suite pass.

**Approval gate:** A batch is not complete if it introduces a regression or has unresolved critical failures.

---

## 10. Phase 6 — Safe Regression Recovery

If any redesign change breaks a route, build, API call, authentication flow, admin action, or other existing functionality:

1. Stop further redesign work.
2. Identify the exact change that introduced the regression.
3. Preserve the current state for investigation.
4. Explain the cause and propose the smallest safe fix or rollback of the affected change.
5. Obtain approval before potentially destructive recovery actions.
6. Re-run the relevant tests to verify restoration.
7. Resume only after the issue is understood and the current batch is validated.

Do not perform a broad rollback or rewrite the application to fix a small visual defect.

---

## 11. Phase 7 — Final Acceptance and Handover

Provide a report containing:

- All inventoried routes and which were redesigned
- Routes not completed and the reason
- Components and files changed, with explanations
- Before-and-after screenshots where practical
- Build, lint, type-check, and test results
- Authentication and role-verification results
- Responsive and accessibility checks
- Known defects and untested behavior
- Confirmation that local environment files and important data were preserved
- Confirmation that `main` was not modified
- Confirmation that no GitHub push, merge, deployment, or production change occurred

Clearly distinguish passed, failed, and untested checks.

Do not claim the entire website is verified if only a subset of routes was tested.

---

## 12. Required First Response From the Coding Agent

**Do not modify any files yet.**

First present:

1. Repository and Git safety assessment
2. Confirmation of the working branch and recovery point
3. Complete route/page inventory
4. Current visual and alignment issues
5. Design-system proposal
6. Reusable component plan
7. Implementation batches and dependencies
8. Regression testing plan
9. Risks and recovery strategy
10. The exact approval decisions required from me

Wait for my explicit approval before implementing.

---

## 13. Definition of Success

The redesign is complete only when all three conditions are met:

### Visual acceptance
Pages are clean, aligned, consistent, responsive, readable, and professionally designed across public, student, admin, and super admin areas.

### Functional acceptance
Existing critical user journeys and permissions continue to work and are verified with actual tests.

### Safety acceptance
No unapproved destructive operations, no production changes, no deployment, no GitHub push, and no merge into `main`.

**Quality, verified functionality, and safety take priority over speed. No deployment, no GitHub push, no unapproved destructive actions, and no unapproved changes to authentication or business logic.**
