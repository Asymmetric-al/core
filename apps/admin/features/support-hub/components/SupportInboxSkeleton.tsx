"use client";

import { Skeleton } from "@asym/ui/components/shadcn/skeleton";

/**
 * Skeleton mirror of the inbox layout: stats strip, tab strip, toolbar,
 * and the body grid. Rendered by `apps/admin/app/support/loading.tsx`.
 */
export function SupportInboxSkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton
            key={`support-stat-${index}`}
            className="h-24 rounded-2xl"
          />
        ))}
      </div>
      <div className="flex items-center justify-between gap-3">
        <Skeleton className="h-10 w-[420px] rounded-xl" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-10 w-32 rounded-xl" />
          <Skeleton className="h-10 w-24 rounded-xl" />
        </div>
      </div>
      <div className="flex flex-col gap-4 lg:flex-row">
        <div className="flex flex-1 flex-col gap-3">
          <Skeleton className="h-10 w-full rounded-xl" />
          <div className="grid h-[480px] grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, columnIndex) => (
              <Skeleton
                key={`support-column-${columnIndex}`}
                className="h-full rounded-2xl"
              />
            ))}
          </div>
        </div>
        <Skeleton className="h-[480px] w-full rounded-2xl lg:w-[360px]" />
      </div>
    </div>
  );
}
