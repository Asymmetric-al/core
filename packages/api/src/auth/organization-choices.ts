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
 *
 * Each organization is named from `public.current_user_organizations()`,
 * which the signed-in read returns on the person's own token and which names
 * only tenants they hold a live row in (D-26). A failed read of the names
 * makes the whole read unavailable. An organization the names leave out, as
 * an E2E bypass identity's are, is named by a short form of its id.
 */
export interface WebStudioOrganizationChoice {
  tenantId: string;
  name: string;
  /** The staff rows there; `subRole` only where the person holds several. */
  options: Array<{ subRole: StaffSubrole | null; assignmentId: string }>;
}

export type WebStudioOrganizationChoices =
  | { kind: "ok"; organizations: WebStudioOrganizationChoice[] }
  | { kind: "signed_out" }
  | { kind: "unavailable" };

/**
 * The options of the organization choice inside Web Studio (plan 5.2;
 * AL-2675, WP2b slice C): each live staff row the signed-in person holds,
 * grouped by organization and named as `loadOrganizationChoices` names them.
 * Web Studio keeps its organization in a signed cookie rather than the page
 * address, so an option names the membership row; the server action that
 * sets the cookie checks it against the person's live rows again.
 */
export async function loadWebStudioOrganizationChoices(): Promise<WebStudioOrganizationChoices> {
  const signedIn = await getSignedInAssignments();
  if (signedIn.kind !== "signed_in") return { kind: signedIn.kind };

  const choices = listAddressChoices({
    assignments: signedIn.assignments,
    roleClass: "staff",
  });
  const tenantIds = [...new Set(choices.map((choice) => choice.tenantId))];
  return {
    kind: "ok",
    organizations: tenantIds.map((tenantId) => {
      const rows = choices.filter((choice) => choice.tenantId === tenantId);
      return {
        tenantId,
        name:
          signedIn.organizationNames.get(tenantId) ?? fallbackName(tenantId),
        options: rows.map((choice) => ({
          subRole: rows.length > 1 ? choice.subRole : null,
          assignmentId: choice.assignmentId,
        })),
      };
    }),
  };
}

export async function loadOrganizationChoices(input: {
  roleClass: MembershipRole;
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
