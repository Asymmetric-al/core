import { z } from "zod";

import { evaluateEveLaunchReadiness } from "./evaluator";
import { eveLaunchManifestDocumentSchema } from "./schema";

import type {
  EveActiveModelPolicyBinding,
  EveLaunchAdminView,
  EveLaunchManifestRecord,
  EveLaunchManifestStatus,
  EveLaunchPermission,
  EveLaunchReadinessEvaluation,
  EveLaunchRecord,
  EveLaunchReview,
  EveLaunchTarget,
} from "./types";
import type { AdminSupabaseClient } from "@asym/database/supabase/admin";

const reviewRowSchema = z.object({
  created_at: z.string(),
  decision: z.enum(["approved", "rejected"]),
  manifest_id: z.string().uuid(),
  reviewer_profile_id: z.string().uuid(),
  reviewer_role: z.enum(["release", "security"]),
  summary: z.string(),
});

const manifestRowSchema = z.object({
  audit_id: z.string().uuid(),
  content_hash: z.string().length(64),
  created_at: z.string(),
  created_by_profile_id: z.string().uuid(),
  document: eveLaunchManifestDocumentSchema,
  evaluation: z.object({
    blockers: z.array(z.string()),
    evaluatedAt: z.string(),
    evidenceCount: z.number().int().nonnegative(),
    ready: z.boolean(),
  }),
  id: z.string().uuid(),
  status: z.enum([
    "not_ready",
    "evidence_passed",
    "ready",
    "active",
    "completed",
    "rolled_back",
    "expired",
  ]),
  tenant_id: z.string().uuid(),
});

const launchRowSchema = z.object({
  activated_at: z.string(),
  activated_by_profile_id: z.string().uuid(),
  canary_deadline: z.string(),
  canary_results: z.record(z.string(), z.boolean()).nullable(),
  closed_at: z.string().nullable(),
  id: z.string().uuid(),
  manifest_id: z.string().uuid(),
  status: z.enum(["active", "completed", "rolled_back"]),
});

const activeModelPolicyBindingRowSchema = z.object({
  eval_status: z.literal("passed"),
  policy_hash: z.string().regex(/^[0-9a-f]{64}$/u),
  version: z.number().int().positive(),
});

const manifestSelect =
  "id, tenant_id, status, content_hash, document, evaluation, audit_id, created_by_profile_id, created_at";

export async function loadActiveEveModelPolicyBinding(input: {
  supabaseAdmin: AdminSupabaseClient;
}): Promise<EveActiveModelPolicyBinding | null> {
  const { data, error } = await input.supabaseAdmin
    .from("eve_model_policies")
    .select("version, policy_hash, eval_status")
    .eq("scope_type", "platform")
    .eq("status", "active")
    .maybeSingle();
  if (error) throw new Error(error.message);
  const parsed = activeModelPolicyBindingRowSchema.safeParse(data);
  if (!parsed.success) return null;
  return {
    revision: parsed.data.policy_hash,
    version: parsed.data.version,
  };
}

function toReview(row: unknown): EveLaunchReview {
  const parsed = reviewRowSchema.parse(row);
  return {
    createdAt: parsed.created_at,
    decision: parsed.decision,
    manifestId: parsed.manifest_id,
    reviewerProfileId: parsed.reviewer_profile_id,
    reviewerRole: parsed.reviewer_role,
    summary: parsed.summary,
  };
}

function toManifest(input: {
  reviews: EveLaunchReview[];
  row: unknown;
}): EveLaunchManifestRecord {
  const parsed = manifestRowSchema.parse(input.row);
  return {
    auditId: parsed.audit_id,
    contentHash: parsed.content_hash,
    createdAt: parsed.created_at,
    createdByProfileId: parsed.created_by_profile_id,
    document: parsed.document,
    evaluation: parsed.evaluation as EveLaunchReadinessEvaluation,
    id: parsed.id,
    reviews: input.reviews.filter((review) => review.manifestId === parsed.id),
    status: parsed.status as EveLaunchManifestStatus,
    tenantId: parsed.tenant_id,
  };
}

const REEVALUATED_MANIFEST_STATUSES: readonly EveLaunchManifestStatus[] = [
  "evidence_passed",
  "ready",
];

/**
 * Launch readiness is time-bound: the stored status and evaluation are only
 * true for the freshness window recorded in the manifest. Re-run the
 * deterministic evaluator on read so operators never see a `ready` manifest
 * whose evidence has since expired, and so the admin view agrees with the
 * activation RPC instead of deferring the truth to a server-side error.
 */
function withCurrentReadiness(
  manifest: EveLaunchManifestRecord,
): EveLaunchManifestRecord {
  if (!REEVALUATED_MANIFEST_STATUSES.includes(manifest.status)) {
    return manifest;
  }
  const evaluation = evaluateEveLaunchReadiness({
    document: manifest.document,
  });
  if (evaluation.ready) {
    return { ...manifest, evaluation };
  }
  return { ...manifest, evaluation, status: "expired" };
}

function toLaunch(row: unknown): EveLaunchRecord {
  const parsed = launchRowSchema.parse(row);
  return {
    activatedAt: parsed.activated_at,
    activatedByProfileId: parsed.activated_by_profile_id,
    canaryDeadline: parsed.canary_deadline,
    canaryResults: parsed.canary_results as
      | EveLaunchRecord["canaryResults"]
      | undefined,
    closedAt: parsed.closed_at ?? undefined,
    id: parsed.id,
    manifestId: parsed.manifest_id,
    status: parsed.status,
  };
}

