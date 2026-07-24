import { Bell, Menu, Search, Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { notificationsApi } from '@/services/api'
import { useAuth } from '@/context/AuthContext'
import { getInitials } from '@/utils'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { Button } from '@/components/ui/button'
import { cn } from '@/utils'
import { Notification } from '@/types'

export function TopHeader({ onMenuClick }: { onMenuClick?: () => void }) {
  const { theme, setTheme } = useTheme()
  const { user } = useAuth()
  const [searchOpen, setSearchOpen] = useState(false)

  const { data: notifications = [] } = useQuery<Notification[]>({
    queryKey: ['notifications'],
    queryFn: () => notificationsApi.getAll().then(r => r.data),
    refetchInterval: 30000,
  })

  const unread = Array.isArray(notifications) ? notifications.filter((n: Notification) => !n.is_read) : []

  return (
    <header className="h-16 border-b bg-background/95 backdrop-blur-sm flex items-center justify-between px-4 lg:px-6 flex-shrink-0">
      {/* Left */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="md:hidden" onClick={onMenuClick}>
          <Menu size={20} />
        </Button>
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/60 text-muted-foreground text-sm w-64">
          <Search size={14} />
          <span>Search portfolio...</span>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">
        {/* Theme toggle */}
        <Button
          variant="ghost" size="icon" className="rounded-full"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </Button>

        {/* Notification Bell */}
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <Button variant="ghost" size="icon" className="relative rounded-full">
              <Bell size={18} />
              {unread.length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
              )}
            </Button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content
              align="end"
              className="z-50 w-80 rounded-xl border bg-popover p-0 shadow-lg overflow-hidden"
            >
              <div className="px-4 py-3 border-b">
                <h3 className="font-semibold text-sm">Notifications</h3>
                {unread.length > 0 && <p className="text-xs text-muted-foreground">{unread.length} unread</p>}
              </div>
              <div className="max-h-64 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground text-sm">
                    <Bell size={24} className="mx-auto mb-2 opacity-30" />
                    No notifications
                  </div>
                ) : (
                  notifications.slice(0, 8).map((n: Notification) => (
                    <div key={n.id} className={cn("px-4 py-3 border-b last:border-0 text-sm", !n.is_read && "bg-blue-50/50 dark:bg-blue-900/10")}>
                      <p className="text-foreground">{n.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">{new Date(n.created_at).toLocaleString()}</p>
                    </div>
                  ))
                )}
              </div>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>

        {/* Avatar */}
        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-semibold">
          {getInitials(user?.email?.split('@')[0])}
        </div>
      </div>
    </header>
  )
}
