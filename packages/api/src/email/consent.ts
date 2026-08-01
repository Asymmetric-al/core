/**
 * Outbound email consent gate.
 *
 * Resend does NOT manage suppression for transactional email, so the
 * application must enforce its own consent list before every outbound send.
 * This module is the single, reusable, fail-closed check the send paths in
 * `packages/api` consult before calling Resend.
 *
 * ## Enforcement model (non-profit email compliance)
 *
 * Enforcement depends on the message type, matching CAN-SPAM's "transactional
 * or relationship" carve-out and the schema's own transactional/marketing +
 * `bypassListManagement` design:
 *
 * | Signal                                   | Blocks marketing | Blocks transactional |
 * | ---------------------------------------- | :--------------: | :------------------: |
 * | donor `do_not_contact` (all channels)    |        ✔         |          ✔           |
 * | suppression `bounce` (dead address)      |        ✔         |          ✔           |
 * | suppression `spam` (complaint)           |        ✔         |          ✔           |
 * | suppression `manual` (admin/provider)    |        ✔         |          ✔           |
 * | donor `do_not_email` (email opt-out)     |        ✔         |          ✘           |
 * | suppression `unsubscribe` (list opt-out) |        ✔         |          ✘           |
 *
 * A donation receipt or a correction notice is transactional: the donor opting
 * out of *marketing* (`do_not_email` / `unsubscribe`) does not stop it, but a
 * global `do_not_contact`, a hard bounce, or a spam complaint always does — the
 * last two also protect sender reputation and honor the ESP's terms.
 *
 * ## Fail-closed posture
 *
 * If consent cannot be determined because a lookup fails, this function THROWS
 * rather than returning `allowed`. Callers must not send when they cannot
 * verify consent; a thrown error keeps the send retryable instead of
 * permanently marking a recipient as suppressed. An unrecognized message type
 * is treated as marketing (the stricter policy).
 */

import { asString, isRecord } from "../shared/json-coerce";

import type { getAdminClient } from "@asym/database/supabase/admin";
import type { EmailMessageType, SuppressionType } from "@asym/email/types";

type SupabaseAdminClient = NonNullable<
  ReturnType<typeof getAdminClient>["client"]
>;

/** Why an outbound email was blocked. */
export type EmailConsentBlockReason =
  | "do_not_contact"
  | "do_not_email"
  | "suppressed";

export type EmailConsentDecision =
  | { allowed: true }
  | {
      allowed: false;
      reason: EmailConsentBlockReason;
      /** Present when `reason === "suppressed"`; e.g. "bounce" | "spam". */
      suppressionType?: string | null;
    };

export interface EvaluateEmailConsentInput {
  supabaseAdmin: SupabaseAdminClient;
  tenantId: string;
  /** Recipient address for the send. */
  email: string;
  /** Donor id when known; lets us read consent flags without an email lookup. */
  donorId?: string | null;
  /**
   * Transactional messages (receipts, correction notices) bypass marketing
   * opt-outs; marketing messages honor every opt-out. Required so each call
   * site classifies its content explicitly.
   */
  messageType: EmailMessageType;
}

/**
 * Suppression types that block ALL mail (deliverability failure, spam
 * complaint, or an explicit admin/provider block). Everything not listed here
 * (i.e. `unsubscribe`) is a marketing-list opt-out that transactional mail may
 * bypass.
 */
const HARD_SUPPRESSION_TYPES: ReadonlySet<SuppressionType> = new Set([
  "bounce",
  "spam",
  "manual",
]);

interface DonorConsentFlags {
  doNotEmail: boolean;
  doNotContact: boolean;
}

function asBooleanFlag(value: unknown): boolean {
  return value === true;
}

function isHardSuppressionType(type: string): boolean {
  return HARD_SUPPRESSION_TYPES.has(type as SuppressionType);
}

/**
 * Escape SQL `LIKE` metacharacters so an address is matched literally by the
 * case-insensitive `ilike` filter (email local parts may contain `_`).
 */
