import { Skeleton } from "@asym/ui/components/shadcn/skeleton";

export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl space-y-8 pb-20">
      <div className="flex flex-col gap-6 text-left md:flex-row md:items-end md:justify-between">
        <div className="space-y-3">
          <Skeleton className="h-9 w-64" />
          <Skeleton className="h-4 w-96 max-w-full" />
        </div>
        <div className="flex gap-3">
          <Skeleton className="h-10 w-36 rounded-lg" />
          <Skeleton className="h-10 w-44 rounded-lg" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-1">
          <Skeleton className="h-[280px] rounded-2xl" />
          <Skeleton className="h-[180px] rounded-2xl" />
        </div>
        <div className="flex flex-col gap-6 lg:col-span-2">
          <Skeleton className="h-14 rounded-2xl" />
          <Skeleton className="h-[420px] rounded-2xl" />
        </div>
      </div>
    </div>
  );
}
