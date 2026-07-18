import { z } from "zod";

import {
  eveSharedContextEvidenceSchema,
  eveSharedContextWriteSchema,
} from "./schema";
import {
  EVE_SHARED_CONTEXT_RISKS,
  type EveSharedContextClaim,
  type EveSharedContextConflict,
  type EveSharedContextResolution,
  type EveSharedContextSnapshot,
  type EveSharedContextStore,
} from "./types";
import { EVE_SPECIALIST_IDS } from "../subagent-catalog/types";

import type { AdminSupabaseClient } from "@asym/database/supabase/admin";

const claimRowSchema = z
  .object({
    id: z.string().uuid(),
    tenant_id: z.string().uuid(),
    root_session_id: z.string(),
    session_id: z.string(),
    accountable_run_id: z.string(),
    writer_subagent_id: z.enum(EVE_SPECIALIST_IDS),
    schema_version: z.literal(1),
    category: eveSharedContextWriteSchema.shape.category,
    field_path: eveSharedContextWriteSchema.shape.fieldPath,
    value: eveSharedContextWriteSchema.shape.value,
    provenance: eveSharedContextWriteSchema.shape.provenance,
    confidence_bps: eveSharedContextWriteSchema.shape.confidenceBps,
    risk: eveSharedContextWriteSchema.shape.risk,
    evidence: eveSharedContextWriteSchema.shape.evidence,
    relationship: eveSharedContextWriteSchema.shape.relationship,
    related_claim_ids: eveSharedContextWriteSchema.shape.relatedClaimIds,
    created_at: z.string(),
  })
  .strict();

const conflictRowSchema = z
  .object({
    id: z.string().uuid(),
    tenant_id: z.string().uuid(),
    root_session_id: z.string(),
    field_path: z.string(),
    claim_ids: z.array(z.string().uuid()),
    risk: z.enum(EVE_SHARED_CONTEXT_RISKS),
    created_at: z.string(),
  })
  .strict();

const resolutionRowSchema = z
  .object({
    id: z.string().uuid(),
    tenant_id: z.string().uuid(),
    conflict_id: z.string().uuid(),
    resolver_actor_id: z.string(),
    policy_id: z.string(),
    selected_claim_ids: z.array(z.string().uuid()),
    evidence: z.array(eveSharedContextEvidenceSchema),
    outcome: z.string(),
    created_at: z.string(),
  })
  .strict();

function toClaim(row: unknown): EveSharedContextClaim {
  const parsed = claimRowSchema.parse(row);
  return {
    id: parsed.id,
    tenantId: parsed.tenant_id,
    rootSessionId: parsed.root_session_id,
    sessionId: parsed.session_id,
    accountableRunId: parsed.accountable_run_id,
    writerSubagentId: parsed.writer_subagent_id,
    schemaVersion: parsed.schema_version,
    category: parsed.category,
    fieldPath: parsed.field_path,
    value: parsed.value,
    provenance: parsed.provenance,
    confidenceBps: parsed.confidence_bps,
    risk: parsed.risk,
    evidence: parsed.evidence,
    relationship: parsed.relationship,
    relatedClaimIds: parsed.related_claim_ids,
    createdAt: parsed.created_at,
  };
}

function toConflict(row: unknown): EveSharedContextConflict {
  const parsed = conflictRowSchema.parse(row);
  return {
    id: parsed.id,
    tenantId: parsed.tenant_id,
    rootSessionId: parsed.root_session_id,
    fieldPath: parsed.field_path,
    claimIds: parsed.claim_ids,
    risk: parsed.risk,
    createdAt: parsed.created_at,
  };
}

function toResolution(row: unknown): EveSharedContextResolution {
  const parsed = resolutionRowSchema.parse(row);
  return {
    id: parsed.id,
    tenantId: parsed.tenant_id,
    conflictId: parsed.conflict_id,
    resolverActorId: parsed.resolver_actor_id,
    policyId: parsed.policy_id,
    selectedClaimIds: parsed.selected_claim_ids,
    evidence: parsed.evidence,
    outcome: parsed.outcome,
    createdAt: parsed.created_at,
  };
}

function claimRpcPayload(claim: EveSharedContextClaim) {
  return {
    id: claim.id,
    tenant_id: claim.tenantId,
    root_session_id: claim.rootSessionId,
    session_id: claim.sessionId,
    accountable_run_id: claim.accountableRunId,
    writer_subagent_id: claim.writerSubagentId,
    schema_version: claim.schemaVersion,
    category: claim.category,
    field_path: claim.fieldPath,
    value: claim.value,
    provenance: claim.provenance,
    confidence_bps: claim.confidenceBps,
    risk: claim.risk,
    evidence: claim.evidence,
    relationship: claim.relationship,
    related_claim_ids: claim.relatedClaimIds,
    created_at: claim.createdAt,
  };
}

