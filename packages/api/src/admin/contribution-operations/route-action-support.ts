import {
  CRM_POSTING_UNAVAILABLE_NEXT_STEP,
  CRM_POSTING_UNAVAILABLE_REASON,
} from "./crm-retry-support";
import { ApiHttpError } from "../../shared/http-errors";

import type { ContributionActionType } from "./types";

export {
  CRM_DESIGNATION_RETRY_UNSUPPORTED_NEXT_STEP,
  CRM_DESIGNATION_RETRY_UNSUPPORTED_REASON,
  CRM_POSTING_UNAVAILABLE_NEXT_STEP,
  CRM_POSTING_UNAVAILABLE_REASON,
  isContributionCrmPostingSupported,
  isContributionRouteCrmRetryScopeSupported,
  type ContributionCrmRetryScope,
} from "./crm-retry-support";

/**
 * Actions the current HTTP dependency set cannot execute safely. Keep this
 * below both route validation and availability so UI contracts never promise
 * an operation that the shared endpoint will reject.
 */
const UNSUPPORTED_ROUTE_ACTION_TYPES = new Set<ContributionActionType>([
  "approve_staged_gift",
  "retry_staged_gift",
  "crm_repost",
  "metadata_update",
  "refund",
  "donor_relink",
]);

export function isContributionRouteActionSupported(
  actionType: ContributionActionType,
): boolean {
  return !UNSUPPORTED_ROUTE_ACTION_TYPES.has(actionType);
}

export function unsupportedContributionRouteActionMessage(
  actionType: ContributionActionType,
): string {
  switch (actionType) {
    case "approve_staged_gift":
    case "retry_staged_gift":
    case "crm_repost":
      return `${CRM_POSTING_UNAVAILABLE_REASON} ${CRM_POSTING_UNAVAILABLE_NEXT_STEP}`;
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
