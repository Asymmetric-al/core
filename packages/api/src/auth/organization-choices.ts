import "server-only";

import { getSignedInAssignments } from "@asym/auth/context";
import { safeNextParam } from "@asym/auth/demo-login";
import {
  CHOOSER_PATH,
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
  /** The read failed; `retryHref` is the chooser again, for the same choice. */
  | { kind: "unavailable"; retryHref: string };

/**
 * The chooser's own address with the same tenant and next page. The path is
 * fixed and the values are query parameters, so no `next` value can turn it
 * into another address; the chooser checks `next` again when it reads it.
 */
function chooserRetryHref(input: {
  tenantId?: string | null;
  next?: string | null;
}): string {
  const query = new URLSearchParams();
  if (input.tenantId) query.set("tenant", input.tenantId);
  if (input.next) query.set("next", input.next);
  const search = query.toString();
  return search ? `${CHOOSER_PATH}?${search}` : CHOOSER_PATH;
}

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
  // What is left once the prefix is gone is an address of its own, so it
  // passes the same check again before any href is built from it (council
  // round 1, A1).
  return safeNextParam(`${pathname}${url.search}${url.hash}`) ?? "/";
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
 *
 * Each organization is named from `public.current_user_organizations()`,
 * which the signed-in read returns on the person's own token and which names
 * only tenants they hold a live row in (D-26). A failed read of the names
 * makes the whole read unavailable. An organization the names leave out, as
 * an E2E bypass identity's are, is named by a short form of its id.
 */
export async function loadOrganizationChoices(input: {
  roleClass: MembershipRole;
  tenantId?: string | null;
  next?: string | null;
}): Promise<OrganizationChoices> {
  const signedIn = await getSignedInAssignments();
  if (signedIn.kind === "unavailable") {
    return { kind: "unavailable", retryHref: chooserRetryHref(input) };
  }
  if (signedIn.kind !== "signed_in") return { kind: signedIn.kind };

  const choices = listAddressChoices({
    assignments: signedIn.assignments,
    roleClass: input.roleClass,
    ...(input.tenantId ? { tenantId: input.tenantId } : {}),
  });
  const tenantIds = [...new Set(choices.map((choice) => choice.tenantId))];
  const names = signedIn.organizationNames;
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
