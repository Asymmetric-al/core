import { describe, expect, it } from "vitest";
import { inboxContentState } from "../../../../../../apps/admin/features/support-hub/lib/inbox-content-state";
describe("inbox content states", () => {
  it.each([
    [{ isError: true, isLoading: false, total: 0, matching: 0 }, "error"],
    [{ isError: true, isLoading: false, total: 2, matching: 2 }, "ready"],
    [
      { isError: false, isLoading: false, total: 0, matching: 0 },
      "no-conversations",
    ],
    [{ isError: false, isLoading: false, total: 2, matching: 0 }, "no-matches"],
    [{ isError: false, isLoading: true, total: 0, matching: 0 }, "loading"],
  ])("classifies %j as %s", (state, expected) =>
    expect(inboxContentState(state)).toBe(expected),
  );
});
