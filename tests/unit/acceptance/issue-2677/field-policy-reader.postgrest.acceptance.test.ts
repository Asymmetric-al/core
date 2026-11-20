import { createClient } from "@supabase/supabase-js";
import { getAdminClient } from "@asym/database/supabase/admin";
import { createAuditLogger } from "@asym/lib/audit/logger";
import { NextRequest } from "next/server";
import { expect, it, vi } from "vitest";

import { loadFieldPolicies } from "../../../../packages/api/src/field-policies/reader";
import { resolveProjection } from "../../../../packages/api/src/projection";
import { createRequestSessionClient } from "../../../../packages/api/src/shared/request-session-client";
import { fixture } from "../../packages/api/projection/fixtures";
import { serializeAdminCrmReportCsv } from "../../../../packages/api/src/admin/crm/reports/export-projection";
import { reportGroupRevision } from "../../../../packages/api/src/admin/crm/reports/service";
import { GET as exportReport } from "../../../../packages/api/src/admin/crm/reports/export";

vi.mock("@asym/database/supabase/admin", () => ({ getAdminClient: vi.fn() }));
vi.mock("@asym/lib/audit/logger", () => ({ createAuditLogger: vi.fn() }));

const url = process.env.FIELD_POLICY_IT_SUPABASE_URL;
it.skipIf(!url && process.env.FIELD_POLICY_IT_REQUIRED !== "1")(
  "a signed-in caller gets only classified fields; the same token without scope gets none",
  async () => {
    if (!url || !["localhost", "127.0.0.1"].includes(new URL(url).hostname))
      throw new Error("Requires a disposable loopback Supabase stack");
    const key = process.env.FIELD_POLICY_IT_ANON_KEY;
    if (!key) throw new Error("Missing local public API key");
    const session = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data, error } = await session.auth.signInWithPassword({
      email: "demo-owner@givehope.test",
      password: "demo-password",
    });
    expect(error).toBeNull();
    const { data: assignments, error: rpcError } = await session.rpc(
      "current_user_assignments",
    );
    expect(rpcError).toBeNull();
    const staff = assignments.find(
      (entry: { role: string }) => entry.role === "staff",
    );
    expect(staff).toBeTruthy();
    const request = new Request(url, {
      headers: { Authorization: `Bearer ${data.session!.access_token}` },
    });
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", url);
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", key);
    try {
      const unassignedTenant = crypto.randomUUID();
      expect(
        assignments.map((entry: { tenant_id: string }) => entry.tenant_id),
      ).not.toContain(unassignedTenant);
      const refused = await exportReport(
        new NextRequest(new URL("/api/admin/crm/reports/export", url), {
          headers: {
            authorization: `Bearer ${data.session!.access_token}`,
            "sec-fetch-site": "same-origin",
            "x-asym-role-class": "staff",
            "x-asym-tenant": unassignedTenant,
            "x-asym-assignment": staff.id,
          },
        }),
      );
      expect(refused.status).toBe(401);
      expect(refused.headers.has("x-asym-scope-refused")).toBe(true);
      expect(getAdminClient).not.toHaveBeenCalled();
      expect(createAuditLogger).not.toHaveBeenCalled();
      for (const scope of [
        null,
        { tenantId: staff.tenant_id, assignmentId: staff.id },
      ]) {
        const sessionClient = await createRequestSessionClient(request, scope);
        const model = fixture("missionary", "donations");
        const policies = await loadFieldPolicies({
          sessionClient,
          surface: model.surface,
          recordType: model.recordType,
        });
        expect(policies.get("amount")?.visible ?? false).toBe(Boolean(scope));
        if (scope) {
          const reportPolicies = await loadFieldPolicies({
            sessionClient,
            surface: "mission_control",
            recordType: "crm_report_groups",
          });
          const row = {
            id: "fund",
            label: "Local relief",
            amountCents: 4700,
            donorCount: 1,
            giftCount: 1,
            lastGiftAt: null,
            metadata: {},
            status: null,
          };
          const completeness = {
            complete: true,
            donationLimit: 100,
            includedGiftCount: 1,
          };
          const { csv } = serializeAdminCrmReportCsv(
            {
              slice: "funds",
              search: null,
              rows: [
                {
                  groupId: "funds:fund",
                  tenant_id: staff.tenant_id,
                  row,
                  completeness,
                  anonymous: false,
                  revision: reportGroupRevision(row, completeness, false),
                },
              ],
            },
            {
              tenantId: staff.tenant_id,
              assignmentId: staff.id,
              userId: data.user!.id,
              membershipRole: "staff",
              staffRole: "finance",
              isTenantAdmin: false,
              revision: "1",
            },
            reportPolicies,
          );
          expect(csv).toContain('"label","net_amount_cents"');
          expect(csv).toContain('"Local relief","4700"');
        }
        expect(
          resolveProjection({
            ...model,
            policies,
            row: { ...model.row, unclassified: "never" },
          }),
        ).toEqual({
          kind: "allowed",
          projection: scope ? { amount: 1250 } : {},
        });
      }
    } finally {
      vi.unstubAllEnvs();
      await session.auth.signOut({ scope: "local" });
    }
  },
);
