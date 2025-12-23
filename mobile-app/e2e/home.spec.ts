import { test, expect } from '@playwright/test'

test('homepage -> Get Started navigates to /depin', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('text=Get Started')).toBeVisible()
  await page.click('text=Get Started')
  await expect(page).toHaveURL(/\/depin/)
  await expect(page.locator('text=DePIN Network')).toBeVisible()
})
