import { Skeleton } from "@asym/ui/components/shadcn/skeleton";

/**
 * Shown in the portal's main area while the request's donor membership
 * resolves; the header and footer stay in the static shell. Not `null`: an
 * empty fallback would commit a blank page.
 */
export function DonorPortalContentSkeleton() {
  return (
    <div role="status" aria-busy="true" aria-label="Loading your portal">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="mt-3 h-4 w-96 max-w-full" />
      <div className="mt-10 space-y-4">
        <Skeleton className="h-32 w-full rounded-xl" />
        <Skeleton className="h-32 w-full rounded-xl" />
      </div>
    </div>
  );
}
