/** @vitest-environment jsdom */

import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import * as React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useAdminCrmRecordsInfiniteGrid } from "../../../../packages/database/hooks/admin-crm-infinite";
import { getQueryClient } from "../../../../packages/database/providers/query-client";
import { QueryProvider } from "../../../../packages/database/providers/query-provider";

const RECORDS = [
  { id: "rec-1", displayName: "Ada", lifecycleStatus: "active" },
  { id: "rec-2", displayName: "Ben", lifecycleStatus: "lapsed" },
  { id: "rec-3", displayName: "Cy", lifecycleStatus: "prospect" },
  { id: "rec-4", displayName: "Di", lifecycleStatus: "lapsed" },
];

function recordsFetch() {
  return vi.fn(async (input: RequestInfo | URL) => {
    const url = new URL(String(input), "http://localhost");
    const statuses = url.searchParams.getAll("status");
    const rows = statuses.length
      ? RECORDS.filter((row) => statuses.includes(row.lifecycleStatus))
      : RECORDS;
    return {
      ok: true,
      json: async () => ({
        configured: true,
        missing: [],
        mode: "local",
        rows,
        hasMore: false,
        nextCursor: null,
      }),
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

function rowIds(rows: Array<{ id: string }>) {
  return rows.map((row) => row.id);
}

async function expectRows(
  read: () => Array<{ id: string }>,
  errors: Error[],
  ids: string[],
) {
  await waitFor(() => {
    expect(errors.map((error) => error.message)).toEqual([]);
    expect(rowIds(read())).toEqual(ids);
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

const ALL_IDS = ["rec-1", "rec-2", "rec-3", "rec-4"];
const ACTIVE = [{ id: "lifecycleStatus", value: ["active"] }];
const LAPSED = [{ id: "lifecycleStatus", value: ["lapsed"] }];

describe("useAdminCrmRecordsInfiniteGrid", () => {
  it("returns to every record when a column filter is cleared", async () => {
    vi.stubGlobal("fetch", recordsFetch());
    const errors: Error[] = [];
    const { result } = renderHook(() => useAdminCrmRecordsInfiniteGrid(), {
      wrapper: wrapperCapturing(errors),
      // StrictMode must be the root: React replays effects only beneath it.
      reactStrictMode: true,
    });
    const rows = () => result.current.rows;

    await expectRows(rows, errors, ALL_IDS);
    act(() => result.current.onFiltersChange(ACTIVE));
    await expectRows(rows, errors, ["rec-1"]);
    act(() => result.current.onFiltersChange([]));
    await expectRows(rows, errors, ALL_IDS);
  });

  it("goes back to a filter it already showed", async () => {
    vi.stubGlobal("fetch", recordsFetch());
    const errors: Error[] = [];
    const { result } = renderHook(() => useAdminCrmRecordsInfiniteGrid(), {
      wrapper: wrapperCapturing(errors),
      reactStrictMode: true,
    });
    const rows = () => result.current.rows;

    await expectRows(rows, errors, ALL_IDS);
    act(() => result.current.onFiltersChange(LAPSED));
    await expectRows(rows, errors, ["rec-2", "rec-4"]);
    act(() => result.current.onFiltersChange(ACTIVE));
    await expectRows(rows, errors, ["rec-1"]);
    act(() => result.current.onFiltersChange(LAPSED));
    await expectRows(rows, errors, ["rec-2", "rec-4"]);
  });

  it("mounts again over cached records without inserting a row twice", async () => {
    vi.stubGlobal("fetch", recordsFetch());
    const errors: Error[] = [];
    const first = renderHook(() => useAdminCrmRecordsInfiniteGrid(), {
      wrapper: wrapperCapturing(errors),
      reactStrictMode: true,
    });
    await expectRows(() => first.result.current.rows, errors, ALL_IDS);
    first.unmount();
    await act(async () => {
      await getQueryClient().invalidateQueries();
    });

    const { result } = renderHook(() => useAdminCrmRecordsInfiniteGrid(), {
      wrapper: wrapperCapturing(errors),
      reactStrictMode: true,
    });
    await expectRows(() => result.current.rows, errors, ALL_IDS);
  });
});
