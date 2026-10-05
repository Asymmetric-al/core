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

const creationUpdates = [
  {
    id: "west-boundary",
    excerpt: "An early UTC creation instant",
    createdAt: "2026-01-06T05:00:00.000Z",
  },
  {
    id: "east-boundary",
    excerpt: "A late UTC creation instant",
    createdAt: "2026-01-06T20:00:00.000Z",
  },
];

function setup(
  updates: {
    id: string;
    excerpt: string;
    createdAt: string | null;
  }[] = creationUpdates,
) {
  mocks.query.mockReturnValue({
    data: {
      support: null,
      tasks: [],
      ministryUpdates: updates,
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
    .getAllByText(/^\d{1,2}\/\d{1,2}\/\d{4}$/)
    .map((node) => node.textContent);
}

function visitorDates() {
  const { locale, timeZone } = Intl.DateTimeFormat().resolvedOptions();
  // Exact expectations for the independent UTC/LA/Bangkok process checks.
  if (locale === "en-US") {
    if (timeZone === "UTC") return ["1/6/2026", "1/6/2026"];
    if (timeZone === "America/Los_Angeles") return ["1/5/2026", "1/6/2026"];
    if (timeZone === "Asia/Bangkok") return ["1/6/2026", "1/7/2026"];
  }
  // Preserve the same visitor-default contract on other developer hosts.
  return creationUpdates.map((update) =>
    new Date(update.createdAt).toLocaleDateString(),
  );
}

describe("dashboard ministry update creation timestamps", () => {
  it("renders the same UTC dates on the server regardless of the host time zone", () => {
    setup();
    const container = document.createElement("div");
    container.innerHTML = renderToString(dashboard());

    expect(
      within(container).getAllByText("1/6/2026", { exact: true }),
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
      expect(readUpdateDates(container)).toEqual(["1/6/2026", "1/6/2026"]);
      await act(async () => {
        root = hydrateRoot(container, element, {
          onRecoverableError(error) {
            recoverableErrors.push(String(error));
          },
        });
      });
      expect(initialCommitDates).toEqual(["1/6/2026", "1/6/2026"]);
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

  it("retains Draft for a missing creation timestamp on the server and after hydration", async () => {
    setup([
      creationUpdates[0]!,
      { id: "draft", excerpt: "An undated ministry update", createdAt: null },
    ]);
    const element = dashboard();
    const container = document.createElement("div");
    container.innerHTML = renderToString(element);
    document.body.appendChild(container);

    const recoverableErrors: string[] = [];
    let root: Root | undefined;
    try {
      expect(
        within(container).getByText("Draft", { exact: true }),
      ).toBeTruthy();
      expect(
        within(container).getByText("1/6/2026", { exact: true }),
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
        expect(
          within(container).getByText("Draft", { exact: true }),
        ).toBeTruthy();
      });
      expect(recoverableErrors).toEqual([]);
    } finally {
      await act(async () => root?.unmount());
      container.remove();
    }
  });
});
