"use client";

import {
  DataGridPanel,
  DataGridSearch,
  DataGridSortSelect,
  DataGridToolbarSpacer,
  dataGridFeatures,
  useTable,
  type DataGridColumnDef,
  type DataGridRow,
  type SortingState,
} from "@asym/ui/components/data-grid-panel";
import { DataGridColumnHeader } from "@asym/ui/components/reui/data-grid/data-grid-column-header";
import { Badge } from "@asym/ui/components/shadcn/badge";
import { Button } from "@asym/ui/components/shadcn/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@asym/ui/components/shadcn/empty";
import { Item, ItemContent } from "@asym/ui/components/shadcn/item";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@asym/ui/components/shadcn/select";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@asym/ui/components/shadcn/tooltip";
import { formatDistanceToNowStrict, parseISO } from "date-fns";
import { Copy, SearchX, Workflow } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

export type WorkflowRunState =
  | "dispatching"
  | "processing"
  | "retrying"
  | "action_required"
  | "completed"
  | "failed"
  | "dead_letter";

export interface WorkflowSummaryRow {
  dispatchRequestId: string;
  productArea: string;
  workflowName: string;
  subjectType: string;
  subjectId: string;
  state: WorkflowRunState;
  attempts: number;
  lastErrorCode: string | null;
  createdAt: string;
  notification: {
    level: "urgent" | "visible";
    reason: string;
  };
}

type StateTone = {
  variant: "secondary" | "info" | "warning" | "success" | "destructive";
  label: string;
};

const STATE_TONES: Record<WorkflowRunState, StateTone> = {
  dispatching: { variant: "secondary", label: "Queued" },
  processing: { variant: "info", label: "Running" },
  retrying: { variant: "warning", label: "Retrying" },
  action_required: { variant: "warning", label: "Held for routing" },
  completed: { variant: "success", label: "Completed" },
  failed: { variant: "destructive", label: "Failed" },
  dead_letter: { variant: "destructive", label: "Stopped" },
};

/** Every run falls in exactly one bucket, so the counts add up. */
const STATE_BUCKETS = {
  inProgress: ["dispatching", "processing", "retrying"],
  waitingOnStaff: ["action_required"],
  completed: ["completed"],
  failedOrStopped: ["failed", "dead_letter"],
} as const satisfies Record<string, readonly WorkflowRunState[]>;

type StateBucket = keyof typeof STATE_BUCKETS;

export function summarizeWorkflowRuns(
  runs: Pick<WorkflowSummaryRow, "state">[],
): Record<StateBucket, number> {
  const inBucket = (bucket: StateBucket) =>
    runs.filter((run) =>
      (STATE_BUCKETS[bucket] as readonly string[]).includes(run.state),
    ).length;
  return {
    inProgress: inBucket("inProgress"),
    waitingOnStaff: inBucket("waitingOnStaff"),
    completed: inBucket("completed"),
    failedOrStopped: inBucket("failedOrStopped"),
  };
}

export type WorkflowStatusFilter = "all" | "urgent" | StateBucket;
type StatusFilter = WorkflowStatusFilter;

const STATUS_FILTER_LABELS: Record<StatusFilter, string> = {
  all: "All runs",
  urgent: "Urgent",
  inProgress: "In progress",
  // Inbound email held for a routing review waits on an administrator, not
  // on staff, so it is its own filter and never under "Urgent".
  waitingOnStaff: "Held for routing review",
  completed: "Completed",
  failedOrStopped: "Failed or stopped",
};

/**
 * A `?status=` value as a filter; anything unknown lists every run. An own
 * key check, not `in`: "constructor" or "__proto__" are keys of every
 * object and would reach the bucket lookup and crash the list.
 */
export function parseWorkflowStatusFilter(
  value: string | null | undefined,
): WorkflowStatusFilter {
  return value && Object.hasOwn(STATUS_FILTER_LABELS, value)
    ? (value as WorkflowStatusFilter)
    : "all";
}

/**
 * Whether a run is urgent staff work. A held inbound email waits on an
 * administrator (no staff screen routes it), so it is never urgent here,
 * even from a server that still marks it so.
 */
