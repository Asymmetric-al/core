// @vitest-environment jsdom

import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";

import { ViewTabs } from "../../../../../../../apps/admin/features/support-hub/components/tabs/ViewTabs";

import type { SupportConversation } from "../../../../../../../apps/admin/features/support-hub/types";

const fixture = vi.hoisted(() => ({ rows: [] as SupportConversation[] }));
vi.mock(
  "../../../../../../../apps/admin/features/support-hub/hooks/use-support-conversations",
  () => ({
    useSupportConversations: () => ({ data: fixture.rows }),
  }),
);
vi.mock(
  "../../../../../../../apps/admin/features/support-hub/lib/current-agent",
  () => ({
    useCurrentSupportAgentId: () => "agent-1",
  }),
);
vi.mock("../../../../../../../apps/admin/features/support-hub/lib/now", () => ({
  useSupportNow: () => "2026-04-15T12:00:00.000Z",
}));
afterEach(cleanup);

function conversation(
  id: string,
  subject: string,
  status: SupportConversation["status"],
): SupportConversation {
  return {
    id,
    subject,
    status,
    tenantId: "tenant-1",
    inboxId: "inbox-1",
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
}

function viewChoice(name: RegExp) {
  return within(screen.getByRole("tablist", { name: "Inbox views" })).getByRole(
    "tab",
    { name },
  );
}

it("counts the current search and status facets independently of the selected view", () => {
  fixture.rows = [
    conversation("one", "Receipt question", "open"),
    conversation("two", "Receipt resent", "resolved"),
    conversation("three", "Address update", "open"),
  ];
  const onValueChange = vi.fn();
  const view = render(
    <ViewTabs
      value="mine"
      onValueChange={onValueChange}
      baseFilter={{
        status: "open",
        q: "receipt",
        labelSlugs: [],
        assignee: "",
        agentId: "agent-1",
      }}
    />,
  );
  expect(viewChoice(/^All, \d+ conversations?$/).textContent).toBe(
    "All1, 1 conversation",
  );
  expect(viewChoice(/^Unassigned, \d+ conversations?$/).textContent).toBe(
    "Unassigned1, 1 conversation",
  );
  expect(viewChoice(/^Mine, \d+ conversations?$/).textContent).toBe(
    "Mine0, 0 conversations",
  );
  fireEvent.click(viewChoice(/^Unassigned, \d+ conversations?$/));
  expect(onValueChange).toHaveBeenCalledExactlyOnceWith("unassigned");
  view.rerender(
    <ViewTabs value="all" onValueChange={onValueChange} baseFilter={null} />,
  );
  expect(viewChoice(/^All, \d+ conversations?$/).textContent).toBe(
    "All3, 3 conversations",
  );
  expect(viewChoice(/^Unassigned, \d+ conversations?$/).textContent).toBe(
    "Unassigned2, 2 conversations",
  );
});

// The strip keeps the shared tab strip (its look) and Tabs' roving focus, so
// tabbing in lands on the selected view rather than the first one.
it("keeps the shared tab strip with the selected view as its one tab stop", async () => {
  fixture.rows = [conversation("one", "Receipt question", "open")];
  const onValueChange = vi.fn();
  render(
    <ViewTabs value="mine" onValueChange={onValueChange} baseFilter={null} />,
  );
  const list = screen.getByRole("tablist", { name: "Inbox views" });
  expect(list.getAttribute("data-slot")).toBe("tabs-list");
  const tabs = within(list).getAllByRole("tab");
  expect(tabs.map((tab) => tab.getAttribute("data-slot"))).toEqual(
    Array(5).fill("tabs-trigger"),
  );
  expect(tabs.map((tab) => tab.getAttribute("aria-selected"))).toEqual([
    "false",
    "true",
    "false",
    "false",
    "false",
  ]);
  expect(tabs.filter((tab) => tab.tabIndex === 0)).toEqual([tabs[1]]);

  act(() => tabs[1]!.focus());
  // Base UI moves roving focus in a microtask after the key press.
  await act(async () => {
    fireEvent.keyDown(tabs[1]!, { key: "ArrowRight" });
  });
  expect(document.activeElement).toBe(tabs[2]);
  fireEvent.click(tabs[2]!);
  expect(onValueChange).toHaveBeenCalledExactlyOnceWith("unassigned");
});
