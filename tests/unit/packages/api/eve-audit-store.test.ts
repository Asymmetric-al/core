import { describe, expect, it, vi } from "vitest";

import {
  appendEveAuditEvent,
  loadRecentEveAuditEvents,
} from "../../../../packages/api/src/eve/audit/store";

import type { AdminSupabaseClient } from "@asym/database/supabase/admin";

const RECORD = {
  id: "00000000-0000-4000-8000-000000000001",
  tenantId: "00000000-0000-4000-8000-000000000002",
  actorId: "verified-user",
  actorProfileId: "00000000-0000-4000-8000-000000000003",
  actorRole: "admin",
  identityMode: "admin",
  initiatorType: "authenticated_admin",
  initiatorId: "verified-user",
  policyId: "governance",
  policyStatus: "ready",
  governanceStateVersion: 2,
  action: "governance.inspect",
  target: "eve:global",
  result: "succeeded",
  modelRole: "not_used",
  evidenceSummary: '{"releaseEnabled":false}',
  changeSummary: '{"stateChanged":false}',
  decisionSummary: "governance.inspect succeeded. Rationale: Safe inspection.",
  debugMetadata: { requestId: "request-1" },
  redactionVersion: "eve-audit-v1",
  createdAt: "2026-07-17T00:00:00.000Z",
} as const;

describe("Eve audit store", () => {
  it("inserts only the normalized audit record shape", async () => {
    const insert = vi.fn().mockResolvedValue({ error: null });
    const supabaseAdmin = {
      from: vi.fn().mockReturnValue({ insert }),
    } as unknown as AdminSupabaseClient;

    await appendEveAuditEvent({ supabaseAdmin, record: RECORD });

    expect(supabaseAdmin.from).toHaveBeenCalledWith("eve_audit_events");
    expect(insert).toHaveBeenCalledWith(
      expect.objectContaining({
        actor_id: "verified-user",
        actor_profile_id: "00000000-0000-4000-8000-000000000003",
        identity_mode: "admin",
        evidence_summary: '{"releaseEnabled":false}',
        debug_metadata: { requestId: "request-1" },
        redaction_version: "eve-audit-v1",
      }),
    );
    expect(insert.mock.calls[0]?.[0]).not.toHaveProperty("prompt");
    expect(insert.mock.calls[0]?.[0]).not.toHaveProperty("raw_reasoning");
    expect(insert.mock.calls[0]?.[0]).not.toHaveProperty("payload");
  });

  it("maps recent audit rows for the authorized admin view", async () => {
    const limit = vi.fn().mockResolvedValue({
      data: [
        {
          id: RECORD.id,
          run_id: null,
          tenant_id: RECORD.tenantId,
          actor_id: RECORD.actorId,
          actor_profile_id: RECORD.actorProfileId,
          actor_role: RECORD.actorRole,
          identity_mode: RECORD.identityMode,
          initiator_type: RECORD.initiatorType,
          initiator_id: RECORD.initiatorId,
          policy_id: RECORD.policyId,
          policy_status: RECORD.policyStatus,
          governance_state_version: RECORD.governanceStateVersion,
          action: RECORD.action,
          target: RECORD.target,
          result: RECORD.result,
          tool_name: null,
          subagent_name: null,
          model_role: RECORD.modelRole,
          evidence_summary: RECORD.evidenceSummary,
          change_summary: RECORD.changeSummary,
          decision_summary: RECORD.decisionSummary,
          debug_metadata: RECORD.debugMetadata,
          redaction_version: RECORD.redactionVersion,
          created_at: RECORD.createdAt,
        },
      ],
      error: null,
    });
    const order = vi.fn().mockReturnValue({ limit });
    const eq = vi.fn().mockReturnValue({ order });
    const select = vi.fn().mockReturnValue({ eq });
    const supabaseAdmin = {
      from: vi.fn().mockReturnValue({ select }),
    } as unknown as AdminSupabaseClient;

    const events = await loadRecentEveAuditEvents({
      supabaseAdmin,
      tenantId: RECORD.tenantId,
      limit: 20,
    });

    expect(eq).toHaveBeenCalledWith("tenant_id", RECORD.tenantId);
    expect(order).toHaveBeenCalledWith("created_at", { ascending: false });
    expect(limit).toHaveBeenCalledWith(20);
    expect(events).toEqual([RECORD]);
  });
});
