import { NextRequest, NextResponse } from 'next/server'
import { scanAuditLogs, recordAnomaly } from '@/lib/monitoring/audit-scanner'

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const anomalies = await scanAuditLogs()

    for (const anomaly of anomalies) {
      await recordAnomaly(anomaly)
      
      if (anomaly.severity === 'critical' || anomaly.severity === 'high') {
        console.error('[SECURITY ALERT]', JSON.stringify(anomaly))
      }
    }

    return NextResponse.json({
      scanned: true,
      anomaliesFound: anomalies.length,
      anomalies,
    })
  } catch (error) {
    console.error('Audit scan failed:', error)
    return NextResponse.json({ error: 'Scan failed' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const anomalies = await scanAuditLogs()
    return NextResponse.json({ anomalies })
  } catch (error) {
    console.error('Audit scan failed:', error)
    return NextResponse.json({ error: 'Scan failed' }, { status: 500 })
  }
}
