import { readdirSync } from "node:fs";
import path from "node:path";

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { donorRequest, expectRefused, HOME_A, resetOnMode } from "./fixtures";

import type { Answer, Init } from "./fixtures";

const state = vi.hoisted(() => ({
  userId: null as string | null,
  rows: [] as unknown[],
  refreshCookie: true,
  sessionReads: 0,
  lookups: [] as string[],
  lookupClients: 0,
  offMode: false,
  answer: (() => ({ data: [], error: null })) as (
    host: string,
    callIndex: number,
  ) => Answer,
}));

vi.mock("@asym/database/supabase/config", () => ({
  getSupabasePublicConfig: () => ({
    url: "https://example.supabase.co",
    key: "anon-key",
    keyType: "anon",
  }),
}));

vi.mock("@supabase/ssr", () => ({
  createServerClient: (
    _url: string,
    _key: string,
    options: {
      cookies: {
        setAll: (
          cookies: Array<{ name: string; value: string }>,
          headers: Record<string, string>,
        ) => void;
      };
    },
  ) => ({
    auth: {
      getUser: async () => {
        state.sessionReads += 1;
        if (state.refreshCookie) {
          options.cookies.setAll([{ name: "sb-refreshed", value: "fresh" }], {
            "Cache-Control": "private, no-store",
          });
        }
        return { data: { user: state.userId ? { id: state.userId } : null } };
      },
    },
    rpc: async (fn: string) => {
      if (fn !== "current_user_assignments") throw new Error(fn);
      return { data: state.rows, error: null };
    },
  }),
}));

vi.mock("@supabase/supabase-js", () => ({
  createClient: () => {
    state.lookupClients += 1;
    if (state.offMode) {
      throw new Error("no lookup client when the switch is off");
    }
    return {
      rpc: (fn: string, args: { p_host: string }) => {
        if (fn !== "resolve_verified_host") throw new Error(fn);
        state.lookups.push(args.p_host);
        const answer = state.answer(args.p_host, state.lookups.length);
        return { abortSignal: () => Promise.resolve(answer) };
      },
    };
  },
}));

const donorModule = await import("../../../../apps/donor/proxy");

function routedFirstSegments(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    if (!entry.isDirectory() || /^[_[]/.test(entry.name)) return [];
    return entry.name.startsWith("(")
      ? routedFirstSegments(path.join(dir, entry.name))
      : [entry.name];
  });
}

const ROUTED = [...new Set(routedFirstSegments("apps/donor/app"))];

const METHODS: Init[] = [
  {},
  { method: "HEAD" },
  { method: "OPTIONS" },
  {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: "{}",
  },
];

async function expectReservedMiss(path: string, init: Init = {}) {
  state.sessionReads = 0;
  state.lookups = [];
  state.lookupClients = 0;
  const label = `${init.method ?? "GET"} ${path}`;
  await expectRefused(
    await donorModule.proxy(donorRequest(HOME_A, path, init)),
    label,
  );
  expect(state.sessionReads, `${label}: the auth proxy ran`).toBe(0);
  expect(state.lookups, `${label}: the name was looked up`).toEqual([]);
  expect(state.lookupClients, `${label}: a lookup client was made`).toBe(0);
}

async function expectNotReservedMiss(path: string) {
  const response = await donorModule.proxy(donorRequest(HOME_A, path));
  expect(response.status, path).not.toBe(404);
}

beforeEach(() => {
  resetOnMode(state);
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe.each([
  ["unset", undefined],
  ["0", "0"],
] as const)(
  "off (switch %s): a reserved first segment no donor route serves answers 404 before the auth proxy",
  (_label, value) => {
    beforeEach(() => {
      state.offMode = true;
      vi.stubEnv("CORE_SERVE_UNDER_PATHS", value);
      vi.stubEnv("CORE_APP_BASE_PATH", "");
    });

    it.each([
      "/web-studio/x",
      "/web-studio",
      "/invite/x",
      "/lang/en",
      "/admin/x",
      "/admin",
      "/missionary/profile",
      "/%61dmin/x",
      "/give/monthly",
      "/Give/monthly",
      "/home/x",
      "/donate/x",
      "/missionaries/x",
      "/maplibre",
      "/invite/x.rsc",
    ])("%s, for every method", async (path) => {
      for (const init of METHODS) await expectReservedMiss(path, init);
    });

    it("never refuses a first segment a donor route serves, nor an ordinary page (guard)", async () => {
      expect(ROUTED).toEqual(
        expect.arrayContaining(["api", "auth", "workers", "login"]),
      );
      for (const segment of ROUTED) {
        await expectNotReservedMiss(`/${segment}`);
        await expectNotReservedMiss(`/${segment}/x`);
      }
      for (const path of [
        "/",
        "/api/health",
        "/api/health/migrations",
        "/auth/callback",
        "/api/nope",
        "/auth/nope",
        "/workers/x",
        "/about-us",
        "/administration",
        "/privacy/x",
      ]) {
        await expectNotReservedMiss(path);
      }
    });

    it("passes guest giving's /api/checkout/config to its route (guard)", async () => {
      await expectCheckoutConfigPassed();
    });
  },
);

async function expectCheckoutConfigPassed() {
  const response = await donorModule.proxy(
    donorRequest(HOME_A, "/api/checkout/config", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        origin: `http://${HOME_A}`,
      },
      body: "{}",
    }),
  );
  expect(response.status).not.toBe(404);
  expect(response.headers.get("x-middleware-next")).toBe("1");
}

describe("on: a reserved first segment no donor route serves answers 404 before the name lookup", () => {
  it.each([
    "/web-studio/x",
    "/invite/x",
    "/lang/en",
    "/give/monthly",
    "/Give/monthly",
    "/home/x",
    "/maplibre",
    "/invite/x.rsc",
    "/web-studio/x.segments/_tree.segment.rsc",
  ])("%s, for every method", async (path) => {
    for (const init of METHODS) await expectReservedMiss(path, init);
  });

  it("leaves /admin and /missionary to the dashboards' routing (guard)", async () => {
    for (const [path, origin] of [
      ["/admin/x", "http://localhost:25161/admin/x"],
      ["/missionary/x", "http://localhost:25162/missionary/x"],
    ] as const) {
      const response = await donorModule.proxy(donorRequest(HOME_A, path));
      expect(response.headers.get("x-middleware-rewrite"), path).toBe(origin);
    }
  });

  it("never refuses a first segment a donor route serves, nor an ordinary page (guard)", async () => {
    for (const segment of ROUTED) {
      await expectNotReservedMiss(`/${segment}`);
      await expectNotReservedMiss(`/${segment}/x`);
    }
    for (const path of [
      "/",
      "/api/health",
      "/auth/callback",
      "/workers/x",
      "/about-us",
      "/privacy/x",
    ]) {
      await expectNotReservedMiss(path);
    }
  });

  it("passes guest giving's /api/checkout/config to its route (guard)", async () => {
    await expectCheckoutConfigPassed();
  });
});
