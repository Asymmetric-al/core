"use client";

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
import { Skeleton } from "@asym/ui/components/shadcn/skeleton";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, Bot, Power, ShieldCheck } from "lucide-react";

import type { EveGovernanceAdminView } from "@asym/api/eve/governance/types";

interface EveGovernanceResponse extends EveGovernanceAdminView {
  requestId: string;
}

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

function formatPolicyStatus(status: string): string {
  const phrase = status.split("_").join(" ");
  return `${phrase.charAt(0).toUpperCase()}${phrase.slice(1)}`;
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

export function EveGovernanceView({
  data,
  errorMessage,
  isError,
  isLoading,
}: {
  data?: EveGovernanceAdminView;
  errorMessage?: string;
  isError: boolean;
  isLoading: boolean;
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

      <Card>
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
    </div>
  );
}

export default function EveGovernancePage() {
  const query = useQuery({
    queryKey: ["admin", "eve", "governance"],
    queryFn: loadEveGovernance,
    staleTime: 15_000,
    gcTime: 5 * 60_000,
    refetchOnWindowFocus: false,
    retry: false,
  });

  return (
    <PageShell
      title="Eve Governance"
      description="Observe the release gate, emergency state, and policy readiness before autonomy is activated."
      density="compact"
      actions={
        <Badge variant="outline" className="gap-1.5">
          <Power aria-hidden="true" className="size-3.5" />
          Read-only in this slice
        </Badge>
      }
    >
      <EveGovernanceView
        data={query.data}
        errorMessage={query.error?.message}
        isError={query.isError}
        isLoading={query.isLoading}
      />
    </PageShell>
  );
}
