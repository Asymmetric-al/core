import "server-only";

import { getSignedInAssignments } from "@asym/auth/context";
import { safeNextParam } from "@asym/auth/demo-login";
import { listAddressChoices } from "@asym/auth/principal";
import {
  isOutsideTenantSegment,
  stripTenantAddress,
  withTenantAddress,
} from "@asym/auth/tenant-address";
import { getAdminClient } from "@asym/database/supabase/admin";

import type { RoleClass } from "@asym/auth/principal";
import type { StaffSubrole } from "@asym/database/types";

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

/** Display names of the person's organizations; signed-in users cannot read `tenants`. */
async function readOrganizationNames(
  tenantIds: string[],
): Promise<Map<string, string>> {
  const admin = getAdminClient().client;
  if (!admin || tenantIds.length === 0) return new Map();
  const { data, error } = await admin
    .from("tenants")
    .select("id, name")
    .in("id", tenantIds);
  if (error || !data) return new Map();
  return new Map(
    (data as Array<{ id: string; name: string | null }>).flatMap((tenant) =>
      tenant.name?.trim() ? [[tenant.id, tenant.name.trim()] as const] : [],
    ),
  );
}

function fallbackName(tenantId: string) {
  return `Organization ${tenantId.slice(0, 8)}…${tenantId.slice(-4)}`;
}

/**
 * The organization and assignment chooser's options (plan 5.2; AL-2675):
 * each live row of the surface's class the signed-in person holds,
 * optionally in one tenant, grouped by organization. Choosing one loads its
 * address as a new document, where the proxy makes its membership decision
 * again, so nothing here authorizes. Organization names are read with the
 * service role for the person's own tenants only, as the Mission Control
 * shell reads its tenant's name.
 */
export async function loadOrganizationChoices(input: {
  roleClass: RoleClass;
  tenantId?: string | null;
  next?: string | null;
}): Promise<OrganizationChoices> {
  const signedIn = await getSignedInAssignments();
  if (signedIn.kind !== "signed_in") return { kind: signedIn.kind };

  const choices = listAddressChoices({
    assignments: signedIn.assignments,
    roleClass: input.roleClass,
    ...(input.tenantId ? { tenantId: input.tenantId } : {}),
  });
  const tenantIds = [...new Set(choices.map((choice) => choice.tenantId))];
  const names = await readOrganizationNames(tenantIds);
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
