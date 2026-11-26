/** @vitest-environment jsdom */

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

describe("the CRM lists' N of M counts against the newest page's total (AL-2678 WP5 rest, fix round F13)", () => {
  it("notes: a total that grew between pages is the newest page's (red: the first page's)", async () => {
    vi.stubGlobal(
      "fetch",
      pagedFetch([
        {
          ...BASE,
          rows: [{ id: "note-1" }],
          hasMore: true,
          nextCursor: "cursor-2",
          totalCount: 2,
        },
        {
          ...BASE,
          rows: [{ id: "note-2" }],
          hasMore: true,
          nextCursor: "cursor-3",
          totalCount: 3,
        },
      ]),
    );
    const { result } = renderHook(() => useAdminCrmNotesGrid(), {
      wrapper: Wrapper,
    });
    await waitFor(() => expect(result.current.totalCount).toBe(2));
    act(() => result.current.loadMore());
    await waitFor(() => expect(result.current.notes).toHaveLength(2));
    expect(result.current.totalCount).toBe(3);
  });

  it("relationships: the same (red: the first page's)", async () => {
    const report = { totalRows: 9 };
    vi.stubGlobal(
      "fetch",
      pagedFetch([
        {
          ...BASE,
          report,
          rows: [{ id: "rel-1" }],
          hasMore: true,
          nextCursor: "cursor-2",
          totalCount: 4,
        },
        {
          ...BASE,
          report,
          rows: [{ id: "rel-2" }],
          hasMore: false,
          nextCursor: null,
          totalCount: 2,
        },
      ]),
    );
    const { result } = renderHook(() => useAdminCrmRelationshipsGrid(), {
      wrapper: Wrapper,
    });
    await waitFor(() => expect(result.current.totalCount).toBe(4));
    act(() => result.current.loadMore());
    await waitFor(() => expect(result.current.relationships).toHaveLength(2));
    expect(result.current.totalCount).toBe(2);
  });
});
