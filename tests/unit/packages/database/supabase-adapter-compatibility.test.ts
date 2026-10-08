import {
  queryOnce,
  supabaseCollectionOptions,
} from "@supabase-labs/tanstack-db";
import { afterEach, describe, expect, it, vi } from "vitest";

// The published adapter is ESM. A relative package-directory import bypasses
// its exports conditions in Vitest and selects the CJS main, creating a second
// CollectionImpl/transaction registry. Use the same published ESM entry here.
import {
  and,
  count,
  createCollection,
  createLiveQueryCollection,
  eq,
} from "../../../../packages/database/node_modules/@tanstack/db/dist/esm/index.js";
import { QueryClient } from "../../../../packages/database/node_modules/@tanstack/react-query/build/modern/index.js";
import { z } from "../../../../packages/database/node_modules/zod";

const rowSchema = z.object({
  id: z.string(),
  tenant_id: z.string(),
  parent_id: z.string(),
  name: z.string(),
});
type Row = z.infer<typeof rowSchema>;
type Supabase = Parameters<
  typeof supabaseCollectionOptions<typeof rowSchema>
>[0]["supabase"];

const cleanups: Array<() => Promise<void>> = [];
let tableSequence = 0;

afterEach(async () => {
  for (const cleanup of cleanups.splice(0).reverse()) await cleanup();
  vi.restoreAllMocks();
});

function row(id: string, overrides: Partial<Row> = {}): Row {
  return {
    id,
    tenant_id: "tenant-a",
    parent_id: "parent-1",
    name: id,
    ...overrides,
  };
}

type RealtimeEvent = "INSERT" | "UPDATE" | "DELETE";
type RealtimePayload = { new?: unknown; old?: unknown };

function fakeChannel() {
  const listeners: Array<{
    event: RealtimeEvent;
    filter?: string;
    callback: (payload: RealtimePayload) => void | Promise<void>;
  }> = [];
  const channel = {
    on: (
      _type: string,
      config: { event: RealtimeEvent; filter?: string },
      callback: (payload: RealtimePayload) => void | Promise<void>,
    ) => {
      listeners.push({ ...config, callback });
      return channel;
    },
    subscribe: (callback: (status: string) => void) => {
      queueMicrotask(() => {
        callback("SUBSCRIBED");
      });
      return channel;
    },
    emit: async (
      event: RealtimeEvent,
      payload: RealtimePayload,
      unfilteredOnly = false,
    ) => {
      await Promise.all(
        listeners
          .filter(
            (listener) =>
              listener.event === event && (!unfilteredOnly || !listener.filter),
          )
          .map(({ callback }) => callback(payload)),
      );
    },
  };
  return channel;
}

function table(
  initialRows: Row[],
  realtime = false,
  realtimeUseFilter = false,
) {
  const tableName = `adapter_compatibility_${++tableSequence}`;
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, staleTime: Infinity } },
  });
  const requests: Array<{ url: URL; method: string }> = [];
  const channels: Array<ReturnType<typeof fakeChannel>> = [];
  const transport = {
    rows: [...initialRows],
    mutationResponse: undefined as unknown,
    readError: false,
  };
  const supabase = {
    from: () => ({
      url: new URL(`https://adapter-test.invalid/${tableName}`),
      headers: {},
      schema: "public",
      fetch: async (input: string | URL, init: RequestInit) => {
        const url = new URL(input);
        const method = init.method ?? "GET";
        requests.push({ url, method });
        if (method === "GET" && transport.readError) {
          return new Response(
            JSON.stringify({
              code: "TEST_READ_ERROR",
              message: "Snapshot unavailable",
            }),
            {
              status: 400,
              headers: { "content-type": "application/json" },
            },
          );
        }
        if (method !== "GET") {
          return new Response(
            method === "DELETE"
              ? null
              : JSON.stringify(
                  transport.mutationResponse ?? JSON.parse(String(init.body)),
                ),
            {
              status: method === "DELETE" ? 204 : 200,
              headers: { "content-type": "application/json" },
            },
          );
        }
        let result = transport.rows;
        for (const [key, value] of url.searchParams) {
          if (value.startsWith("eq.")) {
            result = result.filter(
              (item) => String(item[key as keyof Row]) === value.slice(3),
            );
          }
        }
        return new Response(JSON.stringify(result), {
          headers: {
            "content-type": "application/json",
            "content-range": result.length
              ? `0-${result.length - 1}/${result.length}`
              : "*/0",
          },
        });
      },
    }),
    channel: () => {
      const channel = fakeChannel();
      channels.push(channel);
      return channel;
    },
    removeChannel: async () => "ok",
  } as unknown as Supabase;
  const collection = createCollection(
    supabaseCollectionOptions({
      tableName,
      schema: rowSchema,
      keys: ["id"],
      supabase,
      queryClient,
      realtime,
      realtimeUseFilter,
    }),
  );
  cleanups.push(async () => {
    await collection.cleanup();
    queryClient.clear();
  });
  const load = async (tenantId?: string) => {
    const liveQuery = createLiveQueryCollection({
      query: (q) => {
        const query = q.from({ item: collection });
        return tenantId === undefined
          ? query
          : query.where(({ item }) => eq(item.tenant_id, tenantId));
      },
    });
    cleanups.push(async () => {
      await liveQuery.cleanup();
    });
    await liveQuery.preload();
  };
  return { collection, supabase, requests, transport, load, channels };
}

