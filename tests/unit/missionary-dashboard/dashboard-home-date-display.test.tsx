/** @vitest-environment jsdom */

import { MotionProvider } from "@asym/lib/motion-provider";
import { act, waitFor, within } from "@testing-library/react";
import { useLayoutEffect } from "react";
import { hydrateRoot, type Root } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import { DashboardHome } from "../../../packages/missionary/components/dashboard-home";

const mocks = vi.hoisted(() => ({
  query: vi.fn(),
  auth: vi.fn(),
  metrics: vi.fn(),
}));

vi.mock("@asym/database/hooks", () => ({
  useMissionaryPortalSnapshot: mocks.query,
  usePendingFollowRequestCount: () => ({ data: 0 }),
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

beforeAll(() => {
  const descriptor = Object.getOwnPropertyDescriptor(window, "matchMedia");
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
  return () => {
    if (descriptor) {
      Object.defineProperty(window, "matchMedia", descriptor);
    } else {
      Reflect.deleteProperty(window, "matchMedia");
    }
  };
});

afterEach(() => {
  vi.clearAllMocks();
});

type Update = {
  id: string;
  title: string;
  status: string;
  createdAt: string | null;
};

const update = (overrides: Update) => ({
  excerpt: "",
  postType: "Update",
  imageUrl: null,
  visibility: "public",
  engagementCount: 0,
  ...overrides,
});

const creationUpdates: Update[] = [
  {
    id: "west-boundary",
    title: "An early UTC creation instant",
    status: "published",
    createdAt: "2026-01-06T05:00:00.000Z",
  },
  {
    id: "east-boundary",
    title: "A late UTC creation instant",
    status: "published",
    createdAt: "2026-01-06T20:00:00.000Z",
  },
];

function setup(updates: Update[] = creationUpdates) {
  mocks.query.mockReturnValue({
    data: {
      support: null,
      tasks: [],
      ministryUpdates: updates.map(update),
    },
    isLoading: false,
    error: null,
    refetch: vi.fn(),
  });
  const metric = { total: 0, change: 0, trend: "neutral", data: [] };
  mocks.metrics.mockReturnValue({
    thisMonth: metric,
    lastMonth: metric,
    yearToDate: metric,
    monthlyBreakdown: [],
    isLoading: true,
    error: null,
  });
}

function dashboard() {
  return (
    <MotionProvider>
      <DashboardHome missionaryId="explicit-fixture" />
    </MotionProvider>
  );
}

function readUpdateDates(container: HTMLElement) {
  return within(container)
    .getAllByText(/^[A-Z][a-z]{2} \d{1,2}$/)
    .map((node) => node.textContent);
}

function visitorDates() {
  const { locale, timeZone } = Intl.DateTimeFormat().resolvedOptions();
  // Exact expectations for the independent UTC/LA/Bangkok process checks.
  if (locale === "en-US") {
    if (timeZone === "UTC") return ["Jan 6", "Jan 6"];
    if (timeZone === "America/Los_Angeles") return ["Jan 5", "Jan 6"];
    if (timeZone === "Asia/Bangkok") return ["Jan 6", "Jan 7"];
  }
  // Preserve the same visitor-default contract on other developer hosts.
  return creationUpdates.map((entry) =>
    new Date(entry.createdAt!).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    }),
  );
}

describe("dashboard ministry update creation timestamps", () => {
  it("renders the same UTC dates on the server regardless of the host time zone", () => {
    setup();
    const container = document.createElement("div");
    container.innerHTML = renderToString(dashboard());

    expect(
      within(container).getAllByText("Jan 6", { exact: true }),
    ).toHaveLength(2);
    expect(mocks.auth).not.toHaveBeenCalled();
  });

  it("hydrates the UTC dates before switching creation instants to the visitor's dates", async () => {
    setup();
    const container = document.createElement("div");
    let initialCommitDates: ReturnType<typeof readUpdateDates> | undefined;
    function HydrationProbe() {
      useLayoutEffect(() => {
        initialCommitDates = readUpdateDates(container);
      }, []);
      return dashboard();
    }
    const element = <HydrationProbe />;
    container.innerHTML = renderToString(element);
    document.body.appendChild(container);

    const recoverableErrors: string[] = [];
    let root: Root | undefined;
    try {
      expect(readUpdateDates(container)).toEqual(["Jan 6", "Jan 6"]);
      await act(async () => {
        root = hydrateRoot(container, element, {
          onRecoverableError(error) {
            recoverableErrors.push(String(error));
          },
        });
      });
      expect(initialCommitDates).toEqual(["Jan 6", "Jan 6"]);
      await waitFor(() => {
        const expectedDates = visitorDates();
        for (const date of new Set(expectedDates)) {
          expect(
            within(container).getAllByText(date, { exact: true }),
          ).toHaveLength(
            expectedDates.filter((value) => value === date).length,
          );
        }
      });
      expect(recoverableErrors).toEqual([]);
    } finally {
      await act(async () => root?.unmount());
      container.remove();
    }
  });

  it("leaves drafts out on the server and after hydration", async () => {
    setup([
      creationUpdates[0]!,
      {
        id: "draft",
        title: "An unfinished draft",
        status: "draft",
        createdAt: null,
      },
    ]);
    const element = dashboard();
    const container = document.createElement("div");
    container.innerHTML = renderToString(element);
    document.body.appendChild(container);

    const recoverableErrors: string[] = [];
    let root: Root | undefined;
    try {
      expect(within(container).queryByText("An unfinished draft")).toBeNull();
      expect(
        within(container).getByText("Jan 6", { exact: true }),
      ).toBeTruthy();
      await act(async () => {
        root = hydrateRoot(container, element, {
          onRecoverableError(error) {
            recoverableErrors.push(String(error));
          },
        });
      });
      await waitFor(() => {
        expect(
          within(container).getByText(visitorDates()[0]!, { exact: true }),
        ).toBeTruthy();
      });
      expect(within(container).queryByText("An unfinished draft")).toBeNull();
      expect(recoverableErrors).toEqual([]);
    } finally {
      await act(async () => root?.unmount());
      container.remove();
    }
  });
});
