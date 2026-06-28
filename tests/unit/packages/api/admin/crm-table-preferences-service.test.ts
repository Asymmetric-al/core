import { applyCrmViewSettingsPatch } from "@asym/database/types";
import { describe, expect, it } from "vitest";

import {
  getCrmTablePreferences,
  saveCrmTenantRowActionDefault,
  saveCrmTenantTableDefault,
  saveCrmUserRowActionPin,
  saveCrmUserTablePreference,
} from "../../../../../packages/api/src/admin/crm/table-preferences/service";

import type { AdminSupabaseClient } from "@asym/database/supabase/admin";

interface StubState {
  dropActiveViewBeforeUserPreferenceRpc?: boolean;
  namedViews?: Array<Record<string, unknown>>;
  rowsByTable?: Record<string, Record<string, unknown> | null>;
}

function delegatedManagerProfileIds(
  row: Record<string, unknown> | null,
): string[] {
  const settings = row?.settings;
  if (typeof settings !== "object" || settings === null) {
    return [];
  }

  const value = (settings as Record<string, unknown>)
    .delegatedManagerProfileIds;
  return Array.isArray(value)
    ? value.filter((entry): entry is string => typeof entry === "string")
    : [];
}

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function createSupabaseStub(state: StubState = {}) {
  const namedViews = [...(state.namedViews ?? [])];
  const rowsByTable = { ...(state.rowsByTable ?? {}) };
  const upserts: Array<{ table: string; payload: Record<string, unknown> }> =
    [];
  const inserts: Array<{ table: string; payload: Record<string, unknown> }> =
    [];
  const rpcCalls: Array<{
    name: string;
    params: Record<string, unknown>;
  }> = [];
  const auditEvents: Array<Record<string, unknown>> = [];

  const stub = {
    async rpc(name: string, params: Record<string, unknown>) {
      rpcCalls.push({ name, params });

      if (name === "save_crm_user_table_preference") {
        const existing = rowsByTable.crm_table_user_preferences ?? null;
        const settingsPatch =
          (params.p_settings_patch as Record<string, unknown>) ?? {};
        const activeViewId = settingsPatch.activeViewId;

        if (typeof activeViewId === "string") {
          if (!uuidPattern.test(activeViewId)) {
            return {
              data: null,
              error: {
                code: "22023",
                message: "Active named view id must be a UUID.",
              },
            };
          }

          if (state.dropActiveViewBeforeUserPreferenceRpc) {
            namedViews.length = 0;
          }

          const activeViewExists = namedViews.some(
            (row) =>
              row.id === activeViewId &&
              row.tenant_id === params.p_tenant_id &&
              row.profile_id === params.p_profile_id &&
              row.table_id === params.p_table_id,
          );

          if (!activeViewExists) {
            return {
              data: null,
              error: {
                code: "P0002",
                message: "Active named view not found.",
              },
            };
          }
        }

        const settings = applyCrmViewSettingsPatch(
          (existing?.settings as Record<string, unknown> | null) ?? null,
          settingsPatch,
        );
        const row = {
          pinned_action_id:
            params.p_pinned_action_id_is_set === true
              ? params.p_pinned_action_id
              : (existing?.pinned_action_id ?? null),
          schema_version: params.p_schema_version,
          settings,
        };
        rowsByTable.crm_table_user_preferences = row;

        return { data: row, error: null };
      }

      if (name === "save_crm_tenant_table_default") {
        const existing = rowsByTable.crm_table_tenant_defaults ?? null;
        const settingsPatch =
          (params.p_settings_patch as Record<string, unknown>) ?? {};
        const actorCanManageDefaults =
          params.p_actor_can_manage_defaults === true;
        const actorProfileId =
          typeof params.p_actor_profile_id === "string"
            ? params.p_actor_profile_id
            : null;

        if (!actorCanManageDefaults) {
          if (
            Object.prototype.hasOwnProperty.call(
              settingsPatch,
              "delegatedManagerProfileIds",
            )
          ) {
            return {
              data: null,
              error: {
                code: "42501",
                message:
                  "Forbidden: only super admins can change delegated default managers.",
              },
            };
          }

          const delegatedIds = delegatedManagerProfileIds(existing);
          if (!actorProfileId || !delegatedIds.includes(actorProfileId)) {
            return {
              data: null,
              error: {
                code: "42501",
                message:
                  "Forbidden: requires crm.gift_history.manage_view_defaults",
              },
            };
          }
        }

        const settings = applyCrmViewSettingsPatch(
          (existing?.settings as Record<string, unknown> | null) ?? null,
          settingsPatch,
        );
        const row = {
          pinned_action_id:
            params.p_pinned_action_id_is_set === true
              ? params.p_pinned_action_id
              : (existing?.pinned_action_id ?? null),
          schema_version: params.p_schema_version,
          settings,
        };
        rowsByTable.crm_table_tenant_defaults = row;
        auditEvents.push({
          tenant_id: params.p_tenant_id,
          actor_profile_id: params.p_actor_profile_id,
          table_id: params.p_table_id,
          before_snapshot: {
            pinnedActionId: existing?.pinned_action_id ?? null,
            settings: existing?.settings ?? null,
          },
          after_snapshot: {
            pinnedActionId: row.pinned_action_id,
            settings,
          },
        });

        return { data: row, error: null };
      }

      throw new Error(`Unexpected RPC: ${name}`);
    },
    from(table: string) {
      const filters: Record<string, unknown> = {};
      const builder = {
        select() {
          return builder;
        },
        eq(column: string, value: unknown) {
          filters[column] = value;
          return builder;
        },
        async maybeSingle() {
          if (table === "crm_table_named_views") {
            const match =
              namedViews.find((row) =>
                Object.entries(filters).every(
                  ([column, value]) => row[column] === value,
                ),
              ) ?? null;

            return { data: match, error: null };
          }

          return { data: rowsByTable[table] ?? null, error: null };
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
    auditEvents,
    namedViews,
    upserts,
    inserts,
    rpcCalls,
    rowsByTable,
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
      user: { actionId: "amount_correction", schemaVersion: 1, settings: null },
      tenantDefault: {
        actionId: "resend_receipt",
        schemaVersion: 1,
        settings: null,
      },
    });
  });

  it("migrates renamed operation ids forward before persisting a pin", async () => {
    const { rpcCalls, supabaseAdmin } = createSupabaseStub();

    const saved = await saveCrmUserRowActionPin({
      supabaseAdmin,
      tenantId: "tenant-1",
      profileId: "profile-1",
      tableId: "crm.giftHistory",
      pinnedActionId: "send_receipt",
    });

    expect(saved.actionId).toBe("resend_receipt");
    expect(rpcCalls[0]).toMatchObject({
      name: "save_crm_user_table_preference",
      params: {
        p_tenant_id: "tenant-1",
        p_profile_id: "profile-1",
        p_table_id: "crm.giftHistory",
        p_pinned_action_id: "resend_receipt",
        p_pinned_action_id_is_set: true,
        p_schema_version: 1,
      },
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

  it("persists view-settings scopes and clears them on scoped reset", async () => {
    const { rowsByTable, rpcCalls, supabaseAdmin } = createSupabaseStub({
      rowsByTable: {
        crm_table_user_preferences: {
          pinned_action_id: "amount_correction",
          schema_version: 1,
          settings: {
            columns: { designation: false },
            filtersSort: { sortDirection: "asc" },
          },
        },
      },
    });

    // Update one scope; the other scope and the pin stay untouched.
    await saveCrmUserTablePreference({
      supabaseAdmin,
      tenantId: "tenant-1",
      profileId: "profile-1",
      tableId: "crm.giftHistory",
      settingsPatch: { columns: { designation: true, statusLine: false } },
    });
    expect(rpcCalls[0]).toMatchObject({
      name: "save_crm_user_table_preference",
      params: {
        p_pinned_action_id: null,
        p_pinned_action_id_is_set: false,
        p_settings_patch: {
          columns: { designation: true, statusLine: false },
        },
      },
    });
    expect(savedSettings(rowsByTable, "crm_table_user_preferences")).toEqual({
      columns: { designation: true, statusLine: false },
      filtersSort: { sortDirection: "asc" },
    });

    // Scoped reset (null) removes only the selected scope.
    await saveCrmUserTablePreference({
      supabaseAdmin,
      tenantId: "tenant-1",
      profileId: "profile-1",
      tableId: "crm.giftHistory",
      settingsPatch: { filtersSort: null },
    });
    expect(savedSettings(rowsByTable, "crm_table_user_preferences")).toEqual({
      columns: { designation: true, statusLine: false },
    });
  });

  it("lets the save RPC validate active named views atomically", async () => {
    const activeViewId = "9f4d1a80-a772-4df3-b3d0-9f8a89301bb8";
    const { rowsByTable, rpcCalls, supabaseAdmin } = createSupabaseStub({
      namedViews: [
        {
          id: activeViewId,
          tenant_id: "tenant-1",
          profile_id: "profile-1",
          table_id: "crm.giftHistory",
        },
      ],
    });

    await saveCrmUserTablePreference({
      supabaseAdmin,
      tenantId: "tenant-1",
      profileId: "profile-1",
      tableId: "crm.giftHistory",
      settingsPatch: { activeViewId },
    });

    expect(rpcCalls[0]).toMatchObject({
      name: "save_crm_user_table_preference",
      params: {
        p_settings_patch: { activeViewId },
      },
    });
    expect(savedSettings(rowsByTable, "crm_table_user_preferences")).toEqual({
      activeViewId,
    });
  });

  it("rejects orphan active named views returned by the save RPC", async () => {
    const { rpcCalls, supabaseAdmin } = createSupabaseStub();

    await expect(
      saveCrmUserTablePreference({
        supabaseAdmin,
        tenantId: "tenant-1",
        profileId: "profile-1",
        tableId: "crm.giftHistory",
        settingsPatch: {
          activeViewId: "bcb23c24-76a1-49be-96fa-a75db164e3d5",
        },
      }),
    ).rejects.toMatchObject({
      status: 404,
      message: "Active named view not found.",
    });
    expect(rpcCalls).toHaveLength(1);
  });

  it("rejects active named views deleted before the save RPC validates them", async () => {
    const activeViewId = "9f4d1a80-a772-4df3-b3d0-9f8a89301bb8";
    const { rpcCalls, supabaseAdmin } = createSupabaseStub({
      dropActiveViewBeforeUserPreferenceRpc: true,
      namedViews: [
        {
          id: activeViewId,
          tenant_id: "tenant-1",
          profile_id: "profile-1",
          table_id: "crm.giftHistory",
        },
      ],
    });

    await expect(
      saveCrmUserTablePreference({
        supabaseAdmin,
        tenantId: "tenant-1",
        profileId: "profile-1",
        tableId: "crm.giftHistory",
        settingsPatch: { activeViewId },
      }),
    ).rejects.toMatchObject({
      status: 404,
      message: "Active named view not found.",
    });
    expect(rpcCalls).toHaveLength(1);
  });

  it("rejects malformed active named view ids returned by the save RPC", async () => {
    const { rpcCalls, supabaseAdmin } = createSupabaseStub();

    await expect(
      saveCrmUserTablePreference({
        supabaseAdmin,
        tenantId: "tenant-1",
        profileId: "profile-1",
        tableId: "crm.giftHistory",
        settingsPatch: { activeViewId: "not-a-uuid" },
      }),
    ).rejects.toMatchObject({
      status: 400,
      message: "Active named view id must be a UUID.",
    });
    expect(rpcCalls).toHaveLength(1);
  });

  it("stores delegated default managers on the tenant default record", async () => {
    const { rowsByTable, rpcCalls, supabaseAdmin } = createSupabaseStub();

    await saveCrmTenantTableDefault({
      supabaseAdmin,
      tenantId: "tenant-1",
      tableId: "crm.giftHistory",
      actorProfileId: "super-admin-1",
      actorCanManageDefaults: true,
      settingsPatch: { delegatedManagerProfileIds: ["lead-1", "lead-2"] },
    });

    expect(rpcCalls[0]).toMatchObject({
      name: "save_crm_tenant_table_default",
      params: {
        p_actor_profile_id: "super-admin-1",
        p_actor_can_manage_defaults: true,
        p_settings_patch: {
          delegatedManagerProfileIds: ["lead-1", "lead-2"],
        },
      },
    });
    expect(savedSettings(rowsByTable, "crm_table_tenant_defaults")).toEqual({
      delegatedManagerProfileIds: ["lead-1", "lead-2"],
    });
  });

  it("delegates tenant default changes and audit to one atomic RPC", async () => {
    const { auditEvents, rpcCalls, supabaseAdmin } = createSupabaseStub({
      rowsByTable: {
        crm_table_tenant_defaults: {
          pinned_action_id: "resend_receipt",
          schema_version: 1,
          settings: {
            delegatedManagerProfileIds: ["admin-1"],
          },
        },
      },
    });

    await saveCrmTenantRowActionDefault({
      supabaseAdmin,
      tenantId: "tenant-1",
      tableId: "crm.giftHistory",
      pinnedActionId: "fund_correction",
      actorCanManageDefaults: false,
      actorProfileId: "admin-1",
    });

    expect(rpcCalls[0]).toMatchObject({
      name: "save_crm_tenant_table_default",
      params: {
        p_pinned_action_id: "fund_correction",
        p_pinned_action_id_is_set: true,
        p_actor_profile_id: "admin-1",
        p_actor_can_manage_defaults: false,
      },
    });
    expect(auditEvents).toHaveLength(1);
    expect(auditEvents[0]).toMatchObject({
      tenant_id: "tenant-1",
      actor_profile_id: "admin-1",
      table_id: "crm.giftHistory",
      before_snapshot: { pinnedActionId: "resend_receipt" },
      after_snapshot: { pinnedActionId: "fund_correction" },
    });
  });

  it("rejects stale delegated tenant default writes inside the RPC", async () => {
    const { auditEvents, supabaseAdmin } = createSupabaseStub({
      rowsByTable: {
        crm_table_tenant_defaults: {
          pinned_action_id: "resend_receipt",
          schema_version: 1,
          settings: {
            delegatedManagerProfileIds: ["other-manager"],
          },
        },
      },
    });

    await expect(
      saveCrmTenantRowActionDefault({
        supabaseAdmin,
        tenantId: "tenant-1",
        tableId: "crm.giftHistory",
        pinnedActionId: "fund_correction",
        actorCanManageDefaults: false,
        actorProfileId: "admin-1",
      }),
    ).rejects.toMatchObject({
      status: 403,
      message: "Forbidden: requires crm.gift_history.manage_view_defaults",
    });
    expect(auditEvents).toHaveLength(0);
  });

  it("keeps delegate-list edits restricted to global tenant-default managers", async () => {
    const { auditEvents, supabaseAdmin } = createSupabaseStub({
      rowsByTable: {
        crm_table_tenant_defaults: {
          pinned_action_id: "resend_receipt",
          schema_version: 1,
          settings: {
            delegatedManagerProfileIds: ["admin-1"],
          },
        },
      },
    });

    await expect(
      saveCrmTenantTableDefault({
        supabaseAdmin,
        tenantId: "tenant-1",
        tableId: "crm.giftHistory",
        actorCanManageDefaults: false,
        actorProfileId: "admin-1",
        settingsPatch: { delegatedManagerProfileIds: ["admin-2"] },
      }),
    ).rejects.toMatchObject({
      status: 403,
      message:
        "Forbidden: only super admins can change delegated default managers.",
    });
    expect(auditEvents).toHaveLength(0);
  });
});

function savedSettings(
  rowsByTable: Record<string, Record<string, unknown> | null>,
  table: string,
): Record<string, unknown> | null {
  const row = rowsByTable[table];

  return (row?.settings as Record<string, unknown> | null | undefined) ?? null;
}
