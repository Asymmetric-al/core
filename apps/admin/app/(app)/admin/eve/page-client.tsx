"use client";

import {
  EVE_KILL_SWITCH_KEYS,
  type EveGovernanceAdminView,
  type EveKillSwitchKey,
  type EveKillSwitchMutationResult,
} from "@asym/api/eve/governance/types";
import { useLocaleFormat } from "@asym/lib/hooks/use-locale-format";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@asym/ui/components/shadcn/alert-dialog";
import { Badge } from "@asym/ui/components/shadcn/badge";
import { Button } from "@asym/ui/components/shadcn/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@asym/ui/components/shadcn/card";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertTriangle,
  Bot,
  CircleX,
  FileSearch,
  History,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";
import { useState } from "react";

import { EveAdminMemoryPanel } from "./admin-memory-panel";
import { EveApprovalBudgetPanel } from "./approval-budget-panel";
import { EveEngineeringMonitorsPanel } from "./engineering-monitors-panel";
import { EveLaunchReadinessPanel } from "./launch-readiness-panel";
import { EveModelPolicyPanel } from "./model-policy-panel";
import { EveNotificationsPanel } from "./notifications-panel";
import { EVE_GOVERNANCE_QUERY_KEY } from "./query-keys";
import { EveRetentionPanel } from "./retention-panel";
import {
  EveUnavailableSections,
  formatStatusLabel,
  useEveSectionReady,
} from "./section-states";
import {
  EveCapabilityConnectionsPanel,
  EveOperationsWorkspace,
} from "./workspace-shell";

import type { EveAuditEventRecord } from "@asym/api/eve/audit/types";
import type { LocaleFormatters } from "@asym/lib/hooks/use-locale-format";

export interface EveGovernancePageData extends EveGovernanceAdminView {
  auditHistory: EveAuditEventRecord[];
}

interface EveGovernanceResponse extends EveGovernancePageData {
  requestId: string;
}

interface EveKillSwitchResponse extends EveGovernanceResponse {
  mutation: EveKillSwitchMutationResult;
}

interface KillSwitchConfirmationRequest {
  switchKey: EveKillSwitchKey;
  enabled: boolean;
  expectedStateVersion: number;
}

const KILL_SWITCH_COPY: Record<
  EveKillSwitchKey,
  { label: string; description: string }
> = {
  all_automation: {
    label: "All automation",
    description: "Master pause for every autonomous Eve domain.",
  },
  active_runs: {
    label: "Active runs",
    description: "Stops in-flight or continuing governed work.",
  },
  github_actions: {
    label: "GitHub actions",
    description: "Blocks reviews, comments, labels, pushes, and merges.",
  },
  production_writes: {
    label: "Production writes",
    description: "Blocks all governed production mutations.",
  },
  sandbox_networking: {
    label: "Sandbox networking",
    description: "Blocks network egress from engineering sandboxes.",
  },
  dynamic_workflows: {
    label: "Dynamic workflows",
    description: "Blocks generated or runtime-selected workflows.",
  },
  model_policy_changes: {
    label: "Model-policy changes",
    description: "Blocks activation or rollback of model policy.",
  },
  force_approval: {
    label: "Force approval",
    description: "Requires explicit human approval for every action.",
  },
};

async function loadEveGovernance(): Promise<EveGovernanceResponse> {
  const response = await fetch("/api/admin/eve/governance", {
    credentials: "same-origin",
    headers: { accept: "application/json" },
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as {
      error?: string;
    } | null;
    throw new Error(body?.error ?? "Could not load Eve governance state.");
  }

  return (await response.json()) as EveGovernanceResponse;
}

async function updateEveKillSwitch(input: {
  switchKey: EveKillSwitchKey;
  enabled: boolean;
  expectedStateVersion: number;
}): Promise<EveKillSwitchResponse> {
  const label = KILL_SWITCH_COPY[input.switchKey].label;
  const response = await fetch("/api/admin/eve/governance", {
    method: "PATCH",
    credentials: "same-origin",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      ...input,
      reason: `${input.enabled ? "Engage" : "Clear"} ${label} from Eve Governance.`,
    }),
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as {
      error?: string;
    } | null;
    throw new Error(body?.error ?? "Could not update the Eve kill switch.");
  }

  return (await response.json()) as EveKillSwitchResponse;
}

