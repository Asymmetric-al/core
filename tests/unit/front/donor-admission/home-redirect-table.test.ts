import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  D_A,
  D_B,
  expectRefused,
  forwarded,
  NAME,
  TA,
  TB,
  USER_D,
} from "./fixtures";
import {
  BARE_B,
  expectHomeRedirect,
  HOME_A,
  HOME_B,
  homeLocation,
  ORPHAN_A,
  READY_B,
  READY_SITE_A,
  resetHomeMode,
  SECOND_A,
  SITE_A,
  siteRequest,
  STAFF_A,
  UNKNOWN,
} from "./home-fixtures";

import type { Answer, Init } from "./fixtures";

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

function fresh() {
  state.lookups = [];
  state.homeReads = [];
  state.sessionReads = 0;
}

const SAME_PATH: Array<[string, string]> = [
  ["/register", "/register"],
  ["/register/x", "/register/x"],
  ["/forgot-password", "/forgot-password"],
  ["/forgot-password/callback", "/forgot-password/callback"],
  ["/forgot-password/reset", "/forgot-password/reset"],
  ["/auth/callback", "/auth/callback"],
  ["/donor-dashboard", "/donor-dashboard"],
  ["/donor-dashboard/history", "/donor-dashboard/history"],
  ["/%72egister", "/register"],
  ["/register/", "/register"],
];

const CONTROL_AND_RESERVED = [
  "/register/..%0a/login",
  "/register/..%0d/login",
  "/register/%09..",
  "/donor-dashboard/..%0a",
  "/register/x%00",
  "/register/x%1f",
  "/register/x%7f",
  "/register/a%20b",
  "/register/caf%C3%A9",
  "/register/x%3Fy",
  "/donor-dashboard/x%23y",
];

