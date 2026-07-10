import { ApiHttpError } from "../../shared/http-errors";

import type { ContributionActionType } from "./types";

export type ContributionCrmRetryScope = "parent" | "designation";

export const CRM_DESIGNATION_RETRY_UNSUPPORTED_REASON =
  "Designation retry is not supported by the connected CRM adapter yet.";
export const CRM_DESIGNATION_RETRY_UNSUPPORTED_NEXT_STEP =
  "Resolve the failed designation record in the CRM directly, or retry a failed parent record when one is available.";

/**
 * Actions the current HTTP dependency set cannot execute safely. Keep this
 * below both route validation and availability so UI contracts never promise
 * an operation that the shared endpoint will reject.
 */
const UNSUPPORTED_ROUTE_ACTION_TYPES = new Set<ContributionActionType>([
  "metadata_update",
  "refund",
  "donor_relink",
]);

export function isContributionRouteActionSupported(
  actionType: ContributionActionType,
): boolean {
  return !UNSUPPORTED_ROUTE_ACTION_TYPES.has(actionType);
}

/**
 * The production route can retry the parent CRM gift record today. The
 * designation callback remains an optional future adapter capability; do not
 * advertise it while the wired adapter can only return 501.
 */
export function isContributionRouteCrmRetryScopeSupported(
  scope: ContributionCrmRetryScope,
): boolean {
  return scope === "parent";
}

export function unsupportedContributionRouteActionMessage(
  actionType: ContributionActionType,
): string {
  switch (actionType) {
    case "metadata_update":
      return "metadata_update is not supported by this route yet.";
    case "refund":
      return "refund is not supported by this route until provider refund dependencies are wired.";
    case "donor_relink":
      return "donor_relink is not supported by this route until donor relink dependencies are wired.";
    default:
      return `${actionType} is not supported by this route.`;
  }
}

export function assertContributionRouteActionSupported(
  actionType: ContributionActionType,
): void {
  if (isContributionRouteActionSupported(actionType)) {
    return;
  }

  throw new ApiHttpError(
    501,
    unsupportedContributionRouteActionMessage(actionType),
  );
}
