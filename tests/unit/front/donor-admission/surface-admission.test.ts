import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  BARE_B,
  D_A,
  D_B,
  donorRequest,
  expectRefused,
  forwarded,
  NAME,
  resetOnMode,
  SECOND_A,
  SITE_A,
  TA,
  TB,
  USER_D,
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

describe("on: per-surface path admission across bare-b, site-a, second-a and ready-b", () => {
  it("bare-b refuses website paths and forwards account and both paths with B", async () => {
    for (const path of ["/", "/workers"]) {
      state.lookups = [];
      state.sessionReads = 0;
      await expectRefused(
        await donorModule.proxy(donorRequest(BARE_B, path)),
        path,
      );
      expect(state.sessionReads).toBe(0);
      expect(state.lookups).toEqual([BARE_B]);
    }

    state.userId = USER_D;
    state.rows = [D_A, D_B];
    for (const path of ["/login", "/donor-dashboard", "/privacy"]) {
      state.lookups = [];
      const req = donorRequest(BARE_B, path, { headers: { [NAME]: TA } });
      const res = await donorModule.proxy(req);
      if (path === "/login") {
        expect(res.status, path).toBe(307);
        expect(new URL(res.headers.get("location")!).pathname).toBe(
          "/donor-dashboard",
        );
      } else {
        expect(res.headers.get("x-middleware-next"), path).toBe("1");
        expect(forwarded(res, NAME), path).toBe(TB);
      }
      expect(state.lookups).toEqual([BARE_B]);
    }

    state.userId = null;
    for (const path of [
      "/login",
      "/privacy",
      "/terms",
      "/cookies",
      "/help/about",
    ]) {
      const res = await donorModule.proxy(
        donorRequest(BARE_B, path, { headers: { [NAME]: TA } }),
      );
      expect(res.headers.get("x-middleware-next"), path).toBe("1");
      expect(forwarded(res, NAME), path).toBe(TB);
    }
  });

  it("site-a forwards website and both paths with A and refuses every account path", async () => {
    for (const path of [
      "/",
      "/workers",
      "/privacy",
      "/terms",
      "/cookies",
      "/help/about",
    ]) {
      const res = await donorModule.proxy(
        donorRequest(SITE_A, path, { headers: { [NAME]: TB } }),
      );
      expect(res.headers.get("x-middleware-next"), path).toBe("1");
      expect(forwarded(res, NAME), path).toBe(TA);
    }

    const accountPaths = [
      "/login",
      "/register",
      "/forgot-password",
      "/forgot-password/callback",
      "/auth/callback",
      "/checkout",
      "/no-access",
      "/donor-dashboard",
      "/donor-dashboard/settings",
      "/api/profile",
    ];
    state.userId = USER_D;
    state.rows = [D_A, D_B];
    for (const path of accountPaths) {
      state.lookups = [];
      state.sessionReads = 0;
      await expectRefused(
        await donorModule.proxy(donorRequest(SITE_A, path)),
        path,
      );
      expect(state.sessionReads).toBe(0);
      expect(state.lookups).toEqual([SITE_A]);
    }
  });

  it("second-a forwards website paths with A and refuses every account path", async () => {
    const home = await donorModule.proxy(donorRequest(SECOND_A, "/"));
    expect(home.headers.get("x-middleware-next")).toBe("1");
    expect(forwarded(home, NAME)).toBe(TA);

    state.userId = USER_D;
    state.rows = [D_A, D_B];
    for (const path of [
      "/login",
      "/register",
      "/forgot-password",
      "/auth/callback",
      "/checkout",
      "/no-access",
      "/donor-dashboard",
      "/api/profile",
    ]) {
      state.lookups = [];
      state.sessionReads = 0;
      await expectRefused(
        await donorModule.proxy(donorRequest(SECOND_A, path)),
        path,
      );
      expect(state.sessionReads).toBe(0);
      expect(state.lookups).toEqual([SECOND_A]);
    }
  });
});
