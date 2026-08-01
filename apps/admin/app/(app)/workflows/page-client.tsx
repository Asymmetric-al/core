"use client";

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
    <main className="mx-auto max-w-5xl space-y-6 px-6 py-10">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold text-zinc-950">Workflows</h1>
        <p className="text-sm text-zinc-500">
          Durable background work across donations, giving, and email. Product
          records stay authoritative; urgent items need staff attention.
        </p>
      </header>

      {data ? (
        <p className="text-sm text-zinc-600" role="status">
          {data.counts.urgent} urgent · {data.counts.visible} routine
        </p>
      ) : null}

      {error ? (
        <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {error}
        </p>
      ) : data ? (
        <WorkflowSummariesTable summaries={data.summaries} />
      ) : (
        <p className="text-sm text-zinc-400">Loading workflow summaries…</p>
      )}
    </main>
  );
}
