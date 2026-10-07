// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
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
  fireEvent.click(all);
  expect(clearDomains).toHaveBeenCalledOnce();
  fireEvent.change(
    screen.getByRole("textbox", { name: "Search CRM relationships" }),
    { target: { value: "household" } },
  );
  expect(onSearchChange).toHaveBeenCalledWith("household");
});
