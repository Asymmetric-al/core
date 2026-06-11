import { describe, expect, it } from "vitest";

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
    const { supabaseAdmin, rows } = createSupabaseStub([
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
    expect(rows.find((row) => row.id === "view-1")?.is_default).toBe(false);
  });

  it("set-default through update clears other defaults first", async () => {
    const { supabaseAdmin, rows } = createSupabaseStub([
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
