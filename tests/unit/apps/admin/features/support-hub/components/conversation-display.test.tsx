// @vitest-environment jsdom

import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ConversationSlaChip } from "../../../../../../../apps/admin/features/support-hub/components/detail/ConversationSlaChip";
import { ConversationSnoozeMenu } from "../../../../../../../apps/admin/features/support-hub/components/detail/ConversationSnoozeMenu";
import { InboxCell } from "../../../../../../../apps/admin/features/support-hub/components/table/cells";
import type { SupportConversation } from "../../../../../../../apps/admin/features/support-hub/types";

const { inboxes, snooze, unsnooze, showError } = vi.hoisted(() => ({
  inboxes: {
    data: [{ id: "inbox-1", name: "Donor care" }],
    isLoading: false,
    isError: false,
  },
  snooze: vi.fn(),
  unsnooze: vi.fn(),
  showError: vi.fn(),
}));
vi.mock(
  "../../../../../../../apps/admin/features/support-hub/hooks/use-support-inbox-settings",
  () => ({ useSupportInboxes: () => inboxes }),
);
vi.mock("../../../../../../../apps/admin/features/support-hub/lib/now", () => ({
  useSupportNow: () => "2026-04-15T12:00:00.000Z",
}));
vi.mock(
  "../../../../../../../apps/admin/features/support-hub/hooks/use-support-mutations",
  () => ({
    useSnoozeSupportConversation: () => ({
      mutateAsync: snooze,
      isPending: false,
    }),
    useUnsnoozeSupportConversation: () => ({
      mutateAsync: unsnooze,
      isPending: false,
    }),
  }),
);
vi.mock("sonner", () => ({ toast: { error: showError } }));

const conversation: SupportConversation = {
  id: "conversation-1",
  tenantId: "tenant-1",
  inboxId: "inbox-1",
  subject: "A question",
  status: "open",
  priority: "normal",
  channel: "email",
  assignee: null,
  team: null,
  externalContactName: "A donor",
  externalContactEmail: "donor@example.org",
  contact: null,
  labels: [],
  unreadCount: 0,
  messageCount: 1,
  firstMessageAt: null,
  lastMessageAt: null,
  lastCustomerMessageAt: null,
  lastMessageDirection: "inbound",
  firstRespondedAt: null,
  firstResponseDueAt: null,
  nextResponseDueAt: null,
  resolvedAt: null,
  snoozedUntil: null,
  escalatedAt: null,
  boardOrder: 0,
  slaPolicyId: null,
  createdAt: "2026-04-15T12:00:00.000Z",
  updatedAt: "2026-04-15T12:00:00.000Z",
};

beforeEach(() => {
  inboxes.isLoading = false;
  inboxes.isError = false;
  snooze.mockReset().mockResolvedValue({});
  unsnooze.mockReset().mockResolvedValue({});
  showError.mockReset();
});
afterEach(cleanup);

describe("conversation display", () => {
  it("names inboxes without exposing their database identifiers", () => {
    const view = render(<InboxCell inboxId="inbox-1" />);
    expect(screen.getByText("Donor care")).toBeTruthy();
    expect(view.container.textContent).not.toContain("inbox-1");
    inboxes.isError = true;
    view.rerender(<InboxCell inboxId="inbox-1" />);
    expect(screen.getByText("Inbox unavailable")).toBeTruthy();
    inboxes.isError = false;
    inboxes.isLoading = true;
    view.rerender(<InboxCell inboxId="inbox-1" />);
    expect(screen.getByText("Loading inbox…")).toBeTruthy();
  });

  it.each([
    ["2026-04-15T09:00:00.000Z", "Reply overdue by 3h", "destructive-subtle"],
    ["2026-04-15T12:20:00.000Z", "Reply due in 20m", "warning"],
    ["2026-04-15T14:00:00.000Z", "On track, due in 2h", "success"],
  ])("uses precise reply timing for %s", (due, text, variant) => {
    render(
      <ConversationSlaChip
        conversation={{ ...conversation, firstResponseDueAt: due }}
      />,
    );
    expect(screen.getByText(text).getAttribute("data-variant")).toBe(variant);
  });

  it("saves a real next-day morning wake time", async () => {
    render(<ConversationSnoozeMenu conversation={conversation} />);
    fireEvent.click(
      screen.getByRole("button", { name: "Snooze conversation" }),
    );
    fireEvent.click(
      await screen.findByRole("menuitem", { name: /^Tomorrow morning/ }),
    );
    const now = new Date("2026-04-15T12:00:00.000Z");
    expect(snooze).toHaveBeenCalledWith({
      conversationId: "conversation-1",
      snoozedUntil: new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() + 1,
        8,
      ).toISOString(),
    });
  });

  it("shows an existing wake time and offers wake up now", async () => {
    render(
      <ConversationSnoozeMenu
        conversation={{
          ...conversation,
          status: "snoozed",
          snoozedUntil: "2026-04-16T08:00:00.000Z",
        }}
      />,
    );
    expect(screen.getByText(/Snoozed until/)).toBeTruthy();
    fireEvent.click(
      screen.getByRole("button", { name: "Snooze conversation" }),
    );
    fireEvent.click(
      await screen.findByRole("menuitem", { name: "Wake up now" }),
    );
    expect(unsnooze).toHaveBeenCalledWith({ conversationId: "conversation-1" });
  });

  it("reports a failed snooze instead of an unhandled rejection", async () => {
    snooze.mockRejectedValue(new Error("Couldn’t save the snooze time."));
    render(<ConversationSnoozeMenu conversation={conversation} />);
    fireEvent.click(
      screen.getByRole("button", { name: "Snooze conversation" }),
    );
    fireEvent.click(
      await screen.findByRole("menuitem", { name: /^In 1 hour/ }),
    );
    await waitFor(() =>
      expect(showError).toHaveBeenCalledWith("Couldn’t save the snooze time."),
    );
  });
});
