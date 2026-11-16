/**
 * Single swap point for the Support Hub server-side data layer.
 *
 * `supabaseSupportHubAdapter` is the live implementation. The in-memory
 * adapter and its reset helper remain exported only as test fixtures for
 * the Support Hub unit tests.
 */

import { supabaseSupportHubAdapter } from "./supabase";

export const supportHubAdapter = supabaseSupportHubAdapter;

export type { SupportHubAdapter } from "./types";
export type {
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
} from "./types";

export { __resetInMemorySupportHubStore } from "./in-memory";
export { inMemorySupportHubAdapter } from "./in-memory";
export { supabaseSupportHubAdapter } from "./supabase";
