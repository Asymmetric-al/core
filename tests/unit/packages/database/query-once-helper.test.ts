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
  | ["in", string, readonly unknown[]]
  | ["order", string, { ascending: boolean }]
  | ["limit", number]
  | ["range", number, number];

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
    in(column: string, value: readonly unknown[]) {
      calls.push(["in", column, value]);
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
    range(from: number, to: number) {
      calls.push(["range", from, to]);
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

  it("runs limit reads without orderBy through the supplied Supabase client", async () => {
    const { calls, client } = createSupabaseStub([{ id: "post-1" }]);
    const callback = createQueryCallback(createCollectionQuery({ limit: 1 }));

    const result = await querySupabaseCollectionOnce(callback, client);

    expect(result).toEqual([{ id: "post-1" }]);
    expect(calls).toEqual([
      ["from", "posts"],
      ["select", "*"],
      ["limit", 1],
    ]);
    expect(supabaseQueryOnceMock).not.toHaveBeenCalled();
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

  it("runs filtered limit reads without orderBy through the supplied Supabase client", async () => {
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
        limit: 3,
      }),
    );

    const result = await querySupabaseCollectionOnce(callback, client);

    expect(result).toEqual([{ id: "post-1" }]);
    expect(calls).toEqual([
      ["from", "posts"],
      ["select", "*"],
      ["eq", "id", "post-1"],
      ["limit", 3],
    ]);
    expect(supabaseQueryOnceMock).not.toHaveBeenCalled();
  });

  it('translates TanStack Func("in", ...) filters to Supabase in filters', async () => {
    const { calls, client } = createSupabaseStub([{ id: "post-1" }]);
    const callback = createQueryCallback(
      createCollectionQuery({
        where: [
          {
            type: "func",
            name: "in",
            args: [
              { type: "ref", path: ["post", "status"] },
              { type: "val", value: ["published", "scheduled"] },
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
      ["in", "status", ["published", "scheduled"]],
    ]);
    expect(supabaseQueryOnceMock).not.toHaveBeenCalled();
  });

  it.each(["$synced", "$origin", "$key"])(
    "delegates filters on virtual row property row.%s to upstream queryOnce",
    async (virtualProperty) => {
      const delegatedResult = [{ id: "delegated-row" }];
      supabaseQueryOnceMock.mockResolvedValueOnce(delegatedResult);
      const { calls, client } = createSupabaseStub([
        { id: "unsafe-unfiltered-row" },
      ]);
      const callback = createQueryCallback(
        createCollectionQuery({
          where: [
            {
              type: "func",
              name: "eq",
              args: [
                { type: "ref", path: ["row", virtualProperty] },
                { type: "val", value: "virtual-value" },
              ],
            },
          ],
        }),
      );

      const result = await querySupabaseCollectionOnce(callback, client);

      expect(result).toBe(delegatedResult);
      expect(calls).toEqual([]);
      expect(supabaseQueryOnceMock).toHaveBeenCalledTimes(1);
      expect(supabaseQueryOnceMock).toHaveBeenCalledWith(callback, client);
    },
  );

  it("delegates filters on refs without a physical column segment", async () => {
    const delegatedResult = [{ id: "delegated-row" }];
    supabaseQueryOnceMock.mockResolvedValueOnce(delegatedResult);
    const { calls, client } = createSupabaseStub([
      { id: "unsafe-unfiltered-row" },
    ]);
    const callback = createQueryCallback(
      createCollectionQuery({
        where: [
          {
            type: "func",
            name: "eq",
            args: [
              { type: "ref", path: ["row"] },
              { type: "val", value: "post-1" },
            ],
          },
        ],
      }),
    );

    const result = await querySupabaseCollectionOnce(callback, client);

    expect(result).toBe(delegatedResult);
    expect(calls).toEqual([]);
    expect(supabaseQueryOnceMock).toHaveBeenCalledTimes(1);
    expect(supabaseQueryOnceMock).toHaveBeenCalledWith(callback, client);
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

  it.each(["$synced", "$origin", "$key"])(
    "fails closed for ordering on virtual row property row.%s",
    async (virtualProperty) => {
      const { calls, client } = createSupabaseStub([
        { id: "unsafe-unfiltered-row" },
      ]);
      const callback = createQueryCallback(
        createCollectionQuery({
          orderBy: [
            {
              expression: { type: "ref", path: ["row", virtualProperty] },
              compareOptions: { direction: "asc" },
            },
          ],
        }),
      );

      await expect(
        querySupabaseCollectionOnce(callback, client),
      ).rejects.toThrow(
        "queryOnce orderBy must use physical table column references.",
      );

      expect(calls).toEqual([]);
      expect(supabaseQueryOnceMock).not.toHaveBeenCalled();
    },
  );

  it("fails closed for ordering on refs without a physical column segment", async () => {
    const { calls, client } = createSupabaseStub([
      { id: "unsafe-unfiltered-row" },
    ]);
    const callback = createQueryCallback(
      createCollectionQuery({
        orderBy: [
          {
            expression: { type: "ref", path: ["row"] },
            compareOptions: { direction: "asc" },
          },
        ],
      }),
    );

    await expect(querySupabaseCollectionOnce(callback, client)).rejects.toThrow(
      "queryOnce orderBy must use physical table column references.",
    );

    expect(calls).toEqual([]);
    expect(supabaseQueryOnceMock).not.toHaveBeenCalled();
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

  it("runs ordered limit and offset reads through the supplied Supabase client", async () => {
    const { calls, client } = createSupabaseStub([
      { id: "post-6", content: "Later update", created_at: "2026-06-30" },
    ]);
    const callback = createQueryCallback(
      createCollectionQuery({
        orderBy: [
          {
            expression: { type: "ref", path: ["post", "created_at"] },
            compareOptions: { direction: "desc" },
          },
        ],
        limit: 5,
        offset: 10,
      }),
    );

    const result = await querySupabaseCollectionOnce(callback, client);

    expect(result).toEqual([
      { id: "post-6", content: "Later update", created_at: "2026-06-30" },
    ]);
    expect(calls).toEqual([
      ["from", "posts"],
      ["select", "*"],
      ["order", "created_at", { ascending: false }],
      ["limit", 5],
      ["range", 10, 14],
    ]);
    expect(supabaseQueryOnceMock).not.toHaveBeenCalled();
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

  const unsupportedWhereCases: Array<[string, Record<string, unknown>]> = [
    [
      "or",
      {
        type: "func",
        name: "or",
        args: [
          {
            type: "func",
            name: "eq",
            args: [
              { type: "ref", path: ["post", "id"] },
              { type: "val", value: "post-1" },
            ],
          },
          {
            type: "func",
            name: "eq",
            args: [
              { type: "ref", path: ["post", "id"] },
              { type: "val", value: "post-2" },
            ],
          },
        ],
      },
    ],
    [
      "like",
      {
        type: "func",
        name: "like",
        args: [
          { type: "ref", path: ["post", "title"] },
          { type: "val", value: "%update%" },
        ],
      },
    ],
    [
      "ilike",
      {
        type: "func",
        name: "ilike",
        args: [
          { type: "ref", path: ["post", "title"] },
          { type: "val", value: "%update%" },
        ],
      },
    ],
    [
      "not",
      {
        type: "func",
        name: "not",
        args: [
          {
            type: "func",
            name: "eq",
            args: [
              { type: "ref", path: ["post", "id"] },
              { type: "val", value: "post-1" },
            ],
          },
        ],
      },
    ],
    [
      "isUndefined",
      {
        type: "func",
        name: "isUndefined",
        args: [{ type: "ref", path: ["post", "deleted_at"] }],
      },
    ],
  ];

  it.each(unsupportedWhereCases)(
    "delegates unsupported %s filters to upstream queryOnce",
    async (_name, whereExpression) => {
      const delegatedResult = [{ id: "delegated-row" }];
      supabaseQueryOnceMock.mockResolvedValueOnce(delegatedResult);
      const { calls, client } = createSupabaseStub([
        { id: "unsafe-unfiltered-row" },
      ]);
      const callback = createQueryCallback(
        createCollectionQuery({
          where: [whereExpression],
        }),
      );

      const result = await querySupabaseCollectionOnce(callback, client);

      expect(result).toBe(delegatedResult);
      expect(calls).toEqual([]);
      expect(supabaseQueryOnceMock).toHaveBeenCalledTimes(1);
      expect(supabaseQueryOnceMock).toHaveBeenCalledWith(callback, client);
    },
  );

  it("delegates offset-only reads without injecting a synthetic 1000-row range", async () => {
    const delegatedResult = [{ id: "delegated-row" }];
    supabaseQueryOnceMock.mockResolvedValueOnce(delegatedResult);
    const { calls, client } = createSupabaseStub([
      { id: "unsafe-unfiltered-row" },
    ]);
    const callback = createQueryCallback(
      createCollectionQuery({
        offset: 250,
      }),
    );

    const result = await querySupabaseCollectionOnce(callback, client);

    expect(result).toBe(delegatedResult);
    expect(calls).toEqual([]);
    expect(supabaseQueryOnceMock).toHaveBeenCalledTimes(1);
    expect(supabaseQueryOnceMock).toHaveBeenCalledWith(callback, client);
  });

  it("delegates offset and limit reads without orderBy to upstream queryOnce", async () => {
    const delegatedError = new Error("offset limit requires upstream ordering");
    supabaseQueryOnceMock.mockRejectedValueOnce(delegatedError);
    const { calls, client } = createSupabaseStub([
      { id: "unsafe-unfiltered-row" },
    ]);
    const callback = createQueryCallback(
      createCollectionQuery({
        limit: 25,
        offset: 250,
      }),
    );

    await expect(querySupabaseCollectionOnce(callback, client)).rejects.toBe(
      delegatedError,
    );

    expect(calls).toEqual([]);
    expect(supabaseQueryOnceMock).toHaveBeenCalledTimes(1);
    expect(supabaseQueryOnceMock).toHaveBeenCalledWith(callback, client);
  });

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
