import { describe, expect, it } from "vitest";

import {
  getCrmTablePreferences,
  saveCrmTenantRowActionDefault,
  saveCrmUserRowActionPin,
} from "../../../../../packages/api/src/admin/crm/table-preferences/service";

import type { AdminSupabaseClient } from "@asym/database/supabase/admin";

interface StubState {
  rowsByTable?: Record<string, Record<string, unknown> | null>;
}

function createSupabaseStub(state: StubState = {}) {
  const upserts: Array<{ table: string; payload: Record<string, unknown> }> =
    [];
  const inserts: Array<{ table: string; payload: Record<string, unknown> }> =
    [];

  const stub = {
    from(table: string) {
      const builder = {
        select() {
          return builder;
        },
        eq() {
          return builder;
        },
        async maybeSingle() {
          return { data: state.rowsByTable?.[table] ?? null, error: null };
        },
        upsert(payload: Record<string, unknown>) {
          upserts.push({ table, payload });
          return {
            select() {
              return {
                async single() {
                  return {
                    data: {
                      pinned_action_id: payload.pinned_action_id,
                      schema_version: payload.schema_version,
                    },
                    error: null,
                  };
                },
              };
            },
          };
        },
        insert(payload: Record<string, unknown>) {
          inserts.push({ table, payload });
          return Promise.resolve({ error: null });
        },
      };
      return builder;
    },
  };

  return {
    supabaseAdmin: stub as unknown as AdminSupabaseClient,
    upserts,
    inserts,
  };
}

describe("admin/crm/table-preferences/service", () => {
  it("loads user and tenant preference records as the server source of truth", async () => {
    const { supabaseAdmin } = createSupabaseStub({
      rowsByTable: {
        crm_table_user_preferences: {
          pinned_action_id: "amount_correction",
          schema_version: 1,
        },
        crm_table_tenant_defaults: {
          pinned_action_id: "resend_receipt",
          schema_version: 1,
        },
      },
    });

    const preferences = await getCrmTablePreferences({
      supabaseAdmin,
      tenantId: "tenant-1",
      profileId: "profile-1",
      tableId: "crm.giftHistory",
    });

    expect(preferences).toEqual({
      tableId: "crm.giftHistory",
      schemaVersion: 1,
      user: { actionId: "amount_correction", schemaVersion: 1 },
      tenantDefault: { actionId: "resend_receipt", schemaVersion: 1 },
    });
  });

  it("migrates renamed operation ids forward before persisting a pin", async () => {
    const { supabaseAdmin, upserts } = createSupabaseStub();

    const saved = await saveCrmUserRowActionPin({
      supabaseAdmin,
      tenantId: "tenant-1",
      profileId: "profile-1",
      tableId: "crm.giftHistory",
      pinnedActionId: "send_receipt",
    });

    expect(saved.actionId).toBe("resend_receipt");
    expect(upserts[0]?.payload).toMatchObject({
      tenant_id: "tenant-1",
      profile_id: "profile-1",
      table_id: "crm.giftHistory",
      pinned_action_id: "resend_receipt",
      schema_version: 1,
    });
  });

  it("rejects unknown operation ids instead of storing garbage", async () => {
    const { supabaseAdmin } = createSupabaseStub();

    await expect(
      saveCrmUserRowActionPin({
        supabaseAdmin,
        tenantId: "tenant-1",
        profileId: "profile-1",
        tableId: "crm.giftHistory",
        pinnedActionId: "made_up_operation",
      }),
    ).rejects.toMatchObject({ status: 400 });
  });

  it("audits tenant default changes with before/after snapshots", async () => {
    const { supabaseAdmin, inserts } = createSupabaseStub({
      rowsByTable: {
        crm_table_tenant_defaults: {
          pinned_action_id: "resend_receipt",
          schema_version: 1,
        },
      },
    });

    await saveCrmTenantRowActionDefault({
      supabaseAdmin,
      tenantId: "tenant-1",
      tableId: "crm.giftHistory",
      pinnedActionId: "fund_correction",
      actorProfileId: "admin-1",
    });

    expect(inserts).toHaveLength(1);
    expect(inserts[0]).toMatchObject({
      table: "crm_table_preference_audit_events",
      payload: {
        tenant_id: "tenant-1",
        actor_profile_id: "admin-1",
        table_id: "crm.giftHistory",
        scope: "tenant_default",
        before_snapshot: { pinnedActionId: "resend_receipt" },
        after_snapshot: { pinnedActionId: "fund_correction" },
      },
    });
  });
});
