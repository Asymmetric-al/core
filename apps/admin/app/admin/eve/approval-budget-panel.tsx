"use client";

import { EVE_POLICY_ACTION_IDS } from "@asym/api/eve/approval-budget";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@asym/ui/components/shadcn/alert";
import { Badge } from "@asym/ui/components/shadcn/badge";
import { Button } from "@asym/ui/components/shadcn/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@asym/ui/components/shadcn/card";
import { Input } from "@asym/ui/components/shadcn/input";
import { Label } from "@asym/ui/components/shadcn/label";
import { Skeleton } from "@asym/ui/components/shadcn/skeleton";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Gauge, ShieldCheck } from "lucide-react";
import { useState } from "react";

import type {
  EveApprovalBudgetAdminView,
  EvePolicyActionId,
} from "@asym/api/eve/approval-budget/types";

interface ResponseBody extends EveApprovalBudgetAdminView {
  mutation?: { action: string; result: unknown };
  requestId: string;
}
type MutationBody =
  | {
      action: "execute";
      actionId: EvePolicyActionId;
      approvalId?: string;
      targetKey: string;
    }
  | {
      action: "request_approval";
      actionId: EvePolicyActionId;
      targetKey: string;
    }
  | {
      action: "decide_approval";
      approvalId: string;
      approved: boolean;
      reason: string;
    }
  | {
      action: "override_budget";
      scopeType: "expensive_feature";
      scopeId: string;
      additionalRequests: number;
      additionalUsdMicros: number;
      additionalInputTokens: number;
      additionalOutputTokens: number;
      expiresAt: string;
      reason: string;
    };

const QUERY_KEY = ["admin", "eve", "approval-budget"] as const;
const ACTION_LABELS: Record<EvePolicyActionId, string> = {
  "engineering.review_artifact.write": "Write engineering review artifact",
  "product.internal_status.write": "Write product/admin internal status",
  "memory.advisory.write": "Write advisory memory tracer",
  "product.donor.write": "Attempt stricter donor-data class",
};

async function requestPolicy(body?: MutationBody): Promise<ResponseBody> {
  const response = await fetch(
    "/api/admin/eve/approval-budget",
    body
      ? {
          method: "POST",
          credentials: "same-origin",
          headers: {
            accept: "application/json",
            "content-type": "application/json",
          },
          body: JSON.stringify(body),
        }
      : { credentials: "same-origin", headers: { accept: "application/json" } },
  );
  const data = (await response.json().catch(() => null)) as
    | (ResponseBody & { error?: string })
    | null;
  if (!response.ok)
    throw new Error(
      data?.error ?? "Could not apply Eve approval and budget policy.",
    );
  if (!data)
    throw new Error("Eve approval and budget policy returned no response.");
  return data;
}

function formatNumber(value: number) {
  return new Intl.NumberFormat().format(value);
}

