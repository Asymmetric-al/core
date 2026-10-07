// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
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
  expect(
    screen.getByRole("tab", { name: "All", exact: true }).textContent,
  ).toBe("All1");
  expect(
    screen.getByRole("tab", { name: "Unassigned", exact: true }).textContent,
  ).toBe("Unassigned1");
  expect(
    screen.getByRole("tab", { name: "Mine", exact: true }).textContent,
  ).toBe("Mine0");
  fireEvent.click(screen.getByRole("tab", { name: "Unassigned", exact: true }));
  expect(onValueChange).toHaveBeenCalledExactlyOnceWith("unassigned");
  view.rerender(
    <ViewTabs value="all" onValueChange={onValueChange} baseFilter={null} />,
  );
  expect(
    screen.getByRole("tab", { name: "All", exact: true }).textContent,
  ).toBe("All3");
  expect(
    screen.getByRole("tab", { name: "Unassigned", exact: true }).textContent,
  ).toBe("Unassigned2");
});
