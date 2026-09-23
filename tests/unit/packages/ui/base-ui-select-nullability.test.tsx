// @vitest-environment jsdom

import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// eslint-disable-next-line no-restricted-imports -- AL-1894: Render the actual moderation selector at its callback boundary.
import { ContentModerationTabsSection } from "../../../../apps/admin/app/(app)/feed/content-moderation-sections";
// eslint-disable-next-line no-restricted-imports -- AL-1894: Render the actual reminder fields and observe their form value.
import { TaskFormFields } from "../../../../apps/admin/app/(app)/tasks/task-form-sections";
// eslint-disable-next-line no-restricted-imports -- AL-1894: Use the real form state for the reminder regression.
import { useTaskForm } from "../../../../apps/admin/app/(app)/tasks/use-task-form";
// eslint-disable-next-line no-restricted-imports -- AL-1894: Exercise actual app consumers of the nullable Base UI callback contract.
import { LocationEditor } from "../../../../apps/admin/features/mission-control/locations/components/LocationEditor";
// eslint-disable-next-line no-restricted-imports -- AL-1894: Exercise actual app consumers of the nullable Base UI callback contract.
import { ReportFilters } from "../../../../apps/admin/features/support-hub/components/reports/ReportFilters";
// eslint-disable-next-line no-restricted-imports -- AL-1894: Exercise actual app consumers of the nullable Base UI callback contract.
import { ReportScopeSelect } from "../../../../apps/admin/features/support-hub/components/reports/ReportScopeSelect";
// eslint-disable-next-line no-restricted-imports -- AL-1894: Exercise actual automation action callbacks.
import { AutomationActionRow } from "../../../../apps/admin/features/support-hub/components/settings/automations/AutomationActionRow";
// eslint-disable-next-line no-restricted-imports -- AL-1894: Exercise actual automation condition callbacks.
import { AutomationConditionRow } from "../../../../apps/admin/features/support-hub/components/settings/automations/AutomationConditionRow";
// eslint-disable-next-line no-restricted-imports -- AL-1894: Exercise the actual automation trigger callback.
import { AutomationRuleForm } from "../../../../apps/admin/features/support-hub/components/settings/automations/AutomationRuleForm";
// eslint-disable-next-line no-restricted-imports -- AL-1894: Exercise actual macro action callbacks.
import { MacroActionEditor } from "../../../../apps/admin/features/support-hub/components/settings/macros/MacroActionEditor";
// eslint-disable-next-line no-restricted-imports -- AL-1894: Exercise the actual inbox status callback.
import { StatusFilter } from "../../../../apps/admin/features/support-hub/components/toolbar/StatusFilter";
import { TaskDialog } from "../../../../packages/missionary/components/task-dialog";
import { DataGridCell } from "../../../../packages/ui/components/shadcn/data-grid/data-grid-cell";
import { DataTablePagination } from "../../../../packages/ui/components/shadcn/data-table/data-table-pagination";
import {
  createDataTableRowModels,
  dataTableFeatures,
  useTable,
} from "../../../../packages/ui/components/shadcn/data-table/tanstack";

import type * as SelectModule from "@asym/ui/components/shadcn/select";
import type { ComponentProps } from "react";

const { emitChanges, setReportState } = vi.hoisted(() => ({
  emitChanges: new Map<string, (value: string | null) => void>(),
  setReportState: vi.fn(),
}));

// Keep the real primitive and UI. Inject the documented nullable callback at
// its boundary; this does not claim invalid URLs or empty task defaults exist.
vi.mock("@asym/ui/components/shadcn/select", async (importOriginal) => {
  const actual = await importOriginal<typeof SelectModule>();
  return {
    ...actual,
    Select: (props: ComponentProps<typeof SelectModule.Select>) => {
      emitChanges.set(String(props.value), (value) =>
        props.onValueChange?.(value, {
          reason: "none",
          event: new Event("change"),
          cancel() {},
          allowPropagation() {},
          isCanceled: false,
          isPropagationAllowed: false,
          trigger: undefined,
        }),
      );
      return <actual.Select {...props} />;
    },
  };
});

