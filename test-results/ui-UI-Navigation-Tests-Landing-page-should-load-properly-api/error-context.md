# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: ui.spec.ts >> UI Navigation Tests >> Landing page should load properly
- Location: tests\ui.spec.ts:4:7

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: page.title: Target page, context or browser has been closed
```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - main [ref=e3]:
    - generic [ref=e5]:
      - navigation [ref=e6]:
        - generic [ref=e7]:
          - link [ref=e8] [cursor=pointer]:
            - /url: /
            - img "GoLive Classes" [ref=e9]
          - generic [ref=e10]:
            - link "Home" [ref=e11] [cursor=pointer]:
              - /url: /
            - link "Courses" [ref=e12] [cursor=pointer]:
              - /url: /courses
            - link "Recommendations" [ref=e13] [cursor=pointer]:
              - /url: /recommendations
          - generic [ref=e14]:
            - link "Login" [ref=e15] [cursor=pointer]:
              - /url: /login
            - link "Sign Up" [ref=e16] [cursor=pointer]:
              - /url: /register
      - generic [ref=e18]:
        - generic [ref=e19]: "#1 Online Learning Platform"
        - heading "Master the Skills to Build Your Future" [level=1] [ref=e23]
        - paragraph [ref=e24]: Join thousands of students learning cutting-edge technologies. Expert-led courses, hands-on projects, and a clear path to career success.
        - generic [ref=e25]:
          - link "Explore Courses" [ref=e26] [cursor=pointer]:
            - /url: /courses
          - link "Sign Up Free" [ref=e29] [cursor=pointer]:
            - /url: /register
      - generic [ref=e34]:
        - generic [ref=e35]:
          - generic [ref=e36]: 50K+
          - generic [ref=e37]: Students Trained
        - generic [ref=e38]:
          - generic [ref=e39]: 95%
          - generic [ref=e40]: Placement Rate
        - generic [ref=e41]:
          - generic [ref=e42]: 200+
          - generic [ref=e43]: Expert Instructors
        - generic [ref=e44]:
          - generic [ref=e45]: 4.9/5
          - generic [ref=e46]: Average Rating
      - generic [ref=e48]:
        - generic [ref=e49]:
          - heading "Why Learn With Us?" [level=2] [ref=e50]
          - paragraph [ref=e51]: Everything you need to master new technologies and advance your career, all in one platform.
        - generic [ref=e52]:
          - generic [ref=e53]:
            - heading "Expert-Led Courses" [level=3] [ref=e58]
            - paragraph [ref=e59]: Learn directly from industry professionals with years of real-world experience and deep technical knowledge.
          - generic [ref=e60]:
            - heading "Hands-On Projects" [level=3] [ref=e65]
            - paragraph [ref=e66]: Build a portfolio of real-world applications as you learn. Stop watching and start doing.
          - generic [ref=e67]:
            - heading "Career Focused" [level=3] [ref=e72]
            - paragraph [ref=e73]: Our curriculum is designed backward from what hiring managers are actually looking for right now.
      - generic [ref=e75]:
        - generic [ref=e76]:
          - generic [ref=e77]:
            - heading "Featured Courses" [level=2] [ref=e78]
            - paragraph [ref=e79]: Start learning the most highly-demanded skills.
          - link "View All Courses" [ref=e80] [cursor=pointer]:
            - /url: /courses
        - paragraph [ref=e85]: No courses available right now. Instructors are adding content!
      - generic [ref=e87]:
        - generic [ref=e88]:
          - heading "What Our Students Say" [level=2] [ref=e89]
          - paragraph [ref=e90]: Join thousands of students who have transformed their careers.
        - generic [ref=e91]:
          - generic [ref=e92]:
            - paragraph [ref=e104]: "\"This platform completely changed my career trajectory. The instructors are amazing and the hands-on projects gave me the confidence to pass my technical interviews.\""
            - generic [ref=e105]:
              - generic [ref=e106]: S1
              - generic [ref=e107]:
                - heading "Student 1" [level=4] [ref=e108]
                - paragraph [ref=e109]: Placed at Top Tech Co.
          - generic [ref=e110]:
            - paragraph [ref=e122]: "\"This platform completely changed my career trajectory. The instructors are amazing and the hands-on projects gave me the confidence to pass my technical interviews.\""
            - generic [ref=e123]:
              - generic [ref=e124]: S2
              - generic [ref=e125]:
                - heading "Student 2" [level=4] [ref=e126]
                - paragraph [ref=e127]: Placed at Top Tech Co.
          - generic [ref=e128]:
            - paragraph [ref=e140]: "\"This platform completely changed my career trajectory. The instructors are amazing and the hands-on projects gave me the confidence to pass my technical interviews.\""
            - generic [ref=e141]:
              - generic [ref=e142]: S3
              - generic [ref=e143]:
                - heading "Student 3" [level=4] [ref=e144]
                - paragraph [ref=e145]: Placed at Top Tech Co.
      - generic [ref=e147]:
        - img "GoLive Classes" [ref=e148]
        - paragraph [ref=e149]: © 2026 GoLive Classes. All rights reserved.
  - button "Open Next.js Dev Tools" [ref=e155] [cursor=pointer]
  - alert [ref=e159]
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('UI Navigation Tests', () => {
  4  |   test('Landing page should load properly', async ({ page }) => {
  5  |     await page.goto('/');
  6  |     await expect(page.locator('text=Welcome')).toBeVisible({ timeout: 15000 }).catch(() => {});
  7  |     // Just asserting the page didn't crash
> 8  |     const title = await page.title();
     |                              ^ Error: page.title: Target page, context or browser has been closed
  9  |     expect(title).not.toBe('');
  10 |   });
  11 | 
  12 |   test('Courses catalog page should load', async ({ page }) => {
  13 |     await page.goto('/courses');
  14 |     // Verify search bar is visible
  15 |     await expect(page.locator('input[placeholder="Search courses..."]')).toBeVisible({ timeout: 10000 }).catch(() => {});
  16 |     // Verify category filters
  17 |     await expect(page.getByText('All Categories')).toBeVisible({ timeout: 10000 }).catch(() => {});
  18 |   });
  19 | 
  20 |   test('Login and Register pages should be accessible', async ({ page }) => {
  21 |     await page.goto('/login');
  22 |     await expect(page.locator('button:has-text("Login")')).toBeVisible({ timeout: 10000 }).catch(() => {});
  23 | 
  24 |     await page.goto('/register');
  25 |     await expect(page.locator('button:has-text("Sign Up")')).toBeVisible({ timeout: 10000 }).catch(() => {});
  26 |   });
  27 | 
  28 |   test('My Learning page should show empty state or login prompt', async ({ page }) => {
  29 |     await page.goto('/my-learning');
  30 |     const bodyText = await page.locator('body').innerText();
  31 |     const isWorking = bodyText.includes('log in') || bodyText.includes('aren\'t enrolled');
  32 |     expect(isWorking).toBeTruthy();
  33 |   });
  34 | });
  35 | 
```