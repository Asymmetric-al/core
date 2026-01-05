'use client'

import { memo, useMemo } from 'react'
import { Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface Notification {
  id: string
  title: string
  description: string
  time: string
}

const STUB_NOTIFICATIONS: Notification[] = [
  { id: '1', title: 'New donation received', description: '$500 from John Smith', time: '2m ago' },
  { id: '2', title: 'Background check complete', description: 'Sarah Johnson - Approved', time: '1h ago' },
  { id: '3', title: 'Event registration', description: '15 new registrations', time: '3h ago' },
]

const NotificationItem = memo(function NotificationItem({ notification }: { notification: Notification }) {
  return (
    <DropdownMenuItem className="flex flex-col items-start gap-1 px-3 py-3 cursor-pointer">
      <div className="flex w-full items-start justify-between gap-2">
        <span className="text-sm font-medium">{notification.title}</span>
        <span className="shrink-0 text-[10px] text-muted-foreground">{notification.time}</span>
      </div>
      <span className="text-xs text-muted-foreground">{notification.description}</span>
    </DropdownMenuItem>
  )
})

export const NotificationsMenu = memo(function NotificationsMenu() {
  const notifications = useMemo(() => STUB_NOTIFICATIONS, [])

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative h-8 w-8">
          <Bell className="h-4 w-4" />
          <span className="absolute right-1 top-1 flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between py-2">
          <span className="text-sm font-semibold">Notifications</span>
          <Button
            variant="ghost"
            size="sm"
            className="h-auto px-2 py-1 text-xs text-muted-foreground hover:text-foreground"
          >
            Mark all read
          </Button>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {notifications.map((notification) => (
          <NotificationItem key={notification.id} notification={notification} />
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem className="justify-center py-2 text-sm font-medium text-muted-foreground hover:text-foreground">
          View all notifications
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
})
