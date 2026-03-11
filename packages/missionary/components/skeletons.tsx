import { Skeleton } from "@asym/ui/components/shadcn/skeleton";
import { Card, CardContent, CardHeader } from "@asym/ui/components/shadcn/card";

export function MetricsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {[...Array(4)].map((_, i) => (
        <Card
          key={i}
          className="border-zinc-200 bg-white shadow-sm rounded-3xl"
        >
          <CardContent className="flex items-center gap-4 p-6">
            <Skeleton className="h-12 w-12 rounded-2xl bg-zinc-100" />
            <div className="min-w-0 flex-1 space-y-2">
              <Skeleton className="h-3 w-20 bg-zinc-50" />
              <Skeleton className="h-6 w-24 bg-zinc-100" />
              <Skeleton className="h-3 w-32 bg-zinc-50" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <Card className="border-zinc-200 bg-white shadow-sm rounded-3xl">
      <CardHeader className="p-6">
        <div className="space-y-2">
          <Skeleton className="h-3 w-24 bg-zinc-50" />
          <Skeleton className="h-8 w-48 bg-zinc-100" />
        </div>
      </CardHeader>
      <CardContent className="p-6 pt-0">
        <Skeleton className="h-[350px] w-full rounded-2xl bg-zinc-50/50" />
      </CardContent>
    </Card>
  );
}

export function ActivityFeedSkeleton() {
  return (
    <Card className="border-zinc-200 bg-white shadow-sm rounded-3xl overflow-hidden">
      <CardHeader className="p-6">
        <div className="flex items-center gap-3">
          <Skeleton className="h-12 w-12 rounded-2xl bg-zinc-100" />
          <div className="space-y-2">
            <Skeleton className="h-3 w-24 bg-zinc-50" />
            <Skeleton className="h-6 w-48 bg-zinc-100" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-zinc-50">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-6 md:px-8 py-5">
              <Skeleton className="h-11 w-11 rounded-full bg-zinc-100" />
              <div className="min-w-0 flex-1 space-y-2">
                <Skeleton className="h-4 w-32 bg-zinc-100" />
                <Skeleton className="h-3 w-48 bg-zinc-50" />
              </div>
              <Skeleton className="h-4 w-12 bg-zinc-100" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
