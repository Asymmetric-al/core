// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// eslint-disable-next-line no-restricted-imports -- TODO(admin-ui-boundary-regression) Round 12: regression test at the inbox rule editor's public UI boundary.
import { AutomationRuleForm } from "../../../../../../../apps/admin/features/support-hub/components/settings/automations/AutomationRuleForm";

// eslint-disable-next-line no-restricted-imports -- TODO(admin-ui-boundary-regression) Round 12: fixtures use the app's public wire-format types.
import type { SupportAutomationRule } from "../../../../../../../apps/admin/features/support-hub/types";

const hooks = vi.hoisted(() => ({ save: vi.fn(), toastError: vi.fn() }));

vi.mock(
  "../../../../../../../apps/admin/features/support-hub/hooks/use-support-mutations",
  () => ({
    useSaveSupportAutomationRule: () => ({
      mutateAsync: hooks.save,
      isPending: false,
    }),
  }),
);
vi.mock(
  "../../../../../../../apps/admin/features/support-hub/hooks/use-support-inbox-settings",
  () => ({
    useSupportInboxes: () => ({
      data: [{ id: "inbox-1", name: "Donor Care" }],
    }),
  }),
);
vi.mock(
  "../../../../../../../apps/admin/features/support-hub/hooks/use-support-labels",
  () => ({ useSupportLabels: () => ({ data: [] }) }),
);
vi.mock(
  "../../../../../../../apps/admin/features/support-hub/hooks/use-support-agents",
  () => ({
    useSupportAgents: () => ({ data: [] }),
    useSupportTeams: () => ({ data: [] }),
  }),
);
vi.mock(
  "../../../../../../../apps/admin/features/support-hub/hooks/use-support-macros",
  () => ({ useSupportMacros: () => ({ data: [] }) }),
);
vi.mock(
  "../../../../../../../apps/admin/features/support-hub/components/settings/automations/AutomationDryRunPreview",
  () => ({ AutomationDryRunPreview: () => null }),
);
vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: hooks.toastError, info: vi.fn() },
}));

const rule: SupportAutomationRule = {
  id: "rule-1",
  tenantId: "tenant-1",
  name: "Receipt routing",
  description: null,
  enabled: true,
  trigger: "conversation_created",
  conditions: [
    { kind: "inbox_is", inboxId: "inbox-1" },
    { kind: "subject_contains", value: "" },
  ],
  actions: [{ kind: "add_label", labelId: "" }, { kind: "mark_escalated" }],
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

function describedText(element: HTMLElement): string {
  return (element.getAttribute("aria-describedby") ?? "")
    .split(" ")
    .filter(Boolean)
    .map((id) => document.getElementById(id)?.textContent ?? "")
    .join(" ");
}

beforeEach(() => {
  hooks.save.mockReset().mockResolvedValue({});
  hooks.toastError.mockReset();
});
afterEach(cleanup);

describe("Inbox rule editor", () => {
  it("flags incomplete conditions and actions before anything is sent", () => {
    render(
      <AutomationRuleForm rule={rule} onSaved={vi.fn()} onCancel={vi.fn()} />,
    );
    fireEvent.change(screen.getByRole("textbox", { name: "Name" }), {
      target: { value: "Receipt routing v2" },
    });
    // No inline errors until staff try to save.
    expect(screen.queryByText("Enter a word or phrase.")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Save changes" }));

    const phrase = screen.getByRole("textbox", {
      name: "Condition 2 word or phrase",
    });
    expect(phrase.getAttribute("aria-invalid")).toBe("true");
    expect(describedText(phrase)).toContain("Enter a word or phrase.");
    expect(
      describedText(screen.getByRole("combobox", { name: "Action 1 label" })),
    ).toContain("Pick a label.");
    expect(hooks.toastError).toHaveBeenCalledWith(
      "Finish condition 2 and action 1 before saving.",
    );
    expect(hooks.save).not.toHaveBeenCalled();
  });

  it("flags a missing name inline instead of only in a toast", () => {
    render(
      <AutomationRuleForm rule={null} onSaved={vi.fn()} onCancel={vi.fn()} />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Create rule" }));
    const name = screen.getByRole("textbox", { name: "Name" });
    expect(name.getAttribute("aria-invalid")).toBe("true");
    expect(describedText(name)).toContain("Give the rule a name.");
    expect(screen.getByText("Add at least one action.")).toBeTruthy();
    expect(hooks.save).not.toHaveBeenCalled();
  });

  it("gives every row control a unique, readable name", () => {
    render(
      <AutomationRuleForm
        rule={{
          ...rule,
          conditions: [
            { kind: "is_overdue", value: true },
            { kind: "from_domain_equals", domain: "" },
          ],
          actions: [
            { kind: "set_status", status: "pending" },
            { kind: "snooze", hours: 4 },
          ],
        }}
        onSaved={vi.fn()}
        onCancel={vi.fn()}
      />,
    );
    expect(screen.getByRole("switch", { name: "Enabled" })).toBeTruthy();
    expect(
      screen.getByRole("switch", { name: "Condition 1: Is overdue" }),
    ).toBeTruthy();
    expect(screen.getByText("Yes")).toBeTruthy();
    expect(screen.queryByText("true")).toBeNull();
    expect(
      screen.getByRole("combobox", { name: "Condition 2 type" }),
    ).toBeTruthy();
    expect(
      screen.getByRole("textbox", { name: "Condition 2 domain" }),
    ).toBeTruthy();
    expect(
      screen.getByRole("button", {
        name: "Remove condition 2: From domain equals",
      }),
    ).toBeTruthy();
    expect(
      screen.getByRole("combobox", { name: "Action 1 type" }),
    ).toBeTruthy();
    const status = screen.getByRole("combobox", { name: "Action 1 status" });
    expect(status.textContent).toContain("Pending");
    expect(status.textContent).not.toContain("pending");
    expect(
      screen.getByRole("spinbutton", { name: "Action 2 hours to snooze" }),
    ).toBeTruthy();
    expect(screen.getByText("hours")).toBeTruthy();
    expect(
      screen.getByRole("button", { name: "Remove action 2: Snooze" }),
    ).toBeTruthy();
  });

  it("saves once every row is complete", () => {
    render(
      <AutomationRuleForm
        rule={{
          ...rule,
          conditions: [{ kind: "subject_contains", value: "receipt" }],
          actions: [{ kind: "mark_escalated" }],
        }}
        onSaved={vi.fn()}
        onCancel={vi.fn()}
      />,
    );
    fireEvent.change(screen.getByRole("textbox", { name: "Name" }), {
      target: { value: "Receipt routing v2" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save changes" }));
    expect(hooks.toastError).not.toHaveBeenCalled();
    expect(hooks.save).toHaveBeenCalledWith(
      expect.objectContaining({ id: "rule-1", name: "Receipt routing v2" }),
    );
  });
});
