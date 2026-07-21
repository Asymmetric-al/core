import { z } from "zod";

import { ApiHttpError } from "../../shared/api-http-error";
import { createAdminEveAuditIdentity } from "../audit";
import { loadEveGovernanceSnapshot } from "../governance";
import { evaluateEveLaunchReadiness } from "./evaluator";
import { resolveEveLaunchRuntimeTarget } from "./runtime-target";
import { hashEveLaunchManifest, normalizeEveLaunchManifest } from "./schema";
import {
  createEveLaunchManifestRecord,
  loadActiveEveModelPolicyBinding,
  loadEveLaunchManifest,
} from "./store";

import type {
  EveLaunchCanaryId,
  EveLaunchManifestDocument,
  EveLaunchManifestRecord,
  EveLaunchPermission,
  EveLaunchReview,
} from "./types";
import type { AuthenticatedContext } from "@asym/auth/context";
import type { AdminSupabaseClient } from "@asym/database/supabase/admin";

const reviewResultSchema = z.object({
  createdAt: z.string(),
  decision: z.enum(["approved", "rejected"]),
  manifestId: z.string().uuid(),
  reviewerProfileId: z.string().uuid(),
  reviewerRole: z.enum(["release", "security"]),
  summary: z.string(),
});

const activationResultSchema = z.object({
  launchId: z.string().uuid(),
  stateVersion: z.number().int().positive(),
});

const stateVersionResultSchema = z.object({
  stateVersion: z.number().int().positive(),
});

function requireAdminIdentity(auth: AuthenticatedContext) {
  const identity = createAdminEveAuditIdentity(auth);
  if (!identity.actorProfileId || !identity.tenantId) {
    throw new ApiHttpError(403, "Verified Eve launch identity is required.");
  }
  return identity;
}

function mapLaunchError(error: { message: string } | null): never {
  const message = error?.message ?? "eve_launch_mutation_failed";
  if (message.includes("permission_required")) {
    throw new ApiHttpError(
      403,
      "A dedicated Eve launch permission is required.",
    );
  }
  if (message.includes("profile_tenant_mismatch")) {
    throw new ApiHttpError(403, "Eve launch tenant ownership was rejected.");
  }
  if (
    message.includes("stale_eve_governance_state") ||
    message.includes("stale_eve_launch_manifest")
  ) {
    throw new ApiHttpError(
      409,
      "Eve launch state changed. Refresh and review the target again.",
    );
  }
  if (
    message.includes("eve_launch_not_ready") ||
    message.includes("eve_launch_reviewer_not_independent") ||
    message.includes("eve_launch_target_mismatch") ||
    message.includes("eve_launch_reviews_incomplete") ||
    message.includes("eve_launch_blocked")
  ) {
    throw new ApiHttpError(409, "Eve launch readiness is not satisfied.");
  }
  if (message.includes("missing_eve_")) {
    throw new ApiHttpError(404, "Required Eve launch state was not found.");
  }
  if (message.includes("invalid_eve_")) {
    throw new ApiHttpError(400, "The Eve launch request is invalid.");
  }
  throw new Error(message);
}

export async function createEveLaunchManifest(input: {
  auth: AuthenticatedContext;
  document: EveLaunchManifestDocument;
  supabaseAdmin: AdminSupabaseClient;
}): Promise<EveLaunchManifestRecord> {
  const identity = requireAdminIdentity(input.auth);
  const normalized = normalizeEveLaunchManifest(input.document);
  const evaluation = evaluateEveLaunchReadiness({ document: normalized });
  const contentHash = hashEveLaunchManifest(normalized);

  return createEveLaunchManifestRecord({
    actorId: identity.actorId,
    actorRole: identity.actorRole!,
    auditId: crypto.randomUUID(),
    contentHash,
    document: normalized,
    evaluation,
    initiatorId: identity.initiatorId,
    initiatorType: identity.initiatorType,
    profileId: identity.actorProfileId!,
    supabaseAdmin: input.supabaseAdmin,
    tenantId: identity.tenantId!,
  });
}

export async function grantEveLaunchPermission(input: {
  auth: AuthenticatedContext;
  enabled: boolean;
  permission: EveLaunchPermission;
  profileId: string;
  reason: string;
  supabaseAdmin: AdminSupabaseClient;
}): Promise<void> {
  const identity = requireAdminIdentity(input.auth);
  if (
    input.auth.role !== "super_admin" &&
    input.auth.profileRole !== "super_admin"
  ) {
    throw new ApiHttpError(
      403,
      "Only a platform owner may grant Eve launch permissions.",
    );
  }
  const { error } = await input.supabaseAdmin.rpc(
    "grant_eve_launch_permission",
    {
      p_actor_id: identity.actorId,
      p_actor_profile_id: identity.actorProfileId,
      p_actor_role: identity.actorRole,
      p_audit_id: crypto.randomUUID(),
      p_enabled: input.enabled,
      p_initiator_id: identity.initiatorId,
      p_initiator_type: identity.initiatorType,
      p_permission: input.permission,
      p_profile_id: input.profileId,
      p_reason: input.reason,
      p_tenant_id: identity.tenantId,
    },
  );
  if (error) mapLaunchError(error);
}

