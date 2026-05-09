import { Skeleton } from "@asym/ui/components/shadcn/skeleton";

export default function Loading() {
  return (
    <div className="mx-auto max-w-3xl space-y-8 pb-20">
      <div className="sticky top-0 z-30 border-b border-border/50 bg-background/90 py-4 backdrop-blur-xl">
        <div className="mx-auto flex max-w-2xl gap-2 overflow-hidden px-1">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton className="h-9 w-24 rounded-full" key={index} />
          ))}
        </div>
      </div>

      {Array.from({ length: 2 }).map((_, index) => (
        <article
          className="space-y-6 rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8"
          key={index}
        >
          <div className="flex items-center gap-3">
            <Skeleton className="size-10 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-44" />
              <Skeleton className="h-3 w-32" />
            </div>
          </div>
          <Skeleton className="h-7 w-2/3" />
          <Skeleton className="h-[300px] rounded-xl sm:h-[400px]" />
          <div className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </article>
      ))}
    </div>
  );
}
