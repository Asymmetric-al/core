import type { ContributionActionType } from "../types";
import type {
  ContributionCorrectionTemplateFamily,
  ContributionCorrectionTemplateVariant,
} from "@asym/email/contribution-correction-tags";

export {
  isContributionCorrectionTemplateFamily,
  isContributionCorrectionTemplateVariantForFamily,
  validateContributionCorrectionTemplate,
} from "../../../email/contribution-correction-template-validation";

export interface ContributionCorrectionTemplateVariantRef {
  family: ContributionCorrectionTemplateFamily;
  variant: ContributionCorrectionTemplateVariant;
}

export function resolveContributionCorrectionTemplateVariant(input: {
  actionType: ContributionActionType;
  outcome?: {
    status?: string | null;
    refundKind?: "partial" | "full" | null;
  };
}): ContributionCorrectionTemplateVariantRef | null {
  if (input.actionType === "refund") {
    if (input.outcome?.status === "failed") {
      return { family: "refund_notification", variant: "refund_failed" };
    }
    if (input.outcome?.refundKind === "partial") {
      return {
        family: "refund_notification",
        variant: "partial_refund_completed",
      };
    }
    if (input.outcome?.refundKind === "full") {
      return {
        family: "refund_notification",
        variant: "full_refund_completed",
      };
    }
    return { family: "refund_notification", variant: "refund_completed" };
  }

  switch (input.actionType) {
    case "amount_correction":
      return {
        family: "amount_correction_notification",
        variant: "amount_corrected",
      };
    case "designation_correction":
    case "fund_correction":
    case "allocation_correction":
      return {
        family: "designation_correction_notification",
        variant: "designation_changed",
      };
    case "receipt_correction":
      return {
        family: "receipt_correction_notification",
        variant: "receipt_corrected",
      };
    case "statement_correction":
      return {
        family: "statement_correction_notification",
        variant: "statement_corrected",
      };
    case "payment_state_correction":
      return {
        family: "payment_state_correction_notification",
        variant: "payment_state_corrected",
      };
    case "donor_relink":
      return {
        family: "donor_relinking_notification",
        variant: "donor_relinked",
      };
    default:
      return null;
  }
}
