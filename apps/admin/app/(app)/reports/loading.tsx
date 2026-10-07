import { PageShell } from "@asym/ui/components/primitives/page-shell";
import { Skeleton } from "@asym/ui/components/shadcn/skeleton";

export default function Loading() {
  return (
    <PageShell
      title="Reports"
      description="Financial and operational insights for the organization."
      density="compact"
    >
      <div role="status" aria-label="Loading reports" className="space-y-6">
        <span className="sr-only">Loading reports…</span>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }, (_, index) => (
            <Skeleton key={index} className="h-23 rounded-2xl" />
          ))}
        </div>
        <div className="grid gap-4 xl:grid-cols-2">
          <Skeleton className="h-80 w-full rounded-2xl" />
          <Skeleton className="h-80 w-full rounded-2xl" />
        </div>
      </div>
    </PageShell>
  );
}
