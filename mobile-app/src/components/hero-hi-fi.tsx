'use client'

import React from 'react'
import Link from 'next/link'
import { Button } from './ui/button'

export default function HeroHiFi() {
  return (
    <section className="bg-gradient-to-b from-surface/80 to-surface py-20">
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div>
            <h1 className="text-4xl lg:text-5xl font-extrabold text-primary leading-tight">Build and earn on the DePIN Network</h1>
            <p className="mt-4 text-base text-muted max-w-xl">Contribute WiFi signal data, help grow decentralized infrastructure, and earn MAP tokens. Connect your wallet and start contributing today.</p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Button size="lg">Connect Wallet</Button>
              <Button variant="outline" size="lg">Explore Network</Button>
            </div>

            <div className="mt-8 grid grid-cols-3 gap-4 text-sm text-muted">
              <div className="bg-white border border-border p-4 rounded-md shadow-card">
                <div className="font-semibold">Prove coverage</div>
                <div className="text-muted">Submit verified location & signal data</div>
              </div>
              <div className="bg-white border border-border p-4 rounded-md shadow-card">
                <div className="font-semibold">Global reach</div>
                <div className="text-muted">View coverage and recent activity</div>
              </div>
              <div className="bg-white border border-border p-4 rounded-md shadow-card">
                <div className="font-semibold">Earn rewards</div>
                <div className="text-muted">Track MAP earnings and leaderboard rank</div>
              </div>
            </div>
          </div>

          <div className="hidden lg:block">
            <div className="bg-gradient-to-br from-accent/10 to-surface rounded-xl p-8 h-full flex items-center justify-center">
              <div className="w-full h-56 bg-surface rounded-md border border-border flex items-center justify-center">
                <div className="text-accent font-semibold">Illustration Placeholder</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
