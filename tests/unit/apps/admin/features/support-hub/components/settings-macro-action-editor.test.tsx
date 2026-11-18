// @vitest-environment jsdom

import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { useState } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

// eslint-disable-next-line no-restricted-imports -- TODO(admin-ui-boundary-regression) Round 12: settings draft rows are part of the editor's public props.
import {
  createDraftRows,
  type DraftRow,
} from "../../../../../../../apps/admin/features/support-hub/components/settings/draft-rows";
// eslint-disable-next-line no-restricted-imports -- TODO(admin-ui-boundary-regression) Round 12: regression test at the macro action editor's public UI boundary.
import { MacroActionEditor } from "../../../../../../../apps/admin/features/support-hub/components/settings/macros/MacroActionEditor";
import {
  AgentBridge,
  getAgentBridge,
  type AgentBridgeHandle,
  type AgentPermission,
} from "../../../../../../../packages/ui/components/primitives/agent-bridge";

// eslint-disable-next-line no-restricted-imports -- TODO(admin-ui-boundary-regression) Round 12: fixtures use the app's public wire-format types.
import type { SupportMacroAction } from "../../../../../../../apps/admin/features/support-hub/types";

vi.mock(
  "../../../../../../../apps/admin/features/support-hub/hooks/use-support-agents",
  () => ({
    useSupportAgents: () => ({ data: [{ id: "agent-ana", name: "Ana Lima" }] }),
    useSupportTeams: () => ({
      data: [{ id: "team-care", name: "Donor care" }],
    }),
  }),
);
vi.mock(
  "../../../../../../../apps/admin/features/support-hub/hooks/use-support-labels",
  () => ({
    useSupportLabels: () => ({
      data: [
        { id: "label-urgent", name: "Urgent" },
        { id: "label-billing", name: "Billing" },
      ],
    }),
  }),
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

const ACTIONS: SupportMacroAction[] = [
  { kind: "set_status", status: "pending" },
  { kind: "snooze", hours: 3 },
  { kind: "add_private_note", bodyText: "Call back" },
];

type Rows = DraftRow<SupportMacroAction>[];

function StatefulEditor({
  initial,
  onChange,
}: {
  initial: Rows;
  onChange: (next: Rows) => void;
}) {
  const [rows, setRows] = useState(initial);
  return (
    <MacroActionEditor
      rows={rows}
      onChange={(next) => {
        onChange(next);
        setRows(next);
      }}
    />
  );
}

function renderStatefulEditor() {
  const rows = createDraftRows(ACTIONS);
  const onChange = vi.fn<(next: Rows) => void>();
  render(<StatefulEditor initial={rows} onChange={onChange} />);
  return { rows, onChange };
}

const button = (name: string) => screen.getByRole("button", { name });
const announced = () =>
  document.querySelector('[aria-live="assertive"]')?.textContent ?? "";

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

  it("lists the actions as a named sortable list with a drag handle on every action", () => {
    renderStatefulEditor();

    const list = screen.getByRole("list", { name: "Macro actions" });
    expect(list.getAttribute("aria-roledescription")).toBe("sortable list");
    expect(list.querySelectorAll(":scope > li")).toHaveLength(3);
    for (const name of [
      "Reorder action 1: Set status",
      "Reorder action 2: Snooze",
      "Reorder action 3: Add private note",
    ]) {
      expect(button(name).getAttribute("aria-pressed")).toBe("false");
    }
  });

  it("reorders an action from its handle with the keyboard and reports the same draft rows", async () => {
    const { rows, onChange } = renderStatefulEditor();

    const handle = button("Reorder action 1: Set status");
    handle.focus();
    fireEvent.keyDown(handle, { key: " " });
    fireEvent.keyDown(handle, { key: "ArrowDown" });
    expect(onChange).not.toHaveBeenCalled();
    fireEvent.keyDown(handle, { key: " " });

    expect(onChange).toHaveBeenCalledTimes(1);
    const next = onChange.mock.calls[0]![0];
    expect(next).toHaveLength(3);
    expect(next[0]).toBe(rows[1]);
    expect(next[1]).toBe(rows[0]);
    expect(next[2]).toBe(rows[2]);
    // The form saves each row's value: the actions themselves, untouched.
    expect(next.map((row) => row.value)).toEqual([
      ACTIONS[1],
      ACTIONS[0],
      ACTIONS[2],
    ]);
    await waitFor(() =>
      expect(button("Reorder action 2: Set status")).toBe(handle),
    );
    expect(document.activeElement).toBe(handle);
    await waitFor(() =>
      expect(announced()).toBe(
        "Dropped Action 1: Set status to Pending at position 2 of 3.",
      ),
    );
  });

  it("puts an action back when its move is cancelled with Escape", async () => {
    const { onChange } = renderStatefulEditor();

    const handle = button("Reorder action 3: Add private note");
    handle.focus();
    fireEvent.keyDown(handle, { key: "Enter" });
    fireEvent.keyDown(handle, { key: "Home" });
    await waitFor(() =>
      expect(button("Reorder action 1: Add private note")).toBe(handle),
    );
    fireEvent.keyDown(handle, { key: "Escape" });

    await waitFor(() =>
      expect(button("Reorder action 3: Add private note")).toBe(handle),
    );
    expect(onChange).not.toHaveBeenCalled();
  });

  it("puts a picked-up action back before an arrow button moves another one", async () => {
    const { rows, onChange } = renderStatefulEditor();

    const handle = button("Reorder action 1: Set status");
    handle.focus();
    fireEvent.keyDown(handle, { key: " " });
    fireEvent.keyDown(handle, { key: "ArrowDown" });
    await waitFor(() =>
      expect(button("Reorder action 2: Set status")).toBe(handle),
    );

    const up = button("Move action 3 up");
    fireEvent.pointerDown(up);
    fireEvent.click(up);

    expect(onChange).toHaveBeenCalledOnce();
    expect(onChange).toHaveBeenLastCalledWith([rows[0], rows[2], rows[1]]);
    await waitFor(() =>
      expect(
        screen
          .getAllByRole("button", { name: /^Reorder action / })
          .map((item) => item.getAttribute("aria-label")),
      ).toEqual([
        "Reorder action 1: Set status",
        "Reorder action 2: Add private note",
        "Reorder action 3: Snooze",
      ]),
    );
    expect(handle.getAttribute("aria-pressed")).toBe("false");
  });

  it("moves an action with its arrow buttons, keeps focus on that action and announces where it went", async () => {
    const { rows, onChange } = renderStatefulEditor();

    const down = button("Move action 1 down");
    down.focus();
    fireEvent.click(down);

    // The same order the handle produces for the same move.
    expect(onChange).toHaveBeenLastCalledWith([rows[1], rows[0], rows[2]]);
    await waitFor(() =>
      expect(down.getAttribute("aria-label")).toBe("Move action 2 down"),
    );
    expect(document.activeElement).toBe(down);
    expect(down.closest("li")).toBe(
      button("Remove action 2: Set status").closest("li"),
    );
    await waitFor(() =>
      expect(announced()).toBe(
        "Dropped Action 1: Set status to Pending at position 2 of 3.",
      ),
    );

    fireEvent.click(down);
    expect(onChange).toHaveBeenLastCalledWith([rows[1], rows[2], rows[0]]);
    // At the end of the list the button is disabled but keeps focus.
    await waitFor(() =>
      expect(down.getAttribute("aria-label")).toBe("Move action 3 down"),
    );
    expect(down.getAttribute("aria-disabled")).toBe("true");
    expect(document.activeElement).toBe(down);

    const up = button("Move action 3 up");
    up.focus();
    fireEvent.click(up);
    expect(onChange).toHaveBeenLastCalledWith([rows[1], rows[0], rows[2]]);
    await waitFor(() =>
      expect(up.getAttribute("aria-label")).toBe("Move action 2 up"),
    );
    expect(document.activeElement).toBe(up);
    await waitFor(() =>
      expect(announced()).toBe(
        "Dropped Action 3: Set status to Pending at position 2 of 3.",
      ),
    );
  });

  it("lists an added or removed action straight away and moves it by its new place", () => {
    const { rows, onChange } = renderStatefulEditor();

    fireEvent.click(button("Add action"));
    expect(screen.getAllByRole("listitem")).toHaveLength(4);
    const added = onChange.mock.lastCall![0][3]!;
    expect(button("Reorder action 4: Set status")).toBeTruthy();

    fireEvent.click(button("Remove action 1: Set status"));
    expect(screen.getAllByRole("listitem")).toHaveLength(3);
    expect(onChange).toHaveBeenLastCalledWith([rows[1], rows[2], added]);

    fireEvent.click(button("Move action 3 up"));
    expect(onChange).toHaveBeenLastCalledWith([rows[1], added, rows[2]]);
  });

  it("moves focus to the next action, the previous one, then Add action as actions are removed", () => {
    renderStatefulEditor();
    const typeOf = (row: number) =>
      screen.getByRole("combobox", { name: `Action ${row} type` });
    const firstType = typeOf(1);
    const noteType = typeOf(3);

    const removeSnooze = button("Remove action 2: Snooze");
    removeSnooze.focus();
    fireEvent.click(removeSnooze);
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
    expect(document.activeElement).toBe(noteType);

    const removeNote = screen.getByRole("button", {
      name: /^Remove action 2:/,
    });
    removeNote.focus();
    fireEvent.click(removeNote);
    expect(document.activeElement).toBe(firstType);

    const removeLast = button("Remove action 1: Set status");
    removeLast.focus();
    fireEvent.click(removeLast);
    expect(screen.queryAllByRole("listitem")).toHaveLength(0);
    expect(document.activeElement).toBe(button("Add action"));
  });

  it("keeps an error with its action while the action is being moved", async () => {
    const rows = createDraftRows<SupportMacroAction>([
      { kind: "assign_agent", agentId: "" },
      { kind: "snooze", hours: 3 },
    ]);
    render(
      <MacroActionEditor
        rows={rows}
        onChange={vi.fn()}
        errors={["Choose an agent.", null]}
      />,
    );

    const handle = button("Reorder action 1: Assign agent");
    handle.focus();
    fireEvent.keyDown(handle, { key: " " });
    fireEvent.keyDown(handle, { key: "ArrowDown" });

    const agent = await screen.findByRole("combobox", {
      name: "Action 2 agent",
    });
    expect(agent.getAttribute("aria-invalid")).toBe("true");
    expect(
      document.getElementById(agent.getAttribute("aria-describedby")!)
        ?.textContent,
    ).toBe("Choose an agent.");
    expect(
      screen
        .getByRole("spinbutton", { name: "Action 1 hours to snooze" })
        .getAttribute("aria-invalid"),
    ).toBe("false");
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

describe("Macro action editor for an agent", () => {
  // Mission Control's grant for this list (apps/admin/app/mc-shell.tsx).
  const ALLOW: AgentPermission[] = [
    { component: "sortable-list", label: "Macro actions", actions: ["move"] },
  ];
  const TWO_LABELS: SupportMacroAction[] = [
    { kind: "add_label", labelId: "label-urgent" },
    { kind: "add_label", labelId: "label-billing" },
    { kind: "snooze", hours: 3 },
  ];

  async function run(bridge: AgentBridgeHandle, args: unknown[]) {
    let result!: Awaited<ReturnType<AgentBridgeHandle["act"]>>;
    await act(async () => {
      result = await bridge.act({
        steps: [{ ref: "Macro actions", action: "move", args }],
      });
    });
    return result;
  }

  const itemsOf = async (bridge: AgentBridgeHandle) => {
    const found = await bridge.query({ within: "Macro actions" });
    if (!Array.isArray(found)) throw new Error(found.error);
    return found[0]?.items;
  };

  const labelsShown = () =>
    screen
      .getAllByRole("combobox", { name: /^Action \d+ label$/ })
      .map((select) => select.textContent);

  it("lists each action by its place, its type and what it sets, so two of a kind differ", async () => {
    render(
      <>
        <AgentBridge allow={ALLOW} />
        <MacroActionEditor
          rows={createDraftRows<SupportMacroAction>([
            ...TWO_LABELS,
            { kind: "add_label", labelId: "" },
            { kind: "remove_label", labelId: "label-urgent" },
            { kind: "set_status", status: "pending" },
            { kind: "set_priority", priority: "high" },
            { kind: "assign_agent", agentId: "agent-ana" },
            { kind: "assign_team", teamId: "team-care" },
            { kind: "add_label", labelId: "label-urgent" },
          ])}
          onChange={vi.fn()}
        />
      </>,
    );
    const bridge = await getAgentBridge();

    expect(await itemsOf(bridge)).toEqual([
      { value: "initial-draft-0", label: "Action 1: Add label Urgent" },
      { value: "initial-draft-1", label: "Action 2: Add label Billing" },
      { value: "initial-draft-2", label: "Action 3: Snooze" },
      { value: "initial-draft-3", label: "Action 4: Add label" },
      { value: "initial-draft-4", label: "Action 5: Remove label Urgent" },
      { value: "initial-draft-5", label: "Action 6: Set status to Pending" },
      { value: "initial-draft-6", label: "Action 7: Set priority to High" },
      { value: "initial-draft-7", label: "Action 8: Assign agent Ana Lima" },
      { value: "initial-draft-8", label: "Action 9: Assign team Donor care" },
      // The same action twice still differs by its place.
      { value: "initial-draft-9", label: "Action 10: Add label Urgent" },
    ]);
  });

  it("moves an action the agent names by its label or its value, and saves the same actions in the new order", async () => {
    const rows = createDraftRows(TWO_LABELS);
    const onChange = vi.fn<(next: Rows) => void>();
    render(
      <>
        <AgentBridge allow={ALLOW} />
        <StatefulEditor initial={rows} onChange={onChange} />
      </>,
    );
    const bridge = await getAgentBridge();

    const byLabel = await run(bridge, ["Action 2: Add label Billing", 0]);
    expect(byLabel.ok, byLabel.error?.message).toBe(true);
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenLastCalledWith([rows[1], rows[0], rows[2]]);
    expect(labelsShown()).toEqual(["Billing", "Urgent"]);
    expect(await itemsOf(bridge)).toEqual([
      { value: rows[1]!.id, label: "Action 1: Add label Billing" },
      { value: rows[0]!.id, label: "Action 2: Add label Urgent" },
      { value: rows[2]!.id, label: "Action 3: Snooze" },
    ]);

    const byValue = await run(bridge, [rows[2]!.id, 1]);
    expect(byValue.ok, byValue.error?.message).toBe(true);
    expect(onChange).toHaveBeenCalledTimes(2);
    expect(onChange).toHaveBeenLastCalledWith([rows[1], rows[2], rows[0]]);
    expect(onChange.mock.lastCall![0].map((row) => row.value)).toEqual([
      TWO_LABELS[1],
      TWO_LABELS[2],
      TWO_LABELS[0],
    ]);
    expect(
      screen
        .getAllByRole("button", { name: /^Reorder action / })
        .map((handle) => handle.getAttribute("aria-label")),
    ).toEqual([
      "Reorder action 1: Add label",
      "Reorder action 2: Snooze",
      "Reorder action 3: Add label",
    ]);
    expect(labelsShown()).toEqual(["Billing", "Urgent"]);
  });
});