function formatPolicyStatus(status: string): string {
  const phrase = status.split("_").join(" ");
  return `${phrase.charAt(0).toUpperCase()}${phrase.slice(1)}`;
}

type BadgeTone = "destructive" | "secondary" | "success" | "warning";

function runTone(
  run: Pick<EveGovernancePageData["recentRuns"][number], "decision" | "status">,
): BadgeTone {
  if (run.status === "failed") return "destructive";
  if (run.decision === "blocked") return "warning";
  return run.status === "completed" ? "success" : "secondary";
}

function auditResultTone(result: string): BadgeTone {
  if (result === "failed") return "destructive";
  if (result === "blocked") return "warning";
  return result === "succeeded" ? "success" : "secondary";
}

const TIMESTAMP_FORMAT: Intl.DateTimeFormatOptions = {
  dateStyle: "medium",
  timeStyle: "short",
};

export function EveGovernanceStatusRow({
  system,
}: {
  system: EveGovernancePageData["system"];
}) {
  const attention = (value: string, warning: boolean) => (
    <>
      {value}
      {warning ? <Badge variant="warning">Needs attention</Badge> : null}
    </>
  );
  return (
    <MetricGrid label="Eve status">
      <MetricCard
        label="Release gate"
        value={attention(
          system.releaseEnabled ? "Enabled" : "Disabled",
          system.releaseEnabled,
        )}
        detail="Eve cannot act on its own while this is off."
      />
      <MetricCard
        label="Emergency state"
        value={attention(
          system.emergencyOff ? "Emergency engaged" : "Emergency clear",
          system.emergencyOff,
        )}
        detail="An engaged emergency switch keeps Eve stopped."
      />
      <MetricCard
        label="Policy status"
        value={attention(
          formatPolicyStatus(system.policyStatus),
          system.policyStatus !== "ready",
        )}
        detail={
          system.policySummary ??
          "A ready policy is required before Eve can act."
        }
      />
    </MetricGrid>
  );
}

function KillSwitchControl({
  disabled,
  enabled,
  isPending,
  onConfirm,
  stateVersion,
  switchKey,
}: {
  disabled: boolean;
  enabled: boolean;
  isPending: boolean;
  onConfirm: (request: KillSwitchConfirmationRequest) => void;
  stateVersion: number;
  switchKey: EveKillSwitchKey;
}) {
  const copy = KILL_SWITCH_COPY[switchKey];
  const [confirmationRequest, setConfirmationRequest] =
    useState<KillSwitchConfirmationRequest | null>(null);

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setConfirmationRequest(null);
      return;
    }

    setConfirmationRequest({
      switchKey,
      enabled: !enabled,
      expectedStateVersion: stateVersion,
    });
  };

  return (
    <li className="flex flex-wrap items-center justify-between gap-4 py-4">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-foreground">{copy.label}</p>
          <Badge variant={enabled ? "warning" : "success"}>
            {enabled ? "Engaged" : "Clear"}
          </Badge>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">{copy.description}</p>
      </div>
      <AlertDialog
        open={confirmationRequest !== null}
        onOpenChange={handleOpenChange}
      >
        <AlertDialogTrigger
          disabled={disabled}
          render={
            <Button size="sm" variant={enabled ? "destructive" : "outline"}>
              {isPending ? "Updating…" : enabled ? "Clear" : "Engage"}
            </Button>
          }
        />
        {confirmationRequest ? (
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {confirmationRequest.enabled ? "Engage" : "Clear"}{" "}
                {KILL_SWITCH_COPY[confirmationRequest.switchKey].label}?
              </AlertDialogTitle>
              <AlertDialogDescription>
                {confirmationRequest.enabled
                  ? `${KILL_SWITCH_COPY[confirmationRequest.switchKey].description} The change takes effect for the next policy check and is permanently audited.`
                  : "Clearing this switch removes only this restriction. It does not enable Eve, bypass policy, or grant authority."}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                variant={
                  confirmationRequest.enabled ? "default" : "destructive"
                }
                onClick={() => onConfirm(confirmationRequest)}
              >
                Confirm {confirmationRequest.enabled ? "engage" : "clear"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        ) : null}
      </AlertDialog>
    </li>
  );
}

