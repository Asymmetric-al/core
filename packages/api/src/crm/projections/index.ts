export {
  CRM_PROJECTION_CONTRACTS,
  getCrmProjectionContract,
} from "./contracts";
export {
  buildCrmProjectionShadowReport,
  buildCrmProjectionShadowRows,
} from "./model";
export {
  createSupabaseCrmProjectionStore,
  type CrmProjectionStore,
  type UpsertCrmProjectionStateInput,
} from "./store";
