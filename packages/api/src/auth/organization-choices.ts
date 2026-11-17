import "server-only";

import { getSignedInAssignments } from "@asym/auth/context";
import { safeNextParam } from "@asym/auth/demo-login";
import {
  isOutsideTenantSegment,
  stripTenantAddress,
  withTenantAddress,
} from "@asym/auth/tenant-address";
import { listAddressChoices } from "@asym/auth/tenant-address-decisions";

import type { MembershipRole, StaffSubrole } from "@asym/database/types";

export interface OrganizationOption {
  /** The staff sub-role, or `null` for the person's one row there. */
  subRole: StaffSubrole | null;
  /** The page the person was going to, under this row's address. */
  href: string;
}

export interface OrganizationChoice {
  tenantId: string;
  name: string;
  options: OrganizationOption[];
}

export type OrganizationChoices =
  | { kind: "ok"; organizations: OrganizationChoice[] }
  | { kind: "signed_out" }
  | { kind: "unavailable" };

/**
 * Display names of the person's organizations, by tenant id. Signed-in users
 * cannot read `tenants`, so a surface that already holds a sanctioned reader
 * (Mission Control's shell) passes one in; without it the chooser names each
 * organization by a short form of its id.
 */
export type OrganizationNameReader = (
  tenantIds: string[],
) => Promise<ReadonlyMap<string, string>>;

/**
 * Where a choice leads: the page in `next`, without any tenant prefix it
 * carried, or the organization's home page for anything that is not a
 * signed-in page address of this app.
 */
function choicePath(next: string | null | undefined): string {
  const safe = safeNextParam(next ?? null);
  if (!safe) return "/";
  const url = new URL(safe, "http://localhost");
  const pathname = stripTenantAddress(url.pathname);
  if (isOutsideTenantSegment(pathname)) return "/";
  return `${pathname}${url.search}${url.hash}`;
}

function fallbackName(tenantId: string) {
  return `Organization ${tenantId.slice(0, 8)}…${tenantId.slice(-4)}`;
}

/**
 * The organization and assignment chooser's options (plan 5.2; AL-2675):
 * each live row of the surface's class the signed-in person holds,
 * optionally in one tenant, grouped by organization. Choosing one loads its
 * address as a new document, where the proxy makes its membership decision
 * again, so nothing here authorizes.
 */
export async function loadOrganizationChoices(input: {
  roleClass: MembershipRole;
  tenantId?: string | null;
  next?: string | null;
  readOrganizationNames?: OrganizationNameReader;
}): Promise<OrganizationChoices> {
  const signedIn = await getSignedInAssignments();
  if (signedIn.kind !== "signed_in") return { kind: signedIn.kind };

  const choices = listAddressChoices({
    assignments: signedIn.assignments,
    roleClass: input.roleClass,
    ...(input.tenantId ? { tenantId: input.tenantId } : {}),
  });
  const tenantIds = [...new Set(choices.map((choice) => choice.tenantId))];
  const names =
    input.readOrganizationNames && tenantIds.length > 0
      ? await input.readOrganizationNames(tenantIds).catch(() => new Map())
      : new Map<string, string>();
  const path = choicePath(input.next);

  return {
    kind: "ok",
    organizations: tenantIds.map((tenantId) => ({
      tenantId,
      name: names.get(tenantId) ?? fallbackName(tenantId),
      options: choices
        .filter((choice) => choice.tenantId === tenantId)
        .map((choice) => ({
          subRole: choice.subRole,
          href: withTenantAddress(choice.prefix, path),
        })),
    })),
  };
}
