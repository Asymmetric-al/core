/**
 * Council round 1 on WP2a, F8: Mission Control's users list reads the
 * tenant's people through `public.tenant_member_directory` on the caller's
 * own token (plan 5.1), with the columns the screen shows, filtered and paged
 * by the database. It never touches the service-key client, so it returns no
 * `profiles.*` and nothing the directory does not.
 */
import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type * as AuthModule from "../../../../../packages/auth/context";
import type { AuthContext } from "../../../../../packages/auth/context";

const TENANT = "00000000-0000-4000-8000-0000000000a1";
const ROW = "00000000-0000-4000-8000-00000000a0a1";

const h = vi.hoisted(() => ({
  auth: vi.fn(),
  session: vi.fn(),
  serviceKeyUsed: vi.fn(),
}));
vi.mock("@asym/auth/context", async (importOriginal) => ({
  ...(await importOriginal<typeof AuthModule>()),
  getAuthContext: h.auth,
}));
vi.mock("@asym/database/supabase/admin", () => ({
  getAdminClient: () => ({
    client: new Proxy(
      {},
      {
        get: (_target, key) => {
          h.serviceKeyUsed(String(key));
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
vi.mock(
  "../../../../../packages/api/src/shared/request-session-client",
  () => ({ createRequestSessionClient: h.session }),
);

import { GET } from "../../../../../packages/api/src/admin/users";

type Call = [string, ...unknown[]];

/** The caller-token client: records the query and answers with `result`. */
function sessionClient(result: { data: unknown; error: unknown }) {
  const calls: Call[] = [];
  const query = {
    eq: (...a: unknown[]) => (calls.push(["eq", ...a]), query),
    order: (...a: unknown[]) => (calls.push(["order", ...a]), query),
    range: (...a: unknown[]) => (calls.push(["range", ...a]), query),
    setHeader: (...a: unknown[]) => (calls.push(["setHeader", ...a]), query),
    then: (resolve: (value: unknown) => unknown) => resolve(result),
  };
  return {
    calls,
    client: {
      rpc: (...a: unknown[]) => (calls.push(["rpc", ...a]), query),
    },
  };
}

const directoryRow = {
  membership_id: ROW,
  user_id: "00000000-0000-4000-9000-000000000001",
  profile_id: "00000000-0000-4000-8000-000000000001",
  display_name: "Blair Admin",
  email: "blair@example.org",
  role: "staff",
  staff_role: "development",
  is_tenant_admin: true,
  updated_at: "2026-11-23T00:00:00.000Z",
};

const list = (query: string) =>
  GET(new NextRequest(`https://admin.example.test/api/admin/users?${query}`));

beforeEach(() => {
  h.auth.mockResolvedValue({
    userId: "00000000-0000-4000-9000-000000000001",
    email: null,
    tenantId: TENANT,
    role: "admin",
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
      userId: "00000000-0000-4000-9000-000000000001",
      tenantId: TENANT,
      revision: "1",
      membershipRole: "staff",
      staffRole: "development",
      isTenantAdmin: true,
    },
    assignmentDenial: null,
    profileId: "00000000-0000-4000-8000-000000000001",
    isAuthenticated: true,
  } as AuthContext);
  h.session.mockReset();
  h.serviceKeyUsed.mockReset();
});

describe("the Mission Control users list (council round 1 on WP2a, F8)", () => {
  it("reads the member directory on the caller's token, under the resolved row, filtered and paged in SQL", async () => {
    const session = sessionClient({ data: [directoryRow], error: null });
    h.session.mockResolvedValue(session.client);

    const response = await list("role=admin&limit=10&offset=20");

    expect(response.status).toBe(200);
    // WP2b, AL-2675 (council round 1 on slice B, SB15): the resolved row's
    // `x-asym-assignment` header goes out on every request of the session
    // client, which is built with the resolved scope (asserted below; the
    // session client's own suite proves the scope becomes the two headers).
    // The handler no longer sets the same header a second time by hand, so
    // the query carries no `setHeader` call.
    expect(session.calls).toEqual([
      ["rpc", "tenant_member_directory", { p_tenant_id: TENANT }],
      ["eq", "role", "staff"],
      ["eq", "is_tenant_admin", true],
      ["order", "display_name", { ascending: true, nullsFirst: false }],
      ["order", "membership_id", { ascending: true }],
      ["range", 20, 29],
    ]);
    expect(h.serviceKeyUsed).not.toHaveBeenCalled();
    // The header goes out: the session client sends the resolved tenant and row.
    expect(h.session).toHaveBeenCalledWith(expect.any(Request), {
      tenantId: TENANT,
      assignmentId: ROW,
    });
    const body = (await response.json()) as { users: unknown[] };
    expect(body.users).toEqual([
      {
        id: directoryRow.profile_id,
        membership_id: ROW,
        display_name: "Blair Admin",
        email: "blair@example.org",
        tenant_id: TENANT,
        role: "admin",
        staff_role: "development",
        is_tenant_admin: true,
        updated_at: "2026-11-23T00:00:00.000Z",
      },
    ]);
  });

  it.each([
    [
      "staff",
      [
        ["eq", "role", "staff"],
        ["eq", "is_tenant_admin", false],
      ],
    ],
    [
      "finance",
      [
        ["eq", "role", "staff"],
        ["eq", "staff_role", "finance"],
      ],
    ],
    [
      "mobilizers",
      [
        ["eq", "role", "staff"],
        ["eq", "staff_role", "mobilizer"],
      ],
    ],
    ["donor", [["eq", "role", "donor"]]],
    ["", []],
  ] as const)("asks the database for the label %j", async (label, filters) => {
    const session = sessionClient({ data: [], error: null });
    h.session.mockResolvedValue(session.client);
    await list(`limit=5${label ? `&role=${label}` : ""}`);
    expect(session.calls.filter(([op]) => op === "eq")).toEqual(filters);
  });

  it("lists nobody for super_admin or an unknown label, without a query", async () => {
    const session = sessionClient({ data: [], error: null });
    h.session.mockResolvedValue(session.client);
    for (const label of ["super_admin", "events"]) {
      const response = await list(`role=${label}`);
      expect(await response.json()).toEqual({ users: [] });
    }
    expect(session.calls).toEqual([]);
  });

  it("answers 403 when the directory refuses the caller", async () => {
    h.session.mockResolvedValue(
      sessionClient({
        data: null,
        error: {
          code: "42501",
          message:
            "Forbidden: the member directory requires a live staff membership in this tenant.",
        },
      }).client,
    );
    expect((await list("limit=5")).status).toBe(403);
  });
});
