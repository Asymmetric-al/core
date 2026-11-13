import { Skeleton } from "@asym/ui/components/shadcn/skeleton";

import { SupportWorkspaceShell } from "@/features/support-hub/components/workspace";
export default function SupportReportsLoading() {
  return (
    <SupportWorkspaceShell section="reports" title="Support reports">
      <div role="status" aria-label="Loading report" className="space-y-4">
        <span className="sr-only">Loading report…</span>
        <Skeleton className="h-9 w-full" />
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {Array.from({ length: 4 }, (_, index) => (
            <Skeleton key={index} className="h-24" />
          ))}
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </div>
    </SupportWorkspaceShell>
  );
}
