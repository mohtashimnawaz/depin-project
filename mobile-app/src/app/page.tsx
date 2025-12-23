import HeroHiFi from '@/components/hero-hi-fi'
import { QuickStats } from '@/components/quick-stats'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function Home() {
  return (
    <div>
      <HeroHiFi />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <QuickStats />

        <div className="mt-8 text-center">
          <Button asChild size="lg" className="mt-4">
            <Link href="/depin">Go to Dashboard</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
