import { test, expect } from '@playwright/test';

test.describe('SEOSnap E2E Suite', () => {
  test('should load home page and render tool navigation links', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/SEOSnap/i);

    const logo = page.locator('.nav-logo');
    await expect(logo).toBeVisible();

    await expect(page.getByRole('link', { name: /Sign In/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /Try free/i })).toBeVisible();
  });

  test('should navigate to login page successfully', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByRole('heading', { name: /Welcome Back/i })).toBeVisible();
  });

  test('should navigate to signup page successfully', async ({ page }) => {
    await page.goto('/signup');
    await expect(page.getByRole('heading', { name: /Create Account/i })).toBeVisible();
  });

  test('dashboard redirects signed-out users to login', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/login/);
  });

  test('health check API endpoint returns HTTP 200 ok', async ({ request }) => {
    const response = await request.get('/api/health');
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.status).toBe('ok');
    expect(body.service).toBe('seosnap');
  });

  test('reports API rejects unauthenticated requests', async ({ request }) => {
    const response = await request.get('/api/reports');
    expect(response.status()).toBe(401);
  });
});

const TOOLS = [
  { path: '/tools/seo-analyzer', name: 'SEO Analyzer' },
  { path: '/tools/broken-link-checker', name: 'Broken Link Checker' },
  { path: '/tools/content-extractor', name: 'Content Extractor' },
  { path: '/tools/sitemap-extractor', name: 'Sitemap Extractor' },
  { path: '/tools/free-seo-report', name: 'Free SEO Report' },
];

test.describe('Tool pages', () => {
  for (const tool of TOOLS) {
    test(`${tool.name} page loads with an input and submit button`, async ({ page }) => {
      const res = await page.goto(tool.path);
      expect(res?.status()).toBe(200);
      await expect(page.locator('h1').first()).toBeVisible();
      await expect(page.locator('input').first()).toBeVisible();
      await expect(page.locator('button[type="submit"], form button').first()).toBeVisible();
    });
  }
});
