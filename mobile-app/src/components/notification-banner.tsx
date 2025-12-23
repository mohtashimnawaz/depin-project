'use client'

import { useState, useEffect } from 'react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { 
  Bell, 
  X, 
  CheckCircle, 
  AlertTriangle, 
  Info,
  Gift
} from 'lucide-react'

interface Notification {
  id: string
  type: 'success' | 'warning' | 'info' | 'reward'
  title: string
  message: string
  timestamp: Date
  dismissible?: boolean
}

export function NotificationBanner() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)

  // Mock notifications
  useEffect(() => {
    const mockNotifications: Notification[] = [
      {
        id: '1',
        type: 'reward',
        title: 'Reward Earned!',
        message: 'You earned 5 MAP tokens for your recent submission.',
        timestamp: new Date(),
        dismissible: true
      },
      {
        id: '2',
        type: 'info',
        title: 'Network Update',
        message: 'New verification algorithms deployed for better accuracy.',
        timestamp: new Date(Date.now() - 3600000),
        dismissible: true
      },
      {
        id: '3',
        type: 'success',
        title: 'Milestone Reached',
        message: 'Congratulations! You\'ve reached Silver tier status.',
        timestamp: new Date(Date.now() - 7200000),
        dismissible: true
      }
    ]

    // Simulate receiving notifications
    const timer = setTimeout(() => {
      setNotifications(mockNotifications)
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  // Auto-rotate notifications
  useEffect(() => {
    if (notifications.length <= 1) return

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % notifications.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [notifications.length])

  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
    if (currentIndex >= notifications.length - 1) {
      setCurrentIndex(0)
    }
  }

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case 'info':
        return <Info className="h-4 w-4 text-blue-500" />
      case 'reward':
        return <Gift className="h-4 w-4 text-purple-500" />
      default:
        return <Bell className="h-4 w-4" />
    }
  }

  const getVariant = (type: Notification['type']) => {
    return type === 'warning' ? 'destructive' : 'default'
  }

  if (notifications.length === 0) return null

  const currentNotification = notifications[currentIndex]

  return (
    <div className="mb-4">
      <Alert variant={getVariant(currentNotification.type)} className="relative">
        {getIcon(currentNotification.type)}
        <AlertDescription className="pr-8">
          <div className="flex items-center justify-between">
            <div>
              <span className="font-semibold">{currentNotification.title}</span>
              <span className="ml-2">{currentNotification.message}</span>
            </div>
            <div className="flex items-center gap-2">
              {notifications.length > 1 && (
                <div className="flex gap-1">
                  {notifications.map((_, index) => (
                    <div
                      key={index}
                      className={`w-1.5 h-1.5 rounded-full ${
                        index === currentIndex ? 'bg-current' : 'bg-current/30'
                      }`}
                    />
                  ))}
                </div>
              )}
              {currentNotification.dismissible && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() => dismissNotification(currentNotification.id)}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>
        </AlertDescription>
      </Alert>
    </div>
  )
}