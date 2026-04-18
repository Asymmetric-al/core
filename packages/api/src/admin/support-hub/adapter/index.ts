/**
 * Single swap point for the Support Hub server-side data layer.
 *
 * Phase 7 — `inMemorySupportHubAdapter` is the sole implementation. It is
 * seeded from the donor-care fixtures in `packages/database/collections/`
 * and persists across requests within the running process.
 *
 * Phase 8 — replace the right-hand side with `supabaseSupportHubAdapter`
 * from `./supabase` (to be authored alongside the
 * `supabase/migrations/<ts>_support_hub_foundation.sql` migration). No
 * other file needs to change.
 */

import { inMemorySupportHubAdapter } from "./in-memory";

export const supportHubAdapter = inMemorySupportHubAdapter;

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
