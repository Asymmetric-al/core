import { Skeleton } from "@asym/ui/components/shadcn/skeleton";

/**
 * Without this file the nearest boundary above `/checkout` was the root layout's
 * `<Suspense fallback={null}>`, so the whole content region committed EMPTY on
 * every navigation while `page.tsx` awaited `searchParams`.
 *
 * The geometry is copied from the real frame in `checkout-client.tsx` (the
 * `min-h-screen … pt-24 pb-32` wrapper, `container … max-w-7xl`, and the
 * `lg:grid-cols-12` 7/5 split) so the skeleton occupies the same box at every
 * breakpoint and the swap does not shift layout.
 */
export default function CheckoutLoading() {
  return (
    <div
      className="min-h-screen bg-white font-sans pb-32 pt-24"
      role="status"
      aria-busy="true"
      aria-label="Loading your gift"
    >
      <div className="container mx-auto px-6 max-w-7xl">
        {/* StepIndicator */}
        <div className="flex items-center justify-center gap-4 mb-16">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="size-8 rounded-full" />
              <Skeleton className="h-3 w-20 hidden sm:block" />
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 items-start">
          <div className="lg:col-span-7 space-y-8">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-12 w-3/4" />
            <Skeleton className="h-4 w-2/3" />
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-16 rounded-xl" />
              ))}
            </div>
            <Skeleton className="h-14 w-full rounded-xl" />
          </div>

          <div className="lg:col-span-5 space-y-6">
            <Skeleton className="h-64 w-full rounded-2xl" />
            <Skeleton className="h-12 w-full rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}
