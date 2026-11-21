import { describe, expect, it } from "vitest";

import { buildReportResponse } from "../../../../packages/api/src/admin/crm/reports/service";
import { serializeAdminCrmReportCsv as serialize } from "../../../../packages/api/src/admin/crm/reports/export-projection";
import { reportGroupRevision } from "../../../../packages/api/src/admin/crm/reports/report-revision";
import { policies } from "./projection/fixtures";

import type { AdminCrmReportParams } from "../../../../packages/api/src/admin/crm/reports/query";
import type { CrmReportRow } from "@asym/database/types";

const params: AdminCrmReportParams = {
  filters: { dateFrom: null, dateTo: null, search: null },
  slice: "donors",
};

// "Zo\u00eb M\u00fcller\u2014B\u00e4ckerei" \u2014 a non-ASCII donor/org
// name (umlauts + em dash), written with escapes so the source stays ASCII
// while the runtime value exercises encoding.
const nonAsciiName = "Zo\u00eb M\u00fcller\u2014B\u00e4ckerei";
const nbspHyperlinkPayload = '\u00a0=HYPERLINK("http://evil.example","x")';

const rows: CrmReportRow[] = [
  {
    amountCents: 12500,
    donorCount: 1,
    giftCount: 1,
    id: "donor-1",
    // Donor-controlled name carrying a spreadsheet formula payload after a
    // leading no-break space.
    label: nbspHyperlinkPayload,
    lastGiftAt: "2026-05-10T00:00:00.000Z",
    metadata: {},
    status: "active",
  },
  {
    amountCents: 5000,
    donorCount: 1,
    giftCount: 2,
    id: "donor-2",
    label: nonAsciiName,
    lastGiftAt: null,
    metadata: { source: "donors" },
    status: null,
  },
];

const assignment = {
  assignmentId: "assignment-a",
  tenantId: "tenant-a",
  userId: "user-a",
  revision: "revision",
  membershipRole: "staff",
  staffRole: "development",
  isTenantAdmin: false,
} as const;
const keys = [
  "label",
  "net_amount_cents",
  "report_complete",
  "report_gift_limit",
  "metadata",
  "id",
];
function serializeAdminCrmReportCsv(
  report: ReturnType<typeof buildReportResponse>,
  tenantId = assignment.tenantId as string,
  fields = keys,
) {
  return serialize(
    {
      slice: report.slice,
      search: null,
      rows: report.rows.map((row) => ({
        anonymous: false,
        revision: reportGroupRevision({
          tenantId,
          slice: report.slice,
          groupId: `${report.slice}:${row.id}`,
          row,
          completeness: report.completeness,
          anonymous: false,
        }),
        tenant_id: tenantId,
        groupId: `${report.slice}:${row.id}`,
        row,
        completeness: report.completeness,
      })),
    },
    assignment,
    policies(
      "mission_control",
      "crm_report_groups",
      fields.map((fieldKey) => ({ fieldKey })),
    ),
  ).csv;
}

describe("serializeAdminCrmReportCsv — export hardening", () => {
  const csv = serializeAdminCrmReportCsv(buildReportResponse(params, rows));

  it("prepends a UTF-8 BOM so Excel renders non-ASCII names", () => {
    expect(csv.charCodeAt(0)).toBe(0xfeff);
  });

  it("emits CRLF record separators (one header + one row per data row)", () => {
    const body = csv.slice(1); // drop the BOM
    const lines = body.split("\r\n");
    expect(lines).toHaveLength(3);
    expect(body.includes("\r\n")).toBe(true);
    // No bare LF is used as a record separator.
    expect(lines.every((line) => !line.includes("\n"))).toBe(true);
  });

  it("quotes the header row through the shared serializer", () => {
    expect(csv.slice(1)).toMatch(/^"label","net_amount_cents"/);
  });

  it("neutralizes spreadsheet formula injection after a leading no-break space in the label column", () => {
    expect(csv).toContain(`"'\u00a0=HYPERLINK(""http://evil.example"",""x"")"`);
  });

  it("preserves non-ASCII donor/org names verbatim", () => {
    expect(csv).toContain(nonAsciiName);
    expect(csv).toContain(`"${nonAsciiName}"`);
  });

  it("never serializes raw IDs, nested metadata, or fields missing from the resolved policy", () => {
    for (const hidden of [
      "donor-1",
      "metadata",
      "source",
      "gift_count",
      "status",
    ])
      expect(csv).not.toContain(hidden);
    const report = buildReportResponse(params, rows);
    // Fix check G3: a group of another tenant fails the export, not the row.
    expect(() => serializeAdminCrmReportCsv(report, "tenant-b")).toThrow(
      "A report group failed its binding",
    );
    expect(() => serializeAdminCrmReportCsv(report, "tenant-a", [])).toThrow(
      /policy/i,
    );
  });
});

describe("serializeAdminCrmReportCsv — coverage", () => {
  const CRLF = String.fromCharCode(13, 10);
  const records = (csv: string) =>
    csv
      .slice(1)
      .split(CRLF)
      .map((line) => line.split(","));

  it("marks every row of a capped report as incomplete, with the read limit", () => {
    const capped = buildReportResponse(params, rows, {
      completeness: {
        complete: false,
        donationLimit: 50000,
        includedGiftCount: 50000,
      },
      distinctDonorCount: 2,
      distinctGiftCount: 3,
    });
    const [header, ...data] = records(serializeAdminCrmReportCsv(capped));

    expect(header?.slice(-2)).toEqual([
      '"report_complete"',
      '"report_gift_limit"',
    ]);
    expect(data).toHaveLength(2);
    for (const row of data) {
      expect(row.slice(-2)).toEqual(['"false"', '"50000"']);
    }
  });

  it("marks a complete report as complete", () => {
    const [, ...data] = records(
      serializeAdminCrmReportCsv(buildReportResponse(params, rows)),
    );
    expect(data).toHaveLength(2);
    for (const row of data) {
      expect(row.at(-2)).toBe('"true"');
    }
  });
});
