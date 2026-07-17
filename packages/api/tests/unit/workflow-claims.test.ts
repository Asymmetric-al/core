import { describe, expect, it, vi } from "vitest";

import { acquireWorkClaim, releaseWorkClaim } from "../../src/workflows/claims";

/**
 * Interface tests for Product Work Claims: the tenant-scoped mutual
 * exclusion guard for retryable business effects. The claim RPCs are driven
 * through a hand-built fake client injected as the first parameter — no
 * module mocking.
 */

const TENANT_ID = "11111111-1111-4111-8111-111111111111";
const CLAIM_ID = "55555555-5555-4555-8555-555555555555";

function fakeClaimsClient(result: {
  data?: unknown;
  error?: { message: string } | null;
}) {
  const rpc = vi.fn().mockResolvedValue({
    data: result.data ?? null,
    error: result.error ?? null,
  });
  return { client: { rpc } as never, rpc };
}

function acquireInput(overrides = {}) {
  return {
    tenantId: TENANT_ID,
    subject: { type: "donation_saga_outbox", id: "outbox-1" },
    claimedBy: "dispatch-recovery-scan",
    ...overrides,
  };
}

describe("Product Work Claim acquisition", () => {
  it("acquires the claim for an unclaimed tenant-scoped work item", async () => {
    const fake = fakeClaimsClient({
      data: {
        acquired: true,
        claim_id: CLAIM_ID,
        expires_at: "2026-06-11T00:05:00.000Z",
      },
    });

    const result = await acquireWorkClaim(fake.client, acquireInput());

    expect(result).toEqual({
      acquired: true,
      claimId: CLAIM_ID,
      expiresAt: "2026-06-11T00:05:00.000Z",
    });
    expect(fake.rpc).toHaveBeenCalledWith("acquire_workflow_work_claim", {
      p_tenant_id: TENANT_ID,
      p_subject_type: "donation_saga_outbox",
      p_subject_id: "outbox-1",
      p_claimed_by: "dispatch-recovery-scan",
      p_ttl_seconds: 300,
    });
  });

  it("passes a caller-provided TTL through to the claim RPC", async () => {
    const fake = fakeClaimsClient({
      data: { acquired: true, claim_id: CLAIM_ID },
    });

    await acquireWorkClaim(fake.client, acquireInput({ ttlSeconds: 60 }));

    expect(fake.rpc).toHaveBeenCalledWith(
      "acquire_workflow_work_claim",
      expect.objectContaining({ p_ttl_seconds: 60 }),
    );
  });

  it("reports a conflict when the work item is already claimed", async () => {
    const fake = fakeClaimsClient({ data: { acquired: false } });

    const result = await acquireWorkClaim(fake.client, acquireInput());

    expect(result).toEqual({ acquired: false, claimId: null, expiresAt: null });
  });

  it("treats a null RPC payload as not acquired instead of throwing", async () => {
    const fake = fakeClaimsClient({ data: null });

    const result = await acquireWorkClaim(fake.client, acquireInput());

    expect(result).toEqual({ acquired: false, claimId: null, expiresAt: null });
  });

  it("returns null claim details when the RPC omits them on an acquired claim", async () => {
    const fake = fakeClaimsClient({ data: { acquired: true } });

    const result = await acquireWorkClaim(fake.client, acquireInput());

    expect(result).toEqual({ acquired: true, claimId: null, expiresAt: null });
  });

  it("surfaces RPC failures as workflow_work_claim_acquire_failed", async () => {
    const fake = fakeClaimsClient({ error: { message: "connection reset" } });

    await expect(acquireWorkClaim(fake.client, acquireInput())).rejects.toThrow(
      "workflow_work_claim_acquire_failed: connection reset",
    );
  });
});

describe("Product Work Claim release", () => {
  it("releases an acquired claim with the default released status", async () => {
    const fake = fakeClaimsClient({ data: true });

    const released = await releaseWorkClaim(fake.client, { claimId: CLAIM_ID });

    expect(released).toBe(true);
    expect(fake.rpc).toHaveBeenCalledWith("release_workflow_work_claim", {
      p_claim_id: CLAIM_ID,
      p_status: "released",
    });
  });

  it("passes an explicit expired status through to the release RPC", async () => {
    const fake = fakeClaimsClient({ data: true });

    await releaseWorkClaim(fake.client, {
      claimId: CLAIM_ID,
      status: "expired",
    });

    expect(fake.rpc).toHaveBeenCalledWith(
      "release_workflow_work_claim",
      expect.objectContaining({ p_status: "expired" }),
    );
  });

  it("reports false when the claim was not released by this caller", async () => {
    const fake = fakeClaimsClient({ data: false });

    const released = await releaseWorkClaim(fake.client, { claimId: CLAIM_ID });

    expect(released).toBe(false);
  });

  it("reports false for a non-boolean RPC payload instead of guessing", async () => {
    const fake = fakeClaimsClient({ data: null });

    const released = await releaseWorkClaim(fake.client, { claimId: CLAIM_ID });

    expect(released).toBe(false);
  });

  it("surfaces RPC failures as workflow_work_claim_release_failed", async () => {
    const fake = fakeClaimsClient({ error: { message: "connection reset" } });

    await expect(
      releaseWorkClaim(fake.client, { claimId: CLAIM_ID }),
    ).rejects.toThrow("workflow_work_claim_release_failed: connection reset");
  });
});
