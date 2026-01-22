import {
  PageHeaderSkeleton,
  TableSkeleton,
} from "@/features/mission-control/components/patterns/skeletons";
import { Skeleton } from "@asym/ui/components/shadcn/skeleton";

export default function Loading() {
  return (
    <div className="flex h-full flex-col">
      <PageHeaderSkeleton />
      <div className="flex-1 p-6 lg:p-8">
        <div className="mb-6 grid gap-4 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-lg border bg-card p-4">
              <Skeleton className="mb-2 h-3 w-24" />
              <Skeleton className="h-8 w-20" />
            </div>
          ))}
        </div>
        <TableSkeleton rows={8} />
      </div>
    </div>
  );
}
