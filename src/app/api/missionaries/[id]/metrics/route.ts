import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
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
