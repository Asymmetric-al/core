// @vitest-environment jsdom

import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";

afterEach(cleanup);

it("announces active domain filters while preserving toggle, reset, and search callbacks", async () => {
  const { CrmRelationshipsFilters } =
    await import("../../../../../apps/admin/app/(app)/crm/relationships/page-client");
  const onDomainToggle = vi.fn();
  const clearDomains = vi.fn();
  const onSearchChange = vi.fn();
  render(
    <CrmRelationshipsFilters
      search=""
      domains={[]}
      onDomainToggle={onDomainToggle}
      clearDomains={clearDomains}
      onSearchChange={onSearchChange}
    />,
  );
  const all = screen.getByRole("button", { name: "All" });
  expect(all.getAttribute("aria-pressed")).toBe("true");
  const domain = screen
    .getAllByRole("button")
    .find((button) => button !== all)!;
  expect(domain.getAttribute("aria-pressed")).toBe("false");
  fireEvent.click(domain);
  expect(onDomainToggle).toHaveBeenCalledOnce();
  // All is already on, so pressing it resets nothing (the next test resets
  // chosen types).
  fireEvent.click(all);
  expect(clearDomains).not.toHaveBeenCalled();
  // The shared grid search is an <input type="search"> (role "searchbox").
  fireEvent.change(
    screen.getByRole("searchbox", { name: "Search CRM relationships" }),
    { target: { value: "household" } },
  );
  expect(onSearchChange).toHaveBeenCalledWith("household");
});

it("is one shared toggle group: a single tab stop, arrow keys, and All clearing the types", async () => {
  const { CrmRelationshipsFilters } =
    await import("../../../../../apps/admin/app/(app)/crm/relationships/page-client");
  const onDomainToggle = vi.fn();
  const clearDomains = vi.fn();
  const filters = (domains: ("people" | "churches")[]) => (
    <CrmRelationshipsFilters
      search=""
      domains={domains}
      onDomainToggle={onDomainToggle}
      clearDomains={clearDomains}
      onSearchChange={vi.fn()}
    />
  );
  const view = render(filters([]));
  const group = screen.getByRole("group", { name: "Relationship types" });
  expect(group.getAttribute("data-slot")).toBe("toggle-group");
  const chips = within(group).getAllByRole("button");
  expect(chips.map((chip) => chip.textContent)).toEqual([
    "All",
    "People",
    "Organizations",
    "Churches",
    "Households",
    "Pledges",
    "Activity",
  ]);
  // Seven chips, one Tab stop; the arrows move between them.
  expect(chips.filter((chip) => chip.tabIndex === 0)).toEqual([chips[0]]);
  chips[0]!.focus();
  fireEvent.keyDown(chips[0]!, { key: "ArrowRight" });
  await waitFor(() => expect(document.activeElement).toBe(chips[1]));

  // Pressing All while it is on keeps it on and changes nothing.
  fireEvent.click(chips[0]!);
  expect(clearDomains).not.toHaveBeenCalled();
  expect(onDomainToggle).not.toHaveBeenCalled();
  fireEvent.click(chips[1]!);
  expect(onDomainToggle).toHaveBeenCalledExactlyOnceWith("people");

  view.rerender(filters(["people", "churches"]));
  const pressed = () =>
    within(group)
      .getAllByRole("button")
      .filter((chip) => chip.getAttribute("aria-pressed") === "true")
      .map((chip) => chip.textContent);
  expect(pressed()).toEqual(["People", "Churches"]);
  onDomainToggle.mockClear();
  fireEvent.click(within(group).getByRole("button", { name: "Churches" }));
  expect(onDomainToggle).toHaveBeenCalledExactlyOnceWith("churches");
  fireEvent.click(within(group).getByRole("button", { name: "All" }));
  expect(clearDomains).toHaveBeenCalledOnce();
});
