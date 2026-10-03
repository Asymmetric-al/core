/** @vitest-environment jsdom */

import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  ADMIN_CRM_RECORD_DETAIL_QUERY_KEY,
  ADMIN_CRM_RECORDS_QUERY_KEY,
  useCreateLinkedCrmNote,
} from "../../../../packages/database/hooks/admin-crm-detail";
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

function Wrapper({ children }: { children: ReactNode }) {
  return <QueryProvider>{children}</QueryProvider>;
}

describe("library mutation pending ownership", () => {
  it("exposes pending until the note request settles and invalidates the app's caches", async () => {
    const response = Promise.withResolvers<Response>();
    const fetchMock = vi.fn(() => response.promise);
    vi.stubGlobal("fetch", fetchMock);
    const client = getQueryClient();
    const keys = [
      [...ADMIN_CRM_RECORD_DETAIL_QUERY_KEY, "fixture-record"],
      [...ADMIN_CRM_RECORDS_QUERY_KEY, "fixture-list"],
      ["admin", "crm", "notes", "fixture-record"],
    ];
    for (const key of keys) client.setQueryData(key, { fixture: true });
    const { result } = renderHook(
      () => useCreateLinkedCrmNote("fixture-record"),
      { wrapper: Wrapper },
    );
    expect(result.current.isPending).toBe(false);
    act(() =>
      result.current.mutate({
        body: "Fixture note",
        title: "Fixture",
        linkedRecordId: "fixture-record",
        linkedRecordType: "donor_profile",
      }),
    );
    await waitFor(() => expect(result.current.isPending).toBe(true));
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/admin/crm/notes",
      expect.objectContaining({ method: "POST", credentials: "same-origin" }),
    );
    await act(async () => {
      response.resolve(Response.json({ note: { id: "fixture-note" } }));
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.isPending).toBe(false);
    for (const key of keys)
      expect(client.getQueryState(key)?.isInvalidated).toBe(true);
  });
});
