import { Skeleton } from "@asym/ui/components/shadcn/skeleton";

/**
 * Suspense boundary for `await params` plus the tenant lookup in
 * `fetchPublishedCmsPageResult`, which resolves the host via `await headers()`.
 *
 * The body of a CMS page cannot reach the static shell while the tenant comes
 * from a request header — `headers()` is request-time and cannot be called
 * inside `"use cache"`. This boundary is what lets the navbar, footer and this
 * skeleton prerender while the article streams in the same response.
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
