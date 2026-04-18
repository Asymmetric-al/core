export {
  requireSupportHubAccess,
  readJsonBody,
  toApiErrorResponse,
} from "./route-helpers";
export type { SupportHubContext } from "./route-helpers";

export { supportHubAdapter, __resetInMemorySupportHubStore } from "./adapter";
export type {
  SupportHubAdapter,
  AddPrivateNoteInput,
  AssignConversationInput,
  SaveAutomationRuleInput,
  SaveBusinessHoursInput,
  SaveCannedResponseInput,
  SaveInboxSettingsInput,
  SaveLabelInput,
  SaveMacroInput,
  SaveNotificationPreferencesInput,
  SaveSavedViewInput,
  SaveSignatureInput,
  SaveSlaPolicyInput,
  SaveTeamInput,
  SendReplyInput,
  SetConversationPriorityInput,
  SetConversationStatusInput,
  SnoozeConversationInput,
  SupportConversationFilter,
  ToggleAutomationRuleInput,
  ToggleConversationLabelInput,
  UnsnoozeConversationInput,
} from "./adapter";

export * from "./reads/conversations";
export * from "./reads/registry";

export * from "./mutations/conversations";
export * from "./mutations/registry";
export * from "./mutations/run-macro";

export {
  routeInboundToSupportHub,
  inboundEmailEnvelopeSchema,
  type InboundEmailEnvelope,
  type InboundRouterResult,
} from "./inbound-router";
