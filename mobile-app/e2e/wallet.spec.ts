import { test, expect } from '@playwright/test'

// Test wallet connect state via mock override and simulate disconnect by reloading without mock
test('wallet mock connect and disconnect', async ({ page }) => {
  // Start with mock connected
  await page.addInitScript(() => {
    // @ts-ignore
    ;(window as any).__MOCK_SOLANA_ACCOUNT = { address: 'MockAddress1111', wallet: { name: 'Mock Wallet' } }
  })

  await page.goto('/depin')
  // Should show submit activity when connected
  await expect(page.locator('text=Submit Activity')).toBeVisible()

  // Remove mock and reload to simulate disconnect
  await page.evaluate(() => {
    // @ts-ignore
    delete (window as any).__MOCK_SOLANA_ACCOUNT
  })
  await page.reload()

  // Now it should show the hero prompting to connect wallet
  await expect(page.locator('text=Connect your wallet')).toBeVisible()
})