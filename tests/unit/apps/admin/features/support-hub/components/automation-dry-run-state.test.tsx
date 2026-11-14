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

// eslint-disable-next-line no-restricted-imports -- AL-1965: App regression test at the dry-run preview's public UI boundary.
import { AutomationDryRunPreview } from "../../../../../../../apps/admin/features/support-hub/components/settings/automations/AutomationDryRunPreview";

// eslint-disable-next-line no-restricted-imports -- AL-1965: Fixtures use the app's public wire-format types.
import type {
  SupportAutomationRule,
  SupportConversation,
} from "../../../../../../../apps/admin/features/support-hub/types";

const hooks = vi.hoisted(() => ({
  rows: [] as SupportConversation[],
  isLoading: false,
  isError: false,
  refetch: vi.fn(),
}));
vi.mock(
  "../../../../../../../apps/admin/features/support-hub/hooks/use-support-conversations",
  () => ({
    useSupportConversations: () => ({
      data: hooks.rows,
      isLoading: hooks.isLoading,
      isError: hooks.isError,
      refetch: hooks.refetch,
    }),
  }),
);

const rule: SupportAutomationRule = {
  id: "rule-1",
  tenantId: "tenant-1",
  name: "Receipt routing",
  description: null,
  enabled: true,
  trigger: "conversation_created",
  conditions: [{ kind: "inbox_is", inboxId: "inbox-finance" }],
  actions: [{ kind: "mark_escalated" }],
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

function conversation(
  id: string,
  subject: string,
  inboxId: string,
): SupportConversation {
  return {
    id,
    tenantId: "tenant-1",
    inboxId,
    subject,
    status: "open",
    priority: "normal",
    channel: "email",
    assignee: null,
    team: null,
    externalContactName: "Anita",
    externalContactEmail: "anita@example.org",
    contact: null,
    labels: [],
    unreadCount: 0,
    messageCount: 1,
    firstMessageAt: "2026-01-01T00:00:00.000Z",
    lastMessageAt: "2026-01-01T00:00:00.000Z",
    lastCustomerMessageAt: "2026-01-01T00:00:00.000Z",
    lastMessageDirection: "inbound",
    firstRespondedAt: null,
    firstResponseDueAt: null,
    nextResponseDueAt: null,
    resolvedAt: null,
    snoozedUntil: null,
    escalatedAt: null,
    boardOrder: 0,
    slaPolicyId: null,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  };
}

beforeEach(() => {
  hooks.rows = [];
  hooks.isLoading = false;
  hooks.isError = false;
  hooks.refetch.mockReset().mockResolvedValue(undefined);
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("AutomationDryRunPreview selection", () => {
  it("keeps the initially loaded conversation when refreshed rows change order", () => {
    const receipt = conversation("conv-1", "Receipt question", "inbox-finance");
    const address = conversation("conv-2", "Address change", "inbox-general");
    const { rerender } = render(<AutomationDryRunPreview rule={rule} />);
    hooks.rows = [receipt, address];
    rerender(<AutomationDryRunPreview rule={rule} />);
    expect(screen.getByText("Rule matches")).toBeTruthy();

    hooks.rows = [address, receipt];
    rerender(<AutomationDryRunPreview rule={rule} />);
    expect(
      screen.getByRole("combobox", { name: "Conversation to test" })
        .textContent,
    ).toContain("Receipt question");
    expect(screen.getByText("Rule matches")).toBeTruthy();
  });

  it("defaults to the first loaded conversation and evaluates its actual inbox", () => {
    const { rerender } = render(<AutomationDryRunPreview rule={rule} />);
    hooks.rows = [conversation("conv-1", "Receipt question", "inbox-finance")];
    rerender(<AutomationDryRunPreview rule={rule} />);
    expect(
      screen.getByRole("combobox", { name: "Conversation to test" })
        .textContent,
    ).toContain("Receipt question");
    expect(screen.getByText("Rule matches")).toBeTruthy();
  });

  it.each([true, false])(
    "keeps the default target when a refresh reorders rows (initially loaded: %s)",
    (initiallyLoaded) => {
      const receipt = conversation(
        "conv-1",
        "Receipt question",
        "inbox-finance",
      );
      const address = conversation("conv-2", "Address change", "inbox-general");
      hooks.rows = initiallyLoaded ? [receipt, address] : [];
      const { rerender } = render(<AutomationDryRunPreview rule={rule} />);
      if (!initiallyLoaded) {
        hooks.rows = [receipt, address];
        rerender(<AutomationDryRunPreview rule={rule} />);
      }
      expect(
        screen.getByRole("combobox", { name: "Conversation to test" })
          .textContent,
      ).toContain("Receipt question");

      hooks.rows = [address, { ...receipt, subject: "Receipt follow-up" }];
      rerender(<AutomationDryRunPreview rule={rule} />);
      expect(
        screen.getByRole("combobox", { name: "Conversation to test" })
          .textContent,
      ).toContain("Receipt follow-up");
      expect(screen.getByText("Rule matches")).toBeTruthy();
    },
  );

  it("preserves an explicit choice when rows reload and updates the evaluation when that conversation changes", async () => {
    const receipt = conversation("conv-1", "Receipt question", "inbox-finance");
    const address = conversation("conv-2", "Address change", "inbox-general");
    hooks.rows = [receipt, address];
    const { rerender } = render(<AutomationDryRunPreview rule={rule} />);
    fireEvent.click(
      screen.getByRole("combobox", { name: "Conversation to test" }),
    );
    fireEvent.click(
      await screen.findByRole("option", { name: "Address change" }),
    );
    expect(screen.getByText("Rule does not match")).toBeTruthy();

    hooks.rows = [{ ...address, inboxId: "inbox-finance" }, receipt];
    rerender(<AutomationDryRunPreview rule={rule} />);
    expect(
      screen.getByRole("combobox", { name: "Conversation to test" })
        .textContent,
    ).toContain("Address change");
    expect(screen.getByText("Rule matches")).toBeTruthy();
  });

  it("offers no random conversation picker", () => {
    hooks.rows = [
      conversation("conv-1", "Receipt question", "inbox-finance"),
      conversation("conv-2", "Address change", "inbox-general"),
    ];
    render(<AutomationDryRunPreview rule={rule} />);
    expect(screen.queryByRole("button", { name: "Pick another" })).toBeNull();
  });
});

describe("AutomationDryRunPreview result", () => {
  it("keeps a visible Dry run heading that says nothing is changed", () => {
    render(<AutomationDryRunPreview rule={rule} />);
    expect(screen.getByText("Dry run")).toBeTruthy();
    expect(screen.getByText(/Nothing is changed/)).toBeTruthy();
  });

  it("announces the result with each reason as a list item", () => {
    hooks.rows = [conversation("conv-1", "Receipt question", "inbox-finance")];
    render(<AutomationDryRunPreview rule={rule} />);
    const result = screen.getByRole("status");
    expect(result.textContent).toContain("Rule matches");
    const reasons = within(result).getAllByRole("listitem");
    expect(reasons.length).toBeGreaterThan(0);
    for (const reason of reasons) {
      expect(reason.textContent?.trim().startsWith("•")).toBe(false);
    }
  });

  it("names actions the preview doesn't simulate, apart from planned ones", () => {
    hooks.rows = [conversation("conv-1", "Receipt question", "inbox-finance")];
    render(
      <AutomationDryRunPreview
        rule={{
          ...rule,
          actions: [
            { kind: "mark_escalated" },
            { kind: "run_macro", macroId: "m-1" },
          ],
        }}
      />,
    );
    const group = screen.getByRole("group", {
      name: "Not simulated in this preview",
    });
    expect(within(group).getByText("Mark escalated")).toBeTruthy();
    expect(within(group).getByText("Run macro")).toBeTruthy();
    expect(
      screen.getByText("This preview doesn’t simulate these actions."),
    ).toBeTruthy();
    expect(screen.queryByText(/mark_escalated|run_macro/)).toBeNull();
    expect(screen.queryByText(/server/i)).toBeNull();
  });

  it("says plainly when there are no conversations to test against", () => {
    render(<AutomationDryRunPreview rule={rule} />);
    expect(
      screen.getByText("No conversations to test against yet."),
    ).toBeTruthy();
    expect(screen.queryByText(/seed conversations/)).toBeNull();
  });
});

describe("AutomationDryRunPreview load states", () => {
  it("says conversations are loading instead of asking staff to seed the inbox", () => {
    hooks.isLoading = true;
    render(<AutomationDryRunPreview rule={rule} />);
    expect(screen.getByRole("status").textContent).toContain(
      "Loading conversations",
    );
    expect(screen.queryByText(/seed conversations/)).toBeNull();
  });

  it("shows a failed conversations load with Try again", async () => {
    hooks.isError = true;
    render(<AutomationDryRunPreview rule={rule} />);
    expect(screen.getByRole("alert").textContent).toContain(
      "Couldn’t load conversations",
    );
    expect(screen.queryByText(/seed conversations/)).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Try again" }));
    await waitFor(() => expect(hooks.refetch).toHaveBeenCalledOnce());
  });
});
