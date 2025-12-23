'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { 
  User, 
  Calendar, 
  Trophy, 
  Clock, 
  Loader2,
  TrendingUp,
  Award
} from 'lucide-react'

interface UserStats {
  totalSubmissions: number
  dailySubmissions: number
  totalRewardsEarned: number
  mapBalance: number
  lastSubmissionTime?: Date
  pendingVerification: boolean
}

interface UserStatsCardProps {
  userStats: UserStats | null
  isLoading: boolean
}

export function UserStatsCard({ userStats, isLoading }: UserStatsCardProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            User Statistics
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    )
  }

  if (!userStats) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            User Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-4">
            No statistics available
          </p>
        </CardContent>
      </Card>
    )
  }

  // Calculate user level based on total submissions
  const getUserLevel = (submissions: number) => {
    if (submissions >= 1000) return { level: 'Diamond', color: 'bg-blue-500' }
    if (submissions >= 500) return { level: 'Gold', color: 'bg-yellow-500' }
    if (submissions >= 100) return { level: 'Silver', color: 'bg-gray-400' }
    if (submissions >= 25) return { level: 'Bronze', color: 'bg-orange-600' }
    return { level: 'Rookie', color: 'bg-green-500' }
  }

  const userLevel = getUserLevel(userStats.totalSubmissions)
  const dailyProgress = (userStats.dailySubmissions / 24) * 100
  const nextLevelThreshold = userStats.totalSubmissions >= 1000 ? 1000 : 
                            userStats.totalSubmissions >= 500 ? 1000 :
                            userStats.totalSubmissions >= 100 ? 500 :
                            userStats.totalSubmissions >= 25 ? 100 : 25
  const levelProgress = (userStats.totalSubmissions / nextLevelThreshold) * 100

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          User Statistics
        </CardTitle>
        <CardDescription>
          Your contribution to the DePIN network
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* User Level */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${userLevel.color}`} />
            <div>
              <div className="font-semibold">{userLevel.level} Contributor</div>
              <div className="text-sm text-muted-foreground">
                {userStats.totalSubmissions} total submissions
              </div>
            </div>
          </div>
          <Badge variant="secondary" className="flex items-center gap-1">
            <Award className="h-3 w-3" />
            Level {userLevel.level}
          </Badge>
        </div>

        {/* Level Progress */}
        {userStats.totalSubmissions < 1000 && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress to next level</span>
              <span>{userStats.totalSubmissions} / {nextLevelThreshold}</span>
            </div>
            <Progress value={levelProgress} className="w-full" />
          </div>
        )}

        <Separator />

        {/* Statistics Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              Today's Progress
            </div>
            <div className="text-2xl font-bold">{userStats.dailySubmissions}</div>
            <div className="text-xs text-muted-foreground">/ 24 submissions</div>
            <Progress value={dailyProgress} className="w-full h-2" />
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Trophy className="h-4 w-4" />
              Total Rewards
            </div>
            <div className="text-2xl font-bold">{userStats.totalRewardsEarned}</div>
            <div className="text-xs text-muted-foreground">MAP tokens earned</div>
          </div>
        </div>

        <Separator />

        {/* Recent Activity */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Clock className="h-4 w-4" />
            Recent Activity
          </div>
          
          <div className="space-y-2">
            {userStats.lastSubmissionTime ? (
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Last submission:</span>
                <span>{userStats.lastSubmissionTime.toLocaleString()}</span>
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">
                No recent submissions
              </div>
            )}

            {userStats.pendingVerification && (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-yellow-500" />
                <span className="text-sm">Verification in progress...</span>
              </div>
            )}
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="bg-muted/50 rounded-lg p-4 space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium">
            <TrendingUp className="h-4 w-4" />
            Performance
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-muted-foreground">Avg. Daily</div>
              <div className="font-semibold">
                {userStats.totalSubmissions > 0 ? 
                  Math.round(userStats.totalSubmissions / Math.max(1, Math.ceil(userStats.totalSubmissions / 30))) : 0
                } submissions
              </div>
            </div>
            <div>
              <div className="text-muted-foreground">Success Rate</div>
              <div className="font-semibold">
                {userStats.totalSubmissions > 0 ? 
                  Math.round((userStats.totalRewardsEarned / (userStats.totalSubmissions * 5)) * 100) : 0
                }%
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}