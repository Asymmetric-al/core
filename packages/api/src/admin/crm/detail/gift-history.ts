import {
  buildSharedContributionRowFields,
  type BuildSharedContributionRowFieldsInput,
  type SharedContributionCorrectionInput,
  type SharedContributionDonationInput,
  type SharedContributionDonorInput,
} from "../../contribution-shared/row-contract";

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

  const canResendReceipt =
    Boolean(stagedGift?.id) &&
    donation.status === "completed" &&
    stagedGift?.receipt_status !== "suppressed";

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
    canResendReceipt,
  };
}
