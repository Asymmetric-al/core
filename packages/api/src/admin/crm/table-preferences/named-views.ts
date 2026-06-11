import {
  CRM_ROW_ACTION_SCHEMA_VERSION,
  migrateCrmRowActionId,
} from "./row-action";
import { ApiHttpError } from "../../../shared/http-errors";

import type { AdminSupabaseClient } from "@asym/database/supabase/admin";
import type { CrmNamedView, CrmViewSettingsLayer } from "@asym/database/types";

type SupabaseAdmin = AdminSupabaseClient;

/**
 * Named personal CRM views (issue #273, ADR-CD-021).
 *
 * Views are personal-only snapshots of gift-history view settings (columns,
 * filters/sort, pinned row action). One view per user/table can be the
 * default. No sharing, publishing, or team views exist here.
 */

interface NamedViewRow {
  id: string;
  name: string;
  is_default: boolean;
  schema_version: number | null;
  pinned_action_id: string | null;
  settings: CrmViewSettingsLayer | null;
}

const VIEW_COLUMNS =
  "id, name, is_default, schema_version, pinned_action_id, settings";

function mapViewRow(row: NamedViewRow): CrmNamedView {
  return {
    id: row.id,
    name: row.name,
    isDefault: row.is_default,
    schemaVersion: row.schema_version ?? CRM_ROW_ACTION_SCHEMA_VERSION,
    // Stored pins from older schema versions migrate forward on read.
    pinnedActionId: migrateCrmRowActionId(row.pinned_action_id),
    settings: row.settings ?? null,
  };
}

interface ViewScope {
  supabaseAdmin: SupabaseAdmin;
  tenantId: string;
  profileId: string;
  tableId: string;
}

export async function listCrmNamedViews(
  input: ViewScope,
): Promise<CrmNamedView[]> {
  const { data, error } = await input.supabaseAdmin
    .from("crm_table_named_views")
    .select(VIEW_COLUMNS)
    .eq("tenant_id", input.tenantId)
    .eq("profile_id", input.profileId)
    .eq("table_id", input.tableId)
    .order("name", { ascending: true });

  if (error) {
    throw new ApiHttpError(500, error.message);
  }

  return ((data ?? []) as NamedViewRow[]).map(mapViewRow);
}

async function clearDefaultViews(input: ViewScope): Promise<void> {
  const result = await input.supabaseAdmin
    .from("crm_table_named_views")
    .update({ is_default: false })
    .eq("tenant_id", input.tenantId)
    .eq("profile_id", input.profileId)
    .eq("table_id", input.tableId);

  if (result.error) {
    throw new ApiHttpError(500, result.error.message);
  }
}

export async function createCrmNamedView(
  input: ViewScope & {
    name: string;
    isDefault?: boolean;
    pinnedActionId?: string | null;
    settings?: CrmViewSettingsLayer | null;
  },
): Promise<CrmNamedView> {
  const name = input.name.trim();
  if (!name) {
    throw new ApiHttpError(400, "A view name is required.");
  }

  if (input.isDefault) {
    await clearDefaultViews(input);
  }

  const { data, error } = await input.supabaseAdmin
    .from("crm_table_named_views")
    .insert({
      tenant_id: input.tenantId,
      profile_id: input.profileId,
      table_id: input.tableId,
      name,
      is_default: input.isDefault ?? false,
      schema_version: CRM_ROW_ACTION_SCHEMA_VERSION,
      pinned_action_id: input.pinnedActionId ?? null,
      settings: input.settings ?? {},
    })
    .select(VIEW_COLUMNS)
    .single();

  if (error || !data) {
    throw new ApiHttpError(
      500,
      error?.message ?? "Failed to save the named view.",
    );
  }

  return mapViewRow(data as NamedViewRow);
}

export async function updateCrmNamedView(
  input: ViewScope & {
    viewId: string;
    name?: string;
    isDefault?: boolean;
    pinnedActionId?: string | null;
    settings?: CrmViewSettingsLayer | null;
  },
): Promise<void> {
  if (input.isDefault) {
    await clearDefaultViews(input);
  }

  const payload: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };
  if (input.name !== undefined) {
    const name = input.name.trim();
    if (!name) {
      throw new ApiHttpError(400, "A view name is required.");
    }
    payload.name = name;
  }
  if (input.isDefault !== undefined) {
    payload.is_default = input.isDefault;
  }
  if (input.pinnedActionId !== undefined) {
    payload.pinned_action_id = input.pinnedActionId;
  }
  if (input.settings !== undefined) {
    payload.settings = input.settings ?? {};
  }

  const result = await input.supabaseAdmin
    .from("crm_table_named_views")
    .update(payload)
    .eq("tenant_id", input.tenantId)
    .eq("profile_id", input.profileId)
    .eq("table_id", input.tableId)
    .eq("id", input.viewId);

  if (result.error) {
    throw new ApiHttpError(500, result.error.message);
  }
}

/**
 * Deletes a view. When the default view is deleted, the caller either
 * promotes a chosen replacement or the user falls back to the tenant/system
 * default (no named default remains).
 */
export async function deleteCrmNamedView(
  input: ViewScope & {
    viewId: string;
    nextDefaultViewId?: string | null;
  },
): Promise<void> {
  const result = await input.supabaseAdmin
    .from("crm_table_named_views")
    .delete()
    .eq("tenant_id", input.tenantId)
    .eq("profile_id", input.profileId)
    .eq("table_id", input.tableId)
    .eq("id", input.viewId);

  if (result.error) {
    throw new ApiHttpError(500, result.error.message);
  }

  if (input.nextDefaultViewId) {
    const promote = await input.supabaseAdmin
      .from("crm_table_named_views")
      .update({ is_default: true })
      .eq("tenant_id", input.tenantId)
      .eq("profile_id", input.profileId)
      .eq("table_id", input.tableId)
      .eq("id", input.nextDefaultViewId);

    if (promote.error) {
      throw new ApiHttpError(500, promote.error.message);
    }
  }
}
