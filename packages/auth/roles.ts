export const APP_ROLES = [
  "admin",
  "missionary",
  "donor",
  "delivery",
  "ticketing",
  "machinery",
] as const;

export type AppRole = (typeof APP_ROLES)[number];

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

export function routeForRole(role: string | null | undefined): string | null {
  if (!role) return null;
  const normalized = role.trim().toLowerCase();
  const appRole = ROLE_ROUTE_ALIASES[normalized];
  return appRole ? defaultRouteForRole(appRole) : null;
}
