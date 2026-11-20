"use client";

import {
  useRoutePathname as usePathname,
  useTenantRouter as useRouter,
} from "@asym/auth/tenant-navigation";
import { ownApiFetch } from "@asym/database/own-api";
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
import { AlertTriangle, CircleAlert, RotateCw } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useLayoutEffect, useRef, useState } from "react";

import {
  parseWorkflowStatusFilter,
  summarizeWorkflowRuns,
  WorkflowSummariesTable,
  type WorkflowStatusFilter,
  type WorkflowSummaryRow,
} from "@/features/mission-control/components/WorkflowSummariesTable";

interface SummariesResponse {
  summaries: WorkflowSummaryRow[];
  counts: { urgent: number; visible: number };
}

export default function WorkflowsPageClient() {
  const [data, setData] = useState<SummariesResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const contentRef = useRef<HTMLDivElement>(null);
  const loadingRef = useRef<HTMLDivElement>(null);
  const summaryRef = useRef<HTMLParagraphElement>(null);
  const retryRef = useRef<HTMLButtonElement>(null);
  const focusAfterRetry = useRef(false);
  const focusFilterOnUrgent = useRef(false);
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const status = parseWorkflowStatusFilter(searchParams.get("status"));
  const setStatus = (next: WorkflowStatusFilter) => {
    router.replace(next === "all" ? pathname : `${pathname}?status=${next}`, {
      scroll: false,
    });
  };

  useEffect(() => {
    let cancelled = false;

    ownApiFetch("/api/admin/workflows/summaries")
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
  }, [attempt]);

  // Retry swaps the alert for the loading state, then for the runs or a new
  // alert; each swap removes the focused element, so focus follows it unless
  // the person has already moved on. A layout effect runs in the commit that
  // made the swap: a passive one from the render that showed the alert can
  // still be pending when Retry is pressed, and would then take that alert
  // for the outcome of the retry.
  useLayoutEffect(() => {
    if (!focusAfterRetry.current) return;
    if (data || error) focusAfterRetry.current = false;
    const active = document.activeElement;
    if (active && active !== document.body) return;
    (data ? summaryRef : error ? retryRef : loadingRef).current?.focus();
  }, [data, error]);

  // Focus the filter only once it shows Urgent, so it is announced with the
  // new value rather than the old one.
  useEffect(() => {
    if (status !== "urgent" || !focusFilterOnUrgent.current) return;
    focusFilterOnUrgent.current = false;
    const active = document.activeElement;
    if (active && active !== document.body) return;
    contentRef.current
      ?.querySelector<HTMLElement>('[aria-label="Filter by status"]')
      ?.focus();
  }, [status]);

  const counts = summarizeWorkflowRuns(data?.summaries ?? []);
  function retry() {
    focusAfterRetry.current = true;
    setError(null);
    setData(null);
    setAttempt((value) => value + 1);
  }

  return (
    <PageShell
      title="Workflow runs"
      density="compact"
      description="Background work for gifts, receipts and email. Urgent runs need staff attention."
    >
      <div ref={contentRef} className="flex flex-col gap-6">
        {error ? (
          <Alert variant="warning">
            <AlertTriangle aria-hidden="true" />
            <AlertTitle>Couldn&apos;t load workflow runs</AlertTitle>
            <AlertDescription>
              <p>{error}</p>
              <Button
                ref={retryRef}
                variant="outline"
                size="sm"
                onClick={retry}
              >
                <RotateCw aria-hidden="true" />
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        ) : data ? (
          <>
            <p
              ref={summaryRef}
              tabIndex={-1}
              className="text-sm text-muted-foreground outline-none"
            >
              Showing the latest {data.summaries.length}{" "}
              {data.summaries.length === 1 ? "run" : "runs"}, up to 50. Figures
              cover these runs before list filters, not all workflow history.
            </p>
            {data.counts.urgent > 0 ? (
              <Alert variant="warning">
                <CircleAlert aria-hidden="true" />
                <AlertTitle>
                  {data.counts.urgent === 1
                    ? "1 urgent run"
                    : `${data.counts.urgent} urgent runs`}
                </AlertTitle>
                <AlertDescription>
                  <p>
                    Failed payment workflows and runs that need staff review.
                    They are listed first, each with its reason.
                  </p>
                  {status === "urgent" ? null : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        focusFilterOnUrgent.current = true;
                        setStatus("urgent");
                      }}
                    >
                      Show urgent runs
                    </Button>
                  )}
                </AlertDescription>
              </Alert>
            ) : null}
            <MetricGrid label="Workflow summary">
              <MetricCard
                label="In progress"
                value={counts.inProgress}
                detail="Queued, running or retrying"
              />
              <MetricCard
                label="Held for routing review"
                value={counts.waitingOnStaff}
                detail="Inbound emails waiting to be routed"
                tone={counts.waitingOnStaff > 0 ? "attention" : "default"}
              />
              <MetricCard
                label="Completed"
                value={counts.completed}
                detail="Finished without errors"
              />
              <MetricCard
                label="Failed or stopped"
                value={counts.failedOrStopped}
                detail="Did not finish"
                tone={counts.failedOrStopped > 0 ? "critical" : "default"}
              />
            </MetricGrid>
            <WorkflowSummariesTable
              summaries={data.summaries}
              status={status}
              onStatusChange={setStatus}
            />
          </>
        ) : (
          <div
            ref={loadingRef}
            role="status"
            aria-label="Loading workflow summaries"
            tabIndex={-1}
            className="flex flex-col gap-3 outline-none"
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
