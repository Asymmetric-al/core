import {
  CRM_ROW_ACTION_SCHEMA_VERSION,
  migrateCrmRowActionId,
} from "./row-action";
import { ApiHttpError } from "../../../shared/http-errors";

import type { AdminSupabaseClient } from "@asym/database/supabase/admin";
import type {
  CrmGiftHistoryColumnSettings,
  CrmGiftHistoryFiltersSortSettings,
  CrmTablePreferencesResponse,
  CrmTableRowActionPreference,
  CrmViewSettingsLayer,
} from "@asym/database/types";

type SupabaseAdmin = AdminSupabaseClient;

interface PreferenceRow {
  pinned_action_id: string | null;
  schema_version: number | null;
  settings: CrmViewSettingsLayer | null;
}

const PREFERENCE_COLUMNS = "pinned_action_id, schema_version, settings";

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

/**
 * Validates a stored/pinned operation id. Renamed ids are migrated to the
 * current stable id before persisting; unknown ids are rejected so the
 * server record never accumulates garbage.
 */
function normalizePinnedActionId(actionId: string | null): string | null {
  if (actionId === null) {
    return null;
  }

  const migrated = migrateCrmRowActionId(actionId);
  if (!migrated) {
    throw new ApiHttpError(400, `Unknown operation id "${actionId}".`);
  }

  return migrated;
}

/**
 * Per-scope settings update: undefined leaves a scope unchanged, null clears
 * it (scoped reset), a value replaces it.
 */
export interface CrmViewSettingsPatch {
  columns?: Partial<CrmGiftHistoryColumnSettings> | null;
  filtersSort?: Partial<CrmGiftHistoryFiltersSortSettings> | null;
  delegatedManagerProfileIds?: string[] | null;
}

function applySettingsPatch(
  existing: CrmViewSettingsLayer | null,
  patch: CrmViewSettingsPatch,
): CrmViewSettingsLayer {
  const next: CrmViewSettingsLayer = { ...(existing ?? {}) };

  if (patch.columns !== undefined) {
    if (patch.columns === null) {
      delete next.columns;
    } else {
      next.columns = patch.columns;
    }
  }

  if (patch.filtersSort !== undefined) {
    if (patch.filtersSort === null) {
      delete next.filtersSort;
    } else {
      next.filtersSort = patch.filtersSort;
    }
  }

  if (patch.delegatedManagerProfileIds !== undefined) {
    if (patch.delegatedManagerProfileIds === null) {
      delete next.delegatedManagerProfileIds;
    } else {
      next.delegatedManagerProfileIds = patch.delegatedManagerProfileIds;
    }
  }

  return next;
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
  const existingResult = await input.supabaseAdmin
    .from("crm_table_user_preferences")
    .select(PREFERENCE_COLUMNS)
    .eq("tenant_id", input.tenantId)
    .eq("profile_id", input.profileId)
    .eq("table_id", input.tableId)
    .maybeSingle();
  if (existingResult.error) {
    throw new ApiHttpError(500, existingResult.error.message);
  }
  const existing = existingResult.data as PreferenceRow | null;

  const pinnedActionId =
    input.pinnedActionId === undefined
      ? (existing?.pinned_action_id ?? null)
      : normalizePinnedActionId(input.pinnedActionId);
  const settings = applySettingsPatch(
    existing?.settings ?? null,
    input.settingsPatch ?? {},
  );

  const { data, error } = await input.supabaseAdmin
    .from("crm_table_user_preferences")
    .upsert(
      {
        tenant_id: input.tenantId,
        profile_id: input.profileId,
        table_id: input.tableId,
        pinned_action_id: pinnedActionId,
        schema_version: CRM_ROW_ACTION_SCHEMA_VERSION,
        settings,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "tenant_id,profile_id,table_id" },
    )
    .select(PREFERENCE_COLUMNS)
    .single();

  if (error || !data) {
    throw new ApiHttpError(
      500,
      error?.message ?? "Failed to save table preferences.",
    );
  }

  return mapPreferenceRow(data as PreferenceRow)!;
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
  input: SaveCrmTablePreferenceInput & { actorProfileId: string },
): Promise<CrmTableRowActionPreference> {
  const beforeResult = await input.supabaseAdmin
    .from("crm_table_tenant_defaults")
    .select(PREFERENCE_COLUMNS)
    .eq("tenant_id", input.tenantId)
    .eq("table_id", input.tableId)
    .maybeSingle();
  if (beforeResult.error) {
    throw new ApiHttpError(500, beforeResult.error.message);
  }
  const before = beforeResult.data as PreferenceRow | null;

  const pinnedActionId =
    input.pinnedActionId === undefined
      ? (before?.pinned_action_id ?? null)
      : normalizePinnedActionId(input.pinnedActionId);
  const settings = applySettingsPatch(
    before?.settings ?? null,
    input.settingsPatch ?? {},
  );

  const { data, error } = await input.supabaseAdmin
    .from("crm_table_tenant_defaults")
    .upsert(
      {
        tenant_id: input.tenantId,
        table_id: input.tableId,
        pinned_action_id: pinnedActionId,
        schema_version: CRM_ROW_ACTION_SCHEMA_VERSION,
        settings,
        updated_by: input.actorProfileId,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "tenant_id,table_id" },
    )
    .select(PREFERENCE_COLUMNS)
    .single();

  if (error || !data) {
    throw new ApiHttpError(
      500,
      error?.message ?? "Failed to save the tenant default.",
    );
  }

  // Tenant default changes are audited, not approval-gated (ADR-CD-021).
  const auditResult = await input.supabaseAdmin
    .from("crm_table_preference_audit_events")
    .insert({
      tenant_id: input.tenantId,
      actor_profile_id: input.actorProfileId,
      table_id: input.tableId,
      scope: "tenant_default",
      before_snapshot: {
        pinnedActionId: before?.pinned_action_id ?? null,
        settings: before?.settings ?? null,
      },
      after_snapshot: { pinnedActionId, settings },
    });
  if (auditResult.error) {
    throw new ApiHttpError(500, auditResult.error.message);
  }

  return mapPreferenceRow(data as PreferenceRow)!;
}

export async function saveCrmTenantRowActionDefault(input: {
  supabaseAdmin: SupabaseAdmin;
  tenantId: string;
  tableId: string;
  pinnedActionId: string | null;
  actorProfileId: string;
}): Promise<CrmTableRowActionPreference> {
  return saveCrmTenantTableDefault(input);
}
