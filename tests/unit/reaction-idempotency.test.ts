import { describe, expect, it } from "vitest";

import {
  hasRemovedReactions,
  isDuplicateReactionError,
} from "../../packages/lib/posts/reaction-idempotency";

describe("reaction idempotency guards", () => {
  it("detects unique-constraint duplicates", () => {
    expect(isDuplicateReactionError({ code: "23505" })).toBe(true);
    expect(isDuplicateReactionError({ code: "22000" })).toBe(false);
    expect(isDuplicateReactionError({})).toBe(false);
    expect(isDuplicateReactionError(null)).toBe(false);
  });

  it("detects whether delete calls removed reaction rows", () => {
    expect(hasRemovedReactions([{ post_id: "post-1" }])).toBe(true);
    expect(hasRemovedReactions([])).toBe(false);
    expect(hasRemovedReactions(undefined)).toBe(false);
    expect(hasRemovedReactions(null)).toBe(false);
  });
});
