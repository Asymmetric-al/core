/** @vitest-environment jsdom */
import { MotionProvider } from "@asym/lib/motion-provider";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import React from "react";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import { DashboardHome } from "../../../packages/missionary/components/dashboard-home";

const mocks = vi.hoisted(() => ({
  query: vi.fn(),
  followRequests: vi.fn(),
  auth: vi.fn(),
  metrics: vi.fn(),
  refetch: vi.fn(),
}));
vi.mock("@asym/database/hooks", () => ({
  useMissionaryPortalSnapshot: mocks.query,
  usePendingFollowRequestCount: mocks.followRequests,
}));
vi.mock("@asym/lib/hooks", async () => {
  const { useLocaleFormat } =
    await import("../../../packages/lib/hooks/use-locale-format");
  return {
    useAuth: mocks.auth,
    useDonationMetrics: mocks.metrics,
    useLocaleFormat,
  };
});
vi.mock("@asym/env", () => ({
  clientEnv: { NEXT_PUBLIC_VIEW_TRANSITIONS_ENABLED: false },
}));
vi.mock("next/image", () => ({
  default: ({ src, alt }: { src: string; alt: string }) => (
    // eslint-disable-next-line @next/next/no-img-element -- AL-1931: test double
    <img src={src} alt={alt} />
  ),
}));
beforeAll(() => {
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    value: () => ({
      matches: false,
      addListener() {},
      removeListener() {},
      addEventListener() {},
      removeEventListener() {},
    }),
  });
  class NoopResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  Object.defineProperty(window, "ResizeObserver", {
    configurable: true,
    value: NoopResizeObserver,
  });
});
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  vi.restoreAllMocks();
});

const snapshot = {
  profile: { id: "m1", displayName: "Jordan Hale", avatarUrl: null },
  support: {
    goalCents: 500000,
    goalCurrency: "USD",
    recurringCurrency: "USD",
    raisedCents: 200000,
    recurringMonthlyCents: 200000,
    percentFunded: 40,
    activeDonorCount: 3,
    giftCount: 7,
    lastGiftAt: null,
  },
  donorRelationships: [
    {
      id: "taylor",
      displayName: "Taylor Nguyen",
      avatarUrl: null,
      status: "active",
      lastGiftAt: null,
      hasActivePledge: true,
    },
  ],
  recentGifts: [
    {
      id: "g1",
      donorId: "taylor",
      amountCents: 5000,
      currency: "USD",
      date: "2026-01-05T12:00:00.000Z",
      type: "Recurring",
    },
  ],
  tasks: [
    {
      id: "1",
      title: "Call partner",
      status: "not_started",
      priority: "high",
      due_date: "2026-01-01",
    },
    {
      id: "2",
      title: "Completed task",
      status: "completed",
      priority: "low",
      due_date: "2026-01-01",
    },
  ],
  ministryUpdates: [
    {
      id: "u1",
      title: "New classroom opens",
      excerpt: "An actual fixture update",
      postType: "Story",
      imageUrl: "https://images.unsplash.com/photo-1",
      visibility: "public",
      status: "published",
      createdAt: "2026-01-05T12:00:00.000Z",
      engagementCount: 2,
    },
    {
      id: "u2",
      title: "Unfinished draft",
      excerpt: "Draft",
      postType: "Update",
      imageUrl: null,
      visibility: "public",
      status: "draft",
      createdAt: null,
      engagementCount: 0,
    },
  ],
};

function setup(overrides: Record<string, unknown> = {}) {
  mocks.query.mockReturnValue({
    data: snapshot,
    isLoading: false,
    error: null,
    refetch: mocks.refetch,
    ...overrides,
  });
  mocks.followRequests.mockReturnValue({ data: 2 });
  mocks.auth.mockReturnValue({
    profile: { id: "auth-fixture" },
    loading: false,
  });
  const metric = (total: number) => ({
    total,
    change: null,
    trend: "neutral",
    data: [],
  });
  mocks.metrics.mockReturnValue({
    currency: "USD",
    thisMonth: metric(12500),
    lastMonth: metric(30000),
    yearToDate: metric(250000),
    monthlyBreakdown: [],
    isLoading: false,
    error: null,
  });
}

function show(
  props: React.ComponentProps<typeof DashboardHome> = {
    missionaryId: "explicit-fixture",
  },
) {
  return render(
    <MotionProvider>
      <DashboardHome
        {...props}
        belowHeaderSlot={<p>Inserted dashboard content</p>}
      />
    </MotionProvider>,
  );
}

