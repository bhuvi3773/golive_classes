# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: ui.spec.ts >> UI Navigation Tests >> My Learning page should show empty state or login prompt
- Location: tests\ui.spec.ts:28:7

# Error details

```
Error: expect(received).toBeTruthy()

Received: false
```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - main [ref=e3]:
    - generic [ref=e6]:
      - generic [ref=e7]:
        - heading "Welcome Back" [level=2] [ref=e8]
        - paragraph [ref=e9]: Log in to your account
      - generic [ref=e10]:
        - heading "Learner" [level=3] [ref=e14] [cursor=pointer]
        - heading "Teacher" [level=3] [ref=e19] [cursor=pointer]
      - generic [ref=e20]:
        - generic [ref=e21]:
          - text: Email Address
          - textbox "you@example.com" [ref=e26]
        - generic [ref=e27]:
          - generic [ref=e28]:
            - generic [ref=e29]: Password
            - link "Forgot password?" [ref=e30] [cursor=pointer]:
              - /url: /forgot-password
          - textbox "••••••••" [ref=e35]
        - button "Login as Learner" [ref=e36]
      - generic [ref=e37]: OR
      - link "Continue with Google" [ref=e40] [cursor=pointer]:
        - /url: /api/auth/google/login
      - paragraph [ref=e46]:
        - text: Don't have an account?
        - link "Sign up" [ref=e47] [cursor=pointer]:
          - /url: /register
  - button "Open Next.js Dev Tools" [ref=e53] [cursor=pointer]
  - alert [ref=e57]
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
  8  |     const title = await page.title();
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
> 32 |     expect(isWorking).toBeTruthy();
     |                       ^ Error: expect(received).toBeTruthy()
  33 |   });
  34 | });
  35 | 
```