function escapeLikePattern(value: string): string {
  return value.replace(/[\\%_]/g, (character) => `\\${character}`);
}

async function loadDonorConsentFlags(
  input: EvaluateEmailConsentInput,
  normalizedEmail: string,
): Promise<DonorConsentFlags | null> {
  const baseQuery = input.supabaseAdmin
    .from("donors")
    .select("do_not_email, do_not_contact");

  const filteredQuery = input.donorId
    ? baseQuery.eq("id", input.donorId).eq("tenant_id", input.tenantId)
    : baseQuery
        .eq("tenant_id", input.tenantId)
        .ilike("email", escapeLikePattern(normalizedEmail));

  const { data, error } = await filteredQuery.limit(1).maybeSingle();

  if (error) {
    throw new Error(`Failed to load donor consent flags: ${error.message}`);
  }

  if (!isRecord(data)) {
    return null;
  }

  return {
    doNotEmail: asBooleanFlag(data.do_not_email),
    doNotContact: asBooleanFlag(data.do_not_contact),
  };
}

/**
 * Load every suppression type recorded for this address. All rows are needed
 * (not just one) because an address can carry both a marketing `unsubscribe`
 * and a hard `bounce` — a transactional send must still be blocked by the
 * bounce. The unique index on `(tenant_id, email, suppression_type)` bounds
 * this to at most four rows.
 */
async function loadSuppressionTypes(input: {
  supabaseAdmin: SupabaseAdminClient;
  tenantId: string;
  normalizedEmail: string;
}): Promise<string[]> {
  const { data, error } = await input.supabaseAdmin
    .from("email_suppressions")
    .select("suppression_type")
    .eq("tenant_id", input.tenantId)
    .ilike("email", escapeLikePattern(input.normalizedEmail))
    .limit(10);

  if (error) {
    throw new Error(`Failed to load email suppression: ${error.message}`);
  }

  if (!Array.isArray(data)) {
    return [];
  }

  return data
    .map((row) => (isRecord(row) ? asString(row.suppression_type) : null))
    .filter((type): type is string => Boolean(type));
}

/**
 * Evaluate whether an outbound email may be sent to `email`.
 *
 * Reads only — never mutates. Throws if consent cannot be determined so the
 * caller fails closed (does not send) while keeping the send retryable.
 */
export async function evaluateEmailConsent(
  input: EvaluateEmailConsentInput,
): Promise<EmailConsentDecision> {
  const normalizedEmail = input.email.trim();
  if (!normalizedEmail) {
    throw new Error(
      "Cannot evaluate email consent without a recipient address.",
    );
  }

  // Unknown/unspecified message types are treated as marketing (stricter).
  const isMarketing = input.messageType !== "transactional";

  const [donorConsent, suppressionTypes] = await Promise.all([
    loadDonorConsentFlags(input, normalizedEmail),
    loadSuppressionTypes({
      supabaseAdmin: input.supabaseAdmin,
      tenantId: input.tenantId,
      normalizedEmail,
    }),
  ]);

  // 1. Global opt-out: the donor asked for no contact on any channel.
  if (donorConsent?.doNotContact) {
    return { allowed: false, reason: "do_not_contact" };
  }

  // 2. Hard suppression (dead address, complaint, explicit block): never send,
  //    transactional included — protects deliverability and sender reputation.
  const hardSuppression = suppressionTypes.find(isHardSuppressionType);
  if (hardSuppression) {
    return {
      allowed: false,
      reason: "suppressed",
      suppressionType: hardSuppression,
    };
  }

  // 3. Marketing-only opt-outs. Transactional mail bypasses these.
  if (isMarketing) {
    if (donorConsent?.doNotEmail) {
      return { allowed: false, reason: "do_not_email" };
    }

    const [firstSuppression] = suppressionTypes;
    if (firstSuppression) {
      return {
        allowed: false,
        reason: "suppressed",
        suppressionType: firstSuppression,
      };
    }
  }

  return { allowed: true };
}
