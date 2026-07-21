import { describe, expect, it, vi } from "vitest";

import { createDefaultEveModelPolicy } from "../../../../packages/api/src/eve/model-policy/schema";
import {
  hasEveAiSettingsGrant,
  loadEveModelPolicies,
} from "../../../../packages/api/src/eve/model-policy/store";

import type { AdminSupabaseClient } from "@asym/database/supabase/admin";

describe("Eve model-policy store", () => {
  it("maps versioned database rows into the admin policy model", async () => {
    const limit = vi.fn().mockResolvedValue({
      data: [
        {
          id: "00000000-0000-4000-8000-000000000001",
          version: 2,
          status: "active",
          previous_policy_id: "00000000-0000-4000-8000-000000000002",
          policy: createDefaultEveModelPolicy(),
          policy_hash: "a".repeat(64),
          eval_status: "passed",
          eval_summary: {
            status: "passed",
            evaluatedAt: "2026-07-17T12:00:00.000Z",
            checks: [{ id: "safe", passed: true, message: "Safe." }],
          },
          evaluated_at: "2026-07-17T12:00:00.000Z",
          activated_at: "2026-07-17T12:01:00.000Z",
          created_by_profile_id: "00000000-0000-4000-8000-000000000003",
          created_at: "2026-07-17T11:00:00.000Z",
        },
      ],
      error: null,
    });
    const order = vi.fn().mockReturnValue({ limit });
    const select = vi.fn().mockReturnValue({ order });
    const client = {
      from: vi.fn().mockReturnValue({ select }),
    } as unknown as AdminSupabaseClient;

    const policies = await loadEveModelPolicies({
      supabaseAdmin: client,
      limit: 10,
    });

    expect(order).toHaveBeenCalledWith("version", { ascending: false });
    expect(limit).toHaveBeenCalledWith(10);
    expect(policies).toEqual([
      expect.objectContaining({
        version: 2,
        status: "active",
        evalStatus: "passed",
        previousPolicyId: "00000000-0000-4000-8000-000000000002",
        policyHash: "a".repeat(64),
      }),
    ]);
  });

  it("requires the exact active tenant/profile AI-settings grant", async () => {
    const maybeSingle = vi.fn().mockResolvedValue({
      data: { id: "00000000-0000-4000-8000-000000000004" },
      error: null,
    });
    const query = { select: vi.fn(), eq: vi.fn(), maybeSingle };
    query.select.mockReturnValue(query);
    query.eq.mockReturnValue(query);
    const client = {
      from: vi.fn().mockReturnValue(query),
    } as unknown as AdminSupabaseClient;

    await expect(
      hasEveAiSettingsGrant({
        supabaseAdmin: client,
        tenantId: "00000000-0000-4000-8000-000000000005",
        profileId: "00000000-0000-4000-8000-000000000006",
      }),
    ).resolves.toBe(true);

    expect(query.eq.mock.calls).toEqual([
      ["tenant_id", "00000000-0000-4000-8000-000000000005"],
      ["profile_id", "00000000-0000-4000-8000-000000000006"],
      ["permission", "ai.settings.manage"],
      ["is_active", true],
    ]);
  });
});
