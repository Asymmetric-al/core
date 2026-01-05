'use client'

import { useMemo, useState, useEffect } from 'react'

/**
 * Types for donation metrics and chart data
 */

export interface ChartDataPoint {
  date: string
  value: number
}

export interface MonthlyChartDataPoint {
  month: string
  recurring: number
  oneTime: number
  offline: number
  total: number
}

export interface MetricData {
  total: number
  change: number
  trend: 'up' | 'down' | 'neutral'
  data: ChartDataPoint[]
}

export interface DonationMetrics {
  thisMonth: MetricData
  lastMonth: MetricData
  yearToDate: MetricData
  monthlyBreakdown: MonthlyChartDataPoint[]
  isLoading: boolean
  error: Error | null
}

export type DonationType = 'recurring' | 'one_time' | 'offline'

interface RawDonation {
  id: string
  amount: number
  donation_type: DonationType
  created_at: string
  status: string
}

/**
 * Aggregates donations by day within a date range
 */
function aggregateByDay(
  donations: RawDonation[], 
  startDate: Date, 
  endDate: Date
): ChartDataPoint[] {
  const dayMap = new Map<string, number>()
  
  const current = new Date(startDate)
  while (current <= endDate) {
    const key = current.toISOString().split('T')[0] ?? ''
    dayMap.set(key, 0)
    current.setDate(current.getDate() + 1)
  }
  
  donations.forEach(d => {
    const date = new Date(d.created_at)
    if (date >= startDate && date <= endDate && d.status === 'completed') {
      const key = date.toISOString().split('T')[0] ?? ''
      dayMap.set(key, (dayMap.get(key) ?? 0) + Number(d.amount))
    }
  })
  
  return Array.from(dayMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, value]) => ({ date, value }))
}

/**
 * Aggregates donations by month with breakdown by type
 * Returns data for the specified number of months ending at current month
 */
function aggregateByMonth(
  donations: RawDonation[], 
  months: number
): MonthlyChartDataPoint[] {
  const now = new Date()
  const monthMap = new Map<string, { recurring: number; oneTime: number; offline: number }>()
  
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const key = d.toISOString().slice(0, 7)
    monthMap.set(key, { recurring: 0, oneTime: 0, offline: 0 })
  }
  
  donations.forEach(d => {
    if (d.status !== 'completed') return
    const date = new Date(d.created_at)
    const key = date.toISOString().slice(0, 7)
    const entry = monthMap.get(key)
    if (entry) {
      const amount = Number(d.amount)
      switch (d.donation_type) {
        case 'recurring':
          entry.recurring += amount
          break
        case 'one_time':
          entry.oneTime += amount
          break
        case 'offline':
          entry.offline += amount
          break
      }
    }
  })
  
  return Array.from(monthMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, { recurring, oneTime, offline }]) => ({
      month: formatMonth(key),
      recurring,
      oneTime,
      offline,
      total: recurring + oneTime + offline,
    }))
}

/**
 * Formats ISO month string (YYYY-MM) to short month name
 */
function formatMonth(isoMonth: string): string {
  const parts = isoMonth.split('-')
  const year = parts[0] ?? '2024'
  const month = parts[1] ?? '01'
  const date = new Date(parseInt(year), parseInt(month) - 1, 1)
  return date.toLocaleDateString('en-US', { month: 'short' })
}

/**
 * Calculates percentage change between two values
 */
function calculateChange(
  current: number, 
  previous: number
): { change: number; trend: 'up' | 'down' | 'neutral' } {
  if (previous === 0) {
    return { change: current > 0 ? 100 : 0, trend: current > 0 ? 'up' : 'neutral' }
  }
  const change = ((current - previous) / previous) * 100
  return {
    change: Math.round(change * 10) / 10,
    trend: change > 0 ? 'up' : change < 0 ? 'down' : 'neutral',
  }
}

/**
 * Hook for fetching and computing donation metrics for a missionary
 * 
 * @param missionaryId - The UUID of the missionary
 * @returns Donation metrics including this month, last month, YTD totals, and monthly breakdown
 */
export function useDonationMetrics(missionaryId: string): DonationMetrics {
  const [donations, setDonations] = useState<RawDonation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!missionaryId) {
      setIsLoading(false)
      return
    }

    let isMounted = true
    
    const fetchDonations = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        const response = await fetch(`/api/missionaries/${missionaryId}/metrics`)
        
        if (!isMounted) return
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const result = await response.json()
        
        if (result.error) {
          throw new Error(result.error)
        }
        
        setDonations(result.donations || [])
      } catch (e) {
        if (!isMounted) return
        setError(e instanceof Error ? e : new Error('Failed to fetch donations'))
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    fetchDonations()
    
    return () => {
      isMounted = false
    }
  }, [missionaryId])

  const metrics = useMemo((): Omit<DonationMetrics, 'isLoading' | 'error'> => {
    const now = new Date()
    
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const thisMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0)
    
    const twoMonthsAgoStart = new Date(now.getFullYear(), now.getMonth() - 2, 1)
    const twoMonthsAgoEnd = new Date(now.getFullYear(), now.getMonth() - 1, 0)
    
    const yearStart = new Date(now.getFullYear(), 0, 1)
    const lastYearStart = new Date(now.getFullYear() - 1, 0, 1)
    const lastYearSameDay = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate())

    const sumPeriod = (start: Date, end: Date) => 
      donations
        .filter(d => {
          const date = new Date(d.created_at)
          return date >= start && date <= end && d.status === 'completed'
        })
        .reduce((sum, d) => sum + Number(d.amount), 0)

    const thisMonthTotal = sumPeriod(thisMonthStart, thisMonthEnd)
    const lastMonthTotal = sumPeriod(lastMonthStart, lastMonthEnd)
    const twoMonthsAgoTotal = sumPeriod(twoMonthsAgoStart, twoMonthsAgoEnd)
    const ytdTotal = sumPeriod(yearStart, now)
    const lastYtdTotal = sumPeriod(lastYearStart, lastYearSameDay)

    const thisMonthChange = calculateChange(thisMonthTotal, lastMonthTotal)
    const lastMonthChange = calculateChange(lastMonthTotal, twoMonthsAgoTotal)
    const ytdChange = calculateChange(ytdTotal, lastYtdTotal)

    return {
      thisMonth: {
        total: thisMonthTotal,
        ...thisMonthChange,
        data: aggregateByDay(donations, thisMonthStart, now),
      },
      lastMonth: {
        total: lastMonthTotal,
        ...lastMonthChange,
        data: aggregateByDay(donations, lastMonthStart, lastMonthEnd),
      },
      yearToDate: {
        total: ytdTotal,
        ...ytdChange,
        data: aggregateByDay(donations, yearStart, now),
      },
      monthlyBreakdown: aggregateByMonth(donations, 13),
    }
  }, [donations])

  return {
    ...metrics,
    isLoading,
    error,
  }
}
