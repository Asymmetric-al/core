/**
 * Server-backed CRM table preferences (issue #271, ADR-CD-021).
 * The server record is the source of truth; clients keep a responsive local
 * cache and re-validate every preference against row state before use.
 */

export interface CrmTableRowActionPreference {
  /** Stable operation id, or null when no action is pinned. */
  actionId: string | null;
  /** Schema version the preference was written with (for id migration). */
  schemaVersion: number;
}

export interface CrmTablePreferencesResponse {
  tableId: string;
  /** Current preference schema version supported by the server. */
  schemaVersion: number;
  user: CrmTableRowActionPreference | null;
  tenantDefault: CrmTableRowActionPreference | null;
}
