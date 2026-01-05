import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getAuthContext, requireAuth, type AuthenticatedContext } from '@/lib/auth/context'
import { createAuditLogger } from '@/lib/audit/logger'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  try {
    const auth = await getAuthContext()
    requireAuth(auth)
    const ctx = auth as AuthenticatedContext

    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', ctx.profileId)
      .eq('tenant_id', ctx.tenantId)
      .single()

    if (profileError) return NextResponse.json({ error: profileError.message }, { status: 500 })

    let profileData = { ...profile }

    if (ctx.role === 'missionary') {
      let { data: missionary, error: missionaryError } = await supabaseAdmin
        .from('missionaries')
        .select('*')
        .eq('profile_id', ctx.profileId)
        .single()

      if (missionaryError && missionaryError.code === 'PGRST116') {
        const { data: newMissionary, error: createError } = await supabaseAdmin
          .from('missionaries')
          .insert({ profile_id: ctx.profileId })
          .select()
          .single()
        
        if (!createError && newMissionary) {
          missionary = newMissionary
          missionaryError = null
        }
      }

      if (!missionaryError && missionary) {
        profileData = { ...profileData, missionary }
      }
    }

    return NextResponse.json({ profile: profileData })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Internal error'
    return NextResponse.json({ error: message }, { status: message.includes('Unauthorized') ? 401 : 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const auth = await getAuthContext()
    requireAuth(auth)
    const ctx = auth as AuthenticatedContext
    const audit = createAuditLogger(ctx, request)

    const body = await request.json()
    const { 
      firstName, 
      lastName, 
      avatarUrl,
      bio,
      tagline,
      location,
      phone,
      coverUrl,
      socialLinks
    } = body

    // Update profile
    const profileUpdates: Record<string, any> = { updated_at: new Date().toISOString() }
    if (firstName) profileUpdates.first_name = firstName
    if (lastName) profileUpdates.last_name = lastName
    if (avatarUrl !== undefined) profileUpdates.avatar_url = avatarUrl

    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .update(profileUpdates)
      .eq('id', ctx.profileId)
      .eq('tenant_id', ctx.tenantId)
      .select()
      .single()

    if (profileError) return NextResponse.json({ error: profileError.message }, { status: 500 })

    let profileData = { ...profile }

    // Update missionary record if applicable
    if (ctx.role === 'missionary') {
        const missionaryUpdates: Record<string, any> = { updated_at: new Date().toISOString() }
        if (bio !== undefined) missionaryUpdates.bio = bio
        if (tagline !== undefined) missionaryUpdates.tagline = tagline
        if (location !== undefined) missionaryUpdates.location = location
        if (phone !== undefined) missionaryUpdates.phone = phone
        if (coverUrl !== undefined) missionaryUpdates.cover_url = coverUrl
        if (socialLinks !== undefined) missionaryUpdates.social_links = socialLinks

        if (Object.keys(missionaryUpdates).length > 1) {
        const { data: missionary, error: missionaryError } = await supabaseAdmin
          .from('missionaries')
          .update(missionaryUpdates)
          .eq('profile_id', ctx.profileId)
          .select()
          .single()

        if (!missionaryError && missionary) {
          profileData = { ...profileData, missionary }
        }
      }
    }

    await audit.log('profile_updated', 'profile', ctx.profileId, body)
    return NextResponse.json({ profile: profileData })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Internal error'
    return NextResponse.json({ error: message }, { status: message.includes('Unauthorized') ? 401 : 500 })
  }
}
