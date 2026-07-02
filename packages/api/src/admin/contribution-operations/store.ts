import { loadContributionDetailFromSupabase } from "./operations";

import type {
  ContributionCorrectionRecordInput,
  ContributionOperationAuditEventInput,
} from "./types";
import type { AdminSupabaseClient } from "@asym/database/supabase/admin";

type SupabaseAdmin = AdminSupabaseClient;
type JsonRecord = Record<string, unknown>;

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function asString(value: unknown): string | null {
  return typeof value === "string" && value.trim().length > 0 ? value : null;
}

export { loadContributionDetailFromSupabase };

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
