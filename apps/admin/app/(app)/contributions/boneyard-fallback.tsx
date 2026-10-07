import { Skeleton } from "@asym/ui/components/shadcn/skeleton";

/** In-page fallback when Boneyard bones are missing (inside PageShell, no duplicate header). */
export function ContributionsBoneyardFallback() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="space-y-2 rounded-2xl border border-border bg-card p-4"
          >
            <Skeleton className="h-9 w-28" />
            <Skeleton className="h-3 w-16" />
          </div>
        ))}
      </div>

      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <Skeleton className="h-9 w-full rounded-xl sm:max-w-80" />
          <Skeleton className="h-9 w-20 rounded-xl" />
          <Skeleton className="h-9 w-20 rounded-xl" />
        </div>

        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <div className="hidden gap-4 bg-muted/30 px-4 py-3 sm:flex">
            <Skeleton className="h-4 w-8" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-24" />
          </div>
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="flex flex-wrap items-center gap-3 border-t border-border p-4"
            >
              <Skeleton className="size-4 rounded" />
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <Skeleton className="size-9 rounded-full" />
                <div className="space-y-1.5">
                  <Skeleton className="h-3.5 w-28" />
                  <Skeleton className="h-3 w-36" />
                </div>
              </div>
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-14" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-8" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
