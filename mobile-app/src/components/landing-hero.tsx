'use client'

import Link from 'next/link'
import { Button } from './ui/button'
import { AppHero } from './app-hero'
import React from 'react'
import { MapPin, Globe, Users, Wifi, TrendingUp, Shield, Zap } from 'lucide-react'

export default function LandingHero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-950">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-indigo-400/20 to-cyan-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-violet-400/10 to-pink-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }}></div>
      </div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-20 lg:py-32">
        <AppHero
          title={
            <span className="text-5xl md:text-6xl lg:text-7xl font-extrabold leading-tight bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 dark:from-white dark:via-blue-100 dark:to-indigo-100 bg-clip-text text-transparent">
              Build and earn on the{' '}
              <span className="relative">
                DePIN Network
                <div className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
              </span>
            </span>
          }
          subtitle={
            <p className="max-w-3xl mx-auto text-lg md:text-xl text-slate-600 dark:text-slate-300 leading-relaxed">
              Contribute WiFi signal data, help grow decentralized physical infrastructure, and earn{' '}
              <span className="font-semibold text-blue-600 dark:text-blue-400">MAP tokens</span>.
              Connect your wallet and start contributing today.
            </p>
          }
        >
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button asChild size="lg" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 px-8 py-4 text-lg font-semibold">
              <Link href="/depin" aria-label="Get started" className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Get Started
              </Link>
            </Button>
            <Button variant="outline" asChild size="lg" className="border-2 border-slate-300 dark:border-slate-600 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/50 transition-all duration-300 px-8 py-4 text-lg font-semibold">
              <Link href="/depin" aria-label="Explore network" className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Explore Network
              </Link>
            </Button>
          </div>
        </AppHero>

        {/* Enhanced feature cards */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="group relative p-8 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-white/20 dark:border-slate-700/20">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <MapPin className="h-6 w-6 text-white" />
              </div>
              <div className="text-left">
                <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Prove Coverage</h4>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">Submit verified location & signal data to expand network coverage and earn valuable MAP tokens.</p>
              </div>
            </div>
          </div>

          <div className="group relative p-8 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-white/20 dark:border-slate-700/20">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                <Globe className="h-6 w-6 text-white" />
              </div>
              <div className="text-left">
                <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Global Network</h4>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">View real-time coverage maps and track how your contributions impact the global DePIN ecosystem.</p>
              </div>
            </div>
          </div>

          <div className="group relative p-8 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-white/20 dark:border-slate-700/20">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <div className="text-left">
                <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Earn Rewards</h4>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">Track your MAP earnings, climb leaderboards, and maximize rewards through consistent contributions.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats section */}
        <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">10K+</div>
            <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">Active Contributors</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">500K+</div>
            <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">Data Points</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">50+</div>
            <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">Countries</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">2M+</div>
            <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">MAP Tokens Earned</div>
          </div>
        </div>
      </div>
    </section>
  )
}
