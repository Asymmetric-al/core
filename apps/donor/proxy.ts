import { createAuthMiddleware } from "@asym/auth/middleware";

export const proxy = createAuthMiddleware({
  publicRoutes: [
    "/",
    "/about",
    "/auth/callback",
    "/faq",
    "/financials",
    "/register",
    "/ways-to-give",
    "/workers",
    "/checkout",
    "/sign",
    "/api/auth/demo-account",
    "/sitemap.xml",
    "/robots.txt",
  ],
  loginPath: "/login",
  redirectAuthenticatedTo: "/donor-dashboard",
  unauthorizedRedirectTo: "/",
  allowedRoles: ["donor", "super_admin"],
});

export const config = {
  matcher: [
    "/auth/callback",
    "/login",
    "/register",
    "/donor-dashboard/:path*",
    "/api/:path*",
  ],
};
