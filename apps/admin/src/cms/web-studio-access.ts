import { getSignedInAssignments } from "@asym/auth/context";
import {
  isNameGenerationRefused,
  isNameTenantRefused,
  nameTenantIdOf,
} from "@asym/auth/request-headers";
import { buildTenantPrefix } from "@asym/auth/tenant-address";
import {
  listAddressChoices,
  listNameAddressChoices,
} from "@asym/auth/tenant-address-decisions";
import {
  readServerNameGeneration,
  readServerNameTenantState,
  redirectInTenant,
} from "@asym/auth/tenant-server";
import {
  decideWebStudioAccess,
  WEB_STUDIO_CHOOSER_PATH,
  WEB_STUDIO_REFUSED_PARAM,
  WEB_STUDIO_ROLE_CLASS,
  WEB_STUDIO_TENANT_COOKIE,
} from "@asym/auth/web-studio";
import { cookies } from "next/headers";
import { cache } from "react";

import { readWebStudioTenantCookie } from "./web-studio-tenant-cookie";

import type { DocumentScope } from "@asym/database/document-scope";

export interface WebStudioOrganization {
  /** The organization's name, as its own members see it (D-26). */
  name: string;
  /** Whether the person holds staff rows in more than one place to switch to. */
  canSwitch: boolean;
  /**
   * The selected row's home in Mission Control, under the tenant address the
   * proxy admits it at (`/<tenant>`, or `/<tenant>~<sub-role>` for a person
   * with several staff rows there). The way back from Web Studio goes there,
   * not to `/`, which sends a person in two organizations to the chooser
   * (council on the joined release, JC3).
   */
  missionControlHref: string;
}

/**
 * The row the Web Studio cookie selects now, for a server function of
 * Payload's (council on the joined release, JC2), or why there is none: no
 * session, or no usable choice (none made, one the person no longer holds,
 * rows that cannot be read).
 */
export type WebStudioSelectionState =
  | {
      kind: "selected";
      tenantId: string;
      assignmentId: string;
      generation?: number;
    }
  | { kind: "signed_out" }
  | { kind: "none" }
  /** The person's rows, or their organizations' names, could not be read (L3). */
  | { kind: "unavailable" };

export interface WebStudioAccess {
  /** What the document was rendered for; Web Studio's REST calls send it back. */
  scope: DocumentScope;
  organization: WebStudioOrganization;
}

function fallbackName(tenantId: string) {
  return `Organization ${tenantId.slice(0, 8)}…${tenantId.slice(-4)}`;
}

/**
 * The person's live rows and the cookie's decision, read once per request:
 * the layout and the page both ask (council C1), and they must agree.
 */
const decideWebStudioRequest = cache(async () => {
  const signedIn = await getSignedInAssignments();
  if (signedIn.kind !== "signed_in") {
    return { signedIn, decision: null, nameTenantId: null, generation: null };
  }
  const name = await readServerNameTenantState();
  const nameTenantId = nameTenantIdOf(name);
  const nameGeneration = await readServerNameGeneration();
  if (
    isNameTenantRefused(name) ||
    isNameGenerationRefused(name, nameGeneration)
  ) {
    return {
      signedIn,
      decision: { kind: "refuse" } as const,
      nameTenantId,
      generation: null,
    };
  }
  const generation =
    nameGeneration.kind === "valid" ? nameGeneration.generation : null;
  const cookie = await readWebStudioTenantCookie(
    (await cookies()).get(WEB_STUDIO_TENANT_COOKIE)?.value,
  );
  const decision = decideWebStudioAccess({
    assignments: signedIn.assignments,
    cookie,
    nameTenantId,
  });
  return { signedIn, decision, nameTenantId, generation };
});

/**
 * The gate of every Web Studio render (plan 5.2, "One stated exception: Web
 * Studio"; AL-2675): the Payload layout on a document load, and each page on
 * every render, a client navigation included, since a layout does not render
 * again then (council C1). The organization is the one the signed Web Studio cookie selects,
 * judged by the principal resolver's rule against the person's live staff
 * rows, read on their own token: a person with one staff row needs no choice,
 * a person with several and no usable selection goes to the Web Studio
 * chooser, a person with none is refused. A cookie that names a row the
 * person does not hold live selects nothing; nothing falls back to a
 * profile's tenant, a first membership or another surface's address.
 *
 * The scope it returns is rendered as the page's document scope. Web Studio
 * lives outside the tenant segment, so the scope's address prefix is empty:
 * no link in Web Studio is prefixed.
 */
export async function requireWebStudioAccess(
  pathname: string,
): Promise<WebStudioAccess> {
  const { signedIn, decision, nameTenantId, generation } =
    await decideWebStudioRequest();
  // Slice A's tenant-safe redirect: Web Studio's addresses carry no tenant
  // prefix, so each one is sent unchanged.
  if (signedIn.kind === "signed_out") {
    return redirectInTenant(`/login?next=${encodeURIComponent(pathname)}`);
  }
  if (signedIn.kind === "unavailable" || decision === null) {
    return redirectInTenant("/no-access");
  }

  if (decision.kind === "choose") {
    return redirectInTenant(
      `${WEB_STUDIO_CHOOSER_PATH}?next=${encodeURIComponent(pathname)}${
        decision.refused ? `&${WEB_STUDIO_REFUSED_PARAM}=1` : ""
      }`,
    );
  }
  if (decision.kind === "refuse") {
    return redirectInTenant("/no-access");
  }

  const { assignment } = decision;
  const staffRows = signedIn.assignments.filter(
    (row) =>
      row.membershipRole === WEB_STUDIO_ROLE_CLASS &&
      (nameTenantId === null || row.tenantId === nameTenantId),
  );
  // The address Mission Control's chooser would give this row.
  const home =
    nameTenantId === null
      ? (listAddressChoices({
          assignments: signedIn.assignments,
          roleClass: WEB_STUDIO_ROLE_CLASS,
          tenantId: assignment.tenantId,
        }).find((choice) => choice.assignmentId === assignment.assignmentId)
          ?.prefix ?? buildTenantPrefix(assignment.tenantId, null))
      : listNameAddressChoices({
          assignments: signedIn.assignments,
          roleClass: WEB_STUDIO_ROLE_CLASS,
          nameTenantId,
        }).find((choice) => choice.assignmentId === assignment.assignmentId)
          ?.prefix || "/";
  return {
    scope: {
      userId: signedIn.userId,
      tenantId: assignment.tenantId,
      assignmentId: assignment.assignmentId,
      addressPrefix: "",
      ...(generation === null ? {} : { generation }),
    },
    organization: {
      name:
        signedIn.organizationNames.get(assignment.tenantId) ??
        fallbackName(assignment.tenantId),
      canSwitch: staffRows.length > 1,
      missionControlHref: home,
    },
  };
}

/**
 * The row the Web Studio cookie selects now, judged as the gate judges it:
 * what a server function of Payload's must have been rendered for (council
 * on the joined release, JC2).
 */
export async function readWebStudioSelection(): Promise<WebStudioSelectionState> {
  const { signedIn, decision, generation } = await decideWebStudioRequest();
  if (signedIn.kind === "signed_out") return { kind: "signed_out" };
  if (signedIn.kind === "unavailable") return { kind: "unavailable" };
  if (decision?.kind !== "allow") return { kind: "none" };
  return {
    kind: "selected",
    tenantId: decision.assignment.tenantId,
    assignmentId: decision.assignment.assignmentId,
    ...(generation === null ? {} : { generation }),
  };
}
