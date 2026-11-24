import { randomBytes } from "node:crypto";

import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  FRONT_ORIGIN_HEADER,
  FRONT_STAMP_HEADER,
  resetFrontConfigLogForTests,
  verifyFrontStamp,
} from "../../../packages/auth/front";

vi.mock("@asym/database/supabase/config", () => ({
  getSupabasePublicConfig: () => ({
    url: "https://example.supabase.co",
    key: "anon-key",
    keyType: "anon",
  }),
}));

vi.mock("@supabase/ssr", () => ({
  createServerClient: () => ({
    auth: { getUser: async () => ({ data: { user: null } }) },
    rpc: async () => ({ data: [], error: null }),
  }),
}));

const donorModule = await import("../../../apps/donor/proxy");

function freshKey(): string {
  return randomBytes(32).toString("hex").slice(0, 32);
}

const ADMIN_ORIGIN = "http://localhost:25051";
const MISSIONARY_ORIGIN = "http://localhost:25052";
const FRONT_ONE = "https://one.example.test";
const FRONT_TWO = "https://two.example.test";

let adminKey: string;
let missionaryKey: string;

beforeEach(() => {
  resetFrontConfigLogForTests();
  adminKey = freshKey();
  missionaryKey = freshKey();
  vi.stubEnv("CORE_SERVE_UNDER_PATHS", "1");
  vi.stubEnv("CORE_APP_BASE_PATH", "");
  vi.stubEnv("FRONT_ADMIN_ORIGIN", ADMIN_ORIGIN);
  vi.stubEnv("FRONT_MISSIONARY_ORIGIN", MISSIONARY_ORIGIN);
  vi.stubEnv("FRONT_STAMP_KEY_ADMIN", adminKey);
  vi.stubEnv("FRONT_STAMP_KEY_MISSIONARY", missionaryKey);
  vi.stubEnv("FRONT_NAMES", "one.example.test,two.example.test");
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe("front routing in apps/donor/proxy.ts when switch is ON", () => {
  it("rewrites exact /admin and /missionary prefixes with path, query, and valid per-dashboard stamp while stripping forged headers", async () => {
    const adminReq = new NextRequest(
      `${FRONT_ONE}/admin/care/directory?tab=open&page=2`,
      {
        headers: {
          host: "one.example.test",
          "x-forwarded-host": "evil.example.test",
          [FRONT_ORIGIN_HEADER]: "https://evil.example.test",
          [FRONT_STAMP_HEADER]: "v1.1.forged",
          "x-asym-front-extra": "forged",
          "x-vercel-protection-bypass": "client-bypass",
          "x-vercel-set-bypass-cookie": "samesitenone",
        },
      },
    );
    const adminRes = await donorModule.proxy(adminReq);
    expect(adminRes.headers.get("x-middleware-rewrite")).toBe(
      `${ADMIN_ORIGIN}/admin/care/directory?tab=open&page=2`,
    );
    expect(
      adminRes.headers.get("x-middleware-request-x-forwarded-host"),
    ).toBeNull();
    expect(
      adminRes.headers.get("x-middleware-request-x-asym-front-extra"),
    ).toBeNull();
    expect(
      adminRes.headers.get("x-middleware-request-x-vercel-protection-bypass"),
    ).toBeNull();
    expect(
      adminRes.headers.get("x-middleware-request-x-vercel-set-bypass-cookie"),
    ).toBeNull();
    const stampedOrigin = adminRes.headers.get(
      `x-middleware-request-${FRONT_ORIGIN_HEADER}`,
    );
    const stampedHeader = adminRes.headers.get(
      `x-middleware-request-${FRONT_STAMP_HEADER}`,
    );
    expect(stampedOrigin).toBe(FRONT_ONE);
    await expect(
      verifyFrontStamp(stampedOrigin, "/admin", stampedHeader, {
        key: adminKey,
      }),
    ).resolves.toBe(true);
    await expect(
      verifyFrontStamp(stampedOrigin, "/admin", stampedHeader, {
        key: missionaryKey,
      }),
    ).resolves.toBe(false);

    const missReq = new NextRequest(`${FRONT_TWO}/missionary`, {
      headers: { host: "two.example.test" },
    });
    const missRes = await donorModule.proxy(missReq);
    expect(missRes.headers.get("x-middleware-rewrite")).toBe(
      `${MISSIONARY_ORIGIN}/missionary`,
    );
    const missOrigin = missRes.headers.get(
      `x-middleware-request-${FRONT_ORIGIN_HEADER}`,
    );
    const missStamp = missRes.headers.get(
      `x-middleware-request-${FRONT_STAMP_HEADER}`,
    );
    expect(missOrigin).toBe(FRONT_TWO);
    await expect(
      verifyFrontStamp(missOrigin, "/missionary", missStamp, {
        key: missionaryKey,
      }),
    ).resolves.toBe(true);
    await expect(
      verifyFrontStamp(missOrigin, "/missionary", missStamp, {
        key: adminKey,
      }),
    ).resolves.toBe(false);
  });

  it.each([
    "/",
    "/workers",
    "/administration",
    "/missionary-stories",
    "/admin.json",
  ])(
    "keeps non-dashboard path %s on the front and strips client x-asym-front-* and x-forwarded-host",
    async (path) => {
      const res = await donorModule.proxy(
        new NextRequest(`${FRONT_ONE}${path}`, {
          headers: {
            host: "one.example.test",
            "x-forwarded-host": "evil.example.test",
            "x-asym-front-origin": FRONT_ONE,
            "x-asym-front-stamp": "v1.1.forged",
            "x-asym-front-extra": "forged",
          },
        }),
      );
      expect(res.headers.get("x-middleware-rewrite")).toBeNull();
      expect(res.headers.get("x-middleware-next")).toBe("1");
      expect(
        res.headers.get("x-middleware-request-x-forwarded-host"),
      ).toBeNull();
      expect(
        res.headers.get("x-middleware-request-x-asym-front-origin"),
      ).toBeNull();
      expect(
        res.headers.get("x-middleware-request-x-asym-front-stamp"),
      ).toBeNull();
      expect(
        res.headers.get("x-middleware-request-x-asym-front-extra"),
      ).toBeNull();
    },
  );

  it("returns 404 no-store with no rewrite for an unknown host or incomplete configuration", async () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    const unknownHost = await donorModule.proxy(
      new NextRequest("https://unknown.example.test/admin/donors", {
        headers: { host: "unknown.example.test" },
      }),
    );
    expect(unknownHost.status).toBe(404);
    expect(unknownHost.headers.get("cache-control")).toBe("no-store");
    expect(unknownHost.headers.get("x-middleware-rewrite")).toBeNull();

    for (const [envVar, value] of [
      ["FRONT_ADMIN_ORIGIN", ""],
      ["FRONT_MISSIONARY_ORIGIN", ""],
      ["FRONT_STAMP_KEY_ADMIN", "short"],
      ["FRONT_STAMP_KEY_MISSIONARY", ""],
      ["FRONT_NAMES", ""],
    ] as const) {
      vi.stubEnv(envVar, value);
      const res = await donorModule.proxy(
        new NextRequest(`${FRONT_ONE}/admin`, {
          headers: { host: "one.example.test" },
        }),
      );
      expect(res.status, envVar).toBe(404);
      expect(res.headers.get("cache-control"), envVar).toBe("no-store");
      expect(res.headers.get("x-middleware-rewrite"), envVar).toBeNull();
      vi.stubEnv("FRONT_ADMIN_ORIGIN", ADMIN_ORIGIN);
      vi.stubEnv("FRONT_MISSIONARY_ORIGIN", MISSIONARY_ORIGIN);
      vi.stubEnv("FRONT_STAMP_KEY_ADMIN", adminKey);
      vi.stubEnv("FRONT_STAMP_KEY_MISSIONARY", missionaryKey);
      vi.stubEnv("FRONT_NAMES", "one.example.test,two.example.test");
    }
  });

  it("refuses plain http upstream origins off loopback while accepting localhost, 127.0.0.1, and [::1]", async () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);

    for (const badUpstream of [
      "http://core-admin.vercel.app",
      "http://localhost.evil.test:25051",
      "http://127.0.0.1.evil.test:25051",
    ]) {
      vi.stubEnv("FRONT_ADMIN_ORIGIN", badUpstream);
      const res = await donorModule.proxy(
        new NextRequest(`${FRONT_ONE}/admin/donors`, {
          headers: { host: "one.example.test" },
        }),
      );
      expect(res.status, badUpstream).toBe(404);
      expect(res.headers.get("cache-control"), badUpstream).toBe("no-store");
      expect(res.headers.get("x-middleware-rewrite"), badUpstream).toBeNull();
    }

    for (const loopbackUpstream of [
      "http://localhost:25051",
      "http://127.0.0.1:25051",
      "http://[::1]:25051",
      "https://admin.example.test",
    ]) {
      vi.stubEnv("FRONT_ADMIN_ORIGIN", loopbackUpstream);
      const res = await donorModule.proxy(
        new NextRequest(`${FRONT_ONE}/admin/donors`, {
          headers: { host: "one.example.test" },
        }),
      );
      expect(res.headers.get("x-middleware-rewrite"), loopbackUpstream).toBe(
        `${loopbackUpstream}/admin/donors`,
      );
    }
  });

  it("logs missing or invalid front config once per process naming the variable and never its value", async () => {
    const errorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
    const secretOrigin = `http://bad-${randomBytes(6).toString("hex")}.vercel.app`;
    const secretKey = `short-${randomBytes(6).toString("hex")}`;

    vi.stubEnv("FRONT_ADMIN_ORIGIN", secretOrigin);
    vi.stubEnv("FRONT_STAMP_KEY_ADMIN", secretKey);
    vi.stubEnv("FRONT_NAMES", "");

    const req = () =>
      new NextRequest(`${FRONT_ONE}/admin/donors`, {
        headers: { host: "one.example.test" },
      });

    const first = await donorModule.proxy(req());
    expect(first.status).toBe(404);
    const firstCalls = errorSpy.mock.calls.map((args) => args.join(" "));
    expect(firstCalls.some((line) => line.includes("FRONT_ADMIN_ORIGIN"))).toBe(
      true,
    );
    expect(
      firstCalls.some((line) => line.includes("FRONT_STAMP_KEY_ADMIN")),
    ).toBe(true);
    expect(firstCalls.some((line) => line.includes("FRONT_NAMES"))).toBe(true);
    expect(firstCalls.join("\n")).not.toContain(secretOrigin);
    expect(firstCalls.join("\n")).not.toContain(secretKey);

    const countAfterFirst = errorSpy.mock.calls.length;
    const second = await donorModule.proxy(req());
    expect(second.status).toBe(404);
    expect(errorSpy.mock.calls.length).toBe(countAfterFirst);
  });
});

describe("front routing in apps/donor/proxy.ts when switch is OFF", () => {
  it("sends nothing to a dashboard and strips client x-asym-front-* headers", async () => {
    vi.stubEnv("CORE_SERVE_UNDER_PATHS", "0");

    const adminPathRes = await donorModule.proxy(
      new NextRequest(`${FRONT_ONE}/admin/donors`, {
        headers: {
          host: "one.example.test",
          "x-asym-front-origin": FRONT_ONE,
          "x-asym-front-stamp": "v1.1.forged",
          "x-asym-front-custom": "forged",
        },
      }),
    );
    expect(adminPathRes.headers.get("x-middleware-rewrite")).toBeNull();
    expect(adminPathRes.headers.get("x-middleware-next")).toBe("1");
    expect(
      adminPathRes.headers.get("x-middleware-request-x-asym-front-origin"),
    ).toBeNull();
    expect(
      adminPathRes.headers.get("x-middleware-request-x-asym-front-stamp"),
    ).toBeNull();
    expect(
      adminPathRes.headers.get("x-middleware-request-x-asym-front-custom"),
    ).toBeNull();
  });
});