export async function reviewEveLaunchManifest(input: {
  auth: AuthenticatedContext;
  decision: "approved" | "rejected";
  manifestId: string;
  reviewerRole: "release" | "security";
  summary: string;
  supabaseAdmin: AdminSupabaseClient;
}): Promise<EveLaunchReview> {
  const identity = requireAdminIdentity(input.auth);
  const { data, error } = await input.supabaseAdmin.rpc(
    "review_eve_launch_manifest",
    {
      p_actor_id: identity.actorId,
      p_actor_profile_id: identity.actorProfileId,
      p_actor_role: identity.actorRole,
      p_audit_id: crypto.randomUUID(),
      p_decision: input.decision,
      p_initiator_id: identity.initiatorId,
      p_initiator_type: identity.initiatorType,
      p_manifest_id: input.manifestId,
      p_reviewer_role: input.reviewerRole,
      p_summary: input.summary,
      p_tenant_id: identity.tenantId,
    },
  );
  if (error || !data) mapLaunchError(error);
  return reviewResultSchema.parse(data);
}

export async function activateEveLaunchManifest(input: {
  auth: AuthenticatedContext;
  expectedStateVersion: number;
  justification: string;
  manifestId: string;
  supabaseAdmin: AdminSupabaseClient;
}): Promise<{ launchId: string; stateVersion: number }> {
  const identity = requireAdminIdentity(input.auth);
  const governance = await loadEveGovernanceSnapshot({
    supabaseAdmin: input.supabaseAdmin,
  });
  if (!governance || governance.stateVersion !== input.expectedStateVersion) {
    throw new ApiHttpError(
      409,
      "Eve governance state changed. Refresh before activation.",
    );
  }
  const activeModelPolicy = await loadActiveEveModelPolicyBinding({
    supabaseAdmin: input.supabaseAdmin,
  });
  const runtimeTarget = resolveEveLaunchRuntimeTarget({
    activeModelPolicy,
    governanceStateVersion: governance.stateVersion,
  });
  if (!runtimeTarget) {
    throw new ApiHttpError(
      503,
      "The deployed Eve launch target is not completely configured.",
    );
  }
  const manifest = await loadEveLaunchManifest({
    manifestId: input.manifestId,
    supabaseAdmin: input.supabaseAdmin,
    tenantId: identity.tenantId!,
  });
  if (!manifest) throw new ApiHttpError(404, "Launch manifest was not found.");
  const evaluation = evaluateEveLaunchReadiness({
    document: manifest.document,
  });
  const normalizedRuntime = JSON.stringify(runtimeTarget);
  const normalizedManifest = JSON.stringify(manifest.document.target);
  if (
    !evaluation.ready ||
    manifest.status !== "ready" ||
    hashEveLaunchManifest(manifest.document) !== manifest.contentHash ||
    normalizedRuntime !== normalizedManifest
  ) {
    throw new ApiHttpError(
      409,
      "The exact deployed Eve target does not have current passing readiness.",
    );
  }
  const { data, error } = await input.supabaseAdmin.rpc(
    "activate_eve_launch_manifest",
    {
      p_actor_id: identity.actorId,
      p_actor_profile_id: identity.actorProfileId,
      p_actor_role: identity.actorRole,
      p_audit_id: crypto.randomUUID(),
      p_content_hash: manifest.contentHash,
      p_deployment_id: runtimeTarget.deploymentId,
      p_environment: runtimeTarget.environment,
      p_eval_config_revision: runtimeTarget.evalConfigRevision,
      p_expected_state_version: input.expectedStateVersion,
      p_initiator_id: identity.initiatorId,
      p_initiator_type: identity.initiatorType,
      p_justification: input.justification,
      p_manifest_id: input.manifestId,
      p_migration_version: runtimeTarget.migrationVersion,
      p_model_policy_revision: runtimeTarget.modelPolicyRevision,
      p_policy_version: runtimeTarget.policyVersion,
      p_revision: runtimeTarget.revision,
      p_tenant_id: identity.tenantId,
    },
  );
  if (error || !data) mapLaunchError(error);
  return activationResultSchema.parse(data);
}

export async function setEveReleaseSafetyControl(input: {
  auth: AuthenticatedContext;
  expectedStateVersion: number;
  mode: "clear_emergency" | "disable" | "emergency_off";
  reason: string;
  supabaseAdmin: AdminSupabaseClient;
}): Promise<{ stateVersion: number }> {
  const identity = requireAdminIdentity(input.auth);
  const { data, error } = await input.supabaseAdmin.rpc(
    "set_eve_release_safety_control",
    {
      p_actor_id: identity.actorId,
      p_actor_profile_id: identity.actorProfileId,
      p_actor_role: identity.actorRole,
      p_audit_id: crypto.randomUUID(),
      p_expected_state_version: input.expectedStateVersion,
      p_initiator_id: identity.initiatorId,
      p_initiator_type: identity.initiatorType,
      p_mode: input.mode,
      p_reason: input.reason,
      p_tenant_id: identity.tenantId,
    },
  );
  if (error || !data) mapLaunchError(error);
  return stateVersionResultSchema.parse(data);
}

export async function closeEveLaunchCanary(input: {
  auth: AuthenticatedContext;
  launchId: string;
  reason: string;
  results: Record<EveLaunchCanaryId, boolean>;
  status: "completed" | "failed";
  supabaseAdmin: AdminSupabaseClient;
}): Promise<void> {
  const identity = requireAdminIdentity(input.auth);
  const { error } = await input.supabaseAdmin.rpc("close_eve_launch_canary", {
    p_actor_id: identity.actorId,
    p_actor_profile_id: identity.actorProfileId,
    p_actor_role: identity.actorRole,
    p_audit_id: crypto.randomUUID(),
    p_initiator_id: identity.initiatorId,
    p_initiator_type: identity.initiatorType,
    p_launch_id: input.launchId,
    p_reason: input.reason,
    p_results: input.results,
    p_status: input.status,
    p_tenant_id: identity.tenantId,
  });
  if (error) mapLaunchError(error);
}
