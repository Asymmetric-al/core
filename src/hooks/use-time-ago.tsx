'use client'

import { useState, useEffect, useCallback, useSyncExternalStore } from 'react'

export interface TimeAgoOptions {
  updateInterval?: number
  shortFormat?: boolean
}

function calculateTimeAgo(dateString: string, shortFormat = false): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 1) return 'Just now'
  
  if (shortFormat) {
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
  } else {
    if (diffMins < 60) return `${diffMins} min ago`
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
  }
  
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export function formatDate(dateString: string, options?: Intl.DateTimeFormatOptions): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', options ?? { month: 'short', day: 'numeric', year: 'numeric' })
}

const emptySubscribe = () => () => {}

function useIsClient(): boolean {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  )
}

export function useTimeAgo(dateString: string, options?: TimeAgoOptions): string {
  const { updateInterval, shortFormat = false } = options ?? {}
  const isClient = useIsClient()
  const [timeAgo, setTimeAgo] = useState<string>(() => 
    formatDate(dateString, { month: 'short', day: 'numeric' })
  )

  const update = useCallback(() => {
    setTimeAgo(calculateTimeAgo(dateString, shortFormat))
  }, [dateString, shortFormat])

  useEffect(() => {
    if (!isClient) return
    
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Required for hydration-safe time calculation
    update()

    if (updateInterval && updateInterval > 0) {
      const interval = setInterval(update, updateInterval)
      return () => clearInterval(interval)
    }
  }, [update, updateInterval, isClient])

  if (!isClient) {
    return formatDate(dateString, { month: 'short', day: 'numeric' })
  }

  return timeAgo
}

export interface TimeAgoProps {
  date: string
  shortFormat?: boolean
  updateInterval?: number
  className?: string
}

export function TimeAgo({ date, shortFormat, updateInterval, className }: TimeAgoProps) {
  const timeAgo = useTimeAgo(date, { shortFormat, updateInterval })
  return <span className={className}>{timeAgo}</span>
}

export function useLastSynced(): string {
  const isClient = useIsClient()
  const [lastSynced, setLastSynced] = useState<string>('')

  useEffect(() => {
    if (!isClient) return
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Required for hydration-safe time display
    setLastSynced(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))
  }, [isClient])

  return lastSynced
}
