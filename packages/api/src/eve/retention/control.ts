import { ApiHttpError } from "../../shared/api-http-error";
import {
  redactEveArtifactText,
  redactEveReplayValue,
  summarizeEveAuditValue,
} from "../audit/redaction";

import type {
  EveArtifactKind,
  EveRetentionHoldType,
  EveRetentionScopeType,
} from "./types";
import type { AuthenticatedContext } from "@asym/auth/context";
import type { AdminSupabaseClient } from "@asym/database/supabase/admin";

const BUCKET = "eve-replay-artifacts";
const MAX_ARTIFACT_BYTES = 5_000_000;

function actorParams(auth: AuthenticatedContext) {
  return {
    p_tenant_id: auth.tenantId,
    p_actor_profile_id: auth.profileId,
    p_actor_role: auth.role,
  };
}

function mapError(error: { message: string } | null): never {
  const message = error?.message ?? "eve_retention_mutation_failed";
  if (message.includes("actor_tenant_mismatch"))
    throw new ApiHttpError(403, "Retention ownership could not be verified.");
  if (message.includes("eve_replay_run_owner_mismatch"))
    throw new ApiHttpError(403, "Replay run ownership could not be verified.");
  if (message.includes("missing_eve_replay_artifact"))
    throw new ApiHttpError(404, "Replay artifact was not found.");
  if (message.includes("missing_eve_retention_hold"))
    throw new ApiHttpError(404, "Retention hold was not found.");
  if (message.includes("duplicate key"))
    throw new ApiHttpError(409, "An active hold already covers that target.");
  if (message.includes("eve_replay_artifact_deletion_in_progress"))
    throw new ApiHttpError(
      409,
      "Replay artifact deletion is already in progress.",
    );
  if (message.includes("invalid_eve") || message.includes("violates check"))
    throw new ApiHttpError(400, "The retention request is invalid.");
  throw new Error(message);
}

function toHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer), (value) =>
    value.toString(16).padStart(2, "0"),
  ).join("");
}

function redactArtifactContent(kind: EveArtifactKind, content: string): string {
  if (kind === "debug") return redactEveArtifactText(content);
  try {
    return JSON.stringify(redactEveReplayValue(JSON.parse(content)));
  } catch {
    throw new ApiHttpError(
      400,
      "Replay and gateway artifacts must be valid JSON.",
    );
  }
}

export async function storeEveReplayArtifact(input: {
  artifactKind: EveArtifactKind;
  auth: AuthenticatedContext;
  content: string;
  redactedSummary: string;
  runId?: string;
  supabaseAdmin: AdminSupabaseClient;
}) {
  if (input.artifactKind === "gateway_telemetry") {
    throw new ApiHttpError(
      400,
      "Gateway telemetry is metadata-only and cannot store artifact bodies.",
    );
  }

  const redactedContent = redactArtifactContent(
    input.artifactKind,
    input.content,
  );
  const encoded = new TextEncoder().encode(redactedContent);
  if (encoded.byteLength > MAX_ARTIFACT_BYTES) {
    throw new ApiHttpError(
      400,
      "Replay artifact bodies cannot exceed 5,000,000 bytes.",
    );
  }

  const artifactId = crypto.randomUUID();
  const extension = input.artifactKind === "debug" ? "txt" : "json";
  const storagePath = `${input.auth.tenantId}/${input.auth.profileId}/${artifactId}.${extension}`;
  const redactedSummary = summarizeEveAuditValue(input.redactedSummary);
  const { data: expiresAt, error: prepareError } =
    await input.supabaseAdmin.rpc("prepare_eve_replay_artifact", {
      p_id: artifactId,
      ...actorParams(input.auth),
      p_run_id: input.runId ?? null,
      p_artifact_kind: input.artifactKind,
      p_storage_path: storagePath,
      p_redacted_summary: redactedSummary,
    });
  if (prepareError || typeof expiresAt !== "string")
    return mapError(prepareError);
  const contentType =
    input.artifactKind === "debug" ? "text/plain" : "application/json";
  const sha256 = toHex(await crypto.subtle.digest("SHA-256", encoded));
  const { error: uploadError } = await input.supabaseAdmin.storage
    .from(BUCKET)
    .upload(storagePath, redactedContent, { contentType, upsert: false });
  if (uploadError) {
    await input.supabaseAdmin
      .from("eve_replay_artifacts")
      .delete()
      .eq("id", artifactId)
      .eq("tenant_id", input.auth.tenantId)
      .eq("owner_profile_id", input.auth.profileId)
      .eq("status", "upload_pending");
    throw new Error(uploadError.message);
  }
  const { error: completeError } = await input.supabaseAdmin.rpc(
    "complete_eve_replay_artifact",
    {
      p_id: artifactId,
      ...actorParams(input.auth),
      p_content_type: contentType,
      p_byte_size: encoded.byteLength,
      p_sha256: sha256,
    },
  );
  if (completeError) {
    const { error: cleanupError } = await input.supabaseAdmin.storage
      .from(BUCKET)
      .remove([storagePath]);
    if (cleanupError) {
      throw new Error("eve_replay_artifact_storage_cleanup_failed", {
        cause: cleanupError,
      });
    }

    await input.supabaseAdmin
      .from("eve_replay_artifacts")
      .delete()
      .eq("id", artifactId)
      .eq("tenant_id", input.auth.tenantId)
      .eq("owner_profile_id", input.auth.profileId)
      .eq("status", "upload_pending");
    mapError(completeError);
  }
  return { artifactId, expiresAt, byteSize: encoded.byteLength, sha256 };
}

