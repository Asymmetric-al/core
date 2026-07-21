"use client";

import {
  createDefaultEveModelPolicy,
  eveModelPolicyActions,
  eveModelPolicyDocumentSchema,
} from "@asym/api/eve/model-policy";
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
import { Input } from "@asym/ui/components/shadcn/input";
import { Label } from "@asym/ui/components/shadcn/label";
import { Skeleton } from "@asym/ui/components/shadcn/skeleton";
import { Textarea } from "@asym/ui/components/shadcn/textarea";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertTriangle,
  BadgeDollarSign,
  BrainCircuit,
  ShieldCheck,
} from "lucide-react";
import { useState } from "react";

import type {
  EveModelPolicyAdminView,
  EveModelPolicyRecord,
} from "@asym/api/eve/model-policy/types";

interface EveModelPolicyResponse extends EveModelPolicyAdminView {
  requestId: string;
}

type EveModelPolicyMutation =
  | { method: "POST"; body: { policy: unknown } }
  | {
      method: "PATCH";
      body:
        | { action: "evaluate"; policyId: string }
        | {
            action: "activate";
            expectedActivePolicyId: string | null;
            policyId: string;
          }
        | { action: "rollback"; expectedActivePolicyId: string }
        | {
            action: "override_budget";
            additionalInputTokens: number;
            additionalOutputTokens: number;
            additionalRequests: number;
            additionalUsdMicros: number;
            expiresAt: string;
            policyId: string;
            reason: string;
            scopeId: string;
            scopeType: "role" | "subagent";
          };
    };

const MODEL_POLICY_QUERY_KEY = ["admin", "eve", "model-policy"] as const;

async function loadEveModelPolicy(): Promise<EveModelPolicyResponse> {
  const response = await fetch("/api/admin/eve/model-policy", {
    credentials: "same-origin",
    headers: { accept: "application/json" },
  });
  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as {
      error?: string;
    } | null;
    throw new Error(body?.error ?? "Could not load Eve model policy.");
  }
  return (await response.json()) as EveModelPolicyResponse;
}

async function mutateEveModelPolicy(
  mutation: EveModelPolicyMutation,
): Promise<EveModelPolicyResponse> {
  const response = await fetch("/api/admin/eve/model-policy", {
    method: mutation.method,
    credentials: "same-origin",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
    },
    body: JSON.stringify(mutation.body),
  });
  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as {
      error?: string;
    } | null;
    throw new Error(body?.error ?? "Could not update Eve model policy.");
  }
  return (await response.json()) as EveModelPolicyResponse;
}

function PolicyLifecycleRow({
  activePolicyId,
  canManage,
  isPending,
  onMutate,
  policy,
}: {
  activePolicyId?: string;
  canManage: boolean;
  isPending: boolean;
  onMutate: (mutation: EveModelPolicyMutation) => void;
  policy: EveModelPolicyRecord;
}) {
  const actions = eveModelPolicyActions(policy);
  const canEvaluate = canManage && actions.canEvaluate;
  const canActivate = canManage && actions.canActivate;
  const canRollback = canManage && actions.canRollback;

  return (
    <li className="space-y-3 py-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-foreground">
            Policy v{policy.version}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {policy.policyHash.slice(0, 12)} · agent {policy.policy.agentRole} ·
            judge {policy.policy.judgeRole}
          </p>
        </div>
        <div className="flex gap-2">
          <Badge variant={policy.status === "active" ? "default" : "outline"}>
            {policy.status}
          </Badge>
          <Badge
            variant={
              policy.evalStatus === "failed" ? "destructive" : "secondary"
            }
          >
            eval: {policy.evalStatus}
          </Badge>
        </div>
      </div>

      {policy.evalSummary ? (
        <ul className="grid gap-1 text-xs text-muted-foreground md:grid-cols-2">
          {policy.evalSummary.checks.map((check) => (
            <li key={check.id}>
              {check.passed ? "Pass" : "Fail"}: {check.message}
            </li>
          ))}
        </ul>
      ) : null}

      {canEvaluate || canActivate || canRollback ? (
        <div className="flex flex-wrap gap-2">
          {canEvaluate ? (
            <Button
              size="sm"
              variant="outline"
              disabled={isPending}
              onClick={() =>
                onMutate({
                  method: "PATCH",
                  body: { action: "evaluate", policyId: policy.id },
                })
              }
            >
              Run policy eval
            </Button>
          ) : null}
          {canActivate ? (
            <AlertDialog>
              <AlertDialogTrigger
                disabled={isPending}
                render={<Button size="sm">Activate eval-passed policy</Button>}
              />
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    Activate policy v{policy.version}?
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    This changes the app-owned model control plane, retires the
                    prior active version, and creates an accountable audit row.
                    It does not enable Eve or call a model provider.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() =>
                      onMutate({
                        method: "PATCH",
                        body: {
                          action: "activate",
                          policyId: policy.id,
                          expectedActivePolicyId: activePolicyId ?? null,
                        },
                      })
                    }
                  >
                    Confirm activation
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          ) : null}
          {canRollback ? (
            <AlertDialog>
              <AlertDialogTrigger
                disabled={isPending}
                render={
                  <Button size="sm" variant="destructive">
                    Roll back
                  </Button>
                }
              />
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    Restore the previous policy?
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    The current version will be marked rolled back and its
                    previously evaluated predecessor restored atomically.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    variant="destructive"
                    onClick={() =>
                      onMutate({
                        method: "PATCH",
                        body: {
                          action: "rollback",
                          expectedActivePolicyId: policy.id,
                        },
                      })
                    }
                  >
                    Confirm rollback
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          ) : null}
        </div>
      ) : null}
    </li>
  );
}

