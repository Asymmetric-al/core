/**
 * Next.js 16 - Proxy Migration (middleware.ts → proxy.ts)
 *
 * BREAKING CHANGE: middleware.ts is deprecated in Next.js 16.
 * Use proxy.ts instead.
 *
 * Migration: Rename file and function, keep same logic.
 */

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// ============================================================================
// Example 1: Basic Proxy (Auth Check)
// ============================================================================

export function proxy(request: NextRequest) {
  const token = request.cookies.get('token')

  // Redirect to login if no token
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/dashboard/:path*',
}

// ============================================================================
// Example 2: Advanced Proxy (Multiple Checks)
// ============================================================================

export function advancedProxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // 1. Auth check
  const token = request.cookies.get('token')
  if (pathname.startsWith('/dashboard') && !token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // 2. Role-based access
  const userRole = request.cookies.get('role')?.value
  if (pathname.startsWith('/admin') && userRole !== 'admin') {
    return NextResponse.redirect(new URL('/unauthorized', request.url))
  }

  // 3. Add custom headers
  const response = NextResponse.next()
  response.headers.set('x-custom-header', 'value')
  response.headers.set('x-pathname', pathname)

  return response
}

export const advancedConfig = {
  matcher: ['/dashboard/:path*', '/admin/:path*'],
}

// ============================================================================
// Example 3: Request Rewriting
// ============================================================================

export function rewriteProxy(request: NextRequest) {
  // Rewrite /blog/* to /posts/*
  if (request.nextUrl.pathname.startsWith('/blog')) {
    const url = request.nextUrl.clone()
    url.pathname = url.pathname.replace('/blog', '/posts')
    return NextResponse.rewrite(url)
  }

  return NextResponse.next()
}

export const rewriteConfig = {
  matcher: '/blog/:path*',
}

// ============================================================================
// Example 4: Geolocation-Based Routing
// ============================================================================

export function geoProxy(request: NextRequest) {
  const country = request.geo?.country || 'US'
  const url = request.nextUrl.clone()

  // Redirect to country-specific page
  if (url.pathname === '/') {
    url.pathname = `/${country.toLowerCase()}`
    return NextResponse.rewrite(url)
  }

  return NextResponse.next()
}

// ============================================================================
// Example 5: A/B Testing
// ============================================================================

export function abTestProxy(request: NextRequest) {
  const bucket = request.cookies.get('bucket')?.value

  if (!bucket) {
    // Assign to A or B randomly
    const newBucket = Math.random() < 0.5 ? 'a' : 'b'
    const response = NextResponse.next()
    response.cookies.set('bucket', newBucket, {
      maxAge: 60 * 60 * 24 * 30, // 30 days
    })

    // Rewrite to variant page
    if (newBucket === 'b') {
      const url = request.nextUrl.clone()
      url.pathname = `/variant-b${url.pathname}`
      return NextResponse.rewrite(url)
    }

    return response
  }

  // Existing user
  if (bucket === 'b') {
    const url = request.nextUrl.clone()
    url.pathname = `/variant-b${url.pathname}`
    return NextResponse.rewrite(url)
  }

  return NextResponse.next()
}

export const abTestConfig = {
  matcher: '/',
}

// ============================================================================
// Example 6: Rate Limiting
// ============================================================================

const rateLimitMap = new Map<string, { count: number; resetAt: number }>()

export function rateLimitProxy(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') || 'unknown'
  const now = Date.now()

  // Check rate limit (100 requests per minute)
  const rateLimit = rateLimitMap.get(ip)

  if (rateLimit) {
    if (now < rateLimit.resetAt) {
      if (rateLimit.count >= 100) {
        return new NextResponse('Too Many Requests', {
          status: 429,
          headers: {
            'Retry-After': String(Math.ceil((rateLimit.resetAt - now) / 1000)),
          },
        })
      }
      rateLimit.count++
    } else {
      rateLimitMap.set(ip, { count: 1, resetAt: now + 60000 }) // 1 minute
    }
  } else {
    rateLimitMap.set(ip, { count: 1, resetAt: now + 60000 })
  }

  return NextResponse.next()
}

export const rateLimitConfig = {
  matcher: '/api/:path*',
}

// ============================================================================
// Example 7: Response Modification
// ============================================================================

export function modifyResponseProxy(request: NextRequest) {
  const response = NextResponse.next()

  // Add security headers
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'origin-when-cross-origin')
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=()'
  )

  return response
}

// ============================================================================
// Migration Guide: middleware.ts → proxy.ts
// ============================================================================

/**
 * ❌ BEFORE (Next.js 15):
 *
 * // File: middleware.ts
 * import { NextResponse } from 'next/server'
 * import type { NextRequest } from 'next/server'
 *
 * export function middleware(request: NextRequest) {
 *   const token = request.cookies.get('token')
 *   if (!token) {
 *     return NextResponse.redirect(new URL('/login', request.url))
 *   }
 *   return NextResponse.next()
 * }
 *
 * export const config = {
 *   matcher: '/dashboard/:path*',
 * }
 */

/**
 * ✅ AFTER (Next.js 16):
 *
 * // File: proxy.ts
 * import { NextResponse } from 'next/server'
 * import type { NextRequest } from 'next/server'
 *
 * export function proxy(request: NextRequest) {
 *   const token = request.cookies.get('token')
 *   if (!token) {
 *     return NextResponse.redirect(new URL('/login', request.url))
 *   }
 *   return NextResponse.next()
 * }
 *
 * export const config = {
 *   matcher: '/dashboard/:path*',
 * }
 */

/**
 * Migration Steps:
 * 1. Rename file: middleware.ts → proxy.ts
 * 2. Rename function: middleware → proxy
 * 3. Keep config object the same
 * 4. Logic remains identical
 *
 * Why the change?
 * - proxy.ts runs on Node.js runtime (full Node.js APIs)
 * - middleware.ts ran on Edge runtime (limited APIs)
 * - proxy.ts makes the network boundary explicit
 *
 * Note: middleware.ts still works in Next.js 16 but is deprecated.
 * Migrate to proxy.ts for future compatibility.
 */

/**
 * Summary:
 *
 * Proxy patterns:
 * 1. ✅ Auth checks and redirects
 * 2. ✅ Role-based access control
 * 3. ✅ Custom headers
 * 4. ✅ Request rewriting (URL rewrites)
 * 5. ✅ Geolocation-based routing
 * 6. ✅ A/B testing
 * 7. ✅ Rate limiting
 * 8. ✅ Response modification (security headers)
 *
 * Best practices:
 * - Keep proxy logic lightweight (runs on every request)
 * - Use matcher to limit scope
 * - Avoid database queries (use cookies/headers instead)
 * - Cache rate limit data in memory (or Redis for production)
 * - Return NextResponse.next() if no action needed
 */
