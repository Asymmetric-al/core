import { isPastDue, minutesBetween } from "./time";

import type {
  SupportConversation,
  SupportNotificationPreferences,
} from "../types";

export type InAppPreferences = Pick<
  SupportNotificationPreferences,
  "inAppMentions" | "inAppAssignments" | "inAppSlaWarnings"
>;

/** A new agent's in-app channels, before anything is saved: all on. */
export const DEFAULT_IN_APP_PREFERENCES: InAppPreferences = {
  inAppMentions: true,
  inAppAssignments: true,
  inAppSlaWarnings: true,
};

/** Same buffer as the conversation's SLA chip before it reads "Due in". */
export const SLA_RISK_MINUTES = 60;

export interface InAppAlerts {
  /** My open or pending conversations with unread donor messages; null when off. */
  unreadAssigned: number | null;
  /** My open or pending conversations overdue or due within the hour; null when off. */
  slaAtRisk: number | null;
}

function isActive(conversation: SupportConversation): boolean {
  return conversation.status === "open" || conversation.status === "pending";
}

function isSlaAtRisk(conversation: SupportConversation, now: string): boolean {
  const due =
    conversation.firstRespondedAt === null
      ? conversation.firstResponseDueAt
      : conversation.nextResponseDueAt;
  if (!due) return false;
  if (isPastDue(due, now)) return true;
  const minutes = minutesBetween(now, due);
  return minutes !== null && minutes <= SLA_RISK_MINUTES;
}

/**
 * The in-app alerts an agent has asked for, counted from the conversations
 * the inbox already holds. Mentions are not counted: the inbox list does not
 * carry private-note mentions.
 */
export function computeInAppAlerts({
  conversations,
  agentId,
  preferences,
  now,
}: {
  conversations: SupportConversation[];
  agentId: string | null;
  preferences: InAppPreferences;
  now: string;
}): InAppAlerts {
  if (!agentId) return { unreadAssigned: null, slaAtRisk: null };
  const mine = conversations.filter(
    (conversation) =>
      conversation.assignee?.id === agentId && isActive(conversation),
  );
  return {
    unreadAssigned: preferences.inAppAssignments
      ? mine.filter((conversation) => conversation.unreadCount > 0).length
      : null,
    slaAtRisk: preferences.inAppSlaWarnings
      ? mine.filter((conversation) => isSlaAtRisk(conversation, now)).length
      : null,
  };
}