export async function hasEveLaunchPermission(input: {
  permission: EveLaunchPermission;
  profileId: string;
  supabaseAdmin: AdminSupabaseClient;
  tenantId: string;
}): Promise<boolean> {
  const { data, error } = await input.supabaseAdmin
    .from("eve_launch_permission_grants")
    .select("id")
    .eq("tenant_id", input.tenantId)
    .eq("profile_id", input.profileId)
    .eq("permission", input.permission)
    .eq("is_active", true)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data !== null;
}

export async function createEveLaunchManifestRecord(input: {
  actorId: string;
  actorRole: string;
  auditId: string;
  contentHash: string;
  document: EveLaunchManifestRecord["document"];
  evaluation: EveLaunchReadinessEvaluation;
  initiatorId: string;
  initiatorType: string;
  profileId: string;
  supabaseAdmin: AdminSupabaseClient;
  tenantId: string;
}): Promise<EveLaunchManifestRecord> {
  const id = crypto.randomUUID();
  const { data, error } = await input.supabaseAdmin.rpc(
    "create_eve_launch_manifest",
    {
      p_actor_id: input.actorId,
      p_actor_profile_id: input.profileId,
      p_actor_role: input.actorRole,
      p_audit_id: input.auditId,
      p_content_hash: input.contentHash,
      p_document: input.document,
      p_evaluation: input.evaluation,
      p_initiator_id: input.initiatorId,
      p_initiator_type: input.initiatorType,
      p_manifest_id: id,
      p_tenant_id: input.tenantId,
    },
  );
  if (error) throw new Error(error.message);
  return toManifest({ reviews: [], row: data });
}

export async function loadEveLaunchManifest(input: {
  manifestId: string;
  supabaseAdmin: AdminSupabaseClient;
  tenantId: string;
}): Promise<EveLaunchManifestRecord | null> {
  const [{ data, error }, reviewResult] = await Promise.all([
    input.supabaseAdmin
      .from("eve_launch_manifests")
      .select(manifestSelect)
      .eq("id", input.manifestId)
      .eq("tenant_id", input.tenantId)
      .maybeSingle(),
    input.supabaseAdmin
      .from("eve_launch_reviews")
      .select(
        "manifest_id, reviewer_profile_id, reviewer_role, decision, summary, created_at",
      )
      .eq("manifest_id", input.manifestId)
      .eq("tenant_id", input.tenantId),
  ]);
  if (error) throw new Error(error.message);
  if (reviewResult.error) throw new Error(reviewResult.error.message);
  if (!data) return null;
  return withCurrentReadiness(
    toManifest({
      reviews: (reviewResult.data ?? []).map(toReview),
      row: data,
    }),
  );
}

export async function loadEveLaunchAdminView(input: {
  profileId: string;
  runtimeTarget?: EveLaunchTarget;
  supabaseAdmin: AdminSupabaseClient;
  tenantId: string;
}): Promise<EveLaunchAdminView> {
  const [manifestResult, reviewResult, launchResult, canReview, canActivate] =
    await Promise.all([
      input.supabaseAdmin
        .from("eve_launch_manifests")
        .select(manifestSelect)
        .eq("tenant_id", input.tenantId)
        .order("created_at", { ascending: false })
        .limit(20),
      input.supabaseAdmin
        .from("eve_launch_reviews")
        .select(
          "manifest_id, reviewer_profile_id, reviewer_role, decision, summary, created_at",
        )
        .eq("tenant_id", input.tenantId)
        .order("created_at", { ascending: false })
        .limit(100),
      input.supabaseAdmin
        .from("eve_launch_records")
        .select(
          "id, manifest_id, status, activated_by_profile_id, activated_at, canary_deadline, canary_results, closed_at",
        )
        .eq("tenant_id", input.tenantId)
        .order("activated_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
      hasEveLaunchPermission({
        permission: "release.review",
        profileId: input.profileId,
        supabaseAdmin: input.supabaseAdmin,
        tenantId: input.tenantId,
      }),
      hasEveLaunchPermission({
        permission: "release.activate",
        profileId: input.profileId,
        supabaseAdmin: input.supabaseAdmin,
        tenantId: input.tenantId,
      }),
    ]);
  if (manifestResult.error) throw new Error(manifestResult.error.message);
  if (reviewResult.error) throw new Error(reviewResult.error.message);
  if (launchResult.error) throw new Error(launchResult.error.message);
  const reviews = (reviewResult.data ?? []).map(toReview);
  return {
    canActivate,
    canReview,
    latestLaunch: launchResult.data ? toLaunch(launchResult.data) : undefined,
    manifests: (manifestResult.data ?? []).map((row) =>
      withCurrentReadiness(toManifest({ reviews, row })),
    ),
    runtimeTarget: input.runtimeTarget,
  };
}

export async function expireEveLaunchCanaries(input: {
  supabaseAdmin: AdminSupabaseClient;
}): Promise<number> {
  const { data, error } = await input.supabaseAdmin.rpc(
    "expire_eve_launch_canaries",
  );
  if (error) throw new Error(error.message);
  return typeof data === "number" ? data : 0;
}
