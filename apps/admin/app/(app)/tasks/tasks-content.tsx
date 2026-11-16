"use client";

import { useMissionControlNeedsAttention } from "@asym/database/hooks";
import {
  MetricCard,
  MetricGrid,
} from "@asym/ui/components/primitives/metric-card";
import { PageShell } from "@asym/ui/components/primitives/page-shell";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@asym/ui/components/shadcn/alert";
import { Button } from "@asym/ui/components/shadcn/button";
import { Skeleton } from "@asym/ui/components/shadcn/skeleton";

import { FollowUpsGrid } from "./follow-ups-grid";

export function TasksPageContent() {
  const query = useMissionControlNeedsAttention();
  const items = query.data?.items ?? [];
  return (
    <PageShell
      title="Tasks"
      description="Follow-ups raised by Mission Control. Open the linked record to resolve the underlying issue. Team to-dos are no longer available here."
      density="compact"
    >
      <section
        aria-labelledby="needs-attention-heading"
        className="flex flex-col gap-4"
      >
        <h2 id="needs-attention-heading" className="text-lg font-semibold">
          Needs attention
        </h2>
        {query.isError ? (
          <Alert variant="destructive">
            <AlertTitle>Couldn’t load follow-ups</AlertTitle>
            <AlertDescription>
              <p>{query.error.message}</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => void query.refetch()}
              >
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        ) : query.isPending ? (
          <div role="status" aria-label="Loading follow-ups">
            <Skeleton className="h-32 w-full" />
          </div>
        ) : (
          <>
            <p className="text-sm text-muted-foreground">
              Showing up to 100 most recently seen open follow-ups. Counts below
              cover this list; older items may not be shown. Retired issues are
              excluded.
            </p>
            <MetricGrid label="Listed follow-ups">
              <MetricCard
                label="Listed follow-ups"
                value={items.length}
                detail="Open items in this list"
              />
              <MetricCard
                label="Critical"
                value={
                  items.filter((item) => item.urgency === "critical").length
                }
                detail="Handle these first"
              />
              <MetricCard
                label="High"
                value={items.filter((item) => item.urgency === "high").length}
                detail="Handle soon"
              />
            </MetricGrid>
            <FollowUpsGrid items={items} />
          </>
        )}
      </section>
    </PageShell>
  );
}
