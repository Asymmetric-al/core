// @vitest-environment jsdom

import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { setPlatform } from "@ui-sdk/core/testing";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// eslint-disable-next-line no-restricted-imports -- TODO(admin-ui-boundary-regression) App regression test at the inbox's public boundary.
import { SupportInbox } from "../../../../../../../apps/admin/features/support-hub/components/SupportInbox";
import { useShortcut } from "../../../../../../../packages/ui/components/primitives/shortcut";

// eslint-disable-next-line no-restricted-imports -- TODO(admin-ui-boundary-regression) Fixtures use the app's public wire-format types.
import type { SupportConversation } from "../../../../../../../apps/admin/features/support-hub/types";
import type { ReactNode } from "react";

const fixture = vi.hoisted(() => ({
  rows: [] as SupportConversation[],
  isError: false,
  refetchFails: false,
  retry: (() => Promise.resolve()) as () => Promise<void>,
  // Conversations the pane has loaded; null means all of them.
  loadedDetails: null as Set<string> | null,
  // What each mutation was asked to save, in order.
  mutations: [] as unknown[],
}));

const route = vi.hoisted(() => {
  const defaults = {
    view: "all",
    layout: "board",
    status: "all",
    q: "",
    labelSlugs: [] as string[],
    assignee: "",
    selectedConversationId: null as string | null,
    section: "inbox",
  };
  let state = { ...defaults };
  const listeners = new Set<() => void>();
  const emit = () => listeners.forEach((listener) => listener());
  return {
    get: () => state,
    set: (next: Partial<typeof defaults>) => {
      state = { ...state, ...next };
      emit();
    },
    reset: () => {
      state = { ...defaults };
      emit();
    },
    subscribe: (listener: () => void) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
});

vi.mock(
  "../../../../../../../apps/admin/features/support-hub/lib/route-state",
  async () => {
    const { useSyncExternalStore } = await import("react");
    return {
      useSupportInboxState: () => ({
        state: useSyncExternalStore(route.subscribe, route.get, route.get),
        setState: route.set,
        resetState: route.reset,
      }),
    };
  },
);
vi.mock(
  "../../../../../../../apps/admin/features/support-hub/hooks/use-support-conversations",
  async () => {
    const { selectConversations } =
      await import("../../../../../../../apps/admin/features/support-hub/lib/selectors");
    return {
      useSupportConversations: (
        options: {
          filter?: Parameters<typeof selectConversations>[1];
        } = {},
      ) => ({
        data: options.filter
          ? selectConversations(fixture.rows, options.filter)
          : fixture.rows,
        isLoading: false,
        isError: fixture.isError,
        refetch: () => {
          if (!fixture.refetchFails) fixture.isError = false;
          return Promise.resolve({ isError: fixture.isError });
        },
      }),
    };
  },
);
vi.mock(
  "../../../../../../../apps/admin/features/support-hub/lib/current-agent",
  () => ({ useCurrentSupportAgentId: () => "agent-me" }),
);
vi.mock("../../../../../../../apps/admin/features/support-hub/lib/now", () => ({
  SupportNowProvider: ({ children }: { children: ReactNode }) => children,
  useSupportNow: () => "2026-04-15T12:00:00.000Z",
}));
vi.mock(
  "../../../../../../../apps/admin/features/support-hub/hooks/use-support-mutations",
  () => {
    const idle = () => ({
      mutateAsync: (input: unknown) => {
        fixture.mutations.push(input);
        return Promise.resolve({});
      },
      isPending: false,
    });
    return {
      useSetSupportConversationStatus: idle,
      useSnoozeSupportConversation: idle,
      useAssignSupportConversation: idle,
      useToggleSupportLabel: idle,
      useRunSupportMacro: idle,
      useApplyRoundRobinAssignment: idle,
    };
  },
);
vi.mock(
  "../../../../../../../apps/admin/features/support-hub/hooks/use-support-labels",
  () => ({ useSupportLabels: () => ({ data: [] }) }),
);
vi.mock(
  "../../../../../../../apps/admin/features/support-hub/hooks/use-support-notification-preferences",
  () => ({
    useSupportNotificationPreferences: () => ({
      isLoading: false,
      for: () => null,
    }),
  }),
);
vi.mock(
  "../../../../../../../apps/admin/features/support-hub/components/alerts/SupportAgentSetupNotice",
  () => ({ SupportAgentSetupNotice: () => null }),
);
vi.mock(
  "../../../../../../../apps/admin/features/support-hub/hooks/use-support-macros",
  () => ({ useSupportMacros: () => ({ data: [] }) }),
);
vi.mock(
  "../../../../../../../apps/admin/features/support-hub/hooks/use-support-saved-views",
  () => ({ useSupportSavedViews: () => ({ data: [] }) }),
);
vi.mock(
  "../../../../../../../apps/admin/features/support-hub/components/views/SavedViewsBar",
  () => ({ SavedViewsBar: () => null }),
);
vi.mock(
  "../../../../../../../apps/admin/features/support-hub/components/detail/ConversationDetail",
  async () => {
    const { Sheet, SheetContent, SheetTitle } =
      await import("../../../../../../../packages/ui/components/shadcn/sheet");
    const { useSupportSnoozeMenuRequest } =
      await import("../../../../../../../apps/admin/features/support-hub/lib/snooze-menu-request");
    // The snooze menu opens on the inbox's request; here it says so.
    function SnoozeMenuRequest() {
      const requestedId = useSupportSnoozeMenuRequest()?.requestedId;
      return requestedId ? <p>Snooze menu open for {requestedId}</p> : null;
    }
    return {
      ConversationDetail: ({
        conversationId,
        layout,
        onClose,
        finalFocus,
      }: {
        conversationId: string | null;
        layout: "inline" | "sheet";
        onClose: () => void;
        finalFocus?: () => HTMLElement | null;
      }) => {
        if (layout === "sheet") {
          // The real phone sheet: a modal portaled out of the inbox.
          return (
            <Sheet
              open={conversationId !== null}
              onOpenChange={(open) => {
                if (!open) onClose();
              }}
            >
              <SheetContent finalFocus={finalFocus}>
                <SheetTitle>Conversation {conversationId}</SheetTitle>
                <button type="button">Assign</button>
                <textarea aria-label="Reply message" />
                <SnoozeMenuRequest />
              </SheetContent>
            </Sheet>
          );
        }
        return conversationId ? (
          <aside aria-label="Conversation detail">
            {fixture.loadedDetails?.has(conversationId) === false ? (
              <p>Loading conversation</p>
            ) : (
              <button type="button">Reply</button>
            )}
            <SnoozeMenuRequest />
          </aside>
        ) : null;
      },
    };
  },
);
// The summary strip mounts inside the failure recovery provider, so it stands
// in for a mutation that reports a failure.
vi.mock(
  "../../../../../../../apps/admin/features/support-hub/components/stats/StatsStrip",
  async () => {
    const { useSupportFailureRecovery } =
      await import("../../../../../../../apps/admin/features/support-hub/hooks/use-support-failure-recovery");
    return {
      StatsStrip: () => {
        const recovery = useSupportFailureRecovery();
        return (
          <button
            type="button"
            onClick={() =>
              recovery.report({
                kind: "assign",
                message: "Network down",
                conversationId: "one",
                retry: fixture.retry,
              })
            }
          >
            Report failure
          </button>
        );
      },
    };
  },
);
vi.mock(
  "../../../../../../../apps/admin/features/support-hub/components/toolbar/AssigneeFilter",
  () => ({ AssigneeFilter: () => null }),
);
vi.mock(
  "../../../../../../../apps/admin/features/support-hub/components/toolbar/LabelFilter",
  () => ({ LabelFilter: () => null }),
);
vi.mock(
  "../../../../../../../apps/admin/features/support-hub/components/toolbar/StatusFilter",
  () => ({ StatusFilter: () => null }),
);
vi.mock(
  "../../../../../../../apps/admin/features/support-hub/components/toolbar/LayoutToggle",
  () => ({ LayoutToggle: () => null }),
);

function conversation(
  id: string,
  subject: string,
  boardOrder: number,
  overrides: Partial<SupportConversation> = {},
): SupportConversation {
  return {
    id,
    subject,
    status: "open",
    tenantId: "tenant-1",
    inboxId: "inbox-1",
    priority: "normal",
    channel: "email",
    assignee: null,
    team: null,
    externalContactName: `Donor ${id}`,
    externalContactEmail: `${id}@example.test`,
    contact: null,
    labels: [],
    unreadCount: 0,
    messageCount: 1,
    firstMessageAt: "2026-04-15T08:00:00.000Z",
    lastMessageAt: `2026-04-15T0${8 - boardOrder}:00:00.000Z`,
    lastCustomerMessageAt: "2026-04-15T08:00:00.000Z",
    lastMessageDirection: "inbound",
    firstRespondedAt: null,
    firstResponseDueAt: null,
    nextResponseDueAt: null,
    resolvedAt: null,
    snoozedUntil: null,
    escalatedAt: null,
    boardOrder,
    slaPolicyId: null,
    createdAt: "2026-04-15T08:00:00.000Z",
    updatedAt: "2026-04-15T08:00:00.000Z",
    ...overrides,
  };
}

const ROWS = [
  conversation("one", "Receipt question", 0, {
    assignee: {
      id: "agent-me",
      name: "Me",
      email: "me@example.test",
      avatarUrl: null,
    },
    unreadCount: 1,
  }),
  conversation("two", "Address update", 1),
  conversation("three", "Gift aid form", 2),
];

beforeEach(() => {
  setPlatform("other");
  fixture.rows = ROWS;
  fixture.isError = false;
  fixture.refetchFails = false;
  fixture.retry = () => Promise.resolve();
  fixture.loadedDetails = null;
  fixture.mutations = [];
  vi.stubGlobal("innerWidth", 1280);
  vi.stubGlobal("matchMedia", (query: string) => ({
    media: query,
    matches: query.includes("min-width"),
    addEventListener() {},
    removeEventListener() {},
  }));
  vi.spyOn(window, "scrollBy").mockImplementation(() => undefined);
});
afterEach(() => {
  cleanup();
  route.reset();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

function focused() {
  return document.activeElement as HTMLElement | null;
}

/** A real key press goes to the focused element. */
function pressOnFocused(key: string) {
  fireEvent.keyDown(focused() ?? document.body, { key });
}

function boardCard(subject: string) {
  return screen.getByRole("button", {
    name: (name) => name.includes(subject) && !/^Move\b/.test(name),
  });
}

class NarrowGridObserver {
  constructor(
    private readonly callback: (
      entries: { target: Element; contentRect: { width: number } }[],
    ) => void,
  ) {}
  observe(target: Element) {
    // Only the grid's panel asks; its columns no longer fit beside the pane.
    if (target.tagName === "SECTION")
      this.callback([{ target, contentRect: { width: 320 } }]);
  }
  unobserve() {}
  disconnect() {}
}

describe("support inbox: j and k move focus with the selection", () => {
  it("focuses the newly open card on the board, so Tab and Enter act from it", () => {
    route.set({ selectedConversationId: "one" });
    render(<SupportInbox />);
    boardCard("Receipt question").focus();

    pressOnFocused("j");
    expect(route.get().selectedConversationId).toBe("two");
    expect(focused()?.getAttribute("aria-current")).toBe("true");
    expect(focused()?.getAttribute("aria-label")).toContain("Address update");

    pressOnFocused("k");
    expect(route.get().selectedConversationId).toBe("one");
    expect(focused()?.getAttribute("aria-label")).toContain("Receipt question");
  });

  it("focuses the newly open row in the table", () => {
    route.set({ layout: "table", selectedConversationId: "one" });
    render(<SupportInbox />);
    const table = screen.getByRole("table");
    within(table)
      .getByRole("button", { name: /Receipt question/ })
      .focus();

    pressOnFocused("j");
    expect(route.get().selectedConversationId).toBe("two");
    expect(focused()?.closest("tr")).not.toBeNull();
    expect(focused()?.textContent).toContain("Address update");
  });

  it("focuses the newly open card when the narrowed table shows cards", () => {
    vi.stubGlobal("ResizeObserver", NarrowGridObserver);
    route.set({ layout: "table", selectedConversationId: "one" });
    render(<SupportInbox />);
    expect(screen.queryByRole("table")).toBeNull();
    screen.getByRole("button", { name: /Receipt question/ }).focus();

    pressOnFocused("j");
    expect(route.get().selectedConversationId).toBe("two");
    expect(focused()?.closest("li")).not.toBeNull();
    expect(focused()?.textContent).toContain("Address update");
  });

  it("leaves focus in the conversation pane when j is pressed there", () => {
    route.set({ selectedConversationId: "one" });
    render(<SupportInbox />);
    const reply = screen.getByRole("button", { name: "Reply" });
    reply.focus();

    pressOnFocused("j");
    expect(route.get().selectedConversationId).toBe("two");
    expect(focused()).toBe(screen.getByRole("button", { name: "Reply" }));
  });

  it("moves focus to the newly open card when the pane drops the focused control", () => {
    // The next conversation is not loaded yet, so the pane shows its skeleton.
    fixture.loadedDetails = new Set(["one"]);
    route.set({ selectedConversationId: "one" });
    render(<SupportInbox />);
    screen.getByRole("button", { name: "Reply" }).focus();

    pressOnFocused("j");
    expect(route.get().selectedConversationId).toBe("two");
    expect(screen.getByText("Loading conversation")).toBeTruthy();
    expect(focused()).not.toBe(document.body);
    expect(focused()?.getAttribute("aria-label")).toContain("Address update");
  });
});

/** The saved status arrives with the refetch, which renders the inbox again. */
async function land(
  view: ReturnType<typeof render>,
  id: string,
  status: SupportConversation["status"],
) {
  fixture.rows = fixture.rows.map((row) =>
    row.id === id ? { ...row, status } : row,
  );
  await act(async () => {
    view.rerender(<SupportInbox />);
  });
}

async function press(key: string) {
  await act(async () => {
    pressOnFocused(key);
  });
}

/** The card's own Move menu, opened from its focused trigger. */
async function moveFromMenu(subject: string, lane: string) {
  const trigger = screen.getByRole("button", {
    name: (name) => name.startsWith(`Move ${subject}`),
  });
  trigger.focus();
  await act(async () => {
    fireEvent.click(trigger);
  });
  const item = await screen.findByRole("menuitem", { name: lane });
  await act(async () => {
    fireEvent.click(item);
  });
}

describe("support inbox: e and s keep focus in the list the conversation leaves", () => {
  it("focuses and opens the card now in the resolved card's place in its lane", async () => {
    route.set({ selectedConversationId: "one" });
    const view = render(<SupportInbox />);
    boardCard("Receipt question").focus();

    await press("e");
    expect(fixture.mutations).toContainEqual({
      conversationId: "one",
      status: "resolved",
    });
    await land(view, "one", "resolved");

    expect(focused()).not.toBe(document.body);
    expect(focused()?.getAttribute("aria-label")).toContain("Address update");
    expect(route.get().selectedConversationId).toBe("two");

    // The keys keep working from there.
    pressOnFocused("j");
    expect(route.get().selectedConversationId).not.toBe("two");
  });

  it("focuses the card before it when the resolved card was the lane's last", async () => {
    route.set({ selectedConversationId: "three" });
    const view = render(<SupportInbox />);
    boardCard("Gift aid form").focus();

    await press("e");
    await land(view, "three", "resolved");

    expect(focused()?.getAttribute("aria-label")).toContain("Address update");
    expect(route.get().selectedConversationId).toBe("two");
  });

  it("focuses the lane when its last card is snoozed", async () => {
    fixture.rows = ROWS.map((row) =>
      row.id === "one" ? row : { ...row, status: "pending" },
    );
    route.set({ selectedConversationId: "one" });
    const view = render(<SupportInbox />);
    boardCard("Receipt question").focus();

    await press("s");
    expect(screen.getByText("Snooze menu open for one")).toBeTruthy();
    await land(view, "one", "snoozed");

    expect(focused()).toBe(
      screen.getByRole("region", { name: "Open conversations, 0 items" }),
    );
    expect(route.get().selectedConversationId).toBe("one");
  });

  it("focuses and opens the row now in the resolved row's place in the table", async () => {
    route.set({
      layout: "table",
      status: "open",
      selectedConversationId: "one",
    });
    const view = render(<SupportInbox />);
    within(screen.getByRole("table"))
      .getByRole("button", { name: /Receipt question/ })
      .focus();

    await press("e");
    await land(view, "one", "resolved");

    expect(focused()?.closest("tr")).not.toBeNull();
    expect(focused()?.textContent).toContain("Address update");
    expect(route.get().selectedConversationId).toBe("two");
  });

  it("focuses and opens the card now in its place when the narrowed table shows cards", async () => {
    vi.stubGlobal("ResizeObserver", NarrowGridObserver);
    route.set({
      layout: "table",
      status: "open",
      selectedConversationId: "one",
    });
    const view = render(<SupportInbox />);
    expect(screen.queryByRole("table")).toBeNull();
    screen.getByRole("button", { name: /Receipt question/ }).focus();

    await press("e");
    await land(view, "one", "resolved");

    expect(focused()?.closest("li")).not.toBeNull();
    expect(focused()?.textContent).toContain("Address update");
    expect(route.get().selectedConversationId).toBe("two");
  });

  it("leaves focus the agent moved before the conversation left", async () => {
    route.set({ selectedConversationId: "one" });
    const view = render(<SupportInbox />);
    boardCard("Receipt question").focus();

    await press("e");
    const reply = screen.getByRole("button", { name: "Reply" });
    reply.focus();
    await land(view, "one", "resolved");

    expect(focused()).toBe(reply);
    expect(route.get().selectedConversationId).toBe("one");
  });

  it("leaves a later Move to the board after s is closed without a choice", async () => {
    route.set({ selectedConversationId: "one" });
    const view = render(<SupportInbox />);
    boardCard("Receipt question").focus();

    await press("s");
    expect(screen.getByText("Snooze menu open for one")).toBeTruthy();
    // Escape: nothing is snoozed, and the agent moves the card instead.
    boardCard("Receipt question").focus();
    await moveFromMenu("Receipt question", "Pending");
    await land(view, "one", "pending");

    await waitFor(() =>
      expect(focused()?.getAttribute("aria-label")).toContain(
        "Receipt question",
      ),
    );
    expect(route.get().selectedConversationId).toBe("one");
  });

  it("leaves a later snooze from the card's Move menu to the board after s is closed", async () => {
    route.set({ selectedConversationId: "one" });
    const view = render(<SupportInbox />);
    boardCard("Receipt question").focus();

    await press("s");
    boardCard("Receipt question").focus();
    await moveFromMenu("Receipt question", "Snoozed");
    const dialog = await screen.findByRole("dialog", { name: "Snooze until" });
    await act(async () => {
      fireEvent.click(
        within(dialog).getByRole("button", { name: /^In 1 hour/ }),
      );
    });
    await waitFor(() =>
      expect(screen.queryByRole("dialog", { name: "Snooze until" })).toBeNull(),
    );
    await land(view, "one", "snoozed");

    await waitFor(() =>
      expect(focused()?.getAttribute("aria-label")).toContain(
        "Receipt question",
      ),
    );
    expect(route.get().selectedConversationId).toBe("one");
  });

  it("records no move for e on a conversation already resolved", async () => {
    fixture.rows = ROWS.map((row) =>
      row.id === "one" ? row : { ...row, status: "resolved" },
    );
    route.set({ selectedConversationId: "two" });
    const view = render(<SupportInbox />);
    boardCard("Address update").focus();

    await press("e");
    expect(fixture.mutations).toEqual([]);
    await moveFromMenu("Address update", "Open");
    await land(view, "two", "open");

    await waitFor(() =>
      expect(focused()?.getAttribute("aria-label")).toContain("Address update"),
    );
    expect(route.get().selectedConversationId).toBe("two");
  });
});

describe("support inbox: the keys work in the phone conversation sheet", () => {
  beforeEach(() => {
    vi.stubGlobal("innerWidth", 375);
    vi.stubGlobal("matchMedia", (query: string) => ({
      media: query,
      matches: query.includes("max-width"),
      addEventListener() {},
      removeEventListener() {},
    }));
  });

  async function openSheet() {
    const sheet = await screen.findByRole("dialog", {
      name: /^Conversation/,
    });
    await waitFor(() => expect(sheet.contains(focused())).toBe(true));
    within(sheet).getByRole("button", { name: "Assign" }).focus();
    return sheet;
  }

  it("moves to the next and previous conversation with j and k, focus staying in the sheet", async () => {
    route.set({ selectedConversationId: "one" });
    render(<SupportInbox />);
    const sheet = await openSheet();

    expect(fireEvent.keyDown(focused()!, { key: "j" })).toBe(false);
    expect(route.get().selectedConversationId).toBe("two");
    expect(sheet.contains(focused())).toBe(true);
    expect(within(sheet).getByText("Conversation two")).toBeTruthy();

    expect(fireEvent.keyDown(focused()!, { key: "k" })).toBe(false);
    expect(route.get().selectedConversationId).toBe("one");
    expect(sheet.contains(focused())).toBe(true);
  });

  it("resolves with e and opens the snooze menu with s", async () => {
    route.set({ selectedConversationId: "one" });
    render(<SupportInbox />);
    const sheet = await openSheet();

    await act(async () => {
      expect(fireEvent.keyDown(focused()!, { key: "e" })).toBe(false);
    });
    expect(fixture.mutations).toContainEqual({
      conversationId: "one",
      status: "resolved",
    });

    expect(fireEvent.keyDown(focused()!, { key: "s" })).toBe(false);
    // Only the sheet answers: no second menu from a pane CSS hides below lg.
    const menus = screen.getAllByText("Snooze menu open for one");
    expect(menus).toHaveLength(1);
    expect(sheet.contains(menus[0]!)).toBe(true);
  });

  it("leaves the keys typed in the reply box as text", async () => {
    route.set({ selectedConversationId: "one" });
    render(<SupportInbox />);
    const sheet = await openSheet();
    const reply = within(sheet).getByRole("textbox", { name: "Reply message" });
    reply.focus();

    for (const key of ["j", "e", "s"]) {
      expect(fireEvent.keyDown(reply, { key })).toBe(true);
    }
    expect(route.get().selectedConversationId).toBe("one");
    expect(fixture.mutations).toEqual([]);
  });
});

describe("support inbox: closing the phone sheet returns focus to a live card", () => {
  // The elements scrolled into view, in order.
  let scrolled: Element[] = [];
  beforeEach(() => {
    vi.stubGlobal("innerWidth", 375);
    vi.stubGlobal("matchMedia", (query: string) => ({
      media: query,
      matches: query.includes("max-width"),
      addEventListener() {},
      removeEventListener() {},
    }));
    scrolled = [];
    Object.defineProperty(HTMLElement.prototype, "scrollIntoView", {
      configurable: true,
      value(this: HTMLElement) {
        scrolled.push(this);
      },
    });
  });
  afterEach(() => {
    Reflect.deleteProperty(HTMLElement.prototype, "scrollIntoView");
  });

  // Base UI returns focus without scrolling, so a card that e or s moved
  // down the board would otherwise hold focus below the fold.
  function expectScrolledIntoView(card: HTMLElement) {
    expect(scrolled).toContain(card.closest("[data-conversation-id]"));
  }

  /** Opens the sheet from the card, as a tap or Enter does. */
  async function openFromCard(subject: string) {
    const card = boardCard(subject);
    card.focus();
    await act(async () => {
      fireEvent.click(card);
    });
    const sheet = await screen.findByRole("dialog", {
      name: /^Conversation/,
    });
    await waitFor(() => expect(sheet.contains(focused())).toBe(true));
    within(sheet).getByRole("button", { name: "Assign" }).focus();
  }

  async function closeWithEscape() {
    await act(async () => {
      pressOnFocused("Escape");
    });
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    expect(route.get().selectedConversationId).toBeNull();
  }

  function laneOfFocus() {
    return focused()?.closest("section")?.getAttribute("aria-label");
  }

  it("focuses the resolved conversation's card in its new lane after e", async () => {
    const view = render(<SupportInbox />);
    await openFromCard("Receipt question");

    await press("e");
    expect(fixture.mutations).toContainEqual({
      conversationId: "one",
      status: "resolved",
    });
    await land(view, "one", "resolved");
    scrolled = [];
    await closeWithEscape();

    await waitFor(() => expect(focused()).toBe(boardCard("Receipt question")));
    expect(laneOfFocus()).toMatch(/^Resolved/);
    expectScrolledIntoView(boardCard("Receipt question"));

    // The inbox keys work from there.
    pressOnFocused("j");
    expect(route.get().selectedConversationId).not.toBeNull();
  });

  it("focuses the snoozed conversation's card in its new lane after s", async () => {
    const view = render(<SupportInbox />);
    await openFromCard("Receipt question");

    await press("s");
    expect(screen.getByText("Snooze menu open for one")).toBeTruthy();
    await land(view, "one", "snoozed");
    scrolled = [];
    await closeWithEscape();

    await waitFor(() => expect(focused()).toBe(boardCard("Receipt question")));
    expect(laneOfFocus()).toMatch(/^Snoozed/);
    expectScrolledIntoView(boardCard("Receipt question"));
  });

  // The status and snooze saves are not optimistic: Escape can close the
  // sheet onto the card before the move lands and remounts it elsewhere.
  it("follows the card to its new lane when e lands after Escape closed the sheet", async () => {
    const view = render(<SupportInbox />);
    await openFromCard("Receipt question");

    await press("e");
    await closeWithEscape();
    await waitFor(() => expect(focused()).toBe(boardCard("Receipt question")));
    expect(laneOfFocus()).toMatch(/^Open/);

    await land(view, "one", "resolved");

    expect(focused()).toBe(boardCard("Receipt question"));
    expect(laneOfFocus()).toMatch(/^Resolved/);
    // Focus follows; the sheet stays shut.
    expect(route.get().selectedConversationId).toBeNull();
    pressOnFocused("j");
    expect(route.get().selectedConversationId).not.toBeNull();
  });

  it("follows the card to its new lane when s lands after Escape closed the sheet", async () => {
    const view = render(<SupportInbox />);
    await openFromCard("Receipt question");

    await press("s");
    await closeWithEscape();
    await waitFor(() => expect(focused()).toBe(boardCard("Receipt question")));

    await land(view, "one", "snoozed");

    expect(focused()).toBe(boardCard("Receipt question"));
    expect(laneOfFocus()).toMatch(/^Snoozed/);
    expect(route.get().selectedConversationId).toBeNull();
  });

  it("focuses the card now in its place when a late resolve takes the card out of the list", async () => {
    route.set({ status: "open" });
    const view = render(<SupportInbox />);
    await openFromCard("Receipt question");

    await press("e");
    await closeWithEscape();
    await waitFor(() => expect(focused()).toBe(boardCard("Receipt question")));

    await land(view, "one", "resolved");

    expect(focused()).toBe(boardCard("Address update"));
    expect(laneOfFocus()).toMatch(/^Open/);
    expect(route.get().selectedConversationId).toBeNull();
  });

  it("leaves focus the agent moved elsewhere when a late move lands", async () => {
    const view = render(<SupportInbox />);
    await openFromCard("Receipt question");

    await press("e");
    await closeWithEscape();
    await waitFor(() => expect(focused()).toBe(boardCard("Receipt question")));
    const search = screen.getByRole("textbox", {
      name: "Search conversations",
    });
    search.focus();

    await land(view, "one", "resolved");

    expect(focused()).toBe(search);
  });

  it("focuses the card of the conversation showing after j, not the one that opened the sheet", async () => {
    render(<SupportInbox />);
    await openFromCard("Receipt question");

    await press("j");
    expect(route.get().selectedConversationId).toBe("two");
    scrolled = [];
    await closeWithEscape();

    await waitFor(() => expect(focused()).toBe(boardCard("Address update")));
    expectScrolledIntoView(boardCard("Address update"));
  });

  it("focuses the card now in its place when the resolved conversation leaves the list", async () => {
    route.set({ status: "open" });
    const view = render(<SupportInbox />);
    await openFromCard("Receipt question");

    await press("e");
    await land(view, "one", "resolved");
    scrolled = [];
    await closeWithEscape();

    await waitFor(() => expect(focused()).toBe(boardCard("Address update")));
    expect(laneOfFocus()).toMatch(/^Open/);
    expectScrolledIntoView(boardCard("Address update"));
  });

  it("focuses the lane when the conversation leaving the list was its last", async () => {
    // Unassigned shows open and pending conversations only.
    const me = ROWS[0]!.assignee;
    fixture.rows = ROWS.map((row) =>
      row.id === "one"
        ? { ...row, assignee: null }
        : row.id === "two"
          ? { ...row, status: "pending" }
          : { ...row, assignee: me },
    );
    route.set({ view: "unassigned" });
    const view = render(<SupportInbox />);
    await openFromCard("Receipt question");

    await press("e");
    await land(view, "one", "resolved");
    await closeWithEscape();

    await waitFor(() =>
      expect(focused()).toBe(
        screen.getByRole("region", { name: "Open conversations, 0 items" }),
      ),
    );
  });

  it("focuses the view control when the conversation leaving took the whole list", async () => {
    fixture.rows = ROWS.map((row) =>
      row.id === "one" ? row : { ...row, status: "pending" },
    );
    route.set({ status: "open" });
    const view = render(<SupportInbox />);
    await openFromCard("Receipt question");

    await press("e");
    await land(view, "one", "resolved");
    await closeWithEscape();

    expect(
      screen.getByText("No conversations match your filters"),
    ).toBeTruthy();
    await waitFor(() =>
      expect(
        focused()?.closest('[role="group"][aria-label="Inbox filters"]'),
      ).not.toBeNull(),
    );
    expect(focused()?.getAttribute("aria-label")).toBe("Inbox view");
  });
});

describe("support inbox: Ctrl+K opens and closes its command palette", () => {
  // Mission Control's own search, as the app shell registers it.
  function MissionControlSearch({ onOpen }: { onOpen: () => void }) {
    useShortcut("mod+k", onOpen, {
      description: "Search Mission Control pages",
    });
    return null;
  }

  beforeEach(() => {
    vi.stubGlobal(
      "ResizeObserver",
      class {
        observe() {}
        unobserve() {}
        disconnect() {}
      },
    );
    // jsdom has no scrolling; the palette scrolls its active item into view.
    Object.defineProperty(HTMLElement.prototype, "scrollIntoView", {
      configurable: true,
      value: vi.fn(),
    });
  });
  afterEach(() => {
    Reflect.deleteProperty(HTMLElement.prototype, "scrollIntoView");
  });

  it("closes the open palette from its search field, and Mission Control search stays shut", async () => {
    const openSearch = vi.fn();
    render(
      <>
        <MissionControlSearch onOpen={openSearch} />
        <SupportInbox />
      </>,
    );
    const card = boardCard("Receipt question");
    card.focus();
    fireEvent.keyDown(card, { key: "k", ctrlKey: true });
    const palette = await screen.findByRole("dialog", {
      name: "Support hub commands",
    });
    const search = within(palette).getByPlaceholderText(
      "Search support actions...",
    );
    search.focus();

    expect(fireEvent.keyDown(search, { key: "k", ctrlKey: true })).toBe(false);
    await waitFor(() =>
      expect(
        screen.queryByRole("dialog", { name: "Support hub commands" }),
      ).toBeNull(),
    );
    expect(openSearch).not.toHaveBeenCalled();
    await waitFor(() => expect(focused()).toBe(card));
  });
});

describe("support inbox: Escape belongs to the open palette or menu", () => {
  it("does not claim Escape for the inbox", () => {
    render(<SupportInbox />);
    boardCard("Receipt question").focus();
    expect(
      fireEvent.keyDown(focused() ?? document.body, { key: "Escape" }),
    ).toBe(true);
  });
});

describe("support inbox: self-removing buttons hand focus on", () => {
  it("moves focus to the search box when the empty state's Reset filters goes", () => {
    route.set({ q: "no such donor" });
    render(<SupportInbox />);
    const empty = screen
      .getByText("No conversations match your filters")
      .closest<HTMLElement>('[role="status"]')!;
    const reset = within(empty).getByRole("button", { name: "Reset filters" });
    reset.focus();
    fireEvent.click(reset);

    expect(
      screen.queryByText("No conversations match your filters"),
    ).toBeNull();
    expect(focused()).toBe(
      screen.getByRole("textbox", { name: "Search conversations" }),
    );
  });

  it("moves focus to the Mine view when Show mine opens it", () => {
    render(<SupportInbox />);
    const showMine = screen.getByRole("button", { name: "Show mine" });
    showMine.focus();
    fireEvent.click(showMine);

    expect(route.get().view).toBe("mine");
    expect(screen.queryByRole("button", { name: "Show mine" })).toBeNull();
    expect(focused()).not.toBe(document.body);
    expect(focused()?.textContent).toMatch(/^Mine/);
  });

  it("moves focus to the active view when the failure banner is dismissed", () => {
    render(<SupportInbox />);
    fireEvent.click(screen.getByRole("button", { name: "Report failure" }));
    const dismiss = screen.getByRole("button", { name: "Dismiss" });
    dismiss.focus();
    fireEvent.click(dismiss);

    expect(screen.queryByText("Assignment failed")).toBeNull();
    expect(focused()).not.toBe(document.body);
    expect(focused()?.textContent).toMatch(/^All/);
  });

  it("moves focus to the active view once Retry succeeds", async () => {
    render(<SupportInbox />);
    fireEvent.click(screen.getByRole("button", { name: "Report failure" }));
    const retry = screen.getByRole("button", { name: /Retry/ });
    retry.focus();
    await act(async () => {
      fireEvent.click(retry);
    });

    expect(screen.queryByText("Assignment failed")).toBeNull();
    expect(focused()?.textContent).toMatch(/^All/);
  });

  it("moves focus to the active view once Try again reloads the inbox", async () => {
    fixture.isError = true;
    const view = render(<SupportInbox />);
    const tryAgain = screen.getByRole("button", { name: "Try again" });
    tryAgain.focus();
    fireEvent.click(tryAgain);
    await act(async () => {
      view.rerender(<SupportInbox />);
    });

    expect(screen.queryByRole("button", { name: "Try again" })).toBeNull();
    expect(focused()?.textContent).toMatch(/^All/);
  });

  it("leaves focus alone when the inbox recovers long after a failed Try again", async () => {
    fixture.isError = true;
    fixture.refetchFails = true;
    const view = render(<SupportInbox />);
    const tryAgain = screen.getByRole("button", { name: "Try again" });
    tryAgain.focus();
    await act(async () => {
      fireEvent.click(tryAgain);
    });
    view.rerender(<SupportInbox />);
    expect(screen.getByRole("button", { name: "Try again" })).toBe(tryAgain);

    // The agent clicks empty page space; a later refresh then succeeds.
    tryAgain.blur();
    fixture.refetchFails = false;
    fixture.isError = false;
    await act(async () => {
      view.rerender(<SupportInbox />);
    });

    expect(screen.queryByRole("button", { name: "Try again" })).toBeNull();
    expect(focused()).toBe(document.body);
  });
});
