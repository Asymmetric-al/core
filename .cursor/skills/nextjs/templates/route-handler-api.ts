/**
 * Next.js 16 - Route Handlers (API Endpoints)
 *
 * Route Handlers replace API Routes from Pages Router.
 * File: app/api/[...]/route.ts
 */

import { NextResponse } from 'next/server'
import { cookies, headers } from 'next/headers'

// ============================================================================
// Example 1: Basic CRUD API
// ============================================================================

// GET /api/posts
export async function GET() {
  const posts = await fetch('https://api.example.com/posts').then(r => r.json())

  return NextResponse.json(posts)
}

// POST /api/posts
export async function POST(request: Request) {
  const body = await request.json()

  const post = await fetch('https://api.example.com/posts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }).then(r => r.json())

  return NextResponse.json(post, { status: 201 })
}

// ============================================================================
// Example 2: Dynamic Routes
// ============================================================================

// File: app/api/posts/[id]/route.ts

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params // ✅ Await params in Next.js 16

  const post = await fetch(`https://api.example.com/posts/${id}`)
    .then(r => r.json())
    .catch(() => null)

  if (!post) {
    return NextResponse.json(
      { error: 'Post not found' },
      { status: 404 }
    )
  }

  return NextResponse.json(post)
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await request.json()

  const updated = await fetch(`https://api.example.com/posts/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }).then(r => r.json())

  return NextResponse.json(updated)
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  await fetch(`https://api.example.com/posts/${id}`, {
    method: 'DELETE',
  })

  return NextResponse.json({ message: 'Post deleted' }, { status: 200 })
}

// ============================================================================
// Example 3: Search with Query Parameters
// ============================================================================

// GET /api/search?q=nextjs&limit=10&page=1
export async function SEARCH(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q') || ''
  const limit = parseInt(searchParams.get('limit') || '10')
  const page = parseInt(searchParams.get('page') || '1')
  const offset = (page - 1) * limit

  const results = await fetch(
    `https://api.example.com/search?q=${query}&limit=${limit}&offset=${offset}`
  ).then(r => r.json())

  return NextResponse.json({
    results: results.items,
    total: results.total,
    page,
    limit,
  })
}

// ============================================================================
// Example 4: Authentication with Cookies
// ============================================================================

// POST /api/auth/login
export async function LOGIN(request: Request) {
  const { email, password } = await request.json()

  // Verify credentials
  const user = await fetch('https://api.example.com/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  }).then(r => r.json())

  if (!user.token) {
    return NextResponse.json(
      { error: 'Invalid credentials' },
      { status: 401 }
    )
  }

  // Set cookie
  const response = NextResponse.json({ success: true })
  response.cookies.set('token', user.token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  })

  return response
}

// GET /api/auth/me
export async function ME() {
  const cookieStore = await cookies() // ✅ Await cookies in Next.js 16
  const token = cookieStore.get('token')?.value

  if (!token) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  const user = await fetch('https://api.example.com/auth/me', {
    headers: { Authorization: `Bearer ${token}` },
  }).then(r => r.json())

  return NextResponse.json(user)
}

// ============================================================================
// Example 5: Webhook Handler
// ============================================================================

// File: app/api/webhooks/stripe/route.ts

import { headers as getHeaders } from 'next/headers'

export async function WEBHOOK(request: Request) {
  const body = await request.text()
  const headersList = await getHeaders() // ✅ Await headers in Next.js 16
  const signature = headersList.get('stripe-signature')

  if (!signature) {
    return NextResponse.json(
      { error: 'Missing signature' },
      { status: 400 }
    )
  }

  // Verify webhook signature (example with Stripe)
  let event
  try {
    event = JSON.parse(body)
    // In production: stripe.webhooks.constructEvent(body, signature, secret)
  } catch (err) {
    return NextResponse.json(
      { error: 'Invalid payload' },
      { status: 400 }
    )
  }

  // Handle event
  switch (event.type) {
    case 'payment_intent.succeeded':
      await handlePaymentSuccess(event.data.object)
      break
    case 'payment_intent.failed':
      await handlePaymentFailure(event.data.object)
      break
    default:
      console.log(`Unhandled event type: ${event.type}`)
  }

  return NextResponse.json({ received: true })
}

