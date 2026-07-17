import {
  CRM_ROW_ACTION_SCHEMA_VERSION,
  normalizeCrmPinnedActionId,
} from "./row-action";
import { ApiHttpError } from "../../../shared/http-errors";
import { isRecord } from "../../../shared/json-coerce";

import type { AdminSupabaseClient } from "@asym/database/supabase/admin";
import type {
  CrmTablePreferencesResponse,
  CrmTableRowActionPreference,
  CrmViewSettingsLayer,
  CrmViewSettingsPatch,
} from "@asym/database/types";

// Re-exported so existing consumers (route handlers) keep importing the patch
// type from this module while the shared semantics live in @asym/database.
export type { CrmViewSettingsPatch };

type SupabaseAdmin = AdminSupabaseClient;

interface PreferenceRow {
  pinned_action_id: string | null;
  schema_version: number | null;
  settings: CrmViewSettingsLayer | null;
}

const PREFERENCE_COLUMNS = "pinned_action_id, schema_version, settings";

function firstRpcValue(data: unknown): unknown {
  return Array.isArray(data) ? data[0] : data;
}

function readPreferenceRpcRow(data: unknown): PreferenceRow | null {
  const row = firstRpcValue(data);
  if (!isRecord(row)) {
    return null;
  }

  return row as unknown as PreferenceRow;
}

function isInsufficientPrivilegeError(error: unknown): boolean {
  return isRecord(error) && error.code === "42501";
}

function isNoDataFoundError(error: unknown): boolean {
  return isRecord(error) && error.code === "P0002";
}

function isInvalidParameterValueError(error: unknown): boolean {
  return isRecord(error) && error.code === "22023";
}

function mapPreferenceRow(
  row: PreferenceRow | null,
): CrmTableRowActionPreference | null {
  if (!row) {
    return null;
  }

  return {
    actionId: row.pinned_action_id,
    schemaVersion: row.schema_version ?? CRM_ROW_ACTION_SCHEMA_VERSION,
    settings: row.settings ?? null,
  };
}

export async function getCrmTablePreferences(input: {
  supabaseAdmin: SupabaseAdmin;
  tenantId: string;
  profileId: string;
  tableId: string;
}): Promise<CrmTablePreferencesResponse> {
  const [userResult, tenantResult] = await Promise.all([
    input.supabaseAdmin
      .from("crm_table_user_preferences")
      .select(PREFERENCE_COLUMNS)
      .eq("tenant_id", input.tenantId)
      .eq("profile_id", input.profileId)
      .eq("table_id", input.tableId)
      .maybeSingle(),
    input.supabaseAdmin
      .from("crm_table_tenant_defaults")
      .select(PREFERENCE_COLUMNS)
      .eq("tenant_id", input.tenantId)
      .eq("table_id", input.tableId)
      .maybeSingle(),
  ]);

  if (userResult.error) {
    throw new ApiHttpError(500, userResult.error.message);
  }
  if (tenantResult.error) {
    throw new ApiHttpError(500, tenantResult.error.message);
  }

  return {
    tableId: input.tableId,
    schemaVersion: CRM_ROW_ACTION_SCHEMA_VERSION,
    user: mapPreferenceRow(userResult.data as PreferenceRow | null),
    tenantDefault: mapPreferenceRow(tenantResult.data as PreferenceRow | null),
  };
}

export interface SaveCrmTablePreferenceInput {
  supabaseAdmin: SupabaseAdmin;
  tenantId: string;
  tableId: string;
  /** undefined = unchanged; null = unpin. */
  pinnedActionId?: string | null;
  settingsPatch?: CrmViewSettingsPatch;
}

export async function saveCrmUserTablePreference(
  input: SaveCrmTablePreferenceInput & { profileId: string },
): Promise<CrmTableRowActionPreference> {
  const pinnedActionId =
    input.pinnedActionId === undefined
      ? null
      : normalizeCrmPinnedActionId(input.pinnedActionId);
  const { data, error } = await input.supabaseAdmin.rpc(
    "save_crm_user_table_preference",
    {
      p_tenant_id: input.tenantId,
      p_profile_id: input.profileId,
      p_table_id: input.tableId,
      p_pinned_action_id: pinnedActionId,
      p_pinned_action_id_is_set: input.pinnedActionId !== undefined,
      p_schema_version: CRM_ROW_ACTION_SCHEMA_VERSION,
      p_settings_patch: input.settingsPatch ?? {},
    },
  );
  const row = readPreferenceRpcRow(data);

  if (isNoDataFoundError(error)) {
    throw new ApiHttpError(
      404,
      error?.message ?? "Active named view not found.",
    );
  }

  if (isInvalidParameterValueError(error)) {
    throw new ApiHttpError(
      400,
      error?.message ?? "Active named view id is invalid.",
    );
  }

  if (error || !row) {
    throw new ApiHttpError(
      500,
      error?.message ?? "Failed to save table preferences.",
    );
  }

  return mapPreferenceRow(row)!;
}

export async function saveCrmUserRowActionPin(input: {
  supabaseAdmin: SupabaseAdmin;
  tenantId: string;
  profileId: string;
  tableId: string;
  pinnedActionId: string | null;
}): Promise<CrmTableRowActionPreference> {
  return saveCrmUserTablePreference(input);
}

export async function saveCrmTenantTableDefault(
  input: SaveCrmTablePreferenceInput & {
    actorCanManageDefaults: boolean;
    actorProfileId: string;
  },
): Promise<CrmTableRowActionPreference> {
  const pinnedActionId =
    input.pinnedActionId === undefined
      ? null
      : normalizeCrmPinnedActionId(input.pinnedActionId);
  const { data, error } = await input.supabaseAdmin.rpc(
    "save_crm_tenant_table_default",
    {
      p_tenant_id: input.tenantId,
      p_table_id: input.tableId,
      p_pinned_action_id: pinnedActionId,
      p_pinned_action_id_is_set: input.pinnedActionId !== undefined,
      p_schema_version: CRM_ROW_ACTION_SCHEMA_VERSION,
      p_settings_patch: input.settingsPatch ?? {},
      p_actor_profile_id: input.actorProfileId,
      p_actor_can_manage_defaults: input.actorCanManageDefaults,
    },
  );
  const row = readPreferenceRpcRow(data);

  if (isInsufficientPrivilegeError(error)) {
    throw new ApiHttpError(
      403,
      error?.message ??
        "Forbidden: requires crm.gift_history.manage_view_defaults",
    );
  }

  if (error || !row) {
    throw new ApiHttpError(
      500,
      error?.message ?? "Failed to save the tenant default.",
    );
  }

  return mapPreferenceRow(row)!;
}

export async function saveCrmTenantRowActionDefault(input: {
  supabaseAdmin: SupabaseAdmin;
  tenantId: string;
  tableId: string;
  pinnedActionId: string | null;
  actorCanManageDefaults: boolean;
  actorProfileId: string;
}): Promise<CrmTableRowActionPreference> {
  return saveCrmTenantTableDefault(input);
}
