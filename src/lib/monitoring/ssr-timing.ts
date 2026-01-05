import { NextRequest, NextResponse } from 'next/server'

const SSR_TIME_THRESHOLD_MS = 500

interface TimingMetrics {
  route: string
  duration: number
  timestamp: number
  memoryUsage?: number
}

const metricsBuffer: TimingMetrics[] = []
const MAX_BUFFER_SIZE = 100

export function recordSSRTiming(route: string, duration: number) {
  const metric: TimingMetrics = {
    route,
    duration,
    timestamp: Date.now(),
    memoryUsage: typeof process !== 'undefined' ? process.memoryUsage?.().heapUsed : undefined,
  }

  metricsBuffer.push(metric)
  if (metricsBuffer.length > MAX_BUFFER_SIZE) {
    metricsBuffer.shift()
  }

  if (duration > SSR_TIME_THRESHOLD_MS) {
    console.warn(`[SSR Performance] Slow render detected: ${route} took ${duration}ms (threshold: ${SSR_TIME_THRESHOLD_MS}ms)`)
  }

  return metric
}

export function getSSRMetrics() {
  return [...metricsBuffer]
}

export function getAverageSSRTime(route?: string) {
  const filtered = route 
    ? metricsBuffer.filter((m) => m.route === route) 
    : metricsBuffer
  
  if (filtered.length === 0) return 0
  
  return filtered.reduce((sum, m) => sum + m.duration, 0) / filtered.length
}

export function getSlowRoutes(threshold = SSR_TIME_THRESHOLD_MS) {
  const routeTimes = new Map<string, number[]>()
  
  for (const metric of metricsBuffer) {
    const times = routeTimes.get(metric.route) || []
    times.push(metric.duration)
    routeTimes.set(metric.route, times)
  }
  
  const slowRoutes: { route: string; avgTime: number; maxTime: number }[] = []
  
  for (const [route, times] of routeTimes) {
    const avg = times.reduce((a, b) => a + b, 0) / times.length
    const max = Math.max(...times)
    
    if (avg > threshold || max > threshold * 1.5) {
      slowRoutes.push({ route, avgTime: avg, maxTime: max })
    }
  }
  
  return slowRoutes.sort((a, b) => b.avgTime - a.avgTime)
}

export function withSSRTiming<T>(
  route: string,
  fn: () => T | Promise<T>
): Promise<T> {
  const start = performance.now()
  
  const result = fn()
  
  if (result instanceof Promise) {
    return result.finally(() => {
      recordSSRTiming(route, performance.now() - start)
    })
  }
  
  recordSSRTiming(route, performance.now() - start)
  return Promise.resolve(result)
}

export function createTimingMiddleware() {
  return async function timingMiddleware(request: NextRequest) {
    const start = performance.now()
    const response = NextResponse.next()
    const duration = performance.now() - start
    
    response.headers.set('Server-Timing', `ssr;dur=${duration.toFixed(2)}`)
    
    if (duration > SSR_TIME_THRESHOLD_MS) {
      console.warn(`[Middleware] Slow request: ${request.nextUrl.pathname} took ${duration.toFixed(2)}ms`)
    }
    
    return response
  }
}
