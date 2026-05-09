import { supportHubAdapter } from "../adapter";

/**
 * Read entry points for every static Support Hub registry — labels,
 * macros, canned responses, saved views, agents, teams, business hours,
 * SLA policies, signatures, automation rules, notification preferences,
 * inboxes + inbox settings.
 *
 * Each delegates straight to the adapter so Phase 8 can replace the
 * implementation without touching consumers.
 */

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
