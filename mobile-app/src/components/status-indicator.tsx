'use client'

import { Badge } from '@/components/ui/badge'
import { 
  CheckCircle, 
  AlertCircle, 
  Loader2, 
  XCircle 
} from 'lucide-react'

interface StatusIndicatorProps {
  status: 'loading' | 'success' | 'error' | 'idle'
  label: string
  className?: string
}

export function StatusIndicator({ status, label, className = '' }: StatusIndicatorProps) {
  const getStatusConfig = () => {
    switch (status) {
      case 'loading':
        return {
          icon: Loader2,
          variant: 'secondary' as const,
          className: 'animate-spin',
          iconColor: 'text-blue-500'
        }
      case 'success':
        return {
          icon: CheckCircle,
          variant: 'default' as const,
          className: '',
          iconColor: 'text-green-500'
        }
      case 'error':
        return {
          icon: XCircle,
          variant: 'destructive' as const,
          className: '',
          iconColor: 'text-red-500'
        }
      case 'idle':
      default:
        return {
          icon: AlertCircle,
          variant: 'outline' as const,
          className: '',
          iconColor: 'text-muted-foreground'
        }
    }
  }

  const config = getStatusConfig()
  const Icon = config.icon

  return (
    <Badge variant={config.variant} className={`flex items-center gap-1 ${className}`}>
      <Icon className={`h-3 w-3 ${config.iconColor} ${config.className}`} />
      {label}
    </Badge>
  )
}