import { normalizeSharedCrmPostStatus } from "../contribution-shared/row-contract";

import type { SharedContributionCrmPostStatus } from "@asym/database/types";

/**
 * CRM/Twenty parent + child post state (ADR-CD-012).
 *
 * One CRM parent gift record represents the donation; each designation line
 * may post as a child record under it. Failures are parent- or line-scoped so
 * retries can target the failed scope, and adapter limitations are surfaced
 * instead of silently collapsing designation detail. CRM/Twenty post state is
 * workflow metadata — never payment truth.
 */

export interface CrmPostLinkInput {
  id: string;
  scope: "parent" | "designation";
  allocationId: string | null;
  linkStatus: string | null;
  twentyRecordId: string | null;
  lastError: string | null;
}

export interface CrmDesignationRecordState {
  allocationId: string | null;
  status: SharedContributionCrmPostStatus | null;
  twentyRecordId: string | null;
  lastError: string | null;
}

export type CrmPostFailedScope =
  | { scope: "parent" }
  | { scope: "designation"; allocationId: string | null };

export interface ContributionCrmPostState {
  parent: {
    status: SharedContributionCrmPostStatus | null;
    twentyRecordId: string | null;
    lastError: string | null;
  };
  designationRecords: CrmDesignationRecordState[];
  /** Scopes a retry action may target without reposting unrelated lines. */
  failedScopes: CrmPostFailedScope[];
  /** Staff-readable adapter limitation, when designation detail is flattened. */
  adapterLimitation: string | null;
}

export const CRM_CHILD_RECORDS_UNSUPPORTED_MESSAGE =
  "The connected CRM adapter posts this gift as a single parent record and does not yet represent each designation line as a child record.";

function normalizeLinkStatus(
  linkStatus: string | null,
): SharedContributionCrmPostStatus | null {
  switch (linkStatus) {
    case "active":
      return "posted";
    case "queued":
      return "queued";
    case "failed":
      return "failed";
    case "archived":
      return "not_required";
    default:
      return normalizeSharedCrmPostStatus(linkStatus);
  }
}

export function buildContributionCrmPostState(input: {
  stagedGiftCrmPostStatus: string | null;
  stagedGiftTwentyRecordId: string | null;
  links: CrmPostLinkInput[];
  designationLineCount: number;
}): ContributionCrmPostState {
  const parentLink =
    input.links.find((link) => link.scope === "parent") ?? null;
  const childLinks = input.links.filter((link) => link.scope === "designation");

  const parentStatus = normalizeSharedCrmPostStatus(
    input.stagedGiftCrmPostStatus,
  );
  const parent = {
    status: parentStatus,
    twentyRecordId:
      input.stagedGiftTwentyRecordId ?? parentLink?.twentyRecordId ?? null,
    lastError: parentLink?.lastError ?? null,
  };

  const designationRecords: CrmDesignationRecordState[] = childLinks.map(
    (link) => ({
      allocationId: link.allocationId,
      status: normalizeLinkStatus(link.linkStatus),
      twentyRecordId: link.twentyRecordId,
      lastError: link.lastError,
    }),
  );

  const failedScopes: CrmPostFailedScope[] = [];
  if (parent.status === "failed" || parent.status === "blocked") {
    failedScopes.push({ scope: "parent" });
  }
  for (const record of designationRecords) {
    if (record.status === "failed" || record.status === "blocked") {
      failedScopes.push({
        scope: "designation",
        allocationId: record.allocationId,
      });
    }
  }

  const adapterLimitation =
    input.designationLineCount > 1 && childLinks.length === 0
      ? CRM_CHILD_RECORDS_UNSUPPORTED_MESSAGE
      : null;

  return { parent, designationRecords, failedScopes, adapterLimitation };
}
