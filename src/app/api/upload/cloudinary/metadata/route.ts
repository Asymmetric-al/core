import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { saveAssetMetadata } from '@/lib/assets'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { cloudinaryData, options } = body

    if (!cloudinaryData) {
      return NextResponse.json({ error: 'Missing Cloudinary data' }, { status: 400 })
    }

    const asset = await saveAssetMetadata(cloudinaryData, {
      ...options,
      userId: user.id
    })

    return NextResponse.json({ success: true, asset })

  } catch (error) {
    console.error('Save metadata error:', error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Failed to save metadata' 
    }, { status: 500 })
  }
}
