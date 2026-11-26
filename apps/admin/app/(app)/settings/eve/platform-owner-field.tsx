"use client";

import { ownApiFetch } from "@asym/database/own-api";
import { readJsonBody } from "@asym/lib/http/fetch-result";
import { Button } from "@asym/ui/components/shadcn/button";
import { Input } from "@asym/ui/components/shadcn/input";
import { Label } from "@asym/ui/components/shadcn/label";
import { SearchableSelect } from "@asym/ui/components/shadcn/searchable-select";
import { Skeleton } from "@asym/ui/components/shadcn/skeleton";
import { useQuery } from "@tanstack/react-query";
import { useId } from "react";

import type { EveLaunchPermission } from "@asym/api/eve/launch-readiness";
import type { EveLaunchOperator } from "@asym/api/eve/launch-readiness/operators";
import type { SearchableSelectOption } from "@asym/ui/components/shadcn/searchable-select";

const PLATFORM_OPERATORS_URL = "/api/admin/eve/launch-readiness/operators";
const PLATFORM_OPERATORS_QUERY_KEY = [
  "admin",
  "eve",
  "launch-permission-operators",
] as const;

const NOT_AN_OPERATOR_TEXT =
  "Only a platform operator can grant launch permissions.";
const LISTED_HINT =
  "Only platform operators who belong to this organization are listed.";
const EMPTY_TEXT = "No platform operators belong to this organization.";

export const LAUNCH_PERMISSION_LABELS: Record<
  EveLaunchPermission,
  { label: string; detail: string }
> = {
  "release.review": {
    label: "Can review launch evidence",
    detail: "Approve or reject evidence as the release or security reviewer.",
  },
  "release.activate": {
    label: "Can switch Eve on",
    detail: "Activate an approved deployment and run its trial.",
  },
};

export const LAUNCH_PERMISSIONS = Object.keys(
  LAUNCH_PERMISSION_LABELS,
) as EveLaunchPermission[];

export function platformOperatorOption(
  operator: EveLaunchOperator,
): SearchableSelectOption {
  const name = operator.displayName?.trim();
  const email = operator.email?.trim();
  const label =
    name && email
      ? `${name} (${email})`
      : name || email || "Platform operator with no name or email on file";
  return { value: operator.id, label };
}

class OperatorsReadError extends Error {
  readonly status: number;

  constructor(status: number) {
    super("Could not load platform operators.");
    this.name = "OperatorsReadError";
    this.status = status;
  }
}

async function loadPlatformOperators(): Promise<SearchableSelectOption[]> {
  const response = await ownApiFetch(PLATFORM_OPERATORS_URL, {
    credentials: "same-origin",
    headers: { accept: "application/json" },
  });
  const { ok, body } = await readJsonBody<{ operators?: unknown }>(response);
  if (!ok || !body || !Array.isArray(body.operators)) {
    throw new OperatorsReadError(response.status);
  }
  return (body.operators as EveLaunchOperator[])
    .filter((operator) => typeof operator?.id === "string")
    .map(platformOperatorOption)
    .sort((a, b) => a.label.localeCompare(b.label));
}

function isRefusal(error: unknown): boolean {
  return error instanceof OperatorsReadError && error.status === 403;
}

export function PlatformOwnerField({
  profileId,
  onProfileIdChange,
}: {
  profileId: string;
  onProfileIdChange: (value: string) => void;
}) {
  const hintId = useId();
  const people = useQuery({
    queryKey: PLATFORM_OPERATORS_QUERY_KEY,
    queryFn: loadPlatformOperators,
    retry: false,
    staleTime: 60_000,
  });

  if (people.isLoading) {
    return <Skeleton className="h-9" />;
  }

  if (people.isError && isRefusal(people.error)) {
    return (
      <p className="text-sm text-muted-foreground">{NOT_AN_OPERATOR_TEXT}</p>
    );
  }

  if (people.isError) {
    const isRetrying = people.isFetching;
    return (
      <div className="space-y-2">
        <Label htmlFor="eve-launch-profile">
          Platform operator&apos;s profile ID
        </Label>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm text-muted-foreground">
            We could not load the list of platform operators.
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => void people.refetch()}
            disabled={isRetrying}
            focusableWhenDisabled
            aria-busy={isRetrying || undefined}
          >
            Load platform operators again
          </Button>
        </div>
        <Input
          id="eve-launch-profile"
          aria-describedby={hintId}
          value={profileId}
          onChange={(event) => onProfileIdChange(event.target.value)}
          placeholder="00000000-0000-4000-8000-000000000000"
        />
        <p id={hintId} className="text-xs text-muted-foreground">
          If the list still will not load, enter the person&apos;s profile ID.
          It is their user ID: a platform engineer can copy it from
          Authentication &gt; Users in the Supabase dashboard.
        </p>
      </div>
    );
  }

  const options = people.data ?? [];
  return (
    <div className="space-y-2">
      <Label id="eve-launch-profile-label" htmlFor="eve-launch-profile">
        Platform operator
      </Label>
      <SearchableSelect
        id="eve-launch-profile"
        aria-labelledby="eve-launch-profile-label"
        aria-describedby={hintId}
        searchLabel="Search platform operators by name or email"
        items={options}
        value={profileId || null}
        onValueChange={(value) => onProfileIdChange(value ?? "")}
        disabled={options.length === 0}
        placeholder={
          options.length === 0 ? EMPTY_TEXT : "Choose a platform operator"
        }
      />
      <p id={hintId} className="text-xs text-muted-foreground">
        {LISTED_HINT}
      </p>
    </div>
  );
}
