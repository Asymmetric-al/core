import { NextResponse } from 'next/server'
import { getSSRMetrics, getSlowRoutes, getAverageSSRTime } from '@/lib/monitoring/ssr-timing'

export async function GET() {
  try {
    const metrics = getSSRMetrics()
    const slowRoutes = getSlowRoutes()
    const avgTime = getAverageSSRTime()

    return NextResponse.json({
      summary: {
        totalRequests: metrics.length,
        averageSSRTime: avgTime.toFixed(2),
        slowRoutesCount: slowRoutes.length,
      },
      slowRoutes,
      recentMetrics: metrics.slice(-20),
    })
  } catch (error) {
    console.error('Failed to get SSR metrics:', error)
    return NextResponse.json({ error: 'Failed to get metrics' }, { status: 500 })
  }
}
