"use client";

import { useLiveQuery } from "@tanstack/react-db";

import {
  supportAgentsCollection,
  supportBusinessHoursCollection,
  supportCannedResponsesCollection,
  supportConversationsCollection,
  supportInboxSettingsCollection,
  supportInboxesCollection,
  supportLabelsCollection,
  supportMacrosCollection,
  supportMessagesCollection,
  supportSavedViewsCollection,
  supportSlaPoliciesCollection,
  supportTeamsCollection,
} from "../collections/support-hub";

export {
  EMPTY_SUPPORT_CONTACT_REF,
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
  supportBusinessHoursCollection,
  supportCannedResponsesCollection,
  supportConversationsCollection,
  supportInboxSettingsCollection,
  supportInboxesCollection,
  supportLabelsCollection,
  supportMacrosCollection,
  supportMessagesCollection,
  supportSavedViewsCollection,
  supportSlaPoliciesCollection,
  supportTeamsCollection,
} from "../collections/support-hub";

export type {
  SupportAssignee,
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
  SupportParticipant,
  SupportPriority,
  SupportReportSlice,
  SupportRichTextPayload,
  SupportSavedView,
  SupportSavedViewFilter,
  SupportSlaPolicy,
  SupportTeam,
} from "../collections/support-hub";

/* ------------------------------------------------------------------------ */
/*  Live query hooks                                                         */
/* ------------------------------------------------------------------------ */

export function useSupportConversationsLive() {
  return useLiveQuery(supportConversationsCollection);
}

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
