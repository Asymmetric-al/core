import { describe, expect, it, vi } from "vitest";

import { validateProductionSource } from "../../../scripts/release/production.mjs";

const headSha = "a".repeat(40);

describe("production source", () => {
  it("accepts a release head already reachable from fetched develop", () => {
    const isAncestor = vi.fn(() => true);
    expect(validateProductionSource({ headSha, isAncestor })).toBe(true);
    expect(isAncestor).toHaveBeenCalledWith(headSha, "FETCH_HEAD");
  });

  it.each([
    ["bad", true],
    [headSha, false],
  ])("blocks an invalid or unpromoted head", (sha, ancestor) => {
    expect(
      validateProductionSource({
        headSha: sha,
        isAncestor: () => ancestor,
      }),
    ).toBe(false);
  });
});
