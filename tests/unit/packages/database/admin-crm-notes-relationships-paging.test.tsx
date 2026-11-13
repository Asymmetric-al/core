/** @vitest-environment jsdom */

/**
 * Notes and Relationships page past the server's first 50 rows: the hooks
 * follow the API's `nextCursor` (`after=`) and append the next page, so the
 * grids can offer "Load more" as /crm does.
 */

import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import * as React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useAdminCrmNotesGrid } from "../../../../packages/database/hooks/admin-crm-notes";
import { useAdminCrmRelationshipsGrid } from "../../../../packages/database/hooks/admin-crm-relationships";
import { getQueryClient } from "../../../../packages/database/providers/query-client";
import { QueryProvider } from "../../../../packages/database/providers/query-provider";

beforeEach(() => {
  getQueryClient().clear();
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  getQueryClient().clear();
});

function Wrapper({ children }: { children: React.ReactNode }) {
  return <QueryProvider>{children}</QueryProvider>;
}

function pagedFetch(pages: Array<Record<string, unknown>>) {
  return vi.fn(async (input: RequestInfo | URL) => {
    const url = new URL(String(input), "http://localhost");
    const page = url.searchParams.get("after") === "cursor-2" ? 1 : 0;
    return { ok: true, json: async () => pages[page] };
  });
}

const BASE = { configured: true, missing: [], mode: "local" };

describe("CRM notes and relationships paging", () => {
  it("appends the next notes page from the cursor", async () => {
    const fetchMock = pagedFetch([
      {
        ...BASE,
        rows: [{ id: "note-1" }],
        hasMore: true,
        nextCursor: "cursor-2",
      },
      { ...BASE, rows: [{ id: "note-2" }], hasMore: false, nextCursor: null },
    ]);
    vi.stubGlobal("fetch", fetchMock);
    const { result } = renderHook(() => useAdminCrmNotesGrid(), {
      wrapper: Wrapper,
    });

    await waitFor(() => expect(result.current.notes).toHaveLength(1));
    expect(result.current.hasMore).toBe(true);

    act(() => result.current.loadMore());

    await waitFor(() =>
      expect(result.current.notes.map((note) => note.id)).toEqual([
        "note-1",
        "note-2",
      ]),
    );
    expect(String(fetchMock.mock.calls[1]?.[0])).toContain("after=cursor-2");
    expect(result.current.hasMore).toBe(false);
  });

  it("appends the next relationships page and keeps the first page's report", async () => {
    const report = { totalRows: 90 };
    const fetchMock = pagedFetch([
      {
        ...BASE,
        report,
        rows: [{ id: "rel-1" }],
        hasMore: true,
        nextCursor: "cursor-2",
      },
      {
        ...BASE,
        report,
        rows: [{ id: "rel-2" }],
        hasMore: false,
        nextCursor: null,
      },
    ]);
    vi.stubGlobal("fetch", fetchMock);
    const { result } = renderHook(() => useAdminCrmRelationshipsGrid(), {
      wrapper: Wrapper,
    });

    await waitFor(() => expect(result.current.relationships).toHaveLength(1));
    expect(result.current.hasMore).toBe(true);

    act(() => result.current.loadMore());

    await waitFor(() =>
      expect(result.current.relationships.map((row) => row.id)).toEqual([
        "rel-1",
        "rel-2",
      ]),
    );
    expect(String(fetchMock.mock.calls[1]?.[0])).toContain("after=cursor-2");
    expect(result.current.report).toEqual(report);
    expect(result.current.hasMore).toBe(false);
  });
});
