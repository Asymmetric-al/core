import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type * as AuthModule from "../../../../packages/auth/context";
import type { AuthContext } from "../../../../packages/auth/context";

/**
 * Council on the joined release, JB14: the metrics route looked a missionary
 * up by id or profile and took one row (`maybeSingle()`) before it checked
 * the tenant. A person with a missionary record in two organizations then got
 * PostgREST's "more than one row" error, a 500, on the service-key path. The
 * lookup is filtered by the resolved tenant first.
 */

const TENANT = "00000000-0000-4000-8000-0000000000e1";
const OTHER_TENANT = "00000000-0000-4000-8000-0000000000e2";
const PROFILE = "00000000-0000-4000-8000-0000000000e9";
const USER = "00000000-0000-4000-9000-0000000000e1";

type Row = Record<string, unknown>;
const TABLES: Record<string, Row[]> = {
  missionaries: [
    { id: "m-first", tenant_id: TENANT, profile_id: PROFILE },
    { id: "m-second", tenant_id: OTHER_TENANT, profile_id: PROFILE },
  ],
};

/** A PostgREST-like read: filters, then one row or every row. */
function read(table: string) {
  let rows = [...(TABLES[table] ?? [])];
  const answer = () => ({ data: rows, error: null });
  const query = {
    select: () => query,
    or: (expression: string) => {
      const allowed = expression
        .split(",")
        .map((part) => part.split(".eq."))
        .map(([column, value]) => [column!, value!] as const);
      rows = rows.filter((row) =>
        allowed.some(([column, value]) => row[column] === value),
      );
      return query;
    },
    eq: (column: string, value: unknown) => {
      rows = rows.filter((row) => row[column] === value);
      return query;
    },
    in: () => query,
    gte: () => query,
    order: () => query,
    range: () => query,
    limit: () => query,
    maybeSingle: async () =>
      rows.length > 1
        ? {
            data: null,
            error: {
              code: "PGRST116",
              message: "JSON object requested, multiple (or no) rows returned",
            },
          }
        : { data: rows[0] ?? null, error: null },
    then: (resolve: (value: ReturnType<typeof answer>) => void) =>
      resolve(answer()),
  };
  return query;
}

const h = vi.hoisted(() => ({ auth: vi.fn() }));

vi.mock("@asym/auth/context", async (importOriginal) => ({
  ...(await importOriginal<typeof AuthModule>()),
  getAuthContext: h.auth,
}));
vi.mock("@asym/database/supabase/admin", () => ({
  getAdminClient: () => ({ client: { from: read }, error: null }),
}));
vi.mock("@asym/env", () => ({
  serverEnv: {
    NEXT_PUBLIC_SUPABASE_URL: "http://127.0.0.1:54321",
    NEXT_PUBLIC_SUPABASE_ANON_KEY: "test-anon-key",
  },
}));

const { GET } =
  await import("../../../../packages/api/src/missionaries/metrics");

beforeEach(() => {
  h.auth.mockResolvedValue({
    isAuthenticated: true,
    userId: USER,
    email: null,
    tenantId: TENANT,
    role: "missionary",
    profileId: PROFILE,
    memberships: [
      {
        tenantId: TENANT,
        role: "missionary",
        staffRole: null,
        isActive: true,
        isTenantAdmin: false,
      },
    ],
    assignment: {
      assignmentId: "00000000-0000-4000-8000-00000000e0e1",
      userId: USER,
      tenantId: TENANT,
      revision: "1",
      membershipRole: "missionary",
      staffRole: null,
      isTenantAdmin: false,
    },
    assignmentDenial: null,
  } as AuthContext);
});

describe("the missionary metrics route for a person with a missionary record in two organizations", () => {
  it("finds the record of the resolved organization, by profile, instead of answering 500", async () => {
    const response = await GET(
      new NextRequest(`http://localhost/api/missionaries/${PROFILE}/metrics`),
      { params: Promise.resolve({ id: PROFILE }) },
    );

    expect(response.status).toBe(200);
  });
});
