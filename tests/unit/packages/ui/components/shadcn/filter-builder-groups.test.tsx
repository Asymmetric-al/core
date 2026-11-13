// @vitest-environment jsdom

import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { FilterBuilder } from "../../../../../../packages/ui/components/shadcn/data-table/filters/filter-builder";
import {
  createEmptyFilterState,
  filterGroupsOf,
  filterStateOfGroups,
  type AdvancedFilterState,
  type FilterCondition,
  type FilterFieldDefinition,
} from "../../../../../../packages/ui/components/shadcn/data-table/filters/types";

const fields: FilterFieldDefinition[] = [
  { id: "title", label: "Title", type: "text" },
  { id: "slug", label: "Slug", type: "text" },
];

function condition(id: string, field = "title", value = id): FilterCondition {
  return { id, field, operator: "contains", value };
}

const A = condition("a");
const B = condition("b", "slug");
const C = condition("c");

/** (A AND B) OR C, as the grouped builder writes it. */
const COMPOUND: AdvancedFilterState = {
  logic: "or",
  conditions: [],
  groups: [
    { id: "g1", logic: "and", conditions: [A, B] },
    { id: "g2", logic: "and", conditions: [C] },
  ],
};

afterEach(() => {
  cleanup();
});

describe("filterGroupsOf", () => {
  it("reads no filters as no groups", () => {
    expect(filterGroupsOf(createEmptyFilterState())).toEqual([]);
  });

  it("reads a flat AND list as one group", () => {
    const groups = filterGroupsOf({
      logic: "and",
      conditions: [A, B],
      groups: [],
    });
    expect(groups.map((group) => group.conditions)).toEqual([[A, B]]);
  });

  it("reads a flat OR list as one group per condition", () => {
    const groups = filterGroupsOf({
      logic: "or",
      conditions: [A, C],
      groups: [],
    });
    expect(groups.map((group) => group.conditions)).toEqual([[A], [C]]);
  });

  it("reads an OR of AND groups group by group, keeping their ids", () => {
    expect(filterGroupsOf(COMPOUND)).toEqual([
      { id: "g1", conditions: [A, B] },
      { id: "g2", conditions: [C] },
    ]);
  });
});

describe("filterStateOfGroups", () => {
  it("writes no groups, or only empty ones, as no filters", () => {
    expect(filterStateOfGroups([])).toEqual(createEmptyFilterState());
    expect(filterStateOfGroups([{ id: "g1", conditions: [] }])).toEqual(
      createEmptyFilterState(),
    );
  });

  it("writes one group as the flat AND list every consumer reads", () => {
    expect(filterStateOfGroups([{ id: "g1", conditions: [A, B] }])).toEqual({
      logic: "and",
      conditions: [A, B],
      groups: [],
    });
  });

  it("writes single-condition groups as the flat OR list", () => {
    expect(
      filterStateOfGroups([
        { id: "g1", conditions: [A] },
        { id: "g2", conditions: [C] },
      ]),
    ).toEqual({ logic: "or", conditions: [A, C], groups: [] });
  });

  it("writes an OR of AND groups when a group joins several conditions", () => {
    expect(
      filterStateOfGroups([
        { id: "g1", conditions: [A, B] },
        { id: "g0", conditions: [] },
        { id: "g2", conditions: [C] },
      ]),
    ).toEqual(COMPOUND);
  });

  it("round-trips with filterGroupsOf", () => {
    expect(filterStateOfGroups(filterGroupsOf(COMPOUND))).toEqual(COMPOUND);
  });
});

