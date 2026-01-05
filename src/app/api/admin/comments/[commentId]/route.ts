import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getAuthContext, requireRole, type AuthenticatedContext } from '@/lib/auth/context'
import { createAuditLogger } from '@/lib/audit/logger'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ commentId: string }> }
) {
  try {
    const auth = await getAuthContext()
    requireRole(auth, ['admin', 'super_admin'])
    const ctx = auth as AuthenticatedContext
    const audit = createAuditLogger(ctx, request)
    const { commentId } = await params

    const body = await request.json()
    const { action, content } = body

    const { data: existingComment } = await supabaseAdmin
      .from('post_comments')
      .select('*, post:posts!post_id(tenant_id)')
      .eq('id', commentId)
      .single()

    if (!existingComment) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 })
    }

    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString()
    }

    if (content !== undefined) {
      updateData.content = content.trim()
    }

    const { data: comment, error } = await supabaseAdmin
      .from('post_comments')
      .update(updateData)
      .eq('id', commentId)
      .select(`
        *,
        author:profiles!user_id(id, first_name, last_name, avatar_url, full_name)
      `)
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    await audit.log('comment_moderated', 'comment', commentId, { action })
    return NextResponse.json({ comment })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Internal error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ commentId: string }> }
) {
  try {
    const auth = await getAuthContext()
    requireRole(auth, ['admin', 'super_admin'])
    const ctx = auth as AuthenticatedContext
    const audit = createAuditLogger(ctx, request)
    const { commentId } = await params

    const { searchParams } = new URL(request.url)
    const reason = searchParams.get('reason') || undefined

    const { data: existingComment } = await supabaseAdmin
      .from('post_comments')
      .select('*')
      .eq('id', commentId)
      .single()

    if (!existingComment) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 })
    }

    await supabaseAdmin
      .from('post_comments')
      .delete()
      .eq('parent_id', commentId)

    const { error } = await supabaseAdmin
      .from('post_comments')
      .delete()
      .eq('id', commentId)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    await audit.log('comment_deleted_by_admin', 'comment', commentId, { reason, postId: existingComment.post_id })
    return NextResponse.json({ success: true })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Internal error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
