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

const superAdminAuth = {
  ...auth,
  role: "super_admin",
  profileRole: "super_admin",
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

  it("redacts labeled prompt, response, and transcript text in debug artifacts", async () => {
    const rpc = vi
      .fn()
      .mockResolvedValueOnce({
        data: "2027-01-01T00:00:00.000Z",
        error: null,
      })
      .mockResolvedValueOnce({ data: null, error: null });
    const upload = vi.fn().mockResolvedValue({ data: {}, error: null });
    const { storeEveReplayArtifact } =
      await import("../../../../packages/api/src/eve/retention/control");

    await storeEveReplayArtifact({
      artifactKind: "debug",
      auth,
      content: [
        "status: failed",
        "prompt:",
        "private model prompt",
        "with a multiline continuation",
        "response =",
        "private model response",
        "User: private transcript request",
        "private transcript continuation",
        "Assistant: private transcript reply",
      ].join("\n"),
      redactedSummary: "Safe debug artifact",
      supabaseAdmin: {
        rpc,
        storage: { from: () => ({ upload }) },
      } as unknown as AdminSupabaseClient,
    });

    const uploadedBody = upload.mock.calls[0]?.[1] as string;
    expect(uploadedBody).toContain("status: failed");
    expect(uploadedBody).not.toContain("private model prompt");
    expect(uploadedBody).not.toContain("multiline continuation");
    expect(uploadedBody).not.toContain("private model response");
    expect(uploadedBody).not.toContain("private transcript request");
    expect(uploadedBody).not.toContain("private transcript continuation");
    expect(uploadedBody).not.toContain("private transcript reply");
    expect(uploadedBody.match(/\[redacted\]/g)).toHaveLength(4);
  });

  it("rejects gateway telemetry bodies before registering or uploading them", async () => {
    const rpc = vi.fn();
    const upload = vi.fn();
    const { storeEveReplayArtifact } =
      await import("../../../../packages/api/src/eve/retention/control");

    await expect(
      storeEveReplayArtifact({
        artifactKind: "gateway_telemetry",
        auth,
        content: JSON.stringify({ prompt: "private prompt" }),
        redactedSummary: "Gateway telemetry",
        supabaseAdmin: {
          rpc,
          storage: { from: () => ({ upload }) },
        } as unknown as AdminSupabaseClient,
      }),
    ).rejects.toMatchObject({ status: 400 });
    expect(rpc).not.toHaveBeenCalled();
    expect(upload).not.toHaveBeenCalled();
  });

  it("finalizes only storage objects that were actually deleted", async () => {
    const rpc = vi
      .fn()
      .mockResolvedValueOnce({
        data: [
          {
            id: "a",
            storage_bucket: "eve-replay-artifacts",
            storage_path: "a",
          },
          {
            id: "b",
            storage_bucket: "eve-replay-artifacts",
            storage_path: "b",
          },
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
        auth: superAdminAuth,
        limit: 100,
        supabaseAdmin: {
          rpc,
          storage: { from: () => ({ remove }) },
        } as unknown as AdminSupabaseClient,
      }),
    ).resolves.toMatchObject({ claimedArtifacts: 2, expiredArtifacts: 1 });
    expect(rpc).toHaveBeenNthCalledWith(
      2,
      "finalize_eve_replay_artifact_expiry",
      {
        p_ids: ["a"],
      },
    );
  });

  it("rejects tenant admins before global expiry RPCs execute", async () => {
    const rpc = vi.fn();
    const { runEveRetentionExpiry } =
      await import("../../../../packages/api/src/eve/retention/control");

    await expect(
      runEveRetentionExpiry({
        auth,
        limit: 100,
        supabaseAdmin: { rpc } as unknown as AdminSupabaseClient,
      }),
    ).rejects.toMatchObject({ status: 403 });
    expect(rpc).not.toHaveBeenCalled();
  });
});
