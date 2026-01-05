import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getAuthContext, requireAuth, type AuthenticatedContext } from '@/lib/auth/context'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  try {
    const auth = await getAuthContext()
    requireAuth(auth)
    const ctx = auth as AuthenticatedContext

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    const { data, error } = await supabaseAdmin
      .from('missionaries')
      .select('*, profile:profiles!profile_id(*)')
      .eq('tenant_id', ctx.tenantId)
      .range(offset, offset + limit - 1)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ missionaries: data })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Internal error'
    const status = message.includes('Unauthorized') ? 401 : 500
    return NextResponse.json({ error: message }, { status })
  }
}
