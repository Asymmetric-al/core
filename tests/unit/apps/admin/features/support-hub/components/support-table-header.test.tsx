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

import { SupportTableView } from "../../../../../../../apps/admin/features/support-hub/components/table/SupportTableView";
import type { SupportConversation } from "../../../../../../../apps/admin/features/support-hub/types";

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
  return `Select ${row.subject} from ${row.externalContactName}`;
}

beforeEach(() => {
  vi.stubGlobal("matchMedia", (query: string) => ({
    media: query,
    matches: false,
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

describe("Support conversation table header", () => {
  it("says how many conversations are listed beside View", () => {
    render(
      <SupportTableView
        conversations={rows}
        selectedConversationId={null}
        onSelectConversation={vi.fn()}
      />,
    );
    const region = screen.getByRole("region", { name: "Conversations" });
    expect(region.textContent).toContain("2 conversations");
  });

  it("wraps a long subject to two lines instead of cutting it off", () => {
    render(
      <SupportTableView
        conversations={rows}
        selectedConversationId={null}
        onSelectConversation={vi.fn()}
      />,
    );
    const subject = within(screen.getByRole("table")).getByText(
      "Receipt question",
    );
    const classes = subject.className.split(" ");
    expect(classes).toContain("line-clamp-2");
    expect(classes).not.toContain("truncate");
  });

  it("does not repeat the priority as a label of the same name", () => {
    const urgent: SupportConversation = {
      ...first,
      priority: "urgent",
      labels: [
        {
          id: "label-urgent",
          tenantId: "fixture-tenant",
          slug: "urgent",
          name: "Urgent",
          tone: "zinc",
          description: null,
        },
        {
          id: "label-refund",
          tenantId: "fixture-tenant",
          slug: "refund",
          name: "Refund",
          tone: "blue",
          description: null,
        },
      ],
    };
    render(
      <SupportTableView
        conversations={[urgent]}
        selectedConversationId={null}
        onSelectConversation={vi.fn()}
      />,
    );
    const row = within(screen.getByRole("table"))
      .getByText("Receipt question")
      .closest("tr")!;
    // The Priority column already says Urgent; the board drops the twin too.
    expect(within(row).getAllByText("Urgent")).toHaveLength(1);
    expect(within(row).getByText("Refund")).toBeTruthy();
  });

  it("offers the conversation ID under View, hidden by default", async () => {
    render(
      <SupportTableView
        conversations={rows}
        selectedConversationId={null}
        onSelectConversation={vi.fn()}
      />,
    );
    const table = screen.getByRole("table");
    expect(screen.queryByRole("columnheader", { name: /^ID/ })).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: /^View/ }));
    const option = await screen.findByRole("menuitemcheckbox", { name: "ID" });
    fireEvent.click(option);
    await waitFor(() =>
      expect(
        table.querySelector("td")?.closest("tr")?.textContent ?? "",
      ).toBeTruthy(),
    );
    expect(
      await screen.findByRole("columnheader", { name: /^ID/ }),
    ).toBeTruthy();
  });
});
