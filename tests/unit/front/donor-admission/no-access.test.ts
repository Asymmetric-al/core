import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { E_A, forwarded, NAME, TA, TB, USER_E } from "./fixtures";
import { BARE_B, HOME_B, resetHomeMode, siteRequest } from "./home-fixtures";

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

describe("on: a signed-in donor with no row in the name's organization goes to /no-access (ruling Q4)", () => {
  it.each([
    [BARE_B, "/donor-dashboard"],
    [BARE_B, "/login"],
    [BARE_B, "/register"],
    [HOME_B, "/donor-dashboard"],
    [HOME_B, "/login"],
    [HOME_B, "/register"],
  ])("E (a donor of A only) on %s %s", async (host, path) => {
    state.userId = USER_E;
    state.rows = [E_A];
    const response = await donorModule.proxy(
      siteRequest(host, path, { url: `http://${host}${path}` }),
    );
    expect(response.status).toBe(307);
    const location = new URL(response.headers.get("location")!);
    expect(location.host).toBe(host);
    expect(location.pathname + location.search).toBe("/no-access");
    expect(state.homeReads).toEqual([]);
  });

  it("bare-b serves /no-access to E and to a signed-out visitor, with B", async () => {
    for (const userId of [USER_E, null]) {
      state.userId = userId;
      state.rows = userId ? [E_A] : [];
      const response = await donorModule.proxy(
        siteRequest(BARE_B, "/no-access", {
          url: `http://${BARE_B}/no-access`,
          headers: { [NAME]: TA },
        }),
      );
      expect(response.headers.get("x-middleware-next")).toBe("1");
      expect(forwarded(response, NAME)).toBe(TB);
    }
  });
});

describe("ruling Q4's mechanism: the auth options are written once", () => {
  const source = readFileSync(
    fileURLToPath(new URL("../../../../apps/donor/proxy.ts", import.meta.url)),
    "utf8",
  );
  const count = (pattern: RegExp) => [...source.matchAll(pattern)].length;

  it("names each list and the role resolver exactly once in apps/donor/proxy.ts", () => {
    expect(count(/\bpublicRoutes:/g)).toBe(1);
    expect(count(/\bprotectedRoutePrefixes:/g)).toBe(1);
    expect(count(/\ballowedRoles:/g)).toBe(1);
    expect(count(/\bresolveUserRole:/g)).toBe(1);
    expect(count(/\bunauthorizedRedirectTo:/g)).toBe(2);
  });

  it("creates the off instance from the options unchanged and the on instance from them with only unauthorizedRedirectTo replaced", () => {
    const options = source.match(
      /const (\w+): AuthMiddlewareOptions = \{[\s\S]*?unauthorizedRedirectTo: "\/",[\s\S]*?\n\};/,
    )?.[1];
    expect(options).toBeTruthy();
    expect(source).toMatch(
      new RegExp(`= createAuthMiddleware\\(${options}\\);`),
    );
    expect(source).toMatch(
      new RegExp(
        `= createAuthMiddleware\\(\\{\\s*\\.\\.\\.${options},\\s*unauthorizedRedirectTo: "/no-access",\\s*\\}\\);`,
      ),
    );
    expect(count(/createAuthMiddleware\(/g)).toBe(2);
  });
});
