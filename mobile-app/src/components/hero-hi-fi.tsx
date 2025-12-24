'use client'

import React from 'react'
import Link from 'next/link'
import { Button } from './ui/button'
import { Wifi, TrendingUp, Users, ArrowRight, Sparkles, Globe } from 'lucide-react'

export default function HeroHiFi() {
  return (
    <section className="relative bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-full h-full opacity-20" style={{
          backgroundImage: `radial-gradient(circle at 25% 25%, rgba(255,255,255,0.1) 2px, transparent 2px),
                           radial-gradient(circle at 75% 75%, rgba(255,255,255,0.05) 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }}></div>
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-400/20 rounded-full px-4 py-2 mb-6">
              <Sparkles className="h-4 w-4 text-blue-400" />
              <span className="text-sm font-medium text-blue-300">DePIN Network</span>
            </div>

            <h1 className="text-5xl lg:text-6xl xl:text-7xl font-extrabold text-white leading-tight mb-6">
              Earn{' '}
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                MAP Tokens
              </span>
              {' '}by Contributing to DePIN
            </h1>

            <p className="text-xl text-slate-300 leading-relaxed mb-8 max-w-2xl">
              Join thousands of contributors worldwide. Submit WiFi signal data, help build the decentralized physical infrastructure network, and earn rewards for your participation.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <Button asChild size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 px-8 py-4 text-lg font-semibold">
                <Link href="/depin" className="flex items-center gap-2">
                  Connect Wallet
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
              <Button variant="outline" asChild size="lg" className="border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-white transition-all duration-300 px-8 py-4 text-lg font-semibold">
                <Link href="/depin" className="flex items-center gap-2">
                  Explore Network
                  <Wifi className="h-5 w-5" />
                </Link>
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">10K+</div>
                <div className="text-sm text-slate-400">Contributors</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">500K+</div>
                <div className="text-sm text-slate-400">Data Points</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">$2M+</div>
                <div className="text-sm text-slate-400">Rewards Paid</div>
              </div>
            </div>
          </div>

          <div className="relative">
            {/* Main visual element */}
            <div className="relative bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-3xl p-8 border border-slate-700/50 shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 rounded-3xl"></div>

              {/* Network visualization mockup */}
              <div className="relative space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white">Network Activity</h3>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-sm text-green-400">Live</span>
                  </div>
                </div>

                {/* Activity feed */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg border border-slate-600/30">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                      <Wifi className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-white">Signal data submitted</div>
                      <div className="text-xs text-slate-400">San Francisco, CA • 2 min ago</div>
                    </div>
                    <div className="text-sm font-semibold text-green-400">+5 MAP</div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg border border-slate-600/30">
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center">
                      <Users className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-white">New contributor joined</div>
                      <div className="text-xs text-slate-400">Tokyo, Japan • 5 min ago</div>
                    </div>
                    <div className="text-sm font-semibold text-blue-400">+1 User</div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg border border-slate-600/30">
                    <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center">
                      <TrendingUp className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-white">Coverage expanded</div>
                      <div className="text-xs text-slate-400">London, UK • 8 min ago</div>
                    </div>
                    <div className="text-sm font-semibold text-purple-400">+2.3%</div>
                  </div>
                </div>

                {/* Map placeholder */}
                <div className="h-48 bg-gradient-to-br from-slate-700 to-slate-800 rounded-lg flex items-center justify-center border border-slate-600/30">
                  <div className="text-center">
                    <Globe className="h-12 w-12 text-slate-400 mx-auto mb-2" />
                    <div className="text-sm text-slate-400">Interactive Network Map</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating elements */}
            <div className="absolute -top-4 -right-4 w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center shadow-lg animate-bounce">
              <TrendingUp className="h-8 w-8 text-white" />
            </div>
            <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center shadow-lg animate-bounce" style={{ animationDelay: '1s' }}>
              <Wifi className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
