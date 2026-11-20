"use server";

import { getSignedInAssignments } from "@asym/auth/context";
import { redirectInTenant } from "@asym/auth/tenant-server";
import {
  decideWebStudioAccess,
  safeWebStudioNext,
  webStudioChooserAddress,
} from "@asym/auth/web-studio";
import { cookies } from "next/headers";

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
  const next = safeWebStudioNext(String(formData.get("next") ?? ""));
  const signedIn = await getSignedInAssignments();
  if (signedIn.kind === "signed_out") {
    // Back to this choice, and then to the page, once signed in.
    return redirectInTenant(
      `/login?next=${encodeURIComponent(webStudioChooserAddress(next))}`,
    );
  }
  if (signedIn.kind === "unavailable") {
    return redirectInTenant("/no-access");
  }

  const decision = decideWebStudioAccess({
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
    return redirectInTenant(webStudioChooserAddress(next, { refused: true }));
  }

  (await cookies()).set(
    await webStudioTenantCookie({
      tenantId: decision.assignment.tenantId,
      assignmentId: decision.assignment.assignmentId,
    }),
  );
  return redirectInTenant(next);
}
