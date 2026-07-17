export type ContributionCrmRetryScope = "parent" | "designation";

export const CRM_POSTING_UNAVAILABLE_REASON =
  "CRM posting actions are unavailable because external CRM posting is no longer an active product workflow.";
export const CRM_POSTING_UNAVAILABLE_NEXT_STEP =
  "Treat the recorded posting state as historical evidence. Current CRM data is maintained in Asym; any future provider recovery requires a new audited integration workflow.";
export const CRM_DESIGNATION_RETRY_UNSUPPORTED_REASON =
  CRM_POSTING_UNAVAILABLE_REASON;
export const CRM_DESIGNATION_RETRY_UNSUPPORTED_NEXT_STEP =
  CRM_POSTING_UNAVAILABLE_NEXT_STEP;

export function isContributionCrmPostingSupported(): boolean {
  return false;
}

/**
 * No retry scope is executable while external CRM posting is retired. Keep
 * the parent distinction explicit so a future audited integration cannot
 * accidentally make designation retries available as a side effect.
 */
export function isContributionRouteCrmRetryScopeSupported(
  scope: ContributionCrmRetryScope,
): boolean {
  return scope === "parent" && isContributionCrmPostingSupported();
}
