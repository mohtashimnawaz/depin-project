import type { Address } from 'gill'
import { useSolana } from '@/components/solana/use-solana'

export function useGetBalanceQueryKey({ address }: { address: Address }) {
  const { client } = useSolana()
  // Get cluster from env or default to devnet
  const cluster = process.env.NEXT_PUBLIC_RPC_ENDPOINT?.includes('devnet') ? 'devnet' : 'mainnet-beta'

  return ['get-balance', { cluster, address }]
}
