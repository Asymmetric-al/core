"use client";

import { resolveMissionControlAutomationLifecycle } from "@asym/database/mission-control-automations";
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
import { Skeleton } from "@asym/ui/components/shadcn/skeleton";
import { AlertTriangle, Search, Zap } from "lucide-react";
import { type ReactNode, type Ref, useState } from "react";

import {
  automationRecentRuns,
  automationRuleActivityReported,
  automationRepairNote,
  automationRuleTitle,
  automationRunModeLabel,
  automationStatusLabel,
  automationStepsLabel,
  formatTriggerKind,
} from "./automation-rules";

import type { MissionControlAutomationRuleDto } from "@asym/database/hooks";

const STATUS_BADGE_VARIANTS = {
  Active: "success",
  Ready: "info",
  Paused: "warning",
  Disabled: "secondary",
  Draft: "outline",
  Invalid: "destructive",
} as const;

function RuleStatusBadge({ rule }: { rule: MissionControlAutomationRuleDto }) {
  const status = resolveMissionControlAutomationLifecycle(rule).displayStatus;
  return (
    <Badge
      className="shrink-0"
      variant={STATUS_BADGE_VARIANTS[status] ?? "outline"}
    >
      {automationStatusLabel(status)}
    </Badge>
  );
}

/** Sort order for Status: rules needing repair first, then by how live. */
const STATUS_SORT_RANK: Record<string, number> = {
  Invalid: 0,
  Active: 1,
  Ready: 2,
  Paused: 3,
  Draft: 4,
  Disabled: 5,
};

function statusSortRank(rule: MissionControlAutomationRuleDto): number {
  const status = resolveMissionControlAutomationLifecycle(rule).displayStatus;
  return STATUS_SORT_RANK[status] ?? STATUS_SORT_RANK.Disabled! + 1;
}

function RuleRecentRuns({
  rule,
  className,
}: {
  rule: MissionControlAutomationRuleDto;
  className?: string;
}) {
  const recent = automationRecentRuns(rule);
  return (
    <div className={className ?? "flex min-w-0 flex-col gap-0.5"}>
      <span
        className={
          recent.failing
            ? "text-sm font-medium text-destructive tabular-nums"
            : "text-sm text-muted-foreground tabular-nums"
        }
      >
        {recent.summary}
      </span>
      {recent.lastFailure ? (
        <span className="text-xs text-muted-foreground">
          {recent.lastFailure}
        </span>
      ) : null}
    </div>
  );
}

function RuleIdentity({ rule }: { rule: MissionControlAutomationRuleDto }) {
  const title = automationRuleTitle(rule.name);
  const repair = automationRepairNote(rule);
  return (
    <div className="flex min-w-0 flex-col gap-0.5">
      <span className="truncate text-sm font-medium text-foreground">
        {title}
      </span>
      {title !== rule.name ? (
        <span className="truncate font-mono text-xs text-muted-foreground">
          {rule.name}
        </span>
      ) : null}
      {repair ? (
        <div className="mt-1 flex flex-col gap-0.5 text-xs">
          <p className="text-destructive">{repair.problem}</p>
          <p className="text-foreground">{repair.nextStep}</p>
        </div>
      ) : null}
    </div>
  );
}

