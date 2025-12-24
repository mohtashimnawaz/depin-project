'use client'

import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

type StatCardProps = {
  title: string
  value: React.ReactNode
  change?: string
  icon?: React.ReactNode
  colorClass?: string
  isLoading?: boolean
}

export function StatCard({ title, value, change, icon, colorClass = 'text-primary', isLoading = false }: StatCardProps) {
  return (
    <Card className="p-4">
      <CardContent className="p-2">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-sm font-medium text-muted-foreground">{title}</div>
            <div className="text-2xl font-bold mt-2 flex items-center gap-2">
              {icon ? <span className={cn('opacity-90', colorClass)}>{icon}</span> : null}
              <span>{isLoading ? '—' : value}</span>
            </div>
            {change ? <div className="text-xs text-muted-foreground mt-1">{change}</div> : null}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default StatCard
