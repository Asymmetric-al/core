import { Skeleton } from "@asym/ui/components/shadcn/skeleton";

/**
 * Fallback for the dashboard group boundary. Deliberately not `null`: an empty
 * fallback would commit a blank page while the nested layout's session read
 * resolves.
 */
export function DashboardShellSkeleton() {
  return (
    <div
      className="flex min-h-dvh flex-col bg-background"
      aria-busy="true"
      role="status"
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
