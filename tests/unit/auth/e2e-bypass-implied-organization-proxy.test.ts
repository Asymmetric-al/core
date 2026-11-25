import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  createE2EAuthCookieValue,
  E2E_AUTH_COOKIE_NAMES,
} from "../../../packages/auth/e2e-auth";

const state = vi.hoisted(() => ({ rpcCalls: 0 }));

vi.mock("@asym/database/supabase/config", () => ({
  getSupabasePublicConfig: () => ({
    url: "https://example.supabase.co",
    key: "anon-key",
    keyType: "anon",
  }),
}));

vi.mock("@supabase/ssr", () => ({
  createServerClient: () => ({
    auth: { getUser: async () => ({ data: { user: null } }) },
    rpc: async () => {
      state.rpcCalls += 1;
      return { data: [], error: null };
    },
  }),
}));

const { proxy } = await import("../../../apps/missionary/proxy");

const original = {
  bypass: process.env.E2E_AUTH_BYPASS,
  secret: process.env.E2E_AUTH_SECRET,
};

beforeEach(() => {
  process.env.E2E_AUTH_BYPASS = "true";
  delete process.env.E2E_AUTH_SECRET;
  state.rpcCalls = 0;
});

afterEach(() => {
  if (original.bypass === undefined) delete process.env.E2E_AUTH_BYPASS;
  else process.env.E2E_AUTH_BYPASS = original.bypass;
  if (original.secret === undefined) delete process.env.E2E_AUTH_SECRET;
  else process.env.E2E_AUTH_SECRET = original.secret;
});

async function answer(cookieValue: string) {
  const response = await proxy(
    new NextRequest(new URL("/", "http://localhost:4000"), {
      headers: {
        cookie: `${E2E_AUTH_COOKIE_NAMES.missionary}=${cookieValue}`,
        host: "localhost:4000",
      },
    }),
  );
  const location = response.headers.get("location");
  return {
    status: response.status,
    location: location
      ? new URL(location, "http://localhost:4000").pathname
      : null,
    rewrite: response.headers.get("x-middleware-rewrite"),
  };
}

describe("AL-2676: the tenant-addressed missionary proxy lands a bypass cookie naming no tenant nowhere", () => {
  it("answers GET / for a missionary cookie with tenantId null as it answers memberships: [], a 307 to /no-access", async () => {
    const empty = await answer(
      await createE2EAuthCookieValue({
        userId: "e2e-missionary-user",
        role: "missionary",
        tenantId: null,
        memberships: [],
      }),
    );
    const noTenant = await answer(
      await createE2EAuthCookieValue({
        userId: "e2e-missionary-user",
        role: "missionary",
        tenantId: null,
      }),
    );

    expect(empty).toEqual({
      status: 307,
      location: "/no-access",
      rewrite: null,
    });
    expect(noTenant).toEqual(empty);
    expect(state.rpcCalls).toBe(0);
  });
});
