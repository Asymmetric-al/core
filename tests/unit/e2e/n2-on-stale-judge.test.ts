import { describe, expect, it } from "vitest";

import {
  judgeStaleCalls,
  NAVIGATION_ABORT,
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
    failure: null,
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
      [call("7", 401), call("7", null, { failure: NAVIGATION_ABORT })],
      MOVED,
    );
    expect(judged.pending).toEqual([]);
    expect(judged.cancelled).toBe(1);
    expect(judged.transportErrors).toEqual([]);
    expect(judged.served).toEqual([]);
    expect(judged.refused).toBe(1);
  });

  it.each([
    "net::ERR_CONNECTION_RESET",
    "net::ERR_EMPTY_RESPONSE",
    "net::ERR_FAILED",
  ])(
    "lists a stale call that failed with %s as a transport error, not as cancelled (#2858 item 2)",
    (failure) => {
      const judged = judgeStaleCalls(
        [call("7", 401), call("7", null, { failure })],
        MOVED,
      );
      expect(judged.cancelled).toBe(0);
      expect(judged.transportErrors.map((error) => error.failure)).toEqual([
        failure,
      ]);
      expect(judged.pending).toEqual([]);
    },
  );

  it("reports a stale call answered 200 as served", () => {
    const judged = judgeStaleCalls([call("7", 401), call("7", 200)], MOVED);
    expect(judged.served.map((served) => served.status)).toEqual([200]);
  });

  it("leaves the calls made at the new generation out", () => {
    const judged = judgeStaleCalls(
      [
        call(MOVED, 200),
        call(MOVED, null),
        call(MOVED, null, { failure: "net::ERR_FAILED" }),
      ],
      MOVED,
    );
    expect(judged).toEqual({
      pending: [],
      cancelled: 0,
      transportErrors: [],
      served: [],
      refused: 0,
    });
  });
});
