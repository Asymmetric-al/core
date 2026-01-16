import { NextRequest, NextResponse } from 'next/server'
import { getAdminClient } from '@/lib/supabase/admin'

interface WebVitalMetric {
  name: string
  value: number
  rating: string
  delta: number
  id: string
  navigationType: string
  timestamp: number
  url: string
  userAgent: string
}

const THRESHOLDS: Record<string, number> = {
  LCP: 2500,
  FCP: 1800,
  CLS: 0.1,
  INP: 200,
  TTFB: 500,
}

export async function POST(request: NextRequest) {
  try {
    const { client: supabaseAdmin, error: adminError } = getAdminClient()
    if (!supabaseAdmin) {
      return NextResponse.json({ received: true, skipped: adminError }, { status: 202 })
    }

    const metric: WebVitalMetric = await request.json()

    console.log(`[Web Vitals] ${metric.name}: ${metric.value} (${metric.rating})`)

    const threshold = THRESHOLDS[metric.name]
    const isViolation = threshold
      ? metric.name === 'CLS'
        ? metric.value > threshold
        : metric.value > threshold
      : false

    if (isViolation) {
      console.warn(
        `[Performance Budget Violation] ${metric.name}: ${metric.value} exceeds threshold ${threshold}`
      )

      await supabaseAdmin.from('audit_logs').insert({
        tenant_id: null,
        user_id: '00000000-0000-0000-0000-000000000000',
        action: 'performance_violation',
        resource_type: 'web_vital',
        resource_id: metric.id,
        details: {
          metric_name: metric.name,
          value: metric.value,
          threshold,
          rating: metric.rating,
          url: metric.url,
          timestamp: metric.timestamp,
        },
      })
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Failed to process web vitals:', error)
    return NextResponse.json({ error: 'Processing failed' }, { status: 500 })
  }
}