const GOVERNANCE_SECTIONS = [
  {
    id: "eve-emergency-controls",
    title: "Kill-switch controls",
    description:
      "Each change is saved under your name in the audit history. Clearing a switch never switches Eve on.",
  },
  {
    id: "eve-active-runs",
    title: "Recent governed runs",
    description:
      "What Eve tried to do recently and whether its safety rules allowed it. Eve’s private reasoning is never shown.",
  },
  {
    id: "eve-failures",
    title: "Governed failures",
    description:
      "Runs and recorded actions that failed, newest first. Only short summaries are shown, never full records or Eve’s private reasoning.",
  },
  {
    id: "eve-audit",
    title: "Audit history",
    description:
      "Every action Eve or an admin took, and why it was allowed or blocked. Sensitive details are removed before saving, and prompts and Eve’s private reasoning are never stored.",
  },
] as const;

const IDENTITY_MODE_LABELS = {
  admin: "Administrator",
  service: "Service account",
  github_bot: "GitHub bot",
} as const;

function EveGovernanceLoadError({
  errorMessage,
  onRetry,
}: {
  errorMessage?: string;
  onRetry?: () => void;
}) {
  return (
    <Alert variant="destructive">
      <AlertTriangle aria-hidden="true" className="size-4" />
      <AlertTitle>Could not load Eve governance state</AlertTitle>
      <AlertDescription>
        {errorMessage ?? "Eve's safety settings could not be reached."} Eve
        stays switched off until they load.
        <Button variant="outline" size="sm" onClick={onRetry}>
          Try again
        </Button>
      </AlertDescription>
    </Alert>
  );
}

function EveGovernanceStatusAlert({
  system,
}: {
  system: EveGovernancePageData["system"];
}) {
  const title =
    system.source === "missing"
      ? "Governance state is missing"
      : system.releaseEnabled && !system.emergencyOff
        ? "Release gate is enabled"
        : "Eve is safely gated";
  const description =
    system.source === "missing"
      ? "Eve's safety settings are missing, so Eve stays switched off until they are restored."
      : system.releaseEnabled
        ? "Eve can act only while the policy is ready and every kill switch is clear."
        : "Eve cannot perform autonomous actions while the release gate is disabled.";

  return (
    <Alert>
      <ShieldCheck aria-hidden="true" className="size-4" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>{description}</AlertDescription>
    </Alert>
  );
}

type GovernedFailure = {
  id: string;
  label: string;
  summary: string;
  timestamp: string;
};

function collectGovernedFailures(
  data: EveGovernancePageData,
): GovernedFailure[] {
  return [
    ...data.recentRuns.flatMap((run) =>
      run.status === "failed"
        ? [
            {
              id: `run:${run.id}`,
              label: run.action,
              summary: `${formatStatusLabel(run.reason)}. Target: ${run.target ?? "No external target"}.`,
              timestamp: run.updatedAt,
            },
          ]
        : [],
    ),
    ...data.auditHistory.flatMap((event) =>
      event.result === "failed"
        ? [
            {
              id: `audit:${event.id}`,
              label: event.action,
              summary: event.decisionSummary,
              timestamp: event.createdAt,
            },
          ]
        : [],
    ),
  ]
    .sort((first, second) => {
      return Date.parse(second.timestamp) - Date.parse(first.timestamp);
    })
    .slice(0, 10);
}

