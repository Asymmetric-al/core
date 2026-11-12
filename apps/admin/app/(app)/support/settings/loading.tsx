import { Card, CardContent } from "@asym/ui/components/shadcn/card";
import { Skeleton } from "@asym/ui/components/shadcn/skeleton";

export default function SupportSettingsLoading() {
  return (
    <Card role="status" aria-label="Loading settings…">
      <CardContent className="space-y-4 pt-6">
        <Skeleton className="h-6 w-44" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </CardContent>
    </Card>
  );
}
