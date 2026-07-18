import { describe, expect, it, vi } from "vitest";

import {
  loadEveGovernanceAdminView,
  loadEveGovernanceSnapshot,
  recordEveGovernanceDecision,
} from "../../../../packages/api/src/eve/governance/store";
import { createClearedEveKillSwitchState } from "../../../../packages/api/src/eve/governance/types";

import type { AdminSupabaseClient } from "@asym/database/supabase/admin";

function createReadClient(input: {
  state: Record<string, unknown> | null;
  runs?: Record<string, unknown>[];
}) {
  const stateQuery = {
    select: vi.fn(),
    eq: vi.fn(),
    maybeSingle: vi.fn().mockResolvedValue({ data: input.state, error: null }),
  };
  stateQuery.select.mockReturnValue(stateQuery);
  stateQuery.eq.mockReturnValue(stateQuery);

  const runsQuery = {
    select: vi.fn(),
    order: vi.fn(),
    limit: vi.fn().mockResolvedValue({ data: input.runs ?? [], error: null }),
  };
  runsQuery.select.mockReturnValue(runsQuery);
  runsQuery.order.mockReturnValue(runsQuery);

  const client = {
    from: vi.fn((table: string) =>
      table === "eve_governance_state" ? stateQuery : runsQuery,
    ),
  } as unknown as AdminSupabaseClient;

  return { client, runsQuery, stateQuery };
}

const persistedState = {
  release_enabled: false,
  emergency_off: false,
  kill_switch_state: createClearedEveKillSwitchState(),
  policy_status: "not_configured",
  policy_summary: null,
  state_version: 1,
  updated_at: "2026-07-17T00:00:00.000Z",
};

describe("Eve governance store", () => {
  it("maps the persisted singleton into the kernel snapshot", async () => {
    const { client } = createReadClient({ state: persistedState });

    await expect(
      loadEveGovernanceSnapshot({ supabaseAdmin: client }),
    ).resolves.toEqual({
      source: "persisted",
      releaseEnabled: false,
      emergencyOff: false,
      killSwitchState: createClearedEveKillSwitchState(),
      policyStatus: "not_configured",
      stateVersion: 1,
      updatedAt: "2026-07-17T00:00:00.000Z",
    });
  });

  it("projects a missing singleton as visibly fail-closed", async () => {
    const { client } = createReadClient({ state: null });

    const view = await loadEveGovernanceAdminView({ supabaseAdmin: client });

    expect(view.system).toEqual(
      expect.objectContaining({
        source: "missing",
        releaseEnabled: false,
        emergencyOff: false,
        policyStatus: "not_configured",
      }),
    );
    expect(Object.values(view.system.killSwitchState)).toEqual(
      Array.from({ length: 8 }, () => true),
    );
    expect(view.recentRuns).toEqual([]);
  });

  it("upserts decision summaries by run id", async () => {
    const upsert = vi.fn().mockResolvedValue({ error: null });
    const client = {
      from: vi.fn().mockReturnValue({ upsert }),
    } as unknown as AdminSupabaseClient;

    await recordEveGovernanceDecision({
      supabaseAdmin: client,
      record: {
        id: "59a8f7b5-d745-4ae6-97aa-c02c6d55cd32",
        action: "github.review",
        target: "Asymmetric-al/core#999",
        decision: "blocked",
        reason: "release_disabled",
        status: "skipped",
        stateVersion: 1,
      },
    });

    expect(upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "59a8f7b5-d745-4ae6-97aa-c02c6d55cd32",
        governance_decision: "blocked",
        decision_reason: "release_disabled",
        status: "skipped",
      }),
      { onConflict: "id" },
    );
  });
});