describe("FilterBuilder with groups", () => {
  function renderBuilder(value: AdvancedFilterState) {
    const onChange = vi.fn();
    render(
      <FilterBuilder
        allowGroups
        fields={fields}
        value={value}
        onChange={onChange}
        variant="inline"
      />,
    );
    return onChange;
  }

  it("shows each group with AND inside it and OR between groups", () => {
    renderBuilder(COMPOUND);

    const groups = screen.getAllByRole("group", { name: /^Condition group/ });
    expect(groups).toHaveLength(2);
    expect(groups[0]?.getAttribute("aria-label")).toBe(
      "Condition group 1 of 2",
    );
    expect(within(groups[0]!).getAllByLabelText("Filter field")).toHaveLength(
      2,
    );
    expect(within(groups[0]!).getByText("AND")).toBeTruthy();
    expect(within(groups[1]!).getAllByLabelText("Filter field")).toHaveLength(
      1,
    );
    expect(screen.getByText("OR")).toBeTruthy();
    expect(
      screen.getByText(
        "Shows rows that match every condition in at least one group.",
      ),
    ).toBeTruthy();
  });

  it("adds a condition to the group it was asked from", () => {
    const onChange = renderBuilder(COMPOUND);
    const second = screen.getAllByRole("group", {
      name: /^Condition group/,
    })[1]!;

    fireEvent.click(
      within(second).getByRole("button", { name: "Add condition to group 2" }),
    );

    const next = onChange.mock.calls[0]?.[0] as AdvancedFilterState;
    const groups = filterGroupsOf(next);
    expect(groups.map((group) => group.conditions.length)).toEqual([2, 2]);
    expect(groups[1]?.conditions[0]).toEqual(C);
    expect(groups[1]?.conditions[1]?.field).toBe("title");
  });

  it("adds an OR group", () => {
    const onChange = renderBuilder({
      logic: "and",
      conditions: [A, B],
      groups: [],
    });

    fireEvent.click(screen.getByRole("button", { name: "Add OR group" }));

    const next = onChange.mock.calls[0]?.[0] as AdvancedFilterState;
    const groups = filterGroupsOf(next);
    expect(groups.map((group) => group.conditions.length)).toEqual([2, 1]);
    expect(groups[0]?.conditions).toEqual([A, B]);
  });

  it("drops a group when its last condition is removed", () => {
    const onChange = renderBuilder(COMPOUND);
    const second = screen.getAllByRole("group", {
      name: /^Condition group/,
    })[1]!;

    fireEvent.click(
      within(second).getByRole("button", { name: "Remove Title filter" }),
    );

    expect(onChange).toHaveBeenCalledWith({
      logic: "and",
      conditions: [A, B],
      groups: [],
    });
  });

  it("frames groups only once there is more than one", () => {
    renderBuilder({ logic: "and", conditions: [A, B], groups: [] });

    expect(
      screen.queryAllByRole("group", { name: /^Condition group/ }),
    ).toHaveLength(0);
    // One labelled pair, side by side, in the same style.
    const add = screen.getByRole("button", { name: "Add condition" });
    const or = screen.getByRole("button", { name: "Add OR group" });
    expect(add.parentElement).toBe(or.parentElement);
    expect(add.getAttribute("data-variant")).toBe(
      or.getAttribute("data-variant"),
    );
    expect(add.getAttribute("data-size")).toBe(or.getAttribute("data-size"));
  });

  it("names each group's add button after its group, beside one OR button", () => {
    renderBuilder(COMPOUND);
    const groups = screen.getAllByRole("group", { name: /^Condition group/ });

    expect(
      within(groups[0]!).getByRole("button", {
        name: "Add condition to group 1",
      }),
    ).toBeTruthy();
    expect(
      within(groups[0]!).queryByRole("button", { name: "Add OR group" }),
    ).toBeNull();
    // One OR button follows the groups (it adds a group, so it sits outside
    // them), in the same style as each group's add button.
    const last = within(groups[1]!).getByRole("button", {
      name: "Add condition to group 2",
    });
    const or = screen.getByRole("button", { name: "Add OR group" });
    expect(groups[1]!.contains(or)).toBe(false);
    expect(last.getAttribute("data-variant")).toBe(
      or.getAttribute("data-variant"),
    );
    expect(screen.queryByRole("button", { name: "And" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Or" })).toBeNull();
  });

  it("keeps the flat AND/OR builder when groups are not allowed", () => {
    render(
      <FilterBuilder
        fields={fields}
        value={{ logic: "and", conditions: [A, B], groups: [] }}
        onChange={vi.fn()}
        variant="inline"
      />,
    );

    expect(screen.queryByRole("button", { name: "Or" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Add OR group" })).toBeNull();
    expect(screen.getByRole("button", { name: "AND" })).toBeTruthy();
  });
});