export function isUrgentWorkflowRun(
  run: Pick<WorkflowSummaryRow, "state" | "notification">,
): boolean {
  return run.notification.level === "urgent" && run.state !== "action_required";
}

function matchesStatus(run: WorkflowSummaryRow, filter: StatusFilter) {
  if (filter === "all") return true;
  if (filter === "urgent") return isUrgentWorkflowRun(run);
  return (STATE_BUCKETS[filter] as readonly string[]).includes(run.state);
}

function requestedAgo(createdAt: string) {
  return formatDistanceToNowStrict(parseISO(createdAt), { addSuffix: true });
}

/**
 * Where staff can open the record a run acts on. Only record types with a
 * staff page link; internal records (outbox rows, raw provider events,
 * inbound email rows, batch operations) have none, so they stay plain text.
 */
export function workflowRecordHref(
  subjectType: string,
  subjectId: string,
): string | null {
  const id = encodeURIComponent(subjectId);
  switch (subjectType) {
    case "donation":
      return `/contributions?gift=${id}`;
    case "donor":
      return `/crm?donor=${id}`;
    case "support_conversation_move":
      return `/support?id=${id}`;
    default:
      return null;
  }
}

function RecordName({ run }: { run: WorkflowSummaryRow }) {
  const href = workflowRecordHref(run.subjectType, run.subjectId);
  const label = recordLabel(run.subjectType);
  return href ? (
    <Link
      href={href}
      className="font-medium text-foreground underline underline-offset-4 decoration-muted-foreground/50 hover:decoration-foreground"
    >
      {label}
    </Link>
  ) : (
    <>{label}</>
  );
}

/** Staff names for the record types workflows dispatch today. */
const RECORD_LABELS: Record<string, string> = {
  email_inbound_message: "Inbound email",
  support_conversation_move: "Support conversation",
  support_bulk_move_retry: "Support bulk move",
  stripe_raw_event: "Stripe event",
  donation_saga_outbox: "Donation processing",
};

function recordLabel(subjectType: string) {
  const known = RECORD_LABELS[subjectType];
  if (known) return known;
  const words = subjectType.replaceAll("_", " ");
  return words.charAt(0).toUpperCase() + words.slice(1);
}

/**
 * The next step for a run staff cannot open: an inbound email held for a
 * routing review has no review screen in Mission Control yet, and only an
 * administrator can route it.
 */
function heldRunNextStep(
  run: Pick<WorkflowSummaryRow, "state">,
): string | null {
  return run.state === "action_required"
    ? "No review screen yet: ask an administrator to route it."
    : null;
}

/** The Attention label for a held run: who it waits on, not urgency. */
const HELD_RUN_ATTENTION = "Waiting for an administrator";

/**
 * Status sort order: what most needs staff first (failed, stopped, held,
 * retrying), then work still moving, then finished runs. Unknown states
 * sort last.
 */
const STATE_RANK: Record<WorkflowRunState, number> = {
  failed: 0,
  dead_letter: 1,
  action_required: 2,
  retrying: 3,
  processing: 4,
  dispatching: 5,
  completed: 6,
};

export function workflowStateRank(state: string): number {
  return Object.hasOwn(STATE_RANK, state)
    ? STATE_RANK[state as WorkflowRunState]
    : Object.keys(STATE_RANK).length;
}

const RECORD_ID_HEAD = 8;
const RECORD_ID_TAIL = 4;
/** The short form ("donation…4200") is head + ellipsis + tail long. */
const RECORD_ID_SHORT_LENGTH = RECORD_ID_HEAD + 1 + RECORD_ID_TAIL;
/** Shorten only when it saves at least this many characters. */
const RECORD_ID_MIN_SAVING = 8;

/**
 * A phone card's record ID: IDs that fit show whole; long ones (UUIDs,
 * prefixed keys) keep both ends, "donation…4200", because IDs minted
 * together often share their start. An ID only a few characters past the
 * short form stays whole, since shortening it would hide characters to
 * save almost no room. The full ID stays one copy away.
 */
export function shortWorkflowRecordId(id: string): string {
  return id.length - RECORD_ID_SHORT_LENGTH >= RECORD_ID_MIN_SAVING
    ? `${id.slice(0, RECORD_ID_HEAD)}…${id.slice(-RECORD_ID_TAIL)}`
    : id;
}

