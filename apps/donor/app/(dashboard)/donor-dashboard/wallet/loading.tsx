import { Skeleton } from "@asym/ui/components/shadcn/skeleton";

export default function Loading() {
  return (
    <div className="mx-auto max-w-5xl space-y-10 pb-24">
      <div className="flex flex-col gap-6 px-1 md:flex-row md:items-end md:justify-between">
        <div className="space-y-3">
          <Skeleton className="h-10 w-40" />
          <Skeleton className="h-3 w-64" />
        </div>
        <Skeleton className="h-12 w-48 rounded-lg" />
      </div>

      <Skeleton className="h-36 rounded-2xl" />

      <div className="space-y-6">
        {Array.from({ length: 2 }).map((_, index) => (
          <div
            className="grid gap-6 rounded-2xl border border-border bg-card p-5 md:grid-cols-[minmax(0,280px)_1fr]"
            key={index}
          >
            <Skeleton className="aspect-[1.586/1] rounded-2xl" />
            <div className="space-y-4">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-64" />
              <Skeleton className="h-20 rounded-xl" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
