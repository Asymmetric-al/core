import { Card } from "@asym/ui/components/shadcn/card";
import { Skeleton } from "@asym/ui/components/shadcn/skeleton";

export default function CheckoutLoading() {
  return (
    <div
      className="min-h-dvh bg-background pb-24 pt-24 font-sans"
      role="status"
      aria-busy="true"
      aria-label="Loading your gift"
    >
      <div className="container mx-auto max-w-2xl px-4">
        <Card className="flex flex-col gap-6 p-6">
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-4 w-full" />
          <div className="flex flex-col gap-2">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-9 w-full" />
          </div>
          <Skeleton className="h-4 w-3/4" />
          <div className="grid gap-4 sm:grid-cols-2">
            <Skeleton className="h-9 sm:col-span-2" />
            <Skeleton className="h-9" />
            <Skeleton className="h-9" />
          </div>
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-9 w-full" />
        </Card>
      </div>
    </div>
  );
}
