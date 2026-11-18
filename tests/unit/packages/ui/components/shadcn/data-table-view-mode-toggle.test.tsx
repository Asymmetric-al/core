/** @vitest-environment jsdom */

import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { useState } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { DataTableViewModeToggle } from "../../../../../../packages/ui/components/shadcn/data-table/data-table-responsive-chrome";

import type { ViewMode } from "../../../../../../packages/ui/components/shadcn/data-table/data-table-responsive-types";

function Harness({ onChange }: { onChange: (mode: ViewMode) => void }) {
  const [viewMode, setViewMode] = useState<ViewMode>("table");
  return (
    <DataTableViewModeToggle
      viewMode={viewMode}
      onViewModeChange={(mode) => {
        onChange(mode);
        setViewMode(mode);
      }}
    />
  );
}

afterEach(() => {
  cleanup();
});

describe("DataTableViewModeToggle", () => {
  it("is a named single-choice group with one tab stop", () => {
    render(<Harness onChange={vi.fn()} />);

    const group = screen.getByRole("group", { name: "Layout" });
    const table = within(group).getByRole("button", { name: "Table view" });
    const card = within(group).getByRole("button", { name: "Card view" });

    expect(table.getAttribute("aria-pressed")).toBe("true");
    expect(card.getAttribute("aria-pressed")).toBe("false");
    expect(table.tabIndex).toBe(0);
    expect(card.tabIndex).toBe(-1);
  });

  it("moves between the views with the arrow keys", async () => {
    render(<Harness onChange={vi.fn()} />);

    const table = screen.getByRole("button", { name: "Table view" });
    const card = screen.getByRole("button", { name: "Card view" });

    table.focus();
    fireEvent.keyDown(table, { key: "ArrowRight" });
    await waitFor(() => expect(document.activeElement).toBe(card));
    fireEvent.keyDown(card, { key: "ArrowLeft" });
    await waitFor(() => expect(document.activeElement).toBe(table));
  });

  it("switches the view and never leaves no view selected", () => {
    const onChange = vi.fn();
    render(<Harness onChange={onChange} />);

    const table = screen.getByRole("button", { name: "Table view" });
    const card = screen.getByRole("button", { name: "Card view" });

    fireEvent.click(card);
    expect(onChange).toHaveBeenCalledExactlyOnceWith("card");
    expect(card.getAttribute("aria-pressed")).toBe("true");
    expect(table.getAttribute("aria-pressed")).toBe("false");

    fireEvent.click(card);
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(card.getAttribute("aria-pressed")).toBe("true");
  });
});
