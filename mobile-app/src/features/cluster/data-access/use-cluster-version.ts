import { useQuery } from '@tanstack/react-query'
import { useSolana } from '@/components/solana/use-solana'

export function useClusterVersion() {
  const { client } = useSolana()
  // Get cluster from env or default to devnet
  const cluster = process.env.NEXT_PUBLIC_RPC_ENDPOINT?.includes('devnet') ? 'devnet' : 'mainnet-beta'
  return useQuery({
    retry: false,
    queryKey: ['version', { cluster }],
    queryFn: () => client.rpc.getVersion().send(),
  })
}
