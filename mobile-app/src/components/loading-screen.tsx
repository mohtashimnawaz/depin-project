'use client'

import { Loader2, MapPin } from 'lucide-react'

interface LoadingScreenProps {
  message?: string
}

export function LoadingScreen({ message = 'Loading DePIN Network...' }: LoadingScreenProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <div className="relative">
          <MapPin className="h-16 w-16 mx-auto text-primary" />
          <Loader2 className="h-8 w-8 animate-spin absolute -bottom-2 -right-2 text-primary" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold">DePIN Network</h2>
          <p className="text-muted-foreground">{message}</p>
        </div>
        <div className="flex justify-center space-x-1">
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
      </div>
    </div>
  )
}