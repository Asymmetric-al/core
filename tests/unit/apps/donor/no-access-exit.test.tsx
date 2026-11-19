/** @vitest-environment jsdom */

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";

// eslint-disable-next-line no-restricted-imports -- AL-2675: exercise the donor app's own refusal page.
import NoAccessPage from "../../../../apps/donor/app/no-access/page";

afterEach(() => cleanup());

/**
 * WP2b, AL-2675 (council round 1 on slice B, minor). The donor portal sends a
 * person it refuses here: a non-donor, or a donor with live memberships in two
 * tenants, whom the portal refuses until WP3 resolves its host. A link back to
 * `/donor-dashboard` would send them straight back here, so the page's way out
 * is the public home page, as in the missionary workspace.
 */
it("offers a way out that does not lead back to the portal that refused the person", () => {
  render(<NoAccessPage />);

  expect(screen.getByRole("heading", { name: "No access" })).toBeTruthy();
  const hrefs = screen
    .getAllByRole("link")
    .map((link) => link.getAttribute("href"));
  expect(hrefs).not.toContain("/donor-dashboard");
  expect(
    screen.getByRole("link", { name: "Go to home" }).getAttribute("href"),
  ).toBe("/");
  expect(
    screen.getByRole("link", { name: "Switch account" }).getAttribute("href"),
  ).toBe("/login");
});
