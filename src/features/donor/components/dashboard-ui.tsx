'use client'

import React, { useSyncExternalStore } from 'react'
import { Skeleton } from '@/components/ui/skeleton'

export function DashboardSkeleton() {
  return (
    <div className="container-responsive space-y-6 sm:space-y-8 pb-20 pt-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div className="space-y-2">
          <Skeleton className="h-8 sm:h-10 w-48" />
          <Skeleton className="h-5 sm:h-6 w-64" />
        </div>
        <Skeleton className="h-9 sm:h-10 w-32 rounded-lg" />
      </div>
      <Skeleton className="h-40 sm:h-48 w-full rounded-xl" />
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
        <Skeleton className="h-28 sm:h-32 w-full rounded-xl" />
        <Skeleton className="h-28 sm:h-32 w-full rounded-xl" />
        <Skeleton className="h-28 sm:h-32 w-full rounded-xl sm:col-span-2 md:col-span-1" />
      </div>
    </div>
  )
}

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}

function subscribe() {
  return () => {}
}

function getServerSnapshot(): null {
  return null
}

function getClientSnapshot(): string {
  return getGreeting()
}

export function Greeting() {
  const greeting = useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot)
  
  if (!greeting) return null
  return <>{greeting}</>
}
