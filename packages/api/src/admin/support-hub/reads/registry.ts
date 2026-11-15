import { supportHubAdapter } from "../adapter";

export const listSupportLabels = () => supportHubAdapter.labels.list();
export const listSupportMacros = () => supportHubAdapter.macros.list();
export const listSupportCannedResponses = () =>
  supportHubAdapter.cannedResponses.list();
export const listSupportSavedViews = () => supportHubAdapter.savedViews.list();
export const listSupportAgents = () => supportHubAdapter.agents.list();
export const listSupportTeams = () => supportHubAdapter.teams.list();
export const listSupportBusinessHours = () =>
  supportHubAdapter.businessHours.list();
export const listSupportSlaPolicies = () =>
  supportHubAdapter.slaPolicies.list();
export const listSupportSignatures = () => supportHubAdapter.signatures.list();
export const listSupportAutomationRules = () =>
  supportHubAdapter.automationRules.list();
export const listSupportNotificationPreferences = () =>
  supportHubAdapter.notificationPreferences.list();
export const listSupportInboxes = () => supportHubAdapter.inboxes.list();
export const listSupportInboxSettings = () =>
  supportHubAdapter.inboxSettings.list();
export const getSupportInboxSettings = (inboxId?: string | null) =>
  supportHubAdapter.inboxSettings.get(inboxId);
export const getSupportNotificationPreferences = (agentId: string) =>
  supportHubAdapter.notificationPreferences.get(agentId);
