"use client";

import { Button } from "@asym/ui/components/shadcn/button-component";
import { Input } from "@asym/ui/components/shadcn/input";
import { Label } from "@asym/ui/components/shadcn/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@asym/ui/components/shadcn/select";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@asym/ui/components/shadcn/table";
import { useIsFetching, useQueryClient } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, RefreshCw } from "lucide-react";
import { useId, useState } from "react";

import {
  Ago,
  EmptyNote,
  IssueButton,
  Mono,
  Panel,
  RunButton,
  Section,
  StatusBadge,
  Unavailable,
  When,
  useConsole,
} from "./shared";
import { duration, elapsed, statuses } from "../lib/contracts";
import { NODE_ROLES } from "../lib/round";

import type { EngineState, Run, RunDetailView } from "../lib/contracts";
import type { IssueSummary, Snapshot } from "../lib/factory";

export const RUNS_PAGE_SIZE = 50;

/** The role (or trusted script) that a workflow node runs as. */
export function nodeRole(workflow: string, node: string): string {
  if (workflow === "core-deliver") return NODE_ROLES[node] ?? "Trusted script";
  if (workflow === "core-select" && node === "rank") return "Samson";
  if (workflow === "core-answer" && node === "answer") return "Samson";
  if (workflow === "core-analyze" && node === "analyst") return "Analyst";
  return "Trusted script";
}

/**
 * Factory issues linked to an engine run: the issue's current run or live
 * lease, and (with `history`) rounds the work item recorded for that run.
 */
export function linkedIssues(
  issues: readonly IssueSummary[],
  runId: string,
  {
    history = false,
    recorded = {},
  }: { history?: boolean; recorded?: Record<string, number[]> } = {},
): number[] {
  const current = issues.filter(
    (issue) =>
      issue.run?.id === runId ||
      (issue.lease?.live && issue.lease.runId === runId),
  );
  if (current.length || !history) return current.map((issue) => issue.issue);
  // The server links every recorded round (Snapshot.runIssues); summaries
  // carry only the latest rounds.
  return [
    ...new Set([
      ...(recorded[runId] ?? []),
      ...issues
        .filter((issue) => issue.history.some((entry) => entry.run === runId))
        .map((issue) => issue.issue),
    ]),
  ].sort((left, right) => left - right);
}

function factoryIssues(snapshot: Snapshot | null): IssueSummary[] | null {
  return snapshot?.factory.state === "available"
    ? snapshot.factory.data.issues
    : null;
}

/** Re-read the snapshot the shell owns (the same read as "Refresh now"). */
function ReadAgain({ label }: { label: string }) {
  const { scope } = useConsole();
  const client = useQueryClient();
  const fetching = useIsFetching({ queryKey: [scope, "snapshot"] }) > 0;
  return (
    <div>
      <Button
        size="sm"
        variant="outline"
        disabled={fetching}
        onClick={() =>
          void client.refetchQueries({
            queryKey: [scope, "snapshot"],
            type: "active",
          })
        }
      >
        <RefreshCw aria-hidden="true" />
        {label}
      </Button>
    </div>
  );
}

function IssueLinks({
  issues,
  empty,
}: {
  issues: number[] | null;
  empty: string;
}) {
  if (issues === null)
    return (
      <span className="text-muted-foreground">Factory state unavailable</span>
    );
  if (!issues.length)
    return <span className="text-muted-foreground">{empty}</span>;
  return (
    <span className="flex flex-wrap gap-1">
      {issues.slice(0, 3).map((issue) => (
        <IssueButton key={issue} issue={issue} />
      ))}
    </span>
  );
}

