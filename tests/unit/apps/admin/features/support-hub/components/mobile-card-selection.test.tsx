// @vitest-environment jsdom

import {
  createDataTableRowModels,
  dataTableFeatures,
  useTable,
} from "@asym/ui/components/shadcn/data-table/tanstack";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";

import { SupportTableView } from "../../../../../../../apps/admin/features/support-hub/components/table/SupportTableView";

import type { SupportConversation } from "../../../../../../../apps/admin/features/support-hub/types";
import type { DataTableResponsiveProps } from "@asym/ui/components/shadcn/data-table/data-table-responsive";

// Exercise the public mobile-card renderer with actual Core TanStack rows;
// viewport/focus styling is verified separately in the real browser fixture.
vi.mock("@asym/ui/components/shadcn/data-table", () => ({
  DataTableResponsive: ({
    data,
    columns,
    mobileCardConfig,
  }: DataTableResponsiveProps<SupportConversation, unknown>) => {
    const table = useTable({
      features: dataTableFeatures,
      rowModels: createDataTableRowModels<SupportConversation>(),
      data,
      columns,
    });
    return (
      <>
        {table
          .getRowModel()
          .rows.map((row) => mobileCardConfig?.renderCard?.(row))}
      </>
    );
  },
}));
vi.mock(
  "../../../../../../../apps/admin/features/support-hub/components/table/bulk-actions",
  () => ({ useSupportBulkActions: () => ({ actions: [], overlays: null }) }),
);
vi.mock("../../../../../../../apps/admin/features/support-hub/lib/now", () => ({
  useSupportNow: () => "2026-04-15T12:00:00.000Z",
}));
afterEach(cleanup);

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
