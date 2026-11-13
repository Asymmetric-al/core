import { Card } from "@asym/ui/components/shadcn/card";
import { Skeleton } from "@asym/ui/components/shadcn/skeleton";

/**
 * In-page loading skeleton (inside PageShell, no duplicate header). It mirrors
 * the live layout — summary cards, then the grid card with its toolbar, rows
 * and pagination — so the page does not jump when data arrives.
 */
export function ContributionsBoneyardFallback() {
  return (
    <div aria-busy="true" className="flex flex-col gap-6">
      <p role="status" className="sr-only">
        Loading contributions
      </p>

      <div aria-hidden="true" className="flex flex-col gap-3">
        <Skeleton className="h-5 w-36" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }, (_, index) => (
            <Card key={index} className="gap-3 px-4">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-7 w-32" />
              <Skeleton className="h-3 w-28" />
            </Card>
          ))}
        </div>
      </div>

      <Card aria-hidden="true" className="gap-4">
        <div className="flex flex-wrap items-center gap-2 px-4">
          <Skeleton className="h-8 w-full sm:w-64" />
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-18" />
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-8 w-20" />
        </div>
        <div className="flex flex-col border-y">
          <div className="hidden h-10 items-center gap-6 bg-muted/40 px-4 md:flex">
            <Skeleton className="size-4" />
            <Skeleton className="h-3 w-24" />
            <Skeleton className="ms-auto h-3 w-16" />
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-3 w-28" />
            <Skeleton className="h-3 w-16" />
          </div>
          {Array.from({ length: 8 }, (_, index) => (
            <div
              key={index}
              className="flex items-center gap-3 border-t px-4 py-3 first:border-t-0 md:first:border-t"
            >
              <Skeleton className="size-4" />
              <Skeleton className="size-8 rounded-full" />
              <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                <Skeleton className="h-3.5 w-32" />
                <Skeleton className="h-3 w-44 max-w-full" />
              </div>
              <Skeleton className="h-4 w-16" />
              <div className="hidden items-center gap-3 md:flex">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-5 w-24 rounded-full" />
              </div>
              <div className="hidden items-center gap-3 lg:flex">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-16" />
              </div>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between gap-4 px-4">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-8 w-56" />
        </div>
      </Card>
    </div>
  );
}
