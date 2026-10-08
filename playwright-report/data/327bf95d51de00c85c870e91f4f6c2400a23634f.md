# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: ui.spec.ts >> UI Navigation Tests >> Courses catalog page should load
- Location: tests\ui.spec.ts:12:7

# Error details

```
Test timeout of 30000ms exceeded.
```

# Page snapshot

```yaml
- generic [active] [ref=f1e1]:
  - main [ref=f1e3]:
    - generic [ref=f1e6]:
      - generic [ref=f1e7]:
        - heading "Welcome Back" [level=2] [ref=f1e8]
        - paragraph [ref=f1e9]: Log in to your account
      - generic [ref=f1e10]:
        - heading "Learner" [level=3] [ref=f1e14] [cursor=pointer]
        - heading "Teacher" [level=3] [ref=f1e19] [cursor=pointer]
      - generic [ref=f1e20]:
        - generic [ref=f1e21]:
          - text: Email Address
          - textbox "you@example.com" [ref=f1e26]
        - generic [ref=f1e27]:
          - generic [ref=f1e28]:
            - generic [ref=f1e29]: Password
            - link "Forgot password?" [ref=f1e30] [cursor=pointer]:
              - /url: /forgot-password
          - textbox "••••••••" [ref=f1e35]
        - button "Login as Learner" [ref=f1e36]
      - generic [ref=f1e37]: OR
      - link "Continue with Google" [ref=f1e40] [cursor=pointer]:
        - /url: /api/auth/google/login
      - paragraph [ref=f1e46]:
        - text: Don't have an account?
        - link "Sign up" [ref=f1e47] [cursor=pointer]:
          - /url: /register
  - button "Open Next.js Dev Tools" [ref=f1e53] [cursor=pointer]
  - alert [ref=f1e57]
```