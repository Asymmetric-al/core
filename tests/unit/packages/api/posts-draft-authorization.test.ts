import { describe, expect, it } from "vitest";

import { postsQuerySchema } from "../../../../packages/api/src/schemas/posts";

/**
 * `GET /api/posts` reads through the RLS-bypassing service-role client and
 * applies `.eq("missionary_id", …)` only when a missionaryId is supplied, so
 * the status filter is the only thing standing between a caller and every
 * missionary's unpublished drafts in the tenant. These lock the query contract
 * that the handler's authorization check depends on.
 */
describe("postsQuerySchema", () => {
  it("defaults to published when no status is supplied", () => {
    const parsed = postsQuerySchema.parse({ limit: "10", offset: "0" });

    expect(parsed.status).toBe("published");
  });

  it("accepts the two real post states", () => {
    expect(
      postsQuerySchema.parse({ limit: "10", offset: "0", status: "published" })
        .status,
    ).toBe("published");
    expect(
      postsQuerySchema.parse({ limit: "10", offset: "0", status: "draft" })
        .status,
    ).toBe("draft");
  });

  it("rejects an arbitrary status instead of forwarding it to the query", () => {
    expect(() =>
      postsQuerySchema.parse({ limit: "10", offset: "0", status: "archived" }),
    ).toThrow();
  });

  it("bounds offset so the cache key cannot be sprayed", () => {
    expect(() =>
      postsQuerySchema.parse({ limit: "10", offset: "10001" }),
    ).toThrow();
  });
});
