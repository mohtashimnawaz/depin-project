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
  TrendingUp
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
      <div className="hero py-[64px]">
        <div className="hero-content text-center">
          <div className="max-w-md">
            <h1 className="text-5xl font-bold">DePIN Network</h1>
            <p className="py-6">
              Connect your wallet to start earning MAP tokens by contributing to the decentralized physical infrastructure network.
            </p>
            <div className="flex flex-col items-center gap-3">
              <div className="flex justify-center">
                <div className="wallet-dropdown" />
              </div>
              {/** If there is a selected wallet provided by the wallet UI, try auto-connecting quietly */}
              {selectedWallet ? <AutoConnector wallet={selectedWallet} /> : wallets?.length === 1 ? <AutoConnector wallet={wallets[0]} /> : null}

              {/** Manual reconnect button for debugging */}
              {selectedWallet ? (
                <div className="mt-3 text-sm text-muted-foreground">
                  <button
                    className="underline"
                    onClick={async () => {
                      try {
                        const { connect } = useWalletUiWallet({ wallet: selectedWallet })
                        await connect()
                      } catch (err) {
                        console.error('Manual reconnect failed:', err)
                      }
                    }}
                  >
                    Reconnect
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Connected but account may still be initializing
  if (connected && !account) {
    return (
      <div className="hero py-[64px]">
        <div className="hero-content text-center">
          <div className="max-w-md">
            <h2 className="text-2xl font-semibold">Connecting to wallet...</h2>
            <p className="py-4 text-muted-foreground">Please wait a moment while we fetch your account details.</p>
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

  return (
    <div>
      <AppHero 
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
            <MapVisualization isLoading={isLoading} />
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