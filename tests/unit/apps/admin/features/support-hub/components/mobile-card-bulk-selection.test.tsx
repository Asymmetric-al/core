// @vitest-environment jsdom

import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { SupportTableView } from "../../../../../../../apps/admin/features/support-hub/components/table/SupportTableView";
import type { SupportConversation } from "../../../../../../../apps/admin/features/support-hub/types";

// Keep the actual shared responsive table, installed engine, selection state,
// bulk action composition and floating toolbar. Adapt auth/read/write boundaries.
const mutations = vi.hoisted(() => ({
  resolve: vi.fn().mockResolvedValue({}),
}));
vi.mock(
  "../../../../../../../apps/admin/features/support-hub/hooks/use-support-mutations",
  () => ({
    useSetSupportConversationStatus: () => ({
      mutateAsync: mutations.resolve,
      isPending: false,
    }),
    useSnoozeSupportConversation: () => ({
      mutateAsync: vi.fn(),
      isPending: false,
    }),
    useAssignSupportConversation: () => ({
      mutateAsync: vi.fn(),
      isPending: false,
    }),
    useToggleSupportLabel: () => ({ mutateAsync: vi.fn(), isPending: false }),
  }),
);
vi.mock(
  "../../../../../../../apps/admin/features/support-hub/hooks/use-support-labels",
  () => ({ useSupportLabels: () => ({ data: [] }) }),
);
vi.mock(
  "../../../../../../../apps/admin/features/support-hub/lib/current-agent",
  () => ({ useCurrentSupportAgentId: () => "fixture-agent" }),
);
vi.mock("../../../../../../../apps/admin/features/support-hub/lib/now", () => ({
  useSupportNow: () => "2026-04-15T12:00:00.000Z",
}));
const first: SupportConversation = {
  id: "fixture-conversation-one",
  subject: "Receipt question",
  status: "open",
  tenantId: "fixture-tenant",
  inboxId: "fixture-inbox",
  priority: "normal",
  channel: "email",
  assignee: null,
  team: null,
  externalContactName: "Fixture contact",
  externalContactEmail: "contact@example.invalid",
  contact: null,
  labels: [],
  unreadCount: 0,
  messageCount: 1,
  firstMessageAt: "2026-04-15T08:00:00.000Z",
  lastMessageAt: "2026-04-15T08:00:00.000Z",
  lastCustomerMessageAt: "2026-04-15T08:00:00.000Z",
  lastMessageDirection: "inbound",
  firstRespondedAt: null,
  firstResponseDueAt: null,
  nextResponseDueAt: null,
  resolvedAt: null,
  snoozedUntil: null,
  escalatedAt: null,
  boardOrder: 0,
  slaPolicyId: null,
  createdAt: "2026-04-15T08:00:00.000Z",
  updatedAt: "2026-04-15T08:00:00.000Z",
};
const second = {
  ...first,
  id: "fixture-conversation-two",
  subject: "Second receipt question",
  externalContactName: "Second fixture contact",
};
const rows = [first, second];
function label(row: SupportConversation) {
  return `Select conversation ${row.id}: ${row.subject}`;
}

beforeEach(() => {
  mutations.resolve.mockClear();
  vi.stubGlobal("innerWidth", 390);
  vi.stubGlobal("matchMedia", (query: string) => ({
    media: query,
    matches:
      query.includes("max-width") || query.includes("prefers-reduced-motion"),
    addEventListener() {},
    removeEventListener() {},
    addListener() {},
    removeListener() {},
  }));
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("Support mobile row selection", () => {
  it("selects original stable rows independently of opening detail and invokes the existing bulk status payload", async () => {
    const onOpen = vi.fn();
    const view = render(
      <SupportTableView
        conversations={rows}
        selectedConversationId={first.id}
        onSelectConversation={onOpen}
      />,
    );
    const checkbox = await screen.findByRole("checkbox", {
      name: label(first),
      exact: true,
    });
    expect(checkbox.closest("button")).toBeNull();
    fireEvent.click(checkbox);
    expect(onOpen).not.toHaveBeenCalled();
    await waitFor(() =>
      expect(checkbox.getAttribute("aria-checked")).toBe("true"),
    );
    expect(
      screen
        .getByRole("checkbox", { name: label(second), exact: true })
        .getAttribute("aria-checked"),
    ).toBe("false");
    view.rerender(
      <SupportTableView
        conversations={[...rows].reverse()}
        selectedConversationId={first.id}
        onSelectConversation={onOpen}
      />,
    );
    expect(
      screen
        .getByRole("checkbox", { name: label(first), exact: true })
        .getAttribute("aria-checked"),
    ).toBe("true");
    fireEvent.click(
      await screen.findByRole("button", { name: "Mark resolved", exact: true }),
    );
    await waitFor(() =>
      expect(mutations.resolve).toHaveBeenCalledExactlyOnceWith({
        conversationId: first.id,
        status: "resolved",
      }),
    );
    fireEvent.click(
      screen.getByRole("button", { name: /Fixture contact.*Receipt question/ }),
    );
    expect(onOpen).toHaveBeenCalledExactlyOnceWith(first.id);
    fireEvent.click(
      screen.getByRole("checkbox", { name: label(first), exact: true }),
    );
    await waitFor(() =>
      expect(
        screen.queryByRole("toolbar", { name: "Selected record actions" }),
      ).toBeNull(),
    );
  });
});