export function EveModelPolicyPanel() {
  const queryClient = useQueryClient();
  const [draftText, setDraftText] = useState(() =>
    JSON.stringify(createDefaultEveModelPolicy(), null, 2),
  );
  const [draftError, setDraftError] = useState<string>();
  const [overrideScopeType, setOverrideScopeType] = useState<
    "role" | "subagent"
  >("role");
  const [overrideScopeId, setOverrideScopeId] = useState("agent");
  const [overrideUsdMicros, setOverrideUsdMicros] = useState("1000000");
  const [overrideRequests, setOverrideRequests] = useState("10");
  const [overrideMinutes, setOverrideMinutes] = useState("60");
  const [overrideReason, setOverrideReason] = useState("");
  const query = useQuery({
    queryKey: MODEL_POLICY_QUERY_KEY,
    queryFn: loadEveModelPolicy,
    staleTime: 15_000,
    refetchInterval: 15_000,
    retry: false,
  });
  const mutation = useMutation({
    mutationFn: mutateEveModelPolicy,
    onSuccess(data) {
      setDraftError(undefined);
      queryClient.setQueryData(MODEL_POLICY_QUERY_KEY, data);
    },
  });

  if (query.isLoading) {
    return (
      <Skeleton className="h-52 w-full" aria-label="Loading model policy" />
    );
  }

  if (query.isError || !query.data) {
    return (
      <Alert variant="destructive">
        <AlertTriangle aria-hidden="true" className="size-4" />
        <AlertTitle>Could not load Eve model policy</AlertTitle>
        <AlertDescription>
          {query.error?.message ?? "The model-policy store is unavailable."}
        </AlertDescription>
      </Alert>
    );
  }

  const data = query.data;
  const submitDraft = () => {
    try {
      const policy = eveModelPolicyDocumentSchema.parse(JSON.parse(draftText));
      setDraftError(undefined);
      mutation.mutate({ method: "POST", body: { policy } });
    } catch {
      setDraftError("Draft JSON must satisfy the versioned policy schema.");
    }
  };
  const submitOverride = () => {
    if (!data.activePolicy) return;
    const minutes = Number(overrideMinutes);
    mutation.mutate({
      method: "PATCH",
      body: {
        action: "override_budget",
        policyId: data.activePolicy.id,
        scopeType: overrideScopeType,
        scopeId: overrideScopeId,
        additionalUsdMicros: Number(overrideUsdMicros),
        additionalInputTokens: 0,
        additionalOutputTokens: 0,
        additionalRequests: Number(overrideRequests),
        expiresAt: new Date(Date.now() + minutes * 60_000).toISOString(),
        reason: overrideReason,
      },
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BrainCircuit aria-hidden="true" className="size-5" />
                Shared model policy
              </CardTitle>
              <CardDescription className="mt-1">
                Gateway-primary role policy with immutable versions, independent
                judges, hard limits, eval gates, and rollback.
              </CardDescription>
            </div>
            <Badge variant={data.canManage ? "secondary" : "outline"}>
              {data.canManage ? "ai.settings.manage" : "Read only"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {mutation.error || draftError ? (
            <Alert variant="destructive" className="mb-4">
              <AlertTriangle aria-hidden="true" className="size-4" />
              <AlertTitle>Model-policy update failed</AlertTitle>
              <AlertDescription>
                {draftError ?? mutation.error?.message}
              </AlertDescription>
            </Alert>
          ) : null}
          {data.activePolicy ? (
            <Alert className="mb-4">
              <ShieldCheck aria-hidden="true" className="size-4" />
              <AlertTitle>
                Active policy v{data.activePolicy.version} is eval-passed
              </AlertTitle>
              <AlertDescription>
                Primary routing remains Vercel AI Gateway. Direct providers are
                fallback-only and are revoked by model-policy kill-switch state.
              </AlertDescription>
            </Alert>
          ) : (
            <Alert className="mb-4">
              <AlertTriangle aria-hidden="true" className="size-4" />
              <AlertTitle>No active model policy</AlertTitle>
              <AlertDescription>
                Eve remains fail-closed. Draft and evaluate a policy before any
                activation can succeed.
              </AlertDescription>
            </Alert>
          )}
          <ul className="divide-y divide-border">
            {data.policies.length === 0 ? (
              <li className="py-4 text-sm text-muted-foreground">
                No model-policy versions have been drafted.
              </li>
            ) : (
              data.policies.map((policy) => (
                <PolicyLifecycleRow
                  key={policy.id}
                  activePolicyId={data.activePolicy?.id}
                  canManage={data.canManage}
                  isPending={mutation.isPending}
                  onMutate={(nextMutation) => mutation.mutate(nextMutation)}
                  policy={policy}
                />
              ))
            )}
          </ul>
        </CardContent>
      </Card>

      {data.canManage ? (
        <Card>
          <CardHeader>
            <CardTitle>Draft a policy version</CardTitle>
            <CardDescription>
              Drafts are immutable. Editing this JSON creates a new version;
              evaluation and activation remain separate deliberate actions.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              aria-label="Model policy JSON"
              className="min-h-96 font-mono text-xs"
              value={draftText}
              onChange={(event) => setDraftText(event.target.value)}
            />
            <Button disabled={mutation.isPending} onClick={submitDraft}>
              Create immutable draft
            </Button>
          </CardContent>
        </Card>
      ) : null}

      {data.canManage && data.activePolicy ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BadgeDollarSign aria-hidden="true" className="size-5" />
              Emergency budget override
            </CardTitle>
            <CardDescription>
              Add a bounded, expiring allowance to one active role or subagent.
              Every override requires the dedicated permission and is audited.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="eve-override-scope-type">Scope type</Label>
              <select
                id="eve-override-scope-type"
                className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                value={overrideScopeType}
                onChange={(event) =>
                  setOverrideScopeType(
                    event.target.value as "role" | "subagent",
                  )
                }
              >
                <option value="role">Role</option>
                <option value="subagent">Subagent</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="eve-override-scope-id">Scope identifier</Label>
              <Input
                id="eve-override-scope-id"
                value={overrideScopeId}
                onChange={(event) => setOverrideScopeId(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="eve-override-usd">Additional USD micros</Label>
              <Input
                id="eve-override-usd"
                max="100000000"
                min="0"
                type="number"
                value={overrideUsdMicros}
                onChange={(event) => setOverrideUsdMicros(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="eve-override-requests">
                Additional requests/minute
              </Label>
              <Input
                id="eve-override-requests"
                max="1000"
                min="0"
                type="number"
                value={overrideRequests}
                onChange={(event) => setOverrideRequests(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="eve-override-minutes">Expiry in minutes</Label>
              <Input
                id="eve-override-minutes"
                max="1440"
                min="1"
                type="number"
                value={overrideMinutes}
                onChange={(event) => setOverrideMinutes(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="eve-override-reason">Reason</Label>
              <Input
                id="eve-override-reason"
                value={overrideReason}
                onChange={(event) => setOverrideReason(event.target.value)}
              />
            </div>
            <div className="md:col-span-2">
              <AlertDialog>
                <AlertDialogTrigger
                  disabled={
                    mutation.isPending ||
                    !overrideScopeId.trim() ||
                    !overrideReason.trim()
                  }
                  render={
                    <Button variant="destructive">
                      Review emergency override
                    </Button>
                  }
                />
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      Grant a temporary hard-limit increase?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      This applies only to {overrideScopeType} {overrideScopeId}
                      , expires automatically, and creates a permanent
                      accountable audit record. It does not bypass any other
                      governance gate.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      variant="destructive"
                      onClick={submitOverride}
                    >
                      Confirm bounded override
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
