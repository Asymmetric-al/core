import { supportHubAdapter } from "../adapter";
import { SupportCannedResponseError } from "../canned-response-error";
import {
  saveAutomationRuleSchema,
  saveBusinessHoursSchema,
  saveCannedResponseSchema,
  saveInboxSettingsSchema,
  saveLabelSchema,
  saveMacroSchema,
  saveNotificationPreferencesSchema,
  saveSavedViewSchema,
  saveSignatureSchema,
  saveSlaPolicySchema,
  saveTeamSchema,
  toggleAutomationRuleSchema,
} from "../schemas";

import type {
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
  ToggleAutomationRuleInput,
} from "../adapter";

/**
 * Registry-style CRUD wrappers for every Support Hub static entity. All of
 * these are thin: parse the input schema, delegate to the adapter. Phase 8
 * gets the entire suite for free when `adapter/index.ts` swaps to the
 * Supabase implementation.
 */

export const saveSupportLabel = (input: SaveLabelInput) =>
  supportHubAdapter.labels.save(saveLabelSchema.parse(input));
export const deleteSupportLabel = (id: string) =>
  supportHubAdapter.labels.delete(id);

export const saveSupportMacro = (input: SaveMacroInput) =>
  supportHubAdapter.macros.save(saveMacroSchema.parse(input));
export const deleteSupportMacro = (id: string) =>
  supportHubAdapter.macros.delete(id);

export const saveSupportCannedResponse = async (
  input: SaveCannedResponseInput,
) => {
  const parsed = saveCannedResponseSchema.parse(input);
  const responses = await supportHubAdapter.cannedResponses.list();
  const existing = responses.find((response) => response.id === parsed.id);
  const shortCode = parsed.shortCode.trim().replace(/^\//, "");
  if (
    shortCode !== existing?.shortCode &&
    !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(shortCode)
  ) {
    throw new SupportCannedResponseError(
      "Use lowercase letters, numbers and hyphens.",
    );
  }
  if (
    responses.some(
      (response) =>
        response.id !== parsed.id &&
        response.ownerAgentId === parsed.ownerAgentId &&
        response.shortCode.toLowerCase() === shortCode.toLowerCase(),
    )
  ) {
    throw new SupportCannedResponseError(
      "This shortcode is already in use.",
      409,
    );
  }
  return supportHubAdapter.cannedResponses.save({ ...parsed, shortCode });
};
export const deleteSupportCannedResponse = (id: string) =>
  supportHubAdapter.cannedResponses.delete(id);

export const saveSupportSavedView = (input: SaveSavedViewInput) =>
  supportHubAdapter.savedViews.save(saveSavedViewSchema.parse(input));
export const deleteSupportSavedView = (id: string) =>
  supportHubAdapter.savedViews.delete(id);

export const saveSupportTeam = (input: SaveTeamInput) =>
  supportHubAdapter.teams.save(saveTeamSchema.parse(input));
export const deleteSupportTeam = (id: string) =>
  supportHubAdapter.teams.delete(id);

export const saveSupportBusinessHours = (input: SaveBusinessHoursInput) =>
  supportHubAdapter.businessHours.save(saveBusinessHoursSchema.parse(input));
export const deleteSupportBusinessHours = (id: string) =>
  supportHubAdapter.businessHours.delete(id);

export const saveSupportSlaPolicy = (input: SaveSlaPolicyInput) =>
  supportHubAdapter.slaPolicies.save(saveSlaPolicySchema.parse(input));
export const setDefaultSupportSlaPolicy = (id: string) =>
  supportHubAdapter.slaPolicies.setDefault(id);
export const deleteSupportSlaPolicy = (id: string) =>
  supportHubAdapter.slaPolicies.delete(id);

export const saveSupportSignature = (input: SaveSignatureInput) =>
  supportHubAdapter.signatures.save(saveSignatureSchema.parse(input));
export const setDefaultSupportSignature = (id: string) =>
  supportHubAdapter.signatures.setDefault(id);
export const deleteSupportSignature = (id: string) =>
  supportHubAdapter.signatures.delete(id);

export const saveSupportAutomationRule = (input: SaveAutomationRuleInput) =>
  supportHubAdapter.automationRules.save(saveAutomationRuleSchema.parse(input));
export const toggleSupportAutomationRule = (input: ToggleAutomationRuleInput) =>
  supportHubAdapter.automationRules.toggle(
    toggleAutomationRuleSchema.parse(input),
  );
export const deleteSupportAutomationRule = (id: string) =>
  supportHubAdapter.automationRules.delete(id);

export const saveSupportInboxSettings = (input: SaveInboxSettingsInput) =>
  supportHubAdapter.inboxSettings.save(saveInboxSettingsSchema.parse(input));

export const saveSupportNotificationPreferences = (
  input: SaveNotificationPreferencesInput,
) =>
  supportHubAdapter.notificationPreferences.save(
    saveNotificationPreferencesSchema.parse(input),
  );
