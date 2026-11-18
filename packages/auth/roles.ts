/**
 * Canonical role identifiers used by portal routing.
 *
 * Keep this list centralized so route decisions are deterministic across apps,
 * middleware, and route handlers.
 */
export const APP_ROLES = [
  "admin",
  "missionary",
  "donor",
  "delivery",
  "ticketing",
  "machinery",
] as const;

export type AppRole = (typeof APP_ROLES)[number];

/**
 * Role -> default in-app home route mapping.
 *
 * Security note: routing decisions based on this map are UX-only. Access
 * control is enforced server-side by middleware/layout checks + database RLS.
 */
export const ROLE_HOME: Record<AppRole, string> = {
  admin: "/",
  missionary: "/",
  donor: "/donor-dashboard",
  delivery: "/",
  ticketing: "/",
  machinery: "/",
};

const ROLE_ROUTE_ALIASES: Record<string, AppRole> = {
  admin: "admin",
  super_admin: "admin",
  staff: "admin",
  missionary: "missionary",
  donor: "donor",
  delivery: "delivery",
  ticketing: "ticketing",
  machinery: "machinery",
};

export function isAppRole(value: string): value is AppRole {
  return APP_ROLES.includes(value as AppRole);
}

export function defaultRouteForRole(role: AppRole): string {
  return ROLE_HOME[role];
}

/**
 * Resolve a role or membership-class name to a known portal home route.
 * UX only: access is enforced by the proxies, layouts and RLS. Since AL-2675
 * the sign-in callback passes the class of a live membership, never
 * `profiles.role`.
 */
export function routeForRole(role: string | null | undefined): string | null {
  if (!role) return null;
  const normalized = role.trim().toLowerCase();
  const appRole = ROLE_ROUTE_ALIASES[normalized];
  return appRole ? defaultRouteForRole(appRole) : null;
}
