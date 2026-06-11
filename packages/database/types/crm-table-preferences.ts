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
