import { describe, expect, it } from "vitest";

import {
  judgeStaleCalls,
  type JudgedCall,
} from "../../e2e/helpers/n2-on-judge";

const MOVED = "8";

function call(
  generation: string,
  status: number | null,
  extra: Partial<JudgedCall> = {},
): JudgedCall {
  return {
    url: "/admin/api/admin/contributions",
    headers: { "x-asym-scope-generation": generation },
    status,
    refused: status === 401 ? "generation_mismatch" : null,
    failed: false,
    ...extra,
  };
}

describe("judging a stale tab's own calls after the generation moved", () => {
  it("holds back a stale call still pending, so it is waited for, not judged", () => {
    const judged = judgeStaleCalls([call("7", 401), call("7", null)], MOVED);
    expect(judged.pending).toHaveLength(1);
    expect(judged.served).toEqual([]);
  });

  it("counts a stale call the reload cancelled apart, never as served", () => {
    const judged = judgeStaleCalls(
      [call("7", 401), call("7", null, { failed: true })],
      MOVED,
    );
    expect(judged.pending).toEqual([]);
    expect(judged.cancelled).toBe(1);
    expect(judged.served).toEqual([]);
    expect(judged.refused).toBe(1);
  });

  it("reports a stale call answered 200 as served", () => {
    const judged = judgeStaleCalls([call("7", 401), call("7", 200)], MOVED);
    expect(judged.served.map((served) => served.status)).toEqual([200]);
  });

  it("leaves the calls made at the new generation out", () => {
    const judged = judgeStaleCalls(
      [call(MOVED, 200), call(MOVED, null)],
      MOVED,
    );
    expect(judged).toEqual({
      pending: [],
      cancelled: 0,
      served: [],
      refused: 0,
    });
  });
});
