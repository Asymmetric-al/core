import { PageShell } from "@asym/ui/components/primitives/page-shell";
import { Skeleton } from "@asym/ui/components/shadcn/skeleton";
export default function Loading() {
  return (
    <PageShell
      title="Tasks"
      description="Follow-ups raised by Mission Control."
      density="compact"
    >
      <div
        role="status"
        aria-label="Loading Tasks"
        className="flex flex-col gap-4"
      >
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-32 w-full" />
      </div>
    </PageShell>
  );
}
