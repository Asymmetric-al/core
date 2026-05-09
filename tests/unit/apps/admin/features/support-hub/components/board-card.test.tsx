// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { BoardCard } from "../../../../../../../apps/admin/features/support-hub/components/board/BoardCard";
import type { SupportConversation } from "../../../../../../../apps/admin/features/support-hub/types";

afterEach(() => {
  cleanup();
});

const NOW = "2026-04-15T12:00:00.000Z";

const BASE_CONVERSATION: SupportConversation = {
  id: "conv-1",
  tenantId: "tenant-1",
  inboxId: "inbox-1",
  subject: "Receipt question",
  status: "open",
  priority: "normal",
  channel: "email",
  assignee: null,
  team: null,
  externalContactName: "Anita Gonzalez",
  externalContactEmail: "anita@example.com",
  contact: null,
  labels: [],
  unreadCount: 0,
  messageCount: 1,
  firstMessageAt: NOW,
  lastMessageAt: NOW,
  lastCustomerMessageAt: NOW,
  lastMessageDirection: "inbound",
  firstRespondedAt: null,
  firstResponseDueAt: null,
  nextResponseDueAt: null,
  resolvedAt: null,
  snoozedUntil: null,
  escalatedAt: null,
  boardOrder: 0,
  slaPolicyId: null,
  createdAt: NOW,
  updatedAt: NOW,
};

const DRAG_PROPS = {
  draggable: true as const,
  onDragStart: () => undefined,
  onDragEnd: () => undefined,
};

describe("BoardCard a11y", () => {
  it("renders donor name + subject as the accessible label", () => {
    const onSelect = vi.fn();
    render(
      <BoardCard
        conversation={BASE_CONVERSATION}
        isSelected={false}
        isDragging={false}
        nowIso={NOW}
        onSelect={onSelect}
        dragHandleProps={DRAG_PROPS}
      />,
    );
    const button = screen.getByRole("button", { name: /Receipt question/i });
    expect(button).toBeTruthy();
    expect(button.getAttribute("aria-label")).toContain("Anita Gonzalez");
    expect(button.getAttribute("aria-label")).toContain("status open");
    expect(button.getAttribute("aria-label")).toContain("unassigned");
    expect(button.getAttribute("aria-pressed")).toBe("false");
  });

  it("toggles aria-pressed when selected", () => {
    render(
      <BoardCard
        conversation={BASE_CONVERSATION}
        isSelected
        isDragging={false}
        nowIso={NOW}
        onSelect={() => undefined}
        dragHandleProps={DRAG_PROPS}
      />,
    );
    const button = screen.getByRole("button", { name: /Receipt question/i });
    expect(button.getAttribute("aria-pressed")).toBe("true");
  });

  it("includes 'past due' when the first response is overdue", () => {
    const conversation: SupportConversation = {
      ...BASE_CONVERSATION,
      firstResponseDueAt: "2026-04-15T10:00:00.000Z",
      firstRespondedAt: null,
    };
    render(
      <BoardCard
        conversation={conversation}
        isSelected={false}
        isDragging={false}
        nowIso={NOW}
        onSelect={() => undefined}
        dragHandleProps={DRAG_PROPS}
      />,
    );
    const button = screen.getByRole("button", { name: /Receipt question/i });
    expect(button.getAttribute("aria-label")).toContain("past due");
  });
});
