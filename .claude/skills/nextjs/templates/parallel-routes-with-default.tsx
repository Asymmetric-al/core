/**
 * Next.js 16 - Parallel Routes with Required default.js
 *
 * BREAKING CHANGE: Parallel routes now REQUIRE explicit default.js files.
 * Without them, routes will fail during soft navigation.
 *
 * Directory structure:
 * app/
 * ├── @modal/
 * │   ├── login/
 * │   │   └── page.tsx
 * │   └── default.tsx    ← REQUIRED in Next.js 16
 * ├── @feed/
 * │   ├── trending/
 * │   │   └── page.tsx
 * │   └── default.tsx    ← REQUIRED in Next.js 16
 * └── layout.tsx
 */

// ============================================================================
// Example 1: Modal + Main Content (Common Pattern)
// ============================================================================

// File: app/layout.tsx
export default function RootLayout({
  children,
  modal,
}: {
  children: React.ReactNode
  modal: React.ReactNode
}) {
  return (
    <html>
      <body>
        {modal}
        <main>{children}</main>
      </body>
    </html>
  )
}

// File: app/@modal/login/page.tsx
export default function LoginModal() {
  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>Login</h2>
        <form>
          <input type="email" placeholder="Email" />
          <input type="password" placeholder="Password" />
          <button type="submit">Login</button>
        </form>
      </div>
    </div>
  )
}

// File: app/@modal/default.tsx (REQUIRED)
export default function ModalDefault() {
  return null // No modal shown by default
}

// File: app/page.tsx
export default function HomePage() {
  return (
    <div>
      <h1>Home Page</h1>
      <a href="/login">Open Login Modal</a>
    </div>
  )
}

// ============================================================================
// Example 2: Dashboard with Multiple Panels
// ============================================================================

// File: app/dashboard/layout.tsx
export default function DashboardLayout({
  children,
  analytics,
  notifications,
  activity,
}: {
  children: React.ReactNode
  analytics: React.ReactNode
  notifications: React.ReactNode
  activity: React.ReactNode
}) {
  return (
    <div className="dashboard-layout">
      <aside className="sidebar">
        {notifications}
      </aside>

      <main className="main-content">
        {children}
        {analytics}
      </main>

      <aside className="activity-sidebar">
        {activity}
      </aside>
    </div>
  )
}

// File: app/dashboard/@analytics/overview/page.tsx
export default async function AnalyticsOverview() {
  const stats = await fetch('https://api.example.com/stats').then(r => r.json())

  return (
    <div className="analytics-panel">
      <h2>Analytics</h2>
      <div>
        <p>Page Views: {stats.pageViews}</p>
        <p>Unique Visitors: {stats.uniqueVisitors}</p>
      </div>
    </div>
  )
}

// File: app/dashboard/@analytics/default.tsx (REQUIRED)
export default function AnalyticsDefault() {
  return (
    <div className="analytics-panel">
      <h2>Analytics</h2>
      <p>No analytics data available</p>
    </div>
  )
}

// File: app/dashboard/@notifications/default.tsx (REQUIRED)
export default function NotificationsDefault() {
  return (
    <div className="notifications-panel">
      <h3>Notifications</h3>
      <p>No new notifications</p>
    </div>
  )
}

// File: app/dashboard/@activity/default.tsx (REQUIRED)
export default function ActivityDefault() {
  return (
    <div className="activity-panel">
      <h3>Recent Activity</h3>
      <p>No recent activity</p>
    </div>
  )
}

// ============================================================================
// Example 3: E-commerce with Product + Reviews
// ============================================================================

// File: app/products/[id]/layout.tsx
export default function ProductLayout({
  children,
  reviews,
  recommendations,
}: {
  children: React.ReactNode
  reviews: React.ReactNode
  recommendations: React.ReactNode
}) {
  return (
    <div className="product-layout">
      <div className="product-main">
        {children}
      </div>

      <div className="product-sidebar">
        {reviews}
        {recommendations}
      </div>
    </div>
  )
}

