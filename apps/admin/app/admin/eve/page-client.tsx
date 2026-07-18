"use client";

import {
  EVE_KILL_SWITCH_KEYS,
  type EveGovernanceAdminView,
  type EveKillSwitchKey,
  type EveKillSwitchMutationResult,
} from "@asym/api/eve/governance/types";
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
import { Skeleton } from "@asym/ui/components/shadcn/skeleton";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertTriangle,
  Bot,
  CircleX,
  FileSearch,
  History,
  Power,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";

import { EveAdminMemoryPanel } from "./admin-memory-panel";
import { EveApprovalBudgetPanel } from "./approval-budget-panel";
import { EveModelPolicyPanel } from "./model-policy-panel";
import { EveRetentionPanel } from "./retention-panel";
import {
  EveCapabilityConnectionsPanel,
  EveWorkspaceIndex,
} from "./workspace-shell";

import type { EveAuditEventRecord } from "@asym/api/eve/audit/types";

export interface EveGovernancePageData extends EveGovernanceAdminView {
  auditHistory: EveAuditEventRecord[];
}

interface EveGovernanceResponse extends EveGovernancePageData {
  requestId: string;
}

interface EveKillSwitchResponse extends EveGovernanceResponse {
  mutation: EveKillSwitchMutationResult;
}

const EVE_GOVERNANCE_QUERY_KEY = ["admin", "eve", "governance"] as const;

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

function formatTimestamp(timestamp: string): string {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(timestamp));
}