vi.mock("@asym/database/supabase", () => ({ createBrowserClient: () => ({}) }));
vi.mock("@asym/lib/hooks", () => ({ useAuth: () => ({ profile: null }) }));
vi.mock(
  "../../../../apps/admin/features/support-hub/hooks/use-support-agents",
  () => ({
    useSupportAgents: () => ({ data: [] }),
    useSupportTeams: () => ({ data: [] }),
  }),
);
vi.mock(
  "../../../../apps/admin/features/support-hub/hooks/use-support-inbox-settings",
  () => ({
    useSupportInboxes: () => ({
      data: [{ id: "inbox-1", name: "General Inbox" }],
    }),
  }),
);
vi.mock(
  "../../../../apps/admin/features/support-hub/hooks/use-support-labels",
  () => ({ useSupportLabels: () => ({ data: [] }) }),
);
vi.mock("../../../../apps/admin/features/support-hub/lib/report-state", () => ({
  useSupportReportRouteState: () => ({
    state: {
      scopeKind: "inbox",
      scopeId: "inbox-1",
      groupBy: "day",
      from: "2026-05-01",
      to: "2026-05-02",
      businessHoursOnly: false,
    },
    setState: setReportState,
    resetState: vi.fn(),
  }),
}));
vi.mock(
  "../../../../apps/admin/features/support-hub/hooks/use-support-macros",
  () => ({ useSupportMacros: () => ({ data: [] }) }),
);
vi.mock(
  "../../../../apps/admin/features/support-hub/hooks/use-support-canned-responses",
  () => ({ useSupportCannedResponses: () => ({ data: [] }) }),
);
vi.mock(
  "../../../../apps/admin/features/support-hub/hooks/use-support-conversations",
  () => ({ useSupportConversations: () => ({ data: [] }) }),
);
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
  "../../../../apps/admin/features/mission-control/locations/hooks/use-locations",
  () => ({
    useUpsertLocation: () => ({ mutateAsync: vi.fn(), isPending: false }),
    useLinkedEntities: () => ({ data: { missionaries: [] } }),
  }),
);

