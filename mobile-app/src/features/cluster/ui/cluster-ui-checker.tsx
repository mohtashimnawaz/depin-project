import { ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { AppAlert } from '@/components/app-alert'
import { useSolana } from '@/components/solana/use-solana'
import { useClusterVersion } from '../data-access/use-cluster-version'

export function ClusterUiChecker({ children }: { children: ReactNode }) {
  const { client } = useSolana()
  // Get cluster from env or default to devnet
  const cluster = process.env.NEXT_PUBLIC_RPC_ENDPOINT?.includes('devnet') ? 'devnet' : 'mainnet-beta'
  const query = useClusterVersion()

  if (query.isLoading) {
    return null
  }

  if (query.isError || !query.data) {
    return (
      <AppAlert
        action={
          <Button variant="outline" onClick={() => query.refetch()}>
            Refresh
          </Button>
        }
        className="mb-4"
      >
        Error connecting to cluster <span className="font-bold">{cluster.label}</span>.
      </AppAlert>
    )
  }
  return children
}
