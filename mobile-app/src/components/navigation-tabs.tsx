'use client'

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useRouter, usePathname } from 'next/navigation'
import { 
  Home, 
  MapPin, 
  User,
  BarChart3,
  Settings
} from 'lucide-react'

const navigationItems = [
  {
    value: '/',
    label: 'Home',
    icon: Home,
  },
  {
    value: '/depin',
    label: 'DePIN',
    icon: MapPin,
  },
  {
    value: '/account',
    label: 'Account',
    icon: User,
  },
]

export function NavigationTabs() {
  const router = useRouter()
  const pathname = usePathname()

  const handleValueChange = (value: string) => {
    router.push(value)
  }

  return (
    <div className="w-full max-w-md mx-auto mb-6">
      <Tabs value={pathname} onValueChange={handleValueChange}>
        <TabsList className="grid w-full grid-cols-3">
          {navigationItems.map((item) => {
            const Icon = item.icon
            return (
              <TabsTrigger 
                key={item.value} 
                value={item.value}
                className="flex items-center gap-2"
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{item.label}</span>
              </TabsTrigger>
            )
          })}
        </TabsList>
      </Tabs>
    </div>
  )
}