import { PageShell } from "@asym/ui/components/primitives/page-shell";
import { Skeleton } from "@asym/ui/components/shadcn/skeleton";
export default function Loading() {
  return (
    <PageShell title="Support knowledge">
      <div role="status" aria-label="Loading knowledge" className="space-y-4">
        <span className="sr-only">Loading knowledge…</span>
        <Skeleton className="h-9 w-full max-w-md" />
        <Skeleton className="h-64 w-full" />
      </div>
    </PageShell>
  );
}
