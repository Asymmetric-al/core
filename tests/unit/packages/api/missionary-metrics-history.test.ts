import { describe, expect, it } from "vitest";

import { readMissionaryGiftHistory } from "../../../../packages/api/src/missionaries/metrics";

type Row = Record<string, unknown>;

/** PostgREST answers at most `max_rows` rows per request (supabase/config.toml). */
const SERVER_MAX_ROWS = 1000;

/** A donations query that filters, orders and pages like PostgREST. */
function donationsTable(rows: Row[], failAtFrom?: number) {
  const calls: Array<{ from: number; to: number }> = [];
  const reader = {
    from() {
      const filters: Array<(row: Row) => boolean> = [];
      const orders: string[] = [];
      let window: { from: number; to: number } | null = null;
      const query = {
        select: () => query,
        eq(column: string, value: unknown) {
          filters.push((row) => row[column] === value);
          return query;
        },
        gte(column: string, value: string) {
          filters.push((row) => String(row[column]) >= value);
          return query;
        },
        order(column: string) {
          orders.push(column);
          return query;
        },
        range(from: number, to: number) {
          window = { from, to };
          calls.push(window);
          return query;
        },
        then(resolve: (value: unknown) => unknown) {
          if (window && failAtFrom !== undefined && window.from >= failAtFrom) {
            return Promise.resolve({
              data: null,
              error: { message: "page failed" },
            }).then(resolve);
          }
          let result = rows.filter((row) => filters.every((f) => f(row)));
          result = [...result].sort((left, right) => {
            for (const column of orders) {
              const compared = String(left[column]).localeCompare(
                String(right[column]),
              );
              if (compared !== 0) return compared;
            }
            return 0;
          });
          if (window) result = result.slice(window.from, window.to + 1);
          return Promise.resolve({
            data: result.slice(0, SERVER_MAX_ROWS),
            error: null,
          }).then(resolve);
        },
      };
      return query;
    },
  };
  return { reader: reader as never, calls };
}

function gifts(count: number, missionaryId = "m-1"): Row[] {
  return Array.from({ length: count }, (_, index) => ({
    id: `gift-${String(index).padStart(5, "0")}`,
    amount: 1000,
    currency: "USD",
    created_at: `2026-0${1 + (index % 9)}-15T00:00:00.000Z`,
    missionary_id: missionaryId,
    status: "completed",
  }));
}

describe("missionary metrics gift history", () => {
  it("reads every gift past the server's 1,000-row cap", async () => {
    const { reader } = donationsTable([...gifts(2500), ...gifts(5, "m-2")]);

    const { data, error } = await readMissionaryGiftHistory(
      reader,
      "m-1",
      "2025-01-01T00:00:00.000Z",
    );

    expect(error).toBeNull();
    expect(data).toHaveLength(2500);
    expect(new Set(data?.map((gift) => gift.id)).size).toBe(2500);
  });

  it("fails the whole read when a later page fails, rather than returning part of it", async () => {
    const { reader } = donationsTable(gifts(2500), 1000);

    const { data, error } = await readMissionaryGiftHistory(
      reader,
      "m-1",
      "2025-01-01T00:00:00.000Z",
    );

    expect(data).toBeNull();
    expect(error).toEqual({ message: "page failed" });
  });
});
