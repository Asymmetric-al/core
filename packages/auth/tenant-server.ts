import { headers } from "next/headers";
import { permanentRedirect, redirect } from "next/navigation";

import { ADDRESS_PREFIX_HEADER } from "./request-headers";
import { parseTenantAddress, withTenantAddress } from "./tenant-address";

import type { AuthContext } from "./context";
import type { DocumentScope } from "@asym/database/document-scope";

/**
 * Server side of the tenant in the page address (plan 5.2; AL-2675). The
 * proxy sets the address prefix as a request header only after its
 * membership decision, and deletes any copy a client sent.
 */

/**
 * The prefix the proxy admitted this page request under, or `null`. Only a
 * value that is exactly a prefix (`/<tenant>` or `/<tenant>~<sub-role>`, with
 * nothing after it) is one (council round 1, A3).
 */
export async function readAddressPrefix(): Promise<string | null> {
  const prefix = (await headers()).get(ADDRESS_PREFIX_HEADER);
  return prefix && parseTenantAddress(prefix)?.prefix === prefix
    ? prefix
    : null;
}

/**
 * The document scope for a signed-in layout to hand to `TenantDocument`:
 * the person and the assignment `getAuthContext` resolved from the proxy's
 * tenant and assignment headers, and the address prefix. `null` for a
 * request without a tenant address. A resolution that disagrees with the
 * address throws: rendering would show one tenant's page under another's
 * address.
 */
export async function readDocumentScope(
  auth: AuthContext,
): Promise<DocumentScope | null> {
  const addressPrefix = await readAddressPrefix();
  if (!addressPrefix) return null;
  const { tenantId, subRole } = parseTenantAddress(addressPrefix)!;
  const { assignment } = auth;
  if (
    !auth.isAuthenticated ||
    !auth.userId ||
    !assignment ||
    assignment.tenantId !== tenantId ||
    auth.tenantId !== tenantId ||
    // A suffix names the staff row the page acts under; the resolved row
    // must be that one (council round 1, A3).
    (subRole !== null && assignment.staffRole !== subRole)
  ) {
    throw new Error(
      `The resolved assignment does not match the page address "${addressPrefix}".`,
    );
  }
  return {
    userId: auth.userId,
    tenantId,
    assignmentId: assignment.assignmentId,
    addressPrefix,
  };
}

/** An internal page address with this request's tenant prefix, for server code. */
export async function tenantHref(path: string): Promise<string> {
  return withTenantAddress(await readAddressPrefix(), path);
}

/**
 * `redirect()` that keeps the document's tenant prefix. A page renders for
 * `/<tenant>/<page>`, but a bare `redirect("/<other-page>")` would send the
 * browser to an address with no tenant.
 */
export async function redirectInTenant(path: string): Promise<never> {
  redirect(await tenantHref(path));
}

/** `permanentRedirect()` that keeps the document's tenant prefix. */
export async function permanentRedirectInTenant(path: string): Promise<never> {
  permanentRedirect(await tenantHref(path));
}
