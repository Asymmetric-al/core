import { Skeleton } from "@asym/ui/components/shadcn/skeleton";

/**
 * Suspense boundary for `await params` plus the tenant lookup, which resolves
 * the host via `await headers()` and so cannot live inside `use cache`. It lets
 * the navbar, footer and this skeleton prerender while the article streams.
 *
 * Consequence: the article lands in `<div hidden>`, so a consumer that does not
 * run JavaScript sees this skeleton. Every other public route emits its content
 * inline. Exporting `unstable_instant = false` here and deleting this file
 * would fix that by letting the render block — deliberately not done, because
 * it drops the prerendered shell to zero bytes and nothing paints until the
 * read completes, against Phase 5 US2. Revisit once #525 makes published reads
 * cached (ADR-0030), when a blocking render is a cache hit.
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
