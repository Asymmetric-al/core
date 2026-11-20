import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  createE2EAuthCookieValue,
  E2E_AUTH_COOKIE_NAMES,
  type E2EAuthMembership,
} from "../../../../packages/auth/e2e-auth";

/**
 * WP2b acceptance (plan 12, WP2, "Interim rules until WP3"; AL-2675;
 * council on the joined release, JB12): "a person with donor memberships in
 * both fixture tenants is refused there", for the proxy check, server reads
 * and the browser header alike. Every donor page refused such a person, but
 * the donor API accepted the tenant and assignment their browser proposed,
 * so they could call it in either organization. Followed here through real
 * route code: the donor portal's `GET /api/donor/portal`, the real resolver
 * (`getAuthContext`) and a signed fixture identity, as the end-to-end suites
 * sign donors in. Only the service-key client is a stand-in: absent, so an
 * accepted request answers with the demo snapshot.
 */

vi.mock("next/headers", () => ({
  cookies: vi.fn(async () => ({ getAll: () => [], set: () => undefined })),
  headers: vi.fn(async () => {
    throw new Error("an API request carries its own headers");
  }),
}));
vi.mock("@asym/database/supabase/admin", () => ({
  getAdminClient: () => ({ client: null, error: "no service key here" }),
}));

const DEMO = "00000000-0000-0000-0000-000000000001";
const SECOND = "00000000-0000-0000-0000-000000000002";
const USER = "e2e-donor-two-organizations";
const DONOR_IN_DEMO: E2EAuthMembership = {
  id: "00000000-0000-4000-8000-0000000e2e51",
  tenantId: DEMO,
  role: "donor",
  staffRole: null,
  isTenantAdmin: false,
};
const DONOR_IN_SECOND: E2EAuthMembership = {
  ...DONOR_IN_DEMO,
  id: "00000000-0000-4000-8000-0000000e2e52",
  tenantId: SECOND,
};

const ENV_KEYS = [
  "E2E_AUTH_BYPASS",
  "NODE_ENV",
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "E2E_AUTH_SECRET",
  "E2E_AUTH_ALLOWED_SUPABASE_REFS",
] as const;
const savedEnv = Object.fromEntries(
  ENV_KEYS.map((key) => [key, process.env[key]]),
);

beforeEach(() => {
  Object.assign(process.env, {
    E2E_AUTH_BYPASS: "true",
    NODE_ENV: "development",
    NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
    NEXT_PUBLIC_SUPABASE_ANON_KEY: "example-anon-key",
    E2E_AUTH_SECRET: "donor-two-memberships-secret",
    E2E_AUTH_ALLOWED_SUPABASE_REFS: "example",
  });
});

afterEach(() => {
  vi.resetModules();
  for (const key of ENV_KEYS) {
    if (savedEnv[key] === undefined) delete process.env[key];
    else process.env[key] = savedEnv[key];
  }
});

/** The donor portal's read, as the donor proxy hands it this person's request. */
async function portal(
  memberships: E2EAuthMembership[],
  scopeHeaders: Record<string, string>,
) {
  const cookie = `${E2E_AUTH_COOKIE_NAMES.donor}=${await createE2EAuthCookieValue(
    {
      userId: USER,
      role: "donor",
      tenantId: memberships[0]!.tenantId,
      memberships,
    },
  )}`;
  const { GET } = await import("../../../../packages/api/src/donor-portal");
  const response = await GET(
    new NextRequest("http://localhost:3005/api/donor/portal", {
      headers: { ...scopeHeaders, cookie, "x-asym-role-class": "donor" },
    }),
  );
  const body = (await response.json()) as { portal?: unknown };
  return { status: response.status, hasPortal: body.portal !== undefined };
}

describe("the donor API for a person with donor memberships in two organizations", () => {
  it.each([
    [
      "proposing the first organization's row",
      { "x-asym-tenant": DEMO, "x-asym-assignment": DONOR_IN_DEMO.id },
    ],
    [
      "proposing the second organization's row",
      { "x-asym-tenant": SECOND, "x-asym-assignment": DONOR_IN_SECOND.id },
    ],
    ["proposing nothing", {}],
  ])(
    "refuses the request %s, as every donor page does",
    async (_label, headers) => {
      const result = await portal([DONOR_IN_DEMO, DONOR_IN_SECOND], headers);
      expect(result.hasPortal).toBe(false);
      expect([401, 403]).toContain(result.status);
    },
  );

  it("serves a person with one donor membership, with or without the headers", async () => {
    for (const headers of [
      {},
      { "x-asym-tenant": DEMO, "x-asym-assignment": DONOR_IN_DEMO.id },
    ]) {
      const result = await portal([DONOR_IN_DEMO], headers);
      expect(result).toEqual({ status: 200, hasPortal: true });
    }
  });
});
