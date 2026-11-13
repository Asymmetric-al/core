import { Skeleton } from "@asym/ui/components/shadcn/skeleton";

export default function Loading() {
  return (
    <div className="flex flex-col gap-6 pb-20">
      <div className="flex flex-col gap-3 pb-4 sm:flex-row sm:items-end sm:justify-between sm:pb-6">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-9 w-40" />
          <Skeleton className="h-4 w-96 max-w-full" />
        </div>
        <Skeleton className="h-9 w-44 rounded-lg" />
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton className="h-22 rounded-xl" key={index} />
        ))}
      </div>

      <Skeleton className="h-9 w-full max-w-md rounded-lg" />

      <div className="flex gap-4 overflow-hidden">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            className="flex w-72 shrink-0 flex-col gap-3 rounded-2xl border border-border bg-card p-4"
            key={index}
          >
            <Skeleton className="h-5 w-28" />
            <Skeleton className="h-28 rounded-xl" />
            <Skeleton className="h-28 rounded-xl" />
          </div>
        ))}
      </div>
    </div>
  );
}
