import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getAuthContext, requireRole, type AuthenticatedContext } from '@/lib/auth/context'
import { createAuditLogger } from '@/lib/audit/logger'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  try {
    const auth = await getAuthContext()
    requireRole(auth, ['admin', 'super_admin'])
    const ctx = auth as AuthenticatedContext

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')
    const postId = searchParams.get('postId')
    const flagged = searchParams.get('flagged') === 'true'

    let query = supabaseAdmin
      .from('post_comments')
      .select(`
        *,
        author:profiles!user_id(id, first_name, last_name, avatar_url, full_name),
        post:posts!post_id(id, content, missionary_id)
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (postId) {
      query = query.eq('post_id', postId)
    }

    const { data: comments, error } = await query

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    const filteredComments = (comments || []).filter(comment => {
      return comment.post !== null
    })

    return NextResponse.json({ comments: filteredComments })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Internal error'
    return NextResponse.json({ error: message }, { status: message.includes('Forbidden') ? 403 : 500 })
  }
}
