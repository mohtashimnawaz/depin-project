import { test, expect } from '@playwright/test'

test('depin page shows connect wallet prompt when not connected', async ({ page }) => {
  await page.goto('/depin')
  await expect(page.locator('h1', { hasText: 'DePIN Network' })).toBeVisible()
  await expect(page.locator('text=Connect your wallet')).toBeVisible()
})
