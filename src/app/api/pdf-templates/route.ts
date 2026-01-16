import { NextRequest, NextResponse } from 'next/server'
import { getAuthContext, requireRole, type AuthenticatedContext } from '@/lib/auth/context'
import { getAdminClient } from '@/lib/supabase/admin'

export async function GET(request: NextRequest) {
  try {
    const { client: supabaseAdmin, error: adminError } = getAdminClient()
    if (!supabaseAdmin) {
      return NextResponse.json({ error: adminError }, { status: 503 })
    }

    const auth = await getAuthContext()
    requireRole(auth, ['admin', 'super_admin'])
    const ctx = auth as AuthenticatedContext

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')
    const status = searchParams.get('status')
    const category = searchParams.get('category')

    let query = supabaseAdmin
      .from('pdf_templates')
      .select(`
        id, name, description, thumbnail, category, tags, 
        page_size, orientation, status, is_default,
        created_at, updated_at
      `)
      .eq('tenant_id', ctx.tenantId)
      .order('updated_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (status) {
      query = query.eq('status', status)
    }

    if (category) {
      query = query.eq('category', category)
    }

    const { data: templates, error, count } = await query

    if (error) {
      console.error('[API] PDF templates fetch error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const { count: totalCount } = await supabaseAdmin
      .from('pdf_templates')
      .select('*', { count: 'exact', head: true })
      .eq('tenant_id', ctx.tenantId)

    return NextResponse.json({
      templates: templates || [],
      total: totalCount || 0,
      limit,
      offset
    })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Internal error'
    const status = message.includes('Unauthorized') ? 401 : message.includes('Forbidden') ? 403 : 500
    return NextResponse.json({ error: message }, { status })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { client: supabaseAdmin, error: adminError } = getAdminClient()
    if (!supabaseAdmin) {
      return NextResponse.json({ error: adminError }, { status: 503 })
    }

    const auth = await getAuthContext()
    requireRole(auth, ['admin', 'super_admin'])
    const ctx = auth as AuthenticatedContext

    const body = await request.json()
    const { 
      name, 
      description, 
      design, 
      html,
      category = 'custom', 
      page_size = 'Letter', 
      orientation = 'portrait',
      margins,
      tags,
      status = 'draft',
      is_default = false
    } = body

    if (!name?.trim()) {
      return NextResponse.json({ error: 'Template name is required' }, { status: 400 })
    }

    if (!design || typeof design !== 'object') {
      return NextResponse.json({ error: 'Design JSON is required' }, { status: 400 })
    }

    if (is_default) {
      await supabaseAdmin
        .from('pdf_templates')
        .update({ is_default: false })
        .eq('tenant_id', ctx.tenantId)
        .eq('category', category)
    }

    const { data: template, error } = await supabaseAdmin
      .from('pdf_templates')
      .insert({
        tenant_id: ctx.tenantId,
        name: name.trim(),
        description: description?.trim() || null,
        design,
        html,
        category,
        page_size,
        orientation,
        margins: margins || { top: 72, right: 72, bottom: 72, left: 72 },
        tags: tags || [],
        status,
        is_default,
        created_by: ctx.profileId
      })
      .select('*')
      .single()

    if (error) {
      console.error('[API] PDF template create error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ template }, { status: 201 })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Internal error'
    const status = message.includes('Unauthorized') ? 401 : message.includes('Forbidden') ? 403 : 500
    return NextResponse.json({ error: message }, { status })
  }
}
