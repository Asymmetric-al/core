/**
 * Next.js 16 - Cache Components with "use cache" Directive
 *
 * NEW in Next.js 16: Explicit opt-in caching with "use cache" directive.
 * Replaces implicit caching from Next.js 15.
 *
 * This template shows component-level, function-level, and page-level caching.
 */

// ============================================================================
// Example 1: Component-Level Caching
// ============================================================================

'use cache'

// This entire component will be cached
export async function CachedProductList() {
  const products = await fetch('https://api.example.com/products')
    .then(r => r.json())

  return (
    <div>
      <h2>Products</h2>
      <ul>
        {products.map((product: { id: string; name: string; price: number }) => (
          <li key={product.id}>
            {product.name} - ${product.price}
          </li>
        ))}
      </ul>
    </div>
  )
}

// ============================================================================
// Example 2: Function-Level Caching
// ============================================================================

// File: lib/data.ts
'use cache'

export async function getExpensiveData(id: string) {
  console.log('Fetching expensive data...') // Only logs on cache miss

  // Simulate expensive operation
  await new Promise(resolve => setTimeout(resolve, 1000))

  const data = await fetch(`https://api.example.com/items/${id}`)
    .then(r => r.json())

  return data
}

// Usage in component (not cached itself):
import { getExpensiveData } from '@/lib/data'

export async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const product = await getExpensiveData(id) // Cached by function

  return (
    <div>
      <h1>{product.name}</h1>
      <p>{product.description}</p>
    </div>
  )
}

// ============================================================================
// Example 3: Page-Level Caching
// ============================================================================

// File: app/blog/[slug]/page.tsx
'use cache'

export async function generateStaticParams() {
  const posts = await fetch('https://api.example.com/posts')
    .then(r => r.json())

  return posts.map((post: { slug: string }) => ({
    slug: post.slug,
  }))
}

