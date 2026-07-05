import type { getAdminClient } from "@asym/database/supabase/admin";

type WorkflowClaimsClient = NonNullable<
  ReturnType<typeof getAdminClient>["client"]
>;

const DEFAULT_CLAIM_TTL_SECONDS = 300;

export interface AcquireWorkClaimInput {
  tenantId: string;
  subject: { type: string; id: string };
  claimedBy: string;
  ttlSeconds?: number;
}

export interface AcquireWorkClaimResult {
  acquired: boolean;
  claimId: string | null;
  expiresAt: string | null;
}

/**
 * Product work claims guard each retryable business effect: manual replay,
 * recovery scans, and workflow retries cannot run the same tenant-scoped work
 * item concurrently. The claim decides whether this attempt may run now;
 * Inngest flow control only reduces pressure.
 */
export async function acquireWorkClaim(
  client: WorkflowClaimsClient,
  input: AcquireWorkClaimInput,
): Promise<AcquireWorkClaimResult> {
  const { data, error } = await client.rpc("acquire_workflow_work_claim", {
    p_tenant_id: input.tenantId,
    p_subject_type: input.subject.type,
    p_subject_id: input.subject.id,
    p_claimed_by: input.claimedBy,
    p_ttl_seconds: input.ttlSeconds ?? DEFAULT_CLAIM_TTL_SECONDS,
  });

  if (error) {
    throw new Error(`workflow_work_claim_acquire_failed: ${error.message}`);
  }

  const payload = (data ?? {}) as {
    acquired?: boolean;
    claim_id?: string;
    expires_at?: string;
  };

  if (!payload.acquired) {
    return { acquired: false, claimId: null, expiresAt: null };
  }

  return {
    acquired: true,
    claimId: payload.claim_id ?? null,
    expiresAt: payload.expires_at ?? null,
  };
}

export interface ReleaseWorkClaimInput {
  claimId: string;
  status?: "released" | "expired";
}

export async function releaseWorkClaim(
  client: WorkflowClaimsClient,
  input: ReleaseWorkClaimInput,
): Promise<boolean> {
  const { data, error } = await client.rpc("release_workflow_work_claim", {
    p_claim_id: input.claimId,
    p_status: input.status ?? "released",
  });

  if (error) {
    throw new Error(`workflow_work_claim_release_failed: ${error.message}`);
  }

  return data === true;
}
