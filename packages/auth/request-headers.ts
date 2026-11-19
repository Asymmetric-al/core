import type { RoleClass } from "./principal/types";

/**
 * Request headers that carry the assignment context (plan 5.1, 5.2).
 *
 * - `x-asym-role-class`: the surface's role class. Each app's proxy sets it on
 *   every request it passes on, overwriting any value the client sent, from
 *   its own configuration: staff for Mission Control and Web Studio,
 *   missionary for the missionary workspace, donor for the donor portal. The
 *   proxies run on every page and on every `/api` path whatever its
 *   extension (their matchers skip only Next.js assets and static files), so
 *   no route reads a class the client chose.
 * - `x-asym-assignment`: the membership row the request acts under, when the
 *   person chose one. The resolver accepts it only as a proposal and checks it
 *   against the caller's live rows; the database reads the same header
 *   (`tenant_guard.request_assignment_id()`). WP2b sends it.
 */
export const ROLE_CLASS_HEADER = "x-asym-role-class";
export const ASSIGNMENT_HEADER = "x-asym-assignment";

const ROLE_CLASSES: readonly RoleClass[] = ["donor", "missionary", "staff"];

export function parseRoleClass(value: string | null | undefined) {
  const normalized = value?.trim().toLowerCase();
  return ROLE_CLASSES.find((roleClass) => roleClass === normalized) ?? null;
}
