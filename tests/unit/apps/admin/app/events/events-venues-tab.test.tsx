// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";
import Events from "../../../../../../apps/admin/app/(app)/events/page-client";
afterEach(cleanup);
it("explains the unavailable event connection without fake metrics or attendees", () => {
  render(<Events />);
  expect(
    screen.getByRole("heading", { name: "Events is not connected yet" }),
  ).toBeTruthy();
  expect(screen.queryByRole("tab", { name: "Attendees" })).toBeNull();
  expect(screen.queryByRole("button", { name: /export/i })).toBeNull();
  expect(
    screen.getByRole("link", { name: "Open CRM" }).getAttribute("href"),
  ).toBe("/crm");
});
