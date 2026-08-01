import { afterEach, describe, expect, it, vi } from "vitest";

const sessionOwnership = vi.hoisted(() => {
  class EveRouteAuthError extends Error {
    constructor(
      readonly reason: string,
      readonly status: 401 | 403 | 503,
    ) {
      super(reason);
    }
  }

  return {
    authorizeEveAdminRouteRequest: vi.fn(),
    claimEveSessionFromAuthSnapshot: vi.fn(),
    EveRouteAuthError,
    toEveSessionAuthSnapshot: vi.fn(),
  };
});

vi.mock("@asym/api/eve/session-ownership", () => sessionOwnership);

import { adminEveRouteAuth } from "../../packages/eve-runtime/src/admin-session-auth";

const originalArgv = process.argv;

afterEach(() => {
  process.argv = originalArgv;
});

describe("Eve runtime admin session auth", () => {
  it("does not trust a spoofed loopback Host outside the local eval process", async () => {
    process.argv = ["node", "eve", "dev"];
    sessionOwnership.authorizeEveAdminRouteRequest.mockRejectedValue(
      new sessionOwnership.EveRouteAuthError("unauthenticated", 401),
    );

    const request = new Request("https://localhost/eve/v1/session", {
      method: "POST",
    });

    await expect(adminEveRouteAuth(request)).rejects.toMatchObject({
      name: "UnauthenticatedError",
      response: expect.objectContaining({ status: 401 }),
    });
    expect(sessionOwnership.authorizeEveAdminRouteRequest).toHaveBeenCalledWith(
      request,
    );
  });

  it("keeps the deterministic local eval path isolated to loopback", async () => {
    process.argv = ["node", "eve", "eval"];

    await expect(
      adminEveRouteAuth(
        new Request("http://127.0.0.1:3000/eve/v1/session", {
          method: "POST",
        }),
      ),
    ).resolves.toBeNull();
    expect(
      sessionOwnership.authorizeEveAdminRouteRequest,
    ).not.toHaveBeenCalled();
  });

  it("still requires app auth for non-loopback requests during an eval", async () => {
    process.argv = ["node", "eve", "eval"];
    sessionOwnership.authorizeEveAdminRouteRequest.mockRejectedValue(
      new sessionOwnership.EveRouteAuthError("unauthenticated", 401),
    );

    await expect(
      adminEveRouteAuth(
        new Request("https://eve.example.com/eve/v1/session", {
          method: "POST",
        }),
      ),
    ).rejects.toMatchObject({ name: "UnauthenticatedError" });
  });
});