async function handlePaymentSuccess(paymentIntent: any) {
  console.log('Payment succeeded:', paymentIntent.id)
  // Update database, send confirmation email, etc.
}

async function handlePaymentFailure(paymentIntent: any) {
  console.log('Payment failed:', paymentIntent.id)
  // Notify user, log error, etc.
}

// ============================================================================
// Example 6: Streaming Response
// ============================================================================

// GET /api/stream
export async function STREAM() {
  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      for (let i = 0; i < 10; i++) {
        const data = `data: ${JSON.stringify({ count: i })}\n\n`
        controller.enqueue(encoder.encode(data))
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
      controller.close()
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  })
}

// ============================================================================
// Example 7: File Upload
// ============================================================================

// POST /api/upload
import { writeFile } from 'fs/promises'
import { join } from 'path'

export async function UPLOAD(request: Request) {
  const formData = await request.formData()
  const file = formData.get('file') as File

  if (!file) {
    return NextResponse.json(
      { error: 'No file provided' },
      { status: 400 }
    )
  }

  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)
  const filename = `${Date.now()}-${file.name}`
  const path = join(process.cwd(), 'public', 'uploads', filename)

  await writeFile(path, buffer)

  return NextResponse.json({
    success: true,
    url: `/uploads/${filename}`,
  })
}

// ============================================================================
// Example 8: CORS Configuration
// ============================================================================

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}

export async function CORS_GET() {
  const response = NextResponse.json({ message: 'Hello' })

  response.headers.set('Access-Control-Allow-Origin', '*')
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  return response
}

// ============================================================================
// Example 9: Error Handling
// ============================================================================

export async function ERROR_HANDLING() {
  try {
    const data = await fetch('https://api.example.com/data')
      .then(r => {
        if (!r.ok) throw new Error('API request failed')
        return r.json()
      })

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error:', error)

    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}

// ============================================================================
// Example 10: Rate Limiting
// ============================================================================

const rateLimitMap = new Map<string, { count: number; resetAt: number }>()

export async function RATE_LIMITED() {
  const headersList = await headers()
  const ip = headersList.get('x-forwarded-for') || 'unknown'
  const now = Date.now()

  const rateLimit = rateLimitMap.get(ip)

  if (rateLimit) {
    if (now < rateLimit.resetAt) {
      if (rateLimit.count >= 10) {
        return NextResponse.json(
          { error: 'Too many requests' },
          { status: 429 }
        )
      }
      rateLimit.count++
    } else {
      rateLimitMap.set(ip, { count: 1, resetAt: now + 60000 })
    }
  } else {
    rateLimitMap.set(ip, { count: 1, resetAt: now + 60000 })
  }

  return NextResponse.json({ message: 'Success' })
}

/**
 * Summary:
 *
 * Route Handlers (app/api/*/route.ts):
 * 1. ✅ Support all HTTP methods (GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS)
 * 2. ✅ Await params in Next.js 16
 * 3. ✅ Access cookies with await cookies()
 * 4. ✅ Access headers with await headers()
 * 5. ✅ Use NextResponse.json() for JSON responses
 * 6. ✅ Return Response or NextResponse
 *
 * Common patterns:
 * - CRUD operations (GET, POST, PATCH, DELETE)
 * - Query parameters with searchParams
 * - Authentication with cookies
 * - Webhooks with signature verification
 * - Streaming responses (SSE, WebSocket)
 * - File uploads with FormData
 * - CORS configuration
 * - Error handling
 * - Rate limiting
 *
 * Best practices:
 * - Use try/catch for error handling
 * - Return appropriate HTTP status codes
 * - Validate input data
 * - Set secure cookie options in production
 * - Add rate limiting for public endpoints
 * - Use CORS headers when needed
 */