function conflictRpcPayload(conflict: EveSharedContextConflict | undefined) {
  if (!conflict) return null;
  return {
    id: conflict.id,
    tenant_id: conflict.tenantId,
    root_session_id: conflict.rootSessionId,
    field_path: conflict.fieldPath,
    claim_ids: conflict.claimIds,
    risk: conflict.risk,
    created_at: conflict.createdAt,
  };
}

async function loadResolutions(input: {
  conflictIds: string[];
  supabaseAdmin: AdminSupabaseClient;
  tenantId: string;
}): Promise<Map<string, EveSharedContextResolution>> {
  if (input.conflictIds.length === 0) return new Map();
  const { data, error } = await input.supabaseAdmin
    .from("eve_shared_context_resolutions")
    .select(
      "id, tenant_id, conflict_id, resolver_actor_id, policy_id, selected_claim_ids, evidence, outcome, created_at",
    )
    .eq("tenant_id", input.tenantId)
    .in("conflict_id", input.conflictIds);
  if (error) throw new Error(error.message);
  return new Map(
    (data ?? []).map((row) => {
      const resolution = toResolution(row);
      return [resolution.conflictId, resolution];
    }),
  );
}

export function createEveSharedContextStore(
  supabaseAdmin: AdminSupabaseClient,
): EveSharedContextStore {
  return {
    async appendClaim({ claim, conflict }) {
      const { error } = await supabaseAdmin.rpc(
        "append_eve_shared_context_claim",
        {
          p_claim: claimRpcPayload(claim),
          p_conflict: conflictRpcPayload(conflict),
        },
      );
      if (error) throw new Error(error.message);
    },
    async appendResolution(resolution) {
      const { error } = await supabaseAdmin.rpc(
        "resolve_eve_shared_context_conflict",
        {
          p_resolution: {
            id: resolution.id,
            tenant_id: resolution.tenantId,
            conflict_id: resolution.conflictId,
            resolver_actor_id: resolution.resolverActorId,
            policy_id: resolution.policyId,
            selected_claim_ids: resolution.selectedClaimIds,
            evidence: resolution.evidence,
            outcome: resolution.outcome,
            created_at: resolution.createdAt,
          },
        },
      );
      if (error) throw new Error(error.message);
    },
    async loadConflict({ conflictId, tenantId }) {
      const { data, error } = await supabaseAdmin
        .from("eve_shared_context_conflicts")
        .select(
          "id, tenant_id, root_session_id, field_path, claim_ids, risk, created_at",
        )
        .eq("tenant_id", tenantId)
        .eq("id", conflictId)
        .maybeSingle();
      if (error) throw new Error(error.message);
      if (!data) return null;
      const conflict = toConflict(data);
      const resolutions = await loadResolutions({
        conflictIds: [conflict.id],
        supabaseAdmin,
        tenantId,
      });
      return { ...conflict, resolution: resolutions.get(conflict.id) };
    },
    async loadSnapshot({ rootSessionId, tenantId }) {
      const [claimsResult, conflictsResult] = await Promise.all([
        supabaseAdmin
          .from("eve_shared_context_claims")
          .select(
            "id, tenant_id, root_session_id, session_id, accountable_run_id, writer_subagent_id, schema_version, category, field_path, value, provenance, confidence_bps, risk, evidence, relationship, related_claim_ids, created_at",
          )
          .eq("tenant_id", tenantId)
          .eq("root_session_id", rootSessionId)
          .order("created_at", { ascending: true }),
        supabaseAdmin
          .from("eve_shared_context_conflicts")
          .select(
            "id, tenant_id, root_session_id, field_path, claim_ids, risk, created_at",
          )
          .eq("tenant_id", tenantId)
          .eq("root_session_id", rootSessionId)
          .order("created_at", { ascending: true }),
      ]);
      if (claimsResult.error) throw new Error(claimsResult.error.message);
      if (conflictsResult.error) throw new Error(conflictsResult.error.message);
      const conflicts = (conflictsResult.data ?? []).map(toConflict);
      const resolutions = await loadResolutions({
        conflictIds: conflicts.map((conflict) => conflict.id),
        supabaseAdmin,
        tenantId,
      });
      return {
        rootSessionId,
        claims: (claimsResult.data ?? []).map(toClaim),
        conflicts: conflicts.map((conflict) => ({
          ...conflict,
          resolution: resolutions.get(conflict.id),
        })),
      } satisfies EveSharedContextSnapshot;
    },
  };
}
