import { randomBytes } from "node:crypto";

import { unstable_doesMiddlewareMatch } from "next/experimental/testing/server";
import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  admitFromFront,
  FRONT_ORIGIN_HEADER,
  FRONT_STAMP_HEADER,
  resetFrontConfigLogForTests,
  signFrontStamp,
  STAFF_EXEMPT_PATHS,
  STAFF_READ_ONLY_EXEMPT_PREFIXES,
} from "../../../packages/auth/front";

const USER = "00000000-0000-4000-8000-0000000000a1";
const TA = "00000000-0000-0000-0000-000000000001";
const ROW_FINANCE = "00000000-0000-4000-8000-000000000201";
const ROW_CARE = "00000000-0000-4000-8000-000000000202";
const ROW_MISS = "00000000-0000-4000-8000-000000000203";

const state = vi.hoisted(() => ({
  userId: null as string | null,
  rows: [] as unknown[],
}));

vi.mock("@asym/database/supabase/config", () => ({
  getSupabasePublicConfig: () => ({
    url: "https://example.supabase.co",
    key: "anon-key",
    keyType: "anon",
  }),
}));

vi.mock("@supabase/ssr", () => ({
  createServerClient: () => ({
    auth: {
      getUser: async () => ({
        data: { user: state.userId ? { id: state.userId } : null },
      }),
    },
    rpc: async () => ({ data: state.rows, error: null }),
  }),
}));

vi.mock("@supabase/supabase-js", () => ({
  createClient: () => ({
    rpc: (fn: string) => {
      if (fn !== "resolve_verified_host") throw new Error(fn);
      return {
        abortSignal: async () => ({
          data: [
            {
              tenant_id: "00000000-0000-0000-0000-000000000001",
              site_id: null,
              generation: 1,
              surfaces: ["website", "donor_account", "staff", "missionary"],
              state: "active",
              is_home: true,
            },
          ],
          error: null,
        }),
      };
    },
  }),
}));

const adminModule = await import("../../../apps/admin/proxy");
const missionaryModule = await import("../../../apps/missionary/proxy");

function freshKey(): string {
  return randomBytes(32).toString("hex").slice(0, 32);
}

const FRONT_ORIGIN = "https://one.example.test";
const OTHER_ORIGIN = "https://two.example.test";
const ADMIN_HOST = "https://admin-internal.example.test";
const MISSIONARY_HOST = "https://missionary-internal.example.test";

let adminKey: string;
let missionaryKey: string;

beforeEach(() => {
  resetFrontConfigLogForTests();
  adminKey = freshKey();
  missionaryKey = freshKey();
  state.userId = null;
  state.rows = [];
  vi.stubEnv("CORE_SERVE_UNDER_PATHS", "1");
  vi.stubEnv("CORE_APP_BASE_PATH", "/admin");
  vi.stubEnv("FRONT_STAMP_KEY", adminKey);
  vi.stubEnv("FRONT_STAMP_KEY_PREVIOUS", "");
});

afterEach(() => {
  vi.unstubAllEnvs();
});

function adminRequest(
  path: string,
  init: {
    method?: string;
    headers?: Record<string, string>;
    body?: string;
  } = {},
) {
  return new NextRequest(`${ADMIN_HOST}/admin${path}`, {
    ...init,
    nextConfig: { basePath: "/admin" },
  });
}

function missionaryRequest(
  path: string,
  init: {
    method?: string;
    headers?: Record<string, string>;
    body?: string;
  } = {},
) {
  return new NextRequest(`${MISSIONARY_HOST}/missionary${path}`, {
    ...init,
    nextConfig: { basePath: "/missionary" },
  });
}

describe("dashboard matchers include the bare base path", () => {
  it("matches bare /admin and /missionary with basePath and fails when / is removed", () => {
    expect(
      unstable_doesMiddlewareMatch({
        config: adminModule.config,
        nextConfig: { basePath: "/admin" },
        url: "/admin",
      }),
    ).toBe(true);
    expect(
      unstable_doesMiddlewareMatch({
        config: {
          matcher: adminModule.config.matcher.filter((entry) => entry !== "/"),
        },
        nextConfig: { basePath: "/admin" },
        url: "/admin",
      }),
    ).toBe(false);
    expect(
      unstable_doesMiddlewareMatch({
        config: missionaryModule.config,
        nextConfig: { basePath: "/missionary" },
        url: "/missionary",
      }),
    ).toBe(true);
    expect(
      unstable_doesMiddlewareMatch({
        config: {
          matcher: missionaryModule.config.matcher.filter(
            (entry) => entry !== "/",
          ),
        },
        nextConfig: { basePath: "/missionary" },
        url: "/missionary",
      }),
    ).toBe(false);
  });
});

