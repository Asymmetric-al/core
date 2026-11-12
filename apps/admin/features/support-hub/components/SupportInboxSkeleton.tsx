"use client";

import { Skeleton } from "@asym/ui/components/shadcn/skeleton";

/**
 * Skeleton mirror of the inbox layout: stats strip, tab strip, toolbar,
 * and the body grid. Rendered by `apps/admin/app/(app)/support/loading.tsx`.
 */
export function SupportInboxSkeleton() {
  return (
    <div
      className="@container space-y-3 sm:space-y-4"
      role="status"
      aria-label="Loading inbox"
    >
      <span className="sr-only">Loading inbox…</span>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton
            key={`support-stat-${index}`}
            className="h-24 rounded-2xl"
          />
        ))}
      </div>
      <div className="flex items-center justify-between gap-3">
        <Skeleton className="h-10 w-full max-w-105 rounded-xl" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-10 w-32 rounded-xl" />
          <Skeleton className="h-10 w-24 rounded-xl" />
        </div>
      </div>
      <div className="flex flex-col gap-4 lg:flex-row">
        <div className="flex flex-1 flex-col gap-3">
          <Skeleton className="h-10 w-full rounded-xl" />
          <div className="grid grid-cols-1 gap-3 @lg:grid-cols-2 @5xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, columnIndex) => (
              <Skeleton
                key={`support-column-${columnIndex}`}
                className="h-64 rounded-2xl"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
