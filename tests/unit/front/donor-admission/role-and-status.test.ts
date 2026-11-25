import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  D_A,
  D_B,
  donorRequest,
  E_A,
  forwarded,
  HOME_A,
  HOME_B,
  NAME,
  resetOnMode,
  TA,
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

describe("on: donor dashboard role check and status through membership", () => {
  it("admits D on both home-a and home-b, and redirects E on home-b to /no-access (D-18: AL-2676: ruling WP3b part 2 Q4 sends a signed-in donor with no row in the name's organization to /no-access when the switch is on)", async () => {
    state.userId = USER_D;
    state.rows = [D_A, D_B];
    const onA = await donorModule.proxy(
      donorRequest(HOME_A, "/donor-dashboard"),
    );
    expect(onA.headers.get("x-middleware-next")).toBe("1");
    expect(forwarded(onA, NAME)).toBe(TA);

    const onB = await donorModule.proxy(
      donorRequest(HOME_B, "/donor-dashboard"),
    );
    expect(onB.headers.get("x-middleware-next")).toBe("1");
    expect(forwarded(onB, NAME)).toBe(TB);

    state.userId = USER_E;
    state.rows = [E_A];
    const eOnB = await donorModule.proxy(
      donorRequest(HOME_B, "/donor-dashboard"),
    );
    expect(eOnB.status).toBe(307);
    expect(new URL(eOnB.headers.get("location")!).pathname).toBe("/no-access");
  });

  it("when B is suspended or D's row in B is revoked: signed-out /login 200, signed-in /donor-dashboard redirects to /no-access (D-18: AL-2676: ruling WP3b part 2 Q4 sends a signed-in donor with no row in the name's organization to /no-access when the switch is on)", async () => {
    state.rows = [D_A];
    state.userId = null;
    const signedOutLogin = await donorModule.proxy(
      donorRequest(HOME_B, "/login"),
    );
    expect(signedOutLogin.status).toBe(200);
    expect(signedOutLogin.headers.get("x-middleware-next")).toBe("1");
    expect(forwarded(signedOutLogin, NAME)).toBe(TB);

    state.userId = USER_D;
    const signedInDashboard = await donorModule.proxy(
      donorRequest(HOME_B, "/donor-dashboard"),
    );
    expect(signedInDashboard.status).toBe(307);
    expect(new URL(signedInDashboard.headers.get("location")!).pathname).toBe(
      "/no-access",
    );
  });
});
