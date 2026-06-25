import { describe, expect, it } from "vitest";

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

describe("querySupabaseCollectionOnce", () => {
  it("runs non-aggregate filtered reads through the supplied Supabase client", async () => {
    const { calls, client } = createSupabaseStub([
      { id: "post-1", content: "Published update", created_at: "2026-06-25" },
    ]);
    const callback = (() => ({
      _getQuery: () => ({
        from: {
          type: "collectionRef",
          collection: { id: "posts" },
        },
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
    })) as unknown as QueryOnceCallback;

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
});
