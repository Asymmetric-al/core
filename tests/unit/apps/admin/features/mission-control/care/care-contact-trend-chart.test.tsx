/** @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";

import { CareContactTrend } from "../../../../../../../apps/admin/features/mission-control/care/components/care-contact-trend";
import type { ActivityLogEntry } from "../../../../../../../apps/admin/features/mission-control/care/types";

beforeEach(() => {
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

it("describes a populated capped chart without claiming complete totals", () => {
  const activities: ActivityLogEntry[] = Array.from(
    { length: 500 },
    (_, index) => ({
      id: `entry-${index}`,
      kind: index === 0 ? "activity" : "thread",
      personnelId: "member",
      type: "Check-in",
      content: "Saved entry",
      date: new Date().toISOString(),
      authorId: "staff",
      authorName: "Staff",
      isPrivate: false,
    }),
  );
  render(<CareContactTrend activities={activities} />);
  expect(
    screen.getByRole("heading", { level: 2, name: "Contacts logged by week" }),
  ).toBeTruthy();
  const figure = screen.getByRole("figure", {
    name: "Contacts logged by week",
  });
  const descriptions = figure
    .getAttribute("aria-describedby")!
    .split(" ")
    .map((id) => document.getElementById(id)!.textContent)
    .join(" ");
  expect(descriptions).toContain("In the loaded entries: 1 contact.");
  expect(descriptions).toContain("last period includes today");
  expect(descriptions).toContain("latest 500 saved entries");
  expect(descriptions).toContain("not full activity totals");
});

it("shows loading and error states rather than a zero chart, with a working retry", () => {
  const retry = vi.fn();
  const { rerender } = render(
    <CareContactTrend activities={[]} isLoading onRetry={retry} />,
  );
  expect(screen.getByRole("status").textContent).toContain(
    "Loading Contacts logged by week",
  );
  expect(screen.queryByRole("figure")).toBeNull();
  rerender(<CareContactTrend activities={[]} isError onRetry={retry} />);
  expect(screen.getByRole("alert").textContent).toContain("could not load");
  fireEvent.click(screen.getByRole("button", { name: "Try again" }));
  expect(retry).toHaveBeenCalledOnce();
});

it("does not call a capped empty window a complete zero", () => {
  const activities: ActivityLogEntry[] = Array.from(
    { length: 500 },
    (_, index) => ({
      id: `thread-${index}`,
      kind: "thread",
      personnelId: "member",
      type: "Pastoral Note",
      content: "Shared update",
      date: new Date().toISOString(),
      authorId: "staff",
      authorName: "Staff",
      isPrivate: false,
    }),
  );
  render(<CareContactTrend activities={activities} />);
  expect(screen.getByRole("status").textContent).toContain(
    "No contacts in the loaded entries",
  );
  expect(screen.getByText(/latest 500 saved entries/)).toBeTruthy();
  expect(screen.getByText(/Older contacts may be missing/)).toBeTruthy();
});

it("explains a genuinely empty window", () => {
  render(<CareContactTrend activities={[]} />);
  expect(screen.getByRole("status").textContent).toContain(
    "No contacts logged in the last 28 days",
  );
});
