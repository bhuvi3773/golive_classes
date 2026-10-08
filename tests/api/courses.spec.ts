import { test, expect } from '@playwright/test';

test.describe('Courses API', () => {
  test('should fetch all published courses', async ({ request }) => {
    const response = await request.get('/api/courses');
    
    expect(response.ok()).toBeTruthy();
    const responseBody = await response.json();
    
    // The response should be an array of courses
    expect(Array.isArray(responseBody)).toBeTruthy();
    
    if (responseBody.length > 0) {
      const course = responseBody[0];
      expect(course).toHaveProperty('id');
      expect(course).toHaveProperty('title');
      expect(course).toHaveProperty('status');
      
      // Admin might see more, but public endpoint should only show published by default
      // unless admin param is passed
      expect(course.status).toBe('published');
    }
  });

  test('should return 404 for a non-existent course', async ({ request }) => {
    // using a dummy uuid
    const response = await request.get('/api/courses/00000000-0000-0000-0000-000000000000');
    
    expect(response.status()).toBe(404);
    const responseBody = await response.json();
    expect(responseBody.error).toBe('Course not found');
  });
});
