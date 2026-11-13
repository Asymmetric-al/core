"use client";

import { Button } from "@asym/ui/components/shadcn/button";
import { Bell } from "lucide-react";

import { useSupportConversations } from "../../hooks/use-support-conversations";
import { useSupportNotificationPreferences } from "../../hooks/use-support-notification-preferences";
import { useCurrentSupportAgentId } from "../../lib/current-agent";
import {
  DEFAULT_IN_APP_PREFERENCES,
  computeInAppAlerts,
} from "../../lib/in-app-alerts";
import { useSupportNow } from "../../lib/now";

interface ForYouNoticeProps {
  /** False while the Mine view is open: the button would do nothing. */
  showMineAction: boolean;
  onShowMine: () => void;
}

function plural(count: number, one: string, many: string): string {
  return `${count} ${count === 1 ? one : many}`;
}

/**
 * The in-app channel of Notification preferences: the signed-in agent's
 * unread assigned conversations (Assignments) and their conversations
 * overdue or due within the hour (SLA warnings), counted from the inbox's
 * own conversations. A channel the agent turned off is left out; with
 * nothing to say, the notice is not shown.
 */
export function ForYouNotice({
  showMineAction,
  onShowMine,
}: ForYouNoticeProps) {
  const agentId = useCurrentSupportAgentId();
  const conversations = useSupportConversations();
  const preferences = useSupportNotificationPreferences();
  const nowIso = useSupportNow();

  // Saved choices first: defaults while they load would flash a notice the
  // agent turned off.
  if (preferences.isLoading) return null;

  const alerts = computeInAppAlerts({
    conversations: conversations.data,
    agentId,
    preferences: preferences.for(agentId) ?? DEFAULT_IN_APP_PREFERENCES,
    now: nowIso,
  });

  const parts: string[] = [];
  if (alerts.unreadAssigned) {
    parts.push(
      `${plural(
        alerts.unreadAssigned,
        "unread conversation",
        "unread conversations",
      )} assigned to you`,
    );
  }
  if (alerts.slaAtRisk) {
    parts.push(`${alerts.slaAtRisk} of yours overdue or due within the hour`);
  }
  if (parts.length === 0) return null;

  return (
    <div
      role="status"
      aria-label="For you"
      className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-xl border border-border bg-card px-3 py-1.5 text-sm"
    >
      <span className="flex min-w-0 items-center gap-2">
        <Bell aria-hidden="true" className="size-4 shrink-0 text-warning" />
        <span className="font-medium text-foreground">For you:</span>
        <span className="text-muted-foreground">{parts.join("; ")}.</span>
      </span>
      {showMineAction ? (
        <Button type="button" variant="link" size="xs" onClick={onShowMine}>
          Show mine
        </Button>
      ) : null}
    </div>
  );
}
