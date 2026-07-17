import { buildContributionActionAvailability } from "../../contribution-operations/action-availability";
import { buildInlineContributionActions } from "../../contribution-operations/inline-actions";
import {
  buildSharedContributionRowFields,
  type BuildSharedContributionRowFieldsInput,
  type SharedContributionCorrectionInput,
  type SharedContributionDonationInput,
  type SharedContributionDonorInput,
} from "../../contribution-shared/row-contract";

import type { CorrectionApprovalPolicy } from "../../contribution-operations/approval-policy";
import type {
  ContributionDesignationSet,
  CrmGiftHistoryRow,
} from "@asym/database/types";

export interface BuildCrmGiftHistoryRowInput {
  donation: SharedContributionDonationInput & { status: string | null };
  donor: SharedContributionDonorInput | null;
  fund: { id: string; name: string | null } | null;
  missionary: { id: string; display_name: string | null } | null;
  stagedGift:
    | (BuildSharedContributionRowFieldsInput["stagedGift"] & {
        twenty_record_id?: string | null;
      })
    | null;
  corrections?: SharedContributionCorrectionInput[];
  designationSet?: ContributionDesignationSet;
  /** Provider linkage drives refund/replay availability (never exposed raw). */
  provider?: {
    stripePaymentIntentId: string | null;
    stripeChargeId: string | null;
  };
  /**
   * Refund availability basis (#265). The refundable basis is the ORIGINAL
   * donation amount (what the provider charged) — never the adjusted
   * effective amount — matching the contribution detail read model and the
   * refund adapter. Callers that feed effective-adjusted values into
   * `donation.amount` (like the CRM detail service) MUST provide this;
   * when omitted, the donation amount input is used as-is.
   */
  refundBasis?: {
    originalAmountCents: number;
  };
  /** Viewer capabilities filter which operations surface inline (#270). */
  viewerCapabilities?: string[];
  /**
   * Tenant correction approval policy loaded once by the CRM detail service.
   * When omitted, the builder falls back to the executor's conservative
   * default, which can overpromise request affordances for
   * no_approval_required tenants — always pass the loaded policy.
   */
  approvalPolicy?: CorrectionApprovalPolicy | null;
}

/**
 * Adapter that maps CRM gift-history data onto the shared contribution row
 * contract (ADR-CD-032). Overlapping CRM/Hub fields are copied from the shared
 * derivation; only CRM-only workflow context is computed here.
 */
export function buildCrmGiftHistoryRow(
  input: BuildCrmGiftHistoryRowInput,
): CrmGiftHistoryRow {
  const { donation, donor, fund, missionary, stagedGift } = input;

  const shared = buildSharedContributionRowFields({
    donation,
    donor,
    profile: null,
    fund,
    missionary,
    stagedGift: stagedGift
      ? {
          id: stagedGift.id,
          status: stagedGift.status,
          receipt_status: stagedGift.receipt_status,
          crm_post_status: stagedGift.crm_post_status,
        }
      : null,
    corrections: input.corrections,
    designationSet: input.designationSet,
  });

  // Inline operations reuse the exact availability derivation contribution
  // detail uses, so blocked reasons and risk levels stay identical (#270).
  const availability = buildContributionActionAvailability({
    stagedGift: stagedGift
      ? {
          id: stagedGift.id,
          status: stagedGift.status,
          receiptStatus: stagedGift.receipt_status,
          crmPostStatus: stagedGift.crm_post_status,
        }
      : null,
    paymentStatus: donation.status,
    refund: {
      // Original charged amount, not the effective (adjusted) amount, so the
      // CRM inline refund entry agrees with contribution detail and the
      // refund adapter after amount corrections (#265).
      amountCents: input.refundBasis?.originalAmountCents ?? shared.amountCents,
      refundedAmountCents: shared.refundedAmountCents,
      // Detail parity (#270): the detail read model treats either provider id
      // as refundable payment proof, so the CRM adapter must match or a
      // payment-intent-only gift shows different refund availability inline.
      hasProviderCharge: Boolean(
        input.provider?.stripeChargeId || input.provider?.stripePaymentIntentId,
      ),
    },
  });
  const inlineActions = buildInlineContributionActions({
    availability,
    providerPaymentIntentId: input.provider?.stripePaymentIntentId ?? null,
    providerChargeId: input.provider?.stripeChargeId ?? null,
    approvalPolicy: input.approvalPolicy,
    viewerCapabilities: input.viewerCapabilities ?? [],
  });

  return {
    shared,
    id: shared.donationId,
    donationId: shared.donationId,
    amountCents: shared.amountCents,
    currencyCode: shared.currencyCode,
    giftDate: shared.giftDate,
    paymentStatus: shared.paymentStatus,
    receiptStatus: shared.receiptStatus,
    crmPostStatus: shared.crmPostStatus,
    refundState: shared.refundState,
    correctionState: shared.correctionState,
    fundId: shared.designationSummary.fundId,
    fundName: shared.designationSummary.fundName,
    missionaryId: shared.designationSummary.missionaryId,
    missionaryName: shared.designationSummary.missionaryName,
    stagedGiftId: stagedGift?.id ?? null,
    twentyRecordId: stagedGift?.twenty_record_id ?? null,
    inlineActions,
  };
}
