'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { 
  Coins, 
  TrendingUp, 
  Gift, 
  Loader2,
  ArrowUpRight,
  Wallet,
  Star
} from 'lucide-react'

interface RewardsCardProps {
  totalRewards: number
  mapBalance: number
  isLoading: boolean
}

export function RewardsCard({ totalRewards, mapBalance, isLoading }: RewardsCardProps) {
  // Calculate reward tiers and bonuses
  const getRewardTier = (totalRewards: number) => {
    if (totalRewards >= 5000) return { tier: 'Platinum', multiplier: 1.5, color: 'text-purple-500' }
    if (totalRewards >= 2000) return { tier: 'Gold', multiplier: 1.3, color: 'text-yellow-500' }
    if (totalRewards >= 500) return { tier: 'Silver', multiplier: 1.2, color: 'text-gray-500' }
    if (totalRewards >= 100) return { tier: 'Bronze', multiplier: 1.1, color: 'text-orange-500' }
    return { tier: 'Starter', multiplier: 1.0, color: 'text-green-500' }
  }

  const rewardTier = getRewardTier(totalRewards)
  const nextTierThreshold = totalRewards >= 5000 ? 5000 : 
                           totalRewards >= 2000 ? 5000 :
                           totalRewards >= 500 ? 2000 :
                           totalRewards >= 100 ? 500 : 100

  const estimatedValue = mapBalance * 0.1 // Assuming 1 MAP = $0.10 for demo

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Coins className="h-5 w-5" />
            Rewards & Earnings
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Coins className="h-5 w-5" />
          Rewards & Earnings
        </CardTitle>
        <CardDescription>
          Track your MAP token rewards and earnings
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Balance */}
        <div className="text-center space-y-2">
          <div className="text-3xl font-bold flex items-center justify-center gap-2">
            <Coins className="h-8 w-8 text-yellow-500" />
            {mapBalance.toFixed(2)}
          </div>
          <div className="text-sm text-muted-foreground">MAP Tokens</div>
          <div className="text-xs text-muted-foreground">
            ≈ ${estimatedValue.toFixed(2)} USD
          </div>
        </div>

        <Separator />

        {/* Reward Tier */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Star className={`h-4 w-4 ${rewardTier.color}`} />
              <span className="font-medium">{rewardTier.tier} Tier</span>
            </div>
            <Badge variant="secondary">
              {rewardTier.multiplier}x multiplier
            </Badge>
          </div>
          
          {totalRewards < 5000 && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Progress to next tier</span>
                <span>{totalRewards} / {nextTierThreshold}</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(totalRewards / nextTierThreshold) * 100}%` }}
                />
              </div>
            </div>
          )}
        </div>

        <Separator />

        {/* Earnings Summary */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <TrendingUp className="h-4 w-4" />
              Total Earned
            </div>
            <div className="text-xl font-bold">{totalRewards}</div>
            <div className="text-xs text-muted-foreground">MAP tokens</div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Gift className="h-4 w-4" />
              Next Reward
            </div>
            <div className="text-xl font-bold">5</div>
            <div className="text-xs text-muted-foreground">MAP tokens</div>
          </div>
        </div>

        {/* Reward Breakdown */}
        <div className="bg-muted/50 rounded-lg p-4 space-y-3">
          <div className="text-sm font-medium">Reward Breakdown</div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Base reward per submission:</span>
              <span>5 MAP</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tier multiplier:</span>
              <span className={rewardTier.color}>{rewardTier.multiplier}x</span>
            </div>
            <div className="flex justify-between font-medium">
              <span>Effective reward:</span>
              <span>{(5 * rewardTier.multiplier).toFixed(1)} MAP</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2">
          <Button variant="outline" className="w-full" disabled>
            <Wallet className="h-4 w-4 mr-2" />
            Withdraw Tokens
            <span className="ml-auto text-xs text-muted-foreground">Coming Soon</span>
          </Button>
          
          <Button variant="ghost" className="w-full" disabled>
            <ArrowUpRight className="h-4 w-4 mr-2" />
            View on Explorer
          </Button>
        </div>

        {/* Bonus Information */}
        <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-3 space-y-2">
          <div className="text-sm font-medium text-blue-700 dark:text-blue-300">
            💡 Earning Tips
          </div>
          <ul className="text-xs text-blue-600 dark:text-blue-400 space-y-1">
            <li>• Submit activities consistently to maintain your tier</li>
            <li>• Higher tiers earn bonus multipliers on rewards</li>
            <li>• Verified submissions earn full rewards</li>
            <li>• Daily limit: 24 submissions (120 MAP max/day)</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}