"use client";

import {
  useMissionControlAutomations,
  type MissionControlAutomationRuleDto,
  type MissionControlAutomationSummary,
} from "@asym/database/hooks";
import { resolveMissionControlAutomationLifecycle } from "@asym/database/mission-control-automations";
import { motion, useReducedMotion } from "@asym/lib/motion";
import { propsHeroEntrance, STAGGER_TIGHT } from "@asym/lib/motion-presets";
import { PageShell } from "@asym/ui/components/primitives/page-shell";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@asym/ui/components/shadcn/alert";
import { Badge } from "@asym/ui/components/shadcn/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@asym/ui/components/shadcn/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@asym/ui/components/shadcn/empty";
import { Input } from "@asym/ui/components/shadcn/input";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemSeparator,
  ItemTitle,
} from "@asym/ui/components/shadcn/item";
import { Label } from "@asym/ui/components/shadcn/label";
import { Skeleton } from "@asym/ui/components/shadcn/skeleton";
import { cn } from "@asym/ui/lib/utils";
import {
  AlertTriangle,
  ClipboardList,
  Link2,
  Play,
  Search,
  Zap,
} from "lucide-react";
import { Fragment, useMemo, useState, type ReactNode } from "react";

const numberFormatter = new Intl.NumberFormat("en-US");

function formatCount(value: number): string {
  return numberFormatter.format(value);
}

function formatTriggerKind(kind: string): string {
  return kind
    .split("_")
    .filter(Boolean)
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(" ");
}

export function filterAutomationRules(
  automationRules: MissionControlAutomationRuleDto[],
  search: string,
): MissionControlAutomationRuleDto[] {
  const normalizedSearch = search.trim().toLowerCase();
  if (!normalizedSearch) {
    return automationRules;
  }

  return automationRules.filter((rule) => {
    const trigger = formatTriggerKind(rule.trigger.kind).toLowerCase();
    const status =
      resolveMissionControlAutomationLifecycle(
        rule,
      ).displayStatus.toLowerCase();
    return (
      rule.name.toLowerCase().includes(normalizedSearch) ||
      trigger.includes(normalizedSearch) ||
      status.includes(normalizedSearch)
    );
  });
}

function LoadingStatCard() {
  return (
    <Card className="border-border bg-card shadow-sm">
      <CardContent aria-busy="true" className="p-6">
        <div className="flex items-center justify-between pb-2">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="size-4 rounded" />
        </div>
        <Skeleton className="mt-3 h-8 w-16" />
        <Skeleton className="mt-2 h-3 w-32" />
      </CardContent>
    </Card>
  );
}

