import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  createE2EAuthCookieValue,
  E2E_AUTH_COOKIE_NAME,
  type E2EAuthMembership,
} from "../../../../packages/auth/e2e-auth";

/**
 * WP2b acceptance (plan 12, WP2; AL-2675; council round 1 on slice B, SB9):
 * "A forged header can at most select a tenant where the caller already
 * holds a live membership", followed through the whole server chain on real
 * route code: the request's headers, the real resolver (`getAuthContext`),
 * `requestScopeOf`, the real `createRequestSessionClient` and the headers its
 * Data API request carries out of the process.
 *
 * The route is Mission Control's users list (`packages/api/src/admin/users.ts`),
 * which reads `public.tenant_member_directory` on the caller's own session.
 * The person is a signed fixture identity, as the end-to-end suites sign
 * them in, with an administrator row in each fixture tenant. Only the
 * service-key client, the audit log and the Supabase network are stand-ins.
 */

vi.mock("next/headers", () => ({
  // The session client reads the request's Supabase session cookies; this
  // caller has none, so its Data API requests go out with the anon key.
  cookies: vi.fn(async () => ({ getAll: () => [], set: () => undefined })),
  headers: vi.fn(async () => {
    throw new Error("an API request carries its own headers");
  }),
}));
vi.mock("@asym/database/supabase/admin", () => ({
  getAdminClient: () => ({
    client: new Proxy(
      {},
      {
        get: (_target, key) => {
          throw new Error(`service-key client used: ${String(key)}`);
        },
      },
    ),
    error: null,
  }),
}));
vi.mock("@asym/lib/audit/logger", () => ({
  createAuditLogger: vi.fn(() => ({})),
}));

