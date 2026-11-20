import { describe, expect, it, vi } from "vitest";
import { createAuditLogger } from "@asym/lib/audit/logger";
import { GET } from "../../../../packages/api/src/admin/crm/reports/export";
import { policies } from "../../packages/api/projection/fixtures";

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

function run(
  query: string,
  headers: Record<string, string> = { "sec-fetch-site": "same-origin" },
) {
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
      staffRole: "finance",
      isTenantAdmin: false,
    },
  };
  const request = new Request(`http://localhost/api/crm/export?${query}`, {
    headers,
  });
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
    {},
    { "sec-fetch-site": "cross-site", referer: "http://localhost/reports" },
    { referer: "https://other.example.test/reports" },
  ] as Record<string, string>[])(
    "rejects %j before reading or writing",
    async (headers) => {
      vi.clearAllMocks();
      const response = await run("", headers);
      expect(response.status).toBe(403);
      for (const call of [read, session, policy, insert])
        expect(call).not.toHaveBeenCalled();
    },
  );
  it("audits only session identity and safe metadata; withholds the CSV if audit fails", async () => {
    read.mockResolvedValue({ slice: "donors", rows: [], revision: "1" });
    session.mockResolvedValue({});
    policy.mockResolvedValue(
      policies("mission_control", "crm_report_groups", [{ fieldKey: "label" }]),
    );
    insert
      .mockResolvedValueOnce({ error: null })
      .mockResolvedValueOnce({ error: { message: "private detail" } });
    const query = "actorId=forged&q=sensitive-filter";
    const success = await run(query, { referer: "http://localhost/reports" });
    expect(success.status).toBe(200);
    expect(await success.text()).toContain('"label"');
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
  it("does not audit or download without exportable policy rows", async () => {
    vi.clearAllMocks();
    policy.mockResolvedValue(
      policies("mission_control", "crm_report_groups", []),
    );
    read.mockResolvedValue({ slice: "donors", rows: [] });
    const response = await run("");
    expect(response.status).toBe(500);
    expect(insert).not.toHaveBeenCalled();
  });
});
