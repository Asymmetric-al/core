import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { expectRefused } from "./fixtures";
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
const { homeRedirect } =
  await import("../../../../apps/donor/lib/home-redirect");

beforeEach(() => {
  resetHomeMode(state);
});

afterEach(() => {
  vi.unstubAllEnvs();
});

const URL_25200 = "http://site-a.localhost:25200/register";

const FORGED: Array<[string, Record<string, string>, string]> = [
  [
    "x-forwarded-host: evil.example",
    { "x-forwarded-host": "evil.example" },
    "",
  ],
  ["x-forwarded-proto: https", { "x-forwarded-proto": "https" }, ""],
  ["x-forwarded-port: 9999", { "x-forwarded-port": "9999" }, ""],
  ["referer: https://evil.example/", { referer: "https://evil.example/" }, ""],
  ["?host=evil.example", {}, "?host=evil.example"],
  ["host: site-a.localhost:9999", { host: "site-a.localhost:9999" }, ""],
  ["host: site-a.localhost:99999", { host: "site-a.localhost:99999" }, ""],
  ["host: site-a.localhost:0", { host: "site-a.localhost:0" }, ""],
  ["host: SITE-A.localhost.:25200", { host: "SITE-A.localhost.:25200" }, ""],
];

describe("on: only the home read decides the target (ruling 1 Q6, ruling Q2)", () => {
  it.each(FORGED)(
    "%s leaves Location at http://home-a.localhost:25200/register",
    async (_label, headers, query) => {
      const response = await donorModule.proxy(
        siteRequest(SITE_A, "/register", {
          url: `${URL_25200}${query}`,
          headers,
        }),
      );
      await expectHomeRedirect(response, homeLocation("/register"), _label);
      expect(state.homeReads).toEqual([headers.host ?? SITE_A]);
    },
  );

  it("all of them together leave Location at http://home-a.localhost:25200/register", async () => {
    const headers = Object.assign({}, ...FORGED.map(([, h]) => h), {
      host: "SITE-A.localhost.:25200",
    }) as Record<string, string>;
    await expectHomeRedirect(
      await donorModule.proxy(
        siteRequest(SITE_A, "/register", {
          url: `${URL_25200}?host=evil.example`,
          headers,
        }),
      ),
      homeLocation("/register"),
      "together",
    );
  });

  it("gives https: and no port for a stored name that is not .localhost", async () => {
    state.homeAnswer = () => ({
      data: [{ primary_domain: "home.example.org" }],
      error: null,
    });
    await expectHomeRedirect(
      await donorModule.proxy(
        siteRequest(SITE_A, "/register", {
          headers: { "x-forwarded-proto": "http" },
        }),
      ),
      "https://home.example.org/register",
      "home.example.org",
    );
  });

  it("gives http: and no port for a .localhost home when the listener port is the URL default", async () => {
    await expectHomeRedirect(
      await donorModule.proxy(
        siteRequest(SITE_A, "/register", {
          url: "http://site-a.localhost/register",
          headers: { host: "site-a.localhost" },
        }),
      ),
      "http://home-a.localhost/register",
      "no port",
    );
  });

  it("gives http: and no port for a .localhost home when the listener port is 80, the http default (a home that is not .localhost is https: with no port before this rule, so production names never reach it)", async () => {
    await expectHomeRedirect(
      await donorModule.proxy(
        siteRequest(SITE_A, "/register", {
          url: "https://site-a.localhost:80/register",
          headers: { host: "site-a.localhost" },
        }),
      ),
      "http://home-a.localhost/register",
      "listener port 80 through proxy()",
    );
    await expectHomeRedirect(
      homeRedirect(
        "home-a.localhost",
        { port: "80", searchParams: new URLSearchParams() },
        "/register",
      ),
      "http://home-a.localhost/register",
      "listener port 80, called directly",
    );
  });

  it("refuses with 404 when the listener port is not 1 to 65535", async () => {
    await expectRefused(
      await donorModule.proxy(
        siteRequest(SITE_A, "/register", {
          url: "http://site-a.localhost:0/register",
        }),
      ),
      "port 0",
    );
    expect(state.homeReads).toEqual([SITE_A]);
  });

  it("asks again for every request: home-a then home-c for one host", async () => {
    state.homeAnswer = (_host, n) => ({
      data: [
        { primary_domain: n === 1 ? "home-a.localhost" : "home-c.localhost" },
      ],
      error: null,
    });
    await expectHomeRedirect(
      await donorModule.proxy(siteRequest(SITE_A, "/register")),
      "http://home-a.localhost:25200/register",
      "first",
    );
    await expectHomeRedirect(
      await donorModule.proxy(siteRequest(SITE_A, "/register")),
      "http://home-c.localhost:25200/register",
      "second",
    );
    expect(state.homeReads).toEqual([SITE_A, SITE_A]);
  });

  it.each([
    ["evil.example:80", [{ primary_domain: "evil.example:80" }]],
    ["HOME-A.localhost", [{ primary_domain: "HOME-A.localhost" }]],
    ["home-a.localhost/x", [{ primary_domain: "home-a.localhost/x" }]],
    [
      "two rows",
      [
        { primary_domain: "home-a.localhost" },
        { primary_domain: "home-b.localhost" },
      ],
    ],
  ])("answers 503 when the read answers %s", async (_label, data) => {
    state.homeAnswer = () => ({ data, error: null });
    await expectRefused(
      await donorModule.proxy(siteRequest(SITE_A, "/register")),
      _label,
      503,
    );
  });
});