const COLUMNS: DataGridColumnDef<MissionControlAutomationRuleDto>[] = [
  {
    id: "rule",
    accessorFn: (rule) => automationRuleTitle(rule.name),
    header: ({ column }) => (
      <DataGridColumnHeader column={column} title="Rule" />
    ),
    cell: ({ row }) => <RuleIdentity rule={row.original} />,
    size: 300,
    sortFn: "text",
    meta: { headerTitle: "Rule" },
  },
  {
    id: "trigger",
    accessorFn: (rule) => formatTriggerKind(rule.trigger.kind),
    header: ({ column }) => (
      <DataGridColumnHeader column={column} title="Trigger" />
    ),
    cell: ({ getValue }) => (
      <span className="text-sm text-foreground">{String(getValue())}</span>
    ),
    size: 200,
    enableSorting: false,
    meta: { headerTitle: "Trigger" },
  },
  {
    id: "runMode",
    accessorFn: (rule) => automationRunModeLabel(rule.runMode),
    header: ({ column }) => (
      <DataGridColumnHeader column={column} title="Runs" />
    ),
    cell: ({ getValue }) => (
      <span className="text-sm text-muted-foreground">
        {String(getValue())}
      </span>
    ),
    size: 160,
    sortFn: "text",
    meta: { headerTitle: "Runs" },
  },
  {
    id: "steps",
    accessorFn: (rule) => automationStepsLabel(rule),
    header: ({ column }) => (
      <DataGridColumnHeader column={column} title="Steps" />
    ),
    cell: ({ getValue }) => (
      <span className="text-sm text-muted-foreground tabular-nums">
        {String(getValue())}
      </span>
    ),
    size: 190,
    enableSorting: false,
    meta: { headerTitle: "Steps" },
  },
  {
    id: "status",
    accessorFn: (rule) =>
      resolveMissionControlAutomationLifecycle(rule).displayStatus,
    header: ({ column }) => (
      <DataGridColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => <RuleStatusBadge rule={row.original} />,
    size: 120,
    sortFn: (rowA, rowB) =>
      statusSortRank(rowA.original) - statusSortRank(rowB.original),
    meta: { headerTitle: "Status" },
  },
  {
    id: "recentRuns",
    // Sorts by failed runs; runs break ties so busier rules rank higher.
    // A rule whose runs weren't reported ranks below one with no runs.
    accessorFn: (rule) =>
      automationRuleActivityReported(rule)
        ? (rule.failedRuns24h ?? 0) * 1_000_000 + (rule.runs24h ?? 0)
        : -1,
    header: ({ column }) => (
      <DataGridColumnHeader column={column} title="Last 24 hours" />
    ),
    cell: ({ row }) => <RuleRecentRuns rule={row.original} />,
    size: 190,
    sortFn: "basic",
    sortDescFirst: true,
    meta: { headerTitle: "Last 24 hours" },
  },
];

const RULE_SORT_LABELS: Record<string, string> = {
  "recentRuns:desc": "Most failures first",
  "status:asc": "Status: needs repair first",
  "status:desc": "Status: disabled first",
  "rule:asc": "Rule: A–Z",
  "rule:desc": "Rule: Z–A",
  "runMode:desc": "Runs automatically first",
  "runMode:asc": "Runs after staff review first",
};

/** Header sorts a wide screen can set, labelled if a phone shows them. */
const RULE_EXTRA_SORT_LABELS: Record<string, string> = {
  "recentRuns:asc": "Fewest failures first",
};

/** Failing rules first; ties keep the saved order (newest change first). */
const DEFAULT_RULE_SORT: SortingState = [{ id: "recentRuns", desc: true }];

function RuleMobileRow({ rule }: { rule: MissionControlAutomationRuleDto }) {
  return (
    <Item variant="outline" size="sm" render={<div />}>
      <ItemContent className="min-w-0 gap-1.5">
        <div className="flex min-w-0 items-start justify-between gap-3">
          <RuleIdentity rule={rule} />
          <RuleStatusBadge rule={rule} />
        </div>
        <p className="text-xs text-muted-foreground">
          {formatTriggerKind(rule.trigger.kind)} ·{" "}
          {automationRunModeLabel(rule.runMode)}
        </p>
        <p className="text-xs text-muted-foreground">
          {automationStepsLabel(rule)}
        </p>
        <RuleRecentRuns
          rule={rule}
          className="flex min-w-0 flex-wrap items-baseline gap-x-2"
        />
      </ItemContent>
    </Item>
  );
}

function RulesLoadingState() {
  return (
    <div
      aria-busy="true"
      aria-label="Loading automation rules"
      className="flex flex-col gap-3 py-4"
    >
      <p className="text-sm text-muted-foreground">
        Loading automation dashboard
      </p>
      {Array.from({ length: 3 }, (_, index) => (
        <Skeleton
          key={`automation-rule-loading-${index}`}
          className="h-12 w-full"
        />
      ))}
    </div>
  );
}

function RulesEmptyState({
  description,
  icon,
  title,
}: {
  description: string;
  icon: ReactNode;
  title: string;
}) {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">{icon}</EmptyMedia>
        <EmptyTitle>{title}</EmptyTitle>
        <EmptyDescription>{description}</EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}

function rulesEmptyContent({
  allRuleCount,
  isBlocked,
  isLoading,
}: {
  allRuleCount: number;
  isBlocked: boolean;
  isLoading: boolean;
}) {
  if (isLoading) return <RulesLoadingState />;
  if (isBlocked) {
    return (
      <RulesEmptyState
        description="Rules show here once the automations list loads."
        icon={<AlertTriangle />}
        title="Automation rules unavailable"
      />
    );
  }
  if (allRuleCount === 0) {
    return (
      <RulesEmptyState
        description="No automation rules have been saved yet."
        icon={<Zap />}
        title="No automation rules yet"
      />
    );
  }
  return (
    <RulesEmptyState
      description="No rules match this filter."
      icon={<Search />}
      title="No matching automation rules"
    />
  );
}

export function AutomationRulesGrid({
  allRuleCount,
  failingOnly = false,
  filteredRules,
  headingId,
  headingRef,
  isBlocked,
  isLoading,
  onSearchChange,
  onShowAllRules,
  search,
}: {
  allRuleCount: number;
  failingOnly?: boolean;
  filteredRules: MissionControlAutomationRuleDto[];
  headingId: string;
  headingRef?: Ref<HTMLHeadingElement>;
  isBlocked: boolean;
  isLoading: boolean;
  onSearchChange: (value: string) => void;
  onShowAllRules?: () => void;
  search: string;
}) {
  const [sorting, setSorting] = useState<SortingState>(DEFAULT_RULE_SORT);
  const rows = isBlocked || isLoading ? [] : filteredRules;
  const table = useTable({
    features: dataGridFeatures,
    // No pager: every rule renders (the paginated row model would
    // otherwise stop at its default page of ten).
    manualPagination: true,
    data: rows,
    columns: COLUMNS,
    getRowId: (rule, index) => rule.id ?? `${rule.name}-${index}`,
    state: { sorting },
    onSortingChange: setSorting,
  });
  const countLabel =
    rows.length === 0
      ? null
      : rows.length === allRuleCount
        ? `${allRuleCount} ${allRuleCount === 1 ? "rule" : "rules"}`
        : `${rows.length} of ${allRuleCount} rules`;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <h2
          id={headingId}
          ref={headingRef}
          tabIndex={-1}
          className="scroll-mt-4 text-lg font-semibold outline-none"
        >
          Automation rules
        </h2>
        <p className="text-sm text-muted-foreground">
          What starts each rule, how it runs, whether it is on and how its runs
          went in the last 24 hours.
        </p>
      </div>
      <DataGridPanel
        table={table}
        recordCount={rows.length}
        label="Automation rules"
        labelledBy={headingId}
        tableLayout={{ width: "auto" }}
        renderMobileRow={(
          row: DataGridRow<MissionControlAutomationRuleDto>,
        ) => <RuleMobileRow rule={row.original} />}
        toolbar={
          <>
            <DataGridSearch
              label="Filter automation rules"
              placeholder="Filter rules…"
              value={search}
              onValueChange={onSearchChange}
            />
            {failingOnly ? (
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  Showing rules that failed in the last 24 hours
                </span>
                {onShowAllRules ? (
                  <Button variant="outline" size="sm" onClick={onShowAllRules}>
                    Show all rules
                  </Button>
                ) : null}
              </div>
            ) : null}
            <DataGridToolbarSpacer />
            <DataGridSortSelect
              whenCards
              label="Sort automation rules"
              options={RULE_SORT_LABELS}
              extraOptions={RULE_EXTRA_SORT_LABELS}
              fallback="recentRuns:desc"
              sorting={sorting}
              onSortingChange={setSorting}
            />
            {countLabel ? (
              <span className="ms-auto text-sm text-muted-foreground tabular-nums">
                {countLabel}
              </span>
            ) : null}
          </>
        }
        empty={rulesEmptyContent({ allRuleCount, isBlocked, isLoading })}
      />
    </div>
  );
}