const SUPABASE_URL = "https://example.supabase.co";
const DEMO = "00000000-0000-0000-0000-000000000001";
const SECOND = "00000000-0000-0000-0000-000000000002";
const FOREIGN = "6f1c2a4e-9b3d-4c5e-8f7a-0b1c2d3e4f5a";
const USER = "00000000-0000-4000-8000-0000000e2e40";
const IN_DEMO: E2EAuthMembership = {
  id: "00000000-0000-4000-8000-0000000e2e41",
  tenantId: DEMO,
  role: "staff",
  staffRole: "development",
  isTenantAdmin: true,
};
const IN_SECOND: E2EAuthMembership = {
  ...IN_DEMO,
  id: "00000000-0000-4000-8000-0000000e2e42",
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

/** Every request that left for Supabase's Data API, with its headers. */
let sessionRows: E2EAuthMembership[] = [];
const dataApi: Array<{ url: string; headers: Headers }> = [];

beforeEach(() => {
  Object.assign(process.env, {
    E2E_AUTH_BYPASS: "true",
    NODE_ENV: "development",
    NEXT_PUBLIC_SUPABASE_URL: SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: "example-anon-key",
    E2E_AUTH_SECRET: "request-scope-chain-secret",
    E2E_AUTH_ALLOWED_SUPABASE_REFS: "example",
  });
  dataApi.length = 0;
  vi.stubGlobal(
    "fetch",
    async (input: RequestInfo | URL, init: RequestInit = {}) => {
      const url = String(input instanceof Request ? input.url : input);
      const headers = new Headers(
        init.headers ?? (input instanceof Request ? input.headers : undefined),
      );
      if (headers.get("authorization") === "Bearer verified-unit-session") {
        const path = new URL(url).pathname;
        if (path === "/auth/v1/user")
          return Response.json({
            id: USER,
            aud: "authenticated",
            email: "staff@example.test",
          });
        if (path === "/rest/v1/profiles") return Response.json({ id: USER });
        if (path === "/rest/v1/rpc/current_user_assignments")
          return Response.json(
            sessionRows.map((row) => ({
              id: row.id,
              user_id: USER,
              tenant_id: row.tenantId,
              role: row.role,
              staff_role: row.staffRole,
              is_tenant_admin: row.isTenantAdmin,
              updated_at: "2026-11-01T00:00:00Z",
            })),
          );
      }
      if (url.startsWith(`${SUPABASE_URL}/rest/v1/`)) {
        dataApi.push({ url, headers });
        return Response.json([]);
      }
      return Response.json({ message: "not served here" }, { status: 404 });
    },
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.resetModules();
  for (const key of ENV_KEYS) {
    if (savedEnv[key] === undefined) delete process.env[key];
    else process.env[key] = savedEnv[key];
  }
});

/** The users list, as the admin proxy hands it a request from this person. */
async function listUsers(
  memberships: E2EAuthMembership[],
  scopeHeaders: Record<string, string>,
) {
  sessionRows = memberships;
  const { GET } = await import("../../../../packages/api/src/admin/users");
  return GET(
    new NextRequest("http://localhost:3030/api/admin/users", {
      headers: {
        ...scopeHeaders,
        authorization: "Bearer verified-unit-session",
        "x-asym-role-class": "staff",
      },
    }),
  );
}

async function identityCookie(memberships: E2EAuthMembership[]) {
  return `${E2E_AUTH_COOKIE_NAME}=${await createE2EAuthCookieValue({
    userId: USER,
    role: "staff",
    tenantId: memberships[0]!.tenantId,
    memberships,
  })}`;
}

function directoryReads() {
  return dataApi.filter(({ url }) =>
    url.includes("/rest/v1/rpc/tenant_member_directory"),
  );
}

describe("a forged header, through the resolver, to the session client's request", () => {
  it("sends the row the page's headers name when the caller holds it", async () => {
    const response = await listUsers([IN_DEMO, IN_SECOND], {
      "x-asym-tenant": SECOND,
      "x-asym-assignment": IN_SECOND.id,
    });

    expect(response.status).toBe(200);
    const reads = directoryReads();
    expect(reads).toHaveLength(1);
    expect(reads[0]!.headers.get("x-asym-tenant")).toBe(SECOND);
    expect(reads[0]!.headers.get("x-asym-assignment")).toBe(IN_SECOND.id);
  });

  it("sends the resolved row, not the caller's headers, when the caller sent none", async () => {
    const response = await listUsers([IN_DEMO], {});

    expect(response.status).toBe(200);
    const reads = directoryReads();
    expect(reads).toHaveLength(1);
    expect(reads[0]!.headers.get("x-asym-tenant")).toBe(DEMO);
    expect(reads[0]!.headers.get("x-asym-assignment")).toBe(IN_DEMO.id);
  });

  it.each([
    [
      "a tenant where the caller holds no row",
      [IN_DEMO],
      { "x-asym-tenant": SECOND, "x-asym-assignment": IN_SECOND.id },
    ],
    [
      "the caller's own row of another tenant",
      [IN_DEMO, IN_SECOND],
      { "x-asym-tenant": SECOND, "x-asym-assignment": IN_DEMO.id },
    ],
    [
      "a tenant and a row that are nobody's",
      [IN_DEMO, IN_SECOND],
      {
        "x-asym-tenant": FOREIGN,
        "x-asym-assignment": "6f1c2a4e-9b3d-4c5e-8f7a-0b1c2d3e4f5b",
      },
    ],
    ["no scope from a person in two organizations", [IN_DEMO, IN_SECOND], {}],
  ])(
    "refuses %s before any read leaves for the database",
    async (_case, memberships, scopeHeaders) => {
      const response = await listUsers(memberships, scopeHeaders);

      expect(response.status).toBeGreaterThanOrEqual(400);
      expect(response.status).toBeLessThan(500);
      expect(dataApi).toEqual([]);
    },
  );
});

/**
 * Council on the joined release, JB1: the browser must tell a refused scope
 * from any other 401 or 403, so the resolver's refusal of the scope a page
 * proposed is marked with one response header, and nothing else is.
 */
describe("the refusal the browser retires its document on", () => {
  it.each([
    [
      "a tenant where the caller holds no row (a revoked membership)",
      [IN_DEMO],
      { "x-asym-tenant": SECOND, "x-asym-assignment": IN_SECOND.id },
      "not_owned_or_inactive",
    ],
    [
      "another person's row (a different person signed in elsewhere)",
      [IN_DEMO],
      {
        "x-asym-tenant": DEMO,
        "x-asym-assignment": "00000000-0000-4000-8000-0000000e2e99",
      },
      "not_owned_or_inactive",
    ],
  ])(
    "marks %s with x-asym-scope-refused, at the same status as before",
    async (_case, memberships, scopeHeaders, reason) => {
      const response = await listUsers(memberships, scopeHeaders);

      expect(response.status).toBe(401);
      expect(response.headers.get("x-asym-scope-refused")).toBe(reason);
      expect(dataApi).toEqual([]);
    },
  );

  it("does not mark a refusal of a request that proposed no scope", async () => {
    const response = await listUsers([IN_DEMO, IN_SECOND], {});

    expect(response.status).toBe(401);
    expect(response.headers.has("x-asym-scope-refused")).toBe(false);
  });

  it("does not mark a request the scope still holds for", async () => {
    const response = await listUsers([IN_DEMO, IN_SECOND], {
      "x-asym-tenant": SECOND,
      "x-asym-assignment": IN_SECOND.id,
    });

    expect(response.status).toBe(200);
    expect(response.headers.has("x-asym-scope-refused")).toBe(false);
  });
});

describe("Eve governance operator route", () => {
  async function patchGovernance(scopeHeaders: Record<string, string>) {
    const { PATCH } =
      await import("../../../../packages/api/src/eve/governance/route");
    const identity = await identityCookie([IN_SECOND]);
    return PATCH(
      new NextRequest("http://localhost:3030/api/eve/governance", {
        method: "PATCH",
        headers: {
          ...scopeHeaders,
          cookie: `${identity}; sb-project-auth-token=session`,
          "x-asym-role-class": "staff",
        },
      }),
    );
  }

  it("runs the operator RPC under the resolver's assignment, even when no scope headers were sent", async () => {
    const response = await patchGovernance({});
    expect(dataApi).toHaveLength(1);
    expect(dataApi[0]!.url).toContain("/rpc/platform_operator_session");
    expect(dataApi[0]!.headers.get("x-asym-tenant")).toBe(SECOND);
    expect(dataApi[0]!.headers.get("x-asym-assignment")).toBe(IN_SECOND.id);
    expect(response.status).toBe(403);
    expect(response.headers.has("x-asym-scope-refused")).toBe(false);
  });

  it("marks a refused assignment and never asks for operator authority", async () => {
    const response = await patchGovernance({
      "x-asym-tenant": DEMO,
      "x-asym-assignment": IN_DEMO.id,
    });
    expect(response.status).toBe(401);
    expect(response.headers.get("x-asym-scope-refused")).toBe(
      "not_owned_or_inactive",
    );
    expect(dataApi).toEqual([]);
  });
});
