import { describe, expect, it } from "vitest";

import {
  buildReportResponse,
  serializeAdminCrmReportCsv,
} from "../../../../packages/api/src/admin/crm/reports/service";

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

const rows: CrmReportRow[] = [
  {
    amountCents: 12500,
    donorCount: 1,
    giftCount: 1,
    id: "donor-1",
    // Donor-controlled name carrying a spreadsheet formula payload.
    label: '=HYPERLINK("http://evil.example","x")',
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
    expect(csv.slice(1)).toMatch(/^"id","label","amount_cents"/);
  });

  it("neutralizes spreadsheet formula injection in the label column", () => {
    expect(csv).toContain(`"'=HYPERLINK(""http://evil.example"",""x"")"`);
  });

  it("preserves non-ASCII donor/org names verbatim", () => {
    expect(csv).toContain(nonAsciiName);
    expect(csv).toContain(`"${nonAsciiName}"`);
  });

  it("JSON-serializes and quotes object metadata cells", () => {
    expect(csv).toContain(`"{""source"":""donors""}"`);
  });
});
