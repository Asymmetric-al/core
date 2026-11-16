/** @vitest-environment jsdom */

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

// eslint-disable-next-line no-restricted-imports -- AL-1894: Exercise the page at its public UI boundary.
import CareSettingsPage from "../../../../../../apps/admin/app/(app)/care/settings/page-client";
// eslint-disable-next-line no-restricted-imports -- AL-1894: The page must state the rule the overview applies.
import { CHECK_IN_INTERVAL_DAYS } from "../../../../../../apps/admin/features/mission-control/care/components/care-display";
// eslint-disable-next-line no-restricted-imports -- AL-1894: The page must state the windows the overview applies.
import {
  RECENT_CHECK_IN_WINDOW_DAYS,
  UPCOMING_BIRTHDAY_WINDOW_DAYS,
} from "../../../../../../apps/admin/features/mission-control/care/member-care.derived";
import { findNavDestination } from "../../../../../../packages/config/navigation";

afterEach(cleanup);

describe("Care settings page", () => {
  it("states the rules Member Care applies instead of an unavailable notice", () => {
    render(<CareSettingsPage />);

    expect(screen.queryByText(/not available yet/i)).toBeNull();
    expect(screen.queryByText(/coming soon/i)).toBeNull();
    expect(
      screen.getByRole("heading", { level: 1, name: "Care rules" }),
    ).toBeTruthy();
  });

  it("names each rule with the value the overview and directory use", () => {
    render(<CareSettingsPage />);

    const followUp = screen.getByRole("region", { name: "Follow-up due" });
    expect(followUp.textContent).toContain(
      `more than ${CHECK_IN_INTERVAL_DAYS} days`,
    );
    expect(followUp.textContent).toMatch(/flagged for attention/i);
    expect(followUp.textContent).toMatch(/crisis or at risk/i);
    expect(followUp.textContent).toMatch(/needs attention status alone/i);

    expect(
      screen.getByRole("region", { name: "Upcoming birthdays" }).textContent,
    ).toContain(`${UPCOMING_BIRTHDAY_WINDOW_DAYS} days`);
    expect(
      screen.getByRole("region", { name: "Recent check-ins" }).textContent,
    ).toContain(`${RECENT_CHECK_IN_WINDOW_DAYS} days`);
  });

  it("does not offer controls that would save nothing", () => {
    render(<CareSettingsPage />);

    expect(screen.queryAllByRole("switch")).toHaveLength(0);
    expect(screen.queryAllByRole("textbox")).toHaveLength(0);
    expect(screen.queryAllByRole("checkbox")).toHaveLength(0);
  });
});

describe("Care rules navigation", () => {
  it("labels the entry as read-only rules and keeps the /care/settings URL", () => {
    expect(findNavDestination("/care/settings")).toMatchObject({
      item: { id: "care", title: "Member Care" },
      sub: { id: "care-settings", title: "Rules", href: "/care/settings" },
    });
  });
});
