import { applyCrmViewSettingsPatch } from "@asym/database/types";

import {
  CRM_ROW_ACTION_SCHEMA_VERSION,
  migrateCrmRowActionId,
  normalizeCrmPinnedActionId,
} from "./row-action";
import { ApiHttpError } from "../../../shared/http-errors";
import { isRecord } from "../../../shared/json-coerce";

import type { AdminSupabaseClient } from "@asym/database/supabase/admin";
import type {
  CrmNamedView,
  CrmViewSettingsLayer,
  CrmViewSettingsPatch,
} from "@asym/database/types";

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

function firstRpcValue(data: unknown): unknown {
  return Array.isArray(data) ? data[0] : data;
}

function readNamedViewRpcRow(data: unknown): NamedViewRow | null {
  const row = firstRpcValue(data);
  if (!isRecord(row) || typeof row.id !== "string") {
    return null;
  }

  return row as unknown as NamedViewRow;
}

function isUniqueViolationError(error: unknown): boolean {
  return isRecord(error) && error.code === "23505";
}

function readDeleteRpcResult(data: unknown): {
  deleted: boolean;
  reason: string | null;
} {
  const result = firstRpcValue(data);
  if (!isRecord(result)) {
    return { deleted: false, reason: null };
  }

  return {
    deleted: result.deleted === true,
    reason: typeof result.reason === "string" ? result.reason : null,
  };
}

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

export async function createCrmNamedView(
  input: ViewScope & {
    name: string;
    isDefault?: boolean;
    pinnedActionId?: string | null;
    settings?: CrmViewSettingsPatch | null;
  },
): Promise<CrmNamedView> {
  const name = input.name.trim();
  if (!name) {
    throw new ApiHttpError(400, "A view name is required.");
  }

  const pinnedActionId =
    input.pinnedActionId === undefined
      ? null
      : normalizeCrmPinnedActionId(input.pinnedActionId);
  const settings = applyCrmViewSettingsPatch(null, input.settings ?? {});
  const { data, error } = await input.supabaseAdmin.rpc(
    "create_crm_table_named_view",
    {
      p_tenant_id: input.tenantId,
      p_profile_id: input.profileId,
      p_table_id: input.tableId,
      p_name: name,
      p_is_default: input.isDefault ?? false,
      p_schema_version: CRM_ROW_ACTION_SCHEMA_VERSION,
      p_pinned_action_id: pinnedActionId,
      p_settings: settings,
    },
  );
  const row = readNamedViewRpcRow(data);

  if (isUniqueViolationError(error)) {
    throw new ApiHttpError(409, "A named view with this name already exists.");
  }

  if (error || !row) {
    throw new ApiHttpError(
      500,
      error?.message ?? "Failed to save the named view.",
    );
  }

  return mapViewRow(row);
}

export async function updateCrmNamedView(
  input: ViewScope & {
    viewId: string;
    name?: string;
    isDefault?: boolean;
    pinnedActionId?: string | null;
    settings?: CrmViewSettingsPatch | null;
  },
): Promise<CrmNamedView> {
  const nameIsSet = input.name !== undefined;
  let name: string | null = null;
  if (input.name !== undefined) {
    name = input.name.trim();
    if (!name) {
      throw new ApiHttpError(400, "A view name is required.");
    }
  }

  const pinnedActionIdIsSet = input.pinnedActionId !== undefined;
  let pinnedActionId: string | null = null;
  if (input.pinnedActionId !== undefined) {
    pinnedActionId = normalizeCrmPinnedActionId(input.pinnedActionId);
  }

  const settingsIsSet = input.settings !== undefined;
  const settings = settingsIsSet ? (input.settings ?? {}) : null;

  const { data, error } = await input.supabaseAdmin.rpc(
    "update_crm_table_named_view",
    {
      p_tenant_id: input.tenantId,
      p_profile_id: input.profileId,
      p_table_id: input.tableId,
      p_view_id: input.viewId,
      p_name: name,
      p_name_is_set: nameIsSet,
      p_is_default: input.isDefault ?? null,
      p_is_default_is_set: input.isDefault !== undefined,
      p_schema_version: CRM_ROW_ACTION_SCHEMA_VERSION,
      p_pinned_action_id: pinnedActionId,
      p_pinned_action_id_is_set: pinnedActionIdIsSet,
      p_settings: settings,
      p_settings_is_set: settingsIsSet,
    },
  );

  if (isUniqueViolationError(error)) {
    throw new ApiHttpError(409, "A named view with this name already exists.");
  }

  if (error) {
    throw new ApiHttpError(500, error.message);
  }

  const row = readNamedViewRpcRow(data);
  if (!row) {
    throw new ApiHttpError(404, "Named view not found.");
  }

  return mapViewRow(row);
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
  const { data, error } = await input.supabaseAdmin.rpc(
    "delete_crm_table_named_view",
    {
      p_tenant_id: input.tenantId,
      p_profile_id: input.profileId,
      p_table_id: input.tableId,
      p_view_id: input.viewId,
      p_next_default_view_id: input.nextDefaultViewId ?? null,
    },
  );

  if (error) {
    throw new ApiHttpError(500, error.message);
  }

  const result = readDeleteRpcResult(data);
  if (!result.deleted) {
    const message =
      result.reason === "next_default_not_found"
        ? "Replacement default view not found."
        : "Named view not found.";
    throw new ApiHttpError(404, message);
  }
}
