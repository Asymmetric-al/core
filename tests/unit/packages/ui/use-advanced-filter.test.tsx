/** @vitest-environment jsdom */

import { useAdvancedFilter } from "@asym/ui/components/shadcn/data-table";
import { act, cleanup, renderHook } from "@testing-library/react";
import * as React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { FilterFieldDefinition } from "@asym/ui/components/shadcn/data-table";

const fields: FilterFieldDefinition[] = [
  { id: "name", label: "Name", type: "text", defaultOperator: "contains" },
  { id: "amount", label: "Amount", type: "number" },
];

function StrictModeWrapper({ children }: { children: React.ReactNode }) {
  return <React.StrictMode>{children}</React.StrictMode>;
}

afterEach(() => {
  cleanup();
});

describe("useAdvancedFilter", () => {
  it("notifies onFilterChange exactly once per action even when React replays the state updater", () => {
    // StrictMode double-invokes state updater functions in development, so a
    // side effect inside the updater fires twice. The parent must only hear
    // about each change once.
    const onFilterChange = vi.fn();
    const { result } = renderHook(
      () => useAdvancedFilter({ fields, onFilterChange }),
      { wrapper: StrictModeWrapper },
    );

    act(() => {
      result.current.addCondition("name");
    });

    expect(onFilterChange).toHaveBeenCalledTimes(1);
    expect(result.current.filter.conditions).toHaveLength(1);
    expect(onFilterChange).toHaveBeenLastCalledWith(result.current.filter);

    const [condition] = result.current.filter.conditions;
    expect(condition).toBeDefined();
    if (!condition) throw new Error("condition missing");

    act(() => {
      result.current.updateCondition(condition.id, { value: "Ada" });
    });

    expect(onFilterChange).toHaveBeenCalledTimes(2);
    expect(result.current.filter.conditions[0]?.value).toBe("Ada");
    expect(onFilterChange).toHaveBeenLastCalledWith(result.current.filter);

    act(() => {
      result.current.removeCondition(condition.id);
    });

    expect(onFilterChange).toHaveBeenCalledTimes(3);
    expect(result.current.filter.conditions).toHaveLength(0);
    expect(onFilterChange).toHaveBeenLastCalledWith(result.current.filter);
  });

  it("ignores addCondition for unknown fields without notifying", () => {
    const onFilterChange = vi.fn();
    const { result } = renderHook(() =>
      useAdvancedFilter({ fields, onFilterChange }),
    );

    act(() => {
      result.current.addCondition("does-not-exist");
    });

    expect(onFilterChange).not.toHaveBeenCalled();
    expect(result.current.filter.conditions).toHaveLength(0);
  });

  it("uses the field default operator when adding a condition", () => {
    const { result } = renderHook(() => useAdvancedFilter({ fields }));

    act(() => {
      result.current.addCondition("name");
      result.current.addCondition("amount");
    });

    expect(result.current.filter.conditions.map((c) => c.operator)).toEqual([
      "contains",
      "equals",
    ]);
  });
});
