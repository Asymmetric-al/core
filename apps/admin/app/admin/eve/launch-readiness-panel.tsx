"use client";

import { EVE_LAUNCH_CANARY_IDS } from "@asym/api/eve/launch-readiness";
import { Alert, AlertDescription } from "@asym/ui/components/shadcn/alert";
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
import { Rocket, ShieldAlert } from "lucide-react";
import { useState } from "react";

import { EVE_GOVERNANCE_QUERY_KEY } from "./query-keys";

import type { EveGovernanceSnapshot } from "@asym/api/eve/governance/types";
import type {
  EveLaunchAdminView,
  EveLaunchManifestDocument,
  EveLaunchPermission,
} from "@asym/api/eve/launch-readiness";

interface LaunchReadinessResponse extends EveLaunchAdminView {
  governance: EveGovernanceSnapshot | null;
  requestId: string;
}

const QUERY_KEY = ["admin", "eve", "launch-readiness"] as const;
const COMPLETE_CANARY_RESULTS = Object.fromEntries(
  EVE_LAUNCH_CANARY_IDS.map((id) => [id, true]),
);
const FAILED_CANARY_RESULTS = Object.fromEntries(
  EVE_LAUNCH_CANARY_IDS.map((id) => [id, false]),
);

async function loadReadiness(): Promise<LaunchReadinessResponse> {
  const response = await fetch("/api/admin/eve/launch-readiness", {
    credentials: "same-origin",
    headers: { accept: "application/json" },
  });
  const body = (await response.json().catch(() => null)) as
    | LaunchReadinessResponse
    | { error?: string }
    | null;
  if (!response.ok) {
    throw new Error(
      body && "error" in body
        ? body.error
        : "Could not load Eve launch readiness.",
    );
  }
  return body as LaunchReadinessResponse;
}

