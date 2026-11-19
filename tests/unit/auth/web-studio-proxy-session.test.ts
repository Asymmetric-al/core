import { NextRequest } from "next/server";
import { beforeEach, expect, it, vi } from "vitest";

/**
 * The admin proxy on a Web Studio REST call refreshes the Supabase session
 * and passes the request on (plan 5.2; AL-2675). Supabase may write the
 * session more than once in one refresh, and each write asks that the answer
 * never be cached. Each write rebuilds the response, so, like the main
 * proxy's refresh (`packages/auth/middleware.ts`), it must keep what every
 * earlier write asked for, cookies and cache headers alike (council on the
 * joined release, JC9).
 */

type CookieWrite = Array<{ name: string; value: string }>;

const ssr = vi.hoisted(() => ({
  writes: [] as Array<[CookieWrite, Record<string, string>]>,
}));

vi.mock("@supabase/ssr", () => ({
  createServerClient: (
    _url: string,
    _key: string,
    options: {
      cookies: {
        setAll: (cookies: CookieWrite, headers: Record<string, string>) => void;
      };
    },
  ) => ({
    auth: {
      getUser: async () => {
        for (const [cookies, headers] of ssr.writes) {
          options.cookies.setAll(cookies, headers);
        }
        return { data: { user: null }, error: null };
      },
    },
  }),
}));
vi.mock("@asym/database/supabase/config", () => ({
  getSupabasePublicConfig: () => ({
    url: "http://127.0.0.1:54321",
    key: "anon-key",
  }),
}));

const { refreshWebStudioApiSession } =
  await import("../../../packages/auth/web-studio-proxy");

beforeEach(() => {
  ssr.writes = [];
});

it("keeps every cache header and cookie Supabase asked for when it writes the session twice", async () => {
  ssr.writes = [
    [
      [{ name: "sb-access", value: "1" }],
      {
        "cache-control":
          "private, no-cache, no-store, must-revalidate, max-age=0",
        expires: "0",
      },
    ],
    [[{ name: "sb-refresh", value: "2" }], { pragma: "no-cache" }],
  ];

  const response = await refreshWebStudioApiSession(
    new NextRequest("http://localhost:3030/web-studio/api/pages"),
    "/web-studio/api/pages",
    "staff",
  );

  expect(response.headers.get("cache-control")).toContain("no-store");
  expect(response.headers.get("expires")).toBe("0");
  expect(response.headers.get("pragma")).toBe("no-cache");
  expect(response.cookies.get("sb-access")?.value).toBe("1");
  expect(response.cookies.get("sb-refresh")?.value).toBe("2");
});
