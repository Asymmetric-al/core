import type { MergeTagCategory } from "./merge-tags";

export type ContributionCorrectionTemplateFamily =
  | "refund_notification"
  | "amount_correction_notification"
  | "designation_correction_notification"
  | "receipt_correction_notification"
  | "statement_correction_notification"
  | "payment_state_correction_notification"
  | "donor_relinking_notification";

export type ContributionCorrectionTemplateVariant =
  | "refund_started"
  | "refund_completed"
  | "refund_failed"
  | "partial_refund_completed"
  | "full_refund_completed"
  | "amount_corrected"
  | "designation_changed"
  | "receipt_corrected"
  | "statement_corrected"
  | "payment_state_corrected"
  | "donor_relinked";

export const CONTRIBUTION_CORRECTION_MERGE_TAG_CATEGORY: MergeTagCategory = {
  label: "Contribution Correction",
  tags: [
    {
      key: "gift_date",
      label: "Gift Date",
      category: "contribution_correction",
      type: "date",
      sample: "May 1, 2026",
    },
    {
      key: "correction_reason",
      label: "Correction Reason",
      category: "contribution_correction",
      type: "string",
      sample: "Duplicate transaction corrected by finance.",
    },
    {
      key: "original_amount",
      label: "Original Amount",
      category: "contribution_correction",
      type: "currency",
      sample: "$100.00",
    },
    {
      key: "corrected_amount",
      label: "Corrected Amount",
      category: "contribution_correction",
      type: "currency",
      sample: "$75.00",
    },
    {
      key: "refund_amount",
      label: "Refund Amount",
      category: "contribution_correction",
      type: "currency",
      sample: "$25.00",
    },
    {
      key: "previous_designation_name",
      label: "Previous Designation",
      category: "contribution_correction",
      type: "string",
      sample: "General Fund",
    },
    {
      key: "corrected_designation_name",
      label: "Corrected Designation",
      category: "contribution_correction",
      type: "string",
      sample: "Clean Water Initiative",
    },
    {
      key: "receipt_link",
      label: "Receipt Link",
      category: "contribution_correction",
      type: "url",
      sample: "https://givehope.org/donor-dashboard/history",
    },
    {
      key: "statement_link",
      label: "Statement Link",
      category: "contribution_correction",
      type: "url",
      sample: "https://givehope.org/donor-dashboard/history",
    },
    {
      key: "payment_state",
      label: "Payment State",
      category: "contribution_correction",
      type: "string",
      sample: "Refunded",
    },
    {
      key: "donor_portal_link",
      label: "Donor Portal Link",
      category: "contribution_correction",
      type: "url",
      sample: "https://givehope.org/donor-dashboard/history",
    },
    {
      key: "support_contact_link",
      label: "Support Contact Link",
      category: "contribution_correction",
      type: "url",
      sample: "mailto:finance@givehope.org",
    },
    {
      key: "operation_reference",
      label: "Operation Reference",
      category: "contribution_correction",
      type: "string",
      sample: "CO-2026-0001",
    },
    {
      key: "personal_note",
      label: "Personal Note",
      category: "contribution_correction",
      type: "string",
      sample: "Thank you for your patience while we corrected this.",
    },
  ],
};

export const CONTRIBUTION_CORRECTION_TEMPLATE_FAMILIES = {
  refund_notification: {
    variants: {
      refund_started: {
        requiredTags: [
          "full_name",
          "gift_date",
          "donation_amount",
          "refund_amount",
          "donor_portal_link",
        ],
      },
      refund_completed: {
        requiredTags: [
          "full_name",
          "gift_date",
          "donation_amount",
          "refund_amount",
          "donor_portal_link",
        ],
      },
      refund_failed: {
        requiredTags: [
          "full_name",
          "gift_date",
          "donation_amount",
          "refund_amount",
          "support_contact_link",
        ],
      },
      partial_refund_completed: {
        requiredTags: [
          "full_name",
          "gift_date",
          "donation_amount",
          "refund_amount",
          "donor_portal_link",
        ],
      },
      full_refund_completed: {
        requiredTags: [
          "full_name",
          "gift_date",
          "donation_amount",
          "refund_amount",
          "donor_portal_link",
        ],
      },
    },
  },
  amount_correction_notification: {
    variants: {
      amount_corrected: {
        requiredTags: [
          "full_name",
          "gift_date",
          "original_amount",
          "corrected_amount",
          "donor_portal_link",
        ],
      },
    },
  },
  designation_correction_notification: {
    variants: {
      designation_changed: {
        requiredTags: [
          "full_name",
          "gift_date",
          "previous_designation_name",
          "corrected_designation_name",
          "donor_portal_link",
        ],
      },
    },
  },
  receipt_correction_notification: {
    variants: {
      receipt_corrected: {
        requiredTags: ["full_name", "gift_date", "receipt_link"],
      },
    },
  },
  statement_correction_notification: {
    variants: {
      statement_corrected: {
        requiredTags: ["full_name", "statement_link"],
      },
    },
  },
  payment_state_correction_notification: {
    variants: {
      payment_state_corrected: {
        requiredTags: [
          "full_name",
          "gift_date",
          "payment_state",
          "donor_portal_link",
        ],
      },
    },
  },
  donor_relinking_notification: {
    variants: {
      donor_relinked: {
        requiredTags: [
          "full_name",
          "gift_date",
          "operation_reference",
          "support_contact_link",
        ],
      },
    },
  },
} as const;

export function getContributionCorrectionRequiredTags(input: {
  family: ContributionCorrectionTemplateFamily;
  variant: ContributionCorrectionTemplateVariant;
}): string[] {
  const family = CONTRIBUTION_CORRECTION_TEMPLATE_FAMILIES[input.family];
  const variant = (
    family.variants as Record<string, { requiredTags: readonly string[] }>
  )[input.variant];

  return [...(variant?.requiredTags ?? [])];
}
