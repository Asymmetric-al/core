/** @vitest-environment jsdom */
import { cleanup, fireEvent, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AutomationRuleForm } from "../../../../apps/admin/features/support-hub/components/settings/automations/AutomationRuleForm";
vi.mock("@asym/database/hooks", () => ({
  SUPPORT_AUTOMATION_TRIGGERS: ["conversation_created"],
}));
vi.mock(
  "../../../../apps/admin/features/support-hub/hooks/use-support-mutations",
  () => ({
    useSaveSupportAutomationRule: () => ({
      mutateAsync: vi.fn(),
      isPending: false,
    }),
  }),
);
vi.mock(
  "../../../../apps/admin/features/support-hub/components/settings/automations/AutomationDryRunPreview",
  () => ({ AutomationDryRunPreview: () => null }),
);
vi.mock(
  "../../../../apps/admin/features/support-hub/components/settings/automations/AutomationConditionRow",
  () => ({
    AutomationConditionRow: ({ condition, onRemove }: any) => (
      <li>
        <input aria-label={condition.value} value={condition.value} readOnly />
        <button type="button" onClick={onRemove}>
          Remove {condition.value}
        </button>
      </li>
    ),
  }),
);
vi.mock(
  "../../../../apps/admin/features/support-hub/components/settings/automations/AutomationActionRow",
  () => ({
    AutomationActionRow: ({ action, onRemove }: any) => (
      <li>
        <input aria-label={action.labelId} value={action.labelId} readOnly />
        <button type="button" onClick={onRemove}>
          Remove {action.labelId}
        </button>
      </li>
    ),
  }),
);
afterEach(cleanup);
const rule = {
  id: "rule",
  tenantId: "tenant",
  name: "Identity check",
  description: null,
  enabled: true,
  trigger: "conversation_created",
  conditions: [
    { kind: "subject_contains", value: "Alpha" },
    { kind: "subject_contains", value: "Beta" },
  ],
  actions: [
    { kind: "add_label", labelId: "First label" },
    { kind: "add_label", labelId: "Second label" },
  ],
  createdAt: "2026-01-01",
  updatedAt: "2026-01-01",
};
describe("editable automation row identity", () => {
  for (const [retained, removed] of [
    ["Beta", "Alpha"],
    ["Second label", "First label"],
  ]) {
    it(`retains the existing ${retained} control when the earlier row is removed`, () => {
      const view = render(
        <AutomationRuleForm
          rule={rule as any}
          onSaved={() => {}}
          onCancel={() => {}}
        />,
      );
      const input = view.getByRole("textbox", { name: retained });
      input.focus();
      fireEvent.click(view.getByRole("button", { name: `Remove ${removed}` }));
      expect(view.getByRole("textbox", { name: retained })).toBe(input);
      expect(document.activeElement).toBe(input);
    });
  }
});
