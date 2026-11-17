import { createAuthMiddleware } from "@asym/auth/middleware";
import { resolveUserRoleFromDatabase } from "@asym/auth/resolve-user-role";

export const proxy = createAuthMiddleware({
  publicRoutes: [
    "/",
    "/about",
    "/auth/callback",
    "/faq",
    "/financials",
    "/register",
    "/forgot-password",
    "/ways-to-give",
    "/workers",
    "/sign",
    "/api/auth/demo-account",
    "/sitemap.xml",
    "/robots.txt",
    "/no-access",
    "/boneyard",
  ],
  // Checkout needs a signed-in donor, so signed-out visitors go to sign-in
  // with the gift kept in `next` and come straight back to it. They never
  // reach the payment UI or the donate API first.
  protectedRoutePrefixes: ["/donor-dashboard", "/checkout"],
  loginPath: "/login",
  redirectAuthenticatedTo: "/donor-dashboard",
  unauthorizedRedirectTo: "/",
  // The donor portal acts on the donor row (plan 5.1). Until WP3 resolves the
  // portal host, the tenant is the one of the person's one live donor
  // membership; a person with donor memberships in two tenants is refused.
  roleClass: "donor",
  allowedRoles: ["donor"],
  resolveUserRole: resolveUserRoleFromDatabase,
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|_next/data|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|webmanifest|json|txt|xml)$).*)",
  ],
};
