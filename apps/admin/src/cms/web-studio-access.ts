import { getSignedInAssignments } from "@asym/auth/context";
import {
  decideWebStudioAccess,
  WEB_STUDIO_CHOOSER_PATH,
  WEB_STUDIO_ROLE_CLASS,
  WEB_STUDIO_TENANT_COOKIE,
} from "@asym/auth/web-studio";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { readWebStudioTenantCookie } from "./web-studio-tenant-cookie";

import type { DocumentScope } from "@asym/database/document-scope";

export interface WebStudioOrganization {
  /** The organization's name, as its own members see it (D-26). */
  name: string;
  /** Whether the person holds staff rows in more than one place to switch to. */
  canSwitch: boolean;
}

export interface WebStudioAccess {
  /** What the document was rendered for; Web Studio's REST calls send it back. */
  scope: DocumentScope;
  organization: WebStudioOrganization;
}

function fallbackName(tenantId: string) {
  return `Organization ${tenantId.slice(0, 8)}…${tenantId.slice(-4)}`;
}

/**
 * The Web Studio layout's gate (plan 5.2, "One stated exception: Web Studio";
 * AL-2675). The organization is the one the signed Web Studio cookie selects,
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
  const signedIn = await getSignedInAssignments();
  if (signedIn.kind === "signed_out") {
    redirect(`/login?next=${encodeURIComponent(pathname)}`);
  }
  if (signedIn.kind === "unavailable") {
    redirect("/no-access");
  }

  const cookie = await readWebStudioTenantCookie(
    (await cookies()).get(WEB_STUDIO_TENANT_COOKIE)?.value,
  );
  const decision = decideWebStudioAccess({
    assignments: signedIn.assignments,
    cookie,
  });
  if (decision.kind === "choose") {
    redirect(`${WEB_STUDIO_CHOOSER_PATH}?next=${encodeURIComponent(pathname)}`);
  }
  if (decision.kind === "refuse") {
    redirect("/no-access");
  }

  const { assignment } = decision;
  const staffRows = signedIn.assignments.filter(
    (row) => row.membershipRole === WEB_STUDIO_ROLE_CLASS,
  );
  return {
    scope: {
      userId: signedIn.userId,
      tenantId: assignment.tenantId,
      assignmentId: assignment.assignmentId,
      addressPrefix: "",
    },
    organization: {
      name:
        signedIn.organizationNames.get(assignment.tenantId) ??
        fallbackName(assignment.tenantId),
      canSwitch: staffRows.length > 1,
    },
  };
}
