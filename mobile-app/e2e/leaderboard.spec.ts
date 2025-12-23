import { test, expect } from '@playwright/test'

test('leaderboard shows top contributors and view full leaderboard button', async ({ page }) => {
  await page.goto('/depin')
  await expect(page.locator('text=Leaderboard')).toBeVisible()
  await expect(page.locator('text=#1')).toBeVisible()
  const btn = page.getByRole('button', { name: /View Full Leaderboard/i })
  await expect(btn).toBeVisible()
  await btn.click()
  // Button has no effect currently; ensure no navigation and page still shows leaderboard
  await expect(page.locator('text=Leaderboard')).toBeVisible()
})
