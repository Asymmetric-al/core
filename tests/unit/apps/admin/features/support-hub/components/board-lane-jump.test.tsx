// @vitest-environment jsdom

import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// eslint-disable-next-line no-restricted-imports -- TODO(admin-ui-boundary-regression) App regression test at the board's public boundary.
import { SupportBoardView } from "../../../../../../../apps/admin/features/support-hub/components/board/SupportBoardView";

// eslint-disable-next-line no-restricted-imports -- TODO(admin-ui-boundary-regression) Fixtures use the app's public wire-format types.
import type { SupportConversation } from "../../../../../../../apps/admin/features/support-hub/types";

const { move, showError } = vi.hoisted(() => ({
  move: vi.fn(),
  showError: vi.fn(),
}));

vi.mock("sonner", () => ({ toast: { error: showError } }));

vi.mock(
  "../../../../../../../apps/admin/features/support-hub/hooks/use-support-mutations",
  () => ({
    useSetSupportConversationStatus: () => ({
      mutateAsync: move,
      isPending: false,
    }),
  }),
);

const NOW = "2026-04-15T12:00:00.000Z";

function conversation(
  id: string,
  status: SupportConversation["status"],
): SupportConversation {
  return {
    id,
    tenantId: "tenant-1",
    inboxId: "inbox-1",
    subject: `Subject ${id}`,
    status,
    priority: "normal",
    channel: "email",
    assignee: null,
    team: null,
    externalContactName: `Donor ${id}`,
    externalContactEmail: `${id}@example.org`,
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
}

const CONVERSATIONS = [
  conversation("c1", "open"),
  conversation("c2", "open"),
  conversation("c3", "pending"),
  conversation("c4", "snoozed"),
  conversation("c5", "resolved"),
];

const scrollTo = vi.fn();

beforeEach(() => {
  move.mockReset().mockResolvedValue({});
  showError.mockReset();
  scrollTo.mockReset();
  vi.stubGlobal("scrollTo", scrollTo);
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

function renderBoard(props: { laneScrollOffset?: () => number } = {}) {
  return render(
    <SupportBoardView
      conversations={CONVERSATIONS}
      selectedConversationId={null}
      onSelectConversation={() => undefined}
      nowIso={NOW}
      {...props}
    />,
  );
}

describe("Support board lane jump", () => {
  it("snoozes through a real wake-time picker", async () => {
    renderBoard();
    fireEvent.click(
      screen.getAllByRole("button", { name: "Move conversation" })[0]!,
    );
    fireEvent.click(await screen.findByRole("menuitem", { name: "Snoozed" }));
    expect(move).not.toHaveBeenCalled();
    fireEvent.click(
      await screen.findByRole("button", { name: /^Tomorrow morning/ }),
    );
    const now = new Date(NOW);
    await waitFor(() =>
      expect(move).toHaveBeenCalledWith({
        conversationId: "c1",
        status: "snoozed",
        snoozedUntil: new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate() + 1,
          8,
        ).toISOString(),
      }),
    );
  });

  it("reports failed moves without claiming success", async () => {
    move.mockRejectedValue(new Error("write failed"));
    renderBoard();
    fireEvent.click(
      screen.getAllByRole("button", { name: "Move conversation" })[0]!,
    );
    fireEvent.click(await screen.findByRole("menuitem", { name: "Pending" }));
    await waitFor(() =>
      expect(showError).toHaveBeenCalledWith(
        "Couldn’t move the conversation. Try again.",
      ),
    );
  });

  it("lists compact lane jumps on phones and intermediate widths", () => {
    renderBoard();
    const nav = screen.getByRole("navigation", { name: "Jump to a lane" });
    expect(
      within(nav)
        .getAllByRole("button")
        .map((button) => button.textContent),
    ).toEqual(["Open2", "Pending1", "Snoozed1", "Resolved1"]);
    expect(nav.className.split(" ")).toEqual(
      expect.arrayContaining(["flex", "@5xl:hidden"]),
    );
    expect(nav.className.split(" ")).not.toContain("hidden");
    for (const button of within(nav).getAllByRole("button")) {
      expect(button.getAttribute("data-size")).toBe("xs");
    }
  });

  it("scrolls a lane to just under the sticky filters and moves focus to it", () => {
    renderBoard({ laneScrollOffset: () => 200 });
    const nav = screen.getByRole("navigation", { name: "Jump to a lane" });
    fireEvent.click(within(nav).getByRole("button", { name: /^Resolved/ }));
    const lane = screen.getByRole("region", {
      name: "Resolved conversations, 1 item",
    });
    expect(scrollTo).toHaveBeenCalledWith({ top: -200 });
    expect(document.activeElement).toBe(lane);
    // Focusable by script only: no extra Tab stop.
    expect(lane.getAttribute("tabindex")).toBe("-1");
  });

  it("leaves room for the app header when the filters do not stick", () => {
    renderBoard();
    const nav = screen.getByRole("navigation", { name: "Jump to a lane" });
    fireEvent.click(within(nav).getByRole("button", { name: /^Snoozed/ }));
    expect(scrollTo).toHaveBeenCalledWith({ top: -56 });
  });
});
