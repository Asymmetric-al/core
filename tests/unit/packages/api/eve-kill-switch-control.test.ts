import { describe, expect, it, vi } from "vitest";

import { createAdminEveAuditIdentity } from "../../../../packages/api/src/eve/audit/identity";
import { createServiceEveAuditIdentity } from "../../../../packages/api/src/eve/audit/identity";
import { setEveKillSwitch } from "../../../../packages/api/src/eve/governance/control";
import { createClearedEveKillSwitchState } from "../../../../packages/api/src/eve/governance/types";

import type { AdminSupabaseClient } from "@asym/database/supabase/admin";
import type { AuthenticatedContext } from "@asym/auth/context";

function createAdminIdentity() {
  return createAdminEveAuditIdentity({
    userId: "user_1",
    email: "admin@example.com",
    tenantId: "00000000-0000-4000-8000-000000000003",
    role: "admin",
    profileRole: "admin",
    memberships: [],
    profileId: "00000000-0000-4000-8000-000000000002",
    isAuthenticated: true,
  } as AuthenticatedContext);
}

describe("Eve kill-switch control", () => {
  it("passes only verified admin authority and redacted evidence to the atomic RPC", async () => {
    const rpc = vi.fn().mockResolvedValue({
      data: {
        auditId: "00000000-0000-4000-8000-000000000004",
        changed: true,
        enabled: true,
        killSwitchState: {
          ...createClearedEveKillSwitchState(),
          production_writes: true,
        },
        stateVersion: 2,
        switchKey: "production_writes",
        updatedAt: "2026-07-17T00:01:00.000Z",
      },
      error: null,
    });
    const client = { rpc } as unknown as AdminSupabaseClient;

    const result = await setEveKillSwitch({
      supabaseAdmin: client,
      identity: createAdminIdentity(),
      switchKey: "production_writes",
      enabled: true,
      expectedStateVersion: 1,
      reason: "Incident owner admin@example.com supplied Bearer secret-token.",
      auditId: "00000000-0000-4000-8000-000000000004",
    });

    expect(rpc).toHaveBeenCalledWith("set_eve_kill_switch", {
      p_switch_key: "production_writes",
      p_enabled: true,
      p_expected_state_version: 1,
      p_audit_id: "00000000-0000-4000-8000-000000000004",
      p_actor_id: "user_1",
      p_actor_profile_id: "00000000-0000-4000-8000-000000000002",
      p_actor_role: "admin",
      p_tenant_id: "00000000-0000-4000-8000-000000000003",
      p_initiator_type: "authenticated_admin",
      p_initiator_id: "user_1",
      p_reason: "Incident owner [redacted-email] supplied Bearer [redacted]",
    });
    expect(result).toEqual(
      expect.objectContaining({
        changed: true,
        switchKey: "production_writes",
        stateVersion: 2,
      }),
    );
  });

  it("rejects service and model-adjacent identities before persistence", async () => {
    const rpc = vi.fn();
    const insert = vi.fn().mockResolvedValue({ error: null });
    const client = {
      rpc,
      from: vi.fn().mockReturnValue({ insert }),
    } as unknown as AdminSupabaseClient;

    await expect(
      setEveKillSwitch({
        supabaseAdmin: client,
        identity: createServiceEveAuditIdentity({
          serviceId: "eve-runtime",
          initiatorId: "model-request",
          initiatorType: "system",
        }),
        switchKey: "all_automation",
        enabled: false,
        expectedStateVersion: 1,
      }),
    ).rejects.toThrow("eve_kill_switch_requires_admin_identity");
    expect(rpc).not.toHaveBeenCalled();
    expect(insert).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "kill_switch.actuation_rejected",
        target: "kill_switch:all_automation",
        result: "blocked",
        identity_mode: "service",
        change_summary: '{"stateChanged":false}',
      }),
    );
  });

  it("fails closed when the database rejects the atomic transition", async () => {
    const client = {
      rpc: vi.fn().mockResolvedValue({
        data: null,
        error: { message: "stale_eve_governance_state" },
      }),
    } as unknown as AdminSupabaseClient;

    await expect(
      setEveKillSwitch({
        supabaseAdmin: client,
        identity: createAdminIdentity(),
        switchKey: "active_runs",
        enabled: true,
        expectedStateVersion: 1,
      }),
    ).rejects.toMatchObject({
      status: 409,
      message: "Eve governance state changed. Refresh and retry deliberately.",
    });
  });
});
