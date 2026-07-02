"use client";

import { Badge } from "@asym/ui/components/shadcn/badge";
import { cn } from "@asym/ui/lib/utils";

export interface WorkflowSummaryRow {
  dispatchRequestId: string;
  productArea: string;
  workflowName: string;
  subjectType: string;
  subjectId: string;
  state:
    | "dispatching"
    | "processing"
    | "retrying"
    | "action_required"
    | "completed"
    | "failed"
    | "dead_letter";
  attempts: number;
  lastErrorCode: string | null;
  createdAt: string;
  notification: { level: "urgent" | "visible"; reason: string };
}

const STATE_TONES: Record<
  WorkflowSummaryRow["state"],
  { tone: string; label: string }
> = {
  dispatching: {
    tone: "border-zinc-200 bg-zinc-100 text-zinc-700",
    label: "Dispatching",
  },
  processing: {
    tone: "border-blue-200 bg-blue-50 text-blue-700",
    label: "Processing",
  },
  retrying: {
    tone: "border-amber-200 bg-amber-50 text-amber-700",
    label: "Retrying",
  },
  action_required: {
    tone: "border-amber-300 bg-amber-100 text-amber-800",
    label: "Needs routing review",
  },
  completed: {
    tone: "border-emerald-200 bg-emerald-50 text-emerald-700",
    label: "Completed",
  },
  failed: {
    tone: "border-rose-200 bg-rose-50 text-rose-700",
    label: "Failed",
  },
  dead_letter: {
    tone: "border-rose-300 bg-rose-100 text-rose-800",
    label: "Needs attention",
  },
};

/**
 * Product-owned workflow run summaries. Shows the latest useful status per
 * dispatch request and links back to the product record identity — never raw
 * Inngest step logs or provider internals. Inngest keeps the detailed
 * orchestration timeline.
 */
export function WorkflowSummariesTable({
  summaries,
}: {
  summaries: WorkflowSummaryRow[];
}) {
  if (summaries.length === 0) {
    return (
      <p className="rounded-xl border border-zinc-100 bg-zinc-50 px-4 py-6 text-center text-sm text-zinc-500">
        No workflow activity yet.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-zinc-100 bg-white shadow-sm">
      <table className="w-full text-left text-sm">
        <caption className="sr-only">
          Workflow run summaries for this organization
        </caption>
        <thead>
          <tr className="border-b border-zinc-100 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
            <th scope="col" className="px-4 py-3">
              Workflow
            </th>
            <th scope="col" className="px-4 py-3">
              Record
            </th>
            <th scope="col" className="px-4 py-3">
              Status
            </th>
            <th scope="col" className="px-4 py-3">
              Attempts
            </th>
            <th scope="col" className="px-4 py-3">
              Alert
            </th>
          </tr>
        </thead>
        <tbody>
          {summaries.map((summary) => {
            const config = STATE_TONES[summary.state];
            return (
              <tr
                key={summary.dispatchRequestId}
                className="border-b border-zinc-50 last:border-b-0"
              >
                <td className="px-4 py-3">
                  <div className="font-medium text-zinc-900">
                    {summary.workflowName}
                  </div>
                  <div className="text-[11px] text-zinc-500">
                    {summary.productArea}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="font-mono text-[11px] text-zinc-600">
                    {summary.subjectType}
                  </div>
                  <div className="max-w-[180px] truncate font-mono text-[11px] text-zinc-400">
                    {summary.subjectId}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <Badge
                    variant="outline"
                    className={cn(
                      "h-5 rounded-md px-1.5 text-[10px] font-bold uppercase tracking-wider",
                      config.tone,
                    )}
                  >
                    {config.label}
                  </Badge>
                  {summary.lastErrorCode ? (
                    <div className="mt-1 font-mono text-[10px] text-zinc-400">
                      {summary.lastErrorCode}
                    </div>
                  ) : null}
                </td>
                <td className="px-4 py-3 font-mono text-[12px] tabular-nums text-zinc-600">
                  {summary.attempts}
                </td>
                <td className="px-4 py-3">
                  {summary.notification.level === "urgent" ? (
                    <Badge
                      variant="outline"
                      className="h-5 rounded-md border-rose-200 bg-rose-50 px-1.5 text-[10px] font-bold uppercase tracking-wider text-rose-700"
                    >
                      Urgent
                    </Badge>
                  ) : (
                    <span className="text-[11px] text-zinc-400">Visible</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
