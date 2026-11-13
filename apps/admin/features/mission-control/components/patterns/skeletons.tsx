import { Card, CardContent, CardHeader } from "@asym/ui/components/shadcn/card";
import { Skeleton } from "@asym/ui/components/shadcn/skeleton";

export function PageShellSkeleton({
  label = "Loading page…",
  announce = true,
}: {
  label?: string;
  announce?: boolean;
}) {
  return (
    <div className="mx-auto flex w-full max-w-(--page-max) flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
      {announce ? (
        <span role="status" className="sr-only">
          {label}
        </span>
      ) : null}
      <div aria-hidden="true" className="flex flex-col gap-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48 max-w-full" />
          <Skeleton className="h-4 w-96 max-w-full" />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </div>
    </div>
  );
}

export function ShellSkeleton() {
  return (
    <div className="flex min-h-svh w-full">
      <span role="status" className="sr-only">
        Loading Mission Control…
      </span>
      <div
        aria-hidden="true"
        className="hidden w-64 shrink-0 space-y-6 border-r bg-sidebar p-4 md:block"
      >
        <Skeleton className="h-10 w-full" />
        {Array.from({ length: 8 }, (_, index) => (
          <Skeleton key={index} className="h-8 w-full" />
        ))}
      </div>
      <div className="min-w-0 flex-1">
        <div
          aria-hidden="true"
          className="flex h-12 items-center gap-3 border-b px-4"
        >
          <Skeleton className="size-6" />
          <Skeleton className="h-4 w-32" />
        </div>
        <PageShellSkeleton announce={false} />
      </div>
    </div>
  );
}

function TileCardSkeleton() {
  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-2">
        <Skeleton className="size-10 rounded-lg" />
        <Skeleton className="mt-3 h-5 w-3/4" />
        <Skeleton className="mt-1 h-4 w-full" />
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-3 pt-0">
        <Skeleton className="h-3 w-full" />
        <div className="mt-auto flex gap-1.5">
          <Skeleton className="h-7 w-20" />
          <Skeleton className="h-7 w-24" />
          <Skeleton className="h-7 w-16" />
        </div>
      </CardContent>
    </Card>
  );
}

function TilesGridSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <TileCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-4 border-b border-border pb-3">
        <Skeleton className="size-4" />
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-28" />
        <Skeleton className="ml-auto h-4 w-16" />
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 py-3">
          <Skeleton className="size-4" />
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-28" />
          <Skeleton className="ml-auto h-4 w-16" />
        </div>
      ))}
    </div>
  );
}

export function PageHeaderSkeleton() {
  return (
    <div className="border-b border-border bg-background px-6 py-4 lg:px-8">
      <Skeleton className="mb-2 h-4 w-48" />
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <Skeleton className="h-9 w-32" />
      </div>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-8 p-6 lg:p-8">
      <div className="space-y-2">
        <Skeleton className="h-9 w-56" />
        <Skeleton className="h-5 w-96" />
      </div>
      <div className="space-y-3">
        <Skeleton className="h-4 w-24" />
        <div className="flex gap-2">
          <Skeleton className="h-9 w-32" />
          <Skeleton className="h-9 w-28" />
          <Skeleton className="h-9 w-36" />
          <Skeleton className="h-9 w-24" />
        </div>
      </div>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-4 w-20" />
        </div>
        <TilesGridSkeleton />
      </div>
    </div>
  );
}