describe("dashboard admission when switch is ON", () => {
  it.each([
    ["bare base path", "", {}],
    ["a page", "/donors", {}],
    ["API GET", "/api/admin/funds", {}],
    [
      "API POST",
      "/api/admin/funds",
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: "{}",
      },
    ],
    ["RSC request", "/donors", { headers: { rsc: "1" } }],
    [
      "prefetch",
      "/donors",
      { headers: { "next-router-prefetch": "1", purpose: "prefetch" } },
    ],
    [
      "server action",
      "/web-studio/organization",
      { method: "POST", headers: { "next-action": "abc123" } },
    ],
    ["Web Studio page", "/web-studio", {}],
    ["Web Studio API", "/web-studio/api/pages", {}],
  ])("refuses unstamped %s with 403 no-store", async (_label, path, init) => {
    const res = await adminModule.proxy(adminRequest(path, init));
    expect(res.status).toBe(403);
    expect(res.headers.get("cache-control")).toBe("no-store");
  });

  it("refuses forged, expired, other-prefix, other-origin stamps and third x-forwarded-host", async () => {
    const expired = await signFrontStamp(
      FRONT_ORIGIN,
      "/admin",
      adminKey,
      Date.now() - 61_000,
    );
    const wrongPrefix = await signFrontStamp(
      FRONT_ORIGIN,
      "/missionary",
      adminKey,
    );
    const valid = await signFrontStamp(FRONT_ORIGIN, "/admin", adminKey);
    const wrongKey = await signFrontStamp(
      FRONT_ORIGIN,
      "/admin",
      missionaryKey,
    );

    const cases: Array<[string, Record<string, string>]> = [
      [
        "forged",
        {
          [FRONT_ORIGIN_HEADER]: FRONT_ORIGIN,
          [FRONT_STAMP_HEADER]: "v1.1.bad",
        },
      ],
      [
        "expired",
        { [FRONT_ORIGIN_HEADER]: FRONT_ORIGIN, [FRONT_STAMP_HEADER]: expired },
      ],
      [
        "other-prefix",
        {
          [FRONT_ORIGIN_HEADER]: FRONT_ORIGIN,
          [FRONT_STAMP_HEADER]: wrongPrefix,
        },
      ],
      [
        "other-origin",
        { [FRONT_ORIGIN_HEADER]: OTHER_ORIGIN, [FRONT_STAMP_HEADER]: valid },
      ],
      [
        "wrong-key",
        { [FRONT_ORIGIN_HEADER]: FRONT_ORIGIN, [FRONT_STAMP_HEADER]: wrongKey },
      ],
      [
        "third x-forwarded-host",
        {
          [FRONT_ORIGIN_HEADER]: FRONT_ORIGIN,
          [FRONT_STAMP_HEADER]: valid,
          "x-forwarded-host": "evil.example.test",
        },
      ],
    ];

    for (const [label, headers] of cases) {
      const res = await adminModule.proxy(adminRequest("/donors", { headers }));
      expect(res.status, label).toBe(403);
      expect(res.headers.get("cache-control"), label).toBe("no-store");
    }
  });

  it("admits a stamped request, sets host/x-forwarded-host/origin, strips stamp and bypass headers, and rebases Location", async () => {
    const valid = await signFrontStamp(FRONT_ORIGIN, "/admin", adminKey);
    const res = await adminModule.proxy(
      adminRequest("/donors", {
        headers: {
          [FRONT_ORIGIN_HEADER]: FRONT_ORIGIN,
          [FRONT_STAMP_HEADER]: valid,
          "x-asym-front-extra": "forged",
          "x-vercel-protection-bypass": "client-bypass",
          "x-vercel-set-bypass-cookie": "samesitenone",
        },
      }),
    );

    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toBe(
      `${FRONT_ORIGIN}/admin/login?next=%2Fdonors`,
    );

    const apiRes = await adminModule.proxy(
      adminRequest("/api/admin/funds", {
        headers: {
          [FRONT_ORIGIN_HEADER]: FRONT_ORIGIN,
          [FRONT_STAMP_HEADER]: valid,
          "x-asym-front-extra": "forged",
          "x-vercel-protection-bypass": "client-bypass",
          "x-vercel-set-bypass-cookie": "samesitenone",
        },
      }),
    );
    expect(apiRes.headers.get("x-middleware-next")).toBe("1");
    expect(apiRes.headers.get("x-middleware-request-host")).toBe(
      "one.example.test",
    );
    expect(apiRes.headers.get("x-middleware-request-x-forwarded-host")).toBe(
      "one.example.test",
    );
    expect(
      apiRes.headers.get(`x-middleware-request-${FRONT_ORIGIN_HEADER}`),
    ).toBe(FRONT_ORIGIN);
    expect(
      apiRes.headers.get(`x-middleware-request-${FRONT_STAMP_HEADER}`),
    ).toBeNull();
    expect(
      apiRes.headers.get("x-middleware-request-x-asym-front-extra"),
    ).toBeNull();
    expect(
      apiRes.headers.get("x-middleware-request-x-vercel-protection-bypass"),
    ).toBeNull();
    expect(
      apiRes.headers.get("x-middleware-request-x-vercel-set-bypass-cookie"),
    ).toBeNull();
  });

  it("admits ~<sub-role> under /admin with document scope /<org>~finance", async () => {
    state.userId = USER;
    state.rows = [
      {
        id: ROW_FINANCE,
        user_id: USER,
        tenant_id: TA,
        role: "staff",
        staff_role: "finance",
        is_tenant_admin: false,
        updated_at: "2026-11-24T00:00:00.000000+00:00",
      },
      {
        id: ROW_CARE,
        user_id: USER,
        tenant_id: TA,
        role: "staff",
        staff_role: "member_care",
        is_tenant_admin: false,
        updated_at: "2026-11-24T00:00:00.000000+00:00",
      },
    ];
    const valid = await signFrontStamp(FRONT_ORIGIN, "/admin", adminKey);
    const res = await adminModule.proxy(
      adminRequest(`/${TA}~finance/care/directory`, {
        headers: {
          [FRONT_ORIGIN_HEADER]: FRONT_ORIGIN,
          [FRONT_STAMP_HEADER]: valid,
        },
      }),
    );

    expect(res.status).toBe(200);
    expect(res.headers.get("x-middleware-rewrite")).toBe(
      `${ADMIN_HOST}/admin/care/directory`,
    );
    expect(res.headers.get("x-middleware-request-x-asym-address-prefix")).toBe(
      `/${TA}~finance`,
    );
    expect(res.headers.get("x-middleware-request-x-asym-assignment")).toBe(
      ROW_FINANCE,
    );
  });

  it("admits only staff listed paths and GET/HEAD /api/cms/public/, stripping client x-asym-front-* and keeping bypass", async () => {
    const staffListed: Array<[string, string]> = [
      ["GET", "/api/health/migrations"],
      ["GET", "/api/health/migrations/"],
      ["GET", "/%61pi/health/migrations"],
      ["POST", "/api/webhooks/stripe"],
      ["POST", "/api/webhooks/stripe-connect"],
      ["POST", "/api/email/webhooks/resend"],
      ["POST", "/api/inngest"],
      ["POST", "/eve/v1/github"],
      ["GET", "/api/cms/public/pages/home"],
      ["HEAD", "/api/cms/public/navigation"],
    ];

    for (const [method, path] of staffListed) {
      const res = await adminModule.proxy(
        adminRequest(path, {
          method,
          headers: {
            "content-type": "application/json",
            "x-asym-front-origin": "https://evil.example.test",
            "x-asym-front-custom": "forged",
            "x-vercel-protection-bypass": "health-bypass",
          },
          ...(method === "POST" ? { body: "{}" } : {}),
        }),
      );
      expect(res.status, `${method} ${path}`).toBe(200);
      expect(res.headers.get("x-middleware-next"), `${method} ${path}`).toBe(
        "1",
      );
      expect(
        res.headers.get("x-middleware-request-x-asym-front-origin"),
        `${method} ${path}`,
      ).toBeNull();
      expect(
        res.headers.get("x-middleware-request-x-asym-front-custom"),
        `${method} ${path}`,
      ).toBeNull();
      expect(
        res.headers.get("x-middleware-request-x-vercel-protection-bypass"),
        `${method} ${path}`,
      ).toBe("health-bypass");
    }

    const staffRefused: Array<[string, string]> = [
      ["POST", "/api/cms/public/x"],
      ["PUT", "/api/cms/public/x"],
      ["GET", "/api/cms/publicx"],
      ["GET", "/api/cms/public/%2e%2e/donors"],
      ["GET", "/api/cms/public/a%5cb"],
      ["POST", "/api/webhooks/stripe-x"],
      ["GET", "/api/health/migrationsx"],
      ["POST", "/eve/v1/githubx"],
      ["GET", "/%E0%A4%A"],
    ];
    for (const [method, path] of staffRefused) {
      const res = await adminModule.proxy(
        adminRequest(path, {
          method,
          ...(method === "POST" || method === "PUT"
            ? { headers: { "content-type": "application/json" }, body: "{}" }
            : {}),
        }),
      );
      expect(res.status, `${method} ${path}`).toBe(403);
      expect(res.headers.get("cache-control"), `${method} ${path}`).toBe(
        "no-store",
      );
    }

    for (const unnormalized of [
      "/api/cms/public/%2e/pages",
      "/api/cms/public/a/%2e%2e/b",
      "/api/cms/public/a%5cb",
    ]) {
      const rawReq = {
        method: "GET",
        headers: new Headers(),
        nextUrl: { pathname: unnormalized },
      } as unknown as NextRequest;
      await expect(
        admitFromFront(rawReq, {
          prefix: "/admin",
          key: adminKey,
          exempt: STAFF_EXEMPT_PATHS,
          readOnlyPrefixes: STAFF_READ_ONLY_EXEMPT_PREFIXES,
        }),
        unnormalized,
      ).resolves.toEqual({ kind: "refused" });
    }
  });

  it("enforces missionary's own explicit list and refuses staff-only listed paths", async () => {
    vi.stubEnv("CORE_APP_BASE_PATH", "/missionary");
    vi.stubEnv("FRONT_STAMP_KEY", missionaryKey);

    for (const [method, path] of [
      ["GET", "/api/health/migrations"],
      ["POST", "/api/webhooks/stripe"],
    ] as const) {
      const res = await missionaryModule.proxy(
        missionaryRequest(path, {
          method,
          headers: {
            "content-type": "application/json",
            "x-asym-front-origin": "https://evil.example.test",
            "x-vercel-protection-bypass": "health-bypass",
          },
          ...(method === "POST" ? { body: "{}" } : {}),
        }),
      );
      expect(res.status, `${method} ${path}`).toBe(200);
      expect(res.headers.get("x-middleware-next")).toBe("1");
      expect(
        res.headers.get("x-middleware-request-x-asym-front-origin"),
      ).toBeNull();
      expect(
        res.headers.get("x-middleware-request-x-vercel-protection-bypass"),
      ).toBe("health-bypass");
    }

    for (const [method, path] of [
      ["POST", "/api/inngest"],
      ["POST", "/api/webhooks/stripe-connect"],
      ["POST", "/api/email/webhooks/resend"],
      ["POST", "/eve/v1/github"],
      ["GET", "/api/cms/public/pages/home"],
      ["GET", "/%E0%A4%A"],
    ] as const) {
      const res = await missionaryModule.proxy(
        missionaryRequest(path, {
          method,
          ...(method === "POST"
            ? { headers: { "content-type": "application/json" }, body: "{}" }
            : {}),
        }),
      );
      expect(res.status, `${method} ${path}`).toBe(403);
      expect(res.headers.get("cache-control")).toBe("no-store");
    }

    state.userId = USER;
    state.rows = [
      {
        id: ROW_MISS,
        user_id: USER,
        tenant_id: TA,
        role: "missionary",
        staff_role: null,
        is_tenant_admin: false,
        updated_at: "2026-11-24T00:00:00.000000+00:00",
      },
    ];
    const valid = await signFrontStamp(
      FRONT_ORIGIN,
      "/missionary",
      missionaryKey,
    );
    const stampedRes = await missionaryModule.proxy(
      missionaryRequest("/", {
        headers: {
          [FRONT_ORIGIN_HEADER]: FRONT_ORIGIN,
          [FRONT_STAMP_HEADER]: valid,
        },
      }),
    );
    expect(stampedRes.status).toBe(307);
    expect(stampedRes.headers.get("location")).toBe(
      `${FRONT_ORIGIN}/missionary/${TA}`,
    );
  });

  it("enforces same-origin API writes and refuses foreign Origin with 403 when stamped", async () => {
    const valid = await signFrontStamp(FRONT_ORIGIN, "/admin", adminKey);
    const sameOrigin = await adminModule.proxy(
      adminRequest("/api/profile", {
        method: "POST",
        headers: {
          [FRONT_ORIGIN_HEADER]: FRONT_ORIGIN,
          [FRONT_STAMP_HEADER]: valid,
          origin: FRONT_ORIGIN,
          "content-type": "application/json",
        },
        body: "{}",
      }),
    );
    expect(sameOrigin.status).toBe(200);
    expect(sameOrigin.headers.get("x-middleware-next")).toBe("1");

    const foreignOrigin = await adminModule.proxy(
      adminRequest("/api/profile", {
        method: "POST",
        headers: {
          [FRONT_ORIGIN_HEADER]: FRONT_ORIGIN,
          [FRONT_STAMP_HEADER]: valid,
          origin: OTHER_ORIGIN,
          "content-type": "application/json",
        },
        body: "{}",
      }),
    );
    expect(foreignOrigin.status).toBe(403);
    expect(await foreignOrigin.json()).toEqual({
      error: "Mutation origin not accepted.",
    });

    const studioForeign = await adminModule.proxy(
      adminRequest("/web-studio/api/pages", {
        method: "POST",
        headers: {
          [FRONT_ORIGIN_HEADER]: FRONT_ORIGIN,
          [FRONT_STAMP_HEADER]: valid,
          origin: OTHER_ORIGIN,
          "content-type": "application/json",
        },
        body: "{}",
      }),
    );
    expect(studioForeign.status).toBe(403);
    expect(await studioForeign.json()).toEqual({
      errors: [
        {
          message:
            "Web Studio only accepts changes made from Web Studio itself.",
        },
      ],
    });
  });

  it("logs FRONT_STAMP_KEY once per process without its value when switch is ON and the key is invalid", async () => {
    const errorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
    const shortSecret = `short-${randomBytes(6).toString("hex")}`;
    vi.stubEnv("FRONT_STAMP_KEY", shortSecret);

    const first = await adminModule.proxy(adminRequest("/donors"));
    expect(first.status).toBe(403);
    const logged = errorSpy.mock.calls.map((args) => args.join(" ")).join("\n");
    expect(logged).toContain("FRONT_STAMP_KEY");
    expect(logged).not.toContain(shortSecret);
    expect(errorSpy).toHaveBeenCalledTimes(1);

    const second = await adminModule.proxy(adminRequest("/donors"));
    expect(second.status).toBe(403);
    expect(errorSpy).toHaveBeenCalledTimes(1);
    errorSpy.mockRestore();
  });
});

