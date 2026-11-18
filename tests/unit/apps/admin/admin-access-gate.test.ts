import { beforeEach, describe, expect, it, vi } from "vitest";

/**
 * `requireAdminAccess` is the admin app's in-app role gate. `apps/admin/proxy.ts`
 * also role-checks at the edge (`allowedRoles` with `resolveUserRole` in
 * `packages/auth/middleware.ts`); this layer still has to refuse on its own, and
 * it also requires a tenant. These cases stand in for the exposure the gate
 * prevents — an authenticated donor or missionary reaching Mission Control or
 * the Payload admin at `/web-studio`.
 */

const getAuthContextMock = vi.hoisted(() => vi.fn());

vi.mock("@asym/auth/context", () => ({
  getAuthContext: getAuthContextMock,
  hasAnyContextRole: (context: { role?: string | null }, roles: string[]) =>
    roles.includes(context?.role ?? ""),
}));

class RedirectError extends Error {
  constructor(public readonly target: string) {
    super(`NEXT_REDIRECT:${target}`);
  }
}

vi.mock("next/navigation", () => ({
  redirect: (target: string) => {
    throw new RedirectError(target);
  },
}));

// `redirectInTenant` reads the request's address prefix; these pages and
// gates have none, so it is the plain redirect (council round 1, A10).
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));

vi.mock("@asym/database/supabase/admin", () => ({
  getAdminClient: () => ({ client: null }),
}));

vi.mock("@asym/database/supabase/server", () => ({
  createClient: async () => ({}),
}));

vi.mock("@asym/lib/mission-control/bootstrap", () => ({
  createMCBootstrapState: (input: unknown) => input,
}));

const { requireAdminAccess } =
  await import("../../../../apps/admin/lib/admin-access");

async function expectRedirect(pathname: string) {
  try {
    await requireAdminAccess(pathname);
  } catch (error) {
    if (error instanceof RedirectError) {
      return error.target;
    }
    throw error;
  }
  throw new Error("expected requireAdminAccess to redirect, but it resolved");
}

describe("requireAdminAccess", () => {
  beforeEach(() => {
    getAuthContextMock.mockReset();
  });

  it("sends an unauthenticated visitor to login, preserving the requested path", async () => {
    getAuthContextMock.mockResolvedValue({
      isAuthenticated: false,
      userId: null,
      tenantId: null,
      role: null,
    });

    expect(await expectRedirect("/web-studio")).toBe(
      "/login?next=%2Fweb-studio",
    );
  });

  it("sends an authenticated donor to /no-access instead of the admin", async () => {
    getAuthContextMock.mockResolvedValue({
      isAuthenticated: true,
      userId: "user_donor",
      tenantId: "tenant_1",
      role: "donor",
    });

    expect(await expectRedirect("/web-studio")).toBe("/no-access");
  });

  it("sends an authenticated missionary to /no-access", async () => {
    getAuthContextMock.mockResolvedValue({
      isAuthenticated: true,
      userId: "user_missionary",
      tenantId: "tenant_1",
      role: "missionary",
    });

    expect(await expectRedirect("/crm")).toBe("/no-access");
  });

  it("sends a staff user with no tenant to /no-access", async () => {
    getAuthContextMock.mockResolvedValue({
      isAuthenticated: true,
      userId: "user_staff",
      tenantId: null,
      role: "staff",
    });

    expect(await expectRedirect("/")).toBe("/no-access");
  });

  it.each(["staff", "admin"])(
    "admits a %s user with a tenant, resolving the staff class",
    async (role) => {
      getAuthContextMock.mockResolvedValue({
        isAuthenticated: true,
        userId: "user_1",
        tenantId: "tenant_1",
        role,
      });

      await expect(requireAdminAccess("/crm")).resolves.toMatchObject({
        tenantId: "tenant_1",
        userId: "user_1",
      });
      // AL-2675: Mission Control acts on the caller's one staff row.
      expect(getAuthContextMock).toHaveBeenCalledWith(undefined, {
        roleClass: "staff",
      });
    },
  );

  it("refuses a super_admin role name: platform operators are not a membership role (AL-2675)", async () => {
    getAuthContextMock.mockResolvedValue({
      isAuthenticated: true,
      userId: "user_1",
      tenantId: "tenant_1",
      role: "super_admin",
    });

    expect(await expectRedirect("/crm")).toBe("/no-access");
  });
});
