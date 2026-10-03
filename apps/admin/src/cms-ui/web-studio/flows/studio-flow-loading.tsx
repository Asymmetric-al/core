import { Skeleton } from "@asym/ui/components/shadcn/skeleton";

export function StudioFlowLoading() {
  return (
    <div role="status" className="space-y-4 p-6">
      <p className="text-sm text-muted-foreground">Loading Web Studio…</p>
      <div aria-hidden="true" className="space-y-3">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    </div>
  );
}
