"use client";

import { Button } from "@asym/ui/components/shadcn/button-component";
import {
  DataTableResponsive,
  type DataTableFilterField,
} from "@asym/ui/components/shadcn/data-table";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@asym/ui/components/shadcn/field";
import { Input } from "@asym/ui/components/shadcn/input";
import {
  Select,
  SelectContent,
  SelectControlLabel,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@asym/ui/components/shadcn/select";
import { ListRestart } from "lucide-react";
import { useId, useState } from "react";

import { ControlButton } from "./controls";
import {
  Ago,
  EmptyNote,
  ErrorNote,
  ExternalLink,
  Fact,
  Facts,
  IssueButton,
  LongText,
  Mono,
  Panel,
  Section,
  StatusBadge,
  Unavailable,
  When,
  useConsole,
} from "./shared";

import type {
  Availability,
  ControlAction,
  FactoryState,
  IssueSummary,
  ScopeDoc,
} from "../lib/factory";
import type { ColumnDef } from "@asym/ui/components/shadcn/data-table/tanstack";

type EndState = ScopeDoc["endState"];
type Status = IssueSummary["status"];

const STATUS_ORDER: { value: Status; label: string }[] = [
  { value: "queued", label: "Not admitted" },
  { value: "pending", label: "Pending" },
  { value: "active", label: "Active" },
  { value: "waiting", label: "Waiting" },
  { value: "BLOCKED", label: "Blocked" },
  { value: "PR_READY", label: "PR ready" },
  { value: "MERGED", label: "Merged" },
  { value: "stopped", label: "Stopped" },
];
const STATUS_TEXT = Object.fromEntries(
  STATUS_ORDER.map(({ value, label }) => [value, label]),
) as Record<Status, string>;

const CONTROL_OPTIONS = [
  { value: "run", label: "Run" },
  { value: "hold", label: "Hold" },
  { value: "stop", label: "Stop" },
  { value: "none", label: "No work item" },
];

const END_STATE_ITEMS: { value: EndState; label: string }[] = [
  { value: "PR_READY", label: "PR ready" },
  { value: "MERGED", label: "Merged" },
];
const END_STATE_TEXT: Record<EndState, string> = {
  PR_READY: "PR ready",
  MERGED: "Merged",
};

const OWNER_PATTERN = /^[a-z][a-z0-9-]{0,39}$/;
const MAX_SCOPE_ISSUES = 200;
const MAX_NOTE = 600;

export function Issues({ loading }: { loading: boolean }) {
  const { snapshot } = useConsole();
  const factory = snapshot?.factory;
  return (
    <div className="flex min-w-0 flex-col gap-6">
      <div className="grid min-w-0 grid-cols-1 gap-6 xl:grid-cols-2">
        <ScopePanel factory={factory} loading={loading} />
        <AssignPanel
          factory={factory}
          loading={loading}
          owners={snapshot?.settings.owners ?? null}
          ownersReason={snapshot?.settings.configReason ?? null}
        />
      </div>
      <IssuesPanel factory={factory} loading={loading} />
    </div>
  );
}

type FactoryValue = Availability<FactoryState> | null | undefined;

function Observed({ value }: { value: FactoryValue }) {
  if (!value) return <>Not observed yet.</>;
  return (
    <>
      Observed <When value={value.observedAt} /> (
      <Ago value={value.observedAt} />
      ).
    </>
  );
}

// ---------------------------------------------------------------------------
// Authorized scope
// ---------------------------------------------------------------------------

function ScopePanel({
  factory,
  loading,
}: {
  factory: FactoryValue;
  loading: boolean;
}) {
  const id = useId();
  return (
    <Panel
      id={id}
      title="Authorized scope"
      description={<Observed value={factory} />}
    >
      <Section value={factory} loading={loading} label="factory state">
        {(state) => <ScopeSummary state={state} />}
      </Section>
    </Panel>
  );
}

function ScopeSummary({ state }: { state: FactoryState }) {
  const { scope } = state;
  const malformed = state.malformed.find(
    (entry) => entry.name === "core/scope",
  );
  if (!scope)
    return malformed ? (
      <ErrorNote>
        <p className="font-medium">The scope document could not be read</p>
        <p>{malformed.reason}</p>
        <p className="text-xs">
          Nothing is admitted from a scope the Console cannot validate.
        </p>
      </ErrorNote>
    ) : (
      <Unavailable title="No authorized scope">
        No scope has been authorized yet. Assign one below; the selector admits
        nothing until a scope exists.
      </Unavailable>
    );
  const outside = state.issues.filter(
    (issue) => issue.admitted && !issue.inScope,
  ).length;
  return (
    <>
      <Facts>
        <Fact term="Issues">
          {scope.issues.length} {scope.issues.length === 1 ? "issue" : "issues"}
          <IssueNumbers issues={scope.issues} />
        </Fact>
        <Fact term="End state">
          <StatusBadge
            value={scope.endState}
            label={END_STATE_TEXT[scope.endState]}
          />
        </Fact>
        <Fact term="Owner">{scope.owner}</Fact>
        <Fact term="Approved by">{scope.approvedBy ?? "Not recorded"}</Fact>
        <Fact term="Approved at">
          <When value={scope.approvedAt} />
        </Fact>
        <Fact term="Note">
          {scope.note ? <LongText>{scope.note}</LongText> : "None"}
        </Fact>
      </Facts>
      <StatusCounts issues={state.issues} />
      {outside ? (
        <EmptyNote>
          {outside} admitted {outside === 1 ? "issue is" : "issues are"} no
          longer in the authorized scope;{" "}
          {outside === 1 ? "its work item is" : "their work items are"} kept and
          counted above.
        </EmptyNote>
      ) : null}
    </>
  );
}

function IssueNumbers({ issues }: { issues: number[] }) {
  if (!issues.length) return null;
  const shown = issues.slice(0, 40);
  return (
    <span className="block break-words text-xs text-muted-foreground">
      {shown.map((issue) => `#${issue}`).join(", ")}
      {issues.length > shown.length
        ? ` and ${issues.length - shown.length} more`
        : ""}
    </span>
  );
}

function StatusCounts({ issues }: { issues: IssueSummary[] }) {
  const counts = new Map<Status, number>();
  for (const issue of issues)
    counts.set(issue.status, (counts.get(issue.status) ?? 0) + 1);
  return (
    <ul aria-label="Issues by status" className="flex flex-wrap gap-2">
      {STATUS_ORDER.map(({ value, label }) => (
        <li key={value}>
          <StatusBadge
            value={value}
            label={`${label}: ${counts.get(value) ?? 0}`}
          />
        </li>
      ))}
    </ul>
  );
}

// ---------------------------------------------------------------------------
// Assign scope
// ---------------------------------------------------------------------------

function AssignPanel({
  factory,
  loading,
  owners,
  ownersReason,
}: {
  factory: FactoryValue;
  loading: boolean;
  /** core-factory.json owner aliases; null when they could not be read. */
  owners: string[] | null;
  ownersReason: string | null;
}) {
  const id = useId();
  return (
    <Panel
      id={id}
      title="Assign scope"
      description="Assigning replaces the authorized issue list. Issues already admitted keep their work items; the selector admits from the new scope at its next pass."
    >
      <Section value={factory} loading={loading} label="factory state">
        {(state) =>
          owners?.length ? (
            <AssignScopeForm
              scope={state.scope}
              owners={owners}
              labelledBy={id}
            />
          ) : (
            <Unavailable title="Scope owners unavailable">
              {ownersReason ??
                "The factory configuration's owners have not been read"}
              , so the Console cannot assign a scope.
            </Unavailable>
          )
        }
      </Section>
    </Panel>
  );
}

type ParsedIssues =
  | { ok: true; issues: number[] }
  | { ok: false; empty: boolean; message: string };

function parseIssues(text: string): ParsedIssues {
  const tokens = text.split(/[\s,]+/).filter(Boolean);
  if (!tokens.length)
    return {
      ok: false,
      empty: true,
      message: "Enter at least one issue number.",
    };
  const numbers: number[] = [];
  for (const token of tokens) {
    const value = /^#?\d{1,8}$/.test(token)
      ? Number(token.replace("#", ""))
      : Number.NaN;
    if (!Number.isInteger(value) || value < 1 || value > 10_000_000)
      return {
        ok: false,
        empty: false,
        message: `“${token.slice(0, 24)}” is not a positive issue number. Separate numbers with commas or spaces.`,
      };
    numbers.push(value);
  }
  const issues = [...new Set(numbers)].sort((left, right) => left - right);
  if (issues.length > MAX_SCOPE_ISSUES)
    return {
      ok: false,
      empty: false,
      message: `At most ${MAX_SCOPE_ISSUES} issues can be assigned at once; ${issues.length} were entered.`,
    };
  return { ok: true, issues };
}

function listIssues(issues: number[], limit = 12) {
  const shown = issues.slice(0, limit).map((issue) => `#${issue}`);
  return issues.length > limit
    ? `${shown.join(", ")} and ${issues.length - limit} more`
    : shown.join(", ");
}

function AssignScopeForm({
  scope,
  owners,
  labelledBy,
}: {
  scope: ScopeDoc | null;
  owners: string[];
  labelledBy: string;
}) {
  const { authority, authorityReason } = useConsole();
  const issuesId = useId();
  const issuesHelpId = useId();
  const issuesErrorId = useId();
  const noteId = useId();
  const noteHelpId = useId();
  const [issuesText, setIssuesText] = useState("");
  const [endState, setEndState] = useState<EndState>(
    scope?.endState ?? "PR_READY",
  );
  const [owner, setOwner] = useState(() =>
    scope && owners.includes(scope.owner) ? scope.owner : (owners[0] ?? ""),
  );
  const [note, setNote] = useState("");

  const parsed = parseIssues(issuesText);
  const showIssueError = !parsed.ok && !parsed.empty;
  const ownerValid = OWNER_PATTERN.test(owner) && owners.includes(owner);
  const trimmedNote = note.trim();
  const problem = !parsed.ok
    ? parsed.message
    : !ownerValid
      ? "Choose a configured owner."
      : trimmedNote.length > MAX_NOTE
        ? `The note is limited to ${MAX_NOTE} characters.`
        : null;
  const issues = parsed.ok ? parsed.issues : [];
  const action: ControlAction = {
    kind: "scope",
    issues,
    endState,
    owner,
    ...(trimmedNote ? { note: trimmedNote } : {}),
  };

  const prefill = () => {
    if (!scope) return;
    setIssuesText(scope.issues.join(", "));
    setEndState(scope.endState);
    if (owners.includes(scope.owner)) setOwner(scope.owner);
    setNote(scope.note ?? "");
  };

  return (
    <form
      aria-labelledby={labelledBy}
      className="flex min-w-0 flex-col gap-4"
      onSubmit={(event) => event.preventDefault()}
    >
      <div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={!scope}
          title={scope ? undefined : "No scope has been authorized yet."}
          onClick={prefill}
        >
          <ListRestart aria-hidden="true" />
          Start from current scope
        </Button>
      </div>
      <Field>
        <FieldLabel htmlFor={issuesId}>Issue numbers</FieldLabel>
        <Input
          id={issuesId}
          value={issuesText}
          autoComplete="off"
          inputMode="numeric"
          placeholder="101, 102 103"
          aria-invalid={showIssueError || undefined}
          aria-describedby={
            showIssueError ? `${issuesHelpId} ${issuesErrorId}` : issuesHelpId
          }
          onChange={(event) => setIssuesText(event.target.value)}
        />
        <FieldDescription id={issuesHelpId}>
          Positive issue numbers separated by commas or spaces, up to{" "}
          {MAX_SCOPE_ISSUES}.
        </FieldDescription>
        {showIssueError ? (
          <FieldError id={issuesErrorId}>{parsed.message}</FieldError>
        ) : null}
      </Field>
      <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2">
        <Field>
          <Select
            items={END_STATE_ITEMS}
            value={endState}
            onValueChange={(value) => {
              if (value === "PR_READY" || value === "MERGED")
                setEndState(value);
            }}
          >
            <SelectControlLabel>End state</SelectControlLabel>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {END_STATE_ITEMS.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field>
          <Select
            items={owners.map((value) => ({ value, label: value }))}
            value={owner}
            onValueChange={(value) => {
              if (typeof value === "string") setOwner(value);
            }}
          >
            <SelectControlLabel>Owner</SelectControlLabel>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Choose an owner" />
            </SelectTrigger>
            <SelectContent>
              {owners.map((value) => (
                <SelectItem key={value} value={value}>
                  {value}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      </div>
      <Field>
        <FieldLabel htmlFor={noteId}>Note (optional)</FieldLabel>
        <Input
          id={noteId}
          value={note}
          maxLength={MAX_NOTE}
          autoComplete="off"
          aria-describedby={noteHelpId}
          onChange={(event) => setNote(event.target.value)}
        />
        <FieldDescription id={noteHelpId}>
          {note.length} of {MAX_NOTE} characters. Recorded on the scope
          document.
        </FieldDescription>
      </Field>
      <ScopeChange
        scope={scope}
        issues={issues}
        endState={endState}
        owner={owner}
        note={trimmedNote}
        problem={
          parsed.ok
            ? problem
            : parsed.empty
              ? null
              : "Fix the issue numbers above before assigning."
        }
        empty={!parsed.ok && parsed.empty}
      />
      <ControlButton
        action={action}
        label="Assign scope"
        variant="default"
        disabled={Boolean(problem)}
        disabledReason={problem ?? undefined}
      />
      {!authority && authorityReason ? (
        <EmptyNote>Controls are disabled: {authorityReason}</EmptyNote>
      ) : null}
    </form>
  );
}

function ScopeChange({
  scope,
  issues,
  endState,
  owner,
  note,
  problem,
  empty,
}: {
  scope: ScopeDoc | null;
  issues: number[];
  endState: EndState;
  owner: string;
  note: string;
  problem: string | null;
  empty: boolean;
}) {
  if (empty || problem)
    return (
      <p className="text-sm text-muted-foreground">
        {empty
          ? "Enter the issues to authorize. Nothing is written until you select Assign scope."
          : `Not ready to assign: ${problem}`}
      </p>
    );
  const current = new Set(scope?.issues ?? []);
  const next = new Set(issues);
  const added = issues.filter((issue) => !current.has(issue));
  const removed = (scope?.issues ?? []).filter((issue) => !next.has(issue));
  return (
    <div className="flex min-w-0 flex-col gap-1 rounded-lg border p-3 text-sm">
      <p className="font-medium">Will write the authorized scope</p>
      <p className="break-words">
        {issues.length} {issues.length === 1 ? "issue" : "issues"} (
        {listIssues(issues)}), end state {END_STATE_TEXT[endState]}, owner{" "}
        {owner}
        {note
          ? `, note “${note.length > 80 ? `${note.slice(0, 80)}…` : note}”`
          : ", no note"}
        .
      </p>
      {scope ? (
        <p className="break-words text-muted-foreground">
          {added.length ? `Adds ${listIssues(added)}. ` : "Adds no issues. "}
          {removed.length
            ? `Removes ${listIssues(removed)} from the list (admitted work items are kept).`
            : "Removes no issues."}
          {scope.endState !== endState
            ? ` Changes the end state from ${END_STATE_TEXT[scope.endState]}.`
            : ""}
          {scope.owner !== owner
            ? ` Changes the owner from ${scope.owner}.`
            : ""}
        </p>
      ) : (
        <p className="text-muted-foreground">
          This is the first authorized scope.
        </p>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Issues table
// ---------------------------------------------------------------------------

function IssuesPanel({
  factory,
  loading,
}: {
  factory: FactoryValue;
  loading: boolean;
}) {
  const id = useId();
  return (
    <Panel
      id={id}
      title="Issues"
      description={
        <>
          Every authorized issue and every admitted work item.{" "}
          <Observed value={factory} />
        </>
      }
    >
      <Section value={factory} loading={loading} label="factory state">
        {(state) => (
          <>
            {state.issues.length ? (
              <DataTableResponsive
                columns={ISSUE_COLUMNS}
                data={state.issues}
                getRowId={rowId}
                searchColumnId="label"
                searchPlaceholder="Search issues by number, status, route or branch"
                filterFields={FILTER_FIELDS}
                config={TABLE_CONFIG}
                mobileCardConfig={MOBILE_CARD}
                emptyState={
                  <EmptyNote>
                    No issues match the current search or filters.
                  </EmptyNote>
                }
              />
            ) : (
              <EmptyNote>No issues are in the authorized scope yet.</EmptyNote>
            )}
            <MalformedList malformed={state.malformed} />
          </>
        )}
      </Section>
    </Panel>
  );
}

function MalformedList({
  malformed,
}: {
  malformed: FactoryState["malformed"];
}) {
  if (!malformed.length) return null;
  return (
    <ErrorNote>
      <p className="font-medium">
        {malformed.length === 1
          ? "One state document could not be read"
          : `${malformed.length} state documents could not be read`}
      </p>
      <p className="text-xs">
        They are left out above rather than guessed at. Reconcile them from the
        runbook.
      </p>
      <ul className="mt-2 flex flex-col gap-1">
        {malformed.map((entry) => (
          <li key={entry.name} className="break-words">
            <Mono>{entry.name}</Mono>: {entry.reason}
          </li>
        ))}
      </ul>
    </ErrorNote>
  );
}

const rowId = (row: IssueSummary) => String(row.issue);

function searchLabel(row: IssueSummary) {
  return [
    `#${row.issue}`,
    STATUS_TEXT[row.status],
    row.status,
    row.control ?? "",
    row.route ?? "",
    row.branch ?? "",
    row.blocker?.code ?? "",
    row.pr ? `PR #${row.pr.number}` : "",
  ]
    .filter(Boolean)
    .join(" ");
}

function truncate(text: string, length: number) {
  return text.length > length ? `${text.slice(0, length).trimEnd()}…` : text;
}

const includesFilter = (
  row: { getValue: (id: string) => unknown },
  id: string,
  value: unknown,
) =>
  !Array.isArray(value) ||
  value.length === 0 ||
  value.includes(row.getValue(id));

function ControlCell({ issue }: { issue: IssueSummary }) {
  if (!issue.control)
    return <span className="text-sm text-muted-foreground">No work item</span>;
  return (
    <span className="flex min-w-0 flex-col items-start gap-1">
      <StatusBadge value={issue.control} />
      {issue.controlReason ? (
        <span className="block max-w-48 whitespace-normal break-words text-xs text-muted-foreground">
          {truncate(issue.controlReason, 80)}
        </span>
      ) : null}
    </span>
  );
}

function RoundCell({ issue }: { issue: IssueSummary }) {
  if (!issue.admitted)
    return <span className="text-sm text-muted-foreground">Not started</span>;
  return (
    <span className="flex flex-col items-start gap-1 text-sm">
      <span>Round {issue.round}</span>
      {issue.lease?.live ? (
        <StatusBadge value="running" label="live run" />
      ) : null}
    </span>
  );
}

function PrCell({ issue }: { issue: IssueSummary }) {
  if (!issue.pr)
    return <span className="text-sm text-muted-foreground">None</span>;
  return (
    <span className="flex flex-col items-start gap-1 text-sm">
      <ExternalLink href={issue.pr.url}>PR #{issue.pr.number}</ExternalLink>
      {issue.pr.mergedAt ? (
        <span className="text-xs text-muted-foreground">merged</span>
      ) : null}
    </span>
  );
}

function BlockerCell({ issue }: { issue: IssueSummary }) {
  if (!issue.blocker)
    return <span className="text-sm text-muted-foreground">None</span>;
  return (
    <span className="flex min-w-0 flex-col items-start gap-1">
      <Mono>{issue.blocker.code}</Mono>
      {issue.blocker.detail ? (
        <span className="block max-w-64 whitespace-normal break-words text-xs text-muted-foreground">
          {truncate(issue.blocker.detail, 120)}
        </span>
      ) : null}
    </span>
  );
}

function UpdatedCell({ value }: { value: string | null }) {
  if (!value)
    return <span className="text-sm text-muted-foreground">Not recorded</span>;
  return (
    <span className="text-sm">
      <Ago value={value} />
    </span>
  );
}

const ISSUE_COLUMNS: ColumnDef<IssueSummary>[] = [
  {
    id: "label",
    accessorFn: searchLabel,
    header: "Issue",
    cell: ({ row }) => <IssueButton issue={row.original.issue} />,
    sortFn: (left, right) => left.original.issue - right.original.issue,
    enableHiding: false,
    meta: { label: "Issue" },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <StatusBadge value={row.original.status} />,
    filterFn: includesFilter,
    meta: { label: "Status" },
  },
  {
    id: "control",
    accessorFn: (row) => row.control ?? "none",
    header: "Control",
    cell: ({ row }) => <ControlCell issue={row.original} />,
    filterFn: includesFilter,
    meta: { label: "Control" },
  },
  {
    id: "round",
    accessorFn: (row) => row.round,
    header: "Round",
    cell: ({ row }) => <RoundCell issue={row.original} />,
    meta: { label: "Round" },
  },
  {
    id: "route",
    accessorFn: (row) => row.route ?? "",
    header: "Route",
    cell: ({ row }) => (
      <span className="text-sm">{row.original.route ?? "None"}</span>
    ),
    meta: { label: "Route" },
  },
  {
    id: "priority",
    accessorFn: (row) => row.priority ?? -1,
    header: "Priority",
    cell: ({ row }) => (
      <span className="text-sm">{row.original.priority ?? "Not set"}</span>
    ),
    meta: { label: "Priority" },
  },
  {
    id: "pr",
    accessorFn: (row) => row.pr?.number ?? 0,
    header: "PR",
    cell: ({ row }) => <PrCell issue={row.original} />,
    meta: { label: "PR" },
  },
  {
    id: "blocker",
    accessorFn: (row) => row.blocker?.code ?? "",
    header: "Blocker",
    cell: ({ row }) => <BlockerCell issue={row.original} />,
    meta: { label: "Blocker" },
  },
  {
    id: "updated",
    accessorFn: (row) => row.updatedAt ?? "",
    header: "Updated",
    cell: ({ row }) => <UpdatedCell value={row.original.updatedAt} />,
    meta: { label: "Updated" },
  },
];

const FILTER_FIELDS: DataTableFilterField<IssueSummary>[] = [
  { id: "status", label: "Status", options: STATUS_ORDER },
  { id: "control", label: "Control", options: CONTROL_OPTIONS },
];

const TABLE_CONFIG = {
  enableRowSelection: false,
  enableViewToggle: true,
  defaultViewMode: "table" as const,
};

const MOBILE_CARD = {
  renderCard: (row: { original: IssueSummary }) => (
    <IssueCard issue={row.original} />
  ),
};

function IssueCard({ issue }: { issue: IssueSummary }) {
  return (
    <div className="flex min-w-0 flex-col gap-3 rounded-xl border bg-card p-4 text-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <IssueButton issue={issue.issue} />
        <span className="flex flex-wrap items-center gap-2">
          <StatusBadge value={issue.status} />
          {issue.control ? <StatusBadge value={issue.control} /> : null}
        </span>
      </div>
      <dl className="grid min-w-0 grid-cols-2 gap-x-4 gap-y-1">
        <dt className="text-muted-foreground">Round</dt>
        <dd>{issue.admitted ? issue.round : "Not started"}</dd>
        <dt className="text-muted-foreground">Route</dt>
        <dd className="break-words">{issue.route ?? "None"}</dd>
        <dt className="text-muted-foreground">Priority</dt>
        <dd>{issue.priority ?? "Not set"}</dd>
        <dt className="text-muted-foreground">Updated</dt>
        <dd>
          {issue.updatedAt ? <Ago value={issue.updatedAt} /> : "Not recorded"}
        </dd>
      </dl>
      {issue.lease?.live ? (
        <p className="text-xs">A round run is live for this issue.</p>
      ) : null}
      {issue.pr ? (
        <p>
          <ExternalLink href={issue.pr.url}>PR #{issue.pr.number}</ExternalLink>
          {issue.pr.mergedAt ? (
            <span className="text-muted-foreground"> · merged</span>
          ) : null}
        </p>
      ) : null}
      {issue.blocker ? (
        <p className="break-words">
          <span className="font-medium">Blocked:</span>{" "}
          <Mono>{issue.blocker.code}</Mono>
          {issue.blocker.detail
            ? ` · ${truncate(issue.blocker.detail, 160)}`
            : ""}
        </p>
      ) : null}
      {issue.controlReason ? (
        <p className="break-words text-xs text-muted-foreground">
          Control reason: {truncate(issue.controlReason, 160)}
        </p>
      ) : null}
    </div>
  );
}
