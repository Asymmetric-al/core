import { describe, expect, it } from "vitest";

import { resolveDrawerSwipeDirection } from "../../../../packages/ui/lib/drawer-swipe-direction";

describe("resolveDrawerSwipeDirection", () => {
  it("maps legacy direction to Base UI swipeDirection", () => {
    expect(resolveDrawerSwipeDirection({ direction: "top" })).toBe("up");
    expect(resolveDrawerSwipeDirection({ direction: "bottom" })).toBe("down");
    expect(resolveDrawerSwipeDirection({ direction: "left" })).toBe("left");
    expect(resolveDrawerSwipeDirection({ direction: "right" })).toBe("right");
  });

  it("prefers explicit swipeDirection over legacy direction", () => {
    expect(
      resolveDrawerSwipeDirection({
        direction: "top",
        swipeDirection: "left",
      }),
    ).toBe("left");
  });

  it("returns undefined when neither prop is set", () => {
    expect(resolveDrawerSwipeDirection({})).toBeUndefined();
  });
});
