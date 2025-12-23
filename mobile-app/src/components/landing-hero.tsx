'use client'

import Link from 'next/link'
import { Button } from './ui/button'
import { AppHero } from './app-hero'
import React from 'react'
import { MapPin, Globe, Users } from 'lucide-react'

export default function LandingHero() {
  return (
    <section className="bg-gradient-to-b from-white to-blue-50 dark:from-neutral-900 dark:to-neutral-900/60 py-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <AppHero
          title={<span className="text-4xl md:text-5xl font-extrabold leading-tight">Build and earn on the DePIN Network</span>}
          subtitle={
            <p className="max-w-2xl mx-auto text-sm md:text-base text-muted-foreground">
              Contribute WiFi signal data, help grow decentralized physical infrastructure, and earn MAP tokens. Connect your wallet and start contributing today.
            </p>
          }
        >
          <div className="mt-6 flex items-center justify-center gap-3">
            <Button asChild>
              <Link href="/depin" aria-label="Get started">Get Started</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/depin" aria-label="Explore network">Explore Network</Link>
            </Button>
          </div>
        </AppHero>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-card/50 rounded-lg">
            <div className="flex items-start gap-3">
              <MapPin className="h-6 w-6 text-blue-500 mt-1" />
              <div>
                <h4 className="font-semibold">Prove coverage</h4>
                <p className="text-sm text-muted-foreground">Submit location and signal strength data to verify coverage and earn rewards.</p>
              </div>
            </div>
          </div>

          <div className="p-6 bg-card/50 rounded-lg">
            <div className="flex items-start gap-3">
              <Globe className="h-6 w-6 text-green-500 mt-1" />
              <div>
                <h4 className="font-semibold">Global reach</h4>
                <p className="text-sm text-muted-foreground">View global network coverage and how your contributions compare.</p>
              </div>
            </div>
          </div>

          <div className="p-6 bg-card/50 rounded-lg">
            <div className="flex items-start gap-3">
              <Users className="h-6 w-6 text-purple-500 mt-1" />
              <div>
                <h4 className="font-semibold">Join contributors</h4>
                <p className="text-sm text-muted-foreground">Connect with the community, track your rewards, and climb the leaderboard.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
