import { test, expect } from '@playwright/test'

// Mock wallet and run submission flow using manual input
test('depin submission flow with mocked wallet', async ({ page }) => {
  await page.addInitScript(() => {
    // @ts-ignore - attach a mock account for the client-side mock override
    ;(window as any).__MOCK_SOLANA_ACCOUNT = {
      address: 'MockAddress111111111111111111111111111111111',
      wallet: { name: 'Mock Wallet' }
    }
  })

  await page.goto('/depin')

  // Ensure the submission form is present
  await expect(page.locator('text=Submit Activity')).toBeVisible()

  // Switch to manual input
  await page.click('text=Manual Input')

  // Fill inputs
  await page.fill('input#latitude', '37.7749')
  await page.fill('input#longitude', '-122.4194')
  await page.fill('input#signal', '-65')

  // Submit
  await page.click('text=Submit Activity & Earn 5 MAP')

  // Expect submitting state
  await expect(page.locator('text=Submitting Activity')).toBeVisible()

  // Wait for verification or UI change (mock client will set pending verification)
  await page.waitForTimeout(2500)
  await expect(page.locator('text=Verifying').first()).toBeVisible()
})
