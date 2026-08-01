import { Skeleton } from "@asym/ui/components/shadcn/skeleton";

/**
 * Suspense boundary for `await searchParams` in `page.tsx`. Keeping it at the
 * segment means the navbar and footer still prerender into the static shell;
 * only the checkout body streams.
 *
 * Geometry mirrors the real frame so the reveal does not shift layout.
 */
export default function CheckoutLoading() {
  return (
    <div
      className="pt-24 pb-32"
      role="status"
      aria-busy="true"
      aria-label="Loading checkout"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <Skeleton className="h-8 w-56" />
            <Skeleton className="mt-3 h-4 w-80 max-w-full" />
            <div className="mt-8 grid grid-cols-4 gap-3">
              <Skeleton className="h-14 rounded-xl" />
              <Skeleton className="h-14 rounded-xl" />
              <Skeleton className="h-14 rounded-xl" />
              <Skeleton className="h-14 rounded-xl" />
            </div>
            <Skeleton className="mt-6 h-12 w-full rounded-xl" />
            <Skeleton className="mt-8 h-5 w-40" />
            <Skeleton className="mt-4 h-12 w-full rounded-xl" />
            <Skeleton className="mt-3 h-12 w-full rounded-xl" />
            <Skeleton className="mt-3 h-12 w-full rounded-xl" />
            <Skeleton className="mt-8 h-14 w-full rounded-xl" />
          </div>
          <div className="lg:col-span-5">
            <div className="rounded-2xl border border-zinc-200 bg-white p-6">
              <Skeleton className="h-5 w-32" />
              <div className="mt-6 flex items-center gap-3">
                <Skeleton className="size-12 rounded-full" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="mt-2 h-3 w-24" />
                </div>
              </div>
              <Skeleton className="mt-6 h-px w-full" />
              <Skeleton className="mt-6 h-4 w-full" />
              <Skeleton className="mt-3 h-4 w-3/4" />
              <Skeleton className="mt-6 h-6 w-32" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
