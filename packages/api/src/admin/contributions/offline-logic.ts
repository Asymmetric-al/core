/**
 * Pure server-side logic for offline gift entry (Contributions Hub).
 * Source: DONOR_ANONYMITY_GUEST_GIVING_SPEC §6, §8.1, §11.3.
 *
 * No I/O — fully unit-testable without a live DB. The handler injects tenant,
 * resolves/creates the donor, then persists the row this module assembles and
 * writes the shared contribution audit event.
 */

import type { OfflineContributionRequest } from "../../schemas/contributions-offline";

export type ReceiptStatus =
  | "pending"
  | "no_receipt_requested"
  | "not_receiptable";

/**
 * Receipt eligibility (§11.2/§11.3):
 *  - unknown_offline gifts are NOT receiptable (no donor identity).
 *  - known gifts are pending if a receipt was requested, else no_receipt_requested.
 */
export function resolveOfflineReceiptStatus(
  input:
    | { donorMode: "unknown_offline" }
    | { donorMode: "known"; receiptRequested: boolean },
): ReceiptStatus {
  if (input.donorMode === "unknown_offline") return "not_receiptable";
  return input.receiptRequested ? "pending" : "no_receipt_requested";
}

/** Row assembled for insertion into `donations`. donor_id + entered_by_user_id
 *  are filled by the server (donor resolution + actor), never by the client. */
export interface OfflineContributionRow {
  donor_identity_status: "known" | "unknown_offline";
  amount_cents: number;
  currency: string;
  received_date: string;
  method: string;
  missionary_id: string | null;
  fund_id: string | null;
  anonymous_to_recipient: boolean;
  anonymous_to_public: boolean;
  receipt_status: ReceiptStatus;
  batch_id: string | null;
  reference_number: string | null;
  internal_note: string | null;
}

export function buildOfflineContributionRow(
  input: OfflineContributionRequest,
): OfflineContributionRow {
  const base = {
    amount_cents: Math.round(input.amount * 100),
    currency: input.currency,
    received_date: input.receivedDate,
    method: input.method,
    missionary_id: input.designation.missionaryId ?? null,
    fund_id: input.designation.fundId ?? null,
    batch_id: input.batchId ?? null,
    reference_number: input.referenceNumber ?? null,
    internal_note: input.internalNote ?? null,
  };

  if (input.donorMode === "unknown_offline") {
    // §6.2: donor_id stays null (set by handler); missionary/public redaction is
    // driven by donor_identity_status, so anonymity flags default false here.
    return {
      ...base,
      donor_identity_status: "unknown_offline",
      anonymous_to_recipient: false,
      anonymous_to_public: false,
      receipt_status: resolveOfflineReceiptStatus({
        donorMode: "unknown_offline",
      }),
    };
  }

  return {
    ...base,
    donor_identity_status: "known",
    anonymous_to_recipient: input.anonymousToRecipient,
    anonymous_to_public: input.anonymousToPublic ?? false,
    receipt_status: resolveOfflineReceiptStatus({
      donorMode: "known",
      receiptRequested: input.receiptRequested,
    }),
  };
}
