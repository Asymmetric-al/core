/** Public routes consumed by the missionary proxy, including descendants. */
export const MISSIONARY_PUBLIC_ROUTES = [
  "/about",
  "/auth/callback",
  "/faq",
  "/financials",
  "/register",
  "/forgot-password",
  "/ways-to-give",
  "/workers",
  "/checkout",
  "/sign",
  "/api/auth/demo-account",
  "/sitemap.xml",
  "/robots.txt",
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
