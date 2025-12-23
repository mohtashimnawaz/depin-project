import { useWalletUi } from '@wallet-ui/react'
import { useWalletUiGill } from '@wallet-ui/react-gill'

/**
 * Custom hook to abstract Wallet UI and related functionality from your app.
 *
 * This is a great place to add custom shared Solana logic or clients.
 */
export function useSolana() {
  const walletUi = useWalletUi()
  const client = useWalletUiGill()

  // Test override: if a mock account is injected on window during e2e tests,
  // return a mocked connected account to make flows testable without real wallets.
  if (typeof window !== 'undefined' && (window as any).__MOCK_SOLANA_ACCOUNT) {
    const mockAccount = (window as any).__MOCK_SOLANA_ACCOUNT
    return {
      account: mockAccount,
      connected: true,
      wallet: mockAccount.wallet ?? null,
      client,
    }
  }

  return {
    ...walletUi,
    client,
  }
}
