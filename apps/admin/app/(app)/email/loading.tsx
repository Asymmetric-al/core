import { Skeleton } from "@asym/ui/components/shadcn/skeleton";
export default function Loading() {
  return (
    <div
      role="status"
      aria-label="Loading Email Studio"
      className="flex min-h-0 flex-1 flex-col"
    >
      <div className="flex items-center gap-3 border-b p-3">
        <Skeleton className="h-7 w-40" />
        <div className="flex-1" />
        <Skeleton className="h-8 w-20" />
        <Skeleton className="h-8 w-20" />
      </div>
      <div className="grid min-h-0 flex-1 grid-cols-1 gap-6 bg-muted/30 p-6 lg:grid-cols-4">
        <div className="flex flex-col gap-4 lg:col-span-3">
          <Skeleton className="mx-auto h-96 w-full max-w-2xl" />
        </div>
        <div className="hidden lg:block">
          <Skeleton className="h-full w-full" />
        </div>
      </div>
    </div>
  );
}
