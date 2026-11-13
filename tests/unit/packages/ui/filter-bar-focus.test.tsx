// @vitest-environment jsdom
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import React, { useState } from "react";
import { afterEach, expect, it } from "vitest";

import { FilterBar } from "../../../../packages/ui/components/primitives/filter-bar";

afterEach(cleanup);

function Harness() {
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState(["Type: Call", "Priority: High"]);
  return (
    <FilterBar
      search={{ value: search, onChange: setSearch, label: "Search tasks" }}
      activeFilters={filters.map((label) => ({
        label,
        onRemove: () =>
          setFilters((current) => current.filter((item) => item !== label)),
      }))}
      onReset={() => {
        setFilters([]);
        setSearch("");
      }}
    />
  );
}

// Removing a chip removes the focused button; focus must land on the next
// chip's remove control, or on the search field when none remain.
it("keeps keyboard focus in the filter bar when chips are removed", () => {
  render(<Harness />);

  const first = screen.getByRole("button", {
    name: "Remove Type: Call filter",
  });
  act(() => first.focus());
  fireEvent.click(first);
  expect(document.activeElement).toBe(
    screen.getByRole("button", { name: "Remove Priority: High filter" }),
  );

  fireEvent.click(document.activeElement as HTMLElement);
  expect(document.activeElement).toBe(
    screen.getByRole("textbox", { name: "Search tasks" }),
  );
});

it("moves focus to the search field after Clear all", () => {
  render(<Harness />);
  const clear = screen.getByRole("button", { name: "Clear all" });
  act(() => clear.focus());
  fireEvent.click(clear);
  expect(document.activeElement).toBe(
    screen.getByRole("textbox", { name: "Search tasks" }),
  );
});
