import { normalizeSharedCrmPostStatus } from "../contribution-shared/row-contract";

import type { SharedContributionCrmPostStatus } from "@asym/database/types";

/**
 * Historical CRM parent + child post state (ADR-CD-012).
 *
 * Preserve parent- and line-scoped provider evidence for audit and support.
 * This state is historical metadata, never payment truth or authority to post.
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
  "The historical CRM posting record represents this gift as a single parent record and has no child record for each designation line.";

/**
 * Merge CRM link sources in current-authority order.
 *
 * A donation can retain a legacy donation-keyed parent link after it has been
 * promoted to a staged gift. The staged-gift parent is the current record and
 * must therefore precede the legacy parent because the read model selects the
 * first parent link. Child links remain available for per-designation status,
 * and duplicate rows are retained only from the highest-authority source.
 */
export function mergeCrmPostLinksByAuthority(input: {
  stagedGiftParentLinks: CrmPostLinkInput[];
  donationLinks: CrmPostLinkInput[];
  designationLinks: CrmPostLinkInput[];
}): CrmPostLinkInput[] {
  const ordered = [
    ...input.stagedGiftParentLinks,
    ...input.donationLinks,
    ...input.designationLinks,
  ];

  return Array.from(new Map(ordered.map((link) => [link.id, link])).values());
}

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

  const aggregateParentStatus = normalizeSharedCrmPostStatus(
    input.stagedGiftCrmPostStatus,
  );
  const parentLinkStatus = normalizeLinkStatus(parentLink?.linkStatus ?? null);
  const parentStatus =
    parentLinkStatus === "failed" || parentLinkStatus === "blocked"
      ? parentLinkStatus
      : (aggregateParentStatus ?? parentLinkStatus);
  const parent = {
    status: parentStatus,
    twentyRecordId:
      parentLink?.twentyRecordId ?? input.stagedGiftTwentyRecordId ?? null,
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
