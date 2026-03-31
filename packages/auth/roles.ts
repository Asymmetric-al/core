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
 * Resolve an arbitrary profile role string to a known portal home route.
 *
 * Routing implication: callers can safely pass role values from `profiles.role`
 * without duplicating alias logic in multiple apps.
 */
export function routeForProfileRole(
  profileRole: string | null | undefined,
): string | null {
  if (!profileRole) return null;
  const normalized = profileRole.trim().toLowerCase();
  const role = ROLE_ROUTE_ALIASES[normalized];
  return role ? defaultRouteForRole(role) : null;
}
