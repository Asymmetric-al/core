import { getDocumentScope } from "./document-scope";

/**
 * A key in browser storage for this document's person and tenant (plan 5.2,
 * "The browser data layer is scoped…": keys in browser storage carry the
 * person and the tenant; WP2b, AL-2675), or `null` when the document has no
 * scope. Read when each key is needed and never remembered. With `null`,
 * nothing is stored or read: browser storage outlives the document load that
 * switching organization performs, so a key without the scope would hand one
 * person's or organization's rows to the next page.
 */
export function documentStorageKey(base: string): string | null {
  const scope = getDocumentScope();
  return scope ? `${base}::${scope.userId}::${scope.tenantId}` : null;
}
