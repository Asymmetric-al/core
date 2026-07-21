import { z } from "zod";

import {
  EVE_ARTIFACT_KINDS,
  EVE_RETENTION_HOLD_TYPES,
  EVE_RETENTION_SCOPE_TYPES,
} from "./types";

import type {
  EveReplayArtifact,
  EveRetentionAdminView,
  EveRetentionCategory,
  EveRetentionHold,
  EveRetentionLifecycleEvent,
} from "./types";
import type { AdminSupabaseClient } from "@asym/database/supabase/admin";

const categorySchema = z.object({
  category: z.string(),
  retention_days: z.number().int(),
  metadata_only: z.boolean(),
  description: z.string(),
});
const artifactSchema = z.object({
  id: z.string().uuid(),
  run_id: z.string().uuid().nullable(),
  category: z.string(),
  artifact_kind: z.enum(EVE_ARTIFACT_KINDS),
  redacted_summary: z.string(),
  content_type: z.string().nullable(),
  byte_size: z.number().int().nullable(),
  sha256: z.string().nullable(),
  status: z.enum(["upload_pending", "available", "delete_pending", "expired"]),
  expires_at: z.string(),
  created_at: z.string(),
});
const holdSchema = z.object({
  id: z.string().uuid(),
  hold_type: z.enum(EVE_RETENTION_HOLD_TYPES),
  scope_type: z.enum(EVE_RETENTION_SCOPE_TYPES),
  target_id: z.string(),
  reason: z.string(),
  status: z.enum(["active", "cleared"]),
  created_at: z.string(),
  cleared_at: z.string().nullable(),
});
const lifecycleSchema = z.object({
  id: z.string().uuid(),
  action: z.string(),
  target_type: z.string(),
  target_id: z.string(),
  detail: z.record(z.string(), z.unknown()),
  created_at: z.string(),
});

function mapCategory(value: unknown): EveRetentionCategory {
  const row = categorySchema.parse(value);
  return {
    category: row.category,
    retentionDays: row.retention_days,
    metadataOnly: row.metadata_only,
    description: row.description,
  };
}

function mapArtifact(value: unknown): EveReplayArtifact {
  const row = artifactSchema.parse(value);
  return {
    id: row.id,
    runId: row.run_id ?? undefined,
    category: row.category,
    artifactKind: row.artifact_kind,
    redactedSummary: row.redacted_summary,
    contentType: row.content_type ?? undefined,
    byteSize: row.byte_size ?? undefined,
    sha256: row.sha256 ?? undefined,
    status: row.status,
    expiresAt: row.expires_at,
    createdAt: row.created_at,
  };
}

function mapHold(value: unknown): EveRetentionHold {
  const row = holdSchema.parse(value);
  return {
    id: row.id,
    holdType: row.hold_type,
    scopeType: row.scope_type,
    targetId: row.target_id,
    reason: row.reason,
    status: row.status,
    createdAt: row.created_at,
    clearedAt: row.cleared_at ?? undefined,
  };
}

function mapLifecycle(value: unknown): EveRetentionLifecycleEvent {
  const row = lifecycleSchema.parse(value);
  return {
    id: row.id,
    action: row.action,
    targetType: row.target_type,
    targetId: row.target_id,
    detail: row.detail,
    createdAt: row.created_at,
  };
}

export async function loadEveRetentionAdminView(input: {
  supabaseAdmin: AdminSupabaseClient;
  tenantId: string;
  ownerProfileId: string;
}): Promise<EveRetentionAdminView> {
  const [categories, artifacts, holds, lifecycle] = await Promise.all([
    input.supabaseAdmin
      .from("eve_retention_categories")
      .select("category, retention_days, metadata_only, description")
      .order("category"),
    input.supabaseAdmin
      .from("eve_replay_artifacts")
      .select(
        "id, run_id, category, artifact_kind, redacted_summary, content_type, byte_size, sha256, status, expires_at, created_at",
      )
      .eq("tenant_id", input.tenantId)
      .eq("owner_profile_id", input.ownerProfileId)
      .order("created_at", { ascending: false })
      .limit(50),
    input.supabaseAdmin
      .from("eve_retention_holds")
      .select(
        "id, hold_type, scope_type, target_id, reason, status, created_at, cleared_at",
      )
      .eq("tenant_id", input.tenantId)
      .order("created_at", { ascending: false })
      .limit(50),
    input.supabaseAdmin
      .from("eve_retention_lifecycle_events")
      .select("id, action, target_type, target_id, detail, created_at")
      .eq("tenant_id", input.tenantId)
      .order("created_at", { ascending: false })
      .limit(100),
  ]);
  for (const result of [categories, artifacts, holds, lifecycle]) {
    if (result.error) throw new Error(result.error.message);
  }
  return {
    categories: (categories.data ?? []).map(mapCategory),
    artifacts: (artifacts.data ?? []).map(mapArtifact),
    holds: (holds.data ?? []).map(mapHold),
    lifecycle: (lifecycle.data ?? []).map(mapLifecycle),
  };
}
