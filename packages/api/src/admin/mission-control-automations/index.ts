export {
  planContributionAutomationAction,
  planDonorNotificationAutomationAction,
  planTaskAutomationAction,
} from "./adapters";
export { evaluateAutomationRule } from "./evaluator";
export {
  assertAutomationPermission,
  canManageAutomations,
} from "./permissions";
export { createAutomationPreview, ensureActivationReady } from "./preview";
export { automationRuleSchema, compileSimpleAutomation } from "./schemas";

export type {
  AutomationAction,
  AutomationCondition,
  AutomationMode,
  AutomationRecord,
  AutomationRule,
  AutomationRunMode,
  AutomationTrigger,
} from "./types";
