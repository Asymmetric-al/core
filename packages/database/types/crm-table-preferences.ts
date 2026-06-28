/**
 * Server-backed CRM table preferences (issue #271, ADR-CD-021).
 * The server record is the source of truth; clients keep a responsive local
 * cache and re-validate every preference against row state before use.
 */

export interface CrmGiftHistoryColumnSettings {
  designation: boolean;
  statusLine: boolean;
}

export interface CrmGiftHistoryFiltersSortSettings {
  sortField: "giftDate" | "amountCents";
  sortDirection: "asc" | "desc";
  paymentStatus: "all" | "completed" | "refunded";
  /**
   * Compact CRM issue filter (issue #274). Each value composes shared
   * CRM/Hub filter definitions; never CRM-only status logic.
   */
  issue: "all" | "needs_attention" | "receipt_affected" | "pending_correction";
}

export interface CrmGiftHistoryViewSettings {
  columns: CrmGiftHistoryColumnSettings;
  filtersSort: CrmGiftHistoryFiltersSortSettings;
}

/**
 * One preference layer (user or tenant default). A scope set to null/absent
 * falls through to the next layer; partial scopes merge over system defaults.
 */
export interface CrmViewSettingsLayer {
  columns?: Partial<CrmGiftHistoryColumnSettings> | null;
  filtersSort?: Partial<CrmGiftHistoryFiltersSortSettings> | null;
  /** Delegated tenant-default managers (tenant default layer only). */
  delegatedManagerProfileIds?: string[] | null;
  /** The named personal view last applied by the user (issue #273). */
  activeViewId?: string | null;
}

/**
 * Per-scope view-settings patch (issues #272/#273): `undefined` leaves a scope
 * unchanged, `null` clears it (scoped reset), a value replaces the entire scope.
 * A columns patch such as `{ designation: true }` intentionally drops sibling
 * column overrides from that layer; callers that edit one field must send the
 * full desired scope. Used by both the API service (persisting the server
 * record) and the database hook (optimistic local cache), so the three-way
 * semantics live in one place.
 */
export interface CrmViewSettingsPatch {
  columns?: Partial<CrmGiftHistoryColumnSettings> | null;
  filtersSort?: Partial<CrmGiftHistoryFiltersSortSettings> | null;
  delegatedManagerProfileIds?: string[] | null;
  activeViewId?: string | null;
}

/**
 * Apply a {@link CrmViewSettingsPatch} to a settings layer. Pure and
 * framework-free so both server (`@asym/api`) and `"use client"` consumers can
 * share it. Lives in `@asym/database` (which `@asym/api` already depends on) to
 * avoid a database -> api -> database cycle.
 */
export function applyCrmViewSettingsPatch(
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

  if (patch.activeViewId !== undefined) {
    if (patch.activeViewId === null) {
      delete next.activeViewId;
    } else {
      next.activeViewId = patch.activeViewId;
    }
  }

  return next;
}

export type CrmViewSettingsScope =
  | "columns"
  | "filtersSort"
  | "pinnedAction"
  | "all";

export type CrmViewSettingsSource = "user" | "tenant_default" | "system";

export interface CrmTableRowActionPreference {
  /** Stable operation id, or null when no action is pinned. */
  actionId: string | null;
  /** Schema version the preference was written with (for id migration). */
  schemaVersion: number;
  /** View settings stored alongside the pin (issue #272). */
  settings?: CrmViewSettingsLayer | null;
}

export interface CrmTablePreferencesResponse {
  tableId: string;
  /** Current preference schema version supported by the server. */
  schemaVersion: number;
  user: CrmTableRowActionPreference | null;
  tenantDefault: CrmTableRowActionPreference | null;
}

export type CrmTablePreferencePatch = CrmViewSettingsPatch & {
  /** Hook-only pin field; settings scopes are handled by CrmViewSettingsPatch. */
  pinnedActionId?: string | null;
};

export function applyCrmTablePreferencePatch(
  response: CrmTablePreferencesResponse,
  patch: CrmTablePreferencePatch,
): CrmTablePreferencesResponse {
  return {
    ...response,
    user: {
      ...(response.user ?? {}),
      actionId:
        patch.pinnedActionId !== undefined
          ? patch.pinnedActionId
          : (response.user?.actionId ?? null),
      schemaVersion: response.user?.schemaVersion ?? response.schemaVersion,
      settings: applyCrmViewSettingsPatch(
        response.user?.settings ?? null,
        patch,
      ),
    },
  };
}

export function applyCrmRowActionPin(
  response: CrmTablePreferencesResponse,
  actionId: string | null,
): CrmTablePreferencesResponse {
  return {
    ...response,
    user: {
      ...(response.user ?? {}),
      actionId,
      schemaVersion: response.user?.schemaVersion ?? response.schemaVersion,
    },
  };
}

/**
 * Personal-only named view snapshot (issue #273): columns, filters/sort, and
 * pinned row action under a user-chosen name. One view per user/table can be
 * the default. No sharing or team views.
 */
export interface CrmNamedView {
  id: string;
  name: string;
  isDefault: boolean;
  schemaVersion: number;
  pinnedActionId: string | null;
  settings: CrmViewSettingsLayer | null;
}

export interface CrmNamedViewsResponse {
  tableId: string;
  views: CrmNamedView[];
}
