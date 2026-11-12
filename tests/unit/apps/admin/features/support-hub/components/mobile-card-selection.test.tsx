// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";

import { SupportTableView } from "../../../../../../../apps/admin/features/support-hub/components/table/SupportTableView";

import type { SupportConversation } from "../../../../../../../apps/admin/features/support-hub/types";

// The real shared grid renders its phone cards below the md breakpoint.
beforeEach(() => {
  vi.stubGlobal("innerWidth", 390);
  vi.stubGlobal("matchMedia", (query: string) => ({
    media: query,
    matches: query.includes("max-width"),
    addEventListener() {},
    removeEventListener() {},
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
vi.mock(
  "../../../../../../../apps/admin/features/support-hub/components/table/bulk-actions",
  () => ({ useSupportBulkActions: () => ({ actions: [], overlays: null }) }),
);
vi.mock("../../../../../../../apps/admin/features/support-hub/lib/now", () => ({
  useSupportNow: () => "2026-04-15T12:00:00.000Z",
}));
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

const conversation: SupportConversation = {
  id: "conversation-one",
  subject: "Receipt question",
  status: "open",
  tenantId: "tenant-one",
  inboxId: "inbox-one",
  priority: "normal",
  channel: "email",
  assignee: null,
  team: null,
  externalContactName: "Fixture contact",
  externalContactEmail: "contact@example.test",
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

it("announces selection without replacing the focused card or its stable conversation ID", () => {
  const onSelectConversation = vi.fn();
  const view = render(
    <SupportTableView
      conversations={[conversation]}
      selectedConversationId={null}
      onSelectConversation={onSelectConversation}
    />,
  );
  const card = screen.getByRole("button", {
    name: /Fixture contact.*Receipt question/,
  });
  expect(card.getAttribute("aria-pressed")).toBe("false");
  card.focus();
  fireEvent.click(card);
  expect(onSelectConversation).toHaveBeenCalledExactlyOnceWith(
    "conversation-one",
  );
  view.rerender(
    <SupportTableView
      conversations={[conversation]}
      selectedConversationId="conversation-one"
      onSelectConversation={onSelectConversation}
    />,
  );
  expect(screen.getByRole("button", { pressed: true })).toBe(card);
  expect(document.activeElement).toBe(card);
});
