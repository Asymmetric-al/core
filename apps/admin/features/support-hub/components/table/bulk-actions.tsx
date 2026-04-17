"use client";

import { Check, Clock, UserCheck } from "lucide-react";

import {
  useAssignSupportConversation,
  useSetSupportConversationStatus,
  useSnoozeSupportConversation,
} from "../../hooks/use-support-mutations";
import { useCurrentSupportAgentId } from "../../lib/current-agent";

import type { SupportConversation } from "../../types";

interface FloatingBarAction {
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  onClick: (rows: SupportConversation[]) => void;
  variant?: "default" | "destructive";
}

interface UseBulkActionsReturn {
  actions: FloatingBarAction[];
}

const HOUR_MS = 60 * 60 * 1000;

/**
 * Bulk action bar wired into `DataTableResponsive.floatingBarActions`. Each
 * action delegates to one of the Phase 2 mutation hooks; each hook already
 * invalidates the right cache keys so the table and board converge on the
 * next paint.
 */
export function useSupportBulkActions(): UseBulkActionsReturn {
  const currentAgentId = useCurrentSupportAgentId();
  const setStatus = useSetSupportConversationStatus();
  const snooze = useSnoozeSupportConversation();
  const assign = useAssignSupportConversation();

  const actions: FloatingBarAction[] = [
    {
      label: "Mark resolved",
      icon: Check,
      onClick: (rows) => {
        for (const row of rows) {
          void setStatus.mutateAsync({
            conversationId: row.id,
            status: "resolved",
          });
        }
      },
    },
    {
      label: "Mark pending",
      icon: Clock,
      onClick: (rows) => {
        for (const row of rows) {
          void setStatus.mutateAsync({
            conversationId: row.id,
            status: "pending",
          });
        }
      },
    },
    {
      label: "Snooze 24h",
      icon: Clock,
      onClick: (rows) => {
        const snoozedUntil = new Date(Date.now() + 24 * HOUR_MS).toISOString();
        for (const row of rows) {
          void snooze.mutateAsync({
            conversationId: row.id,
            snoozedUntil,
          });
        }
      },
    },
    {
      label: "Assign to me",
      icon: UserCheck,
      onClick: (rows) => {
        if (!currentAgentId) return;
        for (const row of rows) {
          void assign.mutateAsync({
            conversationId: row.id,
            assigneeAgentId: currentAgentId,
          });
        }
      },
    },
  ];

  return { actions };
}
