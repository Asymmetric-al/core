import { describe, expect, it, vi } from "vitest";

import { validateProductionSource } from "../../../scripts/verify/deployment-discipline.mjs";

const headSha = "a".repeat(40);

describe("production source", () => {
  it("accepts only a Core head already reachable from develop", () => {
    const isAncestor = vi.fn(() => true);
    expect(
      validateProductionSource({
        headRepository: "Asymmetric-al/core",
        headSha,
        isAncestor,
      }),
    ).toBe(true);
    expect(isAncestor).toHaveBeenCalledWith(headSha, "origin/develop");
  });

  it.each([
    ["outside/core", headSha, true],
    ["Asymmetric-al/core", "bad", true],
    ["Asymmetric-al/core", headSha, false],
  ])(
    "blocks an invalid or unpromoted head",
    (headRepository, sha, ancestor) => {
      expect(
        validateProductionSource({
          headRepository,
          headSha: sha,
          isAncestor: () => ancestor,
        }),
      ).toBe(false);
    },
  );
});
