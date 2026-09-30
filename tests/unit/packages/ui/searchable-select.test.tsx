// @vitest-environment jsdom

import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { SearchableSelect } from "../../../../packages/ui/components/shadcn/searchable-select";

afterEach(cleanup);

const items = [
  { value: "one", label: "Shared name" },
  { value: "two", label: "Shared name" },
  { value: "three", label: "Unavailable", disabled: true },
];

describe("SearchableSelect", () => {
  it("labels and focuses the closed trigger, filters labels, selects stable IDs and restores focus", async () => {
    const onValueChange = vi.fn();
    render(
      <SearchableSelect
        label="Tenant"
        items={items}
        value="two"
        onValueChange={onValueChange}
      />,
    );
    const trigger = screen.getByRole("combobox", { name: "Tenant" });
    expect(trigger.textContent).toContain("Shared name");
    fireEvent.click(screen.getByText("Tenant"));
    expect(document.activeElement).toBe(trigger);
    expect(screen.queryByRole("listbox")).toBeNull();
    fireEvent.click(trigger);
    const search = await screen.findByRole("combobox", {
      name: "Search Tenant",
    });
    fireEvent.change(search, { target: { value: "Shared" } });
    const options = await screen.findAllByRole("option", {
      name: /Shared name/,
    });
    expect(options).toHaveLength(2);
    expect(options[1]?.getAttribute("aria-selected")).toBe("true");
    fireEvent.keyDown(search, { key: "ArrowDown" });
    fireEvent.keyDown(search, { key: "Enter" });
    expect(onValueChange.mock.calls[0]?.[0]).toBe("one");
    await waitFor(() => expect(document.activeElement).toBe(trigger));
  });

  it("keeps the empty live region mounted and preserves selection when searching without a result", async () => {
    const onValueChange = vi.fn();
    render(
      <SearchableSelect
        aria-label="Agent"
        items={items}
        value="two"
        onValueChange={onValueChange}
      />,
    );
    fireEvent.click(screen.getByRole("combobox", { name: "Agent" }));
    const search = await screen.findByRole("combobox", {
      name: "Search Agent",
    });
    const status = screen.getByRole("status");
    expect(status.textContent).toBe("");
    fireEvent.change(search, { target: { value: "Missing" } });
    expect(screen.getByRole("status")).toBe(status);
    expect(status.textContent).toBe("No options found.");
    expect(onValueChange).not.toHaveBeenCalled();
    fireEvent.keyDown(search, { key: "Escape" });
    await waitFor(() => expect(screen.queryByRole("listbox")).toBeNull());
  });

  it("retains disabled choices and recomputes display labels when records refresh", async () => {
    const onValueChange = vi.fn();
    const { rerender } = render(
      <SearchableSelect
        aria-label="Agent"
        items={items}
        value="two"
        onValueChange={onValueChange}
      />,
    );
    fireEvent.click(screen.getByRole("combobox", { name: "Agent" }));
    const unavailable = await screen.findByRole("option", {
      name: "Unavailable",
    });
    fireEvent.click(unavailable);
    expect(onValueChange).not.toHaveBeenCalled();
    rerender(
      <SearchableSelect
        aria-label="Agent"
        items={items.map((item) => ({
          ...item,
          label: item.value === "two" ? "Updated name" : item.label,
        }))}
        value="two"
        onValueChange={onValueChange}
      />,
    );
    expect(
      screen.getByRole("combobox", { name: "Agent" }).textContent,
    ).toContain("Updated name");
  });
});
