import { describe, expect, it } from "vitest";

import { mergedBy } from "../../../scripts/archon-factory/pack/deliver/scripts/readiness-logic.mjs";

const HEAD = "1".repeat(40);
const MERGE = "2".repeat(40);
const OTHER = "3".repeat(40);
const merged = { merged: true, head: { sha: HEAD }, merge_commit_sha: MERGE };

describe("factory merge attribution needs a confirmed matching receipt (F3)", () => {
  it.each([undefined, "requested", "unknown", "refused"])(
    "does not attribute a %s request to the factory",
    (status) => {
      expect(
        mergedBy({ pr: { mergeRequest: { head: HEAD, status } } }, merged),
      ).toBe("external");
    },
  );

  it("attributes only the confirmed merge commit for the exact requested head", () => {
    expect(
      mergedBy(
        {
          pr: {
            mergeRequest: {
              head: HEAD,
              status: "confirmed",
              mergeCommit: MERGE,
            },
          },
        },
        merged,
      ),
    ).toBe("factory");
  });

  it.each([
    { head: OTHER, status: "confirmed", mergeCommit: MERGE },
    { head: HEAD, status: "confirmed", mergeCommit: OTHER },
    { head: HEAD, status: "confirmed" },
    { head: "short", status: "confirmed", mergeCommit: MERGE },
  ])(
    "rejects mismatched or missing confirmed merge evidence %#",
    (mergeRequest) => {
      expect(mergedBy({ pr: { mergeRequest } }, merged)).toBe("external");
    },
  );

  it("does not attribute a still-open pull request", () => {
    expect(
      mergedBy(
        {
          pr: {
            mergeRequest: {
              head: HEAD,
              status: "confirmed",
              mergeCommit: MERGE,
            },
          },
        },
        { ...merged, merged: false },
      ),
    ).toBe("external");
  });
});
