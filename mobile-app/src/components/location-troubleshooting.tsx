'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  HelpCircle, 
  MapPin, 
  Shield, 
  Smartphone, 
  Wifi,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  CheckCircle
} from 'lucide-react'

export function LocationTroubleshooting() {
  const [isExpanded, setIsExpanded] = useState(false)

  const troubleshootingSteps = [
    {
      icon: Shield,
      title: 'Check Browser Permissions',
      description: 'Make sure location access is allowed for this website',
      steps: [
        'Click the location icon in your browser\'s address bar',
        'Select "Allow" for location access',
        'Refresh the page and try again'
      ]
    },
    {
      icon: Smartphone,
      title: 'Enable Device Location',
      description: 'Ensure your device\'s location services are turned on',
      steps: [
        'Go to your device Settings',
        'Find Location or Privacy settings',
        'Turn on Location Services',
        'Make sure your browser has location permission'
      ]
    },
    {
      icon: Wifi,
      title: 'Check Network Connection',
      description: 'A stable internet connection helps with location accuracy',
      steps: [
        'Ensure you\'re connected to WiFi or mobile data',
        'Try moving to a location with better signal',
        'Restart your network connection if needed'
      ]
    },
    {
      icon: MapPin,
      title: 'Use Manual Input',
      description: 'If auto-detection fails, you can enter coordinates manually',
      steps: [
        'Click "Manual Input" button above',
        'Enter your GPS coordinates (you can find these in Maps apps)',
        'Enter your WiFi signal strength (typically -30 to -90 dBm)',
        'Submit your activity'
      ]
    }
  ]

  return (
    <Card className="mt-4">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HelpCircle className="h-4 w-4" />
            <CardTitle className="text-sm">Having Location Issues?</CardTitle>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </div>
        {!isExpanded && (
          <CardDescription>
            Click to see troubleshooting steps for location detection
          </CardDescription>
        )}
      </CardHeader>
      
      {isExpanded && (
        <CardContent className="space-y-4">
          <div className="space-y-4">
            {troubleshootingSteps.map((step, index) => {
              const Icon = step.icon
              return (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Icon className="h-5 w-5 text-primary mt-0.5" />
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-sm">{step.title}</h4>
                        <Badge variant="outline" className="text-xs">
                          Step {index + 1}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {step.description}
                      </p>
                      <ul className="space-y-1">
                        {step.steps.map((stepText, stepIndex) => (
                          <li key={stepIndex} className="flex items-start gap-2 text-sm">
                            <CheckCircle className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                            <span>{stepText}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5" />
              <div className="space-y-1">
                <h4 className="text-sm font-medium text-yellow-900 dark:text-yellow-100">
                  Still Having Issues?
                </h4>
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  If location detection continues to fail, you can always use the manual input option. 
                  You can find your GPS coordinates using your phone's Maps app or any online GPS tool.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  )
}