/** #2402 c13: five real handlers use session RPCs without actor arguments;
 * real validation/service/error mapping retains 200/400/403/404/409/500.
 * Only auth, database clients and audit/network boundaries are mocked.
 */
import { NextRequest } from "next/server";
import { beforeEach, expect, it, vi } from "vitest";

const m = vi.hoisted(() => ({
  admin: { rpc: vi.fn(), from: vi.fn() },
  session: { rpc: vi.fn() },
  auth: {
    isAuthenticated: true,
    userId: "user",
    tenantId: "11111111-1111-4111-8111-111111111111",
    profileId: "22222222-2222-4222-8222-222222222222" as string | null,
    role: "super_admin",
    profileRole: "super_admin",
    memberships: [],
  },
}));
vi.mock("@asym/database/supabase/admin", () => ({
  getAdminClient: () => ({ client: m.admin, error: null }),
}));
vi.mock("@asym/database/supabase/server", () => ({
  createClient: async () => m.session,
}));
vi.mock("@supabase/supabase-js", () => ({ createClient: () => m.session }));
vi.mock("@supabase/ssr", () => ({ createServerClient: () => m.session }));
vi.mock("next/headers", () => ({
  cookies: async () => ({ getAll: () => [] }),
}));
vi.mock("@asym/auth/context", () => ({
  getAuthContext: async () => m.auth,
  requireAuth: () => {},
  requireRole: () => {},
}));
vi.mock("@asym/lib/audit/logger", () => ({ createAuditLogger: () => ({}) }));

import * as R from "../../../../packages/api/src/admin/crm/table-preferences/route";

const viewId = "33333333-3333-4333-8333-333333333333";
function response(data: unknown, error: unknown = null) {
  for (const rpc of [m.admin.rpc, m.session.rpc])
    rpc.mockResolvedValue({ data, error });
}
beforeEach(() => {
  m.auth.profileId = "22222222-2222-4222-8222-222222222222";
  response({
    id: viewId,
    name: "View",
    deleted: true,
    schema_version: 1,
    pinned_action_id: null,
    settings: {},
  });
  const q = {
    select: () => q,
    eq: () => q,
    maybeSingle: async () => ({ data: null, error: null }),
  };
  m.admin.from.mockReturnValue(q);
});
const routes = [
  R.PUT,
  R.PUT_TENANT_DEFAULT,
  R.POST_NAMED_VIEW,
  R.PUT_NAMED_VIEW,
  R.DELETE_NAMED_VIEW,
];
const names = [
  "save_crm_user_table_preference",
  "save_crm_tenant_table_default",
  "create_crm_table_named_view",
  "update_crm_table_named_view",
  "delete_crm_table_named_view",
];
function run(i: number, body: unknown = { name: "View" }, bearer = true) {
  const request = new NextRequest(
    "http://localhost/api/admin/crm/table-preferences",
    {
      method: i === 4 ? "DELETE" : i === 2 ? "POST" : "PUT",
      headers: {
        "content-type": "application/json",
        ...(bearer ? { authorization: "Bearer acceptance-token" } : {}),
      },
      ...(i === 4 ? {} : { body: JSON.stringify(body) }),
    },
  );
  return routes[i]!(request, { params: Promise.resolve({ viewId }) });
}
it.each(names)("13: session-only %s; no actor arguments", async (name) => {
  expect((await run(names.indexOf(name))).status).toBe(200);
  expect(m.admin.rpc).not.toHaveBeenCalled();
  expect(m.session.rpc).toHaveBeenCalledTimes(1);
  const [fn, params] = m.session.rpc.mock.calls[0]!;
  expect(fn).toBe(name);
  expect(params.p_tenant_id).toBe(m.auth.tenantId);
  expect(
    Object.keys(params).filter((k) =>
      /profile|actor|user_id|can_manage/.test(k),
    ),
  ).toEqual([]);
});
it("13: cookie-only request uses session RPC", async () => {
  expect((await run(0, {}, false)).status).toBe(200);
  expect(m.admin.rpc).not.toHaveBeenCalled();
  expect(m.session.rpc).toHaveBeenCalledTimes(1);
});
it.each([400, 403, 404, 409, 500])("13: retains HTTP %i", async (status) => {
  if (status === 403) m.auth.profileId = null;
  if (status === 404) response(null);
  if (status >= 409)
    response(null, {
      code: status === 409 ? "23505" : "XX000",
      message: "acceptance error",
    });
  const r = await run(
    status === 404 ? 3 : 2,
    status === 400 ? { name: "View", tableId: "invalid" } : undefined,
  );
  expect(r.status).toBe(status);
  expect(await r.json()).toHaveProperty("error");
});
