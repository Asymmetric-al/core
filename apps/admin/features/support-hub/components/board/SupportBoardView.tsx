"use client";

import * as React from "react";

import { BoardCard } from "./BoardCard";
import { BoardColumn } from "./BoardColumn";
import { useBoardDnd } from "./use-board-dnd";
import { useSetSupportConversationStatus } from "../../hooks/use-support-mutations";
import { SUPPORT_CONVERSATION_STATUSES } from "../../types";

import type {
  SupportConversation,
  SupportConversationStatus,
} from "../../types";

interface SupportBoardViewProps {
  conversations: SupportConversation[];
  selectedConversationId: string | null;
  onSelectConversation: (id: string) => void;
  nowIso: string;
}

interface ColumnDescriptor {
  status: SupportConversationStatus;
  label: string;
  description: string;
}

const COLUMNS: ColumnDescriptor[] = [
  {
    status: "open",
    label: "Open",
    description: "Donor messages waiting on a first reply.",
  },
  {
    status: "pending",
    label: "Pending",
    description: "Replied — waiting on more info from the donor.",
  },
  {
    status: "snoozed",
    label: "Snoozed",
    description: "Quiet for now, will resurface on the snooze date.",
  },
  {
    status: "resolved",
    label: "Resolved",
    description: "Wrapped up; reopens automatically on a new reply.",
  },
];

/**
 * Donor-care kanban over the Chatwoot lifecycle (open / pending / snoozed /
 * resolved). DnD between columns dispatches a single status mutation; the
 * cache invalidation in `useSetSupportConversationStatus` ripples both views.
 */
export function SupportBoardView({
  conversations,
  selectedConversationId,
  onSelectConversation,
  nowIso,
}: SupportBoardViewProps) {
  const setStatus = useSetSupportConversationStatus();

  const groupedByStatus = React.useMemo(() => {
    const result = new Map<SupportConversationStatus, SupportConversation[]>();
    for (const status of SUPPORT_CONVERSATION_STATUSES) {
      result.set(status, []);
    }
    const sorted = [...conversations].sort((left, right) => {
      if (left.boardOrder === right.boardOrder) {
        return left.id.localeCompare(right.id);
      }
      return left.boardOrder - right.boardOrder;
    });
    for (const row of sorted) {
      result.get(row.status)?.push(row);
    }
    return result;
  }, [conversations]);

  const dnd = useBoardDnd({
    onDrop: ({ conversationId, fromStatus }, toStatus) => {
      if (fromStatus === toStatus) return;
      void setStatus.mutateAsync({
        conversationId,
        status: toStatus,
      });
    },
  });

  return (
    <div
      className="flex h-full min-h-[480px] gap-3 overflow-x-auto pb-2"
      role="region"
      aria-label="Donor care board view"
    >
      {COLUMNS.map((column) => {
        const rows = groupedByStatus.get(column.status) ?? [];
        const dropProps = dnd.getColumnDropProps(column.status);
        const visibleRows = rows.slice(0, BOARD_CARD_PAGE_SIZE);
        const overflow = Math.max(0, rows.length - BOARD_CARD_PAGE_SIZE);
        return (
          <BoardColumn
            key={column.status}
            status={column.status}
            label={column.label}
            description={column.description}
            count={rows.length}
            isHovered={dnd.hoverColumn === column.status}
            isDragging={dnd.isDragging}
            dropProps={dropProps}
            ariaLabel={`${column.label} conversations, ${rows.length} item${rows.length === 1 ? "" : "s"}`}
          >
            {visibleRows.map((conversation) => (
              <BoardCard
                key={conversation.id}
                conversation={conversation}
                isSelected={conversation.id === selectedConversationId}
                isDragging={dnd.draggingId === conversation.id}
                nowIso={nowIso}
                onSelect={onSelectConversation}
                dragHandleProps={dnd.getCardDragProps({
                  conversationId: conversation.id,
                  fromStatus: conversation.status,
                })}
              />
            ))}
            {overflow > 0 ? (
              <p className="px-2 py-1 text-[11px] font-medium text-zinc-500">
                +{overflow} more — refine your filter to see them.
              </p>
            ) : null}
          </BoardColumn>
        );
      })}
    </div>
  );
}

/**
 * Phase 7 perf cap: render at most this many cards per column. Larger
 * columns surface a "+N more" hint so the page never tries to paint a
 * 500-card column. Phase 8 will swap this for a virtualized list when the
 * collection cardinality justifies it.
 */
const BOARD_CARD_PAGE_SIZE = 50;