// File: app/products/[id]/@reviews/page.tsx
export default async function ProductReviews({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const reviews = await fetch(`https://api.example.com/products/${id}/reviews`)
    .then(r => r.json())

  return (
    <div className="reviews">
      <h3>Reviews</h3>
      <ul>
        {reviews.map((review: { id: string; rating: number; comment: string }) => (
          <li key={review.id}>
            <p>⭐ {review.rating}/5</p>
            <p>{review.comment}</p>
          </li>
        ))}
      </ul>
    </div>
  )
}

// File: app/products/[id]/@reviews/default.tsx (REQUIRED)
export default function ReviewsDefault() {
  return (
    <div className="reviews">
      <h3>Reviews</h3>
      <p>No reviews yet</p>
    </div>
  )
}

// File: app/products/[id]/@recommendations/default.tsx (REQUIRED)
export default function RecommendationsDefault() {
  return (
    <div className="recommendations">
      <h3>Recommendations</h3>
      <p>Loading recommendations...</p>
    </div>
  )
}

// ============================================================================
// Example 4: Auth-Gated Content
// ============================================================================

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

// File: app/@auth/default.tsx (REQUIRED)
export default async function AuthDefault() {
  const cookieStore = await cookies()
  const isAuthenticated = cookieStore.get('auth')?.value

  if (!isAuthenticated) {
    redirect('/login')
  }

  return null
}

// File: app/@auth/profile/page.tsx
export default async function ProfilePage() {
  const cookieStore = await cookies()
  const userId = cookieStore.get('userId')?.value

  const user = await fetch(`https://api.example.com/users/${userId}`)
    .then(r => r.json())

  return (
    <div>
      <h2>Profile</h2>
      <p>Name: {user.name}</p>
      <p>Email: {user.email}</p>
    </div>
  )
}

// ============================================================================
// Example 5: Conditional Rendering Based on Slot
// ============================================================================

// File: app/layout.tsx
export default function Layout({
  children,
  banner,
}: {
  children: React.ReactNode
  banner: React.ReactNode
}) {
  // Only show banner on specific pages
  const showBanner = true // Determine based on route

  return (
    <html>
      <body>
        {showBanner && banner}
        <main>{children}</main>
      </body>
    </html>
  )
}

// File: app/@banner/sale/page.tsx
export default function SaleBanner() {
  return (
    <div className="banner sale-banner">
      🎉 50% OFF SALE! Use code SALE50
    </div>
  )
}

// File: app/@banner/default.tsx (REQUIRED)
export default function BannerDefault() {
  return null // No banner by default
}

// ============================================================================
// Example 6: Loading States with Parallel Routes
// ============================================================================

// File: app/dashboard/@analytics/loading.tsx
export default function AnalyticsLoading() {
  return (
    <div className="analytics-panel">
      <h2>Analytics</h2>
      <p>Loading analytics...</p>
      <div className="skeleton-loader" />
    </div>
  )
}

// File: app/dashboard/@notifications/loading.tsx
export default function NotificationsLoading() {
  return (
    <div className="notifications-panel">
      <h3>Notifications</h3>
      <div className="skeleton-loader" />
    </div>
  )
}

// ============================================================================
// Example 7: Error Boundaries with Parallel Routes
// ============================================================================

// File: app/dashboard/@analytics/error.tsx
'use client'

export default function AnalyticsError({
  error,
  reset,
}: {
  error: Error
  reset: () => void
}) {
  return (
    <div className="analytics-panel error">
      <h2>Analytics</h2>
      <p>Failed to load analytics</p>
      <button onClick={reset}>Try Again</button>
    </div>
  )
}

// ============================================================================
// Migration Guide: Next.js 15 → Next.js 16
// ============================================================================

/**
 * BREAKING CHANGE: default.js is now REQUIRED for all parallel routes
 *
 * ❌ BEFORE (Next.js 15):
 * app/
 * ├── @modal/
 * │   └── login/
 * │       └── page.tsx
 * └── layout.tsx
 *
 * This worked in Next.js 15. If no matching route, Next.js rendered nothing.
 *
 * ✅ AFTER (Next.js 16):
 * app/
 * ├── @modal/
 * │   ├── login/
 * │   │   └── page.tsx
 * │   └── default.tsx    ← REQUIRED! Will error without this
 * └── layout.tsx
 *
 * Why the change?
 * Next.js 16 changed how parallel routes handle soft navigation. Without
 * default.js, unmatched slots will error during client-side navigation.
 *
 * What should default.tsx return?
 * - return null (most common - no UI shown)
 * - return <Skeleton /> (loading placeholder)
 * - redirect() to another route
 * - return fallback UI
 */

// ============================================================================
// Common Patterns for default.tsx
// ============================================================================

// Pattern 1: Null (no UI)
export function DefaultNull() {
  return null
}

// Pattern 2: Loading skeleton
export function DefaultSkeleton() {
  return (
    <div className="skeleton">
      <div className="skeleton-line" />
      <div className="skeleton-line" />
      <div className="skeleton-line" />
    </div>
  )
}

// Pattern 3: Fallback message
export function DefaultFallback() {
  return (
    <div>
      <p>Content not available</p>
    </div>
  )
}

// Pattern 4: Redirect
import { redirect } from 'next/navigation'

export function DefaultRedirect() {
  redirect('/dashboard')
}

/**
 * Summary:
 *
 * Parallel Routes in Next.js 16:
 * 1. ✅ Use @folder convention for parallel slots
 * 2. ✅ MUST include default.tsx for each @folder
 * 3. ✅ default.tsx handles unmatched routes during navigation
 * 4. ✅ Can have loading.tsx for loading states
 * 5. ✅ Can have error.tsx for error boundaries
 *
 * Common use cases:
 * - Modals + main content
 * - Dashboard panels
 * - Product + reviews/recommendations
 * - Conditional banners
 * - Auth-gated content
 *
 * Best practices:
 * - Keep default.tsx simple (usually return null)
 * - Use loading.tsx for better UX
 * - Use error.tsx for error handling
 * - Test soft navigation (client-side routing)
 */
