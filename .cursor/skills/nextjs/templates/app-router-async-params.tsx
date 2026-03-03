/**
 * Next.js 16 - Async Route Parameters
 *
 * BREAKING CHANGE: params, searchParams, cookies(), headers(), draftMode()
 * are now async and must be awaited in Next.js 16.
 *
 * This template shows the correct patterns for accessing route parameters,
 * search parameters, cookies, and headers in Next.js 16.
 */

import { cookies, headers, draftMode } from 'next/headers'
import { notFound } from 'next/navigation'

// ============================================================================
// Example 1: Page with Async Params
// ============================================================================

interface PageProps {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ q?: string; page?: string }>
}

export default async function BlogPostPage({ params, searchParams }: PageProps) {
  // ✅ Await params and searchParams in Next.js 16
  const { slug } = await params
  const { q, page } = await searchParams

  // Fetch post data
  const post = await fetch(`https://api.example.com/posts/${slug}`)
    .then(r => r.json())
    .catch(() => null)

  if (!post) {
    notFound()
  }

  return (
    <article>
      <h1>{post.title}</h1>
      <div dangerouslySetInnerHTML={{ __html: post.content }} />

      {/* Show search query if present */}
      {q && <p>Search query: {q}</p>}

      {/* Show page number if present */}
      {page && <p>Page: {page}</p>}
    </article>
  )
}

// ============================================================================
// Example 2: Layout with Async Params
// ============================================================================

interface LayoutProps {
  children: React.ReactNode
  params: Promise<{ category: string }>
}

export async function ProductLayout({ children, params }: LayoutProps) {
  // ✅ Await params in layouts too
  const { category } = await params

  return (
    <div>
      <nav>
        <h2>Category: {category}</h2>
      </nav>
      <main>{children}</main>
    </div>
  )
}

// ============================================================================
// Example 3: Accessing Cookies (Async in Next.js 16)
// ============================================================================

export async function UserGreeting() {
  // ✅ Await cookies() in Next.js 16
  const cookieStore = await cookies()
  const userId = cookieStore.get('userId')?.value
  const theme = cookieStore.get('theme')?.value || 'light'

  if (!userId) {
    return <p>Welcome, Guest!</p>
  }

  const user = await fetch(`https://api.example.com/users/${userId}`)
    .then(r => r.json())

  return (
    <div data-theme={theme}>
      <p>Welcome back, {user.name}!</p>
    </div>
  )
}

// ============================================================================
// Example 4: Accessing Headers (Async in Next.js 16)
// ============================================================================

export async function RequestInfo() {
  // ✅ Await headers() in Next.js 16
  const headersList = await headers()
  const userAgent = headersList.get('user-agent') || 'Unknown'
  const referer = headersList.get('referer') || 'Direct'
  const ip = headersList.get('x-forwarded-for') || 'Unknown'

  return (
    <div>
      <p>User Agent: {userAgent}</p>
      <p>Referrer: {referer}</p>
      <p>IP: {ip}</p>
    </div>
  )
}

// ============================================================================
// Example 5: Draft Mode (Async in Next.js 16)
// ============================================================================

export async function DraftBanner() {
  // ✅ Await draftMode() in Next.js 16
  const { isEnabled } = await draftMode()

  if (!isEnabled) {
    return null
  }

  return (
    <div style={{ background: 'yellow', padding: '1rem' }}>
      <p>🚧 Draft Mode Enabled</p>
      <a href="/api/disable-draft">Exit Draft Mode</a>
    </div>
  )
}

// ============================================================================
// Example 6: Generate Metadata with Async Params
// ============================================================================

import type { Metadata } from 'next'

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  // ✅ Await params in generateMetadata
  const { slug } = await params

  const post = await fetch(`https://api.example.com/posts/${slug}`)
    .then(r => r.json())

  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: [post.coverImage],
    },
  }
}

// ============================================================================
// Example 7: Generate Static Params (Async)
// ============================================================================

export async function generateStaticParams() {
  const posts = await fetch('https://api.example.com/posts')
    .then(r => r.json())

  return posts.map((post: { slug: string }) => ({
    slug: post.slug,
  }))
}

// ============================================================================
// Example 8: Route Handler with Async Params
// ============================================================================

// File: app/api/posts/[id]/route.ts

import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  // ✅ Await params in route handlers
  const { id } = await params

  const post = await fetch(`https://api.example.com/posts/${id}`)
    .then(r => r.json())

  return NextResponse.json(post)
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  // ✅ Await params in route handlers
  const { id } = await params

  await fetch(`https://api.example.com/posts/${id}`, {
    method: 'DELETE',
  })

  return NextResponse.json({ message: 'Post deleted' })
}

// ============================================================================
// Migration Guide: Next.js 15 → Next.js 16
// ============================================================================

// ❌ BEFORE (Next.js 15):
/*
export default function Page({ params, searchParams }) {
  const slug = params.slug // ❌ Sync access
  const query = searchParams.q // ❌ Sync access
}

export function MyComponent() {
  const cookieStore = cookies() // ❌ Sync access
  const headersList = headers() // ❌ Sync access
}
*/

// ✅ AFTER (Next.js 16):
/*
export default async function Page({ params, searchParams }) {
  const { slug } = await params // ✅ Async access
  const { q: query } = await searchParams // ✅ Async access
}

export async function MyComponent() {
  const cookieStore = await cookies() // ✅ Async access
  const headersList = await headers() // ✅ Async access
}
*/

// ============================================================================
// TypeScript Types
// ============================================================================

// Correct types for Next.js 16:
type Params<T = Record<string, string>> = Promise<T>
type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>

// Usage:
type ProductPageProps = {
  params: Params<{ id: string }>
  searchParams: SearchParams
}

// ============================================================================
// Codemod (Automatic Migration)
// ============================================================================

// Run this command to automatically migrate your code:
// npx @next/codemod@canary upgrade latest

/**
 * Summary:
 *
 * 1. ALL route parameters are now async:
 *    - params → await params
 *    - searchParams → await searchParams
 *
 * 2. ALL next/headers functions are now async:
 *    - cookies() → await cookies()
 *    - headers() → await headers()
 *    - draftMode() → await draftMode()
 *
 * 3. Components using these must be async:
 *    - export default async function Page({ params }) { ... }
 *    - export async function Layout({ params }) { ... }
 *    - export async function generateMetadata({ params }) { ... }
 *
 * 4. Route handlers must await params:
 *    - export async function GET(request, { params }) {
 *        const { id } = await params
 *      }
 */
