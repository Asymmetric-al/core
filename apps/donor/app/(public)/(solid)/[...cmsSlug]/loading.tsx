import { Skeleton } from "@asym/ui/components/shadcn/skeleton";

/**
 * Suspense boundary for `await params` plus the tenant lookup in
 * `fetchPublishedCmsPageResult`, which resolves the host via `await headers()`.
 *
 * The body of a CMS page cannot reach the static shell while the tenant comes
 * from a request header — `headers()` is request-time and cannot be called
 * inside `"use cache"`. This boundary is what lets the navbar, footer and this
 * skeleton prerender while the article streams in the same response.
 *
 * Known consequence: because the article streams, it lands in `<div hidden>`
 * and is revealed by an inline script, so a consumer that does not execute
 * JavaScript sees this skeleton rather than the article. Every other public
 * route emits its content inline; this one cannot yet.
 *
 * The route CAN be made to emit the article inline by exporting
 * `unstable_instant = false` here and deleting this file, which exempts the
 * segment from static-shell validation and lets the render block. That is
 * deliberately NOT done: it drops the route's prerendered shell to zero bytes,
 * so nothing paints until the read completes — directly against Phase 5 US2
 * ("the page shell to appear instantly ... so that I never stare at a blank
 * loading screen"). While published reads are uncached that blank window is a
 * live round-trip to the admin app.
 *
 * Revisit once #525 lands (function-level `use cache` + `cacheTag` + bounded
 * `cacheLife`, per ADR-0030): a blocking render off a warm cache is fast, and
 * the shell/SEO trade largely dissolves. Do not make the trade before then.
 */
export default function CmsPageLoading() {
  return (
    <div
      className="mx-auto w-full max-w-4xl px-4 py-16 sm:px-6 lg:px-8"
      aria-busy="true"
      role="status"
      aria-label="Loading page"
    >
      <Skeleton className="h-3 w-28" />
      <Skeleton className="mt-4 h-9 w-3/4" />
      <Skeleton className="mt-3 h-9 w-1/2" />
      <Skeleton className="mt-6 h-4 w-2/3" />
      <div className="mt-10 space-y-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/6" />
      </div>
    </div>
  );
}
