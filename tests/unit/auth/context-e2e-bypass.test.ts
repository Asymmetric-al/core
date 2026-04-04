import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  createE2EAuthCookieValue,
  E2E_AUTH_COOKIE_NAME,
} from "../../../packages/auth/e2e-auth";

const originalBypass = process.env.E2E_AUTH_BYPASS;
const originalNodeEnv = process.env.NODE_ENV;

vi.mock("next/headers", () => ({
  cookies: vi.fn(),
}));

describe("getAuthContext E2E bypass", () => {
  beforeEach(() => {
    process.env.E2E_AUTH_BYPASS = "true";
    process.env.NODE_ENV = "development";
  });

  afterEach(() => {
    process.env.E2E_AUTH_BYPASS = originalBypass;
    process.env.NODE_ENV = originalNodeEnv;
    vi.resetModules();
  });

  it("returns authenticated context from asym_e2e_auth cookie without Supabase", async () => {
    const value = createE2EAuthCookieValue({
      userId: "e2e-donor-user",
      role: "donor",
      tenantId: null,
    });

    const { cookies } = await import("next/headers");
    vi.mocked(cookies).mockResolvedValue({
      get: (name: string) =>
        name === E2E_AUTH_COOKIE_NAME ? { value } : undefined,
      getAll: () => [],
      set: vi.fn(),
    } as never);

    const { getAuthContext } = await import("../../../packages/auth/context");
    const ctx = await getAuthContext();

    expect(ctx.isAuthenticated).toBe(true);
    expect(ctx.userId).toBe("e2e-donor-user");
    expect(ctx.role).toBe("donor");
    expect(ctx.profileRole).toBe("donor");
  });
});
