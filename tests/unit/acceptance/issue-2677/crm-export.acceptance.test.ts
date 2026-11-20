import { describe, expect, it, vi } from "vitest";
import { createAuditLogger } from "@asym/lib/audit/logger";
import { GET } from "../../../../packages/api/src/admin/crm/reports/export";

const { insert, read, session, policy } = vi.hoisted(() => ({
  insert: vi.fn(),
  read: vi.fn(),
  session: vi.fn(),
  policy: vi.fn(),
}));
vi.mock("@asym/database/supabase/admin", () => ({
  createAdminClient: () => ({ from: () => ({ insert }) }),
}));
vi.mock("../../../../packages/api/src/shared/with-operation", () => ({
  withPlatformOperation: (handler: unknown) => handler,
}));
vi.mock("../../../../packages/api/src/shared/request-session-client", () => ({
  createRequestSessionClient: session,
}));
vi.mock("../../../../packages/api/src/field-policies/reader", () => ({
  loadFieldPolicies: policy,
}));
vi.mock("../../../../packages/api/src/admin/crm/reports/service", () => ({
  buildAdminCrmReport: read,
  buildAdminCrmExportGroups: read,
}));
vi.mock("../../../../packages/api/src/crm/auth/access", () => ({
  requireCrmAccess: () => ({ tenantId: "tenant-1", userId: "user-1" }),
}));

function run(query: string) {
  const auth = {
    isAuthenticated: true,
    tenantId: "tenant-1",
    userId: "user-1",
    assignment: {
      tenantId: "tenant-1",
      userId: "user-1",
      assignmentId: "assignment-1",
      revision: "1",
      membershipRole: "staff",
    },
  };
  const request = new Request(`http://localhost/api/crm/export?${query}`);
  return GET({
    auth,
    request,
    audit: createAuditLogger(auth as never),
    requestId: "request-1",
    supabaseAdmin: {},
  } as never);
}

describe("governed CRM report export", () => {
  it.each([
    "tenantId=tenant-2",
    "tenant_id=tenant-2",
    "tenantId=tenant-1&tenantId=tenant-2",
  ])("rejects %s before reading or writing", async (query) => {
    const response = await run(query);
    expect(response.status).toBe(403);
    for (const call of [read, session, policy, insert])
      expect(call).not.toHaveBeenCalled();
  });
  it("audits only session identity and safe metadata; withholds the CSV if audit fails", async () => {
    read.mockResolvedValue({ slice: "donors", rows: [], revision: "1" });
    session.mockResolvedValue({});
    policy.mockResolvedValue({});
    insert
      .mockResolvedValueOnce({ error: null })
      .mockResolvedValueOnce({ error: { message: "private detail" } });
    const query = "actorId=forged&q=sensitive-filter";
    expect((await run(query)).status).toBe(200);
    expect(insert.mock.calls.at(-1)?.[0]).toMatchObject({
      user_id: "user-1",
      tenant_id: "tenant-1",
      action: "crm_export_created",
      details: { rowCount: 0 },
    });
    expect(JSON.stringify(insert.mock.calls.at(-1))).not.toMatch(
      /forged|sensitive-filter/,
    );
    const refused = await run(query);
    expect(refused.status).toBe(500);
    expect(refused.headers.get("content-type")).not.toContain("csv");
    expect(await refused.text()).not.toContain("private detail");
  });
});