export default async function BlogPost({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  const post = await fetch(`https://api.example.com/posts/${slug}`)
    .then(r => r.json())

  return (
    <article>
      <h1>{post.title}</h1>
      <div dangerouslySetInnerHTML={{ __html: post.content }} />
    </article>
  )
}

// ============================================================================
// Example 4: Partial Prerendering (PPR) - Mix Static & Dynamic
// ============================================================================

// File: app/dashboard/page.tsx

// Static component (cached)
'use cache'
async function StaticHeader() {
  return (
    <header>
      <h1>My Dashboard</h1>
      <nav>
        <a href="/dashboard">Overview</a>
        <a href="/dashboard/settings">Settings</a>
      </nav>
    </header>
  )
}

// Dynamic component (NOT cached) - separate file without "use cache"
// File: components/dynamic-user-info.tsx
import { cookies } from 'next/headers'

export async function DynamicUserInfo() {
  const cookieStore = await cookies()
  const userId = cookieStore.get('userId')?.value

  if (!userId) {
    return <div>Please log in</div>
  }

  const user = await fetch(`https://api.example.com/users/${userId}`)
    .then(r => r.json())

  return (
    <div>
      <p>Welcome, {user.name}</p>
      <p>Balance: ${user.balance}</p>
    </div>
  )
}

// Page combines static + dynamic (Partial Prerendering)
import { DynamicUserInfo } from '@/components/dynamic-user-info'

export default function DashboardPage() {
  return (
    <div>
      <StaticHeader /> {/* Cached (static) */}
      <DynamicUserInfo /> {/* Not cached (dynamic) */}
    </div>
  )
}

// ============================================================================
// Example 5: Selective Caching with Multiple Functions
// ============================================================================

// Cache expensive operations, skip cheap ones

// Cached function
'use cache'
export async function getPopularPosts() {
  const posts = await fetch('https://api.example.com/posts/popular')
    .then(r => r.json())

  return posts
}

// NOT cached (changes frequently)
export async function getRealtimeMetrics() {
  const metrics = await fetch('https://api.example.com/metrics/realtime')
    .then(r => r.json())

  return metrics
}

// Component uses both
export async function Dashboard() {
  const popularPosts = await getPopularPosts() // Cached
  const metrics = await getRealtimeMetrics() // NOT cached

  return (
    <div>
      <div>
        <h2>Popular Posts</h2>
        <ul>
          {popularPosts.map((post: { id: string; title: string }) => (
            <li key={post.id}>{post.title}</li>
          ))}
        </ul>
      </div>

      <div>
        <h2>Realtime Metrics</h2>
        <p>Active users: {metrics.activeUsers}</p>
        <p>Requests/min: {metrics.requestsPerMinute}</p>
      </div>
    </div>
  )
}

// ============================================================================
// Example 6: Cache with Revalidation (using tags)
// ============================================================================

// File: app/actions.ts
'use server'

import { revalidateTag } from 'next/cache'

export async function createPost(formData: FormData) {
  const title = formData.get('title') as string
  const content = formData.get('content') as string

  await fetch('https://api.example.com/posts', {
    method: 'POST',
    body: JSON.stringify({ title, content }),
  })

  // Revalidate cached posts
  revalidateTag('posts', 'max')
}

// File: lib/posts.ts
'use cache'

export async function getPosts() {
  const response = await fetch('https://api.example.com/posts', {
    next: { tags: ['posts'] }, // Tag for revalidation
  })

  return response.json()
}

// ============================================================================
// Example 7: Conditional Caching (Cache Based on User Role)
// ============================================================================

import { cookies } from 'next/headers'

export async function getContent() {
  const cookieStore = await cookies()
  const userRole = cookieStore.get('role')?.value

  if (userRole === 'admin') {
    // Don't cache admin content (changes frequently)
    return fetch('https://api.example.com/admin/content').then(r => r.json())
  }

  // Cache public content
  return getCachedPublicContent()
}

'use cache'
async function getCachedPublicContent() {
  return fetch('https://api.example.com/public/content').then(r => r.json())
}

// ============================================================================
// Example 8: Inline "use cache" (Granular Control)
// ============================================================================

export async function MixedCachingComponent() {
  // This function call is cached
  const cachedData = await (async function() {
    'use cache'
    return fetch('https://api.example.com/slow-data').then(r => r.json())
  })()

  // This function call is NOT cached
  const freshData = await fetch('https://api.example.com/fresh-data').then(r => r.json())

  return (
    <div>
      <div>Cached: {cachedData.value}</div>
      <div>Fresh: {freshData.value}</div>
    </div>
  )
}

// ============================================================================
// Migration Guide: Next.js 15 → Next.js 16
// ============================================================================

// ❌ BEFORE (Next.js 15 - Implicit Caching):
/*
// All Server Components were cached by default
export async function MyComponent() {
  const data = await fetch('https://api.example.com/data')
  return <div>{data.value}</div>
}

// To opt-out of caching:
export const revalidate = 0 // or export const dynamic = 'force-dynamic'
*/

// ✅ AFTER (Next.js 16 - Explicit Opt-In Caching):
/*
// Components are NOT cached by default
export async function MyComponent() {
  const data = await fetch('https://api.example.com/data')
  return <div>{data.value}</div>
}

// To opt-IN to caching, add "use cache"
'use cache'
export async function MyCachedComponent() {
  const data = await fetch('https://api.example.com/data')
  return <div>{data.value}</div>
}
*/

// ============================================================================
// Cache Behavior Summary
// ============================================================================

/**
 * "use cache" can be added to:
 * 1. ✅ Components (entire component cached)
 * 2. ✅ Functions (function output cached)
 * 3. ✅ Pages (entire page cached)
 * 4. ✅ Layouts (layout cached)
 * 5. ✅ Inline async functions (granular caching)
 *
 * Default behavior (without "use cache"):
 * - Server Components: NOT cached (change from Next.js 15)
 * - fetch() calls: Cached by default (unchanged)
 *
 * Revalidation:
 * - Use revalidateTag() to invalidate cache by tag
 * - Use updateTag() for immediate read-your-writes
 * - Use refresh() for uncached data only
 *
 * When to use "use cache":
 * ✅ Expensive computations (database queries, API calls)
 * ✅ Stable data (product catalogs, blog posts)
 * ✅ Partial Prerendering (static header + dynamic user info)
 *
 * When NOT to use "use cache":
 * ❌ Real-time data (metrics, notifications)
 * ❌ User-specific data (unless using cookies/headers for cache keys)
 * ❌ Frequently changing data (stock prices, live scores)
 */
