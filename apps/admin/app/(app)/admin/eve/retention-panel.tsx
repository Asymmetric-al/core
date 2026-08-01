"use client";

import { Alert, AlertDescription } from "@asym/ui/components/shadcn/alert";
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
import { ArchiveRestore, Clock3, DatabaseZap, ShieldCheck } from "lucide-react";

import type { EveRetentionAdminView } from "@asym/api/eve/retention/types";

interface RetentionResponse extends EveRetentionAdminView {
  requestId: string;
}

const QUERY_KEY = ["admin", "eve", "retention"] as const;

async function loadRetention(): Promise<RetentionResponse> {
  const response = await fetch("/api/admin/eve/retention", {
    credentials: "same-origin",
    headers: { accept: "application/json" },
  });
  if (!response.ok) throw new Error("Could not load Eve retention state.");
  return (await response.json()) as RetentionResponse;
}

async function mutateRetention(body: Record<string, unknown>) {
  const response = await fetch("/api/admin/eve/retention", {
    method: "POST",
    credentials: "same-origin",
    headers: { accept: "application/json", "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    const error = (await response.json().catch(() => null)) as {
      error?: string;
    } | null;
    throw new Error(error?.error ?? "Could not apply the retention action.");
  }
  return response.json();
}

function timestamp(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function EveRetentionPanel() {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: QUERY_KEY,
    queryFn: loadRetention,
    staleTime: 15_000,
    retry: false,
  });
  const mutation = useMutation({
    mutationFn: mutateRetention,
    async onSuccess() {
      await queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });

  return (
    <Card id="eve-retention">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ArchiveRestore aria-hidden="true" className="size-5" />
          Retention and replay artifacts
        </CardTitle>
        <CardDescription>
          Queryable redacted metadata in Postgres; private artifact bodies stay
          in Storage. Holds affect lifecycle only and grant no autonomy.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {query.isError ? (
          <Alert variant="destructive">
            <AlertDescription>{query.error.message}</AlertDescription>
          </Alert>
        ) : null}
        {mutation.isError ? (
          <Alert variant="destructive">
            <AlertDescription>{mutation.error.message}</AlertDescription>
          </Alert>
        ) : null}

        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          {(query.data?.categories ?? []).map((category) => (
            <div key={category.category} className="rounded-lg border p-4">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-medium">{category.category}</p>
                <Badge
                  variant={category.metadataOnly ? "secondary" : "outline"}
                >
                  {category.retentionDays} days
                </Badge>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                {category.description}
              </p>
              {category.metadataOnly ? (
                <p className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                  <ShieldCheck aria-hidden="true" className="size-3.5" />
                  Metadata only
                </p>
              ) : null}
            </div>
          ))}
        </div>

        <section aria-labelledby="retention-artifacts-heading">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3
                id="retention-artifacts-heading"
                className="text-sm font-medium"
              >
                Replay metadata
              </h3>
              <p className="text-xs text-muted-foreground">
                Only artifacts owned by your tenant and profile are shown.
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              disabled={mutation.isPending}
              onClick={() =>
                mutation.mutate({ action: "run_expiry", limit: 100 })
              }
            >
              <DatabaseZap aria-hidden="true" className="size-4" />
              Run expiry
            </Button>
          </div>
          <ul className="mt-3 divide-y rounded-lg border px-4">
            {(query.data?.artifacts ?? []).map((artifact) => (
              <li
                key={artifact.id}
                className="flex flex-wrap justify-between gap-3 py-3"
              >
                <div>
                  <p className="text-sm font-medium">{artifact.artifactKind}</p>
                  <p className="max-w-2xl text-xs text-muted-foreground">
                    {artifact.redactedSummary}
                  </p>
                </div>
                <div className="text-right">
                  <Badge variant="outline">{artifact.status}</Badge>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Expires {timestamp(artifact.expiresAt)}
                  </p>
                </div>
              </li>
            ))}
            {!query.isLoading && (query.data?.artifacts.length ?? 0) === 0 ? (
              <li className="py-4 text-sm text-muted-foreground">
                No replay artifacts.
              </li>
            ) : null}
          </ul>
        </section>

        <section aria-labelledby="retention-holds-heading">
          <h3 id="retention-holds-heading" className="text-sm font-medium">
            Incident and legal holds
          </h3>
          <ul className="mt-3 divide-y rounded-lg border px-4">
            {(query.data?.holds ?? []).map((hold) => (
              <li
                key={hold.id}
                className="flex flex-wrap justify-between gap-3 py-3"
              >
                <div>
                  <p className="text-sm font-medium">
                    {hold.holdType} · {hold.scopeType}
                  </p>
                  <p className="text-xs text-muted-foreground">{hold.reason}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={hold.status === "active" ? "secondary" : "outline"}
                  >
                    {hold.status}
                  </Badge>
                  {hold.status === "active" ? (
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={mutation.isPending}
                      onClick={() =>
                        mutation.mutate({
                          action: "clear_hold",
                          holdId: hold.id,
                          reason: "Investigation completed in Eve Governance.",
                        })
                      }
                    >
                      Clear
                    </Button>
                  ) : null}
                </div>
              </li>
            ))}
            {!query.isLoading && (query.data?.holds.length ?? 0) === 0 ? (
              <li className="py-4 text-sm text-muted-foreground">
                No retention holds.
              </li>
            ) : null}
          </ul>
        </section>

        <p className="flex items-center gap-2 text-xs text-muted-foreground">
          <Clock3 aria-hidden="true" className="size-4" />
          Expiry is two-phase: claim, remove from Storage, then finalize
          metadata.
        </p>
      </CardContent>
    </Card>
  );
}
