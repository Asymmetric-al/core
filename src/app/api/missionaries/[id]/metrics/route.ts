import { NextRequest, NextResponse } from 'next/server'
import { getAdminClient } from '@/lib/supabase/admin'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { client: supabaseAdmin, error: adminError } = getAdminClient()
    if (!supabaseAdmin) {
      return NextResponse.json({ error: adminError }, { status: 503 })
    }

    const { id: missionaryId } = await params
    
    if (!missionaryId) {
      return NextResponse.json({ error: 'Missing missionary ID' }, { status: 400 })
    }

    const thirteenMonthsAgo = new Date()
    thirteenMonthsAgo.setMonth(thirteenMonthsAgo.getMonth() - 13)

    const { data, error } = await supabaseAdmin
      .from('donations')
      .select('id, amount, donation_type, created_at, status')
      .eq('missionary_id', missionaryId)
      .gte('created_at', thirteenMonthsAgo.toISOString())
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ donations: data || [] })
  } catch (e) {
    console.error('API error:', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
