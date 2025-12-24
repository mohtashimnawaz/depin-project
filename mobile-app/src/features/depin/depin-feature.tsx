'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { AppHero } from '@/components/app-hero'
import { NotificationBanner } from '@/components/notification-banner'
import { useSolana } from '@/components/solana/use-solana'
import { useWalletUi, useWalletUiWallet } from '@wallet-ui/react'
import { 
  MapPin, 
  Wifi, 
  Clock, 
  Coins, 
  Activity, 
  CheckCircle, 
  XCircle, 
  Loader2,
  AlertTriangle,
  TrendingUp,
  Globe,
  Users
} from 'lucide-react'
import { useDepinClient } from './hooks/use-depin-client'
import { ActivitySubmissionForm } from './components/activity-submission-form'
import { UserStatsCard } from './components/user-stats-card'
import { RecentActivitiesCard } from './components/recent-activities-card'
import { RewardsCard } from './components/rewards-card'
import { NetworkStatsCard } from './components/network-stats-card'
import { LeaderboardCard } from './components/leaderboard-card'
import { MapVisualization } from './components/map-visualization'

export default function DepinFeature() {
  const { account, connected } = useSolana()
  const { 
    client, 
    userStats, 
    canSubmit, 
    isLoading, 
    submitActivity, 
    refreshData 
  } = useDepinClient()

  const [isSubmitting, setIsSubmitting] = useState(false)

  // Auto-refresh data every 30 seconds
  useEffect(() => {
    if (!account) return
    
    const interval = setInterval(() => {
      refreshData()
    }, 30000)

    return () => clearInterval(interval)
  }, [account, refreshData])

  // Debugging: log wallet state to console so we can see if it's connected and what the account object looks like
  useEffect(() => {
    console.debug('useSolana wallet state:', { connected, account })
  }, [connected, account])

  // Small auto-connector subcomponent: triggers `connect()` for the provided wallet once
  function AutoConnector({ wallet }: { wallet: any }) {
    const { connect } = useWalletUiWallet({ wallet })
    useEffect(() => {
      let cancelled = false
      async function attempt() {
        try {
          // Try to connect once automatically. If the user has previously authorized, this should be quick.
          await connect()
        } catch (err) {
          // ignore errors (user closed popup or denied)
          if (!cancelled) console.debug('Auto connect failed:', err)
        }
      }
      attempt()
      return () => {
        cancelled = true
      }
    }, [connect])

    return null
  }

  // Expose a small debug reconnect UI while we stabilize wallet connection
  const walletUi = useWalletUi()
  const { wallets, wallet: selectedWallet } = walletUi

  // If wallet isn't connected, show the connect prompt (and auto-attempt if a wallet was previously selected)
  if (!connected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-950">
        {/* Animated background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-tr from-indigo-400/20 to-cyan-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>

        <div className="relative flex items-center justify-center min-h-screen px-4">
          <div className="max-w-md w-full">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-2xl mb-6 animate-float">
                <Globe className="h-10 w-10 text-white" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent mb-4">
                DePIN Network
              </h1>
              <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
                Connect your wallet to start earning MAP tokens by contributing to the decentralized physical infrastructure network.
              </p>
            </div>

            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-white/20 dark:border-slate-700/20">
              <div className="flex flex-col items-center gap-6">
                <div className="flex justify-center w-full">
                  <div className="wallet-dropdown" />
                </div>

                {/* Feature highlights */}
                <div className="grid grid-cols-1 gap-4 w-full text-left">
                  <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-100 dark:border-blue-800/30">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                      <MapPin className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <div className="font-medium text-slate-900 dark:text-white">Submit Location Data</div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">Earn rewards for verified coverage</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-100 dark:border-green-800/30">
                    <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center flex-shrink-0">
                      <TrendingUp className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <div className="font-medium text-slate-900 dark:text-white">Track Earnings</div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">Monitor your MAP token rewards</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-purple-50 dark:bg-purple-950/30 rounded-lg border border-purple-100 dark:border-purple-800/30">
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Users className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <div className="font-medium text-slate-900 dark:text-white">Join Community</div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">Climb the global leaderboard</div>
                    </div>
                  </div>
                </div>

                {/** If there is a selected wallet provided by the wallet UI, try auto-connecting quietly */}
                {selectedWallet ? <AutoConnector wallet={selectedWallet} /> : wallets?.length === 1 ? <AutoConnector wallet={wallets[0]} /> : null}

                {/** Manual reconnect button for debugging */}
                {selectedWallet ? (
                  <div className="mt-4 text-center">
                    <button
                      className="text-sm text-slate-500 dark:text-slate-400 underline hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
                      onClick={async () => {
                        try {
                          const { connect } = useWalletUiWallet({ wallet: selectedWallet })
                          await connect()
                        } catch (err) {
                          console.error('Manual reconnect failed:', err)
                        }
                      }}
                    >
                      Having trouble? Try reconnecting
                    </button>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Connected but account may still be initializing
  if (connected && !account) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-950 flex items-center justify-center px-4">
        {/* Animated background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-blue-400/20 via-purple-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse"></div>
        </div>

        <div className="relative text-center max-w-md">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-2xl mb-6">
            <div className="relative">
              <Loader2 className="h-10 w-10 text-white animate-spin" />
              <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full animate-ping opacity-20"></div>
            </div>
          </div>

          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Connecting to wallet...</h2>
          <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed mb-8">
            Please wait a moment while we fetch your account details and initialize your dashboard.
          </p>

          <div className="flex justify-center space-x-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>
      </div>
    )
  }

  // Debug: render the account address (temporary) at the top of the page for visibility
  const accountAddress = account?.address?.toString ? account.address.toString() : account?.address || null

  const handleActivitySubmit = async (activityData: {
    gpsLat: number
    gpsLong: number
    signalStrength: number
  }) => {
    setIsSubmitting(true)
    try {
      await submitActivity(activityData)
      await refreshData()
    } catch (error) {
      console.error('Failed to submit activity:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRetry = () => {
    // Reset submission state and refresh data
    setIsSubmitting(false)
    refreshData()
  }

  return (
    <div>
      <AppHero 
        variant="depin"
        title="DePIN Network" 
        subtitle="Earn MAP tokens by contributing WiFi signal data to the decentralized network"
      >
      </AppHero>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <NotificationBanner />
        
        {/* Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Submissions</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : userStats?.totalSubmissions || 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Daily Submissions</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : userStats?.dailySubmissions || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                / 24 daily limit
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">MAP Balance</CardTitle>
              <Coins className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : userStats?.mapBalance?.toFixed(2) || '0.00'}
              </div>
              <p className="text-xs text-muted-foreground">
                MAP tokens
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Status</CardTitle>
              {userStats?.pendingVerification ? (
                <Loader2 className="h-4 w-4 text-yellow-500 animate-spin" />
              ) : canSubmit?.canSubmit ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <XCircle className="h-4 w-4 text-red-500" />
              )}
            </CardHeader>
            <CardContent>
              <div className="text-sm font-medium">
                {userStats?.pendingVerification ? (
                  <Badge variant="secondary">Verifying</Badge>
                ) : canSubmit?.canSubmit ? (
                  <Badge variant="default">Ready</Badge>
                ) : (
                  <Badge variant="destructive">Cooldown</Badge>
                )}
              </div>
              {!canSubmit?.canSubmit && canSubmit?.nextSubmissionTime && (
                <p className="text-xs text-muted-foreground mt-1">
                  Next: {canSubmit.nextSubmissionTime.toLocaleTimeString()}
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Activity Submission */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Submit Activity
                </CardTitle>
                <CardDescription>
                  Share your location and WiFi signal strength to earn MAP tokens
                </CardDescription>
              </CardHeader>
              <CardContent>
                {canSubmit?.canSubmit ? (
                  <ActivitySubmissionForm 
                    onSubmit={handleActivitySubmit}
                    isSubmitting={isSubmitting}
                    onRetry={handleRetry}
                  />
                ) : (
                  <div className="text-center py-8">
                    <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Submission Not Available</h3>
                    <p className="text-muted-foreground mb-4">
                      {canSubmit?.reason || 'Please wait before submitting again'}
                    </p>
                    {canSubmit?.nextSubmissionTime && (
                      <p className="text-sm text-muted-foreground">
                        Next submission available at: {canSubmit.nextSubmissionTime.toLocaleString()}
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            <RewardsCard 
              totalRewards={userStats?.totalRewardsEarned || 0}
              mapBalance={userStats?.mapBalance || 0}
              isLoading={isLoading}
            />
          </div>

          {/* User Stats & Recent Activity */}
          <div className="space-y-6">
            <UserStatsCard 
              userStats={userStats}
              isLoading={isLoading}
            />

            <RecentActivitiesCard 
              userAddress={account.address.toString()}
              isLoading={isLoading}
            />
          </div>
        </div>

        {/* Daily Progress */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Daily Progress
            </CardTitle>
            <CardDescription>
              Track your daily contribution to the DePIN network
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span>Daily Submissions</span>
                <span>{userStats?.dailySubmissions || 0} / 24</span>
              </div>
              <Progress 
                value={((userStats?.dailySubmissions || 0) / 24) * 100} 
                className="w-full"
              />
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Potential Daily Earnings:</span>
                  <div className="font-semibold">120 MAP tokens</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Today's Earnings:</span>
                  <div className="font-semibold">{(userStats?.dailySubmissions || 0) * 5} MAP tokens</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Network Overview Section */}
        <div className="mt-12">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-2">Network Overview</h2>
            <p className="text-muted-foreground">
              Explore the global DePIN network and see how you compare with other contributors
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <NetworkStatsCard isLoading={isLoading} />
            <MapVisualization 
              isLoading={isLoading} 
              userLocation={account ? { lat: 37.7749, lng: -122.4194 } : undefined} // Mock user location
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-1 gap-8">
            <LeaderboardCard 
              userAddress={account?.address.toString()} 
              isLoading={isLoading} 
            />
          </div>
        </div>
      </div>
    </div>
  )
}