export function Runs({
  loading,
  offset,
  fetching,
  setOffset,
}: {
  loading: boolean;
  offset: number;
  fetching: boolean;
  setOffset: (offset: number) => void;
}) {
  const { snapshot } = useConsole();
  const engine = snapshot?.engine;
  return (
    <div className="flex min-w-0 flex-col gap-6">
      <Panel
        title="Active agents"
        description="Every node the engine reports running, with the role it runs as and the model the run reports. Times are the engine's own timestamps."
      >
        <Section value={engine} loading={loading} label="engine state">
          {(data, observedAt) => (
            <ActiveAgents engine={data} observedAt={observedAt} />
          )}
        </Section>
        {engine?.state === "unavailable" ? (
          <ReadAgain label="Read the engine again" />
        ) : null}
      </Panel>
      <Panel
        title="Runs"
        description="Engine runs for this codebase, newest first, 50 per page. Search and the status filter apply to the page shown."
      >
        <Section value={engine} loading={loading} label="engine state">
          {(data, observedAt) => (
            <RunList
              engine={data}
              observedAt={observedAt}
              offset={offset}
              fetching={fetching}
              setOffset={setOffset}
            />
          )}
        </Section>
        {engine?.state === "unavailable" ? (
          <div className="flex flex-wrap gap-2">
            <ReadAgain label="Read the engine again" />
            {offset > 0 ? (
              <Button
                size="sm"
                variant="outline"
                disabled={fetching}
                onClick={() => setOffset(0)}
              >
                Back to the first page of runs
              </Button>
            ) : null}
          </div>
        ) : null}
      </Panel>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Active agents
// ---------------------------------------------------------------------------

type AgentRow = {
  key: string;
  role: string;
  workflow: string;
  runId: string;
  node: string;
  model: string;
  nodeStartedAt: string | null;
  runStartedAt: string;
  state: "Running" | "Waiting (paused)" | "Waiting (cooldown)";
};

function agentRows(details: Record<string, RunDetailView>) {
  const rows: AgentRow[] = [];
  const idle: Run[] = [];
  for (const detail of Object.values(details)) {
    const { run } = detail;
    if (run.status !== "running" && run.status !== "paused") continue;
    const running = detail.nodes.filter((node) => node.state === "running");
    if (!running.length) idle.push(run);
    for (const node of running) {
      const timing = detail.timings[node.node_id] ?? null;
      rows.push({
        key: `${run.id}:${node.node_id}`,
        role: nodeRole(run.workflow_name, node.node_id),
        workflow: run.workflow_name,
        runId: run.id,
        node: node.node_id,
        model: timing?.model ?? "not reported",
        nodeStartedAt: timing?.startedAt ?? null,
        runStartedAt: run.started_at,
        state:
          run.status === "paused"
            ? "Waiting (paused)"
            : node.node_id === "cooldown"
              ? "Waiting (cooldown)"
              : "Running",
      });
    }
  }
  rows.sort((left, right) =>
    (left.nodeStartedAt ?? "").localeCompare(right.nodeStartedAt ?? ""),
  );
  return { rows, idle };
}

function ActiveAgents({
  engine,
  observedAt,
}: {
  engine: EngineState;
  observedAt: string;
}) {
  const { snapshot, now } = useConsole();
  const issues = factoryIssues(snapshot);
  const { rows, idle } = agentRows(engine.details);
  const unread = Object.entries(engine.detailErrors);
  return (
    <div className="flex min-w-0 flex-col gap-4">
      <p className="text-xs text-muted-foreground">
        Engine observed <When value={observedAt} /> (<Ago value={observedAt} />
        ). Running is what the engine reported then, not a promise of progress
        now.
      </p>
      {rows.length ? (
        <Table>
          <TableCaption>
            Nodes the engine reports running, with role, model and timing
          </TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead scope="col">Role</TableHead>
              <TableHead scope="col">State</TableHead>
              <TableHead scope="col">Workflow</TableHead>
              <TableHead scope="col">Issue</TableHead>
              <TableHead scope="col">Run</TableHead>
              <TableHead scope="col">Node</TableHead>
              <TableHead scope="col">Model</TableHead>
              <TableHead scope="col">Node started</TableHead>
              <TableHead scope="col">Run started</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.key}>
                <TableHead scope="row">{row.role}</TableHead>
                <TableCell>
                  <StatusBadge
                    value={row.state === "Running" ? "running" : "waiting"}
                    label={row.state}
                  />
                </TableCell>
                <TableCell>{row.workflow}</TableCell>
                <TableCell>
                  <IssueLinks
                    issues={issues && linkedIssues(issues, row.runId)}
                    empty="No linked issue"
                  />
                </TableCell>
                <TableCell>
                  <RunButton run={row.runId} />
                </TableCell>
                <TableCell>
                  <Mono>{row.node}</Mono>
                </TableCell>
                <TableCell>{row.model}</TableCell>
                <TableCell>
                  <When value={row.nodeStartedAt} />
                  {row.nodeStartedAt && now ? (
                    <span className="block text-xs text-muted-foreground">
                      {duration(elapsed(row.nodeStartedAt, null, now))} so far
                    </span>
                  ) : null}
                </TableCell>
                <TableCell>
                  <When value={row.runStartedAt} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <EmptyNote>
          No agent is running. No engine run in this observation reports a
          running node.
        </EmptyNote>
      )}
      {idle.length ? (
        <div className="flex flex-col gap-1 text-sm">
          <p className="font-medium">Active runs with no running node</p>
          <ul className="flex flex-col gap-1">
            {idle.map((run) => (
              <li key={run.id} className="flex flex-wrap items-center gap-2">
                <StatusBadge value={run.status} />
                <span>{run.workflow_name}</span>
                <RunButton run={run.id} />
                <span className="text-xs text-muted-foreground">
                  last activity <Ago value={run.last_activity_at} />
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      {unread.length ? (
        <Unavailable title="Node states could not be read for some runs">
          <ul className="flex flex-col gap-1">
            {unread.map(([runId, reason]) => (
              <li key={runId} className="break-words">
                <Mono>{runId}</Mono>: {reason}
              </li>
            ))}
          </ul>
        </Unavailable>
      ) : null}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Runs
// ---------------------------------------------------------------------------

type StatusFilter = "all" | (typeof statuses)[number];

const STATUS_ITEMS: Record<StatusFilter, string> = {
  all: "All statuses",
  pending: "Pending",
  running: "Running",
  paused: "Paused",
  completed: "Completed",
  failed: "Failed",
  cancelled: "Cancelled",
};

const COUNT_ORDER = ["all", ...statuses] as const;

function isStatusFilter(value: unknown): value is StatusFilter {
  return typeof value === "string" && value in STATUS_ITEMS;
}

function matches(run: Run, search: string, status: StatusFilter) {
  if (status !== "all" && run.status !== status) return false;
  const needle = search.trim().toLowerCase();
  if (!needle) return true;
  return [run.workflow_name, run.id, run.user_message].some((field) =>
    field.toLowerCase().includes(needle),
  );
}

function RunList({
  engine,
  observedAt,
  offset,
  fetching,
  setOffset,
}: {
  engine: EngineState;
  observedAt: string;
  offset: number;
  fetching: boolean;
  setOffset: (offset: number) => void;
}) {
  const searchId = useId();
  const statusId = useId();
  const statusLabelId = useId();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const shown = engine.runs.filter((run) => matches(run, search, status));
  return (
    <div className="flex min-w-0 flex-col gap-4">
      <p className="text-xs text-muted-foreground">
        Engine observed <When value={observedAt} /> (<Ago value={observedAt} />
        ).
      </p>
      <ul aria-label="Runs by status" className="flex flex-wrap gap-2">
        {COUNT_ORDER.map((key) => (
          <li key={key}>
            <StatusBadge
              value={key}
              label={`${key === "all" ? "All runs" : STATUS_ITEMS[key]}: ${engine.counts[key]}`}
            />
          </li>
        ))}
      </ul>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="flex min-w-0 flex-col gap-2">
          <Label htmlFor={searchId}>Search runs</Label>
          <Input
            id={searchId}
            type="search"
            value={search}
            placeholder="Workflow, run id or request text"
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
        <div className="flex min-w-0 flex-col gap-2">
          <Label id={statusLabelId} htmlFor={statusId}>
            Status
          </Label>
          <Select
            items={STATUS_ITEMS}
            value={status}
            onValueChange={(value) => {
              if (isStatusFilter(value)) setStatus(value);
            }}
          >
            <SelectTrigger
              id={statusId}
              aria-labelledby={statusLabelId}
              className="w-full"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(STATUS_ITEMS) as StatusFilter[]).map((key) => (
                <SelectItem key={key} value={key}>
                  {STATUS_ITEMS[key]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <p
        role="status"
        aria-live="polite"
        className="text-sm text-muted-foreground"
      >
        Showing {shown.length} of {engine.runs.length} runs on this page.
      </p>
      {!engine.runs.length ? (
        <EmptyNote>
          The engine reports no runs on this page for this codebase.
        </EmptyNote>
      ) : shown.length ? (
        <RunTable runs={shown} />
      ) : (
        <EmptyNote>
          No run on this page matches the search and status filter. Clear them
          or try another page.
        </EmptyNote>
      )}
      <Pagination
        engine={engine}
        offset={offset}
        fetching={fetching}
        setOffset={setOffset}
      />
    </div>
  );
}

function RunTable({ runs }: { runs: Run[] }) {
  const { snapshot, now, openRun } = useConsole();
  const issues = factoryIssues(snapshot);
  return (
    <Table>
      <TableCaption>Engine runs on this page, newest first</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead scope="col">Workflow</TableHead>
          <TableHead scope="col">Issue</TableHead>
          <TableHead scope="col">Status</TableHead>
          <TableHead scope="col">Active nodes</TableHead>
          <TableHead scope="col">Started</TableHead>
          <TableHead scope="col">Elapsed</TableHead>
          <TableHead scope="col">Last activity</TableHead>
          <TableHead scope="col">
            <span className="sr-only">Open</span>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {runs.map((run) => {
          const span = elapsed(run.started_at, run.completed_at, now);
          return (
            <TableRow key={run.id}>
              <TableHead scope="row">
                <span className="block">{run.workflow_name}</span>
                <span
                  className="block max-w-xs truncate text-xs font-normal text-muted-foreground"
                  title={run.user_message}
                >
                  {run.user_message || "No request text"}
                </span>
              </TableHead>
              <TableCell>
                <IssueLinks
                  issues={
                    issues &&
                    linkedIssues(issues, run.id, {
                      history: true,
                      recorded: snapshot?.runIssues,
                    })
                  }
                  empty="None"
                />
              </TableCell>
              <TableCell>
                <span className="flex flex-wrap gap-1">
                  <StatusBadge value={run.status} />
                  {run.needs_attention ? (
                    <StatusBadge value="waiting" label="needs attention" />
                  ) : null}
                </span>
              </TableCell>
              <TableCell>
                {run.active_nodes?.length ? (
                  <span className="font-mono text-xs">
                    {run.active_nodes.join(", ")}
                  </span>
                ) : (
                  <span className="text-muted-foreground">None</span>
                )}
              </TableCell>
              <TableCell>
                <When value={run.started_at} />
              </TableCell>
              <TableCell>
                {span === null && !run.completed_at
                  ? "Measuring…"
                  : duration(span)}
              </TableCell>
              <TableCell>
                <Ago value={run.last_activity_at} />
              </TableCell>
              <TableCell>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => openRun(run.id)}
                >
                  Open run
                  <span className="sr-only"> {run.id}</span>
                </Button>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}

function Pagination({
  engine,
  offset,
  fetching,
  setOffset,
}: {
  engine: EngineState;
  offset: number;
  fetching: boolean;
  setOffset: (offset: number) => void;
}) {
  const first = engine.runs.length ? engine.offset + 1 : 0;
  const last = engine.offset + engine.runs.length;
  return (
    <nav aria-label="Run pages" className="flex flex-wrap items-center gap-3">
      <Button
        size="sm"
        variant="outline"
        disabled={offset === 0 || fetching}
        onClick={() => setOffset(Math.max(0, offset - RUNS_PAGE_SIZE))}
      >
        <ChevronLeft aria-hidden="true" />
        Previous runs
      </Button>
      <p className="text-sm">
        {first}–{last} of {engine.total}
        {fetching ? (
          <span className="text-muted-foreground"> · reading…</span>
        ) : null}
      </p>
      <Button
        size="sm"
        variant="outline"
        disabled={offset + RUNS_PAGE_SIZE >= engine.total || fetching}
        onClick={() => setOffset(offset + RUNS_PAGE_SIZE)}
      >
        Next runs
        <ChevronRight aria-hidden="true" />
      </Button>
    </nav>
  );
}
