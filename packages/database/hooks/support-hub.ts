"use client";

import { useLiveQuery } from "@tanstack/react-db";

import {
  supportAgentsCollection,
  supportAutomationRulesCollection,
  supportBusinessHoursCollection,
  supportCannedResponsesCollection,
  supportConversationsCollection,
  supportInboxSettingsCollection,
  supportInboxesCollection,
  supportLabelsCollection,
  supportMacrosCollection,
  supportMessagesCollection,
  supportNotificationPreferencesCollection,
  supportSavedViewsCollection,
  supportSignaturesCollection,
  supportSlaPoliciesCollection,
  supportTeamsCollection,
} from "../collections/support-hub";

export {
  EMPTY_SUPPORT_CONTACT_REF,
  SUPPORT_AUTOMATION_ACTION_KINDS,
  SUPPORT_AUTOMATION_CONDITION_KINDS,
  SUPPORT_AUTOMATION_TRIGGERS,
  SUPPORT_CHANNELS,
  SUPPORT_CONVERSATION_STATUSES,
  SUPPORT_INBOX_LAYOUTS,
  SUPPORT_INBOX_SECTIONS,
  SUPPORT_INBOX_VIEWS,
  SUPPORT_LABEL_TONES,
  SUPPORT_LAST_MESSAGE_DIRECTIONS,
  SUPPORT_MESSAGE_DELIVERY_STATES,
  SUPPORT_MESSAGE_DIRECTIONS,
  SUPPORT_MESSAGE_TYPES,
  SUPPORT_PRIORITIES,
  SUPPORT_REPORT_SLICES,
  supportAgentsCollection,
  supportAutomationRulesCollection,
  supportBusinessHoursCollection,
  supportCannedResponsesCollection,
  supportConversationsCollection,
  supportInboxSettingsCollection,
  supportInboxesCollection,
  supportLabelsCollection,
  supportMacrosCollection,
  supportMessagesCollection,
  supportNotificationPreferencesCollection,
  supportSavedViewsCollection,
  supportSignaturesCollection,
  supportSlaPoliciesCollection,
  supportTeamsCollection,
} from "../collections/support-hub";

export type {
  SupportAssignee,
  SupportAutomationAction,
  SupportAutomationActionKind,
  SupportAutomationCondition,
  SupportAutomationConditionKind,
  SupportAutomationRule,
  SupportAutomationTrigger,
  SupportBusinessHours,
  SupportCannedResponse,
  SupportChannel,
  SupportContactRef,
  SupportConversation,
  SupportConversationStatus,
  SupportEmailHeaders,
  SupportInbox,
  SupportInboxLayout,
  SupportInboxSection,
  SupportInboxSettings,
  SupportInboxView,
  SupportLabel,
  SupportLabelTone,
  SupportLastMessageDirection,
  SupportMacro,
  SupportMacroAction,
  SupportMessage,
  SupportMessageAttachment,
  SupportMessageDeliveryState,
  SupportMessageDirection,
  SupportMessageType,
  SupportNotificationPreferences,
  SupportParticipant,
  SupportPriority,
  SupportReportSlice,
  SupportRichTextPayload,
  SupportSavedView,
  SupportSavedViewFilter,
  SupportSignature,
  SupportSlaPolicy,
  SupportTeam,
} from "../collections/support-hub";

/* ------------------------------------------------------------------------ */
/*  Live query hooks                                                         */
/* ------------------------------------------------------------------------ */

export function useSupportConversationsLive() {
  return useLiveQuery(supportConversationsCollection);
}

/**
 * Live identity for the local-only messages collection. Thread messages
 * still load through `useSupportMessages`; this hook does not list a tenant.
 */
export function useSupportMessagesLive() {
  return useLiveQuery(supportMessagesCollection);
}

export function useSupportLabelsLive() {
  return useLiveQuery(supportLabelsCollection);
}

export function useSupportMacrosLive() {
  return useLiveQuery(supportMacrosCollection);
}

export function useSupportCannedResponsesLive() {
  return useLiveQuery(supportCannedResponsesCollection);
}

export function useSupportSavedViewsLive() {
  return useLiveQuery(supportSavedViewsCollection);
}

export function useSupportInboxesLive() {
  return useLiveQuery(supportInboxesCollection);
}

export function useSupportInboxSettingsLive() {
  return useLiveQuery(supportInboxSettingsCollection);
}

export function useSupportTeamsLive() {
  return useLiveQuery(supportTeamsCollection);
}

export function useSupportAgentsLive() {
  return useLiveQuery(supportAgentsCollection);
}

export function useSupportBusinessHoursLive() {
  return useLiveQuery(supportBusinessHoursCollection);
}

export function useSupportSlaPoliciesLive() {
  return useLiveQuery(supportSlaPoliciesCollection);
}

export function useSupportSignaturesLive() {
  return useLiveQuery(supportSignaturesCollection);
}

export function useSupportAutomationRulesLive() {
  return useLiveQuery(supportAutomationRulesCollection);
}

export function useSupportNotificationPreferencesLive() {
  return useLiveQuery(supportNotificationPreferencesCollection);
}
