import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  expectHomeRedirect,
  homeLocation,
  resetHomeMode,
  SITE_A,
  siteRequest,
} from "./home-fixtures";

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
const { homeRedirect, homeRedirectPath } =
  await import("../../../../apps/donor/lib/home-redirect");

beforeEach(() => {
  resetHomeMode(state);
});

afterEach(() => {
  vi.unstubAllEnvs();
});

const DROPPED = [
  "//evil.example",
  "/\\evil.example",
  "%2F%2Fevil.example",
  "/%2F%2Fevil.example",
  "/%252F%252Fevil.example",
  "https://evil.example",
  "HTTPS:evil.example",
  "javascript:alert(1)",
  "/a//b",
  "/a/../b",
  "/./b",
  "/a/..?x",
  "/%0d%0aset-cookie:x",
  "/%09x",
  "/%C2%A0x",
  "/%E2%80%A8x",
  "/%EF%BB%BFx",
  "/caf%C3%A9",
  "/a%23b",
  "%20/a",
  "/login",
  "/register?x",
  "/auth/callback",
  "/api/auth/x",
  "",
  "/a'b",
];

const KEPT: Array<[string, string]> = [
  ["/donor-dashboard", "/donor-dashboard"],
  ["/donor-dashboard/history?year=2025", "/donor-dashboard/history?year=2025"],
  ["/workers/abc", "/workers/abc"],
  ["/a?b=/../c", "/a?b=/../c"],
];

describe("on: index table 6.2, next on GET /register (every row the redirect branch)", () => {
  it.each(DROPPED)(
    "drops next=%s silently and still redirects",
    async (raw) => {
      await expectHomeRedirect(
        await donorModule.proxy(siteRequest(SITE_A, `/register?next=${raw}`)),
        homeLocation("/register"),
        raw,
      );
      expect(state.homeReads).toEqual([SITE_A]);
    },
  );

  it("drops two next keys", async () => {
    await expectHomeRedirect(
      await donorModule.proxy(
        siteRequest(
          SITE_A,
          "/register?next=/donor-dashboard&next=/workers/abc",
        ),
      ),
      homeLocation("/register"),
      "two keys",
    );
  });

  it.each(KEPT)("keeps next=%s exactly", async (raw, value) => {
    await expectHomeRedirect(
      await donorModule.proxy(siteRequest(SITE_A, `/register?next=${raw}`)),
      homeLocation("/register", `?next=${encodeURIComponent(value)}`),
      raw,
    );
  });

  it("drops every other key, code included", async () => {
    const others =
      "code=x&type=recovery&token_hash=t&error=e&utm_source=s&tenant=00000000-0000-0000-0000-000000000002&host=evil.example";
    await expectHomeRedirect(
      await donorModule.proxy(siteRequest(SITE_A, `/register?${others}`)),
      homeLocation("/register"),
      "others alone",
    );
    await expectHomeRedirect(
      await donorModule.proxy(
        siteRequest(SITE_A, `/auth/callback?${others}&next=/donor-dashboard`),
      ),
      homeLocation("/auth/callback", "?next=%2Fdonor-dashboard"),
      "others with next",
    );
  });
});

describe("on: the path under a root, every hostile form lands on /donor-dashboard", () => {
  it.each([
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
  ])("%s goes to /donor-dashboard, never /login, / or /admin", async (path) => {
    const response = await donorModule.proxy(siteRequest(SITE_A, path));
    await expectHomeRedirect(response, homeLocation("/donor-dashboard"), path);
    const target = new URL(response.headers.get("location")!);
    expect(target.pathname).toBe("/donor-dashboard");
  });

  it("the path function keeps a root path and otherwise answers /donor-dashboard, called directly", () => {
    expect(homeRedirectPath("/register")).toBe("/register");
    expect(homeRedirectPath("/forgot-password/reset")).toBe(
      "/forgot-password/reset",
    );
    expect(homeRedirectPath("/donor-dashboard/history")).toBe(
      "/donor-dashboard/history",
    );
    for (const path of [
      "/login",
      "/",
      "/admin",
      "/registerx",
      "/register\n/../login",
      "/register/..\n/login",
      "/register/a b",
      "/register/café",
      "/register/x?y",
      "/register/x#y",
      "/register/x%41",
      "/register/x\\y",
      "register",
      "",
    ]) {
      expect(homeRedirectPath(path), JSON.stringify(path)).toBe(
        "/donor-dashboard",
      );
    }
  });

  it("the last check refuses with 404 a Location the URL parser would rewrite, and keeps one it would not", async () => {
    const at = { port: "25200", searchParams: new URLSearchParams() };
    for (const path of ["/register/../login", "/register/./x"]) {
      const refused = homeRedirect("home-a.localhost", at, path);
      expect(refused.status, path).toBe(404);
      expect(refused.headers.get("cache-control"), path).toBe("no-store");
      expect(refused.headers.get("location"), path).toBeNull();
      expect(await refused.text(), path).toBe("");
    }
    const kept = homeRedirect("home-a.localhost", at, "/register/a.b~c");
    expect(kept.status).toBe(307);
    expect(kept.headers.get("location")).toBe(
      "http://home-a.localhost:25200/register/a.b~c",
    );
  });
});
