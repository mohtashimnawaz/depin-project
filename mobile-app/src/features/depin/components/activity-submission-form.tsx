'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  MapPin, 
  Wifi, 
  Loader2, 
  CheckCircle, 
  AlertCircle,
  RefreshCw,
  Smartphone
} from 'lucide-react'
import { LocationTroubleshooting } from '@/components/location-troubleshooting'
import { StatusIndicator } from '@/components/status-indicator'

interface ActivitySubmissionFormProps {
  onSubmit: (data: { gpsLat: number; gpsLong: number; signalStrength: number }) => Promise<void>
  isSubmitting: boolean
}

interface LocationData {
  latitude: number
  longitude: number
  accuracy: number
}

interface NetworkInfo {
  signalStrength: number
  networkType: string
  isWifi: boolean
}

export function ActivitySubmissionForm({ onSubmit, isSubmitting }: ActivitySubmissionFormProps) {
  const [location, setLocation] = useState<LocationData | null>(null)
  const [networkInfo, setNetworkInfo] = useState<NetworkInfo | null>(null)
  const [isGettingLocation, setIsGettingLocation] = useState(false)
  const [isGettingNetwork, setIsGettingNetwork] = useState(false)
  const [locationError, setLocationError] = useState<string | null>(null)
  const [networkError, setNetworkError] = useState<string | null>(null)

  // Manual input states
  const [manualLat, setManualLat] = useState('')
  const [manualLng, setManualLng] = useState('')
  const [manualSignal, setManualSignal] = useState('')
  const [useManualInput, setUseManualInput] = useState(false)

  // Get user's location
  const getCurrentLocation = async () => {
    setIsGettingLocation(true)
    setLocationError(null)

    try {
      if (!navigator.geolocation) {
        throw new Error('Geolocation is not supported by this browser')
      }

      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          resolve,
          (error) => {
            // Handle GeolocationPositionError properly
            let errorMessage = 'Failed to get location'
            
            switch (error.code) {
              case error.PERMISSION_DENIED:
                errorMessage = 'Location access denied by user'
                break
              case error.POSITION_UNAVAILABLE:
                errorMessage = 'Location information is unavailable'
                break
              case error.TIMEOUT:
                errorMessage = 'Location request timed out'
                break
              default:
                errorMessage = error.message || 'Unknown location error'
                break
            }
            
            reject(new Error(errorMessage))
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 60000
          }
        )
      })

      setLocation({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy
      })
    } catch (error) {
      console.error('Error getting location:', error)
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Failed to get location. Please enable location services or use manual input.'
      setLocationError(errorMessage)
    } finally {
      setIsGettingLocation(false)
    }
  }

  // Mock network info detection (in a real app, this would use native APIs)
  const getNetworkInfo = async () => {
    setIsGettingNetwork(true)
    setNetworkError(null)

    try {
      // Mock network detection
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Generate mock WiFi signal strength (-30 to -90 dBm)
      const mockSignalStrength = Math.floor(Math.random() * 60) - 90
      
      setNetworkInfo({
        signalStrength: mockSignalStrength,
        networkType: 'WiFi',
        isWifi: true
      })
    } catch (error) {
      console.error('Error getting network info:', error)
      setNetworkError('Failed to detect network information')
    } finally {
      setIsGettingNetwork(false)
    }
  }

  // Auto-detect network info on component mount, but let user trigger location
  useEffect(() => {
    getNetworkInfo()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    let lat: number, lng: number, signal: number

    if (useManualInput) {
      lat = parseFloat(manualLat)
      lng = parseFloat(manualLng)
      signal = parseInt(manualSignal)

      // Validate manual input
      if (isNaN(lat) || isNaN(lng) || isNaN(signal)) {
        alert('Please enter valid numbers for all fields')
        return
      }

      if (lat < -90 || lat > 90) {
        alert('Latitude must be between -90 and 90')
        return
      }

      if (lng < -180 || lng > 180) {
        alert('Longitude must be between -180 and 180')
        return
      }

      if (signal < -100 || signal > 0) {
        alert('Signal strength must be between -100 and 0 dBm')
        return
      }
    } else {
      if (!location || !networkInfo) {
        alert('Please wait for location and network detection to complete')
        return
      }

      lat = location.latitude
      lng = location.longitude
      signal = networkInfo.signalStrength
    }

    await onSubmit({
      gpsLat: lat,
      gpsLong: lng,
      signalStrength: signal
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Status Summary */}
      {!useManualInput && (
        <div className="flex items-center justify-center gap-4 p-4 bg-muted/30 rounded-lg">
          <StatusIndicator 
            status={isGettingLocation ? 'loading' : location ? 'success' : locationError ? 'error' : 'idle'}
            label={isGettingLocation ? 'Getting Location...' : location ? 'Location Ready' : locationError ? 'Location Failed' : 'Location Needed'}
          />
          <StatusIndicator 
            status={isGettingNetwork ? 'loading' : networkInfo ? 'success' : networkError ? 'error' : 'idle'}
            label={isGettingNetwork ? 'Detecting Network...' : networkInfo ? 'Network Ready' : networkError ? 'Network Failed' : 'Network Needed'}
          />
        </div>
      )}

      {/* Auto-Detection Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Auto-Detection</h3>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setUseManualInput(!useManualInput)}
          >
            {useManualInput ? 'Use Auto-Detection' : 'Manual Input'}
          </Button>
        </div>

        {!useManualInput && (
          <>
            {/* Location Permission Info */}
            {!location && !isGettingLocation && (
              <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-blue-500 mt-0.5" />
                  <div className="space-y-1">
                    <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100">
                      Location Access Required
                    </h4>
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      To earn MAP tokens, we need your GPS location to verify your contribution to the network. 
                      Your location data is used only for verification and is not stored permanently.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Location Detection */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  GPS Location
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {isGettingLocation ? (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Getting your location...
                  </div>
                ) : location ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <Badge variant="secondary">Location Detected</Badge>
                    </div>
                    <div className="text-sm space-y-1">
                      <div>Latitude: {location.latitude.toFixed(6)}</div>
                      <div>Longitude: {location.longitude.toFixed(6)}</div>
                      <div className="text-muted-foreground">
                        Accuracy: ±{Math.round(location.accuracy)}m
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={getCurrentLocation}
                      className="w-full"
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Update Location
                    </Button>
                  </div>
                ) : locationError ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-red-500" />
                      <span className="text-sm text-red-500">Location Error</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{locationError}</p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={getCurrentLocation}
                      className="w-full"
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Retry Location
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      Click to detect your current GPS location
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={getCurrentLocation}
                      className="w-full"
                    >
                      <MapPin className="h-4 w-4 mr-2" />
                      Get My Location
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Network Detection */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Wifi className="h-4 w-4" />
                  Network Signal
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {isGettingNetwork ? (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Detecting network signal...
                  </div>
                ) : networkInfo ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <Badge variant="secondary">{networkInfo.networkType} Detected</Badge>
                    </div>
                    <div className="text-sm space-y-1">
                      <div>Signal Strength: {networkInfo.signalStrength} dBm</div>
                      <div className="text-muted-foreground">
                        Quality: {networkInfo.signalStrength > -50 ? 'Excellent' : 
                                networkInfo.signalStrength > -70 ? 'Good' : 
                                networkInfo.signalStrength > -85 ? 'Fair' : 'Poor'}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-red-500" />
                      <span className="text-sm text-red-500">Network Error</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{networkError}</p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={getNetworkInfo}
                      className="w-full"
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Retry Network Detection
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}

        {/* Manual Input Section */}
        {useManualInput && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Smartphone className="h-4 w-4" />
                Manual Input
              </CardTitle>
              <CardDescription>
                Enter your location and signal strength manually
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="latitude">Latitude</Label>
                  <Input
                    id="latitude"
                    type="number"
                    step="any"
                    placeholder="e.g., 37.7749"
                    value={manualLat}
                    onChange={(e) => setManualLat(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="longitude">Longitude</Label>
                  <Input
                    id="longitude"
                    type="number"
                    step="any"
                    placeholder="e.g., -122.4194"
                    value={manualLng}
                    onChange={(e) => setManualLng(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="signal">Signal Strength (dBm)</Label>
                <Input
                  id="signal"
                  type="number"
                  placeholder="e.g., -65"
                  value={manualSignal}
                  onChange={(e) => setManualSignal(e.target.value)}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  WiFi signal strength typically ranges from -30 (excellent) to -90 (poor) dBm
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <Separator />

      {/* Submit Button */}
      <Button
        type="submit"
        className="w-full"
        disabled={
          isSubmitting || 
          (!useManualInput && (!location || !networkInfo)) ||
          (useManualInput && (!manualLat || !manualLng || !manualSignal))
        }
      >
        {isSubmitting ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Submitting Activity...
          </>
        ) : (
          <>
            <MapPin className="h-4 w-4 mr-2" />
            Submit Activity & Earn 5 MAP
          </>
        )}
      </Button>

      {!useManualInput && (!location || !networkInfo) && (
        <div className="text-xs text-center text-muted-foreground space-y-1">
          <p>Please allow location access and ensure you're connected to WiFi</p>
          <p>Or switch to manual input if location detection fails</p>
        </div>
      )}

      {/* Troubleshooting Guide */}
      {!useManualInput && locationError && (
        <LocationTroubleshooting />
      )}
    </form>
  )
}