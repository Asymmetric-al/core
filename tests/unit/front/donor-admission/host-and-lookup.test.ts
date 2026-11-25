import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  donorRequest,
  expectRefused,
  forwarded,
  HOME_A,
  HOME_B,
  hostRow,
  NAME,
  resetOnMode,
  TA,
  TB,
} from "./fixtures";

import type { Answer } from "./fixtures";

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
    if (state.offMode) {
      throw new Error("no lookup client when the switch is off");
    }
    state.lookupClients += 1;
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

beforeEach(() => {
  resetOnMode(state);
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("on: host handling, lookup unavailability, dashboard handoff and no cross-request cache", () => {
  it("refuses absent or blank host with 404 no-store and zero lookups", async () => {
    for (const host of [null, "", "   "]) {
      state.lookups = [];
      state.lookupClients = 0;
      state.sessionReads = 0;
      await expectRefused(
        await donorModule.proxy(donorRequest(host, "/")),
        `host=${String(host)}`,
      );
      expect(state.lookups).toEqual([]);
      expect(state.lookupClients).toBe(0);
      expect(state.sessionReads).toBe(0);
    }
  });

  it("returns 503 no-store with empty body on every path class when lookup is unavailable", async () => {
    state.answer = () => ({ data: null, error: { message: "down" } });
    for (const path of [
      "/",
      "/privacy",
      "/login",
      "/donor-dashboard",
      "/api/profile",
    ]) {
      state.sessionReads = 0;
      await expectRefused(
        await donorModule.proxy(donorRequest(HOME_A, path)),
        path,
        503,
      );
      expect(state.sessionReads, path).toBe(0);
    }
  });

  it("asks for the host header only, never x-forwarded-host or request.url", async () => {
    const req = new NextRequest("http://url-host.localhost:9999/", {
      headers: {
        host: HOME_A,
        "x-forwarded-host": HOME_B,
      },
    });
    const res = await donorModule.proxy(req);
    expect(res.headers.get("x-middleware-next")).toBe("1");
    expect(forwarded(res, NAME)).toBe(TA);
    expect(forwarded(res, "x-forwarded-host")).toBeNull();
    expect(state.lookups).toEqual([HOME_A]);
  });

  it("routes /admin/... and /missionary/... through routeToDashboard with zero donor lookups", async () => {
    for (const [path, upstream] of [
      ["/admin/donors", "http://localhost:25161/admin/donors"],
      ["/missionary/donors", "http://localhost:25162/missionary/donors"],
    ] as const) {
      state.lookups = [];
      state.lookupClients = 0;
      const res = await donorModule.proxy(donorRequest(HOME_A, path));
      expect(res.headers.get("x-middleware-rewrite"), path).toBe(upstream);
      expect(state.lookups, path).toEqual([]);
      expect(state.lookupClients, path).toBe(0);
    }
  });

  it("remembers nothing across requests: one lookup each, second request takes B", async () => {
    const flipping = "flip.localhost:25160";
    state.answer = (_host, n) => (n === 1 ? hostRow(TA) : hostRow(TB));

    const first = await donorModule.proxy(donorRequest(flipping, "/"));
    expect(first.headers.get("x-middleware-next")).toBe("1");
    expect(forwarded(first, NAME)).toBe(TA);
    expect(state.lookups).toEqual([flipping]);

    const second = await donorModule.proxy(donorRequest(flipping, "/"));
    expect(second.headers.get("x-middleware-next")).toBe("1");
    expect(forwarded(second, NAME)).toBe(TB);
    expect(state.lookups).toEqual([flipping, flipping]);
  });
});
