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

/**
 * The response header by which the server says it refused the tenant or
 * assignment a request proposed: the resolver's own refusal, not any other
 * 401 or 403. The own-API wrapper and the browser client retire the document
 * on it (plan 5.2; AL-2675, JB1). Its value is the resolver's reason.
 */
export const SCOPE_REFUSED_HEADER = "x-asym-scope-refused";

/**
 * The reason the browser gives, in `x-asym-scope-refused`, for a request it
 * refused itself: the document's scope is retired (JB1), so the request was
 * never sent (check of the fix lists, JR1).
 */
export const RETIRED_SCOPE_REASON = "retired";

/**
 * The answer to a request from a document whose scope is retired, made in
 * the browser and never sent: the 401 marked `x-asym-scope-refused` that the
 * server gives a refused scope, with `body` in the shape the caller reads
 * errors in. A request with no scope would be resolved to the signed-in
 * person's only row, so a delayed save or a poll of a document rendered for
 * one person would otherwise run as the next, in the next person's
 * organization (JR1).
 */
export function retiredScopeResponse(body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status: 401,
    statusText: "Unauthorized",
    headers: {
      "content-type": "application/json",
      [SCOPE_REFUSED_HEADER]: RETIRED_SCOPE_REASON,
    },
  });
}

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
