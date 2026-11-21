import { describe, expect, it } from "vitest";

import { serializeAdminCrmReportCsv } from "../../../../packages/api/src/admin/crm/reports/export-projection";
import { reportGroupRevision } from "../../../../packages/api/src/admin/crm/reports/report-revision";
import { policies } from "./projection/fixtures";

/*
 * Fix check G3 (F11(c)): a report group's revision is a digest of one
 * fixed-order tuple of its tenant, slice, qualified group ID and values. The
 * export recomputes it from the group it serializes; a group that fails its
 * binding fails the whole export instead of being left out of the file.
 */
const completeness = {
  complete: true,
  donationLimit: 100,
  includedGiftCount: 1,
};
const row = {
  id: "fund-1",
  label: "General Fund",
  amountCents: 12500,
  giftCount: 1,
  donorCount: 1,
  lastGiftAt: null,
  status: null,
  metadata: {},
};
const assignment = {
  assignmentId: "membership-1",
  userId: "user-1",
  tenantId: "tenant-1",
  revision: "v1",
  membershipRole: "staff",
  staffRole: "finance",
  isTenantAdmin: false,
} as const;
const fields = policies("mission_control", "crm_report_groups", [
  { fieldKey: "label" },
  { fieldKey: "net_amount_cents" },
]);
const bound = {
  anonymous: false,
  revision: reportGroupRevision({
    tenantId: "tenant-1",
    slice: "funds",
    groupId: "funds:fund-1",
    row,
    completeness,
    anonymous: false,
  }),
  tenant_id: "tenant-1",
  groupId: "funds:fund-1",
  completeness,
  row,
};
const serialize = (group: typeof bound) =>
  serializeAdminCrmReportCsv(
    { slice: "funds", search: null, rows: [group] },
    assignment,
    fields,
  );

describe("report group revision", () => {
  it("exports a group whose values, group and tenant are those it was bound to", () => {
    const exported = serialize(bound);
    expect(exported.groupIds).toEqual(["funds:fund-1"]);
    expect(exported.csv).toContain('"General Fund","12500"');
  });

  it.each([
    ["a value", { row: { ...row, amountCents: row.amountCents + 1 } }],
    ["the group", { groupId: "funds:fund-2", row: { ...row, id: "fund-2" } }],
    ["the tenant", { tenant_id: "tenant-2" }],
  ])("fails the export when %s changed after binding", (_name, change) => {
    expect(() => serialize({ ...bound, ...change })).toThrow(
      "A report group failed its binding",
    );
  });

  // Re-check H5: metadata is canonicalized (sorted keys, recursively), so the
  // same values in another key order give the same revision.
  it("gives the same metadata in two key orders one revision", () => {
    const facts = {
      tenantId: "tenant-1",
      slice: "funds" as const,
      groupId: "funds:fund-1",
      completeness,
      anonymous: false,
    };
    expect(
      reportGroupRevision({
        ...facts,
        row: {
          ...row,
          metadata: { a: 1, b: { c: 2, d: [3, { e: 4, f: 5 }] } },
        },
      }),
    ).toBe(
      reportGroupRevision({
        ...facts,
        row: {
          ...row,
          metadata: { b: { d: [3, { f: 5, e: 4 }], c: 2 }, a: 1 },
        },
      }),
    );
  });

  it("gives equal values under two groups, slices or tenants different digests", () => {
    const facts = {
      tenantId: "tenant-1",
      slice: "funds" as const,
      groupId: "funds:fund-1",
      row,
      completeness,
      anonymous: false,
    };
    const digests = new Set([
      reportGroupRevision(facts),
      reportGroupRevision({ ...facts, groupId: "funds:fund-9" }),
      reportGroupRevision({ ...facts, slice: "missionaries" }),
      reportGroupRevision({ ...facts, tenantId: "tenant-2" }),
      reportGroupRevision({ ...facts, anonymous: true }),
    ]);
    expect(digests.size).toBe(5);
  });
});
