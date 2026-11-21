import { createHash } from "node:crypto";

import type {
  AdminCrmReportCompleteness,
  CrmReportRow,
  CrmReportSlice,
} from "@asym/database/types";

/** What a report group's source revision covers (F11(c), fix check G3). */
export type ReportGroupFacts = Readonly<{
  tenantId: string;
  slice: CrmReportSlice;
  groupId: string;
  row: CrmReportRow;
  completeness: AdminCrmReportCompleteness;
  anonymous: boolean;
}>;

/**
 * A digest of one fixed-order tuple: the group's tenant, slice and qualified
 * group ID, every value of its row, the report's completeness and the
 * anonymity the export decided. It binds a row to its tenant and its group:
 * the export recomputes it from the group it serializes, and any difference
 * fails the whole export.
 */
export function reportGroupRevision({
  tenantId,
  slice,
  groupId,
  row,
  completeness,
  anonymous,
}: ReportGroupFacts): string {
  const tuple = [
    tenantId,
    slice,
    groupId,
    row.id,
    row.label,
    row.amountCents,
    row.giftCount,
    row.donorCount,
    row.lastGiftAt,
    row.status,
    JSON.stringify(row.metadata ?? null),
    completeness.complete,
    completeness.includedGiftCount,
    completeness.donationLimit,
    anonymous,
  ];
  return createHash("sha256").update(JSON.stringify(tuple)).digest("hex");
}
