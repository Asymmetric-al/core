import { describe, expect, it } from "vitest";
import { applyCrmViewSettingsPatch } from "@asym/database/types";

import {
  createCrmNamedView,
  deleteCrmNamedView,
  listCrmNamedViews,
  updateCrmNamedView,
} from "../../../../../packages/api/src/admin/crm/table-preferences/named-views";

import type { AdminSupabaseClient } from "@asym/database/supabase/admin";

interface ViewRow {
  id: string;
  name: string;
  is_default: boolean;
  schema_version: number;
  pinned_action_id: string | null;
  settings: Record<string, unknown> | null;
}

function createSupabaseStub(initialRows: ViewRow[] = []) {
  const rows = [...initialRows];
  const updates: Array<{
    payload: Record<string, unknown>;
    filters: Record<string, unknown>;
  }> = [];
  const deletes: Array<Record<string, unknown>> = [];
  const rpcCalls: Array<{
    name: string;
    params: Record<string, unknown>;
  }> = [];

  function applyFilters(
    candidates: ViewRow[],
    filters: Record<string, unknown>,
  ) {
    return candidates.filter((row) =>
      Object.entries(filters).every(([key, value]) =>
        key === "id" ? row.id === value : true,
      ),
    );
  }

  const stub = {
    async rpc(name: string, params: Record<string, unknown>) {
      rpcCalls.push({ name, params });

      if (name === "create_crm_table_named_view") {
        if (rows.some((row) => row.name === params.p_name)) {
          return {
            data: null,
            error: {
              code: "23505",
              message: "duplicate key value violates unique constraint",
            },
          };
        }

        if (params.p_is_default === true) {
          for (const row of rows) {
            row.is_default = false;
          }
        }

        const row: ViewRow = {
          id: `view-${rows.length + 1}`,
          name: String(params.p_name),
          is_default: params.p_is_default === true,
          schema_version: Number(params.p_schema_version ?? 1),
          pinned_action_id:
            (params.p_pinned_action_id as string | null) ?? null,
          settings: (params.p_settings as Record<string, unknown>) ?? null,
        };
        rows.push(row);

        return { data: row, error: null };
      }

      if (name === "update_crm_table_named_view") {
        const row = rows.find((candidate) => candidate.id === params.p_view_id);
        if (!row) {
          return { data: null, error: null };
        }

        if (
          params.p_is_default_is_set === true &&
          params.p_is_default === true
        ) {
          for (const candidate of rows) {
            if (candidate.id !== row.id) {
              candidate.is_default = false;
            }
          }
        }

        if (params.p_name_is_set === true) {
          if (
            rows.some(
              (candidate) =>
                candidate.id !== row.id && candidate.name === params.p_name,
            )
          ) {
            return {
              data: null,
              error: {
                code: "23505",
                message: "duplicate key value violates unique constraint",
              },
            };
          }

          row.name = String(params.p_name);
        }
        if (params.p_is_default_is_set === true) {
          row.is_default = params.p_is_default === true;
        }
        if (params.p_pinned_action_id_is_set === true) {
          row.schema_version = Number(params.p_schema_version ?? 1);
          row.pinned_action_id =
            (params.p_pinned_action_id as string | null) ?? null;
        }
        if (params.p_settings_is_set === true) {
          row.settings = applyCrmViewSettingsPatch(
            row.settings,
            (params.p_settings as Record<string, unknown>) ?? {},
          );
        }

        return { data: row, error: null };
      }

      if (name === "delete_crm_table_named_view") {
        const viewId = String(params.p_view_id);
        const nextDefaultViewId =
          typeof params.p_next_default_view_id === "string"
            ? params.p_next_default_view_id
            : null;
        const rowIndex = rows.findIndex((row) => row.id === viewId);
        if (rowIndex < 0) {
          return {
            data: { deleted: false, reason: "view_not_found" },
            error: null,
          };
        }

        if (nextDefaultViewId) {
          const nextDefault = rows.find((row) => row.id === nextDefaultViewId);
          if (!nextDefault || nextDefault.id === viewId) {
            return {
              data: { deleted: false, reason: "next_default_not_found" },
              error: null,
            };
          }
        }

        const deletedRow = rows[rowIndex];
        rows.splice(rowIndex, 1);
        const shouldPromoteDefault =
          nextDefaultViewId !== null && deletedRow?.is_default === true;
        if (shouldPromoteDefault) {
          for (const row of rows) {
            row.is_default = row.id === nextDefaultViewId;
          }
        }

        return {
          data: { deleted: true, promoted: shouldPromoteDefault },
          error: null,
        };
      }

      throw new Error(`Unexpected RPC: ${name}`);
    },
    from(_table: string) {
      const filters: Record<string, unknown> = {};
      const builder = {
        select() {
          return builder;
        },
        eq(column: string, value: unknown) {
          filters[column] = value;
          return builder;
        },
        order() {
          return builder;
        },
        insert(payload: Record<string, unknown>) {
          const row: ViewRow = {
            id: `view-${rows.length + 1}`,
            name: String(payload.name),
            is_default: Boolean(payload.is_default),
            schema_version: Number(payload.schema_version),
            pinned_action_id:
              (payload.pinned_action_id as string | null) ?? null,
            settings: (payload.settings as Record<string, unknown>) ?? null,
          };
          rows.push(row);
          return {
            select() {
              return {
                async single() {
                  return {
                    data: row,
                    error: null,
                  };
                },
              };
            },
          };
        },
        update(payload: Record<string, unknown>) {
          const updateBuilder = {
            eq(column: string, value: unknown) {
              filters[column] = value;
              return updateBuilder;
            },
            then(resolve: (result: { error: null }) => void) {
              updates.push({ payload, filters: { ...filters } });
              for (const row of applyFilters(rows, filters)) {
                if (payload.is_default !== undefined) {
                  row.is_default = Boolean(payload.is_default);
                }
                if (payload.name !== undefined) {
                  row.name = String(payload.name);
                }
                if (payload.pinned_action_id !== undefined) {
                  row.pinned_action_id = payload.pinned_action_id as
                    | string
                    | null;
                }
                if (payload.settings !== undefined) {
                  row.settings = payload.settings as Record<string, unknown>;
                }
              }
              resolve({ error: null });
            },
          };
          return updateBuilder;
        },
        delete() {
          const deleteBuilder = {
            eq(column: string, value: unknown) {
              filters[column] = value;
              return deleteBuilder;
            },
            then(resolve: (result: { error: null }) => void) {
              deletes.push({ ...filters });
              const remaining = rows.filter(
                (row) => !(filters.id && row.id === filters.id),
              );
              rows.length = 0;
              rows.push(...remaining);
              resolve({ error: null });
            },
          };
          return deleteBuilder;
        },
        async maybeSingle() {
          const match = applyFilters(rows, filters)[0] ?? null;
          return { data: match, error: null };
        },
        then(resolve: (result: { data: ViewRow[]; error: null }) => void) {
          resolve({ data: applyFilters(rows, filters), error: null });
        },
      };
      return builder;
    },
  };

  return {
    supabaseAdmin: stub as unknown as AdminSupabaseClient,
    rows,
    updates,
    deletes,
    rpcCalls,
  };
}

