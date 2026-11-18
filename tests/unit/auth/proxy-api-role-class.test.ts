/**
 * Council round 1 on WP2a, F5: the surface fixes the role class (plan 5.1)
 * on every API path, whatever its extension.
 *
 * Each app's proxy overwrites `x-asym-role-class` with its own class on the
 * requests it passes on. Its matcher skipped every path ending in `.json`,
 * `.txt`, `.xml` or an image extension, and a dynamic API route still answers
 * such a path (`/api/admin/support/tickets/x.json`), so there the proxy did
 * not run and `getAuthContext` read the class the client sent. Every `/api`
 * path is matched now; asset paths stay skipped, so the proxy serves no
 * static file. Exercised through the real proxies and their real `config`,
 * with only Supabase's client and config doubled.
 */
import { unstable_doesMiddlewareMatch } from "next/experimental/testing/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ROLE_CLASS_HEADER } from "../../../packages/auth/request-headers";

const supabase = vi.hoisted(() => ({
  getUser: vi.fn(),
  createServerClient: vi.fn(),
  getSupabasePublicConfig: vi.fn(),
  resolveUserRole: vi.fn(),
}));

vi.mock("@supabase/ssr", () => ({
  createServerClient: supabase.createServerClient,
}));
vi.mock("@asym/database/supabase/config", () => ({
  getSupabasePublicConfig: supabase.getSupabasePublicConfig,
}));
vi.mock("@asym/auth/resolve-user-role", () => ({
  resolveUserRoleFromDatabase: supabase.resolveUserRole,
}));

const PROXIES = {
  admin: () => import("../../../apps/admin/proxy"),
  donor: () => import("../../../apps/donor/proxy"),
  missionary: () => import("../../../apps/missionary/proxy"),
} as const;

type App = keyof typeof PROXIES;

/** The class each surface fixes (plan 5.1). */
const SURFACE_CLASS: Record<App, string> = {
  admin: "staff",
  donor: "donor",
  missionary: "missionary",
};

/** A class each surface must not take from the client. */
const FOREIGN_CLASS: Record<App, string> = {
  admin: "donor",
  donor: "staff",
  missionary: "staff",
};

const API_PATHS_WITH_EXTENSIONS = [
  "/api/admin/support/tickets/x.json",
  "/api/admin/crm/export.txt",
  "/api/feed.xml",
  "/api/media/avatar.png",
  "/api/media/cover.webp",
  "/api/manifest.webmanifest",
];

const ASSET_PATHS = [
  "/_next/static/chunks/main.js",
  "/_next/image",
  "/favicon.ico",
  "/logo.png",
  "/robots.txt",
  "/sitemap.xml",
  "/site.webmanifest",
  "/images/hero.webp",
];

beforeEach(() => {
  supabase.getSupabasePublicConfig.mockReturnValue({
    url: "https://example.supabase.co",
    key: "anon-key",
    keyType: "anon",
  });
  supabase.createServerClient.mockReturnValue({
    auth: { getUser: supabase.getUser },
  });
  supabase.getUser.mockResolvedValue({ data: { user: null } });
  supabase.resolveUserRole.mockResolvedValue(null);
});
afterEach(() => {
  vi.clearAllMocks();
});

describe.each(Object.keys(PROXIES) as App[])("the %s proxy", (app) => {
  it.each(API_PATHS_WITH_EXTENSIONS)("runs on %s", async (url) => {
    const { config } = await PROXIES[app]();
    expect(unstable_doesMiddlewareMatch({ config, url })).toBe(true);
  });

  it.each(ASSET_PATHS)("still skips the asset path %s", async (url) => {
    const { config } = await PROXIES[app]();
    expect(unstable_doesMiddlewareMatch({ config, url })).toBe(false);
  });

  it.each(API_PATHS_WITH_EXTENSIONS)(
    "passes %s on with its own role class, not the one the client sent",
    async (path) => {
      const { proxy } = await PROXIES[app]();
      const headers = new Headers({
        [ROLE_CLASS_HEADER]: FOREIGN_CLASS[app],
      });
      const response = await proxy({
        headers,
        nextUrl: new URL(`https://app.example.test${path}`),
        cookies: { getAll: () => [], set: vi.fn(), get: vi.fn() },
      } as never);
      // NextResponse.next({ request: { headers } }) hands the request
      // headers on through these response headers.
      expect(
        response.headers.get(`x-middleware-request-${ROLE_CLASS_HEADER}`),
      ).toBe(SURFACE_CLASS[app]);
    },
  );
});
