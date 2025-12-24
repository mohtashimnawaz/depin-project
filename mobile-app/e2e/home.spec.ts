import { test, expect } from '@playwright/test'

test('homepage -> Go to Dashboard navigates to /depin', async ({ page }) => {
  await page.goto('/')
  // Click the Go to Dashboard button
  const dashboardButton = page.getByRole('link', { name: /Go to Dashboard/i })
  await expect(dashboardButton).toBeVisible()
  await dashboardButton.click()
  await expect(page).toHaveURL(/\/depin/)
  await expect(page.locator('h1', { hasText: 'DePIN Network' })).toBeVisible()
})
