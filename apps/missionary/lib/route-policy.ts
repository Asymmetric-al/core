/**
 * Public routes consumed by the missionary proxy, including descendants. Each
 * lies outside the tenant segment (OUTSIDE_TENANT_SEGMENT_ROOTS, the one
 * list; the proxy refuses to build otherwise). The workspace has no public
 * site pages (about, FAQ, financials, giving, workers, checkout) and no
 * signing page, and the matcher never runs on a root file such as
 * /robots.txt, so those entries went (council round 1, A13).
 */
export const MISSIONARY_PUBLIC_ROUTES = [
  "/auth/callback",
  "/register",
  "/forgot-password",
  "/api/auth/demo-account",
  "/no-access",
  "/boneyard",
] as const;

// Keep the streamed role gate's existing early-return policy distinct from
// the proxy policy. Extracting the lists must not change either auth boundary.
const MISSIONARY_ROLE_GATE_PUBLIC_PREFIXES = [
  "/login",
  "/register",
  "/auth/callback",
  "/forgot-password",
  "/no-access",
  // The chooser lists the person's own rows before one is selected, so the
  // role gate, which needs a selected row, does not apply there (AL-2675).
  "/choose-organization",
  "/api/",
  "/boneyard/",
] as const;

export function isMissionaryRoleGatePublicPath(pathname: string) {
  return MISSIONARY_ROLE_GATE_PUBLIC_PREFIXES.some((prefix) =>
    prefix.endsWith("/")
      ? pathname.startsWith(prefix)
      : pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

/** UI scope only: authentication and role enforcement remain in the proxy. */
export function isMissionaryWorkspacePath(pathname: string) {
  return (
    !isMissionaryRoleGatePublicPath(pathname) &&
    !MISSIONARY_PUBLIC_ROUTES.some(
      (route) => pathname === route || pathname.startsWith(`${route}/`),
    )
  );
}
