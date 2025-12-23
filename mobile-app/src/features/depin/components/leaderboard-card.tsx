'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { 
  Trophy, 
  Medal, 
  Award,
  Loader2,
  Crown
} from 'lucide-react'

interface LeaderboardEntry {
  rank: number
  address: string
  submissions: number
  rewards: number
  tier: string
}

interface LeaderboardCardProps {
  userAddress?: string
  isLoading?: boolean
}

export function LeaderboardCard({ userAddress, isLoading = false }: LeaderboardCardProps) {
  // Mock leaderboard data
  const leaderboard: LeaderboardEntry[] = [
    { rank: 1, address: '7nMrAY8nNgHcyAimQJgrzM5LisT2jVaNRX2s6hvnNsxU', submissions: 2847, rewards: 14235, tier: 'Platinum' },
    { rank: 2, address: '8kJfGnxvQqQkL9mNpRtX3vBzY2wE4rTyUiOpAsDfGhJk', submissions: 2156, rewards: 10780, tier: 'Gold' },
    { rank: 3, address: '9pLmKjHgFdSaQwErTyUiOpAsDfGhJk8kJfGnxvQqQkL9', submissions: 1923, rewards: 9615, tier: 'Gold' },
    { rank: 4, address: 'AqBnCdEfGhIjKlMnOpQrStUvWxYz1234567890AbCdEf', submissions: 1687, rewards: 8435, tier: 'Silver' },
    { rank: 5, address: 'BrCsEtFuGvHwIxJyKzLaMbNcOdPeQfRgShTiUjVkWlXm', submissions: 1534, rewards: 7670, tier: 'Silver' },
  ]

  // Find user's rank (mock)
  const userRank = userAddress ? Math.floor(Math.random() * 1000) + 100 : null

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-4 w-4 text-yellow-500" />
      case 2:
        return <Medal className="h-4 w-4 text-gray-400" />
      case 3:
        return <Award className="h-4 w-4 text-amber-600" />
      default:
        return <Trophy className="h-4 w-4 text-muted-foreground" />
    }
  }

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'Platinum':
        return 'bg-purple-500'
      case 'Gold':
        return 'bg-yellow-500'
      case 'Silver':
        return 'bg-gray-400'
      case 'Bronze':
        return 'bg-amber-600'
      default:
        return 'bg-gray-500'
    }
  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Leaderboard
          </CardTitle>
          <CardDescription>
            Top contributors to the DePIN network
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5" />
          Leaderboard
        </CardTitle>
        <CardDescription>
          Top contributors to the DePIN network
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* User's Rank (if connected) */}
        {userAddress && userRank && (
          <div className="p-3 bg-muted rounded-lg border-2 border-primary/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <Trophy className="h-4 w-4 text-primary" />
                  <span className="font-semibold">#{userRank}</span>
                </div>
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="text-xs">YOU</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium text-sm">Your Rank</div>
                  <div className="text-xs text-muted-foreground">
                    {formatAddress(userAddress)}
                  </div>
                </div>
              </div>
              <Badge variant="secondary">
                Keep climbing!
              </Badge>
            </div>
          </div>
        )}

        {/* Top 5 Leaderboard */}
        <div className="space-y-3">
          {leaderboard.map((entry) => (
            <div
              key={entry.rank}
              className={`flex items-center justify-between p-3 rounded-lg ${
                entry.rank <= 3 ? 'bg-gradient-to-r from-muted/50 to-muted/20' : 'bg-muted/30'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  {getRankIcon(entry.rank)}
                  <span className="font-semibold text-sm">#{entry.rank}</span>
                </div>
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="text-xs">
                    {entry.address.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium text-sm">
                    {formatAddress(entry.address)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {entry.submissions} submissions
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold text-sm">
                  {entry.rewards.toLocaleString()} MAP
                </div>
                <Badge 
                  variant="secondary" 
                  className={`text-xs ${getTierColor(entry.tier)} text-white`}
                >
                  {entry.tier}
                </Badge>
              </div>
            </div>
          ))}
        </div>

        {/* View Full Leaderboard */}
        <div className="pt-4 border-t">
          <Button variant="ghost" className="w-full justify-start">
            View Full Leaderboard →
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}