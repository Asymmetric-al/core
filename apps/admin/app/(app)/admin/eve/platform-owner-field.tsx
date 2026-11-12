"use client";

import { readJsonBody } from "@asym/lib/http/fetch-result";
import { Button } from "@asym/ui/components/shadcn/button";
import { Input } from "@asym/ui/components/shadcn/input";
import { Label } from "@asym/ui/components/shadcn/label";
import { SearchableSelect } from "@asym/ui/components/shadcn/searchable-select";
import { Skeleton } from "@asym/ui/components/shadcn/skeleton";
import { useQuery } from "@tanstack/react-query";
import { useId } from "react";

import type { EveLaunchPermission } from "@asym/api/eve/launch-readiness";
import type { SearchableSelectOption } from "@asym/ui/components/shadcn/searchable-select";

/**
 * Launch permissions can only be held by a platform owner (the
 * `grant_eve_launch_permission` RPC asserts the receiving profile is a
 * super_admin in the same tenant), so the picker lists exactly those people
 * from the existing tenant-scoped admin users API.
 */
const PLATFORM_OWNERS_URL = "/api/admin/users?role=super_admin&limit=100";
const PLATFORM_OWNERS_QUERY_KEY = [
  "admin",
  "eve",
  "launch-permission-people",
] as const;

/** Plain-language names for the permission codes the server stores. */
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

interface PlatformOwnerProfile {
  id: string;
  email?: string | null;
  first_name?: string | null;
  full_name?: string | null;
  last_name?: string | null;
}

/** "Name (email)", falling back to whichever of the two is on file. */
export function platformOwnerOption(
  profile: PlatformOwnerProfile,
): SearchableSelectOption {
  const name =
    profile.full_name?.trim() ||
    [profile.first_name, profile.last_name]
      .map((part) => part?.trim())
      .filter(Boolean)
      .join(" ");
  const email = profile.email?.trim();
  const label =
    name && email
      ? `${name} (${email})`
      : name || email || "Platform owner with no name or email on file";
  return { value: profile.id, label };
}

async function loadPlatformOwners(): Promise<SearchableSelectOption[]> {
  const response = await fetch(PLATFORM_OWNERS_URL, {
    credentials: "same-origin",
    headers: { accept: "application/json" },
  });
  const { ok, body } = await readJsonBody<{ users?: unknown }>(response);
  if (!ok || !body || !Array.isArray(body.users)) {
    throw new Error("Could not load platform owners.");
  }
  return (body.users as PlatformOwnerProfile[])
    .filter((profile) => typeof profile?.id === "string")
    .map(platformOwnerOption)
    .sort((a, b) => a.label.localeCompare(b.label));
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
    queryKey: PLATFORM_OWNERS_QUERY_KEY,
    queryFn: loadPlatformOwners,
    retry: false,
    staleTime: 60_000,
  });

  if (people.isLoading) {
    return <Skeleton className="h-9" />;
  }

  if (people.isError) {
    // Without the list, an owner who knows the profile ID can still act, and
    // a temporary failure can be retried without reloading the page.
    const isRetrying = people.isFetching;
    return (
      <div className="space-y-2">
        <Label htmlFor="eve-launch-profile">
          Platform owner&apos;s profile ID
        </Label>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm text-muted-foreground">
            We could not load the list of platform owners.
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
            Load platform owners again
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
        Platform owner
      </Label>
      <SearchableSelect
        id="eve-launch-profile"
        aria-labelledby="eve-launch-profile-label"
        aria-describedby={hintId}
        searchLabel="Search platform owners by name or email"
        items={options}
        value={profileId || null}
        onValueChange={(value) => onProfileIdChange(value ?? "")}
        disabled={options.length === 0}
        placeholder={
          options.length === 0
            ? "No platform owners found"
            : "Choose a platform owner"
        }
      />
      <p id={hintId} className="text-xs text-muted-foreground">
        Search by name or email. Only platform owners are listed.
      </p>
    </div>
  );
}
