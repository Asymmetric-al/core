import { Card, CardContent, CardHeader } from "@asym/ui/components/shadcn/card";
import { Skeleton } from "@asym/ui/components/shadcn/skeleton";

const METRICS_SKELETON_KEYS = [
  "metric-a",
  "metric-b",
  "metric-c",
  "metric-d",
] as const;

export function MetricsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {METRICS_SKELETON_KEYS.map((key) => (
        <Card key={key}>
          <CardContent className="flex items-center gap-4 p-6">
            <Skeleton className="size-12 rounded-2xl" />
            <div className="min-w-0 flex-1 space-y-2">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-3 w-32" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <Card>
      <CardHeader className="p-6">
        <div className="space-y-2">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-8 w-48" />
        </div>
      </CardHeader>
      <CardContent className="p-6 pt-0">
        <Skeleton className="h-87.5 w-full rounded-2xl" />
      </CardContent>
    </Card>
  );
}

const ACTIVITY_SKELETON_KEYS = [
  "activity-a",
  "activity-b",
  "activity-c",
  "activity-d",
] as const;

export function ActivityFeedSkeleton() {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="p-6">
        <div className="flex items-center gap-3">
          <Skeleton className="size-12 rounded-2xl" />
          <div className="space-y-2">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-6 w-48" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-border">
          {ACTIVITY_SKELETON_KEYS.map((key) => (
            <div
              key={key}
              className="flex items-center gap-4 px-6 md:px-8 py-5"
            >
              <Skeleton className="size-11 rounded-full" />
              <div className="min-w-0 flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-48 max-w-full" />
              </div>
              <Skeleton className="h-4 w-12" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
