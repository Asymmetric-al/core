"use client";

import { Badge } from "@asym/ui/components/shadcn/badge";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@asym/ui/components/shadcn/empty";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@asym/ui/components/shadcn/table";
import { Workflow } from "lucide-react";

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
  {
    variant: "secondary" | "info" | "warning" | "success" | "destructive";
    label: string;
  }
> = {
  dispatching: {
    variant: "secondary",
    label: "Dispatching",
  },
  processing: {
    variant: "info",
    label: "Processing",
  },
  retrying: {
    variant: "warning",
    label: "Retrying",
  },
  action_required: {
    variant: "warning",
    label: "Needs routing review",
  },
  completed: {
    variant: "success",
    label: "Completed",
  },
  failed: {
    variant: "destructive",
    label: "Failed",
  },
  dead_letter: {
    variant: "destructive",
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
      <Empty className="rounded-2xl border border-dashed">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Workflow />
          </EmptyMedia>
          <EmptyTitle>No workflow activity yet.</EmptyTitle>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      <Table>
        <TableCaption className="sr-only">
          Workflow run summaries for this organization
        </TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead scope="col" className="px-4 py-3">
              Workflow
            </TableHead>
            <TableHead scope="col" className="px-4 py-3">
              Record
            </TableHead>
            <TableHead scope="col" className="px-4 py-3">
              Status
            </TableHead>
            <TableHead scope="col" className="px-4 py-3">
              Attempts
            </TableHead>
            <TableHead scope="col" className="px-4 py-3">
              Alert
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {summaries.map((summary) => {
            const config = STATE_TONES[summary.state];
            return (
              <TableRow key={summary.dispatchRequestId}>
                <TableCell className="px-4 py-3">
                  <div className="font-medium text-foreground">
                    {summary.workflowName}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {summary.productArea}
                  </div>
                </TableCell>
                <TableCell className="px-4 py-3">
                  <div className="font-mono text-xs text-muted-foreground">
                    {summary.subjectType}
                  </div>
                  <div className="max-w-45 truncate font-mono text-xs text-muted-foreground">
                    {summary.subjectId}
                  </div>
                </TableCell>
                <TableCell className="px-4 py-3">
                  <Badge variant={config.variant}>{config.label}</Badge>
                  {summary.lastErrorCode ? (
                    <div className="mt-1 font-mono text-xs text-muted-foreground">
                      {summary.lastErrorCode}
                    </div>
                  ) : null}
                </TableCell>
                <TableCell className="px-4 py-3 font-mono text-xs tabular-nums text-muted-foreground">
                  {summary.attempts}
                </TableCell>
                <TableCell className="px-4 py-3">
                  {summary.notification.level === "urgent" ? (
                    <Badge variant="destructive">Urgent</Badge>
                  ) : (
                    <span className="text-xs text-muted-foreground">
                      Visible
                    </span>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