function StatCard({
  icon,
  label,
  sublabel,
  value,
  valueClassName,
}: {
  icon: ReactNode;
  label: string;
  sublabel: string;
  value: number;
  valueClassName?: string;
}) {
  return (
    <Card className="border-border bg-card text-card-foreground shadow-sm">
      <CardContent className="p-6">
        <div className="flex flex-row items-center justify-between pb-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {label}
          </span>
          {icon}
        </div>
        <div>
          <div
            className={cn(
              "text-3xl font-semibold tabular-nums tracking-tight text-foreground",
              valueClassName,
            )}
          >
            {formatCount(value)}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">{sublabel}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function AutomationStatsRow({
  isLoading,
  summary,
}: {
  isLoading: boolean;
  summary?: MissionControlAutomationSummary;
}) {
  const reduceMotion = useReducedMotion();

  if (isLoading) {
    return (
      <div className="grid gap-4 text-left md:grid-cols-2 lg:grid-cols-5">
        {Array.from({ length: 5 }, (_, index) => (
          <LoadingStatCard key={`automation-stat-loading-${index}`} />
        ))}
      </div>
    );
  }

  if (!summary) {
    return null;
  }

  const stats = [
    {
      label: "Active Rules",
      value: summary.activeRules,
      sublabel: "Enabled persisted rules",
      icon: <Zap aria-hidden="true" className="size-4 text-muted-foreground" />,
    },
    {
      label: "Total Rules",
      value: summary.totalRules,
      sublabel: "Rules stored for this tenant",
      icon: (
        <ClipboardList
          aria-hidden="true"
          className="size-4 text-muted-foreground"
        />
      ),
    },
    {
      label: "Executions (24h)",
      value: summary.executions24h,
      sublabel: "Persisted activity log rows",
      icon: (
        <Play aria-hidden="true" className="size-4 text-muted-foreground" />
      ),
    },
    {
      label: "Invalid Rules",
      value: summary.invalidRules,
      sublabel: "Rows with contradictory lifecycle state",
      icon: (
        <AlertTriangle aria-hidden="true" className="size-4 text-destructive" />
      ),
      valueClassName: summary.invalidRules > 0 ? "text-destructive" : "",
    },
    {
      label: "Failed Runs (24h)",
      value: summary.failedRuns24h,
      sublabel: "Activity logs with failures",
      icon: (
        <AlertTriangle aria-hidden="true" className="size-4 text-destructive" />
      ),
      valueClassName: summary.failedRuns24h > 0 ? "text-destructive" : "",
    },
  ];

  return (
    <div className="grid gap-4 text-left md:grid-cols-2 lg:grid-cols-5">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          {...propsHeroEntrance(reduceMotion, index * STAGGER_TIGHT, 12)}
        >
          <StatCard {...stat} />
        </motion.div>
      ))}
    </div>
  );
}

function RulesLoadingState() {
  return (
    <div
      aria-busy="true"
      aria-label="Loading automation rules"
      className="space-y-4 p-6"
    >
      <p className="text-sm text-muted-foreground">
        Loading automation dashboard
      </p>
      {Array.from({ length: 3 }, (_, index) => (
        <div
          key={`automation-rule-loading-${index}`}
          className="flex items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3">
            <Skeleton className="size-9 rounded-lg" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-3 w-64" />
            </div>
          </div>
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
      ))}
    </div>
  );
}

