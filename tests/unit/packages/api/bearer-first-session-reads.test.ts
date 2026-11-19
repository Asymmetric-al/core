import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type * as AuthModule from "../../../../packages/auth/context";
import type { AuthContext } from "../../../../packages/auth/context";

/**
 * Council on the joined release, JB13: `getAuthContext` authenticates a
 * request's `Authorization: Bearer` token before its cookies, so the client a
 * handler reads with must act as that same credential. These five handlers
 * read on a cookie-only client: a bearer-only request read as nobody, and a
 * request with one person's bearer and another person's cookies read as the
 * cookie's person. Each must read with the bearer when there is one (the
 * bearer-first request client), sending the resolved scope, and with the
 * cookies otherwise (the metrics route keeping its own cookie refresh).
 */

const BEARER = "token-of-the-person-resolved";
const OTHER_COOKIE = {
  name: "sb-example-auth-token",
  value: "base64-cookie-of-another-person",
};
const TENANT = "00000000-0000-4000-8000-0000000000d1";
const ROW = "00000000-0000-4000-8000-00000000d0d1";
const USER = "00000000-0000-4000-9000-0000000000d1";

const h = vi.hoisted(() => ({
  auth: vi.fn(),
  clients: [] as Array<{
    headers: Record<string, string>;
    cookies: Array<{ name: string; value: string }>;
  }>,
}));

vi.mock("@asym/auth/context", async (importOriginal) => ({
  ...(await importOriginal<typeof AuthModule>()),
  getAuthContext: h.auth,
}));
vi.mock("@asym/database/supabase/admin", () => ({
  getAdminClient: () => ({ client: null, error: "no service key here" }),
}));
vi.mock("@asym/env", () => ({
  serverEnv: {
    NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
    NEXT_PUBLIC_SUPABASE_ANON_KEY: "example-anon-key",
  },
}));
vi.mock("next/headers", () => ({
  cookies: async () => ({
    getAll: () => [OTHER_COOKIE],
    set: () => undefined,
  }),
}));
vi.mock("next/cache", () => ({ revalidateTag: vi.fn() }));
vi.mock("@supabase/ssr", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@supabase/ssr")>()),
  createServerClient: (
    _url: string,
    _key: string,
    options: {
      global?: { headers?: Record<string, string> };
      cookies: { getAll(): Array<{ name: string; value: string }> };
    },
  ) => {
    h.clients.push({
      headers: options.global?.headers ?? {},
      cookies: options.cookies.getAll() ?? [],
    });
    // Every read answers nothing; the handler's own outcome is not under test.
    const answer = { data: null, error: null, count: 0 };
    const query: unknown = new Proxy(() => query, {
      get: (_target, key) =>
        key === "then"
          ? (resolve: (value: typeof answer) => void) => resolve(answer)
          : query,
      apply: () => query,
    });
    return {
      from: () => query,
      rpc: () => query,
      auth: {
        getUser: async () => ({ data: { user: null }, error: null }),
      },
    };
  },
}));

const RESOLVED: AuthContext = {
  isAuthenticated: true,
  userId: USER,
  email: null,
  tenantId: TENANT,
  role: "admin",
  profileId: "00000000-0000-4000-8000-0000000000d9",
  memberships: [
    {
      tenantId: TENANT,
      role: "staff",
      staffRole: "development",
      isActive: true,
      isTenantAdmin: true,
    },
  ],
  assignment: {
    assignmentId: ROW,
    userId: USER,
    tenantId: TENANT,
    revision: "1",
    membershipRole: "staff",
    staffRole: "development",
    isTenantAdmin: true,
  },
  assignmentDenial: null,
};

const POST_ID = "11111111-2222-4333-8444-555555555555";
type Call = (headers: Record<string, string>) => Promise<unknown>;

const handlers: Array<[string, Call]> = [
  [
    "feed preferences",
    async (headers) => {
      const { GET } =
        await import("../../../../packages/api/src/feed-preferences/index");
      return GET(
        new Request("http://localhost/api/feed-preferences", { headers }),
      );
    },
  ],
  [
    "a post's comments",
    async (headers) => {
      const { GET } =
        await import("../../../../packages/api/src/posts/comments");
      return GET(
        new NextRequest(`http://localhost/api/posts/${POST_ID}/comments`, {
          headers,
        }),
        { params: Promise.resolve({ postId: POST_ID }) },
      );
    },
  ],
  [
    "a reaction",
    async (headers) => {
      const { createReactionRouteHandlers } =
        await import("../../../../packages/api/src/posts/reaction-route-handlers");
      const config = {
        kind: "like",
        failureMessage: "failed",
        fallbackMessage: "failed",
      } as unknown as Parameters<
        typeof createReactionRouteHandlers
      >[0]["apply"];
      const { POST } = createReactionRouteHandlers({
        apply: config,
        remove: config,
      });
      return POST(
        new NextRequest(`http://localhost/api/posts/${POST_ID}/like`, {
          method: "POST",
          headers,
        }),
        { params: Promise.resolve({ postId: POST_ID }) },
      );
    },
  ],
  [
    "the organization's settings",
    async (headers) => {
      const { GET } =
        await import("../../../../packages/api/src/admin/org-settings");
      return GET(
        new Request("http://localhost/api/admin/org-settings", { headers }),
      );
    },
  ],
  [
    "a missionary's metrics, with no service-key client",
    async (headers) => {
      const { GET } =
        await import("../../../../packages/api/src/missionaries/metrics");
      return GET(
        new NextRequest("http://localhost/api/missionaries/m-1/metrics", {
          headers,
        }),
        { params: Promise.resolve({ id: "m-1" }) },
      );
    },
  ],
];

beforeEach(() => {
  process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "example-anon-key";
  h.clients.length = 0;
  h.auth.mockReset();
  h.auth.mockResolvedValue(RESOLVED);
});

/** The session clients the handler built to read with. */
function sessionClients() {
  expect(h.clients.length).toBeGreaterThan(0);
  return h.clients;
}

describe("a handler reads as the credential the request was authenticated with", () => {
  it.each(handlers)(
    "%s: a bearer-only request reads as the bearer, with the resolved scope",
    async (_handler, call) => {
      await call({ authorization: `Bearer ${BEARER}` });

      for (const client of sessionClients()) {
        expect(client.headers.Authorization).toBe(`Bearer ${BEARER}`);
        expect(client.headers).toMatchObject({
          "x-asym-tenant": TENANT,
          "x-asym-assignment": ROW,
        });
      }
    },
  );

  it.each(handlers)(
    "%s: a bearer for one person and cookies for another read as the bearer's person, never the cookies'",
    async (_handler, call) => {
      await call({
        authorization: `Bearer ${BEARER}`,
        cookie: `${OTHER_COOKIE.name}=${OTHER_COOKIE.value}`,
      });

      for (const client of sessionClients()) {
        expect(client.headers.Authorization).toBe(`Bearer ${BEARER}`);
        expect(client.cookies).toEqual([]);
      }
    },
  );

  it.each(handlers)(
    "%s: a request with cookies only still reads as its cookie session",
    async (_handler, call) => {
      await call({ cookie: `${OTHER_COOKIE.name}=${OTHER_COOKIE.value}` });

      for (const client of sessionClients()) {
        expect(client.headers.Authorization).toBeUndefined();
        expect(client.cookies).toEqual([OTHER_COOKIE]);
      }
    },
  );
});
