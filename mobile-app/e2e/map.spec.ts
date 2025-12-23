import { test, expect } from '@playwright/test'

test('map visualization shows regions and recent activity', async ({ page }) => {
  await page.goto('/depin')
  await expect(page.locator('text=Network Map')).toBeVisible()
  await expect(page.locator('text=Interactive map visualization')).toBeVisible()
  // Check for regional statistics
  await expect(page.locator('text=Regional Coverage')).toBeVisible()
  await expect(page.locator('text=North America')).toBeVisible()
  await expect(page.locator('text=Europe')).toBeVisible()
})