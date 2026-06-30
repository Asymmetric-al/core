import { beforeEach, describe, expect, it, vi } from "vitest";

const supabaseQueryOnceMock = vi.hoisted(() => vi.fn());

vi.mock("@supabase-labs/tanstack-db", () => ({
  queryOnce: supabaseQueryOnceMock,
}));

import { querySupabaseCollectionOnce } from "../../../../packages/database/collections/query-once";

type QueryOnceCallback = Parameters<typeof querySupabaseCollectionOnce>[0];

type QueryCall =
  | ["from", string]
  | ["select", string]
  | ["eq", string, unknown]
  | ["order", string, { ascending: boolean }]
  | ["limit", number];

function createSupabaseStub(data: unknown[]) {
  const calls: QueryCall[] = [];
  const builder = {
    select(columns: string) {
      calls.push(["select", columns]);
      return this;
    },
    eq(column: string, value: unknown) {
      calls.push(["eq", column, value]);
      return this;
    },
    order(column: string, options: { ascending: boolean }) {
      calls.push(["order", column, options]);
      return this;
    },
    limit(value: number) {
      calls.push(["limit", value]);
      return this;
    },
    then(
      resolve: (result: { data: unknown[]; error: null }) => unknown,
      reject?: (reason: unknown) => unknown,
    ) {
      return Promise.resolve({ data, error: null }).then(resolve, reject);
    },
  };

  return {
    calls,
    client: {
      from(tableName: string) {
        calls.push(["from", tableName]);
        return builder;
      },
    },
  };
}

function createQueryCallback(
  query: Record<string, unknown>,
): QueryOnceCallback {
  return (() => ({
    _getQuery: () => query,
  })) as unknown as QueryOnceCallback;
}

function createCollectionQuery(overrides: Record<string, unknown> = {}) {
  return {
    from: {
      type: "collectionRef",
      collection: { id: "posts" },
    },
    ...overrides,
  };
}

