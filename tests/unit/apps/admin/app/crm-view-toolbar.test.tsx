// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";

afterEach(cleanup);

it("announces the selected CRM view and preserves single selection", async () => {
  const { CrmViewToolbar } =
    await import("../../../../../apps/admin/app/(app)/crm/page-client");
  const setView = vi.fn();
  const { rerender } = render(
    <CrmViewToolbar view="table" setView={setView} />,
  );
  const table = screen.getByRole("button", { name: "Show CRM table view" });
  const kanban = screen.getByRole("button", { name: "Show CRM kanban view" });
  expect(table.getAttribute("aria-pressed")).toBe("true");
  expect(kanban.getAttribute("aria-pressed")).toBe("false");
  fireEvent.click(kanban);
  expect(setView).toHaveBeenCalledWith("kanban");
  rerender(<CrmViewToolbar view="kanban" setView={setView} />);
  expect(kanban.getAttribute("aria-pressed")).toBe("true");
  setView.mockClear();
  fireEvent.click(kanban);
  expect(setView).not.toHaveBeenCalled();
  expect(
    screen.getByRole("link", { name: "Relationships" }).getAttribute("href"),
  ).toBe("/crm/relationships");
  expect(screen.getByRole("link", { name: "Notes" }).getAttribute("href")).toBe(
    "/crm/notes",
  );
});
