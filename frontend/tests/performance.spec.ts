import { test, expect } from '@playwright/test';

test.describe('Candidate Performance & Growth Matrix UI Suite', () => {
  
  test.beforeEach(async ({ page }) => {
    // Set authenticated mock token in localStorage before navigation
    await page.addInitScript(() => {
      window.localStorage.setItem('auth_token', 'mock_jwt_token_for_playwright');
      window.localStorage.setItem('auth_user', JSON.stringify({
        id: 'user_candidate_1',
        email: 'aarav@cloudops.internal',
        full_name: 'Aarav Sharma',
        role: 'CANDIDATE'
      }));
    });
  });

  test('should render Candidate Performance & Growth Matrix title and header banner', async ({ page }) => {
    await page.goto('/performance');

    // Verify main page title
    const header = page.locator('h1');
    await expect(header).toContainText('Performance');
    await expect(header).toContainText('Growth Matrix');

    // Verify Analytics Badge
    const badge = page.getByText('CAREER VELOCITY ANALYTICS • REAL-TIME DB SYNC');
    await expect(badge).toBeVisible();
  });

  test('should display dual metric score cards for Readiness Velocity & Resume ATS Score', async ({ page }) => {
    await page.goto('/performance');

    // Readiness Velocity Card
    const readinessLabel = page.getByText('Readiness Velocity');
    await expect(readinessLabel).toBeVisible();

    // Resume ATS Score Card
    const atsLabel = page.getByText('Resume ATS Score');
    await expect(atsLabel).toBeVisible();
  });

  test('should render 4-Week Score Progression Velocity section and week items', async ({ page }) => {
    await page.goto('/performance');

    const progressionTitle = page.getByText('4-WEEK SCORE PROGRESSION VELOCITY');
    await expect(progressionTitle).toBeVisible();

    const week1 = page.getByText('Week 1');
    await expect(week1).toBeVisible();

    const week4 = page.getByText('Week 4');
    await expect(week4).toBeVisible();
  });

  test('should render 5-Pillar Assessment Rubric and Speech Telemetry Cards', async ({ page }) => {
    await page.goto('/performance');

    // 5-Pillar Assessment Title
    const pillarTitle = page.getByText('5-PILLAR ASSESSMENT RUBRIC AVERAGES');
    await expect(pillarTitle).toBeVisible();

    // Speech Telemetry Title
    const telemetryTitle = page.getByText('SPEECH & TELEMETRY ANALYTICS');
    await expect(telemetryTitle).toBeVisible();

    // Telemetry items
    await expect(page.getByText('Average Pacing')).toBeVisible();
    await expect(page.getByText('Filler Words')).toBeVisible();
  });

  test('should have working Quick Practice CTA button leading to /interviews', async ({ page }) => {
    await page.goto('/performance');

    const ctaButton = page.locator('a[href="/interviews"]', { hasText: 'Launch Interview Practice' });
    await expect(ctaButton).toBeVisible();
  });

});
