import { beforeEach, describe, expect, it, vi } from "vitest";

import { createAuthMiddleware } from "../../../packages/auth/middleware";

function createRequest(pathname: string) {
  const nextUrl = new URL(`https://example.org${pathname}`);
  (nextUrl as URL & { clone: () => URL }).clone = () =>
    new URL(nextUrl.toString());

  return {
    nextUrl,
    cookies: {
      getAll: vi.fn(() => []),
      set: vi.fn(),
    },
  } as never;
}

describe("createAuthMiddleware", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("redirects unauthenticated page requests to login with next param", async () => {
    const middleware = createAuthMiddleware({
      publicRoutes: ["/", "/register", "/auth/callback"],
      loginPath: "/login",
      resolveSession: async () => ({ userId: null, role: null }),
    });

    const response = await middleware(createRequest("/reports?tab=open"));

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe(
      "https://example.org/login?next=%2Freports%3Ftab%3Dopen",
    );
  });

  it("returns 401 for unauthenticated protected API routes", async () => {
    const middleware = createAuthMiddleware({
      publicRoutes: ["/", "/register", "/auth/callback"],
      loginPath: "/login",
      resolveSession: async () => ({ userId: null, role: null }),
    });

    const response = await middleware(createRequest("/api/secure/tenants"));

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({ error: "Unauthorized" });
  });

  it("redirects authenticated users away from auth routes", async () => {
    const middleware = createAuthMiddleware({
      publicRoutes: ["/", "/register", "/auth/callback"],
      loginPath: "/login",
      redirectAuthenticatedTo: "/donor-dashboard",
      resolveSession: async () => ({ userId: "user_123", role: "donor" }),
    });

    const response = await middleware(createRequest("/login"));

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe(
      "https://example.org/donor-dashboard",
    );
  });

  it("rejects authenticated users with disallowed roles", async () => {
    const middleware = createAuthMiddleware({
      publicRoutes: ["/login", "/register", "/auth/callback"],
      loginPath: "/login",
      redirectAuthenticatedTo: "/",
      allowedRoles: ["staff", "admin", "super_admin"],
      resolveSession: async () => ({ userId: "user_123", role: "donor" }),
    });

    const response = await middleware(createRequest("/web-studio"));

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("https://example.org/");
  });

  it("permits authenticated users with allowed roles", async () => {
    const middleware = createAuthMiddleware({
      publicRoutes: ["/login", "/register", "/auth/callback"],
      loginPath: "/login",
      allowedRoles: ["staff", "admin", "super_admin"],
      resolveSession: async () => ({ userId: "user_123", role: "staff" }),
    });

    const response = await middleware(createRequest("/web-studio"));

    expect(response.status).toBe(200);
  });
});