beforeEach(() => {
  emitChanges.clear();
  setReportState.mockReset();
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
  Element.prototype.scrollIntoView ??= () => {};
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

function emitChange(currentValue: string, nextValue: string | null) {
  const emit = emitChanges.get(currentValue);
  expect(emit).toBeDefined();
  act(() => emit?.(nextValue));
}

async function choose(name: string, option: string) {
  fireEvent.mouseDown(screen.getByRole("combobox", { name }));
  const item = await screen.findByRole("option", { name: option, exact: true });
  fireEvent.pointerDown(item, { pointerType: "mouse", buttons: 1 });
  fireEvent.click(item);
}

describe("required Select consumers", () => {
  it("preserves report scope on null and still clears the id for a real scope change", async () => {
    render(<ReportScopeSelect />);
    emitChange("inbox", null);
    expect(setReportState).not.toHaveBeenCalled();
    await choose("Scope", "All");
    expect(setReportState).toHaveBeenCalledExactlyOnceWith({
      scopeKind: "all",
      scopeId: "",
    });
  });

  it.each([
    { name: "Task Type", value: "to_do", label: "To-do", next: "Call" },
    { name: "Priority", value: "none", label: "None", next: "High" },
    {
      name: "Status",
      value: "not_started",
      label: "Not Started",
      next: "Waiting",
    },
  ])(
    "preserves $name on null and accepts a listed option",
    async ({ name, value, label, next }) => {
      render(<TaskDialog open onOpenChange={vi.fn()} />);
      const trigger = screen.getByRole("combobox", { name, exact: true });
      expect(trigger.textContent).toContain(label);
      emitChange(value, null);
      expect(trigger.textContent).toContain(label);
      await choose(name, next);
      expect(trigger.textContent).toContain(next);
    },
  );

  it("preserves marker type on null and still updates the linked-entity field", async () => {
    render(<LocationEditor isOpen location={null} onOpenChange={vi.fn()} />);
    const trigger = screen.getByRole("combobox", { name: "Marker Type" });
    expect(trigger.textContent).toContain("Custom");
    emitChange("custom", null);
    expect(trigger.textContent).toContain("Custom");
    expect(screen.queryByText("Link to Project")).toBeNull();
    await choose("Marker Type", "Project");
    expect(trigger.textContent).toContain("Project");
    expect(screen.getByText("Link to Project")).toBeTruthy();
  });
});

const rows = Array.from({ length: 11 }, (_, index) => ({ id: String(index) }));
const columns = [{ accessorKey: "id" }];
function PaginationHarness() {
  const table = useTable({
    features: dataTableFeatures,
    rowModels: createDataTableRowModels<{ id: string }>(),
    data: rows,
    columns,
    initialState: { pagination: { pageIndex: 0, pageSize: 5 } },
  });
  return (
    <>
      <DataTablePagination table={table} />
      <output>
        {table.getRowModel().rows.length} rows; {table.getPageCount()} pages
      </output>
    </>
  );
}

describe("pagination Select values", () => {
  it.each([null, "0", "-1", "NaN", "1.5"])(
    "ignores invalid page size %s",
    (value) => {
      render(<PaginationHarness />);
      emitChange("5", value);
      expect(screen.getByRole("status").textContent).toBe("5 rows; 3 pages");
      expect(
        screen.getByRole("combobox", { name: "Rows per page" }).textContent,
      ).toContain("5");
    },
  );
});

describe("remaining single-Select callback contracts", () => {
  it("does not commit or end a data-grid edit on null", async () => {
    const onChange = vi.fn();
    const onEndEdit = vi.fn();
    render(
      <DataGridCell
        label="Plan"
        value="basic"
        cellType="select"
        isEditing
        isSelected
        options={[
          { value: "basic", label: "Basic" },
          { value: "premium", label: "Premium" },
        ]}
        onChange={onChange}
        onEndEdit={onEndEdit}
        onStartEdit={vi.fn()}
      />,
    );
    emitChange("basic", null);
    expect(onChange).not.toHaveBeenCalled();
    expect(onEndEdit).not.toHaveBeenCalled();
    const option = await screen.findByRole("option", { name: "Premium" });
    fireEvent.pointerDown(option, { pointerType: "mouse", buttons: 1 });
    fireEvent.click(option);
    expect(onChange).toHaveBeenCalledExactlyOnceWith("premium");
    expect(onEndEdit).toHaveBeenCalled();
  });

  it("preserves required inbox status", async () => {
    const onValueChange = vi.fn();
    render(<StatusFilter value="open" onValueChange={onValueChange} />);
    emitChange("open", null);
    expect(onValueChange).not.toHaveBeenCalled();
    await choose("Status filter", "Resolved");
    expect(onValueChange).toHaveBeenCalledExactlyOnceWith("resolved");
  });

  it("preserves required report grouping", async () => {
    render(<ReportFilters hideScope />);
    emitChange("day", null);
    expect(setReportState).not.toHaveBeenCalled();
    await choose("Group by", "Week");
    expect(setReportState).toHaveBeenCalledExactlyOnceWith({ groupBy: "week" });
  });

  it("preserves automation condition kind", async () => {
    const onChange = vi.fn();
    render(
      <ul>
        <AutomationConditionRow
          condition={{ kind: "inbox_is", inboxId: "inbox-1" }}
          onChange={onChange}
          onRemove={vi.fn()}
        />
      </ul>,
    );
    emitChange("inbox_is", null);
    expect(onChange).not.toHaveBeenCalled();
    emitChange("inbox_is", "subject_contains");
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ kind: "subject_contains" }),
    );
  });

  it("preserves the automation trigger", () => {
    render(<AutomationRuleForm onSaved={vi.fn()} onCancel={vi.fn()} />);
    const trigger = screen.getByRole("combobox", { name: "Trigger" });
    const label = trigger.textContent;
    emitChange("conversation_created", null);
    expect(trigger.textContent).toBe(label);
    emitChange("conversation_created", "message_received");
    expect(trigger.textContent).not.toBe(label);
  });

  it("preserves automation action kind", () => {
    const onChange = vi.fn();
    render(
      <ul>
        <AutomationActionRow
          action={{ kind: "set_status", status: "open" }}
          onChange={onChange}
          onRemove={vi.fn()}
        />
      </ul>,
    );
    emitChange("set_status", null);
    expect(onChange).not.toHaveBeenCalled();
    emitChange("set_status", "set_priority");
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ kind: "set_priority" }),
    );
  });

  it("preserves automation priority", () => {
    const onChange = vi.fn();
    render(
      <ul>
        <AutomationActionRow
          action={{ kind: "set_priority", priority: "low" }}
          onChange={onChange}
          onRemove={vi.fn()}
        />
      </ul>,
    );
    emitChange("low", null);
    expect(onChange).not.toHaveBeenCalled();
    emitChange("low", "high");
    expect(onChange).toHaveBeenCalledExactlyOnceWith({
      kind: "set_priority",
      priority: "high",
    });
  });

  it("preserves automation status", () => {
    const onChange = vi.fn();
    render(
      <ul>
        <AutomationActionRow
          action={{ kind: "set_status", status: "open" }}
          onChange={onChange}
          onRemove={vi.fn()}
        />
      </ul>,
    );
    emitChange("open", null);
    expect(onChange).not.toHaveBeenCalled();
    emitChange("open", "resolved");
    expect(onChange).toHaveBeenCalledExactlyOnceWith({
      kind: "set_status",
      status: "resolved",
    });
  });

  it("preserves macro action kind", () => {
    const onChange = vi.fn();
    render(
      <MacroActionEditor
        actions={[{ kind: "set_status", status: "open" }]}
        onChange={onChange}
      />,
    );
    emitChange("set_status", null);
    expect(onChange).not.toHaveBeenCalled();
    emitChange("set_status", "set_priority");
    expect(onChange).toHaveBeenCalledWith([
      expect.objectContaining({ kind: "set_priority" }),
    ]);
  });

  it("preserves macro status", () => {
    const onChange = vi.fn();
    render(
      <MacroActionEditor
        actions={[{ kind: "set_status", status: "open" }]}
        onChange={onChange}
      />,
    );
    emitChange("open", null);
    expect(onChange).not.toHaveBeenCalled();
    emitChange("open", "resolved");
    expect(onChange).toHaveBeenCalledExactlyOnceWith([
      { kind: "set_status", status: "resolved" },
    ]);
  });

  it("preserves macro priority", () => {
    const onChange = vi.fn();
    render(
      <MacroActionEditor
        actions={[{ kind: "set_priority", priority: "low" }]}
        onChange={onChange}
      />,
    );
    emitChange("low", null);
    expect(onChange).not.toHaveBeenCalled();
    emitChange("low", "high");
    expect(onChange).toHaveBeenCalledExactlyOnceWith([
      { kind: "set_priority", priority: "high" },
    ]);
  });

  it("preserves moderation sort", () => {
    const dispatchUi = vi.fn();
    render(
      <ContentModerationTabsSection
        activeTab="all"
        searchQuery=""
        filterVisibility="all"
        filterType="all"
        sortBy="newest"
        posts={[]}
        flaggedPosts={[]}
        isLoading={false}
        dispatchUi={dispatchUi}
        onPostAction={vi.fn()}
      />,
    );
    emitChange("newest", null);
    expect(dispatchUi).not.toHaveBeenCalled();
    emitChange("newest", "oldest");
    expect(dispatchUi).toHaveBeenCalledExactlyOnceWith({
      type: "set_sort_by",
      value: "oldest",
    });
  });

  it("preserves the required admin reminder type in form state", async () => {
    render(<AdminReminderHarness />);
    fireEvent.click(
      screen.getByRole("button", { name: "Reminders", exact: true }),
    );
    expect(screen.getByRole("status").textContent).toBe("notification");
    emitChange("notification", null);
    expect(screen.getByRole("status").textContent).toBe("notification");
    await choose("Reminder type", "Email");
    expect(screen.getByRole("status").textContent).toBe("email");
  });
});

function AdminReminderHarness() {
  const form = useTaskForm({
    staffMembers: [],
    onClose: vi.fn(),
    onSave: vi.fn(),
  });
  return (
    <>
      <TaskFormFields
        form={form}
        isEntitySearchOpen={false}
        linkedEntities={[]}
        staffMembers={[]}
        tagSearchValue=""
        onEntitySearchOpenChange={vi.fn()}
        onTagSearchValueChange={vi.fn()}
      />
      <form.Subscribe selector={(state) => state.values.reminders[0]?.type}>
        {(type) => <output>{type}</output>}
      </form.Subscribe>
    </>
  );
}
