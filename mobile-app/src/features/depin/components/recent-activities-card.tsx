'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { 
  Activity, 
  MapPin, 
  Wifi, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Loader2,
  RefreshCw,
  ExternalLink
} from 'lucide-react'

interface ActivityRecord {
  id: string
  timestamp: Date
  location: {
    lat: number
    lng: number
  }
  signalStrength: number
  status: 'pending' | 'verified' | 'failed'
  reward: number
  txSignature?: string
}

interface RecentActivitiesCardProps {
  userAddress: string
  isLoading: boolean
}

export function RecentActivitiesCard({ userAddress, isLoading }: RecentActivitiesCardProps) {
  const [activities, setActivities] = useState<ActivityRecord[]>([])
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Mock data generation
  const generateMockActivities = (): ActivityRecord[] => {
    const statuses: ('pending' | 'verified' | 'failed')[] = ['pending', 'verified', 'verified', 'verified', 'failed']
    const mockActivities: ActivityRecord[] = []

    for (let i = 0; i < 10; i++) {
      const timestamp = new Date(Date.now() - (i * 2 * 60 * 60 * 1000)) // Every 2 hours
      const status = statuses[Math.floor(Math.random() * statuses.length)]
      
      mockActivities.push({
        id: `activity_${i}`,
        timestamp,
        location: {
          lat: 37.7749 + (Math.random() - 0.5) * 0.1,
          lng: -122.4194 + (Math.random() - 0.5) * 0.1
        },
        signalStrength: Math.floor(Math.random() * 60) - 90, // -30 to -90
        status,
        reward: status === 'verified' ? 5 : 0,
        txSignature: status === 'verified' ? `tx_${Math.random().toString(36).substr(2, 9)}` : undefined
      })
    }

    return mockActivities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
  }

  // Load mock data
  useEffect(() => {
    const mockData = generateMockActivities()
    setActivities(mockData)
  }, [userAddress])

  const refreshActivities = async () => {
    setIsRefreshing(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    const mockData = generateMockActivities()
    setActivities(mockData)
    setIsRefreshing(false)
  }

  const getStatusIcon = (status: ActivityRecord['status']) => {
    switch (status) {
      case 'verified':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'pending':
        return <Loader2 className="h-4 w-4 text-yellow-500 animate-spin" />
    }
  }

  const getStatusBadge = (status: ActivityRecord['status']) => {
    switch (status) {
      case 'verified':
        return <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Verified</Badge>
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>
    }
  }

  const formatLocation = (lat: number, lng: number) => {
    return `${lat.toFixed(4)}, ${lng.toFixed(4)}`
  }

  const getSignalQuality = (strength: number) => {
    if (strength > -50) return { label: 'Excellent', color: 'text-green-600' }
    if (strength > -70) return { label: 'Good', color: 'text-blue-600' }
    if (strength > -85) return { label: 'Fair', color: 'text-yellow-600' }
    return { label: 'Poor', color: 'text-red-600' }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Recent Activities
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
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Recent Activities
            </CardTitle>
            <CardDescription>
              Your latest submissions and their verification status
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={refreshActivities}
            disabled={isRefreshing}
          >
            {isRefreshing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <div className="text-center py-8">
            <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Activities Yet</h3>
            <p className="text-muted-foreground">
              Submit your first activity to start earning MAP tokens
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {activities.slice(0, 5).map((activity, index) => (
              <div key={activity.id}>
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    {getStatusIcon(activity.status)}
                  </div>
                  
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">
                          Activity #{activities.length - index}
                        </span>
                        {getStatusBadge(activity.status)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {activity.timestamp.toLocaleString()}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-3 w-3 text-muted-foreground" />
                        <span className="text-muted-foreground">Location:</span>
                        <span className="font-mono text-xs">
                          {formatLocation(activity.location.lat, activity.location.lng)}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Wifi className="h-3 w-3 text-muted-foreground" />
                        <span className="text-muted-foreground">Signal:</span>
                        <span className={`font-medium ${getSignalQuality(activity.signalStrength).color}`}>
                          {activity.signalStrength} dBm ({getSignalQuality(activity.signalStrength).label})
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm">
                        {activity.status === 'verified' && (
                          <>
                            <span className="text-muted-foreground">Reward:</span>
                            <span className="font-medium text-green-600">+{activity.reward} MAP</span>
                          </>
                        )}
                        {activity.status === 'failed' && (
                          <span className="text-red-600 text-sm">Verification failed</span>
                        )}
                        {activity.status === 'pending' && (
                          <span className="text-yellow-600 text-sm">Awaiting verification...</span>
                        )}
                      </div>
                      
                      {activity.txSignature && (
                        <Button variant="ghost" size="sm" disabled>
                          <ExternalLink className="h-3 w-3 mr-1" />
                          View Tx
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
                
                {index < Math.min(activities.length - 1, 4) && (
                  <Separator className="mt-4" />
                )}
              </div>
            ))}

            {activities.length > 5 && (
              <div className="text-center pt-4">
                <Button variant="outline" size="sm" disabled>
                  View All Activities ({activities.length})
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}