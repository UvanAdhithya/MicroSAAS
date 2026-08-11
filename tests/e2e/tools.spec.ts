import { test, expect } from '@playwright/test';

test.describe('DevTools Hub E2E Suite', () => {
  test('should load home page and render tool navigation links', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/DevTools/i);
    
    // Check navigation logo and buttons
    const logo = page.locator('.nav-logo');
    await expect(logo).toBeVisible();

    const loginBtn = page.getByRole('link', { name: /Sign In/i });
    await expect(loginBtn).toBeVisible();

    const tryFreeBtn = page.getByRole('link', { name: /Try free/i });
    await expect(tryFreeBtn).toBeVisible();
  });

  test('should navigate to login page successfully', async ({ page }) => {
    await page.goto('/login');
    const heading = page.getByRole('heading', { name: /Welcome Back/i });
    await expect(heading).toBeVisible();
  });

  test('should navigate to signup page successfully', async ({ page }) => {
    await page.goto('/signup');
    const heading = page.getByRole('heading', { name: /Create Account/i });
    await expect(heading).toBeVisible();
  });

  test('health check API endpoint returns HTTP 200 ok', async ({ request }) => {
    const response = await request.get('/api/health');
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.status).toBe('ok');
    expect(body.service).toBe('devtools-hub');
  });
});
