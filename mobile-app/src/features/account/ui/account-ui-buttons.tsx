import { Address } from 'gill'
import { ErrorBoundary } from 'next/dist/client/components/error-boundary'
import { useSolana } from '@/components/solana/use-solana'
import { AccountUiModalAirdrop } from './account-ui-modal-airdrop'
import { AccountUiModalReceive } from './account-ui-modal-receive'
import { AccountUiModalSend } from './account-ui-modal-send'

export function AccountUiButtons({ address }: { address: Address }) {
  const { account } = useSolana()
  // Get cluster from env or default to devnet
  const cluster = { id: process.env.NEXT_PUBLIC_RPC_ENDPOINT?.includes('devnet') ? 'solana:devnet' : 'solana:mainnet' }

  return account ? (
    <div>
      <div className="space-x-2">
        {cluster.id === 'solana:mainnet-beta' ? null : <AccountUiModalAirdrop address={address} />}
        <ErrorBoundary errorComponent={() => null}>
          <AccountUiModalSend account={account} address={address} />
        </ErrorBoundary>
        <AccountUiModalReceive address={address} />
      </div>
    </div>
  ) : null
}
