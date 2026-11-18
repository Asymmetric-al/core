/**
 * The scope of one browser document (plan 5.2, "The browser data layer is
 * scoped to the person, the tenant and the selected assignment"; AL-2675).
 *
 * It is fixed when the page loads, from what the server decided for the page,
 * and never taken from the live address. Changing organization or assignment
 * is a full document load, so there is no scope to retire inside a page. The
 * own-API fetch wrapper, the browser client, the collections and the query
 * cache read the tenant and assignment from here; keys in browser storage
 * carry the person and the tenant.
 *
 * Signed-in pages of Mission Control and the missionary workspace take it
 * from the tenant in the page address, and the donor portal from the person's
 * one live donor membership until WP3. Pages outside every signed-in surface
 * (sign-in, the chooser, the public website) have none.
 *
 * This module holds the scope for code outside React and imports nothing from
 * React; `DocumentScopeProvider` in `./document-scope` fixes it.
 */
export interface DocumentScope {
  /** The signed-in person: their Supabase user id. */
  readonly userId: string;
  /** The tenant the document acts in; the `x-asym-tenant` header carries it. */
  readonly tenantId: string;
  /**
   * The membership row (`authz.memberships.id`) the document acts under; the
   * `x-asym-assignment` header carries it.
   */
  readonly assignmentId: string;
  /**
   * The page address prefix: `/<tenant>` or `/<tenant>~<sub-role>`. Empty for
   * a document whose scope its address does not carry (the donor portal).
   */
  readonly addressPrefix: string;
}

/** Browser only: the scope this document was loaded with, once fixed. */
let fixedScope: DocumentScope | null = null;

function sameScope(a: DocumentScope, b: DocumentScope): boolean {
  return (
    a.userId === b.userId &&
    a.tenantId === b.tenantId &&
    a.assignmentId === b.assignmentId &&
    a.addressPrefix === b.addressPrefix
  );
}

/**
 * Fixes `scope` as the document's on its first call in the browser. `false`
 * when the document already holds another scope. A no-op on the server,
 * where module state would be shared by every request.
 */
export function fixDocumentScope(scope: DocumentScope): boolean {
  if (typeof window === "undefined") return true;
  if (fixedScope === null) {
    fixedScope = Object.freeze({ ...scope });
    return true;
  }
  return sameScope(fixedScope, scope);
}

/**
 * The document's scope for code outside React, such as the browser client
 * and the fetch wrapper. Browser only: always `null` on the server, and
 * `null` until a signed-in page has rendered its provider.
 */
export function getDocumentScope(): DocumentScope | null {
  return typeof window === "undefined" ? null : fixedScope;
}

/**
 * A key in browser storage for this document's person and tenant (plan 5.2),
 * or `null` when the document has no scope: nothing is stored then, so one
 * person's or organization's data never reaches another's page.
 */
export function documentStorageKey(base: string): string | null {
  const scope = getDocumentScope();
  return scope ? `${base}::${scope.userId}::${scope.tenantId}` : null;
}
