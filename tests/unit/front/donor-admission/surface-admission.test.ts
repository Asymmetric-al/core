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
  homeReads: [] as string[],
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
        if (fn === "resolve_home_host") {
          state.homeReads.push(args.p_host);
          return {
            abortSignal: () =>
              Promise.resolve({
                data: [{ primary_domain: "home-a.localhost" }],
                error: null,
              }),
          };
        }
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
  state.homeReads = [];
});

async function expectHomeRedirect(response: Response, path: string) {
  expect(response.status, path).toBe(307);
  expect(response.headers.get("location"), path).toBe(
    `http://home-a.localhost:25160${path}`,
  );
  expect(response.headers.get("cache-control"), path).toBe("no-store");
  expect(response.headers.get("referrer-policy"), path).toBe("no-referrer");
  expect(await response.text(), path).toBe("");
  expect(response.headers.get("set-cookie"), path).toBeNull();
  expect(response.headers.get("x-middleware-next"), path).toBeNull();
}

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

  it("site-a forwards website and both paths with A, sends the four account roots home and refuses every other account path (D-18: AL-2676: WP3b part 2 redirects sign-up, recovery, the callback and the dashboard of a Site name to home)", async () => {
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

    const redirectedPaths = [
      "/register",
      "/forgot-password",
      "/forgot-password/callback",
      "/auth/callback",
      "/donor-dashboard",
      "/donor-dashboard/settings",
    ];
    const accountPaths = ["/login", "/checkout", "/no-access", "/api/profile"];
    state.userId = USER_D;
    state.rows = [D_A, D_B];
    for (const path of redirectedPaths) {
      state.lookups = [];
      state.homeReads = [];
      state.sessionReads = 0;
      await expectHomeRedirect(
        await donorModule.proxy(donorRequest(SITE_A, path)),
        path,
      );
      expect(state.sessionReads).toBe(0);
      expect(state.lookups).toEqual([SITE_A]);
      expect(state.homeReads).toEqual([SITE_A]);
    }
    for (const path of accountPaths) {
      state.lookups = [];
      state.homeReads = [];
      state.sessionReads = 0;
      await expectRefused(
        await donorModule.proxy(donorRequest(SITE_A, path)),
        path,
      );
      expect(state.sessionReads).toBe(0);
      expect(state.lookups).toEqual([SITE_A]);
      expect(state.homeReads).toEqual([]);
    }
  });

  it("second-a forwards website paths with A, sends the four account roots home and refuses every other account path (D-18: AL-2676: WP3b part 2 redirects sign-up, recovery, the callback and the dashboard of a Site name to home)", async () => {
    const home = await donorModule.proxy(donorRequest(SECOND_A, "/"));
    expect(home.headers.get("x-middleware-next")).toBe("1");
    expect(forwarded(home, NAME)).toBe(TA);

    state.userId = USER_D;
    state.rows = [D_A, D_B];
    for (const path of [
      "/register",
      "/forgot-password",
      "/auth/callback",
      "/donor-dashboard",
    ]) {
      state.lookups = [];
      state.homeReads = [];
      state.sessionReads = 0;
      await expectHomeRedirect(
        await donorModule.proxy(donorRequest(SECOND_A, path)),
        path,
      );
      expect(state.sessionReads).toBe(0);
      expect(state.lookups).toEqual([SECOND_A]);
      expect(state.homeReads).toEqual([SECOND_A]);
    }
    for (const path of ["/login", "/checkout", "/no-access", "/api/profile"]) {
      state.lookups = [];
      state.homeReads = [];
      state.sessionReads = 0;
      await expectRefused(
        await donorModule.proxy(donorRequest(SECOND_A, path)),
        path,
      );
      expect(state.sessionReads).toBe(0);
      expect(state.lookups).toEqual([SECOND_A]);
      expect(state.homeReads).toEqual([]);
    }
  });
});

const GIVING_PATHS = ["/checkout", "/api/checkout/config", "/api/donate"];

async function freshProxy() {
  vi.resetModules();
  return (await import("../../../../apps/donor/proxy")).proxy;
}

function openGiving() {
  vi.stubEnv("GUEST_GIVING_ENABLED", "true");
  vi.stubEnv("TURNSTILE_SECRET_KEY", "1x0000000000000000000000000000000AA");
  vi.stubEnv("NEXT_PUBLIC_TURNSTILE_SITE_KEY", "1x00000000000000000000AA");
  vi.stubEnv("NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY", "pk_test_51giving");
}

describe("AL-2681 PR 2b item zero 3: the giving routes on a website-only name, behind the switch and every control", () => {
  it("on, giving open: a website-only Site name forwards the checkout, the config read and the intake with its organization, signed out and never sent to sign-in", async () => {
    openGiving();
    const proxy = await freshProxy();
    for (const path of GIVING_PATHS) {
      state.lookups = [];
      const res = await proxy(
        donorRequest(SITE_A, path, { headers: { [NAME]: TB } }),
      );
      expect(res.headers.get("x-middleware-next"), path).toBe("1");
      expect(forwarded(res, NAME), path).toBe(TA);
      expect(state.lookups, path).toEqual([SITE_A]);
    }
  });

  it("on, giving open: an account-only home forwards the checkout with its organization, signed out, for account mode", async () => {
    openGiving();
    const proxy = await freshProxy();
    const res = await proxy(
      donorRequest(BARE_B, "/checkout", { headers: { [NAME]: TA } }),
    );
    expect(res.headers.get("x-middleware-next")).toBe("1");
    expect(forwarded(res, NAME)).toBe(TB);
  });

  it.each([
    ["GUEST_GIVING_ENABLED", "false"],
    ["TURNSTILE_SECRET_KEY", ""],
    ["NEXT_PUBLIC_TURNSTILE_SITE_KEY", ""],
    ["NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY", "pk_live_51giving"],
  ])(
    "guard: with %s set to %j the giving routes stay account roots, refused on a website-only Site name",
    async (name, value) => {
      openGiving();
      vi.stubEnv(name, value);
      const proxy = await freshProxy();
      for (const path of GIVING_PATHS)
        await expectRefused(await proxy(donorRequest(SITE_A, path)), path);
    },
  );

  it("off, giving open: the checkout is not a protected path, so a signed-out visitor is not sent to sign-in", async () => {
    openGiving();
    const proxy = await freshProxy();
    state.offMode = true;
    vi.stubEnv("CORE_SERVE_UNDER_PATHS", "");
    const res = await proxy(donorRequest(SITE_A, "/checkout"));
    expect(res.status).not.toBe(307);
    expect(res.headers.get("x-middleware-next")).toBe("1");
  });

  it("guard: off, giving closed: a signed-out visitor to the checkout is sent to sign-in with the gift kept", async () => {
    state.offMode = true;
    vi.stubEnv("CORE_SERVE_UNDER_PATHS", "");
    const proxy = await freshProxy();
    const res = await proxy(
      donorRequest(SITE_A, "/checkout?fund_id=f-1&amount=25"),
    );
    expect(res.status).toBe(307);
    const location = new URL(res.headers.get("location")!);
    expect(location.pathname).toBe("/login");
    expect(location.searchParams.get("next")).toContain("/checkout");
  });
});
