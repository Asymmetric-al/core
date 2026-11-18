/**
 * The two request headers that name what a request acts under (plan 5.1,
 * 5.2; AL-2675), owned here because every sender sits in or above this
 * package: the own-API fetch wrapper, the browser client and the server's
 * session clients. `@asym/auth/request-headers` re-exports them with the
 * rules for who may set each.
 *
 * - `x-asym-tenant`: the tenant.
 * - `x-asym-assignment`: the membership row (`authz.memberships.id`).
 *
 * Both only narrow: the server resolver and, from the second release of
 * WP2b, the database accept them only where the caller holds that live row.
 */
export const TENANT_HEADER = "x-asym-tenant";
export const ASSIGNMENT_HEADER = "x-asym-assignment";

/** What a request acts under: a tenant and one membership row in it. */
export interface RequestScope {
  readonly tenantId: string;
  readonly assignmentId: string;
}

/** Sets both headers from `scope`, or removes both when there is none. */
export function applyRequestScopeHeaders(
  headers: Headers,
  scope: RequestScope | null,
): Headers {
  headers.delete(TENANT_HEADER);
  headers.delete(ASSIGNMENT_HEADER);
  if (scope) {
    headers.set(TENANT_HEADER, scope.tenantId);
    headers.set(ASSIGNMENT_HEADER, scope.assignmentId);
  }
  return headers;
}

/** Both headers as a plain record, for clients that take one. */
export function requestScopeHeaders(
  scope: RequestScope | null,
): Record<string, string> {
  return scope
    ? {
        [TENANT_HEADER]: scope.tenantId,
        [ASSIGNMENT_HEADER]: scope.assignmentId,
      }
    : {};
}