describe("dashboard admission when switch is OFF", () => {
  it("admits unstamped requests as today while stripping all client x-asym-front-* headers", async () => {
    vi.stubEnv("CORE_SERVE_UNDER_PATHS", "0");
    vi.stubEnv("CORE_APP_BASE_PATH", "");

    const adminRes = await adminModule.proxy(
      new NextRequest(`${ADMIN_HOST}/api/admin/funds`, {
        headers: {
          "x-asym-front-origin": FRONT_ORIGIN,
          "x-asym-front-stamp": "v1.1.forged",
          "x-asym-front-custom": "forged",
        },
      }),
    );
    expect(adminRes.status).toBe(200);
    expect(adminRes.headers.get("x-middleware-next")).toBe("1");
    expect(
      adminRes.headers.get("x-middleware-request-x-asym-front-origin"),
    ).toBeNull();
    expect(
      adminRes.headers.get("x-middleware-request-x-asym-front-stamp"),
    ).toBeNull();
    expect(
      adminRes.headers.get("x-middleware-request-x-asym-front-custom"),
    ).toBeNull();

    const missionaryRes = await missionaryModule.proxy(
      new NextRequest(`${MISSIONARY_HOST}/api/missionary/tasks`, {
        headers: {
          "x-asym-front-origin": FRONT_ORIGIN,
          "x-asym-front-extra": "forged",
        },
      }),
    );
    expect(missionaryRes.status).toBe(200);
    expect(missionaryRes.headers.get("x-middleware-next")).toBe("1");
    expect(
      missionaryRes.headers.get("x-middleware-request-x-asym-front-origin"),
    ).toBeNull();
    expect(
      missionaryRes.headers.get("x-middleware-request-x-asym-front-extra"),
    ).toBeNull();
  });
});
