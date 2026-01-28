import { createAuthMiddleware } from "@asym/auth/middleware";

export const middleware = createAuthMiddleware({
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
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|webmanifest|json)$).*)",
  ],
};