function AutomationRulesEmptyState({
  description,
  icon,
  title,
}: {
  description: string;
  icon: ReactNode;
  title: string;
}) {
  return (
    <Empty className="border-0 py-14">
      <EmptyHeader>
        <EmptyMedia variant="icon">{icon}</EmptyMedia>
        <EmptyTitle>{title}</EmptyTitle>
        <EmptyDescription>{description}</EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}

function AutomationRuleRow({
  index,
  isLast,
  rule,
}: {
  index: number;
  isLast: boolean;
  rule: MissionControlAutomationRuleDto;
}) {
  const status = resolveMissionControlAutomationLifecycle(rule).displayStatus;

  return (
    <Fragment key={rule.id ?? `${rule.name}-${index}`}>
      <Item
        className="flex-nowrap rounded-none border-0"
        role="listitem"
        size="default"
      >
        <ItemMedia
          className="size-9 rounded-lg border border-border bg-muted text-muted-foreground"
          variant="icon"
        >
          <Zap aria-hidden="true" className="size-4" />
        </ItemMedia>
        <ItemContent className="min-w-0">
          <ItemTitle className="max-w-full truncate font-semibold">
            {rule.name}
          </ItemTitle>
          <ItemDescription className="truncate text-xs text-muted-foreground">
            Trigger: {formatTriggerKind(rule.trigger.kind)}
          </ItemDescription>
        </ItemContent>
        <ItemActions>
          <Badge
            className="shrink-0 text-xs"
            variant={status === "Active" ? "default" : "outline"}
          >
            {status}
          </Badge>
        </ItemActions>
      </Item>
      {isLast ? null : <ItemSeparator />}
    </Fragment>
  );
}

function RulesCardBody({
  allRuleCount,
  filteredRules,
  isBlocked,
  isLoading,
}: {
  allRuleCount: number;
  filteredRules: MissionControlAutomationRuleDto[];
  isBlocked: boolean;
  isLoading: boolean;
}) {
  if (isLoading) {
    return <RulesLoadingState />;
  }

  if (isBlocked) {
    return (
      <AutomationRulesEmptyState
        description="Automation rules cannot be displayed until the persisted dashboard response loads successfully."
        icon={<AlertTriangle className="size-5" />}
        title="Automation rules unavailable"
      />
    );
  }

  if (allRuleCount === 0) {
    return (
      <AutomationRulesEmptyState
        description="This tenant has no persisted Mission Control automation rules."
        icon={<Zap className="size-5" />}
        title="No automation rules yet"
      />
    );
  }

  if (filteredRules.length === 0) {
    return (
      <AutomationRulesEmptyState
        description="No persisted automation rules match the current filter."
        icon={<Search className="size-5" />}
        title="No matching automation rules"
      />
    );
  }

  return (
    <ItemGroup>
      {filteredRules.map((rule, index) => (
        <AutomationRuleRow
          key={rule.id ?? `${rule.name}-${index}`}
          index={index}
          isLast={index === filteredRules.length - 1}
          rule={rule}
        />
      ))}
    </ItemGroup>
  );
}

function AutomationRulesCard({
  allRuleCount,
  filteredRules,
  isBlocked,
  isLoading,
  onSearchChange,
  search,
}: {
  allRuleCount: number;
  filteredRules: MissionControlAutomationRuleDto[];
  isBlocked: boolean;
  isLoading: boolean;
  onSearchChange: (value: string) => void;
  search: string;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className="md:col-span-4"
      {...propsHeroEntrance(reduceMotion, STAGGER_TIGHT * 4, 12)}
    >
      <Card className="border-border bg-card shadow-sm">
        <CardHeader className="flex flex-col gap-4 border-b border-border sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-base font-semibold">
              Automation Rules
            </CardTitle>
            <CardDescription className="text-xs">
              Rules configured for Mission Control automations.
            </CardDescription>
          </div>
          <div className="relative w-full sm:w-56">
            <Label className="sr-only" htmlFor="automation-rule-filter">
              Filter automation rules
            </Label>
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute left-2.5 top-2.5 size-3.5 text-muted-foreground"
            />
            <Input
              className="h-8 bg-background pl-8 text-xs"
              disabled={isLoading || isBlocked || allRuleCount === 0}
              id="automation-rule-filter"
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Filter rules..."
              type="search"
              value={search}
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <RulesCardBody
            allRuleCount={allRuleCount}
            filteredRules={filteredRules}
            isBlocked={isBlocked}
            isLoading={isLoading}
          />
        </CardContent>
      </Card>
    </motion.div>
  );
}

function IntegrationTelemetryCard({
  isLoading,
  summary,
}: {
  isLoading: boolean;
  summary?: MissionControlAutomationSummary;
}) {
  const telemetryBacked = summary?.integrationHealthBacked === true;
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className="md:col-span-3"
      {...propsHeroEntrance(reduceMotion, STAGGER_TIGHT * 5, 12)}
    >
      <Card className="border-border bg-card shadow-sm">
        <CardHeader className="border-b border-border">
          <CardTitle className="text-base font-semibold">
            Connection Telemetry
          </CardTitle>
          <CardDescription className="text-xs">
            Provider health appears here only after it is backed by persisted
            telemetry.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          {isLoading ? (
            <div
              aria-busy="true"
              aria-label="Loading integration telemetry"
              className="space-y-4"
            >
              <Skeleton className="size-10 rounded-lg" />
              <Skeleton className="h-4 w-56" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-4/5" />
            </div>
          ) : (
            <div className="rounded-lg border border-border bg-background p-4">
              <div className="flex items-start gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                  <Link2 aria-hidden="true" className="size-5" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-sm font-semibold text-foreground">
                      {telemetryBacked
                        ? "Connection telemetry is backed by persisted data"
                        : "Connection telemetry is not wired yet"}
                    </h3>
                    <Badge variant="outline" className="text-xs">
                      {telemetryBacked ? "Backed" : "Not wired yet"}
                    </Badge>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    Live provider statuses will be shown only after a real
                    integration telemetry source is connected.
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

function AutomationBestPracticesCard() {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div {...propsHeroEntrance(reduceMotion, STAGGER_TIGHT * 6, 12)}>
      <Card className="border-border bg-card text-left">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Automation Guardrails
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <ul className="ml-2 list-inside list-disc space-y-1">
            <li>
              Use{" "}
              <code className="rounded bg-muted px-1.5 py-0.5 text-foreground">
                idempotency keys
              </code>{" "}
              on create actions to prevent duplicates.
            </li>
            <li>
              Keep rule names domain-prefixed, such as{" "}
              <code className="rounded bg-muted px-1.5 py-0.5 text-foreground">
                mobilize.
              </code>{" "}
              or{" "}
              <code className="rounded bg-muted px-1.5 py-0.5 text-foreground">
                giving.
              </code>
            </li>
            <li>
              Assign a clear owner for failure review before enabling a rule.
            </li>
            <li>
              Review persisted activity logs before treating an automation as
              production-ready.
            </li>
          </ul>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function AutomationsErrorAlert({ message }: { message: string }) {
  return (
    <Alert variant="destructive">
      <AlertTriangle className="size-4" />
      <AlertTitle>Could not load automations</AlertTitle>
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
}

export function AutomationsPageView({
  automationRules,
  errorMessage,
  hasLoadedData = true,
  isError,
  isLoading,
  summary,
}: {
  automationRules: MissionControlAutomationRuleDto[];
  errorMessage?: string;
  hasLoadedData?: boolean;
  isError: boolean;
  isLoading: boolean;
  summary?: MissionControlAutomationSummary;
}) {
  const [search, setSearch] = useState("");
  const queryError =
    errorMessage ?? "Could not load persisted automation data.";
  const missingSummary = !isLoading && !isError && hasLoadedData && !summary;

  const filteredRules = useMemo(
    () => filterAutomationRules(automationRules, search),
    [automationRules, search],
  );

  return (
    <PageShell
      title="Automations"
      description="Workflow automation and integration management."
      density="compact"
    >
      <div className="space-y-8">
        <AutomationStatsRow isLoading={isLoading} summary={summary} />

        {isError ? <AutomationsErrorAlert message={queryError} /> : null}

        {missingSummary ? (
          <AutomationsErrorAlert message="The automations response did not include a persisted dashboard summary." />
        ) : null}

        <div className="grid gap-6 text-left md:grid-cols-7">
          <AutomationRulesCard
            allRuleCount={automationRules.length}
            filteredRules={filteredRules}
            isBlocked={isError || Boolean(missingSummary)}
            isLoading={isLoading}
            onSearchChange={setSearch}
            search={search}
          />
          <IntegrationTelemetryCard isLoading={isLoading} summary={summary} />
        </div>

        <AutomationBestPracticesCard />
      </div>
    </PageShell>
  );
}

export default function AutomationsPage() {
  const automationsQuery = useMissionControlAutomations();
  const errorMessage =
    automationsQuery.error instanceof Error
      ? automationsQuery.error.message
      : automationsQuery.error
        ? String(automationsQuery.error)
        : undefined;

  return (
    <AutomationsPageView
      automationRules={automationsQuery.data?.automationRules ?? []}
      errorMessage={errorMessage}
      hasLoadedData={Boolean(automationsQuery.data)}
      isError={automationsQuery.isError}
      isLoading={automationsQuery.isPending}
      summary={automationsQuery.data?.summary}
    />
  );
}
