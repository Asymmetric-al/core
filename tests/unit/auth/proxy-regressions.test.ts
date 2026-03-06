import path from "node:path";
import { pathToFileURL } from "node:url";

import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

const originalSupabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const originalSupabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
let adminProxy: (request: unknown) => Promise<Response>;
let donorProxyConfig: { matcher: string[] | string };

function createRequest(pathname: string) {
  const nextUrl = new URL(`https://example.org${pathname}`);
  (nextUrl as URL & { clone: () => URL }).clone = () =>
    new URL(nextUrl.toString());

  return {
    nextUrl,
    cookies: {
      get: () => undefined,
      getAll: () => [],
      set: () => undefined,
    },
  } as never;
}

beforeAll(async () => {
  const adminModule = await import(
    pathToFileURL(path.resolve(process.cwd(), "apps/admin/proxy.ts")).href
  );
  const donorModule = await import(
    pathToFileURL(path.resolve(process.cwd(), "apps/donor/proxy.ts")).href
  );

  adminProxy = adminModule.proxy;
  donorProxyConfig = donorModule.config;
});

describe("admin proxy public CMS routes", () => {
  beforeEach(() => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  });

  it.each([
    "/api/cms/public/navigation",
    "/api/cms/public/pages/home",
    "/api/cms/public/updates?limit=3",
  ])("allows anonymous access to %s", async (pathname) => {
    const response = await adminProxy(createRequest(pathname));

    expect(response.status).toBe(200);
  });
});

describe("donor proxy matcher", () => {
  it("only runs on auth, dashboard, and api routes", () => {
    expect(donorProxyConfig.matcher).toEqual([
      "/login",
      "/register",
      "/donor-dashboard/:path*",
      "/api/:path*",
    ]);
  });
});

afterAll(() => {
  if (originalSupabaseUrl === undefined) {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
  } else {
    process.env.NEXT_PUBLIC_SUPABASE_URL = originalSupabaseUrl;
  }

  if (originalSupabaseAnonKey === undefined) {
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  } else {
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = originalSupabaseAnonKey;
  }
});
