import { beforeEach, describe, expect, it, vi } from "vitest";

import type * as AuthContextModule from "@asym/auth/context";

class RedirectSignal extends Error {
  constructor(readonly target: string) {
    super(`REDIRECT:${target}`);
  }
}

const mocks = vi.hoisted(() => ({
  getAuthContext: vi.fn(),
  redirectInTenant: vi.fn(),
  tenantHref: vi.fn(),
}));

vi.mock("@asym/auth/context", async (importOriginal) => ({
  ...(await importOriginal<typeof AuthContextModule>()),
  getAuthContext: mocks.getAuthContext,
}));

vi.mock("@asym/auth/tenant-server", () => ({
  redirectInTenant: mocks.redirectInTenant,
  tenantHref: mocks.tenantHref,
}));

vi.mock("../../../../../apps/admin/app/(app)/settings/eve/page-client", () => ({
  default: () => null,
}));

import EvePage from "../../../../../apps/admin/app/(app)/settings/eve/page";

const TENANT_PREFIX = "/00000000-0000-0000-0000-000000000001";

beforeEach(() => {
  vi.clearAllMocks();
  mocks.tenantHref.mockImplementation(
    async (path: string) => `${TENANT_PREFIX}${path}`,
  );
  mocks.redirectInTenant.mockImplementation(async (target: string) => {
    throw new RedirectSignal(target);
  });
});

describe("Eve operations page gate", () => {
  it("redirects a signed-out visitor to /login with the tenant /settings/eve next target", async () => {
    mocks.getAuthContext.mockResolvedValue({
      isAuthenticated: false,
      userId: null,
      email: null,
      profileId: null,
      role: null,
      tenantId: null,
      memberships: [],
    });

    await expect(EvePage()).rejects.toThrow(RedirectSignal);
    expect(mocks.tenantHref).toHaveBeenCalledWith("/settings/eve");
    expect(mocks.tenantHref).not.toHaveBeenCalledWith("/admin/eve");
    expect(mocks.redirectInTenant).toHaveBeenCalledWith(
      `/login?next=${encodeURIComponent(`${TENANT_PREFIX}/settings/eve`)}`,
    );
  });

  it("redirects a signed-in non-admin visitor to /no-access", async () => {
    mocks.getAuthContext.mockResolvedValue({
      isAuthenticated: true,
      userId: "user-1",
      email: "staff@example.test",
      profileId: "profile-1",
      role: "staff",
      tenantId: "00000000-0000-0000-0000-000000000001",
      memberships: [
        {
          tenantId: "00000000-0000-0000-0000-000000000001",
          role: "staff",
          staffRole: "development",
          isTenantAdmin: false,
          isActive: true,
        },
      ],
    });

    await expect(EvePage()).rejects.toThrow(RedirectSignal);
    expect(mocks.redirectInTenant).toHaveBeenCalledWith("/no-access");
  });
});
