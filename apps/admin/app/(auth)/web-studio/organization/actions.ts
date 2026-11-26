"use server";

import { getSignedInAssignments } from "@asym/auth/context";
import {
  isNameTenantRefused,
  nameTenantIdOf,
} from "@asym/auth/request-headers";
import {
  readServerNameTenantState,
  redirectFromActionInTenant,
} from "@asym/auth/tenant-server";
import {
  decideWebStudioAccess,
  safeWebStudioNext,
  webStudioChooserAddress,
} from "@asym/auth/web-studio";
import { withAppBasePath } from "@asym/database/document-reload";
import { cookies, headers } from "next/headers";

import type { OrganizationChoiceLoad } from "@asym/ui/components/auth/organization-choice-form";

import { webStudioTenantCookie } from "@/src/cms/web-studio-tenant-cookie";

/**
 * Sets the organization Web Studio works in (plan 5.2; AL-2675, WP2b slice
 * C). The posted tenant and row are judged against the person's live staff
 * rows, read on their own token, before the signed cookie is set; a choice
 * they do not hold sets nothing and returns to the chooser, which says so.
 * Next.js checks a server action's origin against the host, so another site
 * cannot post a choice. The cookie is scoped to `/web-studio` and only
 * narrows: every later request checks it against live rows again.
 */
export async function chooseWebStudioOrganization(
  formData: FormData,
): Promise<never> {
  return redirectFromActionInTenant(await setChosenOrganization(formData));
}

export async function chooseWebStudioOrganizationToLoad(
  _state: OrganizationChoiceLoad,
  formData: FormData,
): Promise<OrganizationChoiceLoad> {
  const next = await setChosenOrganization(formData);
  if ((await headers()).has("next-action")) {
    return { load: withAppBasePath(next) };
  }
  return redirectFromActionInTenant(next);
}

async function setChosenOrganization(formData: FormData): Promise<string> {
  const next = safeWebStudioNext(String(formData.get("next") ?? ""));
  const signedIn = await getSignedInAssignments();
  if (signedIn.kind === "signed_out") {
    // Back to this choice, and then to the page, once signed in.
    return redirectFromActionInTenant(
      `/login?next=${encodeURIComponent(webStudioChooserAddress(next))}`,
    );
  }
  const name = await readServerNameTenantState();
  if (signedIn.kind === "unavailable" || isNameTenantRefused(name)) {
    return redirectFromActionInTenant("/no-access");
  }

  const decision = decideWebStudioAccess({
    nameTenantId: nameTenantIdOf(name),
    assignments: signedIn.assignments,
    cookie: {
      kind: "selected",
      selection: {
        tenantId: String(formData.get("tenant") ?? ""),
        assignmentId: String(formData.get("assignment") ?? ""),
      },
    },
  });
  if (decision.kind !== "allow") {
    return redirectFromActionInTenant(
      webStudioChooserAddress(next, { refused: true }),
    );
  }

  (await cookies()).set(
    await webStudioTenantCookie({
      tenantId: decision.assignment.tenantId,
      assignmentId: decision.assignment.assignmentId,
    }),
  );
  return next;
}
