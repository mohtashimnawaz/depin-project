'use client'

import dynamic from 'next/dynamic'
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
  userLocation?: { lat: number; lng: number }
}

// Lazy load the interactive map to avoid SSR issues
const InteractiveMap = dynamic(() => import('@/components/interactive-map').then(mod => ({ default: mod.InteractiveMap })), {
  ssr: false,
  loading: () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="h-5 w-5" />
          Interactive Network Map
        </CardTitle>
        <CardDescription>
          Real-time DePIN network activity
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </CardContent>
    </Card>
  )
})

export function MapVisualization({ isLoading = false, userLocation }: MapVisualizationProps) {
  return <InteractiveMap isLoading={isLoading} userLocation={userLocation} />
}