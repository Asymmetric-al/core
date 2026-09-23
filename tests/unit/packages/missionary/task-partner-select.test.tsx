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
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { TaskDialog } from "../../../../packages/missionary/components/task-dialog";
import { TaskPartnerSelect } from "../../../../packages/missionary/components/task-partner-select";

import type { Task } from "../../../../packages/missionary/types";
import type * as ComboboxModule from "@asym/ui/components/shadcn/combobox";
import type { ComponentProps } from "react";

vi.mock("@asym/database/supabase", () => ({ createBrowserClient: () => ({}) }));
vi.mock("@asym/lib/hooks", () => ({ useAuth: () => ({ profile: null }) }));

const { emitChanges } = vi.hoisted(() => ({
  emitChanges: new Map<string, (value: string | null) => void>(),
}));
// Keep the real control; inject only the documented nullable callback boundary.
vi.mock("@asym/ui/components/shadcn/combobox", async (importOriginal) => {
  const actual = await importOriginal<typeof ComboboxModule>();
  return {
    ...actual,
    Combobox: (props: ComponentProps<typeof ComboboxModule.Combobox>) => {
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
      return <actual.Combobox {...props} />;
    },
  };
});

const donors = [
  { id: "first", name: "Alex Smith", email: "first@example.test" },
  { id: "second", name: "Alex Smith", email: "second@example.test" },
];

function Example({
  initial = "",
  loading = false,
  onBlur,
}: {
  initial?: string;
  loading?: boolean;
  onBlur?: () => void;
}) {
  const [value, setValue] = useState(initial);
  const [open, setOpen] = useState(false);
  return (
    <>
      <TaskPartnerSelect
        donors={donors}
        value={value}
        loading={loading}
        onChange={setValue}
        onBlur={onBlur}
        open={open}
        onOpenChange={setOpen}
      />
      <output aria-label="Selected partner ID">{value || "none"}</output>
    </>
  );
}

const scrollDescriptor = Object.getOwnPropertyDescriptor(
  HTMLElement.prototype,
  "scrollIntoView",
);
beforeEach(() => {
  Object.defineProperty(HTMLElement.prototype, "scrollIntoView", {
    configurable: true,
    value: vi.fn(),
  });
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
  emitChanges.clear();
  vi.unstubAllGlobals();
  if (scrollDescriptor)
    Object.defineProperty(
      HTMLElement.prototype,
      "scrollIntoView",
      scrollDescriptor,
    );
  else Reflect.deleteProperty(HTMLElement.prototype, "scrollIntoView");
});

