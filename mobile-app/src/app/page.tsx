import LandingHero from '@/components/landing-hero'
import { QuickStats } from '@/components/quick-stats'
import Link from 'next/link'

export default function Home() {
  return (
    <div>
      <LandingHero />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <QuickStats />

        <div className="mt-8 text-center">
          <Link href="/depin" className="inline-block mt-4 px-6 py-3 rounded-md bg-blue-600 text-white hover:bg-blue-700">
            Go to Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}
