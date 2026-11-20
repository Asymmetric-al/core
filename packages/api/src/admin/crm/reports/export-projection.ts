import { CSV_RECORD_SEPARATOR, CSV_UTF8_BOM, csvSafeCell } from "@asym/lib/csv";

import { resolveProjection } from "../../../projection";

import type { buildAdminCrmExportGroups } from "./service";
import type { FieldPolicySet } from "../../../field-policies/reader";
import type { AuthenticatedContext } from "@asym/auth/context";

export const reportRecordType = "crm_report_groups";
const surface = "mission_control";
const purpose = "crm.report.export";
const operation = "bulk_export";
const notApplicable = { kind: "not_applicable" } as const;
const allowedMeasures = [
  "label",
  "net_amount_cents",
  "gift_count",
  "donor_count",
  "last_gift_at",
  "report_complete",
  "report_gift_limit",
];

export function serializeAdminCrmReportCsv(
  report: Awaited<ReturnType<typeof buildAdminCrmExportGroups>>,
  assignment: NonNullable<AuthenticatedContext["assignment"]>,
  policies: FieldPolicySet,
) {
  const headers = new Set<string>();
  const groupIds: string[] = [];
  const records: Record<string, unknown>[] = [];
  for (const { row, groupId, tenant_id, completeness } of report.rows) {
    const current = {
      contextRevision: assignment.revision,
      sourceRevision: report.revision,
    };
    const binding = {
      ...current,
      contextRef: assignment.assignmentId,
      principalId: assignment.userId,
      tenantId: assignment.tenantId,
      purpose,
      surface,
      recordType: reportRecordType,
      recordId: groupId,
      sourceRef: `${tenant_id}:${groupId}`,
      operation,
    } as const;
    const anonymous = report.slice === "donors" && row.id === "unassigned";
    const resolved = resolveProjection({
      surface,
      recordType: reportRecordType,
      policies,
      row: {
        id: `${report.slice}:${row.id}`,
        tenant_id,
        label: anonymous ? "Anonymous donor" : row.label,
        net_amount_cents: row.amountCents,
        gift_count: row.giftCount,
        donor_count: row.donorCount,
        last_gift_at: row.lastGiftAt,
        report_complete: completeness.complete,
        report_gift_limit: completeness.donationLimit,
      },
      auth: {
        kind: "human",
        binding,
        current,
        assignment: {
          id: assignment.assignmentId,
          revision: assignment.revision,
          currentRevision: assignment.revision,
          principalId: assignment.userId,
          tenantId: assignment.tenantId,
        },
        ceiling: {
          contextRef: assignment.assignmentId,
          contextRevision: assignment.revision,
          purpose,
          operation,
          readableFields: allowedMeasures,
          exportableFields: allowedMeasures,
        },
        legalEntities: {
          revision: report.revision,
          currentRevision: report.revision,
          ids: [],
        },
      },
      scope: {
        binding,
        legalEntity: notApplicable,
        ownership: notApplicable,
        relationship: notApplicable,
        anonymity:
          report.slice !== "donors"
            ? notApplicable
            : {
                kind: "applicable",
                intent: anonymous ? "anonymous" : "named",
                audience: "identity_restricted",
                identityFields: ["id"],
                identityField: "id",
                identityRequired: true,
              },
        flags: notApplicable,
        state: notApplicable,
        predicates: [],
      },
    });
    if (resolved.kind !== "allowed") continue;
    const cells = Object.entries(resolved.projection).filter(
      ([, value]) =>
        value === null ||
        ["string", "number", "boolean"].includes(typeof value),
    );
    if (!cells.length) continue;
    for (const [key] of cells) headers.add(key);
    records.push(Object.fromEntries(cells));
    groupIds.push(groupId);
  }
  const keys = [...headers];
  const lines = [
    keys,
    ...records.map((record) => keys.map((key) => record[key])),
  ];
  return {
    csv:
      CSV_UTF8_BOM +
      lines
        .map((line) => line.map(csvSafeCell).join(","))
        .join(CSV_RECORD_SEPARATOR),
    groupIds,
  };
}
