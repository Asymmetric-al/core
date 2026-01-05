import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getAuthContext, requireAuth, type AuthenticatedContext } from '@/lib/auth/context'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ requestId: string }> }
) {
  try {
    const auth = await getAuthContext()
    requireAuth(auth)
    const ctx = auth as AuthenticatedContext
    const { requestId } = await params

    const body = await request.json()
    const { status, access_level } = body

    if (!status || !['approved', 'rejected'].includes(status)) {
      return NextResponse.json({ error: 'Valid status (approved/rejected) is required' }, { status: 400 })
    }

    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('user_id', ctx.userId)
      .eq('tenant_id', ctx.tenantId)
      .single()

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    const { data: existingRequest } = await supabaseAdmin
      .from('follower_requests')
      .select('id, missionary_id')
      .eq('id', requestId)
      .single()

    if (!existingRequest) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 })
    }

    if (existingRequest.missionary_id !== profile.id) {
      return NextResponse.json({ error: 'Unauthorized to modify this request' }, { status: 403 })
    }

    const updateData: Record<string, any> = {
      status,
      updated_at: new Date().toISOString(),
      resolved_at: new Date().toISOString()
    }

    if (access_level && ['view', 'comment'].includes(access_level)) {
      updateData.access_level = access_level
    }

    const { data: updatedRequest, error } = await supabaseAdmin
      .from('follower_requests')
      .update(updateData)
      .eq('id', requestId)
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
          avatar_url
        )
      `)
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ 
      request: {
        ...updatedRequest,
        name: (updatedRequest as any).donor?.name || 'Unknown Donor',
        initials: getInitials((updatedRequest as any).donor?.name || 'Unknown')
      }
    })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Internal error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ requestId: string }> }
) {
  try {
    const auth = await getAuthContext()
    requireAuth(auth)
    const ctx = auth as AuthenticatedContext
    const { requestId } = await params

    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('user_id', ctx.userId)
      .eq('tenant_id', ctx.tenantId)
      .single()

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    const { data: existingRequest } = await supabaseAdmin
      .from('follower_requests')
      .select('id, missionary_id')
      .eq('id', requestId)
      .single()

    if (!existingRequest) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 })
    }

    if (existingRequest.missionary_id !== profile.id) {
      return NextResponse.json({ error: 'Unauthorized to delete this request' }, { status: 403 })
    }

    const { error } = await supabaseAdmin
      .from('follower_requests')
      .delete()
      .eq('id', requestId)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
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
