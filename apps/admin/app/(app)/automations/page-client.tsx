"use client";

import {
  useMissionControlAutomations,
  type MissionControlAutomationRuleDto,
  type MissionControlAutomationSummary,
} from "@asym/database/hooks";
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
import { Button, ButtonLink } from "@asym/ui/components/shadcn/button";
import { Skeleton } from "@asym/ui/components/shadcn/skeleton";
import { Activity, AlertTriangle, RotateCw } from "lucide-react";
import Link from "next/link";
import { useId, useMemo, useRef, useState } from "react";

import {
  automationFailureAttribution,
  failingAutomationRules,
  filterAutomationRules,
} from "./automation-rules";
import { AutomationRulesGrid } from "./rules-grid";

const numberFormatter = new Intl.NumberFormat("en-US");

const ACTIVITY_LOG_WINDOW = "Last 24 hours, from the automation activity log";

function formatCount(value: number): string {
  return numberFormatter.format(value);
}

function FailedRunsDetail({
  automationRules,
  failingOnly,
  onToggleFailingOnly,
  summary,
}: {
  automationRules: MissionControlAutomationRuleDto[];
  failingOnly: boolean;
  onToggleFailingOnly: () => void;
  summary: MissionControlAutomationSummary;
}) {
  if (summary.failedRuns24h === 0) return ACTIVITY_LOG_WINDOW;
  const { failingRules, note } = automationFailureAttribution(
    automationRules,
    summary,
  );
  const text = note ? `Last 24 hours. ${note}` : "Last 24 hours.";
  if (failingRules.length === 0) return text;
  const showLabel =
    failingRules.length === 1
      ? "Show the failing rule"
      : `Show the ${formatCount(failingRules.length)} failing rules`;
  return (
    <>
      {text}{" "}
      <Button variant="link" size="xs" onClick={onToggleFailingOnly}>
        {failingOnly ? "Show all rules" : showLabel}
      </Button>
    </>
  );
}

function AutomationStatsRow({
  automationRules,
  failingOnly,
  isLoading,
  onToggleFailingOnly,
  summary,
}: {
  automationRules: MissionControlAutomationRuleDto[];
  failingOnly: boolean;
  isLoading: boolean;
  onToggleFailingOnly: () => void;
  summary?: MissionControlAutomationSummary;
}) {
  if (isLoading) {
    return (
      <MetricGrid label="Loading automation summary" busy>
        {[0, 1, 2, 3].map((index) => (
          <Skeleton key={index} className="h-24 rounded-xl" />
        ))}
      </MetricGrid>
    );
  }
  if (!summary) return null;

  return (
    <MetricGrid label="Automation summary">
      <MetricCard
        label="Active rules"
        value={formatCount(summary.activeRules)}
        detail={`Of ${formatCount(summary.totalRules)} rules`}
      />
      <MetricCard
        label="Rule runs"
        value={formatCount(summary.executions24h)}
        detail={ACTIVITY_LOG_WINDOW}
      />
      <MetricCard
        label="Failed rule runs"
        value={formatCount(summary.failedRuns24h)}
        tone={summary.failedRuns24h > 0 ? "critical" : "default"}
        detail={
          <FailedRunsDetail
            automationRules={automationRules}
            failingOnly={failingOnly}
            onToggleFailingOnly={onToggleFailingOnly}
            summary={summary}
          />
        }
      />
      <MetricCard
        label="Rules needing repair"
        value={formatCount(summary.invalidRules)}
        tone={summary.invalidRules > 0 ? "attention" : "default"}
        detail={
          summary.invalidRules > 0
            ? "Marked active but switched off; each is explained below"
            : "None"
        }
      />
    </MetricGrid>
  );
}

function AutomationsErrorAlert({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <Alert variant="destructive">
      <AlertTriangle className="size-4" />
      <AlertTitle>Could not load automations</AlertTitle>
      <AlertDescription>
        <p>{message}</p>
        {onRetry ? (
          <Button variant="outline" size="sm" onClick={onRetry}>
            <RotateCw aria-hidden="true" />
            Retry
          </Button>
        ) : null}
      </AlertDescription>
    </Alert>
  );
}

export function AutomationsPageView({
  automationRules,
  errorMessage,
  hasLoadedData = true,
  isError,
  isLoading,
  onRetry,
  summary,
}: {
  automationRules: MissionControlAutomationRuleDto[];
  errorMessage?: string;
  hasLoadedData?: boolean;
  isError: boolean;
  onRetry?: () => void;
  isLoading: boolean;
  summary?: MissionControlAutomationSummary;
}) {
  const [search, setSearch] = useState("");
  const [failingOnly, setFailingOnly] = useState(false);
  const rulesHeadingId = useId();
  const rulesHeadingRef = useRef<HTMLHeadingElement>(null);
  const queryError = errorMessage ?? "Couldn't load automations.";
  const missingSummary = !isLoading && !isError && hasLoadedData && !summary;

  const filteredRules = useMemo(() => {
    const matching = filterAutomationRules(automationRules, search);
    return failingOnly ? failingAutomationRules(matching) : matching;
  }, [automationRules, failingOnly, search]);

  const toggleFailingOnly = () => {
    const next = !failingOnly;
    setFailingOnly(next);
    if (next) {
      rulesHeadingRef.current?.focus({ preventScroll: true });
      rulesHeadingRef.current?.scrollIntoView?.({ block: "start" });
    }
  };

  return (
    <PageShell
      title="Automations"
      description="See the rules that run automatically and how they performed."
      density="compact"
      actions={
        <ButtonLink
          variant="outline"
          size="sm"
          render={<Link href="/workflows" />}
        >
          <Activity aria-hidden="true" />
          Workflow runs
        </ButtonLink>
      }
    >
      <div className="flex flex-col gap-6">
        <AutomationStatsRow
          automationRules={automationRules}
          failingOnly={failingOnly}
          isLoading={isLoading}
          onToggleFailingOnly={toggleFailingOnly}
          summary={summary}
        />
        <p role="note" className="text-sm text-muted-foreground">
          Rules are managed by the platform and can’t be edited here. Run and
          failure counts cover up to 1,000 most recent logged runs in the last
          24 hours. Busy periods may be incomplete.
        </p>

        {isError ? (
          <AutomationsErrorAlert message={queryError} onRetry={onRetry} />
        ) : null}

        {missingSummary ? (
          <AutomationsErrorAlert message="The automations list came back without its summary, so it isn't shown." />
        ) : null}

        <AutomationRulesGrid
          allRuleCount={automationRules.length}
          failingOnly={failingOnly}
          filteredRules={filteredRules}
          headingId={rulesHeadingId}
          headingRef={rulesHeadingRef}
          isBlocked={isError || Boolean(missingSummary)}
          isLoading={isLoading}
          onSearchChange={setSearch}
          onShowAllRules={() => setFailingOnly(false)}
          search={search}
        />
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
      onRetry={() => void automationsQuery.refetch()}
      summary={automationsQuery.data?.summary}
    />
  );
}
