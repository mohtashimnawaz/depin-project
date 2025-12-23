'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Globe, 
  Users, 
  MapPin, 
  TrendingUp, 
  Zap,
  Loader2
} from 'lucide-react'

interface NetworkStatsCardProps {
  isLoading?: boolean
}

export function NetworkStatsCard({ isLoading = false }: NetworkStatsCardProps) {
  // Mock network statistics
  const networkStats = {
    totalNodes: 12847,
    activeNodes: 9234,
    totalRewards: 2847392,
    coverage: 78.5,
    dailyGrowth: 2.3
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Network Statistics
          </CardTitle>
          <CardDescription>
            Real-time DePIN network metrics
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
          <Globe className="h-5 w-5" />
          Network Statistics
        </CardTitle>
        <CardDescription>
          Real-time DePIN network metrics
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Total Nodes */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-blue-500" />
            <span className="text-sm font-medium">Total Nodes</span>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold">{networkStats.totalNodes.toLocaleString()}</div>
            <Badge variant="secondary" className="text-xs">
              <TrendingUp className="h-3 w-3 mr-1" />
              +{networkStats.dailyGrowth}%
            </Badge>
          </div>
        </div>

        {/* Active Nodes */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-green-500" />
            <span className="text-sm font-medium">Active Nodes</span>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold">{networkStats.activeNodes.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">
              {((networkStats.activeNodes / networkStats.totalNodes) * 100).toFixed(1)}% online
            </div>
          </div>
        </div>

        {/* Network Coverage */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-purple-500" />
              <span className="text-sm font-medium">Global Coverage</span>
            </div>
            <span className="text-sm font-bold">{networkStats.coverage}%</span>
          </div>
          <Progress value={networkStats.coverage} className="h-2" />
        </div>

        {/* Total Rewards Distributed */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Total Rewards</span>
          <div className="text-right">
            <div className="text-lg font-bold">{networkStats.totalRewards.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">MAP tokens</div>
          </div>
        </div>

        {/* Network Health */}
        <div className="pt-4 border-t">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Network Health</span>
            <Badge variant="default" className="bg-green-500">
              Excellent
            </Badge>
          </div>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="text-center">
              <div className="font-semibold">99.8%</div>
              <div className="text-muted-foreground">Uptime</div>
            </div>
            <div className="text-center">
              <div className="font-semibold">1.2s</div>
              <div className="text-muted-foreground">Avg Response</div>
            </div>
            <div className="text-center">
              <div className="font-semibold">0.02%</div>
              <div className="text-muted-foreground">Error Rate</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