/**
 * The record ID on a phone card. A shortened ID gets a copy button, which
 * touch and keyboard users can reach (a hover title cannot); its name and
 * tooltip carry the full value.
 */
function WorkflowRecordId({ id }: { id: string }) {
  const short = shortWorkflowRecordId(id);
  if (short === id) return <span className="font-mono">{id}</span>;
  const copy = () => {
    const written =
      navigator.clipboard?.writeText(id) ??
      Promise.reject(new Error("Clipboard unavailable"));
    void written.then(
      () => toast.success("Record ID copied"),
      () => toast.error("Couldn't copy to the clipboard."),
    );
  };
  return (
    <span className="inline-flex items-center gap-0.5 align-middle">
      <span className="font-mono">{short}</span>
      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              aria-label={`Copy record ID ${id}`}
              onClick={copy}
            >
              <Copy aria-hidden="true" />
            </Button>
          }
        />
        <TooltipContent>
          <span className="font-mono">{id}</span>
        </TooltipContent>
      </Tooltip>
    </span>
  );
}

/** A state the client does not know yet still renders, as itself. */
export function workflowStateTone(state: string): StateTone {
  return (
    STATE_TONES[state as WorkflowRunState] ?? {
      variant: "secondary",
      label: state.replaceAll("_", " "),
    }
  );
}

const WORKFLOW_LABELS: Record<string, string> = {
  "donations/saga.recovery.requested": "Gift recovery",
  "giving/stripe-event.process.requested": "Payment update",
  "email/inbound-email.process.requested": "Incoming email",
  "workflows/smoke.requested": "Workflow connection check",
};
const AREA_LABELS: Record<string, string> = {
  donations: "Contributions",
  giving: "Giving",
  email: "Email",
  support: "Support",
};
const ERROR_LABELS: Record<string, string> = {
  workflow_dispatch_failed: "Could not start the workflow",
  workflow_execution_failed: "Workflow could not finish",
};
function identifierLabel(labels: Record<string, string>, value: string) {
  return Object.hasOwn(labels, value) ? labels[value] : value;
}
function WorkflowName({ name }: { name: string }) {
  const label = identifierLabel(WORKFLOW_LABELS, name);
  return (
    <span title={name}>
      {label}
      {label !== name ? <span className="sr-only"> ({name})</span> : null}
    </span>
  );
}
function WorkflowError({ code }: { code: string }) {
  const label = identifierLabel(ERROR_LABELS, code);
  return (
    <span className="flex min-w-0 flex-col">
      <span>{label}</span>
      {label !== code ? (
        <span className="font-mono text-xs">{code}</span>
      ) : null}
    </span>
  );
}

