import { test, expect } from '@playwright/test'

test('homepage -> Get Started navigates to /depin', async ({ page }) => {
  await page.goto('/')
  // Click the hero Get Started link specifically (in the landing hero section)
  const heroSection = page.locator('section', { hasText: 'Build and earn on the DePIN Network' })
  const link = heroSection.getByRole('link', { name: /Get Started/i })
  await expect(link).toBeVisible()
  await link.click()
  await expect(page).toHaveURL(/\/depin/)
  await expect(page.locator('h1', { hasText: 'DePIN Network' })).toBeVisible()
})
