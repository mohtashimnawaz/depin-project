'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  MapPin,
  Users,
  Coins,
  TrendingUp,
  Globe,
  Zap,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react'

import StatCard from '@/components/stat-card'

export function QuickStats() {
  const stats = [
    {
      title: 'Active Nodes',
      value: '9,234',
      change: '+12%',
      changeType: 'positive',
      icon: Zap,
      color: 'from-green-500 to-emerald-500',
      bgColor: 'from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20'
    },
    {
      title: 'Global Coverage',
      value: '78.5%',
      change: '+2.3%',
      changeType: 'positive',
      icon: Globe,
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20'
    },
    {
      title: 'Total Rewards',
      value: '2.8M MAP',
      change: '+18%',
      changeType: 'positive',
      icon: Coins,
      color: 'from-yellow-500 to-orange-500',
      bgColor: 'from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20'
    },
    {
      title: 'Contributors',
      value: '12,847',
      change: '+5.7%',
      changeType: 'positive',
      icon: Users,
      color: 'from-purple-500 to-pink-500',
      bgColor: 'from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20'
    }
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
      {stats.map((stat, index) => {
        const Icon = stat.icon
        const ChangeIcon = stat.changeType === 'positive' ? ArrowUpRight : ArrowDownRight

        return (
          <Card
            key={stat.title}
            className={`group relative overflow-hidden bg-gradient-to-br ${stat.bgColor} border-0 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-1 animate-fade-in-scale`}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent dark:from-white/5 dark:to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color} shadow-lg`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <Badge
                  variant={stat.changeType === 'positive' ? 'default' : 'destructive'}
                  className={`flex items-center gap-1 ${
                    stat.changeType === 'positive'
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                      : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                  }`}
                >
                  <ChangeIcon className="h-3 w-3" />
                  {stat.change}
                </Badge>
              </div>
            </CardHeader>

            <CardContent>
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                <p className="text-2xl lg:text-3xl font-bold text-foreground">{stat.value}</p>
              </div>
            </CardContent>

            {/* Animated shine effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out"></div>
          </Card>
        )
      })}
    </div>
  )
}