import { Skeleton } from "@asym/ui/components/shadcn/skeleton";

export default function Loading() {
  return (
    <div className="flex flex-col gap-10 p-4 sm:p-6 lg:p-8 pb-20">
      {/* Header skeleton — matches PageShell */}
      <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 border-b border-border pb-8">
        <div className="space-y-3">
          <Skeleton className="h-14 w-80" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="h-11 w-24 rounded-xl" />
          <Skeleton className="h-11 w-40 rounded-xl" />
        </div>
      </div>

      {/* Stat cards skeleton */}
      <div className="flex flex-wrap gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="px-6 py-5 rounded-2xl border border-zinc-100 min-w-[160px] space-y-2"
          >
            <Skeleton className="h-9 w-28" />
            <Skeleton className="h-3 w-16" />
          </div>
        ))}
      </div>

      {/* Table skeleton */}
      <div className="space-y-4">
        {/* Toolbar */}
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-80 rounded-xl" />
          <Skeleton className="h-9 w-20 rounded-xl" />
          <Skeleton className="h-9 w-20 rounded-xl" />
        </div>

        {/* Table */}
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <div className="bg-muted/30 px-4 py-3 flex gap-4">
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
              className="flex items-center gap-4 px-4 py-4 border-t border-border"
            >
              <Skeleton className="h-4 w-4 rounded" />
              <div className="flex items-center gap-3 flex-1">
                <Skeleton className="h-9 w-9 rounded-full" />
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
