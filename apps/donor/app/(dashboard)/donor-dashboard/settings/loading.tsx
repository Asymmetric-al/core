import { Skeleton } from "@asym/ui/components/shadcn/skeleton";

export default function Loading() {
  return (
    <div className="mx-auto max-w-5xl space-y-8 pb-20">
      <div className="space-y-3">
        <Skeleton className="h-9 w-48" />
        <Skeleton className="h-4 w-72 max-w-full" />
      </div>

      <Skeleton className="h-[220px] rounded-2xl" />
      <Skeleton className="h-[280px] rounded-2xl" />
    </div>
  );
}