describe("on: index table 6.1, the path forms on a Site name and the branch that answers", () => {
  it.each(["GET", "HEAD"])(
    "%s of each account root on site-a redirects 307 to the same path on home, one lookup and one home read",
    async (method) => {
      for (const [path, target] of SAME_PATH) {
        fresh();
        await expectHomeRedirect(
          await donorModule.proxy(siteRequest(SITE_A, path, { method })),
          homeLocation(target),
          `${method} ${path}`,
        );
        expect(state.lookups, path).toEqual([SITE_A]);
        expect(state.homeReads, path).toEqual([SITE_A]);
        expect(state.sessionReads, path).toBe(0);
      }
    },
  );

  it("redirects second-a (website and donor_account, not home) the same way", async () => {
    for (const path of [
      "/register",
      "/forgot-password",
      "/auth/callback",
      "/donor-dashboard",
    ]) {
      fresh();
      await expectHomeRedirect(
        await donorModule.proxy(siteRequest(SECOND_A, path)),
        homeLocation(path),
        path,
      );
      expect(state.homeReads, path).toEqual([SECOND_A]);
    }
  });

  it("sends a control character, whitespace, non-ASCII, ? or # under a root to /donor-dashboard with no query, never /login, / or /admin", async () => {
    for (const path of CONTROL_AND_RESERVED) {
      fresh();
      const response = await donorModule.proxy(
        siteRequest(SITE_A, `${path}?next=/donor-dashboard`),
      );
      await expectHomeRedirect(
        response,
        homeLocation("/donor-dashboard", "?next=%2Fdonor-dashboard"),
        path,
      );
      fresh();
      await expectHomeRedirect(
        await donorModule.proxy(siteRequest(SITE_A, path)),
        homeLocation("/donor-dashboard"),
        path,
      );
      expect(state.homeReads, path).toEqual([SITE_A]);
    }
  });

  it("refuses /register%3Fnext=//evil before the lookup (part 1, //)", async () => {
    fresh();
    state.clients = 0;
    await expectRefused(
      await donorModule.proxy(siteRequest(SITE_A, "/register%3Fnext=//evil")),
      "/register%3Fnext=//evil",
    );
    expect(state.lookups).toEqual([]);
    expect(state.homeReads).toEqual([]);
    expect(state.clients).toBe(0);
  });

  it("forwards /donor-dashboard%23x and /register%0a as website paths with A (not under a root)", async () => {
    for (const path of ["/donor-dashboard%23x", "/register%0a"]) {
      fresh();
      const response = await donorModule.proxy(
        siteRequest(SITE_A, path, { headers: { [NAME]: TB } }),
      );
      expect(response.headers.get("x-middleware-next"), path).toBe("1");
      expect(forwarded(response, NAME), path).toBe(TA);
      expect(state.homeReads, path).toEqual([]);
    }
  });

  it("keeps part 1's 404 with zero home reads for /login, /login/x, /checkout, /no-access and /api/profile", async () => {
    for (const path of [
      "/login",
      "/login/x",
      "/checkout",
      "/no-access",
      "/api/profile",
    ]) {
      fresh();
      await expectRefused(
        await donorModule.proxy(siteRequest(SITE_A, path)),
        path,
      );
      expect(state.lookups, path).toEqual([SITE_A]);
      expect(state.homeReads, path).toEqual([]);
      expect(state.sessionReads, path).toBe(0);
    }
  });

  it("keeps part 1's 404 with zero home reads for POST /register, PUT /donor-dashboard and OPTIONS /register", async () => {
    for (const [method, path] of [
      ["POST", "/register"],
      ["PUT", "/donor-dashboard"],
      ["OPTIONS", "/register"],
    ] as const) {
      fresh();
      await expectRefused(
        await donorModule.proxy(siteRequest(SITE_A, path, { method })),
        `${method} ${path}`,
      );
      expect(state.homeReads, `${method} ${path}`).toEqual([]);
      expect(state.sessionReads, `${method} ${path}`).toBe(0);
    }
  });

  it("keeps part 1's 404 with zero home reads for DELETE /register and PATCH /donor-dashboard: only GET and HEAD redirect, every other method keeps the account refusal (guard)", async () => {
    for (const [method, path] of [
      ["DELETE", "/register"],
      ["PATCH", "/donor-dashboard"],
    ] as const) {
      fresh();
      await expectRefused(
        await donorModule.proxy(siteRequest(SITE_A, path, { method })),
        `${method} ${path}`,
      );
      expect(state.lookups, `${method} ${path}`).toEqual([SITE_A]);
      expect(state.homeReads, `${method} ${path}`).toEqual([]);
      expect(state.sessionReads, `${method} ${path}`).toBe(0);
    }
  });

  it("in a direct proxy() call keeps 404 with zero home reads for a .rsc or .segments/ form (a server strips one .rsc first, so live /register.rsc arrives as /register and gets the 307)", async () => {
    for (const path of [
      "/register.rsc",
      "/donor-dashboard.rsc",
      "/register.segments/_tree.segment.rsc",
      "/register.segments/_tree.segment",
    ]) {
      fresh();
      await expectRefused(
        await donorModule.proxy(siteRequest(SITE_A, path)),
        path,
      );
      expect(state.lookups, path).toEqual([SITE_A]);
      expect(state.homeReads, path).toEqual([]);
    }
    fresh();
    await expectHomeRedirect(
      await donorModule.proxy(siteRequest(SITE_A, "/register")),
      homeLocation("/register"),
      "/register as a server passes /register.rsc",
    );
  });

  it("reads no request header to decide: /register with rsc: 1 or next-router-prefetch: 1 gets the same 307", async () => {
    for (const headers of [
      { rsc: "1" },
      { "next-router-prefetch": "1" },
      {
        rsc: "1",
        "next-router-prefetch": "1",
        "next-router-segment-prefetch": "/_tree",
      },
    ]) {
      fresh();
      await expectHomeRedirect(
        await donorModule.proxy(siteRequest(SITE_A, "/register", { headers })),
        homeLocation("/register"),
        JSON.stringify(headers),
      );
    }
  });

  it("gives the same redirect signed in or signed out, with zero session reads", async () => {
    for (const userId of [null, USER_D]) {
      fresh();
      state.userId = userId;
      state.rows = userId ? [D_A, D_B] : [];
      await expectHomeRedirect(
        await donorModule.proxy(
          siteRequest(SITE_A, "/donor-dashboard", {
            headers: { cookie: "sb-access-token=x" },
          }),
        ),
        homeLocation("/donor-dashboard"),
        String(userId),
      );
      expect(state.sessionReads).toBe(0);
    }
  });

  it("refuses orphan-a /register with 404 when the home read gives no row", async () => {
    fresh();
    await expectRefused(
      await donorModule.proxy(siteRequest(ORPHAN_A, "/register")),
      "orphan-a",
    );
    expect(state.lookups).toEqual([ORPHAN_A]);
    expect(state.homeReads).toEqual([ORPHAN_A]);
  });

  it("answers 503 no-store when the home read is unavailable", async () => {
    state.homeAnswer = () => ({ data: null, error: { message: "down" } });
    fresh();
    await expectRefused(
      await donorModule.proxy(siteRequest(SITE_A, "/register")),
      "unavailable",
      503,
    );
    expect(state.homeReads).toEqual([SITE_A]);
    expect(state.sessionReads).toBe(0);
  });
});

describe("on: names that never redirect make zero home reads", () => {
  it("forwards each root on the home names with their own organization", async () => {
    for (const [host, tenant] of [
      [HOME_A, TA],
      [HOME_B, TB],
      [BARE_B, TB],
    ] as const) {
      for (const path of ["/register", "/forgot-password", "/auth/callback"]) {
        fresh();
        const response = await donorModule.proxy(
          siteRequest(host, path, { url: `http://${host}${path}` }),
        );
        expect(
          response.headers.get("x-middleware-next"),
          `${host} ${path}`,
        ).toBe("1");
        expect(forwarded(response, NAME), `${host} ${path}`).toBe(tenant);
        expect(state.homeReads, `${host} ${path}`).toEqual([]);
      }
    }
  });

  it("keeps 404 for staff-a, ready-site-a, ready-b and an unknown name", async () => {
    for (const host of [STAFF_A, READY_SITE_A, READY_B, UNKNOWN]) {
      for (const path of ["/register", "/donor-dashboard", "/auth/callback"]) {
        fresh();
        const init: Init & { url: string } = { url: `http://${host}${path}` };
        await expectRefused(
          await donorModule.proxy(siteRequest(host, path, init)),
          `${host} ${path}`,
        );
        expect(state.lookups, `${host} ${path}`).toEqual([host]);
        expect(state.homeReads, `${host} ${path}`).toEqual([]);
        expect(state.sessionReads, `${host} ${path}`).toBe(0);
      }
    }
  });
});
