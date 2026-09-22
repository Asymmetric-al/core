// @vitest-environment jsdom

import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { useState } from "react";
import { afterEach, describe, expect, it } from "vitest";

import {
  FilterSelectInput,
  FilterMultiSelectInput,
} from "../../../../../../packages/ui/components/shadcn/data-table/filters/filter-select-inputs";

import type {
  FilterFieldDefinition,
  FilterValue,
} from "../../../../../../packages/ui/components/shadcn/data-table/filters/types";

const field: FilterFieldDefinition = {
  id: "status",
  label: "Status",
  type: "select",
  options: [
    { value: "a", label: "Active", count: 12 },
    { value: "p", label: "Pending", count: 4 },
    { value: "c", label: "Closed", count: 0 },
  ],
};

function ControlledFilter({
  multiple = false,
  initialValue = "",
}: {
  multiple?: boolean;
  initialValue?: FilterValue;
}) {
  const [value, setValue] = useState(initialValue);
  const Component = multiple ? FilterMultiSelectInput : FilterSelectInput;
  return (
    <>
      <Component
        field={field}
        operator={multiple ? "in" : "equals"}
        value={value}
        onChange={setValue}
      />
      <output aria-label="Filter value">{JSON.stringify(value)}</output>
    </>
  );
}

afterEach(cleanup);

describe("filter comboboxes", () => {
  it("searches display labels, selects string IDs with the keyboard and returns focus", async () => {
    render(<ControlledFilter />);
    const trigger = screen.getByRole("combobox", { name: "Status" });
    fireEvent.click(trigger);
    const search = await screen.findByRole("combobox", {
      name: "Search Status",
    });
    fireEvent.change(search, { target: { value: "Pending" } });
    const option = await screen.findByRole("option", { name: /Pending/ });
    expect(screen.queryByRole("option", { name: /Active/ })).toBeNull();
    fireEvent.keyDown(search, { key: "ArrowDown" });
    await waitFor(() =>
      expect(search.getAttribute("aria-activedescendant")).toBe(option.id),
    );
    fireEvent.keyDown(search, { key: "Enter" });
    expect(screen.getByLabelText("Filter value").textContent).toBe('"p"');
    await waitFor(() => expect(screen.queryByRole("listbox")).toBeNull());
    await waitFor(() => expect(document.activeElement).toBe(trigger));
  });

  it("deselects the current single selection and exposes an empty search result", async () => {
    render(<ControlledFilter initialValue="a" />);
    fireEvent.click(screen.getByRole("combobox", { name: "Status" }));
    const selected = await screen.findByRole("option", { name: /Active/ });
    expect(selected.getAttribute("aria-selected")).toBe("true");
    fireEvent.click(selected);
    expect(screen.getByLabelText("Filter value").textContent).toBe('""');
    fireEvent.click(screen.getByRole("combobox", { name: "Status" }));
    fireEvent.change(
      await screen.findByRole("combobox", { name: "Search Status" }),
      { target: { value: "missing" } },
    );
    expect(await screen.findByText("No options found.")).toBeTruthy();
    expect(screen.queryAllByRole("option")).toHaveLength(0);
  });

  it("exposes multiple selections and retains the query while toggling results", async () => {
    render(<ControlledFilter multiple initialValue={["a"]} />);
    fireEvent.click(screen.getByRole("combobox", { name: "Status" }));
    const list = await screen.findByRole("listbox");
    expect(list.getAttribute("aria-multiselectable")).toBe("true");
    expect(
      screen
        .getByRole("option", { name: /Active/ })
        .getAttribute("aria-selected"),
    ).toBe("true");
    const search = screen.getByRole("combobox", { name: "Search Status" });
    fireEvent.change(search, { target: { value: "Pending" } });
    fireEvent.click(await screen.findByRole("option", { name: /Pending/ }));
    expect(screen.getByLabelText("Filter value").textContent).toBe('["a","p"]');
    expect(search).toHaveProperty("value", "Pending");
    expect(
      screen
        .getByRole("option", { name: /Pending/ })
        .getAttribute("aria-selected"),
    ).toBe("true");
    fireEvent.click(screen.getByRole("option", { name: /Pending/ }));
    expect(screen.getByLabelText("Filter value").textContent).toBe('["a"]');
    fireEvent.keyDown(search, { key: "Escape" });
    await waitFor(() => expect(screen.queryByRole("listbox")).toBeNull());
  });

  it("removes chips without nested buttons and clears summarized selections", async () => {
    const { container, unmount } = render(
      <ControlledFilter multiple initialValue={["p", "a"]} />,
    );
    expect(container.querySelector("button button")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Remove Active" }));
    expect(screen.getByLabelText("Filter value").textContent).toBe('["p"]');
    expect(screen.queryByRole("listbox")).toBeNull();
    expect(document.activeElement).toBe(
      screen.getByRole("combobox", { name: "Status" }),
    );
    unmount();

    render(<ControlledFilter multiple initialValue={["a", "p", "c"]} />);
    expect(screen.getByText("3 selected")).toBeTruthy();
    fireEvent.click(screen.getByRole("combobox", { name: "Status" }));
    fireEvent.click(await screen.findByRole("button", { name: "Clear all" }));
    expect(screen.getByLabelText("Filter value").textContent).toBe("[]");
    expect(screen.queryByText("3 selected")).toBeNull();
  });
});
