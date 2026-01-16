import { NextRequest, NextResponse } from 'next/server'
import { getAuthContext, requireRole, type AuthenticatedContext } from '@/lib/auth/context'
import { getAdminClient } from '@/lib/supabase/admin'

interface RouteParams {
  params: Promise<{ templateId: string }>
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { client: supabaseAdmin, error: adminError } = getAdminClient()
    if (!supabaseAdmin) {
      return NextResponse.json({ error: adminError }, { status: 503 })
    }

    const auth = await getAuthContext()
    requireRole(auth, ['admin', 'super_admin'])
    const ctx = auth as AuthenticatedContext
    const { templateId } = await params

    const { data: template, error } = await supabaseAdmin
      .from('pdf_templates')
      .select('*')
      .eq('id', templateId)
      .eq('tenant_id', ctx.tenantId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Template not found' }, { status: 404 })
      }
      console.error('[API] PDF template fetch error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ template })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Internal error'
    const status = message.includes('Unauthorized') ? 401 : message.includes('Forbidden') ? 403 : 500
    return NextResponse.json({ error: message }, { status })
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { client: supabaseAdmin, error: adminError } = getAdminClient()
    if (!supabaseAdmin) {
      return NextResponse.json({ error: adminError }, { status: 503 })
    }

    const auth = await getAuthContext()
    requireRole(auth, ['admin', 'super_admin'])
    const ctx = auth as AuthenticatedContext
    const { templateId } = await params

    const { data: existing } = await supabaseAdmin
      .from('pdf_templates')
      .select('id')
      .eq('id', templateId)
      .eq('tenant_id', ctx.tenantId)
      .single()

    if (!existing) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 })
    }

    const body = await request.json()
    const { 
      name, 
      description, 
      design, 
      html,
      category, 
      page_size, 
      orientation,
      margins,
      tags,
      status,
      is_default
    } = body

    const updates: Record<string, unknown> = {
      updated_at: new Date().toISOString()
    }

    if (name !== undefined) updates.name = name.trim()
    if (description !== undefined) updates.description = description?.trim() || null
    if (design !== undefined) updates.design = design
    if (html !== undefined) updates.html = html
    if (category !== undefined) updates.category = category
    if (page_size !== undefined) updates.page_size = page_size
    if (orientation !== undefined) updates.orientation = orientation
    if (margins !== undefined) updates.margins = margins
    if (tags !== undefined) updates.tags = tags
    if (status !== undefined) updates.status = status
    if (is_default !== undefined) updates.is_default = is_default

    if (is_default === true && category) {
      await supabaseAdmin
        .from('pdf_templates')
        .update({ is_default: false })
        .eq('tenant_id', ctx.tenantId)
        .eq('category', category)
        .neq('id', templateId)
    }

    const { data: template, error } = await supabaseAdmin
      .from('pdf_templates')
      .update(updates)
      .eq('id', templateId)
      .eq('tenant_id', ctx.tenantId)
      .select('*')
      .single()

    if (error) {
      console.error('[API] PDF template update error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ template })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Internal error'
    const status = message.includes('Unauthorized') ? 401 : message.includes('Forbidden') ? 403 : 500
    return NextResponse.json({ error: message }, { status })
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { client: supabaseAdmin, error: adminError } = getAdminClient()
    if (!supabaseAdmin) {
      return NextResponse.json({ error: adminError }, { status: 503 })
    }

    const auth = await getAuthContext()
    requireRole(auth, ['admin', 'super_admin'])
    const ctx = auth as AuthenticatedContext
    const { templateId } = await params

    const { data: existing } = await supabaseAdmin
      .from('pdf_templates')
      .select('id, name')
      .eq('id', templateId)
      .eq('tenant_id', ctx.tenantId)
      .single()

    if (!existing) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 })
    }

    const { error } = await supabaseAdmin
      .from('pdf_templates')
      .delete()
      .eq('id', templateId)
      .eq('tenant_id', ctx.tenantId)

    if (error) {
      console.error('[API] PDF template delete error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      message: `Template "${existing.name}" deleted` 
    })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Internal error'
    const status = message.includes('Unauthorized') ? 401 : message.includes('Forbidden') ? 403 : 500
    return NextResponse.json({ error: message }, { status })
  }
}
