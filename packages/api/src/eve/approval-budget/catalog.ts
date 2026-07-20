import type { EveActionCatalogEntry, EvePolicyActionId } from "./types";

export const EVE_ACTION_CATALOG: Record<
  EvePolicyActionId,
  EveActionCatalogEntry
> = {
  "engineering.review_artifact.write": {
    actionId: "engineering.review_artifact.write",
    trustZone: "engineering",
    writeClass: "operational",
    domain: "production_writes",
    budgetScopeType: "expensive_feature",
    budgetScopeId: "policy-tracer",
    requestCost: 1,
    usdMicrosCost: 1_000,
    inputTokenCost: 100,
    outputTokenCost: 50,
  },
  "product.internal_status.write": {
    actionId: "product.internal_status.write",
    trustZone: "product_admin",
    writeClass: "operational",
    domain: "production_writes",
    budgetScopeType: "expensive_feature",
    budgetScopeId: "policy-tracer",
    requestCost: 1,
    usdMicrosCost: 1_000,
    inputTokenCost: 100,
    outputTokenCost: 50,
  },
  "memory.advisory.write": {
    actionId: "memory.advisory.write",
    trustZone: "memory",
    writeClass: "operational",
    domain: "production_writes",
    budgetScopeType: "expensive_feature",
    budgetScopeId: "policy-tracer",
    requestCost: 1,
    usdMicrosCost: 1_000,
    inputTokenCost: 100,
    outputTokenCost: 50,
  },
  "product.donor.write": {
    actionId: "product.donor.write",
    trustZone: "product_admin",
    writeClass: "business_data",
    domain: "production_writes",
    budgetScopeType: "expensive_feature",
    budgetScopeId: "policy-tracer",
    requestCost: 1,
    usdMicrosCost: 1_000,
    inputTokenCost: 100,
    outputTokenCost: 50,
  },
};

export function getEveActionCatalogEntry(
  actionId: string,
): EveActionCatalogEntry | null {
  return Object.prototype.hasOwnProperty.call(EVE_ACTION_CATALOG, actionId)
    ? EVE_ACTION_CATALOG[actionId as EvePolicyActionId]
    : null;
}
