import { describe, expect, it, vi } from "vitest";

import {
  PLATFORM_HISTORY_COLUMNS,
  readPlatformHistory,
  type OperatorMfaClient,
  type PlatformHistoryRow,
} from "../../../packages/auth/operator-mfa";

const ROW = {
  id: "00000000-0000-4000-8000-0000000000e1",
  run_id: null,
  tenant_id: null,
  actor_id: "operator:wren",
  actor_profile_id: "00000000-0000-4000-8000-0000000000a2",
  actor_role: "super_admin",
  identity_mode: "admin",
  initiator_type: "user",
  initiator_id: "wren",
  policy_id: "eve.governance",
  policy_status: "enforced",
  governance_state_version: 4,
  action: "kill_switch.global.set",
  target: "global",
  result: "succeeded",
  tool_name: null,
  subagent_name: null,
  model_role: "not_used",
  evidence_summary: "Global kill switch",
  change_summary: "Switched the assistant off everywhere",
  decision_summary: "Allowed for a confirmed operator",
  debug_metadata: {},
  redaction_version: "eve-audit-v1",
  created_at: "2026-11-27T10:00:00+00:00",
};

function client(answer: () => Promise<unknown>) {
  const rpc = vi.fn(answer);
  return { rpc, client: { rpc } as unknown as OperatorMfaClient };
}

describe("AL-2675 WP2c rest: the operator area's history with no organization", () => {
  it("reads public.platform_eve_history on the browser's session client, newest first as the database gives it", async () => {
    const older = {
      ...ROW,
      id: "00000000-0000-4000-8000-0000000000e2",
      identity_mode: "service",
      actor_id: "service:retention",
      actor_profile_id: null,
      action: "retention.expire",
      created_at: "2026-11-26T10:00:00+00:00",
    };
    const { rpc, client: c } = client(async () => ({
      data: [ROW, older],
      error: null,
    }));
    const read = await readPlatformHistory(c);
    expect(rpc).toHaveBeenCalledTimes(1);
    expect(rpc).toHaveBeenCalledWith("platform_eve_history", { p_limit: 50 });
    expect(read).toEqual({
      kind: "rows",
      rows: [
        {
          id: ROW.id,
          createdAt: ROW.created_at,
          action: "kill_switch.global.set",
          result: "succeeded",
          identityMode: "admin",
          actorId: "operator:wren",
          policyId: "eve.governance",
          changeSummary: "Switched the assistant off everywhere",
          decisionSummary: "Allowed for a confirmed operator",
        },
        {
          id: older.id,
          createdAt: older.created_at,
          action: "retention.expire",
          result: "succeeded",
          identityMode: "service",
          actorId: "service:retention",
          policyId: "eve.governance",
          changeSummary: "Switched the assistant off everywhere",
          decisionSummary: "Allowed for a confirmed operator",
        },
      ],
    });
  });

  it("asks for the limit given", async () => {
    const { rpc, client: c } = client(async () => ({ data: [], error: null }));
    await readPlatformHistory(c, 200);
    expect(rpc).toHaveBeenCalledWith("platform_eve_history", { p_limit: 200 });
  });

  it("answers an empty history as rows, and only then", async () => {
    const { client: c } = client(async () => ({ data: [], error: null }));
    expect(await readPlatformHistory(c)).toEqual({ kind: "rows", rows: [] });
  });

  it("answers refused, never an empty history, when the database refuses (42501)", async () => {
    const { client: c } = client(async () => ({
      data: null,
      error: {
        code: "42501",
        message: "platform: the caller is not a platform operator",
      },
    }));
    expect(await readPlatformHistory(c)).toEqual({ kind: "refused" });
  });

  it("answers failed, never an empty history, for any other error, a throw or a shape it does not know", async () => {
    const answers: Array<() => Promise<unknown>> = [
      async () => ({ data: null, error: { code: "PGRST202", message: "x" } }),
      async () => ({ data: null, error: { message: "network" } }),
      async () => {
        throw new Error("offline");
      },
      async () => ({ data: null, error: null }),
      async () => ({ data: { rows: [] }, error: null }),
      async () => ({ data: [{ id: 7 }], error: null }),
      async () => ({ data: [{ ...ROW, created_at: null }], error: null }),
    ];
    for (const answer of answers) {
      const { client: c } = client(answer);
      expect(await readPlatformHistory(c)).toEqual({ kind: "failed" });
    }
  });

  it("fails the whole read, showing nothing, if any row carries an organization", async () => {
    const { client: c } = client(async () => ({
      data: [
        ROW,
        { ...ROW, tenant_id: "00000000-0000-4000-8000-0000000000a1" },
      ],
      error: null,
    }));
    expect(await readPlatformHistory(c)).toEqual({ kind: "failed" });
  });

  it("F8 (review of #2855): reads each field of a history row from one column table that names every field of the row", () => {
    const fields: Record<keyof PlatformHistoryRow, true> = {
      id: true,
      createdAt: true,
      action: true,
      result: true,
      identityMode: true,
      actorId: true,
      policyId: true,
      changeSummary: true,
      decisionSummary: true,
    };
    expect(Object.keys(PLATFORM_HISTORY_COLUMNS).sort()).toEqual(
      Object.keys(fields).sort(),
    );
    expect(PLATFORM_HISTORY_COLUMNS).toEqual({
      id: "id",
      createdAt: "created_at",
      action: "action",
      result: "result",
      identityMode: "identity_mode",
      actorId: "actor_id",
      policyId: "policy_id",
      changeSummary: "change_summary",
      decisionSummary: "decision_summary",
    });
    for (const column of Object.values(PLATFORM_HISTORY_COLUMNS))
      expect(ROW).toHaveProperty(column);
  });
});
