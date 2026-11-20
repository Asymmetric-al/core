import { Skeleton } from "@asym/ui/components/shadcn/skeleton";

/**
 * Shown while the request's donor membership resolves. The portal header
 * renders inside the scoped document with the pages (WP2b, AL-2675), so this
 * frame holds its place with a bar of the same height, and the main area
 * keeps the skip link's target. It reads no portal data: a fallback that did
 * would call the app's own API before any scope was fixed. Not `null`: an
 * empty fallback would commit a blank page.
 */
export function DonorPortalFrameSkeleton() {
  return (
    <>
      <div
        aria-hidden="true"
        className="sticky top-0 z-40 border-b border-border bg-background"
      >
        <div className="container-responsive flex h-16 items-center gap-6">
          <Skeleton className="size-8 rounded-lg" />
          <div className="hidden md:block">
            <Skeleton className="h-4 w-80" />
          </div>
          <Skeleton className="ml-auto size-8 rounded-full" />
        </div>
      </div>
      <div className="flex flex-1 flex-col">
        <main id="main-content" className="flex-1 pt-8 pb-20">
          <div className="container-responsive">
            <DonorPortalContentSkeleton />
          </div>
        </main>
      </div>
    </>
  );
}

/** The main area's placeholder inside the frame. */
function DonorPortalContentSkeleton() {
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
