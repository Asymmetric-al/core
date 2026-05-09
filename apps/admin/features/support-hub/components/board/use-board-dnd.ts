"use client";

import * as React from "react";

import type { SupportConversationStatus } from "../../types";

export interface BoardDragData {
  conversationId: string;
  fromStatus: SupportConversationStatus;
}

interface UseBoardDndOptions {
  /** Called after a successful drop with the dragged card and the destination column. */
  onDrop: (data: BoardDragData, toStatus: SupportConversationStatus) => void;
}

interface UseBoardDndReturn {
  draggingId: string | null;
  hoverColumn: SupportConversationStatus | null;
  isDragging: boolean;

  /** Spread on a draggable `BoardCard`. */
  getCardDragProps: (data: BoardDragData) => {
    draggable: true;
    onDragStart: (event: React.DragEvent<HTMLElement>) => void;
    onDragEnd: () => void;
  };

  /** Spread on a `BoardColumn` drop zone. */
  getColumnDropProps: (status: SupportConversationStatus) => {
    onDragOver: (event: React.DragEvent<HTMLElement>) => void;
    onDragEnter: (event: React.DragEvent<HTMLElement>) => void;
    onDragLeave: (event: React.DragEvent<HTMLElement>) => void;
    onDrop: (event: React.DragEvent<HTMLElement>) => void;
    "aria-dropeffect": "move";
  };
}

const MIME_TYPE = "application/x-support-conversation";

/**
 * Tiny native HTML5 DnD wrapper. No new runtime dep. The board owns the
 * status mutation; this hook only wires events and tracks transient hover
 * state so the column can show its drop affordance.
 */
export function useBoardDnd({ onDrop }: UseBoardDndOptions): UseBoardDndReturn {
  const [draggingId, setDraggingId] = React.useState<string | null>(null);
  const [hoverColumn, setHoverColumn] =
    React.useState<SupportConversationStatus | null>(null);
  const dragDataRef = React.useRef<BoardDragData | null>(null);
  const hoverDepthRef = React.useRef(0);

  const reset = React.useCallback(() => {
    setDraggingId(null);
    setHoverColumn(null);
    dragDataRef.current = null;
    hoverDepthRef.current = 0;
  }, []);

  const getCardDragProps = React.useCallback<
    UseBoardDndReturn["getCardDragProps"]
  >(
    (data) => ({
      draggable: true,
      onDragStart: (event) => {
        dragDataRef.current = data;
        setDraggingId(data.conversationId);
        try {
          event.dataTransfer.setData(MIME_TYPE, JSON.stringify(data));
          event.dataTransfer.effectAllowed = "move";
        } catch {
          // Some test environments don't expose `setData`; the in-memory ref
          // still carries the payload for the drop handler.
        }
      },
      onDragEnd: () => {
        reset();
      },
    }),
    [reset],
  );

  const readDragData = React.useCallback(
    (event: React.DragEvent<HTMLElement>): BoardDragData | null => {
      try {
        const raw = event.dataTransfer.getData(MIME_TYPE);
        if (raw) {
          const parsed = JSON.parse(raw) as BoardDragData;
          if (
            typeof parsed.conversationId === "string" &&
            typeof parsed.fromStatus === "string"
          ) {
            return parsed;
          }
        }
      } catch {
        // Fall through to the ref so DnD still works in test environments.
      }
      return dragDataRef.current;
    },
    [],
  );

  const getColumnDropProps = React.useCallback<
    UseBoardDndReturn["getColumnDropProps"]
  >(
    (status) => ({
      "aria-dropeffect": "move" as const,
      onDragOver: (event) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = "move";
      },
      onDragEnter: (event) => {
        event.preventDefault();
        hoverDepthRef.current += 1;
        setHoverColumn(status);
      },
      onDragLeave: () => {
        hoverDepthRef.current = Math.max(0, hoverDepthRef.current - 1);
        if (hoverDepthRef.current === 0) {
          setHoverColumn(null);
        }
      },
      onDrop: (event) => {
        event.preventDefault();
        const data = readDragData(event);
        reset();
        if (!data) return;
        if (data.fromStatus === status) return;
        onDrop(data, status);
      },
    }),
    [onDrop, readDragData, reset],
  );

  return {
    draggingId,
    hoverColumn,
    isDragging: draggingId !== null,
    getCardDragProps,
    getColumnDropProps,
  };
}
