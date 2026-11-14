// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

// eslint-disable-next-line no-restricted-imports -- TODO(admin-ui-boundary-regression) App regression test at the module's public boundary.
import { BoardCard } from "../../../../../../../apps/admin/features/support-hub/components/board/BoardCard";

// eslint-disable-next-line no-restricted-imports -- TODO(admin-ui-boundary-regression) App regression test at the module's public boundary.
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
    expect(button.hasAttribute("aria-pressed")).toBe(false);
    expect(button.getAttribute("aria-current")).toBe("false");
  });

  it("keeps assignment in the conversation name without naming a generic decorative marker", () => {
    const { container } = render(
      <BoardCard
        conversation={BASE_CONVERSATION}
        isSelected={false}
        isDragging={false}
        nowIso={NOW}
        onSelect={() => undefined}
        dragHandleProps={DRAG_PROPS}
      />,
    );
    expect(
      screen.getByRole("button", { name: /Receipt question.*unassigned/i }),
    ).toBeTruthy();
    // Generic spans cannot carry aria-label (axe aria-prohibited-attr).
    expect(container.querySelector("span[aria-label]:not([role])")).toBeNull();
  });

  it("marks the current conversation when selected", () => {
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
    expect(button.getAttribute("aria-current")).toBe("true");
  });

  it("offers move actions without nesting the menu inside the conversation button", async () => {
    const onMove = vi.fn();
    const onSelect = vi.fn();
    render(
      <BoardCard
        conversation={BASE_CONVERSATION}
        isSelected={false}
        isDragging={false}
        nowIso={NOW}
        onSelect={onSelect}
        onMove={onMove}
        dragHandleProps={DRAG_PROPS}
      />,
    );
    const trigger = screen.getByRole("button", { name: "Move conversation" });
    expect(trigger.closest("footer")).not.toBeNull();
    expect(
      trigger.closest("button")?.parentElement?.closest("button"),
    ).toBeNull();
    fireEvent.click(trigger);
    fireEvent.click(await screen.findByRole("menuitem", { name: "Pending" }));
    expect(onMove).toHaveBeenCalledWith("conv-1", "pending");
    expect(onSelect).not.toHaveBeenCalled();
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

  it("names what the card shows: unread, priority and every label, in reading order", () => {
    const conversation: SupportConversation = {
      ...BASE_CONVERSATION,
      unreadCount: 2,
      priority: "urgent",
      labels: [
        { id: "l-1", name: "Receipts", tone: "info" },
        { id: "l-2", name: "Gift aid", tone: "neutral" },
        { id: "l-3", name: "Employer match", tone: "success" },
      ] as SupportConversation["labels"],
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
    expect(button.getAttribute("aria-label")).toBe(
      "Unread, Receipt question, from Anita Gonzalez, status open, urgent priority, labels Receipts, Gift aid and Employer match, unassigned",
    );
  });

  it("leaves normal priority, read state and an empty label list out of the name", () => {
    render(
      <BoardCard
        conversation={BASE_CONVERSATION}
        isSelected={false}
        isDragging={false}
        nowIso={NOW}
        onSelect={() => undefined}
        dragHandleProps={DRAG_PROPS}
      />,
    );
    const button = screen.getByRole("button", { name: /Receipt question/i });
    expect(button.getAttribute("aria-label")).toBe(
      "Receipt question, from Anita Gonzalez, status open, unassigned",
    );
  });

  it("does not repeat a label named like the priority", () => {
    const conversation: SupportConversation = {
      ...BASE_CONVERSATION,
      priority: "high",
      labels: [
        { id: "l-1", name: "High", tone: "warning" },
        { id: "l-2", name: "Receipts", tone: "info" },
      ] as SupportConversation["labels"],
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
    expect(button.getAttribute("aria-label")).toContain(
      "high priority, label Receipts,",
    );
  });
});

describe("BoardCard badges", () => {
  it("keeps priority and labels on one line, truncating a long label with its full name kept", () => {
    const conversation: SupportConversation = {
      ...BASE_CONVERSATION,
      priority: "urgent",
      labels: [
        {
          id: "label-1",
          tenantId: "tenant-1",
          slug: "receipt-correction-request",
          name: "Receipt correction request",
          tone: "blue",
          description: null,
        },
      ],
    };
    const { container } = render(
      <BoardCard
        conversation={conversation}
        isSelected={false}
        isDragging={false}
        nowIso={NOW}
        onSelect={() => undefined}
        dragHandleProps={DRAG_PROPS}
      />,
    );
    const priority = screen.getByText("Urgent");
    const row = priority.parentElement!;
    expect(row.className).not.toMatch(/\bflex-wrap\b/);
    expect(row.className).toMatch(/\bflex-nowrap\b/);
    expect(row.className).toMatch(/\boverflow-hidden\b/);
    expect(priority.className).toMatch(/\bshrink-0\b/);

    const labelText = screen.getByText("Receipt correction request");
    expect(labelText.className).toMatch(/\btruncate\b/);
    const chip = labelText.closest("[title]");
    expect(chip?.getAttribute("title")).toBe("Receipt correction request");
    expect(chip?.className).toMatch(/\bmin-w-0\b/);
    expect(container.querySelectorAll("footer").length).toBe(1);
  });
});
