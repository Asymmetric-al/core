// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

// eslint-disable-next-line no-restricted-imports -- TODO(admin-ui-boundary-regression) App regression test at the inbox notice's public UI boundary.
import { ForYouNotice } from "../../../../../../../apps/admin/features/support-hub/components/alerts/ForYouNotice";

const NOW = "2026-04-15T12:00:00.000Z";

const state = vi.hoisted(() => ({
  agentId: "agent-me" as string | null,
  preferences: null as Record<string, unknown> | null,
  conversations: [] as unknown[],
}));

vi.mock(
  "../../../../../../../apps/admin/features/support-hub/hooks/use-support-conversations",
  () => ({
    useSupportConversations: () => ({ data: state.conversations }),
  }),
);
vi.mock(
  "../../../../../../../apps/admin/features/support-hub/hooks/use-support-notification-preferences",
  () => ({
    useSupportNotificationPreferences: () => ({
      for: () => state.preferences,
      isReady: true,
    }),
  }),
);
vi.mock(
  "../../../../../../../apps/admin/features/support-hub/lib/current-agent",
  () => ({ useCurrentSupportAgentId: () => state.agentId }),
);
vi.mock("../../../../../../../apps/admin/features/support-hub/lib/now", () => ({
  useSupportNow: () => NOW,
}));

afterEach(() => {
  cleanup();
  state.agentId = "agent-me";
  state.preferences = null;
  state.conversations = [];
});

function mine(overrides: Record<string, unknown>) {
  return {
    id: String(Math.random()),
    status: "open",
    assignee: { id: "agent-me", name: "Me" },
    unreadCount: 0,
    firstRespondedAt: null,
    firstResponseDueAt: null,
    nextResponseDueAt: null,
    ...overrides,
  };
}

describe("ForYouNotice", () => {
  it("shows my unread and at-risk counts, and opens the Mine view", () => {
    state.conversations = [
      mine({ unreadCount: 1 }),
      mine({ unreadCount: 4 }),
      mine({ firstResponseDueAt: "2026-04-15T11:00:00.000Z" }),
    ];
    const onShowMine = vi.fn();
    render(<ForYouNotice showMineAction onShowMine={onShowMine} />);
    const notice = screen.getByRole("status", { name: "For you" });
    expect(notice.textContent).toContain(
      "2 unread conversations assigned to you",
    );
    expect(notice.textContent).toContain(
      "1 of yours overdue or due within the hour",
    );
    fireEvent.click(screen.getByRole("button", { name: "Show mine" }));
    expect(onShowMine).toHaveBeenCalledTimes(1);
  });

  it("respects saved in-app preferences: an off channel is not shown", () => {
    state.preferences = {
      inAppMentions: true,
      inAppAssignments: false,
      inAppSlaWarnings: true,
    };
    state.conversations = [
      mine({ unreadCount: 1 }),
      mine({ firstResponseDueAt: "2026-04-15T11:00:00.000Z" }),
    ];
    render(<ForYouNotice showMineAction onShowMine={vi.fn()} />);
    const notice = screen.getByRole("status", { name: "For you" });
    expect(notice.textContent).not.toContain("unread");
    expect(notice.textContent).toContain(
      "1 of yours overdue or due within the hour",
    );
  });

  it("renders nothing when both channels are off", () => {
    state.preferences = {
      inAppMentions: true,
      inAppAssignments: false,
      inAppSlaWarnings: false,
    };
    state.conversations = [mine({ unreadCount: 1 })];
    const { container } = render(
      <ForYouNotice showMineAction onShowMine={vi.fn()} />,
    );
    expect(container.textContent).toBe("");
  });

  it("renders nothing when there is nothing for me", () => {
    state.conversations = [mine({})];
    const { container } = render(
      <ForYouNotice showMineAction onShowMine={vi.fn()} />,
    );
    expect(container.textContent).toBe("");
  });

  it("drops the Show mine button when the Mine view is already open", () => {
    state.conversations = [mine({ unreadCount: 1 })];
    render(<ForYouNotice showMineAction={false} onShowMine={vi.fn()} />);
    expect(screen.getByRole("status", { name: "For you" })).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Show mine" })).toBeNull();
  });
});
