import { loadContributionDetailFromSupabase } from "./operations";
import { isFailedProviderOutcomeStatus } from "./types";
import { ApiHttpError } from "../../shared/http-errors";

import type {
  ContributionCorrectionRecordInput,
  ContributionOperationAuditEventInput,
  ContributionProviderOutcome,
} from "./types";
import type { AdminSupabaseClient } from "@asym/database/supabase/admin";

type SupabaseAdmin = AdminSupabaseClient;
type JsonRecord = Record<string, unknown>;

const CONTRIBUTION_REFUND_ATTEMPTS_TABLE = "contribution_refund_attempts";
const REFUND_ATTEMPT_CONFLICT_MESSAGE =
  "This idempotency key is already assigned to another refund request.";
const REDACTED_PROVIDER_ERROR_MESSAGE =
  "Provider action failed. Check provider logs for details.";
const PLATFORM_GENERATED_ERROR_CODES: ReadonlySet<string> = new Set([
  "local_update_failed",
  "refund_exceeds_provider_remaining",
]);

interface ContributionRefundAttemptRow {
  id: string;
  tenant_id: string;
  donation_id: string;
  idempotency_key: string;
  requested_amount: number;
  state: "claimed" | "finalized";
  provider_outcome: unknown;
  provider_reference_id: string | null;
  claimed_at: string;
  finalized_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ContributionRefundAttempt {
  id: string;
  tenantId: string;
  donationId: string;
  idempotencyKey: string;
  requestedAmount: number;
  state: "claimed" | "finalized";
  providerOutcome: ContributionProviderOutcome | null;
  providerReferenceId: string | null;
  claimedAt: string;
  finalizedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function asString(value: unknown): string | null {
  return typeof value === "string" && value.trim().length > 0 ? value : null;
}

function asNullableString(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}

function hasOwn(value: object, key: string): boolean {
  return Object.prototype.hasOwnProperty.call(value, key);
}

function mapStoredProviderOutcome(
  value: unknown,
): ContributionProviderOutcome | null {
  if (!isRecord(value)) {
    return null;
  }

  const provider = asString(value.provider);
  const status = asString(value.status);
  if (
    !provider ||
    !status ||
    !["stripe", "resend", "twenty", "platform"].includes(provider)
  ) {
    return null;
  }

  const outcome: ContributionProviderOutcome = {
    provider: provider as ContributionProviderOutcome["provider"],
    status,
  };
  if (hasOwn(value, "referenceId")) {
    outcome.referenceId = asNullableString(value.referenceId);
  }
  if (hasOwn(value, "errorCode")) {
    outcome.errorCode = asNullableString(value.errorCode);
  }
  if (hasOwn(value, "errorMessage")) {
    outcome.errorMessage = asNullableString(value.errorMessage);
  }
  return outcome;
}

function sanitizeProviderOutcome(
  outcome: ContributionProviderOutcome,
): ContributionProviderOutcome {
  const sanitized: ContributionProviderOutcome = {
    provider: outcome.provider,
    status: outcome.status,
  };
  if (hasOwn(outcome, "referenceId")) {
    sanitized.referenceId = outcome.referenceId ?? null;
  }
  if (hasOwn(outcome, "errorCode")) {
    sanitized.errorCode = outcome.errorCode ?? null;
  }
  if (hasOwn(outcome, "errorMessage")) {
    const isFailedOutcome = isFailedProviderOutcomeStatus(outcome.status);
    const hasPlatformGeneratedMessage =
      outcome.status === "local_update_failed" ||
      (outcome.errorCode != null &&
        PLATFORM_GENERATED_ERROR_CODES.has(outcome.errorCode));

    if (outcome.errorMessage && isFailedOutcome) {
      sanitized.errorMessage = hasPlatformGeneratedMessage
        ? outcome.errorMessage
        : REDACTED_PROVIDER_ERROR_MESSAGE;
    } else {
      sanitized.errorMessage = null;
    }
  }
  return sanitized;
}

function mapContributionRefundAttempt(
  row: ContributionRefundAttemptRow,
): ContributionRefundAttempt {
  return {
    id: row.id,
    tenantId: row.tenant_id,
    donationId: row.donation_id,
    idempotencyKey: row.idempotency_key,
    requestedAmount: row.requested_amount,
    state: row.state,
    providerOutcome: mapStoredProviderOutcome(row.provider_outcome),
    providerReferenceId: row.provider_reference_id,
    claimedAt: row.claimed_at,
    finalizedAt: row.finalized_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function assertRefundAttemptMatches(
  attempt: ContributionRefundAttempt,
  input: { donationId: string; requestedAmount: number },
): void {
  if (
    attempt.donationId !== input.donationId ||
    attempt.requestedAmount !== input.requestedAmount
  ) {
    throw new ApiHttpError(409, REFUND_ATTEMPT_CONFLICT_MESSAGE);
  }
}

export { loadContributionDetailFromSupabase };

export async function loadContributionRefundAttempt(input: {
  supabaseAdmin: SupabaseAdmin;
  tenantId: string;
  idempotencyKey: string;
  donationId: string;
  requestedAmount: number;
}): Promise<ContributionRefundAttempt | null> {
  const { data, error } = await input.supabaseAdmin
    .from(CONTRIBUTION_REFUND_ATTEMPTS_TABLE)
    .select("*")
    .eq("tenant_id", input.tenantId)
    .eq("idempotency_key", input.idempotencyKey)
    .maybeSingle();

  if (error) {
    throw new Error(
      `contribution_refund_attempt_load_failed: ${error.message}`,
    );
  }
  if (!data) {
    return null;
  }

  const attempt = mapContributionRefundAttempt(
    data as ContributionRefundAttemptRow,
  );
  assertRefundAttemptMatches(attempt, input);
  return attempt;
}

export async function claimContributionRefundAttempt(input: {
  supabaseAdmin: SupabaseAdmin;
  tenantId: string;
  donationId: string;
  requestedAmount: number;
  idempotencyKey: string;
}): Promise<{ attempt: ContributionRefundAttempt; reused: boolean }> {
  const inserted = await input.supabaseAdmin
    .from(CONTRIBUTION_REFUND_ATTEMPTS_TABLE)
    .upsert(
      {
        tenant_id: input.tenantId,
        donation_id: input.donationId,
        requested_amount: input.requestedAmount,
        idempotency_key: input.idempotencyKey,
        state: "claimed",
      },
      {
        onConflict: "tenant_id,idempotency_key",
        ignoreDuplicates: true,
      },
    )
    .select("*")
    .maybeSingle();

  if (inserted.error) {
    throw new Error(
      `contribution_refund_attempt_claim_failed: ${inserted.error.message}`,
    );
  }
  if (inserted.data) {
    return {
      attempt: mapContributionRefundAttempt(
        inserted.data as ContributionRefundAttemptRow,
      ),
      reused: false,
    };
  }

  const existing = await loadContributionRefundAttempt(input);
  if (!existing) {
    throw new Error(
      "contribution_refund_attempt_claim_failed: conflicting row was not found",
    );
  }

  return { attempt: existing, reused: true };
}

export async function finalizeContributionRefundAttempt(input: {
  supabaseAdmin: SupabaseAdmin;
  attempt: ContributionRefundAttempt;
  providerOutcome: ContributionProviderOutcome;
}): Promise<ContributionRefundAttempt> {
  const timestamp = new Date().toISOString();
  const providerOutcome = sanitizeProviderOutcome(input.providerOutcome);
  const { data, error } = await input.supabaseAdmin
    .from(CONTRIBUTION_REFUND_ATTEMPTS_TABLE)
    .update({
      state: "finalized",
      provider_outcome: providerOutcome,
      provider_reference_id: providerOutcome.referenceId ?? null,
      finalized_at: timestamp,
      updated_at: timestamp,
    })
    .eq("tenant_id", input.attempt.tenantId)
    .eq("idempotency_key", input.attempt.idempotencyKey)
    .select("*")
    .single();

  if (error || !data) {
    throw new Error(
      `contribution_refund_attempt_finalize_failed: ${error?.message ?? "missing row"}`,
    );
  }

  return mapContributionRefundAttempt(data as ContributionRefundAttemptRow);
}

export async function appendContributionOperationAuditEvent(input: {
  supabaseAdmin: SupabaseAdmin;
  event: ContributionOperationAuditEventInput;
}): Promise<string> {
  const { data, error } = await input.supabaseAdmin
    .from("contribution_operation_audit_events")
    .insert({
      tenant_id: input.event.tenantId,
      actor_profile_id: input.event.actorProfileId,
      donation_id: input.event.contributionId,
      staged_gift_id: input.event.stagedGiftId ?? null,
      donor_id: input.event.donorId ?? null,
      correction_id: input.event.correctionId ?? null,
      operation: input.event.actionType,
      resource_type: "donation",
      resource_id: input.event.contributionId,
      source_surface: input.event.sourceSurface,
      reason: input.event.reason ?? null,
      before_snapshot: input.event.beforeSummary ?? {},
      after_snapshot: input.event.afterSummary ?? {},
      provider_outcome: input.event.providerOutcome ?? {},
      downstream_effects: input.event.downstreamEffects ?? {},
    })
    .select("id")
    .single();

  if (error || !isRecord(data)) {
    throw new Error(
      error?.message ?? "Failed to write contribution audit event.",
    );
  }

  return asString(data.id) ?? "";
}

export async function createContributionCorrectionRecord(input: {
  supabaseAdmin: SupabaseAdmin;
  correction: ContributionCorrectionRecordInput;
}): Promise<string> {
  const correctionStatus = input.correction.status ?? "applied";
  const { data, error } = await input.supabaseAdmin
    .from("contribution_corrections")
    .insert({
      tenant_id: input.correction.tenantId,
      donation_id: input.correction.contributionId,
      staged_gift_id: input.correction.stagedGiftId ?? null,
      correction_type: input.correction.correctionType,
      status: correctionStatus,
      reason: input.correction.reason,
      source_surface: input.correction.sourceSurface,
      actor_profile_id: input.correction.actorProfileId,
      before_summary: input.correction.beforeSummary ?? {},
      after_summary: input.correction.afterSummary ?? {},
      provider_outcome: input.correction.providerOutcome ?? {},
      // Only applied corrections carry an applied timestamp; pending and
      // failed records must not imply the change took effect (#265).
      applied_at:
        correctionStatus === "applied" ? new Date().toISOString() : null,
    })
    .select("id")
    .single();

  if (error || !isRecord(data)) {
    throw new Error(
      error?.message ?? "Failed to write contribution correction.",
    );
  }

  return asString(data.id) ?? "";
}
