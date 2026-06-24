// Client-safe barrel: pure preference resolution only. Server handlers live
// in ./route (route export path) and persistence in ./service (route-only).
export { deriveGiftHistoryRows } from "./gift-history-row-model";
export {
  CRM_GIFT_HISTORY_TABLE_ID,
  CRM_ROW_ACTION_SCHEMA_VERSION,
  migrateCrmRowActionId,
  resolveCrmRowAction,
  type CrmRowActionPreferenceInput,
  type CrmRowActionSource,
  type ResolvedCrmRowAction,
} from "./row-action";
export {
  canManageCrmTenantDefaults,
  CRM_GIFT_HISTORY_SYSTEM_VIEW_SETTINGS,
  previewCrmViewSettingsReset,
  resolveCrmGiftHistoryViewSettings,
  type CrmViewSettingsResetPreview,
  type ResolvedCrmViewSettings,
} from "./view-settings";
