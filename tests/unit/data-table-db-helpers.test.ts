import { describe, expect, it, vi } from "vitest";
import {
  refetchLiveQuerySource,
  resolveLiveQueryError,
} from "../../packages/ui/components/shadcn/data-table/hooks/use-data-table-live-query";
import { syncRealtimePayloadToCollection } from "../../packages/ui/components/shadcn/data-table/hooks/use-supabase-realtime";

describe("resolveLiveQueryError", () => {
  it("returns null when the live query is not in an error state", () => {
    expect(resolveLiveQueryError(false, "ready", undefined)).toBeNull();
  });

  it("uses collection.utils.lastError when available", () => {
    const error = new Error("query failed");
    expect(
      resolveLiveQueryError(true, "error", {
        utils: { lastError: error },
      }),
    ).toBe(error);
  });

  it("falls back to the status string when no concrete error exists", () => {
    expect(resolveLiveQueryError(true, "error", undefined)?.message).toContain(
      "Live query error (error)",
    );
  });
});

describe("refetchLiveQuerySource", () => {
  it("prefers collection.utils.refetch over invalidation", async () => {
    const refetch = vi.fn(async () => {});
    const invalidateQuery = vi.fn(async () => {});

    await refetchLiveQuerySource({
      collection: { utils: { refetch } },
      invalidateQuery,
    });

    expect(refetch).toHaveBeenCalledTimes(1);
    expect(invalidateQuery).not.toHaveBeenCalled();
  });

  it("falls back to invalidation when collection refetch is unavailable", async () => {
    const invalidateQuery = vi.fn(async () => {});

    await refetchLiveQuerySource({
      collection: {},
      invalidateQuery,
    });

    expect(invalidateQuery).toHaveBeenCalledTimes(1);
  });

  it("finally falls back to preload when no query invalidation is provided", async () => {
    const preload = vi.fn(async () => {});

    await refetchLiveQuerySource({
      collection: { preload },
    });

    expect(preload).toHaveBeenCalledTimes(1);
  });
});

describe("syncRealtimePayloadToCollection", () => {
  it("writes inserts directly to the query collection", () => {
    const writeInsert = vi.fn();

    const wroteDirectly = syncRealtimePayloadToCollection({
      payload: {
        eventType: "INSERT",
        new: { id: "post-1", title: "Hello" },
        old: {},
      },
      collection: { utils: { writeInsert } },
      getKey: (row: { id: string }) => row.id,
      toRow: (d) => d as { id: string; title?: string } | null,
    });

    expect(wroteDirectly).toBe(true);
    expect(writeInsert).toHaveBeenCalledWith({ id: "post-1", title: "Hello" });
  });

  it("uses the configured key getter for deletes", () => {
    const writeDelete = vi.fn();

    const wroteDirectly = syncRealtimePayloadToCollection({
      payload: {
        eventType: "DELETE",
        new: {},
        old: { slug: "abc" },
      },
      collection: { utils: { writeDelete } },
      getKey: (row: { slug: string }) => row.slug,
      toRow: (d) => d as { slug: string } | null,
    });

    expect(wroteDirectly).toBe(true);
    expect(writeDelete).toHaveBeenCalledWith("abc");
  });

  it("returns false when no direct-write collection is provided", () => {
    expect(
      syncRealtimePayloadToCollection({
        payload: {
          eventType: "UPDATE",
          new: { id: "1" },
          old: { id: "1" },
        },
        getKey: (row: { id: string }) => row.id,
        toRow: (d) => d as { id: string } | null,
      }),
    ).toBe(false);
  });

  it("returns false when the matching write helper is missing so invalidation can run", () => {
    const writeUpdate = vi.fn();

    const wroteDirectly = syncRealtimePayloadToCollection({
      payload: {
        eventType: "INSERT",
        new: { id: "1" },
        old: {},
      },
      collection: { utils: { writeUpdate } },
      getKey: (row: { id: string }) => row.id,
      toRow: (d) => d as { id: string } | null,
    });

    expect(wroteDirectly).toBe(false);
    expect(writeUpdate).not.toHaveBeenCalled();
  });
});
