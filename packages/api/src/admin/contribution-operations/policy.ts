import type {
  ContributionActionPolicy,
  ContributionActionType,
  ContributionOperationOrganizationSettings,
  ContributionOperationUserPreferences,
  ContributionRiskLevel,
} from "./types";

const HIGH_RISK_ACTIONS = new Set<ContributionActionType>([
  "refund",
  "donor_relink",
  "designation_correction",
  "fund_correction",
  "payment_state_correction",
  "stripe_replay",
]);

const MEDIUM_RISK_ACTIONS = new Set<ContributionActionType>([
  "amount_correction",
  "allocation_correction",
  "receipt_correction",
  "statement_correction",
  "crm_repost",
]);

export function getContributionActionRiskLevel(
  actionType: ContributionActionType,
): ContributionRiskLevel {
  if (HIGH_RISK_ACTIONS.has(actionType)) {
    return "high";
  }

  if (MEDIUM_RISK_ACTIONS.has(actionType)) {
    return "medium";
  }

  return "low";
}

export function isHighRiskContributionAction(
  actionType: ContributionActionType,
): boolean {
  return getContributionActionRiskLevel(actionType) === "high";
}

function shouldRequireReasonFromSettings(input: {
  riskLevel: ContributionRiskLevel;
  organizationSettings?: ContributionOperationOrganizationSettings;
  userPreferences?: ContributionOperationUserPreferences;
}) {
  const { riskLevel, organizationSettings, userPreferences } = input;
  if (riskLevel === "high") {
    return true;
  }

  if (organizationSettings?.defaultReasonMode !== "required") {
    return false;
  }

  if (!organizationSettings.allowUserReasonPromptReduction) {
    return true;
  }

  return userPreferences?.reduceReasonPrompts !== true;
}

export function getContributionActionPolicy(input: {
  actionType: ContributionActionType;
  organizationSettings?: ContributionOperationOrganizationSettings;
  userPreferences?: ContributionOperationUserPreferences;
}): ContributionActionPolicy {
  const riskLevel = getContributionActionRiskLevel(input.actionType);
  const nonSuppressibleReason = riskLevel === "high";
  const requiresReason = shouldRequireReasonFromSettings({
    riskLevel,
    organizationSettings: input.organizationSettings,
    userPreferences: input.userPreferences,
  });

  return {
    actionType: input.actionType,
    riskLevel,
    requiresReason,
    requiresConfirmation: riskLevel === "high",
    canSuppressReason: !nonSuppressibleReason,
    requiredPermission:
      riskLevel === "high" ? "finance:manage_contributions" : null,
    nonSuppressibleReason,
  };
}

export function isContributionReasonRequired(
  policy: Pick<ContributionActionPolicy, "requiresReason">,
) {
  return policy.requiresReason;
}

export function isContributionConfirmationRequired(
  policy: Pick<ContributionActionPolicy, "requiresConfirmation">,
) {
  return policy.requiresConfirmation;
}