export function EveApprovalBudgetPanel() {
  const client = useQueryClient();
  const [actionId, setActionId] = useState<EvePolicyActionId>(
    "engineering.review_artifact.write",
  );
  const [targetKey, setTargetKey] = useState("review:tracer");
  const query = useQuery({
    queryKey: QUERY_KEY,
    queryFn: () => requestPolicy(),
    staleTime: 15_000,
    refetchInterval: 15_000,
    retry: false,
  });
  const mutation = useMutation({
    mutationFn: requestPolicy,
    onSuccess(data) {
      client.setQueryData(QUERY_KEY, data);
    },
  });
  const matchingApproval = query.data?.approvals.find(
    (approval) =>
      approval.actionId === actionId &&
      approval.targetKey === targetKey &&
      approval.status === "approved",
  );

  return (
    <section className="space-y-6" aria-labelledby="approval-budget-title">
      <Card>
        <CardHeader>
          <CardTitle
            id="approval-budget-title"
            className="flex items-center gap-2"
          >
            <ShieldCheck aria-hidden="true" className="size-5" />
            Approval and budget policy
          </CardTitle>
          <CardDescription>
            Executable tracer for separate trust zones, stricter business-data
            approval, and hard persisted budgets. It writes only a non-business
            tracer artifact and does not enable Eve.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {mutation.error ? (
            <Alert variant="destructive">
              <AlertTitle>Policy mutation failed closed</AlertTitle>
              <AlertDescription>{mutation.error.message}</AlertDescription>
            </Alert>
          ) : null}
          {mutation.data?.mutation ? (
            <Alert>
              <AlertTitle>Policy decision recorded</AlertTitle>
              <AlertDescription>
                {JSON.stringify(mutation.data.mutation.result)}
              </AlertDescription>
            </Alert>
          ) : null}
          <div className="grid gap-4 md:grid-cols-[1fr_18rem]">
            <div>
              <Label htmlFor="policy-action">Fixed app-owned action</Label>
              <select
                id="policy-action"
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
                value={actionId}
                onChange={(event) =>
                  setActionId(event.target.value as EvePolicyActionId)
                }
              >
                {EVE_POLICY_ACTION_IDS.map((id) => (
                  <option key={id} value={id}>
                    {ACTION_LABELS[id]}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="policy-target">Non-sensitive target key</Label>
              <Input
                id="policy-target"
                value={targetKey}
                onChange={(event) => setTargetKey(event.target.value)}
                pattern="[a-zA-Z0-9:_-]+"
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              disabled={mutation.isPending || !targetKey}
              onClick={() =>
                mutation.mutate({
                  action: "execute",
                  actionId,
                  targetKey,
                  approvalId: matchingApproval?.id,
                })
              }
            >
              Consult and execute tracer
            </Button>
            <Button
              variant="outline"
              disabled={mutation.isPending || !targetKey}
              onClick={() =>
                mutation.mutate({
                  action: "request_approval",
                  actionId,
                  targetKey,
                })
              }
            >
              Request required approval
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            The server resolves zone, write class, domain, and cost from its
            catalog. The target key cannot contain spaces or payload data.
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Separate trust-zone rules</CardTitle>
            <CardDescription>
              An allowance never crosses into another zone.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {query.isLoading ? (
              <Skeleton className="h-28 w-full" />
            ) : (
              <ul className="space-y-3">
                {query.data?.policies.map((policy) => (
                  <li
                    key={policy.trustZone}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <span className="text-sm font-medium">
                      {policy.trustZone.replace("_", " /")}
                    </span>
                    <Badge
                      variant={
                        policy.operationalMode === "allow"
                          ? "default"
                          : policy.operationalMode === "deny"
                            ? "destructive"
                            : "secondary"
                      }
                    >
                      {policy.operationalMode.replace("_", " ")}
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gauge aria-hidden="true" className="size-5" />
              Hard budgets
            </CardTitle>
            <CardDescription>
              Active overrides are additive, bounded, permissioned, expiring,
              and audited.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {query.data?.budgets.map((budget) => (
              <div key={budget.id} className="space-y-2 rounded-lg border p-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">
                    {budget.scopeType}: {budget.scopeId}
                  </p>
                  <Badge
                    variant={
                      budget.usedRequests >=
                      budget.maxRequests + budget.additionalRequests
                        ? "destructive"
                        : "outline"
                    }
                  >
                    {formatNumber(budget.usedRequests)} /{" "}
                    {formatNumber(
                      budget.maxRequests + budget.additionalRequests,
                    )}{" "}
                    requests
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  USD micros {formatNumber(budget.usedUsdMicros)} /{" "}
                  {formatNumber(
                    budget.maxUsdMicros + budget.additionalUsdMicros,
                  )}{" "}
                  · input {formatNumber(budget.usedInputTokens)} /{" "}
                  {formatNumber(
                    budget.maxInputTokens + budget.additionalInputTokens,
                  )}{" "}
                  · output {formatNumber(budget.usedOutputTokens)} /{" "}
                  {formatNumber(
                    budget.maxOutputTokens + budget.additionalOutputTokens,
                  )}
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={mutation.isPending}
                  onClick={() =>
                    mutation.mutate({
                      action: "override_budget",
                      scopeType: "expensive_feature",
                      scopeId: budget.scopeId,
                      additionalRequests: 1,
                      additionalUsdMicros: 0,
                      additionalInputTokens: 0,
                      additionalOutputTokens: 0,
                      expiresAt: new Date(
                        Date.now() + 60 * 60 * 1000,
                      ).toISOString(),
                      reason:
                        "One-hour emergency tracer allowance requested by a verified operator.",
                    })
                  }
                >
                  Add one request for 1 hour
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Approval queue</CardTitle>
          <CardDescription>
            Business-data actions require strict approval; zone approval cannot
            substitute. Each approval is target-bound, expiring, and single-use.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {(query.data?.approvals.length ?? 0) === 0 ? (
            <p className="text-sm text-muted-foreground">
              No approval requests.
            </p>
          ) : (
            <ul className="divide-y">
              {query.data?.approvals.map((approval) => (
                <li
                  key={approval.id}
                  className="flex flex-wrap items-center justify-between gap-3 py-3"
                >
                  <div>
                    <p className="text-sm font-medium">
                      {ACTION_LABELS[approval.actionId as EvePolicyActionId] ??
                        approval.actionId}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {approval.targetKey} · {approval.trustZone} ·{" "}
                      {approval.approvalLevel} · expires{" "}
                      {new Date(approval.expiresAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={
                        approval.status === "denied" ? "destructive" : "outline"
                      }
                    >
                      {approval.status}
                    </Badge>
                    {approval.status === "pending" ? (
                      <>
                        <Button
                          size="sm"
                          disabled={mutation.isPending}
                          onClick={() =>
                            mutation.mutate({
                              action: "decide_approval",
                              approvalId: approval.id,
                              approved: true,
                              reason:
                                "Verified operator approved this exact tracer action and target.",
                            })
                          }
                        >
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          disabled={mutation.isPending}
                          onClick={() =>
                            mutation.mutate({
                              action: "decide_approval",
                              approvalId: approval.id,
                              approved: false,
                              reason:
                                "Verified operator denied this tracer action.",
                            })
                          }
                        >
                          Deny
                        </Button>
                      </>
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent policy decisions</CardTitle>
          <CardDescription>
            Every allow, deny, and pause is persisted with a matching ADR-0020
            audit event.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {(query.data?.decisions.length ?? 0) === 0 ? (
            <p className="text-sm text-muted-foreground">
              No policy decisions yet.
            </p>
          ) : (
            <ul className="divide-y">
              {query.data?.decisions.map((decision) => (
                <li
                  key={decision.id}
                  className="flex flex-wrap items-center justify-between gap-3 py-3"
                >
                  <div>
                    <p className="text-sm font-medium">{decision.actionId}</p>
                    <p className="text-xs text-muted-foreground">
                      {decision.targetKey} · {decision.trustZone} ·{" "}
                      {decision.writeClass} · {decision.reason}
                    </p>
                  </div>
                  <Badge
                    variant={
                      decision.decision === "allow"
                        ? "default"
                        : decision.decision === "pause"
                          ? "secondary"
                          : "destructive"
                    }
                  >
                    {decision.decision}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
