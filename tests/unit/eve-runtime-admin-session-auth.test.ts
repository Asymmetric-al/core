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
  it.each([
    { origin: "https://admin.example.test", "content-type": "text/plain" },
    { "content-type": "application/json" },
  ])("checks cookie writes before session ownership: %j", async (headers) => {
    const request = new Request("https://admin.example.test/eve/v1/session", {
      method: "POST",
      headers: { ...headers, cookie: "session=fixture" } as Record<
        string,
        string
      >,
    });
    await expect(adminEveRouteAuth(request)).rejects.toMatchObject({
      name: "ForbiddenError",
    });
    expect(
      sessionOwnership.authorizeEveAdminRouteRequest,
    ).not.toHaveBeenCalled();
  });

  // Fix check M3: every write method, not only POST.
  it.each(["PUT", "PATCH", "DELETE"])(
    "checks a cookie-carrying %s like a POST",
    async (method) => {
      for (const headers of [
        {
          origin: "https://other.example.test",
          "content-type": "application/json",
        },
        { origin: "https://admin.example.test", "content-type": "text/plain" },
      ]) {
        const request = new Request(
          "https://admin.example.test/eve/v1/session/s-1",
          { method, headers: { ...headers, cookie: "session=fixture" } },
        );
        await expect(adminEveRouteAuth(request)).rejects.toMatchObject({
          name: "ForbiddenError",
        });
      }
      expect(
        sessionOwnership.authorizeEveAdminRouteRequest,
      ).not.toHaveBeenCalled();
    },
  );

  it.each(["POST", "GET"])(
    "preserves verified browser session %s requests",
    async (method) => {
      const headers = new Headers({
        cookie: "session=fixture",
        "sec-fetch-site": "same-origin",
      });
      if (method === "POST")
        headers.set("content-type", "application/json; charset=utf-8");
      const request = new Request("https://admin.example.test/eve/v1/session", {
        method,
        headers,
      });
      sessionOwnership.authorizeEveAdminRouteRequest.mockResolvedValue({});
      await adminEveRouteAuth(request);
      expect(
        sessionOwnership.authorizeEveAdminRouteRequest,
      ).toHaveBeenCalledWith(request);
    },
  );

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