function EveRecentRunsCard({
  recentRuns,
}: {
  recentRuns: EveGovernancePageData["recentRuns"];
}) {
  return (
    <Card id="eve-active-runs">
      <CardHeader>
        <CardTitle role="heading" aria-level={2}>
          <span className="flex items-center gap-2">
            <Bot aria-hidden="true" className="size-5" />
            Recent governed runs
          </span>
        </CardTitle>
        <CardDescription>
          What Eve tried to do recently and whether its safety rules allowed it.
          Eve&apos;s private reasoning is never shown.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {recentRuns.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No governed Eve runs have been recorded.
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {recentRuns.map((run) => (
              <li
                key={run.id}
                className="flex flex-wrap items-center justify-between gap-3 py-3"
              >
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {run.action}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {run.target ?? "No external target"}
                  </p>
                </div>
                <Badge variant={runTone(run)}>
                  {formatPolicyStatus(run.status)}:{" "}
                  {formatPolicyStatus(run.reason).toLowerCase()}
                </Badge>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

function EveGovernedFailuresCard({
  failures,
  formatDateTime,
}: {
  failures: GovernedFailure[];
  formatDateTime: LocaleFormatters["formatDateTime"];
}) {
  return (
    <Card id="eve-failures">
      <CardHeader>
        <CardTitle aria-level={2} role="heading">
          <span className="flex items-center gap-2">
            <CircleX aria-hidden="true" className="size-5" />
            Governed failures
          </span>
        </CardTitle>
        <CardDescription>
          Runs and recorded actions that failed, newest first. Only short
          summaries are shown, never full records or Eve&apos;s private
          reasoning.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {failures.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No governed failures have been recorded.
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {failures.map((failure) => (
              <li
                key={failure.id}
                className="flex flex-wrap items-start justify-between gap-3 py-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground">
                    {failure.label}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {failure.summary}
                  </p>
                </div>
                <div className="text-right">
                  <Badge variant="destructive">Failed</Badge>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {formatDateTime(failure.timestamp, TIMESTAMP_FORMAT)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

function EveAuditHistoryCard({
  auditHistory,
  formatDateTime,
}: {
  auditHistory: EveGovernancePageData["auditHistory"];
  formatDateTime: LocaleFormatters["formatDateTime"];
}) {
  return (
    <Card id="eve-audit">
      <CardHeader>
        <CardTitle role="heading" aria-level={2}>
          <span className="flex items-center gap-2">
            <History aria-hidden="true" className="size-5" />
            Audit history
          </span>
        </CardTitle>
        <CardDescription>
          Every action Eve or an admin took, and why it was allowed or blocked.
          Sensitive details are removed before saving, and prompts and
          Eve&apos;s private reasoning are never stored.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {auditHistory.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No Eve audit events have been recorded.
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {auditHistory.map((event) => (
              <li key={event.id} className="py-4">
                <details className="group">
                  <summary className="flex cursor-pointer list-none flex-wrap items-start justify-between gap-3 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring">
                    <div className="min-w-0">
                      <p className="flex items-center gap-2 text-sm font-medium text-foreground">
                        <FileSearch
                          aria-hidden="true"
                          className="size-4 shrink-0"
                        />
                        {event.action}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {event.actorId} ·{" "}
                        {IDENTITY_MODE_LABELS[event.identityMode] ??
                          formatStatusLabel(event.identityMode)}{" "}
                        · {formatDateTime(event.createdAt, TIMESTAMP_FORMAT)}
                      </p>
                    </div>
                    <Badge variant={auditResultTone(event.result)}>
                      {formatPolicyStatus(event.result)}
                    </Badge>
                  </summary>
                  <div className="mt-4 grid gap-4 rounded-lg border border-border bg-muted/25 p-4 text-sm md:grid-cols-2">
                    <div className="space-y-1 md:col-span-2">
                      <p className="font-medium text-foreground">
                        Decision summary
                      </p>
                      <p className="text-muted-foreground">
                        {event.decisionSummary}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="font-medium text-foreground">Evidence</p>
                      <p className="break-words text-muted-foreground">
                        {event.evidenceSummary}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="font-medium text-foreground">Change</p>
                      <p className="break-words text-muted-foreground">
                        {event.changeSummary}
                      </p>
                    </div>
                    <dl className="grid gap-y-1 text-xs md:col-span-2">
                      <div className="flex gap-3">
                        <dt className="w-28 shrink-0 text-muted-foreground">
                          Target
                        </dt>
                        <dd className="min-w-0 wrap-anywhere">
                          {event.target ?? "No external target"}
                        </dd>
                      </div>
                      <div className="flex gap-3">
                        <dt className="w-28 shrink-0 text-muted-foreground">
                          Initiator
                        </dt>
                        <dd className="min-w-0">
                          {formatStatusLabel(event.initiatorType)}:{" "}
                          {event.initiatorId}
                        </dd>
                      </div>
                      <div className="flex gap-3">
                        <dt className="w-28 shrink-0 text-muted-foreground">
                          Policy
                        </dt>
                        <dd className="min-w-0">
                          {event.policyId} (
                          {formatStatusLabel(event.policyStatus)})
                        </dd>
                      </div>
                      <div className="flex gap-3">
                        <dt className="w-28 shrink-0 text-muted-foreground">
                          Model role
                        </dt>
                        <dd className="min-w-0">
                          {formatStatusLabel(event.modelRole)}
                        </dd>
                      </div>
                      <div className="flex gap-3">
                        <dt className="w-28 shrink-0 text-muted-foreground">
                          Redaction version
                        </dt>
                        <dd className="min-w-0">{event.redactionVersion}</dd>
                      </div>
                    </dl>
                    <div className="space-y-1 md:col-span-2">
                      <p className="font-medium text-foreground">
                        Technical details (sensitive values removed)
                      </p>
                      <pre className="overflow-x-auto rounded-md bg-background p-3 text-xs text-muted-foreground">
                        {JSON.stringify(event.debugMetadata, null, 2)}
                      </pre>
                    </div>
                  </div>
                </details>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

export function EveGovernanceView({
  data,
  errorMessage,
  isError,
  isLoading,
  mutationError,
  mutationPendingKey,
  onConfirmKillSwitch,
  onSetKillSwitch,
  onRetry,
  showStatusRow = true,
}: {
  showStatusRow?: boolean;
  data?: EveGovernancePageData;
  errorMessage?: string;
  isError: boolean;
  isLoading: boolean;
  mutationError?: string;
  mutationPendingKey?: EveKillSwitchKey;
  onConfirmKillSwitch?: (request: KillSwitchConfirmationRequest) => void;
  onSetKillSwitch?: (switchKey: EveKillSwitchKey, enabled: boolean) => void;
  onRetry?: () => void;
}) {
  const { formatDateTime } = useLocaleFormat();
  useEveSectionReady(
    !isLoading && !isError && Boolean(data),
    GOVERNANCE_SECTIONS,
  );
  if (isLoading) {
    return (
      <EveUnavailableSections
        sections={GOVERNANCE_SECTIONS}
        isLoading
        loadingLabel="Loading Eve governance state"
      />
    );
  }

  if (isError || !data) {
    return (
      <div className="space-y-6">
        <EveGovernanceLoadError errorMessage={errorMessage} onRetry={onRetry} />
        <EveUnavailableSections
          sections={GOVERNANCE_SECTIONS}
          isLoading={false}
          loadingLabel="Loading Eve governance state"
        />
      </div>
    );
  }

  const { system } = data;
  const failures = collectGovernedFailures(data);
  const confirmKillSwitch = (request: KillSwitchConfirmationRequest) => {
    if (onConfirmKillSwitch) {
      onConfirmKillSwitch(request);
      return;
    }

    onSetKillSwitch?.(request.switchKey, request.enabled);
  };

  return (
    <div className="space-y-6">
      {mutationPendingKey ? (
        <p role="status" className="text-sm text-muted-foreground">
          Updating {KILL_SWITCH_COPY[mutationPendingKey].label}…
        </p>
      ) : null}
      <EveGovernanceStatusAlert system={system} />

      {showStatusRow ? <EveGovernanceStatusRow system={system} /> : null}

      {mutationError ? (
        <Alert variant="destructive">
          <AlertTriangle aria-hidden="true" className="size-4" />
          <AlertTitle>Kill-switch update failed</AlertTitle>
          <AlertDescription>{mutationError}</AlertDescription>
        </Alert>
      ) : null}

      <Card id="eve-emergency-controls">
        <CardHeader>
          <CardTitle role="heading" aria-level={2}>
            <span className="flex items-center gap-2">
              <ShieldAlert aria-hidden="true" className="size-5" />
              Kill-switch controls
            </span>
          </CardTitle>
          <CardDescription>
            Each change is saved under your name in the audit history. Clearing
            a switch never switches Eve on.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="divide-y divide-border">
            {EVE_KILL_SWITCH_KEYS.map((switchKey) => (
              <KillSwitchControl
                key={switchKey}
                switchKey={switchKey}
                disabled={mutationPendingKey !== undefined}
                enabled={system.killSwitchState[switchKey]}
                isPending={mutationPendingKey === switchKey}
                onConfirm={confirmKillSwitch}
                stateVersion={system.stateVersion}
              />
            ))}
          </ul>
        </CardContent>
      </Card>

      <EveRecentRunsCard recentRuns={data.recentRuns} />
      <EveGovernedFailuresCard
        failures={failures}
        formatDateTime={formatDateTime}
      />
      <EveAuditHistoryCard
        auditHistory={data.auditHistory}
        formatDateTime={formatDateTime}
      />
    </div>
  );
}

export default function EveGovernancePage() {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: EVE_GOVERNANCE_QUERY_KEY,
    queryFn: loadEveGovernance,
    staleTime: 15_000,
    gcTime: 5 * 60_000,
    refetchInterval: 15_000,
    refetchOnWindowFocus: false,
    retry: false,
  });
  const mutation = useMutation({
    mutationFn: updateEveKillSwitch,
    onSuccess(data) {
      queryClient.setQueryData(EVE_GOVERNANCE_QUERY_KEY, data);
    },
  });

  const setKillSwitch = (request: KillSwitchConfirmationRequest) => {
    mutation.mutate(request);
  };

  return (
    <PageShell
      title="Eve operations"
      description="Governance state, approvals, policy and emergency controls for the Eve assistant."
      density="compact"
      actions={
        <p className="text-xs text-muted-foreground">
          {query.dataUpdatedAt
            ? `Updated ${new Date(query.dataUpdatedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
            : "Awaiting governance state"}
        </p>
      }
    >
      <EveOperationsWorkspace
        statusRow={
          query.isError ? (
            <EveGovernanceLoadError
              errorMessage={query.error?.message}
              onRetry={() => void query.refetch()}
            />
          ) : query.data ? (
            <EveGovernanceStatusRow system={query.data.system} />
          ) : (
            <p role="status">Loading Eve status…</p>
          )
        }
        panels={{
          overview: (
            <>
              <EveLaunchReadinessPanel />
              <EveGovernanceView
                showStatusRow={false}
                data={query.data}
                errorMessage={query.error?.message}
                isError={query.isError}
                isLoading={query.isLoading}
                mutationError={mutation.error?.message}
                mutationPendingKey={
                  mutation.isPending ? mutation.variables?.switchKey : undefined
                }
                onConfirmKillSwitch={setKillSwitch}
                onRetry={() => void query.refetch()}
              />
            </>
          ),
          approvals: <EveApprovalBudgetPanel />,
          policy: (
            <>
              <EveModelPolicyPanel />
              <EveAdminMemoryPanel />
              <EveRetentionPanel />
            </>
          ),
          connections: (
            <>
              <EveNotificationsPanel />
              <EveEngineeringMonitorsPanel />
              <EveCapabilityConnectionsPanel />
            </>
          ),
        }}
      />
    </PageShell>
  );
}
