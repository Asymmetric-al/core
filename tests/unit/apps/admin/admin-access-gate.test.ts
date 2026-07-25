import { beforeEach, describe, expect, it, vi } from "vitest";

/**
 * `requireAdminAccess` is the ONLY role gate in the admin app: `apps/admin/proxy.ts`
 * passes `allowedRoles`, but `packages/auth/middleware.ts` consults that list only
 * inside the E2E-bypass branch, so a real Supabase session is authenticated and
 * never role-checked. These cases stand in for the exposure the gate prevents —
 * an authenticated donor or missionary reaching Mission Control or the Payload
 * admin at `/web-studio`.
 */

const getAuthContextMock = vi.hoisted(() => vi.fn());

vi.mock("@asym/auth/context", () => ({
  getAuthContext: getAuthContextMock,
  hasAnyContextRole: (
    context: { role?: string | null; profileRole?: string | null },
    roles: string[],
  ) =>
    roles.includes(context?.role ?? "") ||
    roles.includes(context?.profileRole ?? ""),
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
      profileRole: "donor",
    });

    expect(await expectRedirect("/web-studio")).toBe("/no-access");
  });

  it("sends an authenticated missionary to /no-access", async () => {
    getAuthContextMock.mockResolvedValue({
      isAuthenticated: true,
      userId: "user_missionary",
      tenantId: "tenant_1",
      role: "missionary",
      profileRole: "missionary",
    });

    expect(await expectRedirect("/crm")).toBe("/no-access");
  });

  it("sends a staff user with no tenant to /no-access", async () => {
    getAuthContextMock.mockResolvedValue({
      isAuthenticated: true,
      userId: "user_staff",
      tenantId: null,
      role: "staff",
      profileRole: "staff",
    });

    expect(await expectRedirect("/")).toBe("/no-access");
  });

  it.each(["staff", "admin", "super_admin"])(
    "admits a %s user with a tenant",
    async (role) => {
      getAuthContextMock.mockResolvedValue({
        isAuthenticated: true,
        userId: "user_1",
        tenantId: "tenant_1",
        role,
        profileRole: role,
      });

      await expect(requireAdminAccess("/crm")).resolves.toMatchObject({
        tenantId: "tenant_1",
        userId: "user_1",
      });
    },
  );
});
