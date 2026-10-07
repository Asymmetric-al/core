"use client";

import { PageShell } from "@asym/ui/components/primitives/page-shell";
import { Alert, AlertDescription } from "@asym/ui/components/shadcn/alert";
import { Skeleton } from "@asym/ui/components/shadcn/skeleton";
import { AlertTriangle } from "lucide-react";
import { useEffect, useState } from "react";

import {
  WorkflowSummariesTable,
  type WorkflowSummaryRow,
} from "@/features/mission-control/components/WorkflowSummariesTable";

interface SummariesResponse {
  summaries: WorkflowSummaryRow[];
  counts: { urgent: number; visible: number };
}

/**
 * Mission Control workflow operations: product-owned run summaries and
 * notification counts. The detailed orchestration timeline stays in Inngest;
 * this page never mirrors raw step logs.
 */
export default function WorkflowsPageClient() {
  const [data, setData] = useState<SummariesResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetch("/api/admin/workflows/summaries")
      .then(async (response) => {
        if (!response.ok) throw new Error("summaries_unavailable");
        return (await response.json()) as SummariesResponse;
      })
      .then((payload) => {
        if (!cancelled) setData(payload);
      })
      .catch(() => {
        if (!cancelled) {
          setError("Workflow summaries are not available right now.");
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <PageShell
      title="Workflows"
      density="compact"
      description="Durable background work across donations, giving, and email. Product records stay authoritative; urgent items need staff attention."
    >
      <div className="space-y-6">
        {data ? (
          <p className="text-sm text-muted-foreground" role="status">
            {data.counts.urgent} urgent · {data.counts.visible} routine
          </p>
        ) : null}
        {error ? (
          <Alert variant="warning">
            <AlertTriangle />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : data ? (
          <WorkflowSummariesTable summaries={data.summaries} />
        ) : (
          <div
            role="status"
            aria-label="Loading workflow summaries"
            className="space-y-3"
          >
            <span className="sr-only">Loading workflow summaries…</span>
            {Array.from({ length: 4 }, (_, index) => (
              <Skeleton key={index} className="h-14 w-full rounded-xl" />
            ))}
          </div>
        )}
      </div>
    </PageShell>
  );
}
