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

function board(conversations: SupportConversation[]) {
  return (
    <SupportBoardView
      conversations={conversations}
      selectedConversationId={null}
      onSelectConversation={() => undefined}
      nowIso={NOW}
    />
  );
}

/** The list the refetch brings back once a move is saved. */
function movedTo(id: string, status: SupportConversation["status"]) {
  return CONVERSATIONS.map((row) => (row.id === id ? { ...row, status } : row));
}

function moveTrigger(id: string) {
  return screen.getByRole("button", {
    name: `Move Subject ${id} from Donor ${id}`,
  });
}

function openButton(lane: HTMLElement, id: string) {
  return within(lane).getByRole("button", {
    name: new RegExp(`^Subject ${id}, from Donor ${id},`),
  });
}

async function chooseMove(id: string, lane: string) {
  const trigger = moveTrigger(id);
  trigger.focus();
  fireEvent.click(trigger);
  fireEvent.click(await screen.findByRole("menuitem", { name: lane }));
}

describe("Support board lane jump", () => {
  it("snoozes through a real wake-time picker", async () => {
    renderBoard();
    fireEvent.click(moveTrigger("c1"));
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
    fireEvent.click(moveTrigger("c1"));
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

describe("Support board keyboard moves", () => {
  it("names each card's move menu for its conversation", () => {
    renderBoard();
    for (const row of CONVERSATIONS) {
      expect(moveTrigger(row.id)).toBeTruthy();
    }
  });

  it("follows a card moved from its menu into the new lane", async () => {
    const view = render(board(CONVERSATIONS));
    await chooseMove("c1", "Pending");
    await waitFor(() =>
      expect(move).toHaveBeenCalledWith({
        conversationId: "c1",
        status: "pending",
      }),
    );
    // The card remounts under the Pending lane, taking its menu trigger with it.
    view.rerender(board(movedTo("c1", "pending")));
    const lane = screen.getByRole("region", {
      name: "Pending conversations, 2 items",
    });
    await waitFor(() =>
      expect(document.activeElement).toBe(openButton(lane, "c1")),
    );
  });

  it("follows a card snoozed from the Snooze until dialog", async () => {
    const view = render(board(CONVERSATIONS));
    await chooseMove("c1", "Snoozed");
    fireEvent.click(
      await screen.findByRole("button", { name: /^Tomorrow morning/ }),
    );
    await waitFor(() => expect(move).toHaveBeenCalled());
    view.rerender(board(movedTo("c1", "snoozed")));
    const lane = screen.getByRole("region", {
      name: "Snoozed conversations, 2 items",
    });
    await waitFor(() =>
      expect(document.activeElement).toBe(openButton(lane, "c1")),
    );
  });

  it("returns to the card's menu when the move fails", async () => {
    let fail: (error: Error) => void = () => undefined;
    move.mockReturnValue(
      new Promise((_resolve, reject) => {
        fail = reject;
      }),
    );
    render(board(CONVERSATIONS));
    await chooseMove("c1", "Pending");
    await waitFor(() => expect(document.activeElement).toBe(moveTrigger("c1")));
    // While the save is pending the trigger is disabled, and a browser drops
    // focus from a disabled button.
    moveTrigger("c1").blur();
    fail(new Error("write failed"));
    await waitFor(() => expect(showError).toHaveBeenCalled());
    await waitFor(() => expect(document.activeElement).toBe(moveTrigger("c1")));
  });

  it("focuses the new lane when the moved card leaves the board", async () => {
    const view = render(board(CONVERSATIONS));
    await chooseMove("c1", "Resolved");
    await waitFor(() => expect(move).toHaveBeenCalled());
    // A status filter can drop the moved conversation from the list.
    view.rerender(board(CONVERSATIONS.filter((row) => row.id !== "c1")));
    await waitFor(() =>
      expect(document.activeElement).toBe(
        screen.getByRole("region", { name: "Resolved conversations, 1 item" }),
      ),
    );
  });

  it("leaves focus where the user went while the board caught up", async () => {
    const withSearch = (conversations: SupportConversation[]) => (
      <>
        <input aria-label="Search conversations" />
        {board(conversations)}
      </>
    );
    const view = render(withSearch(CONVERSATIONS));
    await chooseMove("c1", "Pending");
    await waitFor(() => expect(move).toHaveBeenCalled());
    const search = screen.getByRole("textbox", {
      name: "Search conversations",
    });
    search.focus();
    view.rerender(withSearch(movedTo("c1", "pending")));
    await screen.findByRole("region", {
      name: "Pending conversations, 2 items",
    });
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(document.activeElement).toBe(search);
  });

  it("returns to the card's menu when the Snooze until dialog is dismissed", async () => {
    const view = render(board(CONVERSATIONS));
    await chooseMove("c1", "Snoozed");
    fireEvent.click(
      await screen.findByRole("button", { name: /^Tomorrow morning/ }),
    );
    await waitFor(() =>
      expect(screen.queryByRole("dialog", { name: "Snooze until" })).toBeNull(),
    );
    view.rerender(board(movedTo("c1", "snoozed")));
    await chooseMove("c2", "Snoozed");
    const dialog = await screen.findByRole("dialog", { name: "Snooze until" });
    fireEvent.keyDown(document.activeElement ?? dialog, { key: "Escape" });
    await waitFor(() =>
      expect(screen.queryByRole("dialog", { name: "Snooze until" })).toBeNull(),
    );
    expect(move).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(document.activeElement).toBe(moveTrigger("c2")));
  });

  it("follows a snoozed card when the board refreshes before the save returns", async () => {
    const view = render(board(CONVERSATIONS));
    // The mutation awaits its cache refetch, so the card has already moved
    // lanes, and the dialog still holds focus, when the save resolves.
    move.mockImplementation(() =>
      Promise.resolve().then(() => {
        view.rerender(board(movedTo("c1", "snoozed")));
        return {};
      }),
    );
    await chooseMove("c1", "Snoozed");
    const option = await screen.findByRole("button", {
      name: /^Tomorrow morning/,
    });
    option.focus();
    fireEvent.click(option);
    await waitFor(() =>
      expect(screen.queryByRole("dialog", { name: "Snooze until" })).toBeNull(),
    );
    const lane = screen.getByRole("region", {
      name: "Snoozed conversations, 2 items",
    });
    await waitFor(() =>
      expect(document.activeElement).toBe(openButton(lane, "c1")),
    );
  });
});
