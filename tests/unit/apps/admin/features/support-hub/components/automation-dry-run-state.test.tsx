// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// eslint-disable-next-line no-restricted-imports -- AL-1962: App regression test at the dry-run preview's public UI boundary.
import { AutomationDryRunPreview } from "../../../../../../../apps/admin/features/support-hub/components/settings/automations/AutomationDryRunPreview";

// eslint-disable-next-line no-restricted-imports -- AL-1962: Fixtures use the app's public wire-format types.
import type {
  SupportAutomationRule,
  SupportConversation,
} from "../../../../../../../apps/admin/features/support-hub/types";

const hooks = vi.hoisted(() => ({ rows: [] as SupportConversation[] }));
vi.mock(
  "../../../../../../../apps/admin/features/support-hub/hooks/use-support-conversations",
  () => ({ useSupportConversations: () => ({ data: hooks.rows }) }),
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
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("AutomationDryRunPreview selection", () => {
  it("defaults to the first loaded conversation and evaluates its actual inbox", () => {
    const { rerender } = render(<AutomationDryRunPreview rule={rule} />);
    expect(
      screen
        .getByRole("button", { name: "Pick another" })
        .hasAttribute("disabled"),
    ).toBe(true);
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

  it("picks another conversation from the loaded rows", () => {
    hooks.rows = [
      conversation("conv-1", "Receipt question", "inbox-finance"),
      conversation("conv-2", "Address change", "inbox-general"),
    ];
    vi.spyOn(Math, "random").mockReturnValue(0.75);
    render(<AutomationDryRunPreview rule={rule} />);
    fireEvent.click(screen.getByRole("button", { name: "Pick another" }));
    expect(
      screen.getByRole("combobox", { name: "Conversation to test" })
        .textContent,
    ).toContain("Address change");
    expect(screen.getByText("Rule does not match")).toBeTruthy();
  });
});
