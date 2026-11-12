// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
// eslint-disable-next-line no-restricted-imports -- TODO(admin-ui-boundary-regression) App public boundary regression.
import { MacroPreviewLine } from "../../../../../../../apps/admin/features/support-hub/components/macros/MacroPreviewLine";
vi.mock(
  "../../../../../../../apps/admin/features/support-hub/hooks/use-support-agents",
  () => ({
    useSupportAgents: () => ({ data: [{ id: "agent", name: "Alex" }] }),
    useSupportTeams: () => ({ data: [{ id: "team", name: "Care" }] }),
  }),
);
vi.mock(
  "../../../../../../../apps/admin/features/support-hub/hooks/use-support-labels",
  () => ({
    useSupportLabels: () => ({ data: [{ id: "label", name: "Finance" }] }),
  }),
);
vi.mock(
  "../../../../../../../apps/admin/features/support-hub/hooks/use-support-canned-responses",
  () => ({ useSupportCannedResponses: () => ({ data: [] }) }),
);
afterEach(cleanup);
it("describes action targets without exposing identifiers", () => {
  render(
    <MacroPreviewLine
      actions={[
        { kind: "set_status", status: "resolved" },
        { kind: "set_priority", priority: "urgent" },
        { kind: "assign_agent", agentId: "agent" },
        { kind: "assign_team", teamId: "team" },
        { kind: "add_label", labelId: "label" },
        { kind: "remove_label", labelId: "missing" },
        { kind: "snooze", hours: 4 },
      ]}
    />,
  );
  for (const text of [
    "Set status: Resolved",
    "Set priority: Urgent",
    "Assign agent: Alex",
    "Assign team: Care",
    "Add label: Finance",
    "Remove label: Label unavailable",
    "Snooze 4 hours",
  ])
    expect(screen.getByText(text)).toBeTruthy();
});
