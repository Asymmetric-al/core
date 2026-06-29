import type { ContributionActionType } from "../types";

export type ContributionNotificationMode =
  | "auto_notify"
  | "always_ask"
  | "staff_chooses";

export type ContributionNotificationDecision =
  | "sent"
  | "suppressed"
  | "blocked"
  | "failed"
  | "not_required";

const DEFAULT_MODE_BY_ACTION: Partial<
  Record<ContributionActionType, ContributionNotificationMode>
> = {
  refund: "auto_notify",
  amount_correction: "auto_notify",
  receipt_correction: "auto_notify",
  statement_correction: "auto_notify",
  designation_correction: "always_ask",
  fund_correction: "always_ask",
  allocation_correction: "always_ask",
  payment_state_correction: "always_ask",
  donor_relink: "staff_chooses",
};

const SUPPRESSION_REASON_REQUIRED_ACTIONS = new Set<ContributionActionType>([
  "refund",
  "amount_correction",
  "receipt_correction",
  "statement_correction",
  "payment_state_correction",
]);

export function getContributionNotificationPolicy(input: {
  actionType: ContributionActionType;
  tenantModeOverride?: ContributionNotificationMode | null;
  suppressionReasonRequiredOverride?: boolean | null;
}) {
  const defaultSuppressionReasonRequired =
    SUPPRESSION_REASON_REQUIRED_ACTIONS.has(input.actionType);

  return {
    actionType: input.actionType,
    mode:
      input.tenantModeOverride ??
      DEFAULT_MODE_BY_ACTION[input.actionType] ??
      "staff_chooses",
    suppressionReasonRequired:
      input.suppressionReasonRequiredOverride ??
      defaultSuppressionReasonRequired,
  };
}

export function isContributionNotificationSuppressionReasonRequired(input: {
  actionType: ContributionActionType;
  decision: ContributionNotificationDecision;
  suppressionReasonRequiredOverride?: boolean | null;
}) {
  return (
    input.decision === "suppressed" &&
    getContributionNotificationPolicy({
      actionType: input.actionType,
      suppressionReasonRequiredOverride:
        input.suppressionReasonRequiredOverride,
    }).suppressionReasonRequired
  );
}
