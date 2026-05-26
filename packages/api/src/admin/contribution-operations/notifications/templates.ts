import {
  CONTRIBUTION_CORRECTION_TEMPLATE_FAMILIES,
  getContributionCorrectionRequiredTags,
  type ContributionCorrectionTemplateFamily,
  type ContributionCorrectionTemplateVariant,
} from "@asym/email/contribution-correction-tags";
import {
  parseMergeTags,
  validateMergeTags,
} from "@asym/email/merge-tag-render";

import type { ContributionActionType } from "../types";

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
}): ContributionCorrectionTemplateVariantRef {
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
      return { family: "refund_notification", variant: "refund_started" };
  }
}

export function validateContributionCorrectionTemplate(input: {
  family: ContributionCorrectionTemplateFamily;
  variant: ContributionCorrectionTemplateVariant;
  html: string;
  text: string;
  active: boolean;
}) {
  const requiredTags = getContributionCorrectionRequiredTags(input);
  const usedTags = parseMergeTags(`${input.html}\n${input.text}`);
  const mergeTagValidation = validateMergeTags(`${input.html}\n${input.text}`, {
    messageType: "transactional",
  });
  const missingRequiredTags = requiredTags.filter(
    (tag) => !usedTags.includes(tag),
  );
  const errors = [
    ...mergeTagValidation.errors,
    ...(input.active
      ? missingRequiredTags.map((tag) => `Missing required merge tag: ${tag}`)
      : []),
  ];

  return {
    valid: errors.length === 0,
    errors,
    missingRequiredTags,
    requiredTags,
    usedTags,
  };
}

export function isContributionCorrectionTemplateFamily(
  value: string,
): value is ContributionCorrectionTemplateFamily {
  return value in CONTRIBUTION_CORRECTION_TEMPLATE_FAMILIES;
}
