import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getAuthContext, requireAuth, requireRole, type AuthenticatedContext } from '@/lib/auth/context'

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
    const status = searchParams.get('status') || 'pending'

    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('user_id', ctx.userId)
      .eq('tenant_id', ctx.tenantId)
      .single()

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    const { data: requests, error } = await supabaseAdmin
      .from('follower_requests')
      .select(`
        id,
        donor_id,
        status,
        access_level,
        created_at,
        updated_at,
        donor:donors!donor_id(
          id,
          name,
          avatar_url,
          status,
          total_given,
          last_gift_date
        )
      `)
      .eq('missionary_id', profile.id)
      .eq('status', status)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching follower requests:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const formattedRequests = (requests || []).map((req: any) => ({
      id: req.id,
      donor_id: req.donor_id,
      name: req.donor?.name || 'Unknown Donor',
      avatar_url: req.donor?.avatar_url,
      is_donor: (req.donor?.total_given || 0) > 0,
      access_level: req.access_level,
      status: req.status,
      created_at: req.created_at,
      initials: getInitials(req.donor?.name || 'Unknown')
    }))

    return NextResponse.json({ requests: formattedRequests })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Internal error'
    return NextResponse.json({ error: message }, { status: message.includes('Unauthorized') ? 401 : 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await getAuthContext()
    requireAuth(auth)
    const ctx = auth as AuthenticatedContext

    const body = await request.json()
    const { donor_id, missionary_id } = body

    if (!donor_id || !missionary_id) {
      return NextResponse.json({ error: 'donor_id and missionary_id are required' }, { status: 400 })
    }

    const { data: donor } = await supabaseAdmin
      .from('donors')
      .select('id, name')
      .eq('id', donor_id)
      .single()

    if (!donor) {
      return NextResponse.json({ error: 'Donor not found' }, { status: 404 })
    }

    const { data: existingRequest } = await supabaseAdmin
      .from('follower_requests')
      .select('id, status')
      .eq('donor_id', donor_id)
      .eq('missionary_id', missionary_id)
      .single()

    if (existingRequest) {
      if (existingRequest.status === 'approved') {
        return NextResponse.json({ error: 'Already following' }, { status: 400 })
      }
      if (existingRequest.status === 'pending') {
        return NextResponse.json({ error: 'Request already pending' }, { status: 400 })
      }
      const { data: updatedRequest, error: updateError } = await supabaseAdmin
        .from('follower_requests')
        .update({ status: 'pending', updated_at: new Date().toISOString() })
        .eq('id', existingRequest.id)
        .select()
        .single()

      if (updateError) {
        return NextResponse.json({ error: updateError.message }, { status: 500 })
      }

      return NextResponse.json({ request: updatedRequest }, { status: 200 })
    }

    const { data: newRequest, error } = await supabaseAdmin
      .from('follower_requests')
      .insert({
        donor_id,
        missionary_id,
        status: 'pending',
        access_level: 'view'
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ request: newRequest }, { status: 201 })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Internal error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}