const COLUMNS: DataGridColumnDef<WorkflowSummaryRow>[] = [
  {
    accessorKey: "workflowName",
    header: ({ column }) => (
      <DataGridColumnHeader column={column} title="Workflow" />
    ),
    cell: ({ row }) => (
      <span className="flex min-w-0 flex-col">
        <span className="truncate text-sm font-medium">
          <WorkflowName name={row.original.workflowName} />
        </span>
        <span className="truncate text-xs text-muted-foreground">
          {identifierLabel(AREA_LABELS, row.original.productArea)}
        </span>
      </span>
    ),
    size: 240,
    meta: { headerTitle: "Workflow" },
  },
  {
    id: "record",
    accessorFn: (row) => `${row.subjectType} ${row.subjectId}`,
    header: ({ column }) => (
      <DataGridColumnHeader column={column} title="Record" />
    ),
    cell: ({ row }) => (
      <span className="flex min-w-0 flex-col">
        <span className="truncate text-sm">
          <RecordName run={row.original} />
        </span>
        <span className="truncate font-mono text-xs text-muted-foreground">
          {row.original.subjectId}
        </span>
      </span>
    ),
    size: 200,
    meta: { headerTitle: "Record" },
  },
  {
    id: "state",
    accessorFn: (row) => workflowStateRank(row.state),
    header: ({ column }) => (
      <DataGridColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      const tone = workflowStateTone(row.original.state);
      return (
        <span className="flex min-w-0 flex-col items-start gap-1">
          <Badge variant={tone.variant}>{tone.label}</Badge>
          {/* The code stays beside the plain reason (in Attention) so
              support can quote it when escalating. */}
          {row.original.lastErrorCode ? (
            <span className="truncate font-mono text-xs text-muted-foreground">
              <WorkflowError code={row.original.lastErrorCode} />
            </span>
          ) : null}
        </span>
      );
    },
    size: 170,
    meta: { headerTitle: "Status" },
  },
  {
    accessorKey: "attempts",
    header: ({ column }) => (
      <DataGridColumnHeader column={column} title="Attempts" />
    ),
    cell: ({ row }) => (
      <span className="block text-right text-sm tabular-nums">
        {row.original.attempts}
      </span>
    ),
    size: 110,
    meta: {
      headerTitle: "Attempts",
      headerClassName: "text-right [&>div]:justify-end [&>div]:-me-2",
    },
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <DataGridColumnHeader column={column} title="Requested" />
    ),
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">
        {requestedAgo(row.original.createdAt)}
      </span>
    ),
    size: 140,
    meta: { headerTitle: "Requested" },
  },
  {
    id: "attention",
    // Urgent first, then runs waiting on an administrator, then the rest.
    accessorFn: (row) =>
      isUrgentWorkflowRun(row) ? 0 : heldRunNextStep(row) ? 1 : 2,
    header: ({ column }) => (
      <DataGridColumnHeader column={column} title="Attention" />
    ),
    cell: ({ row }) => {
      const nextStep = heldRunNextStep(row.original);
      if (isUrgentWorkflowRun(row.original)) {
        return (
          <span className="flex min-w-0 flex-col items-start gap-1">
            <Badge variant="destructive">Urgent</Badge>
            <span className="line-clamp-2 text-xs text-muted-foreground">
              {row.original.notification.reason}
            </span>
          </span>
        );
      }
      if (nextStep) {
        return (
          <span className="flex min-w-0 flex-col items-start gap-1">
            <Badge variant="outline">{HELD_RUN_ATTENTION}</Badge>
            <span className="line-clamp-2 text-xs text-muted-foreground">
              {nextStep}
            </span>
          </span>
        );
      }
      return <span className="text-sm text-muted-foreground">None</span>;
    },
    size: 220,
    meta: { headerTitle: "Attention" },
  },
];

function WorkflowRunMobileRow({ run }: { run: WorkflowSummaryRow }) {
  const tone = workflowStateTone(run.state);
  const urgent = isUrgentWorkflowRun(run);
  const nextStep = heldRunNextStep(run);
  return (
    <Item variant="outline" size="sm" render={<div />}>
      <ItemContent className="min-w-0 gap-2">
        <div className="flex min-w-0 items-start justify-between gap-2">
          <span className="min-w-0 flex-1 text-sm font-medium break-words">
            <WorkflowName name={run.workflowName} />
          </span>
          <Badge variant={tone.variant}>{tone.label}</Badge>
        </div>
        <p className="text-xs text-muted-foreground">
          {identifierLabel(AREA_LABELS, run.productArea)} ·{" "}
          <RecordName run={run} /> <WorkflowRecordId id={run.subjectId} /> ·
          requested {requestedAgo(run.createdAt)}
        </p>
        {urgent ? (
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="destructive">Urgent</Badge>
            <span className="text-xs text-muted-foreground">
              {run.notification.reason}
            </span>
          </div>
        ) : null}
        {nextStep ? (
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline">{HELD_RUN_ATTENTION}</Badge>
            <span className="text-xs text-muted-foreground">{nextStep}</span>
          </div>
        ) : null}
        <p className="text-xs text-muted-foreground">
          {run.attempts === 1 ? "1 attempt" : `${run.attempts} attempts`}
          {run.lastErrorCode ? (
            <>
              {" · "}
              <WorkflowError code={run.lastErrorCode} />
            </>
          ) : null}
        </p>
      </ItemContent>
    </Item>
  );
}

