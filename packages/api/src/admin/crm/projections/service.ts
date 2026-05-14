import { CRM_PROJECTION_CONTRACTS } from "../../../crm/projections/contracts";
import {
  buildCrmProjectionShadowReport,
  buildCrmProjectionShadowRows,
} from "../../../crm/projections/model";

import type { AdminCrmProjectionShadowParams } from "./query";
import type { CrmProjectionStore } from "../../../crm/projections/store";
import type { ActorContext } from "../../../crm/types";
import type { AdminCrmProjectionShadowResponse } from "@asym/database/types";

export interface ListMissionControlCrmProjectionShadowOptions {
  actor: ActorContext;
  params: AdminCrmProjectionShadowParams;
  store: CrmProjectionStore;
  now?: Date;
}

const ROLLBACK_CONTRACT = {
  hidePath: "/crm/projections",
  disableAllProjectionNames: CRM_PROJECTION_CONTRACTS.map(
    (contract) => contract.projectionName,
  ),
  restoreReadModels: CRM_PROJECTION_CONTRACTS.map(
    (contract) => contract.rollback.restoreReadModel,
  ),
} as const;

export async function listMissionControlCrmProjectionShadow(
  options: ListMissionControlCrmProjectionShadowOptions,
): Promise<AdminCrmProjectionShadowResponse> {
  const states = await options.store.listProjectionStates({
    tenantId: options.actor.tenantId,
  });
  const rows = buildCrmProjectionShadowRows({
    now: options.now,
    search: options.params.search,
    states,
    targetSurfaces: options.params.targetSurfaces,
  });

  return {
    filters: {
      search: options.params.search,
      targetSurfaces: options.params.targetSurfaces,
    },
    mode: "shadow",
    report: buildCrmProjectionShadowReport(rows),
    rollback: ROLLBACK_CONTRACT,
    rows,
  };
}
