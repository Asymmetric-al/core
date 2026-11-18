/** @vitest-environment jsdom */

import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import * as React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useAdminContributionsInfiniteGrid } from "../../../../packages/database/hooks/admin-contributions-infinite";
import { getQueryClient } from "../../../../packages/database/providers/query-client";
import { QueryProvider } from "../../../../packages/database/providers/query-provider";

const CONTRIBUTIONS = [
  { id: "gift-1", donorName: "Ada", status: "completed", amount: 40 },
  { id: "gift-2", donorName: "Ben", status: "pending", amount: 10 },
  { id: "gift-3", donorName: "Cy", status: "failed", amount: 30 },
  { id: "gift-4", donorName: "Di", status: "pending", amount: 20 },
];

function contributionsFetch() {
  return vi.fn(async (input: RequestInfo | URL) => {
    const url = new URL(String(input), "http://localhost");
    if (url.pathname === "/api/admin/contributions/summary") {
      return {
        ok: true,
        json: async () => ({
          totalReceived: 0,
          successfulCount: 0,
          pendingAmount: 0,
          pendingCount: 0,
          averageGift: 0,
          recurringCount: 0,
        }),
      };
    }

    const statuses = url.searchParams.getAll("status");
    const filtered = statuses.length
      ? CONTRIBUTIONS.filter((row) => statuses.includes(row.status))
      : CONTRIBUTIONS;
    const rows =
      url.searchParams.get("sort") === "amount"
        ? [...filtered].sort((a, b) => a.amount - b.amount)
        : filtered;
    return {
      ok: true,
      json: async () => ({ rows, hasMore: false, nextCursor: null }),
    };
  });
}

type BoundaryState = { error: Error | null };

class CaptureErrors extends React.Component<
  { children: React.ReactNode; errors: Error[] },
  BoundaryState
> {
  state: BoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): BoundaryState {
    return { error };
  }

  componentDidCatch(error: Error) {
    this.props.errors.push(error);
  }

  render() {
    return this.state.error ? null : this.props.children;
  }
}

function wrapperCapturing(errors: Error[]) {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryProvider>
        <CaptureErrors errors={errors}>{children}</CaptureErrors>
      </QueryProvider>
    );
  };
}

function renderGrid(errors: Error[]) {
  return renderHook(() => useAdminContributionsInfiniteGrid(), {
    wrapper: wrapperCapturing(errors),
    // StrictMode must be the root: React replays effects only beneath it.
    reactStrictMode: true,
  });
}

async function expectRows(
  read: () => Array<{ id: string }>,
  errors: Error[],
  ids: string[],
) {
  await waitFor(() => {
    expect(errors.map((error) => error.message)).toEqual([]);
    expect(read().map((row) => row.id)).toEqual(ids);
  });
}

let consoleError: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  getQueryClient().clear();
  // React logs every error a boundary catches; the assertions read `errors`.
  consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  cleanup();
  consoleError.mockRestore();
  vi.unstubAllGlobals();
  getQueryClient().clear();
});

const ALL_IDS = ["gift-1", "gift-2", "gift-3", "gift-4"];
const COMPLETED = [{ id: "status", value: ["completed"] }];
const PENDING = [{ id: "status", value: ["pending"] }];

describe("useAdminContributionsInfiniteGrid", () => {
  it("returns to every contribution when a column filter is cleared", async () => {
    vi.stubGlobal("fetch", contributionsFetch());
    const errors: Error[] = [];
    const { result } = renderGrid(errors);
    const rows = () => result.current.rows;

    await expectRows(rows, errors, ALL_IDS);
    act(() => result.current.onFiltersChange(COMPLETED));
    await expectRows(rows, errors, ["gift-1"]);
    act(() => result.current.onFiltersChange([]));
    await expectRows(rows, errors, ALL_IDS);
  });

  it("goes back to a filter it already showed", async () => {
    vi.stubGlobal("fetch", contributionsFetch());
    const errors: Error[] = [];
    const { result } = renderGrid(errors);
    const rows = () => result.current.rows;

    await expectRows(rows, errors, ALL_IDS);
    act(() => result.current.onFiltersChange(PENDING));
    await expectRows(rows, errors, ["gift-2", "gift-4"]);
    act(() => result.current.onFiltersChange(COMPLETED));
    await expectRows(rows, errors, ["gift-1"]);
    act(() => result.current.onFiltersChange(PENDING));
    await expectRows(rows, errors, ["gift-2", "gift-4"]);
  });

  it("goes back to the default sort after sorting by amount", async () => {
    vi.stubGlobal("fetch", contributionsFetch());
    const errors: Error[] = [];
    const { result } = renderGrid(errors);
    const rows = () => result.current.rows;

    await expectRows(rows, errors, ALL_IDS);
    act(() =>
      result.current.onSortingChange([{ id: "amountGross", desc: false }]),
    );
    await expectRows(rows, errors, ["gift-2", "gift-4", "gift-3", "gift-1"]);
    act(() => result.current.onSortingChange([{ id: "date", desc: true }]));
    await expectRows(rows, errors, ALL_IDS);
  });

  it("mounts again over cached contributions without inserting a row twice", async () => {
    vi.stubGlobal("fetch", contributionsFetch());
    const errors: Error[] = [];
    const first = renderGrid(errors);
    await expectRows(() => first.result.current.rows, errors, ALL_IDS);
    first.unmount();
    await act(async () => {
      await getQueryClient().invalidateQueries();
    });

    const { result } = renderGrid(errors);
    await expectRows(() => result.current.rows, errors, ALL_IDS);
  });
});