export async function createEveReplayDownload(input: {
  artifactId: string;
  auth: AuthenticatedContext;
  supabaseAdmin: AdminSupabaseClient;
}) {
  const { data: artifact, error } = await input.supabaseAdmin
    .from("eve_replay_artifacts")
    .select("storage_bucket, storage_path")
    .eq("id", input.artifactId)
    .eq("tenant_id", input.auth.tenantId)
    .eq("owner_profile_id", input.auth.profileId)
    .eq("status", "available")
    .gt("expires_at", new Date().toISOString())
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!artifact) throw new ApiHttpError(404, "Replay artifact was not found.");
  const { data, error: signedError } = await input.supabaseAdmin.storage
    .from(artifact.storage_bucket)
    .createSignedUrl(artifact.storage_path, 60);
  if (signedError || !data?.signedUrl)
    throw new Error(signedError?.message ?? "signed_download_creation_failed");
  return { downloadUrl: data.signedUrl, expiresInSeconds: 60 };
}

export async function setEveRetentionHold(input: {
  auth: AuthenticatedContext;
  holdType: EveRetentionHoldType;
  reason: string;
  scopeType: EveRetentionScopeType;
  supabaseAdmin: AdminSupabaseClient;
  targetId: string;
}) {
  const { data, error } = await input.supabaseAdmin.rpc(
    "set_eve_retention_hold",
    {
      ...actorParams(input.auth),
      p_hold_type: input.holdType,
      p_scope_type: input.scopeType,
      p_target_id: input.targetId,
      p_reason: summarizeEveAuditValue(input.reason),
    },
  );
  if (error || typeof data !== "string") return mapError(error);
  return data;
}

export async function clearEveRetentionHold(input: {
  auth: AuthenticatedContext;
  holdId: string;
  reason: string;
  supabaseAdmin: AdminSupabaseClient;
}) {
  const { error } = await input.supabaseAdmin.rpc("clear_eve_retention_hold", {
    p_hold_id: input.holdId,
    ...actorParams(input.auth),
    p_reason: summarizeEveAuditValue(input.reason),
  });
  if (error) mapError(error);
}

export async function runEveRetentionExpiry(input: {
  auth: AuthenticatedContext;
  limit: number;
  supabaseAdmin: AdminSupabaseClient;
}) {
  if (input.auth.role !== "super_admin") {
    throw new ApiHttpError(
      403,
      "Only super administrators can run global retention expiry.",
    );
  }

  const { data: claimed, error } = await input.supabaseAdmin.rpc(
    "claim_eve_replay_artifact_expiry",
    { p_limit: input.limit },
  );
  if (error) mapError(error);
  const rows = (claimed ?? []) as Array<{
    id: string;
    storage_bucket: string;
    storage_path: string;
  }>;
  const deletedIds: string[] = [];
  for (const row of rows) {
    const { data: deletionStarted, error: beginError } =
      await input.supabaseAdmin.rpc("begin_eve_replay_artifact_deletion", {
        p_id: row.id,
      });
    if (beginError) mapError(beginError);
    if (deletionStarted !== true) continue;

    const { error: removeError } = await input.supabaseAdmin.storage
      .from(row.storage_bucket)
      .remove([row.storage_path]);
    if (!removeError) {
      deletedIds.push(row.id);
      continue;
    }

    const { error: releaseError } = await input.supabaseAdmin.rpc(
      "release_eve_replay_artifact_deletion",
      { p_id: row.id },
    );
    if (releaseError) mapError(releaseError);
  }
  if (deletedIds.length > 0) {
    const { error: finalizeError } = await input.supabaseAdmin.rpc(
      "finalize_eve_replay_artifact_expiry",
      { p_ids: deletedIds },
    );
    if (finalizeError) mapError(finalizeError);
  }
  const { data: records, error: recordError } = await input.supabaseAdmin.rpc(
    "expire_eve_retention_records",
    { p_limit: input.limit },
  );
  if (recordError) mapError(recordError);
  return {
    claimedArtifacts: rows.length,
    expiredArtifacts: deletedIds.length,
    records,
  };
}