describe("published Supabase adapter compatibility with TanStack DB", () => {
  it("executes a real queryOnce join and preserves every compound equality", async () => {
    const children = table([
      row("child-a", { name: "Allowed parent" }),
      row("child-b", { tenant_id: "tenant-b", name: "Allowed parent" }),
      row("child-c", { name: "Other parent" }),
    ]);
    const parents = table([row("parent-1", { name: "Allowed parent" })]);

    const result = await queryOnce(
      (q) =>
        q
          .from({ child: children.collection })
          .innerJoin({ parent: parents.collection }, ({ child, parent }) =>
            and(
              eq(child.parent_id, parent.id),
              and(
                eq(parent.tenant_id, child.tenant_id),
                eq(child.name, parent.name),
              ),
            ),
          )
          .select(({ child, parent }) => ({
            id: child.id,
            parentName: parent.name,
          })),
      children.supabase,
    );

    expect(result.map(({ id, parentName }) => ({ id, parentName }))).toEqual([
      { id: "child-a", parentName: "Allowed parent" },
    ]);
    expect(children.requests.some(({ method }) => method === "GET")).toBe(true);
    expect(parents.requests.some(({ method }) => method === "GET")).toBe(true);
  });

  it.each(["simple", "compound"])(
    "rejects %s server aggregate joins before issuing a weaker request",
    async (predicate) => {
      const children = table([row("child-a")]);
      const parents = table([row("parent-1")]);
      const execute = async () =>
        queryOnce(
          (q) =>
            q
              .from({ child: children.collection })
              .innerJoin({ parent: parents.collection }, ({ child, parent }) =>
                predicate === "compound"
                  ? and(
                      eq(child.parent_id, parent.id),
                      eq(child.tenant_id, parent.tenant_id),
                    )
                  : eq(child.parent_id, parent.id),
              )
              .select(({ child }) => ({ total: count(child.id) })),
          children.supabase,
        );

      await expect(execute()).rejects.toThrow(
        "Cannot push server aggregate joins to PostgREST",
      );
      expect(children.requests).toEqual([]);
      expect(parents.requests).toEqual([]);
    },
  );

  it("rejects a server aggregate over a joined subquery before network I/O", async () => {
    const children = table([row("child-a")]);
    const parents = table([row("parent-1")]);
    const execute = async () =>
      queryOnce((q) => {
        const joined = q
          .from({ child: children.collection })
          .innerJoin({ parent: parents.collection }, ({ child, parent }) =>
            eq(child.parent_id, parent.id),
          )
          .select(({ child }) => ({ id: child.id }));
        return q
          .from({ joined })
          .select(({ joined: item }) => ({ total: count(item.id) }));
      }, children.supabase);

    await expect(execute()).rejects.toThrow(
      "Cannot push server aggregate joins to PostgREST",
    );
    expect(children.requests).toEqual([]);
    expect(parents.requests).toEqual([]);
  });

  it("rejects an insert transaction and rolls back optimism when the server row fails validation", async () => {
    const { collection, transport, load } = table([]);
    await load();
    transport.mutationResponse = { ...row("inserted"), name: 42 };

    const transaction = collection.insert(row("inserted"));
    expect(collection.get("inserted")?.name).toBe("inserted");

    await expect(
      transaction.isPersisted.promise.then(() => transaction.state),
    ).rejects.toThrow("validation");
    expect(transaction.state).toBe("failed");
    expect(collection.has("inserted")).toBe(false);
  });

  it("rejects an update transaction and restores the original row when the server row fails validation", async () => {
    const { collection, transport, load } = table([
      row("existing", { name: "Original" }),
    ]);
    await load();
    transport.mutationResponse = { ...row("existing"), name: 42 };

    const transaction = collection.update("existing", (draft) => {
      draft.name = "Optimistic";
    });
    expect(collection.get("existing")?.name).toBe("Optimistic");

    await expect(
      transaction.isPersisted.promise.then(() => transaction.state),
    ).rejects.toThrow("validation");
    expect(transaction.state).toBe("failed");
    expect(collection.get("existing")?.name).toBe("Original");
  });

  it("propagates asynchronous delete acceptance failures to the transaction", async () => {
    const { collection, load } = table([row("existing")]);
    await load();
    // The public utility is the adapter's sync-acceptance boundary. Model a
    // rejected durable step; keep the adapter, transaction, and rollback real.
    const failure = new Error("Direct delete acceptance rejected");
    vi.spyOn(collection.utils, "writeDelete").mockRejectedValueOnce(failure);

    const transaction = collection.delete("existing");
    expect(collection.has("existing")).toBe(false);

    await expect(
      transaction.isPersisted.promise.then(() => transaction.state),
    ).rejects.toBe(failure);
    expect(transaction.state).toBe("failed");
    expect(collection.get("existing")?.name).toBe("existing");
  });

  it("reports a rejected Realtime row and recovers from an authoritative snapshot", async () => {
    const { collection, transport, requests, channels, load } = table(
      [row("existing")],
      true,
    );
    const report = vi.spyOn(console, "error").mockImplementation(() => {});
    await load();
    transport.rows = [row("existing", { name: "Recovered" })];

    await channels[0]!.emit("INSERT", {
      new: { ...row("existing"), name: 42 },
    });

    expect(report).toHaveBeenCalledWith(
      expect.stringContaining("Realtime write failed; refetching"),
      expect.objectContaining({ name: "SchemaValidationError" }),
    );
    expect(collection.get("existing")?.name).toBe("Recovered");
    expect(requests.filter(({ method }) => method === "GET")).toHaveLength(2);
  });

  it("reports a failed Realtime recovery, keeps the last valid row, and does not retry indefinitely", async () => {
    const { collection, transport, requests, channels, load } = table(
      [row("existing")],
      true,
    );
    const report = vi.spyOn(console, "error").mockImplementation(() => {});
    await load();
    transport.readError = true;

    await expect(
      channels[0]!.emit("UPDATE", { new: { ...row("existing"), name: 42 } }),
    ).resolves.toBeUndefined();

    expect(
      report.mock.calls.filter(
        ([message]) =>
          typeof message === "string" && message.includes("Realtime"),
      ),
    ).toHaveLength(2);
    expect(report).toHaveBeenLastCalledWith(
      expect.stringContaining(
        "Realtime recovery failed; retaining the last valid snapshot",
      ),
      expect.objectContaining({ message: "Snapshot unavailable" }),
    );
    expect(collection.get("existing")?.name).toBe("existing");
    expect(collection.utils.lastError).toMatchObject({
      message: "Snapshot unavailable",
    });
    expect(requests.filter(({ method }) => method === "GET")).toHaveLength(2);
  });

  it("handles rejected writes from the unfiltered known-update and delete listeners", async () => {
    const { collection, channels, load } = table([row("existing")], true, true);
    const report = vi.spyOn(console, "error").mockImplementation(() => {});
    await load("tenant-a");

    await channels[0]!.emit(
      "UPDATE",
      { new: { ...row("existing"), name: 42 } },
      true,
    );
    expect(report).toHaveBeenCalledTimes(1);
    expect(collection.get("existing")?.name).toBe("existing");

    const failure = new Error("Realtime delete acceptance rejected");
    vi.spyOn(collection.utils, "writeDelete").mockRejectedValueOnce(failure);
    await expect(
      channels[0]!.emit("DELETE", { old: row("existing") }),
    ).resolves.toBeUndefined();
    expect(report).toHaveBeenLastCalledWith(
      expect.stringContaining("Realtime write failed; refetching"),
      failure,
    );
    expect(collection.get("existing")?.name).toBe("existing");
  });

  it("persists successful insert, update, and delete transactions through the real adapter", async () => {
    const { collection, transport, load } = table([]);
    await load();
    transport.mutationResponse = row("persisted", { name: "Server insert" });
    await collection.insert(row("persisted")).isPersisted.promise;
    expect(collection.get("persisted")?.name).toBe("Server insert");

    transport.mutationResponse = row("persisted", { name: "Server update" });
    await collection.update("persisted", (draft) => {
      draft.name = "Optimistic update";
    }).isPersisted.promise;
    expect(collection.get("persisted")?.name).toBe("Server update");

    await collection.delete("persisted").isPersisted.promise;
    expect(collection.has("persisted")).toBe(false);
  });

  it("applies valid Realtime insert, update, and delete events", async () => {
    const { collection, channels, load } = table([], true);
    const report = vi.spyOn(console, "error").mockImplementation(() => {});
    await load();

    await channels[0]!.emit("INSERT", { new: row("remote") });
    expect(collection.get("remote")?.name).toBe("remote");
    await channels[0]!.emit("UPDATE", {
      new: row("remote", { name: "Remote update" }),
    });
    expect(collection.get("remote")?.name).toBe("Remote update");
    await channels[0]!.emit("DELETE", { old: row("remote") });
    expect(collection.has("remote")).toBe(false);
    expect(report).not.toHaveBeenCalled();
  });
});