function StatusCard({
  description,
  label,
  value,
  warning = false,
}: {
  description: string;
  label: string;
  value: string;
  warning?: boolean;
}) {
  return (
    <Card className="border-border bg-card shadow-sm">
      <CardHeader className="pb-3">
        <CardDescription>{label}</CardDescription>
        <CardTitle className="flex items-center justify-between gap-3 text-xl">
          {value}
          <Badge variant={warning ? "destructive" : "secondary"}>
            {warning ? "Attention" : "Observed"}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}

function KillSwitchControl({
  disabled,
  enabled,
  isPending,
  onSet,
  switchKey,
}: {
  disabled: boolean;
  enabled: boolean;
  isPending: boolean;
  onSet: (switchKey: EveKillSwitchKey, enabled: boolean) => void;
  switchKey: EveKillSwitchKey;
}) {
  const copy = KILL_SWITCH_COPY[switchKey];
  const nextEnabled = !enabled;

  return (
    <li className="flex flex-wrap items-center justify-between gap-4 py-4">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-foreground">{copy.label}</p>
          <Badge variant={enabled ? "destructive" : "outline"}>
            {enabled ? "Engaged" : "Clear"}
          </Badge>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">{copy.description}</p>
      </div>
      <AlertDialog>
        <AlertDialogTrigger
          disabled={disabled}
          render={
            <Button size="sm" variant={enabled ? "destructive" : "outline"}>
              {isPending ? "Updating…" : enabled ? "Clear" : "Engage"}
            </Button>
          }
        />
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {nextEnabled ? "Engage" : "Clear"} {copy.label}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              {nextEnabled
                ? `${copy.description} The change takes effect for the next policy check and is permanently audited.`
                : "Clearing this switch removes only this restriction. It does not enable Eve, bypass policy, or grant authority."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant={nextEnabled ? "default" : "destructive"}
              onClick={() => onSet(switchKey, nextEnabled)}
            >
              Confirm {nextEnabled ? "engage" : "clear"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </li>
  );
}

export function EveGovernanceView({
  data,
  errorMessage,
  isError,
  isLoading,
  mutationError,
  mutationPendingKey,
  onSetKillSwitch,
}: {
  data?: EveGovernancePageData;
  errorMessage?: string;
  isError: boolean;
  isLoading: boolean;
  mutationError?: string;
  mutationPendingKey?: EveKillSwitchKey;
  onSetKillSwitch?: (switchKey: EveKillSwitchKey, enabled: boolean) => void;
}) {
  if (isLoading) {
    return (
      <div
        aria-label="Loading Eve governance state"
        className="grid gap-4 md:grid-cols-3"
      >
        {Array.from({ length: 3 }, (_, index) => (
          <Card key={`eve-governance-loading-${index}`}>
            <CardContent className="space-y-3 p-6">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-36" />
              <Skeleton className="h-4 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (isError || !data) {
    return (
      <Alert variant="destructive">
        <AlertTriangle aria-hidden="true" className="size-4" />
        <AlertTitle>Could not load Eve governance state</AlertTitle>
        <AlertDescription>
          {errorMessage ?? "The governance store is unavailable."} Eve remains
          fail-closed.
        </AlertDescription>
      </Alert>
    );
  }

  const { system } = data;
  const releaseLabel = system.releaseEnabled ? "Enabled" : "Disabled";
  const emergencyLabel = system.emergencyOff
    ? "Emergency engaged"
    : "Emergency clear";
  const policyLabel = formatPolicyStatus(system.policyStatus);
  const failures = [
    ...data.recentRuns
      .filter((run) => run.status === "failed")
      .map((run) => ({
        id: `run:${run.id}`,
        label: run.action,
        summary: `${run.reason}. Target: ${run.target ?? "No external target"}.`,
        timestamp: run.updatedAt,
      })),
    ...data.auditHistory
      .filter((event) => event.result === "failed")
      .map((event) => ({
        id: `audit:${event.id}`,
        label: event.action,
        summary: event.decisionSummary,
        timestamp: event.createdAt,
      })),
  ].slice(0, 10);

  return (
    <div className="space-y-6">
      <Alert>
        <ShieldCheck aria-hidden="true" className="size-4" />
        <AlertTitle>
          {system.source === "missing"
            ? "Governance state is missing"
            : system.releaseEnabled && !system.emergencyOff
              ? "Release gate is enabled"
              : "Eve is safely gated"}
        </AlertTitle>
        <AlertDescription>
          {system.source === "missing"
            ? "The kernel is fail-closed. Eve cannot run until app-owned governance state is restored."
            : system.releaseEnabled
              ? "Every action still requires ready policy and clear kill-switch state."
              : "Eve cannot perform autonomous actions while the release gate is disabled."}
        </AlertDescription>
      </Alert>

      <div className="grid gap-4 md:grid-cols-3">
        <StatusCard
          label="Release gate"
          value={releaseLabel}
          description="The app-owned master gate for every autonomous effect."
          warning={system.releaseEnabled}
        />
        <StatusCard
          label="Emergency state"
          value={emergencyLabel}
          description="Emergency-off takes precedence over an enabled release gate."
          warning={system.emergencyOff}
        />
        <StatusCard
          label="Policy status"
          value={policyLabel}
          description={
            system.policySummary ??
            "Policy must report ready before an autonomous effect can proceed."
          }
          warning={system.policyStatus !== "ready"}
        />
      </div>

      {mutationError ? (
        <Alert variant="destructive">
          <AlertTriangle aria-hidden="true" className="size-4" />
          <AlertTitle>Kill-switch update failed</AlertTitle>
          <AlertDescription>{mutationError}</AlertDescription>
        </Alert>
      ) : null}

      <Card id="eve-emergency-controls">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldAlert aria-hidden="true" className="size-5" />
            Kill-switch controls
          </CardTitle>
          <CardDescription>
            Every change is atomic, attributed to your verified admin identity,
            and recorded in audit history. Clearing a switch never enables Eve.
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
                onSet={onSetKillSwitch ?? (() => undefined)}
              />
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card id="eve-active-runs">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot aria-hidden="true" className="size-5" />
            Recent governed runs
          </CardTitle>
          <CardDescription>
            Decision summaries from the governance kernel. No hidden model
            reasoning is shown.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {data.recentRuns.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No governed Eve runs have been recorded.
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {data.recentRuns.map((run) => (
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
                  <Badge
                    variant={
                      run.decision === "blocked" ? "outline" : "secondary"
                    }
                  >
                    {run.status}: {run.reason}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card id="eve-failures">
        <CardHeader>
          <CardTitle
            aria-level={2}
            role="heading"
            className="flex items-center gap-2"
          >
            <CircleX aria-hidden="true" className="size-5" />
            Governed failures
          </CardTitle>
          <CardDescription>
            Failed run and audit summaries from app-owned governance state. No
            raw record payloads or hidden reasoning are rendered.
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
                      {formatTimestamp(failure.timestamp)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card id="eve-audit">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History aria-hidden="true" className="size-5" />
            Audit history
          </CardTitle>
          <CardDescription>
            App-owned action records with decision summaries and redacted replay
            metadata. Raw prompts and hidden model reasoning are never stored
            here.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {data.auditHistory.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No Eve audit events have been recorded.
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {data.auditHistory.map((event) => (
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
                          {event.actorId} · {event.identityMode} ·{" "}
                          {formatTimestamp(event.createdAt)}
                        </p>
                      </div>
                      <Badge
                        variant={
                          event.result === "failed" ||
                          event.result === "blocked"
                            ? "destructive"
                            : "secondary"
                        }
                      >
                        {event.result}
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
                      <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-xs md:col-span-2">
                        <dt className="text-muted-foreground">Target</dt>
                        <dd>{event.target ?? "No external target"}</dd>
                        <dt className="text-muted-foreground">Initiator</dt>
                        <dd>
                          {event.initiatorType}: {event.initiatorId}
                        </dd>
                        <dt className="text-muted-foreground">Policy</dt>
                        <dd>
                          {event.policyId} ({event.policyStatus})
                        </dd>
                        <dt className="text-muted-foreground">Model role</dt>
                        <dd>{event.modelRole}</dd>
                        <dt className="text-muted-foreground">
                          Redaction contract
                        </dt>
                        <dd>{event.redactionVersion}</dd>
                      </dl>
                      <div className="space-y-1 md:col-span-2">
                        <p className="font-medium text-foreground">
                          Redacted debug metadata
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

  const setKillSwitch = (switchKey: EveKillSwitchKey, enabled: boolean) => {
    const expectedStateVersion = query.data?.system.stateVersion;
    if (!expectedStateVersion) {
      return;
    }

    mutation.mutate({ switchKey, enabled, expectedStateVersion });
  };

  return (
    <PageShell
      title="Eve Operations"
      description="Inspect real governance state, approvals, failures, policy, memory, and emergency controls before using chat."
      density="compact"
      actions={
        <Badge variant="outline" className="gap-1.5">
          <Power aria-hidden="true" className="size-3.5" />
          Controls audited
        </Badge>
      }
    >
      <EveWorkspaceIndex />
      <EveGovernanceView
        data={query.data}
        errorMessage={query.error?.message}
        isError={query.isError}
        isLoading={query.isLoading}
        mutationError={mutation.error?.message}
        mutationPendingKey={
          mutation.isPending ? mutation.variables?.switchKey : undefined
        }
        onSetKillSwitch={setKillSwitch}
      />
      <EveApprovalBudgetPanel />
      <EveModelPolicyPanel />
      <EveAdminMemoryPanel />
      <EveRetentionPanel />
      <EveCapabilityConnectionsPanel />
    </PageShell>
  );
}