async function mutateReadiness(
  body: Record<string, unknown>,
): Promise<LaunchReadinessResponse> {
  const response = await fetch("/api/admin/eve/launch-readiness", {
    method: "POST",
    credentials: "same-origin",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  const result = (await response.json().catch(() => null)) as
    | LaunchReadinessResponse
    | { error?: string }
    | null;
  if (!response.ok) {
    throw new Error(
      result && "error" in result
        ? result.error
        : "Eve launch operation failed.",
    );
  }
  return result as LaunchReadinessResponse;
}

function launchStatusVariant(status: string) {
  return status === "ready" || status === "completed"
    ? "default"
    : status === "not_ready" || status === "rolled_back"
      ? "destructive"
      : "secondary";
}

export function EveLaunchReadinessPanel() {
  const queryClient = useQueryClient();
  const [manifestJson, setManifestJson] = useState("");
  const [profileId, setProfileId] = useState("");
  const [reason, setReason] = useState("");
  const [localError, setLocalError] = useState<string>();
  const query = useQuery({
    queryKey: QUERY_KEY,
    queryFn: loadReadiness,
    refetchInterval: 15_000,
    retry: false,
  });
  const mutation = useMutation({
    mutationFn: mutateReadiness,
    async onSuccess(data) {
      setLocalError(undefined);
      queryClient.setQueryData(QUERY_KEY, data);
      // Activation, safety controls, and canary failures all write
      // eve_governance_state, so the separately cached governance panel must
      // refetch instead of showing release/emergency state from before the call.
      await queryClient.invalidateQueries({
        queryKey: EVE_GOVERNANCE_QUERY_KEY,
      });
    },
  });
  const governance = query.data?.governance;
  const manifest = query.data?.manifests[0];
  const launch = query.data?.latestLaunch;
  const explanation = reason.trim();

  const submitManifest = () => {
    try {
      const document = JSON.parse(manifestJson) as EveLaunchManifestDocument;
      setLocalError(undefined);
      mutation.mutate({ kind: "manifest", document });
    } catch {
      setLocalError("The launch manifest must be valid JSON.");
    }
  };

  const setPermission = (permission: EveLaunchPermission, enabled: boolean) => {
    mutation.mutate({
      kind: "permission",
      enabled,
      permission,
      profileId,
      reason: explanation,
    });
  };

  return (
    <Card id="eve-launch-readiness">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Rocket aria-hidden="true" className="size-5" />
          Launch readiness
        </CardTitle>
        <CardDescription>
          Target-bound evidence, two-person review, explicit activation, and a
          fail-closed canary. Importing or reviewing evidence cannot enable Eve.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {query.isError || mutation.isError || localError ? (
          <Alert variant="destructive">
            <AlertDescription>
              {localError ?? query.error?.message ?? mutation.error?.message}
            </AlertDescription>
          </Alert>
        ) : null}
        {query.isLoading ? (
          <Skeleton className="h-44" />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg border p-3">
              <p className="text-xs text-muted-foreground">Release</p>
              <Badge
                className="mt-2"
                variant={
                  governance?.releaseEnabled ? "destructive" : "secondary"
                }
              >
                {governance?.releaseEnabled ? "Enabled" : "Off"}
              </Badge>
            </div>
            <div className="rounded-lg border p-3">
              <p className="text-xs text-muted-foreground">Emergency</p>
              <Badge
                className="mt-2"
                variant={governance?.emergencyOff ? "destructive" : "outline"}
              >
                {governance?.emergencyOff ? "Engaged" : "Clear"}
              </Badge>
            </div>
            <div className="rounded-lg border p-3">
              <p className="text-xs text-muted-foreground">Runtime target</p>
              <Badge className="mt-2" variant="outline">
                {query.data?.runtimeTarget ? "Configured" : "Incomplete"}
              </Badge>
            </div>
            <div className="rounded-lg border p-3">
              <p className="text-xs text-muted-foreground">Latest manifest</p>
              <Badge
                className="mt-2"
                variant={
                  manifest ? launchStatusVariant(manifest.status) : "outline"
                }
              >
                {manifest?.status ?? "None"}
              </Badge>
            </div>
          </div>
        )}

        <section aria-labelledby="eve-launch-manifest-title">
          <Label id="eve-launch-manifest-title" htmlFor="eve-launch-manifest">
            Signed-off launch evidence manifest
          </Label>
          <Textarea
            id="eve-launch-manifest"
            className="mt-2 min-h-32 font-mono text-xs"
            value={manifestJson}
            placeholder='{"schemaVersion":"eve-launch-manifest-v1", ...}'
            onChange={(event) => setManifestJson(event.target.value)}
          />
          <Button
            className="mt-2"
            size="sm"
            variant="outline"
            disabled={mutation.isPending || manifestJson.trim().length === 0}
            onClick={submitManifest}
          >
            Validate and import
          </Button>
        </section>

        <section aria-labelledby="eve-launch-reason-title">
          <Label id="eve-launch-reason-title" htmlFor="eve-launch-reason">
            Review or control reason
          </Label>
          <Input
            id="eve-launch-reason"
            className="mt-2"
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            placeholder="Concise, non-sensitive operator rationale"
          />
          <p className="mt-2 text-xs text-muted-foreground">
            Required for every review, permission, release, and canary control
            below, including the first-run state with no imported manifest.
          </p>
        </section>

        {manifest ? (
          <section
            className="space-y-3"
            aria-labelledby="eve-launch-review-title"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 id="eve-launch-review-title" className="text-sm font-medium">
                Independent review
              </h3>
              <span className="text-xs text-muted-foreground">
                {manifest.reviews.length} recorded review(s)
              </span>
            </div>
            {manifest.evaluation.blockers.length > 0 ? (
              <p className="text-xs text-destructive">
                {manifest.evaluation.blockers.length} readiness blocker(s):{" "}
                {manifest.evaluation.blockers.slice(0, 3).join(", ")}
              </p>
            ) : null}
            <details className="rounded-lg border p-3">
              <summary className="cursor-pointer text-sm font-medium">
                Inspect exact manifest and content hash
              </summary>
              <p className="mt-2 break-all text-xs text-muted-foreground">
                SHA-256: {manifest.contentHash}
              </p>
              <pre className="mt-3 max-h-80 overflow-auto whitespace-pre-wrap break-words text-xs">
                {JSON.stringify(manifest.document, null, 2)}
              </pre>
            </details>
            <div className="flex flex-wrap gap-2">
              {(["release", "security"] as const).flatMap((reviewerRole) =>
                (["approved", "rejected"] as const).map((decision) => (
                  <Button
                    key={`${reviewerRole}:${decision}`}
                    size="sm"
                    variant={
                      decision === "approved" ? "outline" : "destructive"
                    }
                    disabled={
                      mutation.isPending ||
                      !query.data?.canReview ||
                      explanation.length === 0
                    }
                    onClick={() =>
                      mutation.mutate({
                        kind: "review",
                        decision,
                        manifestId: manifest.id,
                        reviewerRole,
                        summary: explanation,
                      })
                    }
                  >
                    {decision === "approved" ? "Approve" : "Reject"} as{" "}
                    {reviewerRole}
                  </Button>
                )),
              )}
            </div>
          </section>
        ) : null}

        <section
          className="space-y-3"
          aria-labelledby="eve-launch-permissions-title"
        >
          <h3 id="eve-launch-permissions-title" className="text-sm font-medium">
            Dedicated launch permissions
          </h3>
          <Label htmlFor="eve-launch-profile">Platform-owner profile ID</Label>
          <Input
            id="eve-launch-profile"
            value={profileId}
            onChange={(event) => setProfileId(event.target.value)}
            placeholder="00000000-0000-4000-8000-000000000000"
          />
          <div className="flex flex-wrap gap-2">
            {(["release.review", "release.activate"] as const).flatMap(
              (permission) =>
                ([true, false] as const).map((enabled) => (
                  <Button
                    key={`${permission}:${enabled}`}
                    size="sm"
                    variant="outline"
                    disabled={
                      mutation.isPending ||
                      profileId.length === 0 ||
                      explanation.length === 0
                    }
                    onClick={() => setPermission(permission, enabled)}
                  >
                    {enabled ? "Grant" : "Revoke"} {permission}
                  </Button>
                )),
            )}
          </div>
        </section>

        <section
          className="rounded-lg border border-destructive/40 p-4"
          aria-labelledby="eve-release-control-title"
        >
          <h3
            id="eve-release-control-title"
            className="flex items-center gap-2 text-sm font-medium"
          >
            <ShieldAlert
              aria-hidden="true"
              className="size-4 text-destructive"
            />
            Release and emergency controls
          </h3>
          <div className="mt-3 flex flex-wrap gap-2">
            <AlertDialog>
              <AlertDialogTrigger
                disabled={
                  mutation.isPending ||
                  !manifest ||
                  manifest.status !== "ready" ||
                  !query.data?.canActivate ||
                  !query.data.runtimeTarget ||
                  !governance ||
                  explanation.length === 0
                }
                render={<Button size="sm">Activate exact target</Button>}
              />
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    Activate Eve for this exact deployment?
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    This is the only control here that can enable Eve. The
                    server will re-check the target, manifest hash, reviews,
                    governance version, policy, and kill switches atomically.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() =>
                      mutation.mutate({
                        kind: "activate",
                        expectedStateVersion: governance?.stateVersion,
                        justification: explanation,
                        manifestId: manifest?.id,
                      })
                    }
                  >
                    Activate and start canary
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            {governance?.releaseEnabled ? (
              <Button
                size="sm"
                variant="outline"
                disabled={mutation.isPending || explanation.length === 0}
                onClick={() =>
                  mutation.mutate({
                    kind: "safety_control",
                    expectedStateVersion: governance.stateVersion,
                    mode: "disable",
                    reason: explanation,
                  })
                }
              >
                Disable release (no emergency)
              </Button>
            ) : null}
            <Button
              size="sm"
              variant="destructive"
              disabled={
                mutation.isPending || !governance || explanation.length === 0
              }
              onClick={() =>
                mutation.mutate({
                  kind: "safety_control",
                  expectedStateVersion: governance?.stateVersion,
                  mode: "emergency_off",
                  reason: explanation,
                })
              }
            >
              Emergency off
            </Button>
            {governance?.emergencyOff ? (
              <Button
                size="sm"
                variant="outline"
                disabled={mutation.isPending || explanation.length === 0}
                onClick={() =>
                  mutation.mutate({
                    kind: "safety_control",
                    expectedStateVersion: governance.stateVersion,
                    mode: "clear_emergency",
                    reason: explanation,
                  })
                }
              >
                Clear emergency (keep release off)
              </Button>
            ) : null}
          </div>
        </section>

        {launch?.status === "active" ? (
          <section
            className="space-y-3 rounded-lg border p-4"
            aria-labelledby="eve-launch-canary-title"
          >
            <h3 id="eve-launch-canary-title" className="text-sm font-medium">
              Active 15-minute canary
            </h3>
            <p className="text-xs text-muted-foreground">
              Deadline: {new Date(launch.canaryDeadline).toLocaleString()}
            </p>
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                disabled={mutation.isPending || explanation.length === 0}
                onClick={() =>
                  mutation.mutate({
                    kind: "canary",
                    launchId: launch.id,
                    reason: explanation,
                    results: COMPLETE_CANARY_RESULTS,
                    status: "completed",
                  })
                }
              >
                Record all canaries passed
              </Button>
              <Button
                size="sm"
                variant="destructive"
                disabled={mutation.isPending || explanation.length === 0}
                onClick={() =>
                  mutation.mutate({
                    kind: "canary",
                    launchId: launch.id,
                    reason: explanation,
                    results: FAILED_CANARY_RESULTS,
                    status: "failed",
                  })
                }
              >
                Fail canary and roll back
              </Button>
            </div>
          </section>
        ) : null}
      </CardContent>
    </Card>
  );
}
