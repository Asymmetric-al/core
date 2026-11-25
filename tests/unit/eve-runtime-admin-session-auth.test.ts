import { randomBytes } from "node:crypto";

import {
  afterAll,
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

const network = vi.hoisted(() => {
  const reached: string[] = [];
  const fetchSpy = vi.fn(async (input: unknown) => {
    reached.push(String(input));
    throw new Error("a test reached the network");
  });
  vi.stubGlobal("fetch", fetchSpy);
  return { reached, fetchSpy };
});

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

import {
  FRONT_ORIGIN_HEADER,
  FRONT_STAMP_HEADER,
  signFrontStamp,
} from "../../packages/auth/front";
import {
  requestOrigin,
  trustedMutationSource,
} from "../../packages/auth/request-headers";
import { adminEveRouteAuth } from "../../packages/eve-runtime/src/admin-session-auth";

const FRONT = "https://front.test";
const STAFF_SESSION_URL = "https://staff.example.test/eve/v1/session";
const WRITE_BODY = '{"message":"Explain this page"}';

function stampKey(): string {
  return randomBytes(32).toString("hex").slice(0, 32);
}

async function frontWrite(options: {
  key: string;
  method?: string;
  origin?: string;
  stampOrigin?: string;
  prefix?: string;
  issuedAt?: number;
  stamp?: string | null;
  headers?: Record<string, string>;
}) {
  const stampOrigin = options.stampOrigin ?? FRONT;
  const stamp =
    options.stamp === undefined
      ? await signFrontStamp(
          stampOrigin,
          options.prefix ?? "/admin",
          options.key,
          options.issuedAt ?? Date.now(),
        )
      : options.stamp;
  return new Request(STAFF_SESSION_URL, {
    method: options.method ?? "POST",
    headers: {
      host: "staff.example.test",
      cookie: "session=fixture",
      "content-type": "application/json",
      origin: options.origin ?? FRONT,
      [FRONT_ORIGIN_HEADER]: stampOrigin,
      ...(stamp === null ? {} : { [FRONT_STAMP_HEADER]: stamp }),
      ...options.headers,
    },
    body: WRITE_BODY,
  });
}

const originalArgv = process.argv;

beforeEach(() => {
  vi.stubGlobal("fetch", network.fetchSpy);
});

afterEach(() => {
  process.argv = originalArgv;
  vi.clearAllMocks();
  vi.unstubAllEnvs();
  expect(network.reached).toEqual([]);
});

afterAll(() => {
  vi.unstubAllGlobals();
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

  it("ignores a forged x-asym-front-origin header when the switch is OFF and refuses foreign Origin writes", async () => {
    vi.stubEnv("CORE_SERVE_UNDER_PATHS", "0");

    const request = new Request("https://admin.example.test/eve/v1/session", {
      method: "POST",
      headers: {
        host: "admin.example.test",
        cookie: "session=fixture",
        "content-type": "application/json",
        origin: "https://evil.example",
        "x-asym-front-origin": "https://evil.example",
      },
    });

    expect(requestOrigin(request)).toBe("https://admin.example.test");
    expect(trustedMutationSource(request)).toBe(false);
    await expect(adminEveRouteAuth(request)).rejects.toMatchObject({
      name: "ForbiddenError",
    });
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

describe("Eve session writes through the front's /admin stamp", () => {
  it.each([
    ["no x-forwarded-host", {}],
    ["x-forwarded-host the front's name", { "x-forwarded-host": "front.test" }],
  ])(
    "lets a JSON write from the front's verified origin reach session ownership with the original request (%s)",
    async (_label, headers) => {
      const key = stampKey();
      vi.stubEnv("FRONT_STAMP_KEY", key);
      vi.stubEnv("FRONT_STAMP_KEY_PREVIOUS", undefined);
      const snapshot = { kind: "fixture-snapshot" };
      sessionOwnership.authorizeEveAdminRouteRequest.mockResolvedValue({});
      sessionOwnership.toEveSessionAuthSnapshot.mockReturnValue(snapshot);
      const request = await frontWrite({ key, headers });

      await expect(adminEveRouteAuth(request)).resolves.toBe(snapshot);

      expect(
        sessionOwnership.authorizeEveAdminRouteRequest,
      ).toHaveBeenCalledTimes(1);
      expect(
        sessionOwnership.authorizeEveAdminRouteRequest.mock.calls[0]![0],
      ).toBe(request);
      expect(request.bodyUsed).toBe(false);
      expect(await request.text()).toBe(WRITE_BODY);
    },
  );

  it("accepts a stamp of FRONT_STAMP_KEY_PREVIOUS beside a valid primary", async () => {
    const key = stampKey();
    const previous = stampKey();
    vi.stubEnv("FRONT_STAMP_KEY", key);
    vi.stubEnv("FRONT_STAMP_KEY_PREVIOUS", previous);
    const snapshot = { kind: "fixture-snapshot" };
    sessionOwnership.authorizeEveAdminRouteRequest.mockResolvedValue({});
    sessionOwnership.toEveSessionAuthSnapshot.mockReturnValue(snapshot);
    const request = await frontWrite({ key: previous });

    await expect(adminEveRouteAuth(request)).resolves.toBe(snapshot);
    expect(sessionOwnership.authorizeEveAdminRouteRequest).toHaveBeenCalledWith(
      request,
    );
  });

  it.each<[string, (key: string) => Promise<Request>]>([
    ["an unstamped write", (key) => frontWrite({ key, stamp: null })],
    [
      "a cross-site Origin with a valid stamp",
      (key) => frontWrite({ key, origin: "https://evil.test" }),
    ],
    [
      "a text/plain POST with a valid stamp",
      (key) => frontWrite({ key, headers: { "content-type": "text/plain" } }),
    ],
    [
      "a text/plain PUT with a valid stamp",
      (key) =>
        frontWrite({
          key,
          method: "PUT",
          headers: { "content-type": "text/plain" },
        }),
    ],
    [
      "a forged stamp",
      (key) =>
        frontWrite({
          key,
          stamp: `v1.${Math.floor(Date.now() / 1000)}.${"A".repeat(43)}`,
        }),
    ],
    [
      "a 61-second-old stamp",
      (key) => frontWrite({ key, issuedAt: Date.now() - 61_000 }),
    ],
    [
      "a /missionary stamp",
      (key) => frontWrite({ key, prefix: "/missionary" }),
    ],
    ["a stamp of another key", () => frontWrite({ key: stampKey() })],
    [
      "an http stamp on an https request",
      (key) =>
        frontWrite({
          key,
          stampOrigin: "http://front.test",
          origin: "http://front.test",
        }),
    ],
    [
      "x-forwarded-host a third host",
      (key) =>
        frontWrite({ key, headers: { "x-forwarded-host": "evil.test" } }),
    ],
    [
      "a blank x-forwarded-host",
      (key) => frontWrite({ key, headers: { "x-forwarded-host": "" } }),
    ],
    [
      "an x-forwarded-host list",
      (key) =>
        frontWrite({
          key,
          headers: { "x-forwarded-host": "front.test, evil.test" },
        }),
    ],
  ])("refuses %s", async (_label, build) => {
    const key = stampKey();
    vi.stubEnv("FRONT_STAMP_KEY", key);
    vi.stubEnv("FRONT_STAMP_KEY_PREVIOUS", undefined);
    sessionOwnership.authorizeEveAdminRouteRequest.mockResolvedValue({});
    const request = await build(key);

    await expect(adminEveRouteAuth(request)).rejects.toMatchObject({
      name: "ForbiddenError",
    });
    expect(
      sessionOwnership.authorizeEveAdminRouteRequest,
    ).not.toHaveBeenCalled();
  });

  it.each([
    ["FRONT_STAMP_KEY unset", undefined],
    ["FRONT_STAMP_KEY under 32 bytes", "a".repeat(31)],
  ])(
    "refuses a valid stamp with %s, even with FRONT_STAMP_KEY_PREVIOUS valid",
    async (_label, primary) => {
      const key = stampKey();
      vi.stubEnv("FRONT_STAMP_KEY", primary);
      vi.stubEnv("FRONT_STAMP_KEY_PREVIOUS", key);
      sessionOwnership.authorizeEveAdminRouteRequest.mockResolvedValue({});
      const request = await frontWrite({ key });

      await expect(adminEveRouteAuth(request)).rejects.toMatchObject({
        name: "ForbiddenError",
      });
      expect(
        sessionOwnership.authorizeEveAdminRouteRequest,
      ).not.toHaveBeenCalled();
    },
  );

  it("leaves a stamped GET to session ownership as today", async () => {
    const key = stampKey();
    vi.stubEnv("FRONT_STAMP_KEY", key);
    sessionOwnership.authorizeEveAdminRouteRequest.mockResolvedValue({});
    const request = new Request(`${STAFF_SESSION_URL}/s-1/stream`, {
      method: "GET",
      headers: {
        host: "staff.example.test",
        cookie: "session=fixture",
        origin: "https://evil.test",
        [FRONT_ORIGIN_HEADER]: FRONT,
        [FRONT_STAMP_HEADER]: await signFrontStamp(FRONT, "/admin", key),
      },
    });

    await adminEveRouteAuth(request);
    expect(sessionOwnership.authorizeEveAdminRouteRequest).toHaveBeenCalledWith(
      request,
    );
  });
});
