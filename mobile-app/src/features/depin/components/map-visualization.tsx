'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  MapPin, 
  Wifi, 
  Users,
  Loader2,
  Globe
} from 'lucide-react'

interface MapVisualizationProps {
  isLoading?: boolean
}

export function MapVisualization({ isLoading = false }: MapVisualizationProps) {
  // Mock data for different regions
  const regions = [
    { name: 'North America', nodes: 4234, coverage: 85, color: 'bg-blue-500' },
    { name: 'Europe', nodes: 3567, coverage: 78, color: 'bg-green-500' },
    { name: 'Asia Pacific', nodes: 2890, coverage: 72, color: 'bg-purple-500' },
    { name: 'South America', nodes: 1456, coverage: 45, color: 'bg-orange-500' },
    { name: 'Africa', nodes: 700, coverage: 23, color: 'bg-red-500' },
  ]

  // Mock recent activity points
  const recentActivity = [
    { city: 'San Francisco', lat: 37.7749, lng: -122.4194, nodes: 234, signal: -45 },
    { city: 'New York', lat: 40.7128, lng: -74.0060, nodes: 189, signal: -52 },
    { city: 'London', lat: 51.5074, lng: -0.1278, nodes: 156, signal: -48 },
    { city: 'Tokyo', lat: 35.6762, lng: 139.6503, nodes: 203, signal: -41 },
    { city: 'Sydney', lat: -33.8688, lng: 151.2093, nodes: 98, signal: -55 },
  ]

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Network Map
          </CardTitle>
          <CardDescription>
            Global DePIN network coverage
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-center py-8">
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
          Network Map
        </CardTitle>
        <CardDescription>
          Global DePIN network coverage and activity
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Mock World Map Visualization */}
        <div className="relative bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 rounded-lg p-6 h-64 overflow-hidden">
          <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
          
          {/* Simulated map with activity points */}
          <div className="relative h-full flex items-center justify-center">
            <div className="text-center space-y-2">
              <Globe className="h-16 w-16 mx-auto text-primary/60" />
              <p className="text-sm text-muted-foreground">
                Interactive map visualization
              </p>
              <p className="text-xs text-muted-foreground">
                Real-time node activity across {regions.length} regions
              </p>
            </div>
          </div>

          {/* Activity indicators */}
          <div className="absolute top-4 right-4 space-y-1">
            <div className="flex items-center gap-2 text-xs">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>Active Nodes</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>Coverage Areas</span>
            </div>
          </div>
        </div>

        {/* Regional Statistics */}
        <div className="space-y-3">
          <h4 className="font-semibold text-sm">Regional Coverage</h4>
          {regions.map((region) => (
            <div key={region.name} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${region.color}`}></div>
                  <span>{region.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-muted-foreground">
                    {region.nodes} nodes
                  </span>
                  <Badge variant="secondary" className="text-xs">
                    {region.coverage}%
                  </Badge>
                </div>
              </div>
              <div className="w-full bg-muted rounded-full h-1.5">
                <div 
                  className={`h-1.5 rounded-full ${region.color}`}
                  style={{ width: `${region.coverage}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>

        {/* Recent Activity */}
        <div className="space-y-3">
          <h4 className="font-semibold text-sm">Recent Activity</h4>
          <div className="space-y-2">
            {recentActivity.slice(0, 3).map((activity) => (
              <div key={activity.city} className="flex items-center justify-between text-sm p-2 bg-muted/50 rounded">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3 w-3 text-primary" />
                  <span>{activity.city}</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {activity.nodes}
                  </div>
                  <div className="flex items-center gap-1">
                    <Wifi className="h-3 w-3" />
                    {activity.signal}dBm
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}