import { Skeleton } from "@asym/ui/components/shadcn/skeleton";

/**
 * Fallback for the dashboard group boundary. Deliberately not `null`: an empty
 * fallback standing in for real content is exactly the failure this change
 * exists to remove.
 */
export function DashboardShellSkeleton() {
  return (
    <div
      className="flex min-h-screen flex-col bg-zinc-50"
      aria-busy="true"
      aria-label="Loading dashboard"
    >
      <div className="pt-24">
        <div className="container-responsive">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="mt-3 h-4 w-96 max-w-full" />
          <div className="mt-10 space-y-4">
            <Skeleton className="h-32 w-full rounded-xl" />
            <Skeleton className="h-32 w-full rounded-xl" />
            <Skeleton className="h-32 w-full rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}
