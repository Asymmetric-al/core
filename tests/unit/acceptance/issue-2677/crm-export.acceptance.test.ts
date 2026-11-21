import { describe, expect, it, vi } from "vitest";
import { createAuditLogger } from "@asym/lib/audit/logger";
import { captureError } from "@asym/lib/monitoring/sentry";
import { GET } from "../../../../packages/api/src/admin/crm/reports/export";
import { reportGroupRevision } from "../../../../packages/api/src/admin/crm/reports/report-revision";
import { policies } from "../../packages/api/projection/fixtures";

const { insert, read, session, policy } = vi.hoisted(() => ({
  insert: vi.fn(),
  read: vi.fn(),
  session: vi.fn(),
  policy: vi.fn(),
}));
vi.mock("@asym/lib/monitoring/sentry", () => ({ captureError: vi.fn() }));
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
  staffRole: "finance" | "development" = "finance",
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
      staffRole,
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
  it("refuses sync failures without a classified export reference", async () => {
    vi.clearAllMocks();
    expect((await run("slice=sync-failures")).status).toBe(422);
    for (const call of [session, policy, read, insert])
      expect(call).not.toHaveBeenCalled();
  });
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
    expect(captureError).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({ requestId: "request-1" }),
      { request_id: "request-1" },
    );
    expect(refused.headers.get("content-type")).not.toContain("csv");
    expect(await refused.text()).not.toContain("private detail");
  });
  // Fix check G2: a donor whose name the audience may not see is counted in
  // the audit row, never named by a reference that resolves to them.
  it.each([
    ["development", false],
    ["finance", true],
  ] as const)(
    "records a withheld donor only as a count (%s audience)",
    async (staffRole, named) => {
      vi.clearAllMocks();
      const completeness = {
        complete: true,
        donationLimit: 100,
        includedGiftCount: 2,
      };
      const group = (id: string, label: string, anonymous: boolean) => {
        const row = {
          id,
          label,
          amountCents: 500,
          giftCount: 1,
          donorCount: 1,
          lastGiftAt: null,
          status: null,
          metadata: {},
        };
        return {
          anonymous,
          revision: reportGroupRevision({
            tenantId: "tenant-1",
            slice: "donors",
            groupId: `donors:${id}`,
            row,
            completeness,
            anonymous,
          }),
          tenant_id: "tenant-1",
          groupId: `donors:${id}`,
          completeness,
          row,
        };
      };
      read.mockResolvedValue({
        slice: "donors",
        search: null,
        rows: [
          group("donor-withheld-7f3c", "Quiet Giver", true),
          group("donor-named-1", "Ada Donor", false),
        ],
      });
      session.mockResolvedValue({});
      policy.mockResolvedValue(
        policies("mission_control", "crm_report_groups", [
          { fieldKey: "label" },
          { fieldKey: "gift_count" },
        ]),
      );
      insert.mockResolvedValue({ error: null });
      const response = await run(
        "slice=donors",
        { "sec-fetch-site": "same-origin" },
        staffRole,
      );
      expect(response.status).toBe(200);
      const csv = await response.text();
      expect(csv.includes("Quiet Giver")).toBe(named);
      const stored = insert.mock.calls.at(-1)?.[0] as {
        details: Record<string, unknown>;
      };
      expect(JSON.stringify(stored).includes("donor-withheld-7f3c")).toBe(
        named,
      );
      expect(stored.details).toMatchObject(
        named
          ? {
              groupIds: ["donors:donor-withheld-7f3c", "donors:donor-named-1"],
              rowCount: 2,
            }
          : {
              groupIds: ["donors:donor-named-1"],
              withheldGroups: 1,
              rowCount: 2,
            },
      );
    },
  );
  // Fix check G3: a group that fails its binding fails the export: no file,
  // no success audit row, a logged 500.
  it("fails the whole export when a group fails its binding", async () => {
    vi.clearAllMocks();
    const row = {
      id: "fund-1",
      label: "General Fund",
      amountCents: 500,
      giftCount: 1,
      donorCount: 1,
      lastGiftAt: null,
      status: null,
      metadata: {},
    };
    read.mockResolvedValue({
      slice: "funds",
      search: null,
      rows: [
        {
          anonymous: false,
          revision: "a-revision-of-other-values",
          tenant_id: "tenant-1",
          groupId: "funds:fund-1",
          completeness: {
            complete: true,
            donationLimit: 100,
            includedGiftCount: 1,
          },
          row,
        },
      ],
    });
    session.mockResolvedValue({});
    policy.mockResolvedValue(
      policies("mission_control", "crm_report_groups", [{ fieldKey: "label" }]),
    );
    insert.mockResolvedValue({ error: null });
    const response = await run("slice=funds");
    expect(response.status).toBe(500);
    expect(response.headers.get("content-type")).not.toContain("csv");
    expect(insert).not.toHaveBeenCalled();
    expect(captureError).toHaveBeenCalled();
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
