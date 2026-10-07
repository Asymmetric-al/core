/** @vitest-environment jsdom */
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import {
  FilterTextInput,
  FilterNumberInput,
  FilterCurrencyInput,
} from "../../../../packages/ui/components/shadcn/data-table/filters/filter-value-inputs";

afterEach(cleanup);

it("names a text filter and preserves its change payload", () => {
  const onChange = vi.fn();
  render(
    <FilterTextInput
      field={{ id: "name", label: "Partner name", type: "text" }}
      operator="contains"
      value="Ada"
      onChange={onChange}
    />,
  );
  fireEvent.change(screen.getByRole("textbox", { name: "Partner name" }), {
    target: { value: "Grace" },
  });
  expect(onChange).toHaveBeenCalledWith("Grace");
});

for (const [label, Input, type] of [
  ["Age", FilterNumberInput, "number"],
  ["Gift amount", FilterCurrencyInput, "currency"],
] as const) {
  it(`names the ${type} filter and preserves an empty editing draft`, () => {
    const onChange = vi.fn();
    render(
      <Input
        field={{ id: "value", label, type }}
        operator="eq"
        value={10}
        onChange={onChange}
      />,
    );
    fireEvent.change(screen.getByRole("spinbutton", { name: label }), {
      target: { value: "" },
    });
    expect(onChange).toHaveBeenCalledWith(null);
  });
  it(`distinguishes both ${type} range ends and preserves the opposite value`, () => {
    const onChange = vi.fn();
    render(
      <Input
        field={{ id: "value", label, type }}
        operator="between"
        value={{ min: 10, max: 20 }}
        onChange={onChange}
      />,
    );
    fireEvent.change(
      screen.getByRole("spinbutton", { name: `${label} minimum` }),
      { target: { value: "5" } },
    );
    expect(onChange).toHaveBeenLastCalledWith({ min: 5, max: 20 });
    fireEvent.change(
      screen.getByRole("spinbutton", { name: `${label} maximum` }),
      { target: { value: "" } },
    );
    expect(onChange).toHaveBeenLastCalledWith({ min: 10, max: null });
  });
}

it("names and focuses saved-view renaming while preserving the update payload", async () => {
  const { SavedFilters } =
    await import("../../../../packages/ui/components/shadcn/data-table/filters/saved-filters");
  const { createEmptyFilterState } =
    await import("../../../../packages/ui/components/shadcn/data-table/filters/types");
  const onUpdate = vi.fn();
  const noop = () => {};
  render(
    <SavedFilters
      savedFilters={[
        {
          id: "view-1",
          name: "Current partners",
          filter: createEmptyFilterState(),
          createdAt: new Date(0),
          updatedAt: new Date(0),
        },
      ]}
      currentFilter={createEmptyFilterState()}
      onApplyFilter={noop}
      onSaveFilter={noop}
      onDeleteFilter={noop}
      onUpdateFilter={onUpdate}
      onSetDefault={noop}
    />,
  );
  fireEvent.click(screen.getByRole("button", { name: /Saved Views/ }));
  fireEvent.click(await screen.findByRole("button", { name: "Open actions" }));
  fireEvent.click(await screen.findByRole("menuitem", { name: "Rename" }));
  const name = await screen.findByRole("textbox", {
    name: "Rename saved view",
  });
  await waitFor(() => expect(document.activeElement).toBe(name));
  fireEvent.change(name, { target: { value: " Active partners " } });
  fireEvent.click(screen.getByRole("button", { name: "Confirm rename" }));
  expect(onUpdate).toHaveBeenCalledWith("view-1", "Active partners", undefined);
});

it("forwards native accessible names through input-group public controls", async () => {
  const { InputGroup, InputGroupInput, InputGroupTextarea } =
    await import("../../../../packages/ui/components/shadcn/input-group");
  const onChange = vi.fn();
  render(
    <>
      <InputGroup>
        <InputGroupInput aria-label="Find views" onChange={onChange} />
      </InputGroup>
      <InputGroup>
        <InputGroupTextarea aria-label="View notes" />
      </InputGroup>
    </>,
  );
  fireEvent.change(screen.getByRole("textbox", { name: "Find views" }), {
    target: { value: "Active" },
  });
  expect(onChange).toHaveBeenCalledTimes(1);
  expect(screen.getByRole("textbox", { name: "View notes" }).tagName).toBe(
    "TEXTAREA",
  );
});
