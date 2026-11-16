// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";
import OrgUpdates from "../../../../../apps/admin/app/(app)/feed/org-updates/page-client";
afterEach(cleanup);
it("explains publishing once with working alternatives and no dead Publish action", () => {
  render(<OrgUpdates />);
  expect(screen.queryByRole("button", { name: "Publish update" })).toBeNull();
  expect(screen.getByText(/publishing is not connected yet/i)).toBeTruthy();
  expect(screen.queryByText("Organization publishing unavailable")).toBeNull();
  expect(screen.queryByText(/real publishing path/)).toBeNull();
  expect(screen.queryByText("Year-End Giving Reminder")).toBeNull();
  expect(
    screen.getByRole("link", { name: "Open Moderation" }).getAttribute("href"),
  ).toBe("/feed");
  expect(
    screen
      .getByRole("link", { name: "Open website ministry updates" })
      .getAttribute("href"),
  ).toBe("/web-studio/collections/ministry-updates");
});
