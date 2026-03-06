import { createAuthMiddleware } from "@asym/auth/middleware";

export const proxy = createAuthMiddleware({
  publicRoutes: [
    "/auth/callback",
    "/login",
    "/register",
    "/api/auth/demo-account",
    "/api/health",
    "/sitemap.xml",
    "/robots.txt",
  ],
  protectedRoutes: ["/donor-dashboard", "/api"],
  loginPath: "/login",
  redirectAuthenticatedTo: "/donor-dashboard",
  unauthorizedRedirectTo: "/",
  allowedRoles: ["donor", "super_admin"],
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|webmanifest|json)$).*)",
  ],
};
