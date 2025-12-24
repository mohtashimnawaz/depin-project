import { getExplorerLink, GetExplorerLinkArgs } from 'gill'
import { getSolanaClusterMoniker } from '@wallet-ui/react-gill'
import { useSolana } from '@/components/solana/use-solana'
import { ArrowUpRightFromSquare } from 'lucide-react'

export function AppExplorerLink({
  className,
  label = '',
  ...link
}: GetExplorerLinkArgs & {
  className?: string
  label: string
}) {
  const { client } = useSolana()
  // Get cluster from env or default to devnet
  const clusterId = process.env.NEXT_PUBLIC_RPC_ENDPOINT?.includes('devnet') ? 'solana:devnet' : 'solana:mainnet-beta'
  const cluster = { id: clusterId }
  
  return (
    <a
      href={getExplorerLink({ ...link, cluster: getSolanaClusterMoniker(cluster.id) })}
      target="_blank"
      rel="noopener noreferrer"
      className={className ? className : `link font-mono inline-flex gap-1`}
    >
      {label}
      <ArrowUpRightFromSquare size={12} />
    </a>
  )
}
