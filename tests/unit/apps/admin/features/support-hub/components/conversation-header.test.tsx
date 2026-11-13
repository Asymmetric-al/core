// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

// eslint-disable-next-line no-restricted-imports -- TODO(admin-ui-boundary-regression) App regression test at the conversation header's public UI boundary.
import { ConversationHeader } from "../../../../../../../apps/admin/features/support-hub/components/detail/ConversationHeader";

vi.mock(
  "../../../../../../../apps/admin/features/support-hub/components/detail/ConversationAssigneeMenu",
  () => ({
    ConversationAssigneeMenu: () => <span>Assignee menu</span>,
  }),
);
vi.mock(
  "../../../../../../../apps/admin/features/support-hub/components/detail/ConversationContactSidecar",
  () => ({
    ConversationContactSidecar: () => <span>Donor card</span>,
  }),
);
vi.mock(
  "../../../../../../../apps/admin/features/support-hub/components/detail/ConversationLabelMenu",
  () => ({
    ConversationLabelMenu: () => <span>Label menu</span>,
  }),
);
vi.mock(
  "../../../../../../../apps/admin/features/support-hub/components/detail/ConversationMacrosMenu",
  () => ({
    ConversationMacrosMenu: () => <span>Macros</span>,
  }),
);
vi.mock(
  "../../../../../../../apps/admin/features/support-hub/components/detail/ConversationPriorityMenu",
  () => ({
    ConversationPriorityMenu: () => <span>Priority menu</span>,
  }),
);
vi.mock(
  "../../../../../../../apps/admin/features/support-hub/components/detail/ConversationSlaChip",
  () => ({
    ConversationSlaChip: () => <span>SLA</span>,
  }),
);
vi.mock(
  "../../../../../../../apps/admin/features/support-hub/components/detail/ConversationSnoozeMenu",
  () => ({
    ConversationSnoozeMenu: () => <span>Snooze</span>,
  }),
);
vi.mock(
  "../../../../../../../apps/admin/features/support-hub/components/detail/ConversationStatusMenu",
  () => ({
    ConversationStatusMenu: () => <span>Status menu</span>,
  }),
);
vi.mock(
  "../../../../../../../apps/admin/features/support-hub/hooks/use-support-mutations",
  () => ({ useSetSupportConversationStatus: () => ({ mutate: vi.fn() }) }),
);
const inboxSettingsState = vi.hoisted(() => ({
  byInbox: {} as Record<string, { showContactSidecar: boolean }>,
  requested: [] as Array<string | null | undefined>,
}));
vi.mock(
  "../../../../../../../apps/admin/features/support-hub/hooks/use-support-inbox-settings",
  () => ({
    useSupportInboxSettings: (inboxId?: string | null) => {
      inboxSettingsState.requested.push(inboxId);
      return {
        data: inboxId ? inboxSettingsState.byInbox[inboxId] : undefined,
        all: [],
        isLoading: false,
        isReady: true,
        isError: false,
      };
    },
  }),
);
vi.mock("../../../../../../../apps/admin/features/support-hub/lib/now", () => ({
  useSupportNow: () => "2026-11-09T12:00:00.000Z",
}));

afterEach(() => {
  cleanup();
  inboxSettingsState.byInbox = {};
  inboxSettingsState.requested = [];
});

const conversation = {
  id: "c-1",
  subject: "Receipt for my March gift is missing the employer match",
  inboxId: "inbox-donor-care",
  status: "open",
  lastMessageAt: "2026-11-09T10:00:00.000Z",
  labels: [],
} as never;

describe("ConversationHeader", () => {
  it("names the status in sentence case in the crumb", () => {
    render(
      <ConversationHeader conversation={conversation} onClose={vi.fn()} />,
    );
    const crumb = screen.getByText("Open", { selector: "span" });
    expect(crumb).toBeTruthy();
    expect(screen.queryByText("open", { exact: true })).toBeNull();
  });

  it("wraps a long subject to two lines instead of cutting it off", () => {
    render(
      <ConversationHeader conversation={conversation} onClose={vi.fn()} />,
    );
    const subject = screen.getByRole("heading", { level: 2 });
    const classes = subject.className.split(" ");
    expect(classes).toContain("line-clamp-2");
    expect(classes).not.toContain("truncate");
  });

  it("stacks the donor card above the menus unless the pane itself is wide", () => {
    const { container } = render(
      <ConversationHeader conversation={conversation} onClose={vi.fn()} />,
    );
    // The desktop pane is a third of the page: a viewport breakpoint would
    // squeeze the donor card and the menus side by side, so the header
    // measures itself (container query) instead.
    expect(container.querySelector("header")!.className).toContain(
      "@container",
    );
    const row = screen.getByText("Donor card").parentElement!.parentElement!;
    expect(row.className.split(" ")).toContain("@md:flex-row");
    expect(row.className).not.toContain("lg:flex-row");
  });

  it("hides the donor panel when the conversation's inbox turns it off", () => {
    inboxSettingsState.byInbox = {
      "inbox-donor-care": { showContactSidecar: false },
    };
    render(
      <ConversationHeader conversation={conversation} onClose={vi.fn()} />,
    );
    expect(inboxSettingsState.requested).toContain("inbox-donor-care");
    expect(screen.queryByText("Donor card")).toBeNull();
    // The menus keep their row.
    expect(
      screen.getByRole("group", { name: "Conversation settings" }),
    ).toBeTruthy();
  });

  it("shows the donor panel when the inbox turns it on", () => {
    inboxSettingsState.byInbox = {
      "inbox-donor-care": { showContactSidecar: true },
    };
    render(
      <ConversationHeader conversation={conversation} onClose={vi.fn()} />,
    );
    expect(screen.getByText("Donor card")).toBeTruthy();
  });

  it("shows the donor panel when the inbox has no saved settings (the stored default)", () => {
    render(
      <ConversationHeader conversation={conversation} onClose={vi.fn()} />,
    );
    expect(screen.getByText("Donor card")).toBeTruthy();
  });

  it("keeps status, owner, priority and labels on one wrapping row", () => {
    // Two stacked rows took height from the thread in the desktop pane.
    render(
      <ConversationHeader
        conversation={
          {
            ...(conversation as object),
            labels: [{ id: "l-1", name: "Receipts", tone: "info" }],
          } as never
        }
        onClose={vi.fn()}
      />,
    );
    const group = screen.getByRole("group", { name: "Conversation settings" });
    for (const text of [
      "Status menu",
      "Assignee menu",
      "Priority menu",
      "Receipts",
      "Label menu",
    ]) {
      expect(group.textContent).toContain(text);
    }
    expect(group.className.split(" ")).toContain("flex-wrap");
  });
});
