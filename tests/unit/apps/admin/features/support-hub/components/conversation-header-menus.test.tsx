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
import { checkPattern } from "@ui-sdk/core/testing";
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import { ConversationAssigneeMenu } from "../../../../../../../apps/admin/features/support-hub/components/detail/ConversationAssigneeMenu";
import { ConversationLabelMenu } from "../../../../../../../apps/admin/features/support-hub/components/detail/ConversationLabelMenu";
import { ConversationPriorityMenu } from "../../../../../../../apps/admin/features/support-hub/components/detail/ConversationPriorityMenu";
import { ConversationStatusMenu } from "../../../../../../../apps/admin/features/support-hub/components/detail/ConversationStatusMenu";

import type {
  SupportConversation,
  SupportLabel,
} from "../../../../../../../apps/admin/features/support-hub/types";

const mocks = vi.hoisted(() => ({
  setStatus: vi.fn(),
  setPriority: vi.fn(),
  assign: vi.fn(),
  roundRobin: vi.fn().mockResolvedValue(null),
  toggleLabel: vi.fn(),
  currentAgentId: "agent-1" as string | null,
}));

vi.mock(
  "../../../../../../../apps/admin/features/support-hub/hooks/use-support-mutations",
  () => ({
    useSetSupportConversationStatus: () => ({ mutate: mocks.setStatus }),
    useSetSupportConversationPriority: () => ({ mutate: mocks.setPriority }),
    useAssignSupportConversation: () => ({ mutate: mocks.assign }),
    useApplyRoundRobinAssignment: () => ({
      mutateAsync: mocks.roundRobin,
      isPending: false,
    }),
    useToggleSupportLabel: () => ({ mutate: mocks.toggleLabel }),
  }),
);
vi.mock(
  "../../../../../../../apps/admin/features/support-hub/hooks/use-support-agents",
  () => ({
    useSupportAgents: () => ({
      data: [
        { id: "agent-1", name: "Ada Agent", avatarUrl: null },
        { id: "agent-2", name: "Ben Agent", avatarUrl: null },
      ],
    }),
  }),
);
vi.mock(
  "../../../../../../../apps/admin/features/support-hub/lib/current-agent",
  () => ({ useCurrentSupportAgentId: () => mocks.currentAgentId }),
);

const LABELS = [
  { id: "label-a", slug: "urgent", name: "Urgent", tone: "rose" },
  { id: "label-b", slug: "follow-up", name: "Follow Up", tone: "blue" },
] as SupportLabel[];

vi.mock(
  "../../../../../../../apps/admin/features/support-hub/hooks/use-support-labels",
  () => ({ useSupportLabels: () => ({ data: LABELS }) }),
);
vi.mock("sonner", () => ({ toast: { info: vi.fn(), error: vi.fn() } }));

const conversation = {
  id: "conversation-1",
  status: "open",
  priority: "high",
  assignee: { id: "agent-2", name: "Ben Agent", avatarUrl: null },
  labels: [LABELS[0]],
} as unknown as SupportConversation;

const scrollIntoViewDescriptor = Object.getOwnPropertyDescriptor(
  Element.prototype,
  "scrollIntoView",
);
beforeAll(() => {
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
  Object.defineProperty(Element.prototype, "scrollIntoView", {
    configurable: true,
    value: vi.fn(),
  });
});
beforeEach(() => {
  mocks.currentAgentId = "agent-1";
});
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});
afterAll(() => {
  vi.unstubAllGlobals();
  if (scrollIntoViewDescriptor)
    Object.defineProperty(
      Element.prototype,
      "scrollIntoView",
      scrollIntoViewDescriptor,
    );
  else Reflect.deleteProperty(Element.prototype, "scrollIntoView");
});

function checked(menu: HTMLElement) {
  return within(menu)
    .getAllByRole("menuitemradio")
    .filter((item) => item.getAttribute("aria-checked") === "true")
    .map((item) => item.textContent);
}

describe("conversation status menu", () => {
  it("exposes the current status as the checked radio item and sets another", async () => {
    render(<ConversationStatusMenu conversation={conversation} />);
    fireEvent.click(screen.getByRole("button", { name: "Open" }));
    const menu = await screen.findByRole("menu");
    expect(within(menu).getAllByRole("menuitemradio")).toHaveLength(4);
    expect(checked(menu)).toEqual(["Open"]);

    fireEvent.click(
      within(menu).getByRole("menuitemradio", { name: "Resolved" }),
    );
    expect(mocks.setStatus).toHaveBeenCalledWith({
      conversationId: "conversation-1",
      status: "resolved",
    });
    await waitFor(() => expect(screen.queryByRole("menu")).toBeNull());
  });
});

describe("conversation header menus", () => {
  it.each([
    ["status", ConversationStatusMenu, "Open"],
    ["priority", ConversationPriorityMenu, "Priority: High"],
    ["assignee", ConversationAssigneeMenu, "Assigned to Ben Agent"],
  ])("the %s menu meets the WAI-ARIA menu pattern", async (_, Menu, name) => {
    render(<Menu conversation={conversation} />);
    fireEvent.click(screen.getByRole("button", { name }));
    const menu = await screen.findByRole("menu");
    await waitFor(() =>
      expect(menu.contains(document.activeElement)).toBe(true),
    );
    await act(async () => {
      await checkPattern(menu, "menu");
    });
  });
});

