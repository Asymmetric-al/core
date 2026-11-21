/**
 * #2708: only Postgres refusing the swept relation itself counts as "refused
 * for lack of privilege"; any other 42501 is an error the sweep reports. The
 * key reader pages through every row whatever cap the Data API applies.
 * Pure: no stack.
 */
import { describe, expect, it } from "vitest";

import {
  isRefusalOf,
  readAllPages,
  type Page,
} from "../../integration/api-contract/isolation-probe";

const donors = { schema: "public", table: "donors" };
const denied = (message: string) => ({ code: "42501", message });

describe("isRefusalOf", () => {
  it("counts a refusal of the swept table or view", () => {
    expect(
      isRefusalOf(denied("permission denied for table donors"), donors),
    ).toBe(true);
    expect(
      isRefusalOf(denied("permission denied for view donors"), donors),
    ).toBe(true);
  });

  it("does not count a refusal of another relation, a function or a schema", () => {
    for (const message of [
      "permission denied for table profiles",
      "permission denied for table donors_archive",
      "permission denied for function is_super_admin",
      "permission denied for schema authz",
      "permission denied for sequence donors_id_seq",
    ])
      expect(isRefusalOf(denied(message), donors), message).toBe(false);
  });

  it("does not count other error codes", () => {
    expect(
      isRefusalOf(
        { code: "42703", message: "permission denied for table donors" },
        donors,
      ),
    ).toBe(false);
  });
});

/** A Data API over `total` rows that returns at most `cap` rows per request. */
function cappedDataApi(total: number, cap: number) {
  const rows = Array.from({ length: total }, (_, i) => `row-${i}`);
  const requests: [number, number][] = [];
  const readRange = async (
    from: number,
    to: number,
  ): Promise<Page<string, string>> => {
    requests.push([from, to]);
    return { rows: rows.slice(from, Math.min(to + 1, from + cap)) };
  };
  return { rows, requests, readRange };
}

describe("readAllPages", () => {
  it("reads every row when the Data API caps each response at the page size", async () => {
    const api = cappedDataApi(7, 3);
    expect(await readAllPages(api.readRange, 3)).toEqual({ rows: api.rows });
  });

  it("reads every row when the Data API caps responses below the page size", async () => {
    // A max_rows lower than the pager assumed must not end the read early.
    const api = cappedDataApi(7, 3);
    expect(await readAllPages(api.readRange, 1000)).toEqual({
      rows: api.rows,
    });
  });

  it("reads an empty relation", async () => {
    expect(await readAllPages(cappedDataApi(0, 3).readRange, 3)).toEqual({
      rows: [],
    });
  });

  it("stops at the first error", async () => {
    let calls = 0;
    const result = await readAllPages<string, string>(async () => {
      calls += 1;
      return calls === 1 ? { rows: ["a", "b"] } : { error: "42501" };
    }, 2);
    expect(result).toEqual({ error: "42501" });
    expect(calls).toBe(2);
  });
});