const WORKFLOW_SORT_LABELS: Record<string, string> = {
  "attention:asc": "Urgent first",
  "state:asc": "Status: needs staff first",
  "state:desc": "Status: completed first",
  "createdAt:desc": "Requested: newest",
  "createdAt:asc": "Requested: oldest",
  "attempts:desc": "Attempts: most",
  "attempts:asc": "Attempts: fewest",
  "workflowName:asc": "Workflow: A–Z",
  "workflowName:desc": "Workflow: Z–A",
};

const WORKFLOW_EXTRA_SORT_LABELS: Record<string, string> = {
  "attention:desc": "Urgent last",
  "record:asc": "Record: A–Z",
  "record:desc": "Record: Z–A",
};

/**
 * Product-owned workflow run summaries on Core's shared grid: the latest
 * useful status per dispatch request with the product record it acts on —
 * never raw Inngest step logs or provider internals.
 */
export function WorkflowSummariesTable({
  summaries,
  status: controlledStatus,
  onStatusChange,
}: {
  summaries: WorkflowSummaryRow[];
  /** Set by the page (from `?status=` or the urgent callout) when given. */
  status?: WorkflowStatusFilter;
  onStatusChange?: (status: WorkflowStatusFilter) => void;
}) {
  const [sorting, setSorting] = useState<SortingState>([
    { id: "attention", desc: false },
  ]);
  const [search, setSearch] = useState("");
  const [localStatus, setLocalStatus] = useState<StatusFilter>("all");
  const status = controlledStatus ?? localStatus;
  const setStatus = onStatusChange ?? setLocalStatus;
  const query = search.trim().toLowerCase();
  const rows = summaries.filter(
    (run) =>
      matchesStatus(run, status) &&
      (!query ||
        `${run.workflowName} ${identifierLabel(WORKFLOW_LABELS, run.workflowName)} ${run.productArea} ${identifierLabel(AREA_LABELS, run.productArea)} ${run.subjectType} ${run.subjectId}`
          .toLowerCase()
          .includes(query)),
  );
  const filtered = query !== "" || status !== "all";
  const table = useTable({
    features: dataGridFeatures,
    // No pager: every row renders (the paginated row model would
    // otherwise stop at its default page of ten).
    manualPagination: true,
    data: rows,
    columns: COLUMNS,
    getRowId: (row) => row.dispatchRequestId,
    state: { sorting },
    onSortingChange: setSorting,
  });

  return (
    <DataGridPanel
      view="auto"
      table={table}
      recordCount={rows.length}
      label="Workflow runs"
      renderMobileRow={(row: DataGridRow<WorkflowSummaryRow>) => (
        <WorkflowRunMobileRow run={row.original} />
      )}
      toolbar={
        <>
          <DataGridSearch
            label="Search workflow runs"
            placeholder="Search by workflow or record…"
            className="w-full min-w-0 sm:w-80"
            value={search}
            onValueChange={setSearch}
          />
          <DataGridToolbarSpacer />
          <DataGridSortSelect
            whenCards
            label="Sort workflow runs"
            options={WORKFLOW_SORT_LABELS}
            extraOptions={WORKFLOW_EXTRA_SORT_LABELS}
            fallback="attention:asc"
            sorting={sorting}
            onSortingChange={setSorting}
          />
          <Select<StatusFilter>
            items={STATUS_FILTER_LABELS}
            value={status}
            onValueChange={(value) => setStatus(value ?? "all")}
          >
            <SelectTrigger size="sm" aria-label="Filter by status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent align="end">
              {(Object.keys(STATUS_FILTER_LABELS) as StatusFilter[]).map(
                (value) => (
                  <SelectItem key={value} value={value}>
                    {STATUS_FILTER_LABELS[value]}
                  </SelectItem>
                ),
              )}
            </SelectContent>
          </Select>
        </>
      }
      empty={
        filtered ? (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <SearchX />
              </EmptyMedia>
              <EmptyTitle>No runs match</EmptyTitle>
              <EmptyDescription>Try another search or status.</EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Workflow />
              </EmptyMedia>
              <EmptyTitle>No workflow runs yet</EmptyTitle>
              <EmptyDescription>
                Receipts, renewals and other background work appear here as they
                run.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        )
      }
    />
  );
}
