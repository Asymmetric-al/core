import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  D_A,
  D_B,
  donorRequest,
  E_A,
  forwarded,
  HOME_B,
  NAME,
  resetOnMode,
  TB,
  USER_D,
  USER_E,
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

describe.each([
  ["unset", undefined],
  ["0", "0"],
] as const)(
  "off (switch %s): donor proxy is byte-for-byte today with no lookup client",
  (_label, value) => {
    beforeEach(() => {
      state.offMode = true;
      vi.stubEnv("CORE_SERVE_UNDER_PATHS", value);
      vi.stubEnv("CORE_APP_BASE_PATH", "");
    });

    it("gives the same concrete answers with or without client x-asym-name-tenant and host: home-b", async () => {
      const withHeaders = { [NAME]: TB, host: HOME_B };
      const withoutHeaders = { host: "localhost:3000" };

      const homeWith = await donorModule.proxy(
        donorRequest(HOME_B, "/", { headers: withHeaders }),
      );
      const homeWithout = await donorModule.proxy(
        donorRequest("localhost:3000", "/", { headers: withoutHeaders }),
      );
      expect(homeWith.status).toBe(200);
      expect(homeWith.headers.get("x-middleware-next")).toBe("1");
      expect(homeWithout.headers.get("x-middleware-next")).toBe("1");
      expect(forwarded(homeWith, NAME)).toBeNull();
      expect(homeWith.headers.get("set-cookie")).toBe(
        homeWithout.headers.get("set-cookie"),
      );

      state.userId = null;
      const anonWith = await donorModule.proxy(
        donorRequest(HOME_B, "/donor-dashboard", { headers: withHeaders }),
      );
      const anonWithout = await donorModule.proxy(
        donorRequest("localhost:3000", "/donor-dashboard", {
          headers: withoutHeaders,
        }),
      );
      expect(anonWith.status).toBe(307);
      expect(anonWithout.status).toBe(307);
      expect(
        new URL(anonWith.headers.get("location")!).pathname +
          new URL(anonWith.headers.get("location")!).search,
      ).toBe("/login?next=%2Fdonor-dashboard");
      expect(
        new URL(anonWithout.headers.get("location")!).pathname +
          new URL(anonWithout.headers.get("location")!).search,
      ).toBe("/login?next=%2Fdonor-dashboard");

      state.userId = USER_E;
      state.rows = [E_A];
      const eWith = await donorModule.proxy(
        donorRequest(HOME_B, "/donor-dashboard", { headers: withHeaders }),
      );
      const eWithout = await donorModule.proxy(
        donorRequest("localhost:3000", "/donor-dashboard", {
          headers: withoutHeaders,
        }),
      );
      expect(eWith.status).toBe(200);
      expect(eWith.headers.get("x-middleware-next")).toBe("1");
      expect(eWithout.headers.get("x-middleware-next")).toBe("1");
      expect(forwarded(eWith, NAME)).toBeNull();
      expect(eWith.headers.get("set-cookie")).toContain("sb-refreshed=fresh");
      expect(eWith.headers.get("set-cookie")).toBe(
        eWithout.headers.get("set-cookie"),
      );

      state.userId = USER_D;
      state.rows = [D_A, D_B];
      const dWith = await donorModule.proxy(
        donorRequest(HOME_B, "/donor-dashboard", { headers: withHeaders }),
      );
      const dWithout = await donorModule.proxy(
        donorRequest("localhost:3000", "/donor-dashboard", {
          headers: withoutHeaders,
        }),
      );
      expect(dWith.status).toBe(307);
      expect(dWithout.status).toBe(307);
      expect(new URL(dWith.headers.get("location")!).pathname).toBe("/");
      expect(new URL(dWithout.headers.get("location")!).pathname).toBe("/");

      const apiWith = await donorModule.proxy(
        donorRequest(HOME_B, "/api/profile", { headers: withHeaders }),
      );
      const apiWithout = await donorModule.proxy(
        donorRequest("localhost:3000", "/api/profile", {
          headers: withoutHeaders,
        }),
      );
      expect(apiWith.status).toBe(200);
      expect(apiWith.headers.get("x-middleware-next")).toBe("1");
      expect(apiWithout.headers.get("x-middleware-next")).toBe("1");
      expect(forwarded(apiWith, "x-asym-role-class")).toBe("donor");
      expect(forwarded(apiWithout, "x-asym-role-class")).toBe("donor");
      expect(forwarded(apiWith, NAME)).toBeNull();
      expect(forwarded(apiWithout, NAME)).toBeNull();
      expect(state.lookupClients).toBe(0);
      expect(state.lookups).toEqual([]);
    });

    it("keeps today's answers on requests the on branch refuses or rewrites, including no host", async () => {
      state.userId = null;
      for (const path of [
        "/a%5clogin",
        "/%61dmin/x",
        "/admin/x",
        "/login.segments/_tree.segment",
      ]) {
        state.sessionReads = 0;
        const res = await donorModule.proxy(
          donorRequest(HOME_B, path, { headers: { [NAME]: TB } }),
        );
        expect(res.status, path).toBe(200);
        expect(res.headers.get("x-middleware-next"), path).toBe("1");
        expect(res.headers.get("x-middleware-rewrite"), path).toBeNull();
        expect(res.headers.get("cache-control"), path).not.toBe("no-store");
        expect(forwarded(res, "x-asym-pathname"), path).toBe(path);
        expect(forwarded(res, "x-asym-role-class"), path).toBe("donor");
        expect(forwarded(res, NAME), path).toBeNull();
        expect(state.sessionReads, path).toBe(1);
        expect(state.lookupClients, path).toBe(0);
      }

      state.sessionReads = 0;
      const encodedApi = await donorModule.proxy(
        donorRequest(HOME_B, "/api/health%2F", { headers: { [NAME]: TB } }),
      );
      expect(encodedApi.status).toBe(200);
      expect(encodedApi.headers.get("x-middleware-next")).toBe("1");
      expect(encodedApi.headers.get("x-middleware-rewrite")).toBeNull();
      expect(encodedApi.headers.get("cache-control")).not.toBe("no-store");
      expect(forwarded(encodedApi, "x-asym-pathname")).toBe("/api/health%2F");
      expect(forwarded(encodedApi, "x-asym-role-class")).toBe("donor");
      expect(forwarded(encodedApi, NAME)).toBeNull();
      expect(state.sessionReads).toBe(0);
      expect(state.lookupClients).toBe(0);

      const noHostHome = await donorModule.proxy(donorRequest(null, "/"));
      expect(noHostHome.status).toBe(200);
      expect(noHostHome.headers.get("x-middleware-next")).toBe("1");
      expect(noHostHome.headers.get("x-middleware-rewrite")).toBeNull();
      expect(noHostHome.headers.get("cache-control")).not.toBe("no-store");
      expect(forwarded(noHostHome, "x-asym-pathname")).toBe("/");
      expect(forwarded(noHostHome, NAME)).toBeNull();

      const noHostDash = await donorModule.proxy(
        donorRequest(null, "/donor-dashboard"),
      );
      expect(noHostDash.status).toBe(307);
      expect(noHostDash.headers.get("x-middleware-rewrite")).toBeNull();
      expect(
        new URL(noHostDash.headers.get("location")!).pathname +
          new URL(noHostDash.headers.get("location")!).search,
      ).toBe("/login?next=%2Fdonor-dashboard");
      expect(state.lookupClients).toBe(0);
      expect(state.lookups).toEqual([]);
    });
  },
);
