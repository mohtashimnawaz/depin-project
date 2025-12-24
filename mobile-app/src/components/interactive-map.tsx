'use client'

import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  MapPin, 
  Wifi, 
  Users,
  Loader2,
  Globe
} from 'lucide-react'
import 'leaflet/dist/leaflet.css'

// Fix for default markers in react-leaflet
import L from 'leaflet'
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

interface ActivityPoint {
  id: string
  lat: number
  lng: number
  signalStrength: number
  timestamp: Date
  user: string
}

interface InteractiveMapProps {
  isLoading?: boolean
  userLocation?: { lat: number; lng: number }
}

export function InteractiveMap({ isLoading = false, userLocation }: InteractiveMapProps) {
  const [activityPoints, setActivityPoints] = useState<ActivityPoint[]>([])
  const [mapCenter, setMapCenter] = useState<[number, number]>([37.7749, -122.4194]) // Default to San Francisco

  // Mock activity points
  useEffect(() => {
    const mockPoints: ActivityPoint[] = [
      { id: '1', lat: 37.7749, lng: -122.4194, signalStrength: -45, timestamp: new Date(), user: 'User1' },
      { id: '2', lat: 40.7128, lng: -74.0060, signalStrength: -52, timestamp: new Date(), user: 'User2' },
      { id: '3', lat: 51.5074, lng: -0.1278, signalStrength: -48, timestamp: new Date(), user: 'User3' },
      { id: '4', lat: 35.6762, lng: 139.6503, signalStrength: -41, timestamp: new Date(), user: 'User4' },
      { id: '5', lat: -33.8688, lng: 151.2093, signalStrength: -55, timestamp: new Date(), user: 'User5' },
    ]
    setActivityPoints(mockPoints)
  }, [])

  // Update map center when user location is provided
  useEffect(() => {
    if (userLocation) {
      setMapCenter([userLocation.lat, userLocation.lng])
    }
  }, [userLocation])

  const getSignalColor = (signal: number) => {
    if (signal > -50) return '#10b981' // green
    if (signal > -70) return '#f59e0b' // yellow
    return '#ef4444' // red
  }

  const getSignalQuality = (signal: number) => {
    if (signal > -50) return 'Excellent'
    if (signal > -70) return 'Good'
    return 'Poor'
  }

  if (isLoading) {
    return (
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
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="h-5 w-5" />
          Interactive Network Map
        </CardTitle>
        <CardDescription>
          Real-time DePIN network activity and coverage
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="h-96 rounded-lg overflow-hidden border">
          <MapContainer
            center={mapCenter}
            zoom={3}
            style={{ height: '100%', width: '100%' }}
            zoomControl={true}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            {/* Activity points */}
            {activityPoints.map((point) => (
              <div key={point.id}>
                <Marker position={[point.lat, point.lng]}>
                  <Popup>
                    <div className="space-y-2">
                      <div className="font-semibold">Activity Point</div>
                      <div className="text-sm">
                        <div>Signal: {point.signalStrength} dBm</div>
                        <div>Quality: {getSignalQuality(point.signalStrength)}</div>
                        <div>User: {point.user}</div>
                        <div>Time: {point.timestamp.toLocaleString()}</div>
                      </div>
                    </div>
                  </Popup>
                </Marker>
                <Circle
                  center={[point.lat, point.lng]}
                  radius={50000} // 50km radius
                  pathOptions={{
                    color: getSignalColor(point.signalStrength),
                    fillColor: getSignalColor(point.signalStrength),
                    fillOpacity: 0.2,
                    weight: 2
                  }}
                />
              </div>
            ))}

            {/* User location */}
            {userLocation && (
              <Marker position={[userLocation.lat, userLocation.lng]}>
                <Popup>
                  <div className="space-y-2">
                    <div className="font-semibold text-blue-600">Your Location</div>
                    <div className="text-sm">
                      <div>Lat: {userLocation.lat.toFixed(4)}</div>
                      <div>Lng: {userLocation.lng.toFixed(4)}</div>
                    </div>
                  </div>
                </Popup>
              </Marker>
            )}
          </MapContainer>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span>Excellent Signal</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <span>Good Signal</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span>Poor Signal</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 border-2 border-blue-500 rounded-full bg-blue-500"></div>
            <span>Your Location</span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Active Nodes:</span>
            <div className="font-semibold">{activityPoints.length}</div>
          </div>
          <div>
            <span className="text-muted-foreground">Coverage Areas:</span>
            <div className="font-semibold">{activityPoints.length}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}