describe("conversation priority menu", () => {
  it("exposes the current priority as the checked radio item and sets another", async () => {
    render(<ConversationPriorityMenu conversation={conversation} />);
    fireEvent.click(screen.getByRole("button", { name: "Priority: High" }));
    const menu = await screen.findByRole("menu");
    expect(checked(menu)).toEqual(["High"]);

    fireEvent.click(
      within(menu).getByRole("menuitemradio", { name: "Urgent" }),
    );
    expect(mocks.setPriority).toHaveBeenCalledWith({
      conversationId: "conversation-1",
      priority: "urgent",
    });
    await waitFor(() => expect(screen.queryByRole("menu")).toBeNull());
  });
});

describe("conversation assignee menu", () => {
  it("exposes the current assignee as the checked agent and keeps actions as plain items", async () => {
    render(<ConversationAssigneeMenu conversation={conversation} />);
    fireEvent.click(
      screen.getByRole("button", { name: "Assigned to Ben Agent" }),
    );
    const menu = await screen.findByRole("menu");
    for (const name of ["Assign to me", "Unassign", "Round-robin assign"])
      expect(within(menu).getByRole("menuitem", { name })).toBeTruthy();
    expect(
      within(menu)
        .getByRole("menuitemradio", { name: "Ben Agent" })
        .getAttribute("aria-checked"),
    ).toBe("true");
    expect(
      within(menu)
        .getByRole("menuitemradio", { name: "Ada Agent" })
        .getAttribute("aria-checked"),
    ).toBe("false");

    fireEvent.click(
      within(menu).getByRole("menuitemradio", { name: "Ada Agent" }),
    );
    expect(mocks.assign).toHaveBeenCalledWith({
      conversationId: "conversation-1",
      assigneeAgentId: "agent-1",
    });
    await waitFor(() => expect(screen.queryByRole("menu")).toBeNull());
  });

  it("checks no agent while unassigned and hides Assign to me without a current agent", async () => {
    mocks.currentAgentId = null;
    render(
      <ConversationAssigneeMenu
        conversation={{ ...conversation, assignee: null }}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Unassigned" }));
    const menu = await screen.findByRole("menu");
    expect(checked(menu)).toEqual([]);
    expect(within(menu).getAllByRole("menuitemradio")).toHaveLength(2);
    expect(
      within(menu).queryByRole("menuitem", { name: "Assign to me" }),
    ).toBeNull();
  });
});

describe("conversation label menu", () => {
  it("exposes which labels are applied and toggles the one pressed", async () => {
    render(<ConversationLabelMenu conversation={conversation} compact />);
    fireEvent.click(
      screen.getByRole("combobox", { name: "Edit labels, 1 applied" }),
    );
    const listbox = await screen.findByRole("listbox");
    expect(listbox.getAttribute("aria-multiselectable")).toBe("true");
    expect(
      screen
        .getByRole("option", { name: "Urgent" })
        .getAttribute("aria-selected"),
    ).toBe("true");
    expect(
      screen
        .getByRole("option", { name: "Follow Up" })
        .getAttribute("aria-selected"),
    ).toBe("false");

    fireEvent.click(screen.getByRole("option", { name: "Follow Up" }));
    expect(mocks.toggleLabel).toHaveBeenLastCalledWith({
      conversationId: "conversation-1",
      labelId: "label-b",
    });
    fireEvent.click(screen.getByRole("option", { name: "Urgent" }));
    expect(mocks.toggleLabel).toHaveBeenLastCalledWith({
      conversationId: "conversation-1",
      labelId: "label-a",
    });
    expect(mocks.toggleLabel).toHaveBeenCalledTimes(2);
    expect(screen.getByRole("listbox")).toBeTruthy();
  });

  it("meets the WAI-ARIA combobox pattern", async () => {
    render(<ConversationLabelMenu conversation={conversation} compact />);
    const trigger = screen.getByRole("combobox", { name: /^Edit labels/ });
    fireEvent.click(trigger);
    await screen.findByRole("listbox");
    await act(async () => {
      await checkPattern(trigger, "combobox");
    });
  });

  it("searches labels by name and toggles from the keyboard", async () => {
    render(
      <ConversationLabelMenu conversation={{ ...conversation, labels: [] }} />,
    );
    fireEvent.click(screen.getByRole("combobox", { name: "Edit labels" }));
    const search = await screen.findByRole("combobox", {
      name: "Search labels",
    });
    fireEvent.change(search, { target: { value: "foll" } });
    const option = await screen.findByRole("option", { name: "Follow Up" });
    await waitFor(() =>
      expect(screen.queryByRole("option", { name: "Urgent" })).toBeNull(),
    );
    fireEvent.keyDown(search, { key: "ArrowDown" });
    await waitFor(() =>
      expect(search.getAttribute("aria-activedescendant")).toBe(option.id),
    );
    fireEvent.keyDown(search, { key: "Enter" });
    expect(mocks.toggleLabel).toHaveBeenCalledWith({
      conversationId: "conversation-1",
      labelId: "label-b",
    });
  });
});
