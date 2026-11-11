/** @vitest-environment jsdom */

import { cleanup, render, screen, within } from "@testing-library/react";
import React from "react";
import { afterEach, expect, it, vi } from "vitest";

const jordan = { id: "m-jordan", name: "Jordan Hale", avatarUrl: null };

const gift = (id: string, amount: number) => ({
  id,
  date: new Date().toISOString(),
  amount,
  amountCents: Math.round(amount * 100),
  currency: "usd",
  status: "Paid",
  type: "One-Time",
  method: "Card",
  receiptUrl: "",
  statementYear: new Date().getFullYear(),
  designation: {
    id: jordan.id,
    name: jordan.name,
    type: "missionary",
    avatarUrl: null,
  },
  missionary: jordan,
  fund: null,
});

vi.mock("@asym/database/hooks", () => ({
  useDonorPortalSnapshot: () => ({
    isLoading: false,
    error: null,
    data: {
      profile: { displayName: "Avery Lopez" },
      summary: { statementYears: [] },
      donations: [gift("d1", 500), gift("d2", 206.67)],
      recurringGifts: [],
    },
  }),
  useDonorWallet: () => ({ data: { status: "linked", methods: [] } }),
  useDonorFeedPosts: () => ({ data: [], isLoading: false, error: null }),
  mapToRecentUpdate: (post: unknown) => post,
  formatPostRelativeTime: () => "Today",
  postAuthorName: () => "Jordan Hale",
  postImages: () => [],
  postTitle: () => "",
}));
vi.mock("@asym/lib/view-transitions", () => ({
  useWithinViewTransitionRouteLayer: () => true,
}));
vi.mock("next/link", () => ({
  default: ({
    children,
    href,
    ...props
  }: React.PropsWithChildren<{ href: string }>) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

// eslint-disable-next-line no-restricted-imports -- AL-1931: The actual donor overview at its app boundary.
import { DonorDashboardMainBody } from "../../../../apps/donor/features/donor/components/donor-dashboard-main-body";

afterEach(cleanup);

const year = new Date().getFullYear();

it("sets the two money summaries side by side on phones so the latest update starts sooner", () => {
  render(<DonorDashboardMainBody />);

  const given = screen.getByRole("region", { name: `Given in ${year}` });
  const next = screen.getByRole("region", { name: "Next gift" });
  const supported = screen.getByRole("region", { name: "Who you support" });
  const grid = given.parentElement!;
  expect(next.parentElement).toBe(grid);
  expect(supported.parentElement).toBe(grid);

  // Two columns from the smallest width; three from md.
  expect(grid.classList.contains("grid-cols-2")).toBe(true);
  expect(grid.classList.contains("md:grid-cols-3")).toBe(true);
  // Who you support keeps a full row on phones for its names.
  expect(supported.classList.contains("col-span-2")).toBe(true);
  expect(supported.classList.contains("md:col-span-1")).toBe(true);

  // No figure is lost.
  expect(within(given).getByText("$706.67")).toBeTruthy();
  expect(within(given).getByText(/2 gifts/)).toBeTruthy();
  expect(within(next).getByText("None scheduled")).toBeTruthy();
  expect(within(supported).getByText("Jordan Hale")).toBeTruthy();
});

it("tightens the page's vertical gaps on phones only", () => {
  render(<DonorDashboardMainBody />);

  const page = screen
    .getByRole("heading", { level: 1 })
    .closest(".flex-col.gap-4");
  expect(page).not.toBeNull();
  expect(page!.classList.contains("sm:gap-6")).toBe(true);
});

it("keeps every summary link reachable, in the card on wider screens and in the tab bar on phones", () => {
  render(<DonorDashboardMainBody />);

  const given = screen.getByRole("region", { name: `Given in ${year}` });
  const link = within(given).getByRole("link", { name: "Giving history" });
  expect(link.getAttribute("href")).toBe("/donor-dashboard/history");
  // The phone tab bar already offers Giving and Recurring one tap away.
  const action = link.closest('[data-slot="card-action"]')!;
  expect(action.classList.contains("hidden")).toBe(true);
  expect(action.classList.contains("sm:flex")).toBe(true);
});
