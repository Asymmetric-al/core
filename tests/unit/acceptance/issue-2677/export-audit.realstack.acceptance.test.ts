import { randomUUID } from "node:crypto";

import pg from "pg";
import { expect, it } from "vitest";

import {
  crmExportAuditDetails,
  serializeAdminCrmReportCsv,
} from "../../../../packages/api/src/admin/crm/reports/export-projection";
import { reportGroupRevision } from "../../../../packages/api/src/admin/crm/reports/report-revision";
import { policies } from "../../packages/api/projection/fixtures";
import {
  ADMIN_URL,
  IN_MIGRATE_JOB,
  asRole,
  fixtureIds,
  fixtureSql,
} from "../issue-2675/harness";

/*
 * Re-check H1 (AL-2677): an export's audit row is readable by every staff
 * member of the tenant (the select policy on audit_logs), so a donor who
 * explicitly chose anonymity is a count there even when finance, who may see
 * the name, exported. Read back through the table as development staff, the
 * row names the donor who made no choice and nothing of the anonymous one.
 */
it.runIf(IN_MIGRATE_JOB && !ADMIN_URL)("requires the migrate database", () =>
  expect(ADMIN_URL).not.toBe(""),
);

it.skipIf(!ADMIN_URL)(
  "a finance export's audit row, read by other staff, names no donor who chose anonymity",
  async () => {
    const db = new pg.Client({ connectionString: ADMIN_URL });
    await db.connect();
    try {
      await db.query("begin");
      const ids = fixtureIds();
      await db.query(fixtureSql(ids));
      const anonymousDonor = randomUUID();
      const namedDonor = randomUUID();
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
        const groupId = `donors:${id}`;
        return {
          anonymous,
          revision: reportGroupRevision({
            tenantId: ids.TA,
            slice: "donors",
            groupId,
            row,
            completeness,
            anonymous,
          }),
          tenant_id: ids.TA,
          groupId,
          completeness,
          row,
        };
      };
      const exported = serializeAdminCrmReportCsv(
        {
          slice: "donors",
          search: null,
          rows: [
            group(anonymousDonor, "Quiet Giver", true),
            group(namedDonor, "Ada Donor", false),
          ],
        },
        {
          assignmentId: ids.mFin,
          userId: ids.UFC,
          tenantId: ids.TA,
          revision: "1",
          membershipRole: "staff",
          staffRole: "finance",
          isTenantAdmin: false,
        },
        policies("mission_control", "crm_report_groups", [
          { fieldKey: "label" },
          { fieldKey: "gift_count" },
        ]),
      );
      // Finance sees both names in the file.
      expect(exported.csv).toContain("Quiet Giver");
      const details = crmExportAuditDetails(
        { dateFrom: null, dateTo: null, search: null },
        exported,
      );
      const {
        rows: [row],
      } = await db.query(
        `insert into public.audit_logs (tenant_id, user_id, action, resource_type, resource_id, details)
         values ($1, $2, 'crm_export_created', 'crm_report', 'donors', $3) returning id`,
        [ids.TA, ids.UFC, details],
      );
      const read = await asRole(db, ids)(
        "authenticated",
        {
          sub: "UDEV",
          headers: { "x-asym-tenant": ids.TA, "x-asym-assignment": ids.mDev },
        },
        `select details from public.audit_logs where id='${row.id}'`,
      );
      expect(read.rows).toHaveLength(1);
      const text = JSON.stringify(read.rows[0].details);
      expect(text).toContain(namedDonor);
      expect(text).not.toContain(anonymousDonor);
      expect(read.rows[0].details).toMatchObject({
        groupIds: [`donors:${namedDonor}`],
        anonymousGroups: 1,
        rowCount: 2,
      });
    } finally {
      await db.query("rollback");
      await db.end();
    }
  },
);
