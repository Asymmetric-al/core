export type LegacyDrawerDirection = "top" | "bottom" | "left" | "right";

type SwipeDirection = "up" | "down" | "left" | "right";

const LEGACY_DIRECTION_TO_SWIPE_DIRECTION: Record<
  LegacyDrawerDirection,
  SwipeDirection
> = {
  top: "up",
  bottom: "down",
  left: "left",
  right: "right",
};

/**
 * Base UI Drawer uses `swipeDirection`; older call sites passed `direction`.
 * Resolves the effective swipe direction for the drawer root.
 */
export function resolveDrawerSwipeDirection(options: {
  swipeDirection?: SwipeDirection;
  direction?: LegacyDrawerDirection;
}): SwipeDirection | undefined {
  const { swipeDirection, direction } = options;
  if (swipeDirection !== undefined) {
    return swipeDirection;
  }
  if (direction === undefined) {
    return undefined;
  }
  return LEGACY_DIRECTION_TO_SWIPE_DIRECTION[direction];
}
