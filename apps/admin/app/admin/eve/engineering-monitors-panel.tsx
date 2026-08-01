"use client";

import { Alert, AlertDescription } from "@asym/ui/components/shadcn/alert";
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
import { Activity } from "lucide-react";

import type { EveEngineeringMonitorAdminView } from "@asym/api/eve/engineering-monitors";

interface MonitorResponse extends EveEngineeringMonitorAdminView {
  requestId: string;
}

const QUERY_KEY = ["admin", "eve", "engineering-monitors"] as const;

async function loadMonitors(): Promise<MonitorResponse> {
  const response = await fetch("/api/admin/eve/engineering-monitors", {
    credentials: "same-origin",
    headers: { accept: "application/json" },
  });
  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as {
      error?: string;
    } | null;
    throw new Error(body?.error ?? "Could not load engineering monitors.");
  }
  return (await response.json()) as MonitorResponse;
}

function label(value: string): string {
  return value
    .split("_")
    .map((word) => `${word.charAt(0).toUpperCase()}${word.slice(1)}`)
    .join(" ");
}

export function EveEngineeringMonitorsPanel() {
  const query = useQuery({
    queryKey: QUERY_KEY,
    queryFn: loadMonitors,
    staleTime: 15_000,
    refetchInterval: 30_000,
    retry: false,
  });

  return (
    <Card id="eve-engineering-monitors">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity aria-hidden="true" className="size-5" />
          Engineering health monitors
        </CardTitle>
        <CardDescription>
          Exact six-signal allowlist with safe evidence, stable dedupe, current
          run health, and app-owned pause state. Product scanning is
          unavailable.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {query.isError ? (
          <Alert variant="destructive">
            <AlertDescription>{query.error.message}</AlertDescription>
          </Alert>
        ) : null}
        {query.isLoading ? (
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }, (_, index) => (
              <Skeleton key={index} className="h-24" />
            ))}
          </div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {(query.data?.configs ?? []).map((config) => {
              const latest = query.data?.recentRuns.find(
                (run) => run.monitorId === config.id,
              );
              return (
                <div key={config.id} className="rounded-lg border p-4">
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm font-medium">{label(config.type)}</p>
                    <Badge
                      variant={
                        config.enabled && !config.paused
                          ? "default"
                          : "secondary"
                      }
                    >
                      {!config.enabled
                        ? "Disabled"
                        : config.paused
                          ? "Paused"
                          : "Enabled"}
                    </Badge>
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {latest
                      ? `Last run: ${label(latest.status)} · ${latest.findingCount} findings`
                      : "No run recorded."}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Destination: {label(config.destinationPolicy.kind)}
                  </p>
                </div>
              );
            })}
          </div>
        )}

        <section aria-labelledby="engineering-findings-heading">
          <h3 id="engineering-findings-heading" className="text-sm font-medium">
            Current findings
          </h3>
          <ul className="mt-3 divide-y rounded-lg border px-4">
            {(query.data?.findings ?? []).map((finding) => (
              <li
                key={finding.id}
                className="flex flex-wrap items-start justify-between gap-3 py-3"
              >
                <div>
                  <p className="text-sm font-medium">
                    {label(finding.signalType)} · {finding.targetId}
                  </p>
                  <p className="mt-1 max-w-3xl text-xs text-muted-foreground">
                    {finding.decisionSummary}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Badge variant="outline">{finding.severity}</Badge>
                  <Badge variant="secondary">{finding.status}</Badge>
                </div>
              </li>
            ))}
            {!query.isLoading && (query.data?.findings.length ?? 0) === 0 ? (
              <li className="py-4 text-sm text-muted-foreground">
                No engineering-health findings.
              </li>
            ) : null}
          </ul>
        </section>
      </CardContent>
    </Card>
  );
}
