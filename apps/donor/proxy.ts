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
  protectedRoutePrefixes: ["/donor-dashboard", "/checkout"],
  unauthenticatedRedirects: [
    {
      prefix: "/checkout",
      redirectTo: "/",
      preserveNext: false,
    },
  ],
  loginPath: "/login",
  redirectAuthenticatedTo: "/donor-dashboard",
  unauthorizedRedirectTo: "/",
  allowedRoles: ["donor", "super_admin"],
  resolveUserRole: resolveUserRoleFromDatabase,
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|_next/data|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|webmanifest|json|txt|xml)$).*)",
  ],
};
