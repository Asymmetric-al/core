// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

// eslint-disable-next-line no-restricted-imports -- TODO(admin-ui-boundary-regression) Round 12: settings draft rows are part of the editor's public props.
import { createDraftRows } from "../../../../../../../apps/admin/features/support-hub/components/settings/draft-rows";
// eslint-disable-next-line no-restricted-imports -- TODO(admin-ui-boundary-regression) Round 12: regression test at the macro action editor's public UI boundary.
import { MacroActionEditor } from "../../../../../../../apps/admin/features/support-hub/components/settings/macros/MacroActionEditor";

// eslint-disable-next-line no-restricted-imports -- TODO(admin-ui-boundary-regression) Round 12: fixtures use the app's public wire-format types.
import type { SupportMacroAction } from "../../../../../../../apps/admin/features/support-hub/types";

vi.mock(
  "../../../../../../../apps/admin/features/support-hub/hooks/use-support-agents",
  () => ({
    useSupportAgents: () => ({ data: [] }),
    useSupportTeams: () => ({ data: [] }),
  }),
);
vi.mock(
  "../../../../../../../apps/admin/features/support-hub/hooks/use-support-labels",
  () => ({ useSupportLabels: () => ({ data: [] }) }),
);
vi.mock(
  "../../../../../../../apps/admin/features/support-hub/hooks/use-support-canned-responses",
  () => ({ useSupportCannedResponses: () => ({ data: [] }) }),
);

afterEach(cleanup);

function renderEditor(actions: SupportMacroAction[]) {
  return render(
    <MacroActionEditor rows={createDraftRows(actions)} onChange={vi.fn()} />,
  );
}

describe("Macro action editor", () => {
  it("moves rows without changing draft identities and describes invalid targets", () => {
    const rows = createDraftRows<SupportMacroAction>([
      { kind: "assign_agent", agentId: "" },
      { kind: "snooze", hours: 3 },
    ]);
    const onChange = vi.fn();
    render(
      <MacroActionEditor
        rows={rows}
        onChange={onChange}
        errors={["Choose an agent.", null]}
      />,
    );
    expect(
      screen
        .getByRole("combobox", { name: "Action 1 agent" })
        .getAttribute("aria-invalid"),
    ).toBe("true");
    fireEvent.click(screen.getByRole("button", { name: "Move action 2 up" }));
    expect(onChange).toHaveBeenCalledWith([rows[1], rows[0]]);
  });

  it("names every control by its row and reads statuses and priorities in sentence case", () => {
    renderEditor([
      { kind: "set_status", status: "pending" },
      { kind: "set_priority", priority: "high" },
      { kind: "snooze", hours: 4 },
      { kind: "add_private_note", bodyText: "" },
    ]);
    const status = screen.getByRole("combobox", { name: "Action 1 status" });
    expect(status.textContent).toContain("Pending");
    expect(status.textContent).not.toContain("pending");
    expect(
      screen.getByRole("combobox", { name: "Action 2 priority" }).textContent,
    ).toContain("High");
    expect(
      screen.getByRole("spinbutton", { name: "Action 3 hours to snooze" }),
    ).toBeTruthy();
    expect(screen.getByRole("textbox", { name: "Action 4 note" })).toBeTruthy();
    expect(
      screen.getByRole("button", { name: "Remove action 1: Set status" }),
    ).toBeTruthy();
  });

  it("says a team step is skipped when the macro runs", () => {
    renderEditor([{ kind: "assign_team", teamId: "" }]);
    expect(
      screen.getByText(
        "Skipped when the macro runs: conversations can’t be assigned to a team yet.",
      ),
    ).toBeTruthy();
  });

  it("names the canned response step by what it does: it fills the reply", () => {
    renderEditor([{ kind: "send_canned_response", cannedResponseId: "" }]);
    expect(
      screen.getByRole("combobox", { name: "Action 1 type" }).textContent,
    ).toContain("Insert canned response");
  });
});
