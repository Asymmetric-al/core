"use client";

import { Badge } from "@asym/ui/components/shadcn/badge";
import { Button } from "@asym/ui/components/shadcn/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@asym/ui/components/shadcn/dialog";
import { cn } from "@asym/ui/lib/utils";
import * as React from "react";
import { toast } from "sonner";

import { BoardCard } from "./BoardCard";
import { BoardColumn } from "./BoardColumn";
import { useBoardDnd } from "./use-board-dnd";
import { useSetSupportConversationStatus } from "../../hooks/use-support-mutations";
import {
  SUPPORT_SNOOZE_OPTIONS,
  formatSnoozeTime,
  resolveSnoozeUntil,
  snoozeUntilFromNow,
} from "../../lib/snooze";
import { SUPPORT_CONVERSATION_STATUSES } from "../../types/conversation";

import type {
  SupportConversation,
  SupportConversationStatus,
} from "../../types/conversation";

interface SupportBoardViewProps {
  conversations: SupportConversation[];
  selectedConversationId: string | null;
  onSelectConversation: (id: string) => void;
  nowIso: string;
  /**
   * Height of what covers the top of the page (app header and any sticky
   * filters), so a lane jump lands just below it. Defaults to the 3rem app
   * header plus a small gap.
   */
  laneScrollOffset?: () => number;
}

const DEFAULT_LANE_SCROLL_OFFSET = 56;

const LANE_DOTS: Record<SupportConversationStatus, string> = {
  open: "bg-warning",
  pending: "bg-muted-foreground",
  snoozed: "bg-chart-3",
  resolved: "bg-success",
};

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
    description: "Replied, waiting on more info from the donor.",
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
  laneScrollOffset,
}: SupportBoardViewProps) {
  const setStatus = useSetSupportConversationStatus();
  const [snoozeId, setSnoozeId] = React.useState<string | null>(null);
  const saveStatus = async (
    conversationId: string,
    status: SupportConversationStatus,
    snoozedUntil?: string,
  ) => {
    try {
      await setStatus.mutateAsync({
        conversationId,
        status,
        ...(snoozedUntil ? { snoozedUntil } : {}),
      });
      setSnoozeId(null);
    } catch {
      toast.error("Couldn’t move the conversation. Try again.");
    }
  };
  const moveConversation = (
    conversationId: string,
    status: SupportConversationStatus,
  ) => {
    if (status === "snoozed") {
      setSnoozeId(conversationId);
      return;
    }
    void saveStatus(conversationId, status);
  };
  const laneRefs = React.useRef(
    new Map<SupportConversationStatus, HTMLElement>(),
  );

  const jumpToLane = (status: SupportConversationStatus) => {
    const lane = laneRefs.current.get(status);
    if (!lane) return;
    const offset = laneScrollOffset?.() ?? DEFAULT_LANE_SCROLL_OFFSET;
    window.scrollTo({
      top: lane.getBoundingClientRect().top + window.scrollY - offset,
    });
    lane.focus({ preventScroll: true });
  };

  const groupedByStatus = React.useMemo(() => {
    const result = new Map<SupportConversationStatus, SupportConversation[]>();
    for (const status of SUPPORT_CONVERSATION_STATUSES) {
      result.set(status, []);
    }
    const sorted = Array.from(conversations).sort((left, right) => {
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
      moveConversation(conversationId, toStatus);
    },
  });

  return (
    // Lanes follow the board's own width (it narrows when a conversation is
    // open): stacked on phones, two by two at medium widths, then all four
    // in one row once each lane has room. Every lane stays on screen; a
    // sideways row hid Resolved with nothing to say it was there.
    <div
      className="@container"
      role="region"
      aria-label="Donor care board view"
    >
      {/* In two columns (a conversation open beside the board, or a
          medium screen) Snoozed and Resolved sit below every Open card;
          this row keeps each lane and its count one press away. One row of
          four lanes needs none, and phones keep the space for cards. */}
      <Dialog
        open={snoozeId !== null}
        onOpenChange={(open) => {
          if (!open) setSnoozeId(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Snooze until</DialogTitle>
            <DialogDescription>
              Choose when this conversation returns to the inbox.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-2">
            {SUPPORT_SNOOZE_OPTIONS.map((option) => (
              <Button
                type="button"
                key={option.key}
                variant="outline"
                disabled={setStatus.isPending}
                onClick={() => {
                  if (snoozeId)
                    void saveStatus(
                      snoozeId,
                      "snoozed",
                      snoozeUntilFromNow(option.key, nowIso),
                    );
                }}
              >
                <span>{option.label}</span>
                <span className="ml-auto text-xs text-muted-foreground">
                  {formatSnoozeTime(
                    resolveSnoozeUntil(option.key, nowIso),
                    nowIso,
                  )}
                </span>
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
      <nav
        aria-label="Jump to a lane"
        className="mb-3 flex flex-wrap items-center gap-1 @5xl:hidden"
      >
        {COLUMNS.map((column) => (
          <Button
            key={column.status}
            type="button"
            variant="outline"
            size="xs"
            onClick={() => jumpToLane(column.status)}
          >
            <span
              aria-hidden
              className={cn("size-2 rounded-full", LANE_DOTS[column.status])}
            />
            {column.label}
            <Badge variant="secondary">
              {groupedByStatus.get(column.status)?.length ?? 0}
            </Badge>
          </Button>
        ))}
      </nav>
      {/* Lanes in a row stretch to the tallest one, so the space under a
          short lane is still that lane's drop target. Every lane grows with
          its cards, so every card is in page flow at every width. In one
          row the board keeps a 30rem floor so empty lanes stay easy to drop
          onto. */}
      <div className="grid grid-cols-1 gap-3 @lg:grid-cols-2 @5xl:min-h-120 @5xl:grid-cols-4">
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
              laneRef={(node) => {
                if (node) laneRefs.current.set(column.status, node);
                else laneRefs.current.delete(column.status);
              }}
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
                  onMove={moveConversation}
                  movePending={setStatus.isPending}
                  dragHandleProps={dnd.getCardDragProps({
                    conversationId: conversation.id,
                    fromStatus: conversation.status,
                  })}
                />
              ))}
              {overflow > 0 ? (
                <p className="px-2 py-1 text-xs font-medium text-muted-foreground">
                  +{overflow} more, refine your filter to see them.
                </p>
              ) : null}
            </BoardColumn>
          );
        })}
      </div>
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
