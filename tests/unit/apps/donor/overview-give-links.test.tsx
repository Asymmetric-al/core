/** @vitest-environment jsdom */

import { cleanup, render, screen, within } from "@testing-library/react";
import React from "react";
import { afterEach, expect, it, vi } from "vitest";

const jordan = { id: "m-jordan", name: "Jordan Hale", avatarUrl: null };
const wells = { id: "m-wells", name: "Nairobi Water Wells", avatarUrl: null };

const gift = (id: string, missionary: typeof jordan) => ({
  id,
  date: new Date().toISOString(),
  amount: 50,
  amountCents: 5_000,
  currency: "usd",
  status: "Paid",
  type: "Recurring",
  method: "Card",
  receiptUrl: "",
  statementYear: new Date().getFullYear(),
  designation: {
    id: missionary.id,
    name: missionary.name,
    type: "missionary",
    avatarUrl: null,
  },
  missionary,
  fund: null,
});

vi.mock("@asym/database/hooks", () => ({
  useDonorPortalSnapshot: () => ({
    isLoading: false,
    error: null,
    data: {
      profile: { displayName: "Avery Lopez" },
      summary: { statementYears: [] },
      donations: [gift("d1", jordan), gift("d2", wells)],
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
  }: {
    children?: React.ReactNode;
    href: string;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

// eslint-disable-next-line no-restricted-imports -- AL-1931: The actual donor overview at its app boundary.
import { DonorDashboardMainBody } from "../../../../apps/donor/features/donor/components/donor-dashboard-main-body";

afterEach(cleanup);

// Public missionary pages are still sample content, so a real missionary
// has no page to visit; giving goes straight to checkout for their account.
it("sends every give action to checkout for the real missionary account", () => {
  render(<DonorDashboardMainBody />);

  const again = screen.getByRole("link", { name: /^Give to .+ again$/ });
  expect(again.getAttribute("href")).toMatch(
    /^\/checkout\?missionary_id=m-(jordan|wells)$/,
  );

  const supported = screen.getByRole("region", { name: "Who you support" });
  expect(
    within(supported)
      .getByRole("link", { name: "Give to Jordan Hale" })
      .getAttribute("href"),
  ).toBe("/checkout?missionary_id=m-jordan");
  expect(
    within(supported).queryByRole("link", { name: "Find more" }),
  ).toBeNull();

  for (const link of screen.getAllByRole("link")) {
    expect(link.getAttribute("href") ?? "").not.toMatch(/^\/workers\/./);
  }
});
