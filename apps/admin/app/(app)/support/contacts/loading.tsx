import { PageShell } from "@asym/ui/components/primitives/page-shell";
import { Skeleton } from "@asym/ui/components/shadcn/skeleton";
export default function Loading() {
  return (
    <PageShell title="Support contacts">
      <div role="status" aria-label="Loading contacts" className="space-y-4">
        <span className="sr-only">Loading contacts…</span>
        <Skeleton className="h-9 w-full max-w-md" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }, (_, index) => (
            <Skeleton key={index} className="h-40" />
          ))}
        </div>
      </div>
    </PageShell>
  );
}
