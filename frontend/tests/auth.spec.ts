import { test, expect } from '@playwright/test';

test.describe('Candidate Auth Flow Suite', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/login');
  });

  test('should render Login Page header and auth options', async ({ page }) => {
    const welcomeHeader = page.getByText('WELCOME BACK, CANDIDATE!');
    await expect(welcomeHeader).toBeVisible();

    const googleBtn = page.getByRole('button', { name: /Continue with Google/i });
    await expect(googleBtn).toBeVisible();

    const linkedinBtn = page.getByRole('button', { name: /Continue with LinkedIn/i });
    await expect(linkedinBtn).toBeVisible();
  });

  test('should open LinkedIn social modal on clicking Continue with LinkedIn', async ({ page }) => {
    const linkedinBtn = page.getByRole('button', { name: /Continue with LinkedIn/i });
    await linkedinBtn.click();

    // Verify LinkedIn modal title
    const modalHeader = page.getByRole('heading', { name: /Sign In with LinkedIn/i });
    await expect(modalHeader).toBeVisible();

    // Fill details in LinkedIn modal
    const emailInput = page.locator('input[type="email"]');
    await expect(emailInput).toBeVisible();
    await emailInput.fill('testcandidate@linkedin.com');

    const nameInput = page.locator('input[type="text"]').last();
    await expect(nameInput).toBeVisible();
    await nameInput.fill('Test Candidate');

    const submitBtn = page.getByRole('button', { name: /Authorize & Launch Portal/i });
    await expect(submitBtn).toBeVisible();
  });

  test('should trigger Google auth without modal fallback or infinite loading freeze', async ({ page }) => {
    const googleBtn = page.getByRole('button', { name: /Continue with Google/i });
    await expect(googleBtn).toBeVisible();

    // Listen for popup or navigation
    const popupPromise = page.waitForEvent('popup').catch(() => null);
    await googleBtn.click();
    const popup = await popupPromise;

    // Verify that the custom text input modal is NOT open for Google
    const customModalHeader = page.getByRole('heading', { name: /Sign In with Google/i });
    await expect(customModalHeader).not.toBeVisible();

    // Ensure main page is not stuck in infinite loading state
    const submitLoader = page.getByText('AUTHENTICATING CANDIDATE...');
    await expect(submitLoader).not.toBeVisible();
  });

});
