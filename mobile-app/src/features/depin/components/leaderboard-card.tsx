'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { 
  Trophy, 
  Medal, 
  Award,
  Loader2,
  Crown,
  Search,
  ChevronLeft,
  ChevronRight
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
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // Mock leaderboard data - expanded
  const allLeaderboard: LeaderboardEntry[] = [
    { rank: 1, address: '7nMrAY8nNgHcyAimQJgrzM5LisT2jVaNRX2s6hvnNsxU', submissions: 2847, rewards: 14235, tier: 'Platinum' },
    { rank: 2, address: '8kJfGnxvQqQkL9mNpRtX3vBzY2wE4rTyUiOpAsDfGhJk', submissions: 2156, rewards: 10780, tier: 'Gold' },
    { rank: 3, address: '9pLmKjHgFdSaQwErTyUiOpAsDfGhJk8kJfGnxvQqQkL9', submissions: 1923, rewards: 9615, tier: 'Gold' },
    { rank: 4, address: 'AqBnCdEfGhIjKlMnOpQrStUvWxYz1234567890AbCdEf', submissions: 1687, rewards: 8435, tier: 'Silver' },
    { rank: 5, address: 'BrCsEtFuGvHwIxJyKzLaMbNcOdPeQfRgShTiUjVkWlXm', submissions: 1534, rewards: 7670, tier: 'Silver' },
    { rank: 6, address: 'CdEfGhIjKlMnOpQrStUvWxYz1234567890AbCdEfGhIjK', submissions: 1423, rewards: 7115, tier: 'Silver' },
    { rank: 7, address: 'EfGhIjKlMnOpQrStUvWxYz1234567890AbCdEfGhIjKlM', submissions: 1312, rewards: 6560, tier: 'Bronze' },
    { rank: 8, address: 'GhIjKlMnOpQrStUvWxYz1234567890AbCdEfGhIjKlMnO', submissions: 1201, rewards: 6005, tier: 'Bronze' },
    { rank: 9, address: 'IjKlMnOpQrStUvWxYz1234567890AbCdEfGhIjKlMnOpQ', submissions: 1090, rewards: 5450, tier: 'Bronze' },
    { rank: 10, address: 'KlMnOpQrStUvWxYz1234567890AbCdEfGhIjKlMnOpQrS', submissions: 979, rewards: 4895, tier: 'Bronze' },
    { rank: 11, address: 'MnOpQrStUvWxYz1234567890AbCdEfGhIjKlMnOpQrStU', submissions: 868, rewards: 4340, tier: 'Bronze' },
    { rank: 12, address: 'OpQrStUvWxYz1234567890AbCdEfGhIjKlMnOpQrStUvW', submissions: 757, rewards: 3785, tier: 'Bronze' },
    { rank: 13, address: 'QrStUvWxYz1234567890AbCdEfGhIjKlMnOpQrStUvWxY', submissions: 646, rewards: 3230, tier: 'Bronze' },
    { rank: 14, address: 'StUvWxYz1234567890AbCdEfGhIjKlMnOpQrStUvWxYz1', submissions: 535, rewards: 2675, tier: 'Bronze' },
    { rank: 15, address: 'UvWxYz1234567890AbCdEfGhIjKlMnOpQrStUvWxYz123', submissions: 424, rewards: 2120, tier: 'Bronze' },
  ]

  // Filter and search
  const filteredLeaderboard = useMemo(() => {
    return allLeaderboard.filter(entry =>
      entry.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.tier.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [allLeaderboard, searchTerm])

  // Pagination
  const totalPages = Math.ceil(filteredLeaderboard.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedLeaderboard = filteredLeaderboard.slice(startIndex, startIndex + itemsPerPage)

  // Find user's rank
  const userRank = userAddress ? filteredLeaderboard.findIndex(entry => entry.address === userAddress) + 1 : null

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
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by address or tier..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value)
              setCurrentPage(1) // Reset to first page on search
            }}
            className="pl-10"
          />
        </div>

        {/* User's Rank (if connected) */}
        {userAddress && userRank && userRank > 0 && (
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

        {/* Leaderboard List */}
        <div className="space-y-3">
          {paginatedLeaderboard.map((entry) => (
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

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="text-sm text-muted-foreground">
              Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredLeaderboard.length)} of {filteredLeaderboard.length} entries
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <span className="text-sm">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}