describe("missionary home", () => {
  it("greets the missionary and offers the two things they do most", () => {
    setup();
    show({});
    expect(
      screen.getByRole("heading", { level: 1, name: "Welcome back, Jordan" }),
    ).toBeTruthy();
    expect(screen.getByText("Inserted dashboard content")).toBeTruthy();
    expect(
      screen
        .getByRole("link", { name: "Write an update" })
        .getAttribute("href"),
    ).toBe("/feed");
    expect(
      screen.getByRole("link", { name: "Add partner" }).getAttribute("href"),
    ).toBe("/donors?add=1");
    expect(screen.queryByText(/Download Report/i)).toBeNull();
  });

  it("shows monthly support against the goal in plain words", () => {
    setup();
    show();
    const card = screen.getByRole("region", { name: "Monthly support" });
    // Exact amounts always show cents, like the donor app.
    expect(within(card).getByText("$2,000.00")).toBeTruthy();
    expect(
      within(card).getByText("a month of your $5,000.00 goal"),
    ).toBeTruthy();
    expect(
      within(card).getByText(
        "40% of your goal · $3,000.00 a month still needed",
      ),
    ).toBeTruthy();
    const meter = within(card).getByRole("meter");
    expect(meter.getAttribute("aria-valuetext")).toBe(
      "40% of your monthly goal",
    );
    expect(within(card).getByText("$125.00")).toBeTruthy();
    expect(within(card).getByText("$300.00")).toBeTruthy();
    expect(within(card).getByText("$2,500.00")).toBeTruthy();
    // Beside the sidebar (lg to xl) the card is too narrow for four figures
    // with cents, so they sit two by two there.
    expect(
      within(card).getByText("$2,500.00").closest("dl")?.className,
    ).toMatch(/sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4/);
    expect(mocks.metrics).toHaveBeenCalledWith("explicit-fixture");
  });

  it("celebrates a reached goal without overfilling the meter", () => {
    setup({
      data: {
        ...snapshot,
        support: { ...snapshot.support, recurringMonthlyCents: 750000 },
      },
    });
    show();
    const card = screen.getByRole("region", { name: "Monthly support" });
    expect(
      within(card).getByText("You’ve reached your monthly goal."),
    ).toBeTruthy();
    expect(within(card).getByRole("meter").getAttribute("aria-valuenow")).toBe(
      "500000",
    );
  });

  it("explains an unavailable goal comparison without a settings link", () => {
    setup({
      data: { ...snapshot, support: { ...snapshot.support, goalCents: 0 } },
    });
    show();
    const card = screen.getByRole("region", { name: "Monthly support" });
    expect(within(card).queryByRole("meter")).toBeNull();
    expect(
      within(card).getByText(
        "Goal comparison unavailable: the goal and commitments need the same known currency.",
      ),
    ).toBeTruthy();
    expect(within(card).queryByRole("link")).toBeNull();
  });

  it("says no partner has committed yet instead of an unavailable amount", () => {
    setup({
      data: {
        ...snapshot,
        support: {
          ...snapshot.support,
          recurringMonthlyCents: null,
          recurringCurrency: null,
          monthlyPartnerCount: 0,
        },
      },
    });
    show();
    const card = screen.getByRole("region", { name: "Monthly support" });
    expect(
      within(card).getByText("No partners have committed monthly support yet."),
    ).toBeTruthy();
    expect(within(card).queryByText("Unavailable")).toBeNull();
    expect(within(card).queryByText(/Goal comparison unavailable/)).toBeNull();
    expect(within(card).queryByRole("meter")).toBeNull();
  });

  it("says the giving totals couldn't load instead of showing $0", () => {
    setup();
    const retry = vi.fn();
    mocks.metrics.mockReturnValue({
      ...mocks.metrics(),
      thisMonth: { total: 0, change: null, trend: "neutral", data: [] },
      error: new Error("Local fixture failure"),
      retry,
    });
    show();
    const card = screen.getByRole("region", { name: "Monthly support" });
    expect(within(card).getByRole("alert").textContent).toContain(
      "We couldn’t load your giving totals.",
    );
    expect(within(card).queryByText("$0.00")).toBeNull();
    expect(within(card).queryByText("This month so far")).toBeNull();
    fireEvent.click(within(card).getByRole("button", { name: "Try again" }));
    expect(retry).toHaveBeenCalledOnce();
    const chart = screen.getByRole("region", { name: "Giving by month" });
    expect(
      within(chart).getByText("We couldn’t load your giving chart."),
    ).toBeTruthy();
  });

  it("puts urgent work before the totals in reading order", () => {
    setup();
    show();
    const support = screen.getByRole("region", { name: "Monthly support" });
    const needsYou = screen.getByRole("region", { name: "Needs you" });
    expect(
      needsYou.compareDocumentPosition(support) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });

  it("lists what needs the missionary, each with an action", () => {
    setup();
    show();
    const card = screen.getByRole("region", { name: "Needs you" });
    expect(within(card).getByText("1 overdue task")).toBeTruthy();
    expect(within(card).getByText("Oldest: Call partner")).toBeTruthy();
    expect(within(card).queryByText(/Completed task/)).toBeNull();
    expect(
      within(card).getByText("2 people want to follow your updates"),
    ).toBeTruthy();
    expect(
      within(card)
        .getByRole("link", { name: "Open tasks" })
        .getAttribute("href"),
    ).toBe("/tasks");
  });

  it("shows recent gifts with the partner's name and the latest published updates", () => {
    setup();
    show();
    const gifts = screen.getByRole("region", { name: "Recent gifts" });
    expect(within(gifts).getByText("Taylor Nguyen")).toBeTruthy();
    expect(within(gifts).getByText("$50.00")).toBeTruthy();
    expect(within(gifts).getByText("Jan 5 · Monthly")).toBeTruthy();
    const updates = screen.getByRole("region", { name: "Your latest updates" });
    expect(within(updates).getByText("New classroom opens")).toBeTruthy();
    expect(within(updates).getByText("Story")).toBeTruthy();
    expect(within(updates).getByText("Jan 5 · 2 responses")).toBeTruthy();
    expect(within(updates).queryByText("Unfinished draft")).toBeNull();
  });

  it("keeps the inserted slot and retry callback in the error state", () => {
    setup({ error: new Error("Local fixture failure"), data: undefined });
    show();
    expect(screen.getByRole("alert")).toBeTruthy();
    expect(screen.getByText("Inserted dashboard content")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(mocks.refetch).toHaveBeenCalledOnce();
  });

  it("uses the signed-in identity when no explicit id is provided", () => {
    setup();
    show({});
    expect(mocks.auth).toHaveBeenCalledOnce();
    expect(mocks.metrics).toHaveBeenCalledWith("auth-fixture");
  });

  it("waits for sign-in instead of asking for anyone else's numbers", () => {
    setup();
    mocks.auth.mockReturnValue({ profile: null, loading: true });
    show({});
    for (const [id] of mocks.metrics.mock.calls) expect(id).toBe("");
    const card = screen.getByRole("region", { name: "Monthly support" });
    expect(within(card).queryByText("$125.00")).toBeNull();
  });

  it("uses the same page header as the other missionary pages", () => {
    setup();
    const { container } = show();
    expect(
      screen.getByRole("heading", { level: 1, name: "Welcome back, Jordan" }),
    ).toBeTruthy();
    expect(
      container.querySelector('[data-slot="page-shell-header"]'),
    ).toBeNull();
  });

  it("names the busy loading group while keeping the inserted content", () => {
    setup({ isLoading: true, data: undefined });
    show();
    expect(
      screen
        .getByRole("group", { name: "Loading your home page" })
        .getAttribute("aria-busy"),
    ).toBe("true");
    expect(screen.getByText("Inserted dashboard content")).toBeTruthy();
  });
});

describe("Home currency containment", () => {
  it.each([null, "JPY"])(
    "does not compare commitments with an unknown or different goal currency %s",
    (goalCurrency) => {
      setup({
        data: { ...snapshot, support: { ...snapshot.support, goalCurrency } },
      });
      show();
      const card = screen.getByRole("region", { name: "Monthly support" });
      expect(within(card).queryByRole("meter")).toBeNull();
      expect(
        within(card).getByText(/Goal comparison unavailable/),
      ).toBeTruthy();
      expect(card.textContent).not.toContain("40%");
    },
  );

  it.each([
    ["JPY", "¥5,000"],
    ["BHD", "5.000"],
    [null, "Unavailable"],
  ])("keeps %s recent gifts qualified", (currency, expected) => {
    setup({
      data: {
        ...snapshot,
        recentGifts: snapshot.recentGifts.map((gift) => ({
          ...gift,
          currency,
        })),
      },
    });
    show();
    const gifts = screen.getByRole("region", { name: "Recent gifts" });
    expect(gifts.textContent).toContain(expected);
    expect(gifts.textContent).not.toContain("$50");
  });
});