describe("querySupabaseCollectionOnce", () => {
  beforeEach(() => {
    supabaseQueryOnceMock.mockReset();
  });

  it("runs bare collection reads without requiring optional clauses", async () => {
    const { calls, client } = createSupabaseStub([
      { id: "post-1", content: "Published update" },
    ]);
    const callback = createQueryCallback(createCollectionQuery());

    const result = await querySupabaseCollectionOnce(callback, client);

    expect(result).toEqual([{ id: "post-1", content: "Published update" }]);
    expect(calls).toEqual([
      ["from", "posts"],
      ["select", "*"],
    ]);
    expect(supabaseQueryOnceMock).not.toHaveBeenCalled();
  });

  it("runs collection reads with a limit and no where or orderBy clauses", async () => {
    const { calls, client } = createSupabaseStub([{ id: "post-1" }]);
    const callback = createQueryCallback(createCollectionQuery({ limit: 1 }));

    const result = await querySupabaseCollectionOnce(callback, client);

    expect(result).toEqual([{ id: "post-1" }]);
    expect(calls).toEqual([
      ["from", "posts"],
      ["select", "*"],
      ["limit", 1],
    ]);
  });

  it("runs filtered reads without requiring orderBy", async () => {
    const { calls, client } = createSupabaseStub([{ id: "post-1" }]);
    const callback = createQueryCallback(
      createCollectionQuery({
        where: [
          {
            type: "func",
            name: "eq",
            args: [
              { type: "ref", path: ["post", "id"] },
              { type: "val", value: "post-1" },
            ],
          },
        ],
      }),
    );

    const result = await querySupabaseCollectionOnce(callback, client);

    expect(result).toEqual([{ id: "post-1" }]);
    expect(calls).toEqual([
      ["from", "posts"],
      ["select", "*"],
      ["eq", "id", "post-1"],
    ]);
  });

  it("runs ordered reads without requiring where", async () => {
    const { calls, client } = createSupabaseStub([{ id: "post-1" }]);
    const callback = createQueryCallback(
      createCollectionQuery({
        orderBy: [
          {
            expression: { type: "ref", path: ["post", "created_at"] },
            compareOptions: { direction: "desc" },
          },
        ],
      }),
    );

    const result = await querySupabaseCollectionOnce(callback, client);

    expect(result).toEqual([{ id: "post-1" }]);
    expect(calls).toEqual([
      ["from", "posts"],
      ["select", "*"],
      ["order", "created_at", { ascending: false }],
    ]);
  });

  it("runs non-aggregate filtered reads through the supplied Supabase client", async () => {
    const { calls, client } = createSupabaseStub([
      { id: "post-1", content: "Published update", created_at: "2026-06-25" },
    ]);
    const callback = createQueryCallback(
      createCollectionQuery({
        where: [
          {
            type: "func",
            name: "eq",
            args: [
              { type: "ref", path: ["post", "id"] },
              { type: "val", value: "post-1" },
            ],
          },
        ],
        orderBy: [
          {
            expression: { type: "ref", path: ["post", "created_at"] },
            compareOptions: { direction: "asc" },
          },
        ],
        limit: 5,
      }),
    );

    const result = await querySupabaseCollectionOnce(callback, client);

    expect(result).toEqual([
      { id: "post-1", content: "Published update", created_at: "2026-06-25" },
    ]);
    expect(calls).toEqual([
      ["from", "posts"],
      ["select", "*"],
      ["eq", "id", "post-1"],
      ["order", "created_at", { ascending: true }],
      ["limit", 5],
    ]);
  });

  it("returns the first row for single-result reads", async () => {
    const { client } = createSupabaseStub([
      { id: "post-1" },
      { id: "post-2" },
    ]);
    const callback = createQueryCallback(
      createCollectionQuery({ singleResult: true }),
    );

    const result = await querySupabaseCollectionOnce(callback, client);

    expect(result).toEqual({ id: "post-1" });
  });

  it("returns undefined for empty single-result reads", async () => {
    const { client } = createSupabaseStub([]);
    const callback = createQueryCallback(
      createCollectionQuery({ singleResult: true }),
    );

    const result = await querySupabaseCollectionOnce(callback, client);

    expect(result).toBeUndefined();
  });

  it("materializes the query once and executes simple reads with the first query IR", async () => {
    const { calls, client } = createSupabaseStub([{ id: "post-1" }]);
    const firstQuery = createCollectionQuery({
      where: [
        {
          type: "func",
          name: "eq",
          args: [
            { type: "ref", path: ["post", "id"] },
            { type: "val", value: "post-1" },
          ],
        },
      ],
    });
    const secondQuery = createCollectionQuery({
      from: {
        type: "collectionRef",
        collection: { id: "comments" },
      },
      where: [
        {
          type: "func",
          name: "eq",
          args: [
            { type: "ref", path: ["comment", "id"] },
            { type: "val", value: "comment-1" },
          ],
        },
      ],
    });
    const queryQueue = [firstQuery, secondQuery];
    const callback = vi.fn(() => ({
      _getQuery: () => queryQueue.shift(),
    })) as unknown as QueryOnceCallback;

    const result = await querySupabaseCollectionOnce(callback, client);

    expect(result).toEqual([{ id: "post-1" }]);
    expect(callback).toHaveBeenCalledTimes(1);
    expect(calls).toEqual([
      ["from", "posts"],
      ["select", "*"],
      ["eq", "id", "post-1"],
    ]);
    expect(supabaseQueryOnceMock).not.toHaveBeenCalled();
  });

  it.each(["fnSelect", "fnWhere", "fnHaving"])(
    "delegates %s queries to upstream queryOnce",
    async (functionalClause) => {
      const delegatedError = new Error(`${functionalClause} delegated`);
      supabaseQueryOnceMock.mockRejectedValueOnce(delegatedError);
      const { calls, client } = createSupabaseStub([
        { id: "unsafe-unfiltered-row" },
      ]);
      const callback = createQueryCallback(
        createCollectionQuery({
          [functionalClause]: () => ({ type: "raw" }),
        }),
      );

      await expect(
        querySupabaseCollectionOnce(callback, client),
      ).rejects.toThrow(`${functionalClause} delegated`);

      expect(calls).toEqual([]);
      expect(supabaseQueryOnceMock).toHaveBeenCalledTimes(1);
      expect(supabaseQueryOnceMock).toHaveBeenCalledWith(callback, client);
    },
  );

  const delegatedQueryCases: Array<[string, Record<string, unknown>]> = [
    [
      "projection selects",
      createCollectionQuery({
        select: {
          id: { type: "ref", path: ["post", "id"] },
        },
      }),
    ],
    [
      "joins",
      createCollectionQuery({
        join: [
          {
            type: "join",
          },
        ],
      }),
    ],
    [
      "distinct reads",
      createCollectionQuery({
        distinct: true,
      }),
    ],
  ];

  it.each(delegatedQueryCases)(
    "delegates %s to upstream queryOnce",
    async (_name, query) => {
      const delegatedResult = [{ id: "delegated-row" }];
      supabaseQueryOnceMock.mockResolvedValueOnce(delegatedResult);
      const { calls, client } = createSupabaseStub([
        { id: "unsafe-unfiltered-row" },
      ]);
      const callback = createQueryCallback(query);

      const result = await querySupabaseCollectionOnce(callback, client);

      expect(result).toBe(delegatedResult);
      expect(calls).toEqual([]);
      expect(supabaseQueryOnceMock).toHaveBeenCalledTimes(1);
      expect(supabaseQueryOnceMock).toHaveBeenCalledWith(callback, client);
    },
  );
});
