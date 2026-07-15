// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { FilterBuilder } from "../../../../../../packages/ui/components/shadcn/data-table/filters/filter-builder";
import {
  createEmptyFilterState,
  type FilterFieldDefinition,
} from "../../../../../../packages/ui/components/shadcn/data-table/filters/types";

const fields: FilterFieldDefinition[] = [
  { id: "name", label: "Name", type: "text" },
];

afterEach(() => {
  cleanup();
});

describe("FilterBuilder trigger", () => {
  it("forwards Base UI trigger wiring to the popover trigger button", () => {
    render(
      <FilterBuilder
        fields={fields}
        value={createEmptyFilterState()}
        onChange={vi.fn()}
        variant="popover"
      />,
    );

    const trigger = screen.getByRole("button", { name: /filters/i });

    // The Base UI PopoverTrigger merges ARIA/interaction props into the
    // render target; if FilterTriggerButton drops them the button is inert.
    expect(trigger.getAttribute("aria-haspopup")).toBe("dialog");
    expect(trigger.getAttribute("aria-expanded")).toBe("false");

    fireEvent.click(trigger);

    expect(trigger.getAttribute("aria-expanded")).toBe("true");
  });

  it("forwards Base UI trigger wiring to the sheet trigger button", () => {
    render(
      <FilterBuilder
        fields={fields}
        value={createEmptyFilterState()}
        onChange={vi.fn()}
        variant="sheet"
      />,
    );

    const trigger = screen.getByRole("button", { name: /filters/i });

    expect(trigger.getAttribute("aria-haspopup")).toBe("dialog");
    expect(trigger.getAttribute("aria-expanded")).toBe("false");

    fireEvent.click(trigger);

    expect(trigger.getAttribute("aria-expanded")).toBe("true");
  });
});
