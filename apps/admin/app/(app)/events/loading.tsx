import { PageShell } from "@asym/ui/components/primitives/page-shell";
import { Skeleton } from "@asym/ui/components/shadcn/skeleton";
export default function Loading() {
  return (
    <PageShell
      title="Events"
      description="Event registration, venues, speakers and attendees will appear here when connected."
      density="compact"
    >
      <div
        role="status"
        aria-label="Loading Events"
        className="flex flex-col gap-4"
      >
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-32 w-full" />
      </div>
    </PageShell>
  );
}
