import { describe, expect, it, vi } from "vitest";

import type { AuthenticatedContext } from "@asym/auth/context";
import type { AdminSupabaseClient } from "@asym/database/supabase/admin";

const auth = {
  userId: "user_1",
  email: "admin@example.com",
  tenantId: "00000000-0000-4000-8000-000000000001",
  profileId: "00000000-0000-4000-8000-000000000002",
  role: "admin",
  profileRole: "admin",
  memberships: [],
  isAuthenticated: true,
} as AuthenticatedContext;

describe("Eve retention controls", () => {
  it("redacts content before uploading it to the verified private path", async () => {
    const rpc = vi
      .fn()
      .mockResolvedValueOnce({
        data: "2027-01-01T00:00:00.000Z",
        error: null,
      })
      .mockResolvedValueOnce({ data: null, error: null });
    const upload = vi.fn().mockResolvedValue({ data: {}, error: null });
    const remove = vi.fn();
    const storageFrom = vi.fn(() => ({ upload, remove }));
    const { storeEveReplayArtifact } =
      await import("../../../../packages/api/src/eve/retention/control");
    const result = await storeEveReplayArtifact({
      artifactKind: "replay",
      auth,
      content: JSON.stringify({
        email: "admin@example.com",
        detail: "Bearer secret",
        response: "private model response",
      }),
      redactedSummary: "Failure for admin@example.com with Bearer secret",
      supabaseAdmin: {
        rpc,
        storage: { from: storageFrom },
      } as unknown as AdminSupabaseClient,
    });
    const params = rpc.mock.calls[0]?.[1] as Record<string, unknown>;
    expect(params.p_storage_path).toMatch(
      new RegExp(`^${auth.tenantId}/${auth.profileId}/[0-9a-f-]{36}\\.json$`),
    );
    expect(params.p_redacted_summary).toContain("[redacted-email]");
    expect(params.p_redacted_summary).not.toContain("admin@example.com");
    expect(storageFrom).toHaveBeenCalledWith("eve-replay-artifacts");
    const uploadedBody = upload.mock.calls[0]?.[1] as string;
    expect(uploadedBody).not.toContain("admin@example.com");
    expect(uploadedBody).not.toContain("Bearer secret");
    expect(uploadedBody).not.toContain("private model response");
    expect(result.sha256).toMatch(/^[a-f0-9]{64}$/);
    expect(rpc).toHaveBeenNthCalledWith(
      2,
      "complete_eve_replay_artifact",
      expect.objectContaining({ p_sha256: result.sha256 }),
    );
  });

  it("finalizes only storage objects that were actually deleted", async () => {
    const rpc = vi
      .fn()
      .mockResolvedValueOnce({
        data: [
          { id: "a", storage_bucket: "eve-replay-artifacts", storage_path: "a" },
          { id: "b", storage_bucket: "eve-replay-artifacts", storage_path: "b" },
        ],
        error: null,
      })
      .mockResolvedValueOnce({ data: 1, error: null })
      .mockResolvedValueOnce({
        data: { auditRecords: 2, runSummaries: 1 },
        error: null,
      });
    const remove = vi
      .fn()
      .mockResolvedValueOnce({ error: null })
      .mockResolvedValueOnce({ error: { message: "transient" } });
    const { runEveRetentionExpiry } =
      await import("../../../../packages/api/src/eve/retention/control");
    await expect(
      runEveRetentionExpiry({
        limit: 100,
        supabaseAdmin: {
          rpc,
          storage: { from: () => ({ remove }) },
        } as unknown as AdminSupabaseClient,
      }),
    ).resolves.toMatchObject({ claimedArtifacts: 2, expiredArtifacts: 1 });
    expect(rpc).toHaveBeenNthCalledWith(2, "finalize_eve_replay_artifact_expiry", {
      p_ids: ["a"],
    });
  });
});
