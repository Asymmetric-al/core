import { createAuthMiddleware } from "@asym/auth/middleware";

export const proxy = createAuthMiddleware({
  publicRoutes: [
    "/auth/callback",
    "/login",
    "/register",
    "/api/auth/demo-account",
    "/api/cms/public",
    "/api/health",
    "/sitemap.xml",
    "/robots.txt",
  ],
  loginPath: "/login",
  redirectAuthenticatedTo: "/",
  unauthorizedRedirectTo: "/login",
  allowedRoles: ["staff", "admin", "super_admin"],
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|webmanifest|json)$).*)",
  ],
};
