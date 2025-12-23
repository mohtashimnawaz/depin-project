'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  MapPin, 
  Users, 
  Coins, 
  TrendingUp,
  Globe,
  Zap
} from 'lucide-react'

export function QuickStats() {
  const stats = [
    {
      title: 'Active Nodes',
      value: '9,234',
      change: '+12%',
      icon: Zap,
      color: 'text-green-500'
    },
    {
      title: 'Global Coverage',
      value: '78.5%',
      change: '+2.3%',
      icon: Globe,
      color: 'text-blue-500'
    },
    {
      title: 'Total Rewards',
      value: '2.8M MAP',
      change: '+18%',
      icon: Coins,
      color: 'text-yellow-500'
    },
    {
      title: 'Contributors',
      value: '12,847',
      change: '+5.7%',
      icon: Users,
      color: 'text-purple-500'
    }
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {stats.map((stat) => {
        const Icon = stat.icon
        return (
          <Card key={stat.title}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <Badge variant="secondary" className="text-xs mt-1">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    {stat.change}
                  </Badge>
                </div>
                <Icon className={`h-8 w-8 ${stat.color}`} />
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}