const SCOPE = {
  tenantId: "tenant-1",
  profileId: "profile-1",
  tableId: "crm.giftHistory",
};

describe("admin/crm/table-preferences/named-views", () => {
  it("migrates renamed pinned operation ids when listing views", async () => {
    const { supabaseAdmin } = createSupabaseStub([
      {
        id: "view-1",
        name: "Receipts",
        is_default: true,
        schema_version: 0,
        pinned_action_id: "send_receipt",
        settings: { columns: { designation: false } },
      },
    ]);

    const views = await listCrmNamedViews({ supabaseAdmin, ...SCOPE });

    expect(views).toEqual([
      {
        id: "view-1",
        name: "Receipts",
        isDefault: true,
        schemaVersion: 0,
        pinnedActionId: "resend_receipt",
        settings: { columns: { designation: false } },
      },
    ]);
  });

  it("creating a default view clears the previous default", async () => {
    const { rpcCalls, supabaseAdmin, rows } = createSupabaseStub([
      {
        id: "view-1",
        name: "Old default",
        is_default: true,
        schema_version: 1,
        pinned_action_id: null,
        settings: null,
      },
    ]);

    const created = await createCrmNamedView({
      supabaseAdmin,
      ...SCOPE,
      name: "New default",
      isDefault: true,
      pinnedActionId: "resend_receipt",
      settings: { filtersSort: { sortDirection: "asc" } },
    });

    expect(created.isDefault).toBe(true);
    expect(rpcCalls).toHaveLength(1);
    expect(rpcCalls[0]?.name).toBe("create_crm_table_named_view");
    expect(rpcCalls[0]?.params).toMatchObject({
      p_is_default: true,
      p_pinned_action_id: "resend_receipt",
    });
    expect(rows.find((row) => row.id === "view-1")?.is_default).toBe(false);
  });

  it("normalizes renamed pinned operation ids before saving views", async () => {
    const { rpcCalls, supabaseAdmin } = createSupabaseStub();

    const created = await createCrmNamedView({
      supabaseAdmin,
      ...SCOPE,
      name: "Receipts",
      pinnedActionId: "send_receipt",
    });

    expect(created.pinnedActionId).toBe("resend_receipt");
    expect(rpcCalls[0]?.params.p_pinned_action_id).toBe("resend_receipt");
  });

  it("rejects unknown pinned operation ids before saving views", async () => {
    const { rpcCalls, supabaseAdmin } = createSupabaseStub();

    await expect(
      createCrmNamedView({
        supabaseAdmin,
        ...SCOPE,
        name: "Receipts",
        pinnedActionId: "unknown_action",
      }),
    ).rejects.toMatchObject({
      status: 400,
      message: 'Unknown operation id "unknown_action".',
    });
    expect(rpcCalls).toHaveLength(0);
  });

  it("maps duplicate named view creates to conflict responses", async () => {
    const { supabaseAdmin } = createSupabaseStub([
      {
        id: "view-1",
        name: "Receipts",
        is_default: false,
        schema_version: 1,
        pinned_action_id: null,
        settings: null,
      },
    ]);

    await expect(
      createCrmNamedView({
        supabaseAdmin,
        ...SCOPE,
        name: "Receipts",
      }),
    ).rejects.toMatchObject({
      status: 409,
      message: "A named view with this name already exists.",
    });
  });

  it("set-default through update clears other defaults first", async () => {
    const { rpcCalls, supabaseAdmin, rows } = createSupabaseStub([
      {
        id: "view-1",
        name: "A",
        is_default: true,
        schema_version: 1,
        pinned_action_id: null,
        settings: null,
      },
      {
        id: "view-2",
        name: "B",
        is_default: false,
        schema_version: 1,
        pinned_action_id: null,
        settings: null,
      },
    ]);

    await updateCrmNamedView({
      supabaseAdmin,
      ...SCOPE,
      viewId: "view-2",
      isDefault: true,
    });

    expect(rows.find((row) => row.id === "view-1")?.is_default).toBe(false);
    expect(rows.find((row) => row.id === "view-2")?.is_default).toBe(true);
    expect(rpcCalls.at(-1)?.name).toBe("update_crm_table_named_view");
    expect(rpcCalls.at(-1)?.params).toMatchObject({
      p_view_id: "view-2",
      p_is_default: true,
      p_is_default_is_set: true,
    });
  });

  it("returns 404 when updating a missing named view", async () => {
    const { supabaseAdmin } = createSupabaseStub();

    await expect(
      updateCrmNamedView({
        supabaseAdmin,
        ...SCOPE,
        viewId: "missing-view",
        name: "Does not exist",
      }),
    ).rejects.toMatchObject({
      status: 404,
      message: "Named view not found.",
    });
  });

  it("maps duplicate named view updates to conflict responses", async () => {
    const { supabaseAdmin } = createSupabaseStub([
      {
        id: "view-1",
        name: "Receipts",
        is_default: false,
        schema_version: 1,
        pinned_action_id: null,
        settings: null,
      },
      {
        id: "view-2",
        name: "Corrections",
        is_default: false,
        schema_version: 1,
        pinned_action_id: null,
        settings: null,
      },
    ]);

    await expect(
      updateCrmNamedView({
        supabaseAdmin,
        ...SCOPE,
        viewId: "view-2",
        name: "Receipts",
      }),
    ).rejects.toMatchObject({
      status: 409,
      message: "A named view with this name already exists.",
    });
  });

  it("merges partial settings updates without wiping sibling scopes", async () => {
    const { supabaseAdmin, rows } = createSupabaseStub([
      {
        id: "view-1",
        name: "Receipts",
        is_default: false,
        schema_version: 1,
        pinned_action_id: null,
        settings: {
          columns: { designation: false },
          filtersSort: { sortDirection: "asc" },
        },
      },
    ]);

    const updated = await updateCrmNamedView({
      supabaseAdmin,
      ...SCOPE,
      viewId: "view-1",
      settings: { columns: { statusLine: false } },
    });

    const expectedSettings = {
      columns: { statusLine: false },
      filtersSort: { sortDirection: "asc" },
    };
    expect(rows[0]?.settings).toEqual(expectedSettings);
    expect(updated.settings).toEqual(expectedSettings);
  });

  it("applies null settings updates as scoped resets", async () => {
    const { supabaseAdmin, rows } = createSupabaseStub([
      {
        id: "view-1",
        name: "Receipts",
        is_default: false,
        schema_version: 1,
        pinned_action_id: null,
        settings: {
          columns: { designation: false },
          filtersSort: { sortDirection: "asc" },
        },
      },
    ]);

    await updateCrmNamedView({
      supabaseAdmin,
      ...SCOPE,
      viewId: "view-1",
      settings: { columns: null },
    });

    expect(rows[0]?.settings).toEqual({
      filtersSort: { sortDirection: "asc" },
    });
  });

  it("deleting the default view can promote a chosen replacement", async () => {
    const { supabaseAdmin, rows } = createSupabaseStub([
      {
        id: "view-1",
        name: "Default",
        is_default: true,
        schema_version: 1,
        pinned_action_id: null,
        settings: null,
      },
      {
        id: "view-2",
        name: "Other",
        is_default: false,
        schema_version: 1,
        pinned_action_id: null,
        settings: null,
      },
    ]);

    await deleteCrmNamedView({
      supabaseAdmin,
      ...SCOPE,
      viewId: "view-1",
      nextDefaultViewId: "view-2",
    });

    expect(rows.map((row) => row.id)).toEqual(["view-2"]);
    expect(rows[0]?.is_default).toBe(true);
  });

  it("does not promote a replacement when deleting a non-default view", async () => {
    const { supabaseAdmin, rows } = createSupabaseStub([
      {
        id: "view-1",
        name: "Default",
        is_default: true,
        schema_version: 1,
        pinned_action_id: null,
        settings: null,
      },
      {
        id: "view-2",
        name: "Replacement",
        is_default: false,
        schema_version: 1,
        pinned_action_id: null,
        settings: null,
      },
      {
        id: "view-3",
        name: "Deleted",
        is_default: false,
        schema_version: 1,
        pinned_action_id: null,
        settings: null,
      },
    ]);

    await deleteCrmNamedView({
      supabaseAdmin,
      ...SCOPE,
      viewId: "view-3",
      nextDefaultViewId: "view-2",
    });

    expect(rows.map((row) => row.id)).toEqual(["view-1", "view-2"]);
    expect(rows.find((row) => row.id === "view-1")?.is_default).toBe(true);
    expect(rows.find((row) => row.id === "view-2")?.is_default).toBe(false);
  });

  it("keeps the deleted view when the replacement default is missing", async () => {
    const { supabaseAdmin, rows } = createSupabaseStub([
      {
        id: "view-1",
        name: "Default",
        is_default: true,
        schema_version: 1,
        pinned_action_id: null,
        settings: null,
      },
      {
        id: "view-2",
        name: "Other",
        is_default: false,
        schema_version: 1,
        pinned_action_id: null,
        settings: null,
      },
    ]);

    await expect(
      deleteCrmNamedView({
        supabaseAdmin,
        ...SCOPE,
        viewId: "view-1",
        nextDefaultViewId: "missing-view",
      }),
    ).rejects.toMatchObject({
      status: 404,
      message: "Replacement default view not found.",
    });

    expect(rows.map((row) => row.id)).toEqual(["view-1", "view-2"]);
    expect(rows.find((row) => row.id === "view-1")?.is_default).toBe(true);
    expect(rows.find((row) => row.id === "view-2")?.is_default).toBe(false);
  });

  it("deleting the default without a replacement leaves no default (tenant/system fallback)", async () => {
    const { supabaseAdmin, rows } = createSupabaseStub([
      {
        id: "view-1",
        name: "Default",
        is_default: true,
        schema_version: 1,
        pinned_action_id: null,
        settings: null,
      },
      {
        id: "view-2",
        name: "Other",
        is_default: false,
        schema_version: 1,
        pinned_action_id: null,
        settings: null,
      },
    ]);

    await deleteCrmNamedView({
      supabaseAdmin,
      ...SCOPE,
      viewId: "view-1",
    });

    expect(rows.map((row) => row.id)).toEqual(["view-2"]);
    expect(rows.some((row) => row.is_default)).toBe(false);
  });
});
