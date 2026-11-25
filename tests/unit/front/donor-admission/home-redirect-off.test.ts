import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { D_A, D_B, E_A, forwarded, NAME, USER_D, USER_E } from "./fixtures";
import { HOME_B, resetHomeMode, SITE_A, siteRequest } from "./home-fixtures";

import type { Answer } from "./fixtures";

const state = vi.hoisted(() => ({
  userId: null as string | null,
  rows: [] as unknown[],
  refreshCookie: true,
  sessionReads: 0,
  clients: 0,
  lookups: [] as string[],
  homeReads: [] as string[],
  offMode: false,
  answer: (() => ({ data: [], error: null })) as (
    host: string,
    callIndex: number,
  ) => Answer,
  homeAnswer: (() => ({ data: [], error: null })) as (
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
    state.clients += 1;
    return {
      rpc: (fn: string, args: { p_host: string }) => {
        if (fn === "resolve_verified_host") {
          state.lookups.push(args.p_host);
          const answer = state.answer(args.p_host, state.lookups.length);
          return { abortSignal: () => Promise.resolve(answer) };
        }
        if (fn === "resolve_home_host") {
          state.homeReads.push(args.p_host);
          const answer = state.homeAnswer(args.p_host, state.homeReads.length);
          return { abortSignal: () => Promise.resolve(answer) };
        }
        throw new Error(fn);
      },
    };
  },
}));

const donorModule = await import("../../../../apps/donor/proxy");

beforeEach(() => {
  resetHomeMode(state);
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe.each([
  ["unset", undefined],
  ["0", "0"],
] as const)(
  "off (switch %s): no home read, no redirect to home, the dashboard still sends D to /",
  (_label, value) => {
    beforeEach(() => {
      state.offMode = true;
      vi.stubEnv("CORE_SERVE_UNDER_PATHS", value);
    });

    afterEach(() => {
      expect(state.clients).toBe(0);
      expect(state.lookups).toEqual([]);
      expect(state.homeReads).toEqual([]);
    });

    it.each([
      "/register",
      "/forgot-password/callback?code=x",
      "/auth/callback?code=x&next=/donor-dashboard",
    ])("forwards %s on site-a as today", async (path) => {
      const response = await donorModule.proxy(siteRequest(SITE_A, path));
      expect(response.status).toBe(200);
      expect(response.headers.get("x-middleware-next")).toBe("1");
      expect(response.headers.get("x-middleware-rewrite")).toBeNull();
      expect(response.headers.get("location")).toBeNull();
      expect(response.headers.get("referrer-policy")).toBeNull();
      expect(forwarded(response, "x-asym-pathname")).toBe(path.split("?")[0]);
      expect(forwarded(response, NAME)).toBeNull();
    });

    it("sends a signed-out /donor-dashboard on site-a to /login?next=%2Fdonor-dashboard on its own name", async () => {
      const response = await donorModule.proxy(
        siteRequest(SITE_A, "/donor-dashboard"),
      );
      expect(response.status).toBe(307);
      const location = new URL(response.headers.get("location")!);
      expect(location.host).toBe(SITE_A);
      expect(location.pathname + location.search).toBe(
        "/login?next=%2Fdonor-dashboard",
      );
    });

    it("on home-b /donor-dashboard sends D (rows in A and B) to / and forwards E (a row in A)", async () => {
      state.userId = USER_D;
      state.rows = [D_A, D_B];
      const d = await donorModule.proxy(
        siteRequest(HOME_B, "/donor-dashboard", {
          url: `http://${HOME_B}/donor-dashboard`,
        }),
      );
      expect(d.status).toBe(307);
      expect(new URL(d.headers.get("location")!).pathname).toBe("/");

      state.userId = USER_E;
      state.rows = [E_A];
      const e = await donorModule.proxy(
        siteRequest(HOME_B, "/donor-dashboard", {
          url: `http://${HOME_B}/donor-dashboard`,
        }),
      );
      expect(e.status).toBe(200);
      expect(e.headers.get("x-middleware-next")).toBe("1");
    });
  },
);