describe("Task partner selection", () => {
  it("uses the task's known donor before the dialog can load its list and still permits explicit clearing", () => {
    const task: Task = {
      id: "task-1",
      missionary_id: "missionary-1",
      donor_id: "second",
      donor: { ...donors[1]!, avatar_url: null },
      title: "Follow up",
      task_type: "call",
      status: "not_started",
      priority: "none",
      sort_key: 1,
      is_auto_generated: false,
      created_at: "2026-09-23T00:00:00Z",
      updated_at: "2026-09-23T00:00:00Z",
    };
    render(<TaskDialog task={task} open onOpenChange={vi.fn()} />);
    const trigger = screen.getByRole("combobox", {
      name: "Associated Partner",
    });
    expect(trigger.textContent).toContain("Alex Smith");
    act(() => emitChanges.get("second")?.(null));
    expect(trigger.textContent).toContain("Alex Smith");
    fireEvent.click(
      screen.getByRole("button", { name: "Clear associated partner" }),
    );
    expect(trigger.textContent).toContain("Select partner (optional)");
  });

  it("keeps a known partner visible through an empty loading or failed donor list", () => {
    const onChange = vi.fn();
    const onBlur = vi.fn();
    const props = {
      donors: [],
      value: "second",
      selectedPartner: donors[1],
      loading: true,
      onChange,
      onBlur,
      open: false,
      onOpenChange: vi.fn(),
    };
    const view = render(<TaskPartnerSelect {...props} />);
    expect(screen.getByRole("combobox").textContent).toContain("Alex Smith");
    expect(screen.getByRole("combobox").textContent).not.toContain(
      "Select partner (optional)",
    );
    view.rerender(<TaskPartnerSelect {...props} loading={false} />);
    expect(screen.getByRole("combobox").textContent).toContain("Alex Smith");
    expect(onChange).not.toHaveBeenCalled();
    expect(onBlur).not.toHaveBeenCalled();

    view.rerender(
      <TaskPartnerSelect
        {...props}
        loading={false}
        donors={[{ ...donors[1]!, name: "Updated partner" }]}
      />,
    );
    expect(screen.getByRole("combobox").textContent).toContain(
      "Updated partner",
    );
  });

  it("distinguishes an unresolved selected ID from an empty optional value", () => {
    const view = render(
      <TaskPartnerSelect
        donors={[]}
        value="unresolved"
        selectedPartner={donors[0]}
        loading
        onChange={vi.fn()}
        open={false}
        onOpenChange={vi.fn()}
      />,
    );
    expect(screen.getByRole("combobox").textContent).toContain(
      "Selected partner",
    );
    expect(screen.getByRole("combobox").textContent).not.toContain(
      "Alex Smith",
    );
    view.rerender(
      <TaskPartnerSelect
        donors={[]}
        value=""
        selectedPartner={donors[0]}
        loading={false}
        onChange={vi.fn()}
        open={false}
        onOpenChange={vi.fn()}
      />,
    );
    expect(screen.getByRole("combobox").textContent).toContain(
      "Select partner (optional)",
    );
  });

  it("ignores an implicit null without changing the value or marking the field touched", () => {
    const onBlur = vi.fn();
    render(<Example initial="second" onBlur={onBlur} />);
    act(() => emitChanges.get("second")?.(null));
    expect(screen.getByLabelText("Selected partner ID").textContent).toBe(
      "second",
    );
    expect(onBlur).not.toHaveBeenCalled();
  });

  it("does not treat a redundant non-item callback as deliberate deselection", () => {
    const onBlur = vi.fn();
    render(<Example initial="second" onBlur={onBlur} />);
    act(() => emitChanges.get("second")?.("second"));
    expect(screen.getByLabelText("Selected partner ID").textContent).toBe(
      "second",
    );
    expect(onBlur).not.toHaveBeenCalled();
  });

  it("selects the correct stable ID by keyboard when names are duplicated", async () => {
    render(<Example />);
    fireEvent.click(screen.getByRole("combobox"));
    const input = await screen.findByPlaceholderText("Search partners...");
    fireEvent.change(input, { target: { value: "Alex" } });
    await waitFor(() => expect(screen.getAllByRole("option")).toHaveLength(2));
    fireEvent.keyDown(input, { key: "End" });
    fireEvent.keyDown(input, { key: "Enter" });
    await waitFor(() =>
      expect(screen.getByLabelText("Selected partner ID").textContent).toBe(
        "second",
      ),
    );
  });

  it("clears with a named button outside the selection trigger", async () => {
    const onBlur = vi.fn();
    render(<Example initial="second" onBlur={onBlur} />);
    const clear = screen.getByRole("button", {
      name: "Clear associated partner",
    });
    expect(clear.parentElement?.closest("button")).toBeNull();
    fireEvent.click(clear);
    expect(screen.getByLabelText("Selected partner ID").textContent).toBe(
      "none",
    );
    expect(onBlur).toHaveBeenCalledOnce();
    await waitFor(() =>
      expect(document.activeElement).toBe(screen.getByRole("combobox")),
    );
  });

  it("announces a search with no matching partners", async () => {
    render(<Example />);
    fireEvent.click(screen.getByRole("combobox"));
    fireEvent.change(await screen.findByPlaceholderText("Search partners..."), {
      target: { value: "missing partner" },
    });
    expect(await screen.findByText("No partners found.")).toBeTruthy();
  });

  it("searches email and allows deselecting the current partner", async () => {
    render(<Example initial="second" />);
    fireEvent.click(screen.getByRole("combobox"));
    const input = await screen.findByPlaceholderText("Search partners...");
    fireEvent.change(input, { target: { value: "second@example.test" } });
    await waitFor(() => expect(screen.getAllByRole("option")).toHaveLength(1));
    const option = screen.getByRole("option");
    expect(option.getAttribute("aria-selected")).toBe("true");
    fireEvent.click(option);
    await waitFor(() =>
      expect(screen.getByLabelText("Selected partner ID").textContent).toBe(
        "none",
      ),
    );
  });
});
