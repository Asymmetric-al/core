"use client";

import { BREAKPOINTS } from "@asym/lib/responsive";
import * as React from "react";

/**
 * Match Tailwind's `lg` breakpoint. Used to mount exactly one
 * `ConversationDetail` (inline rail vs `Sheet`); the Sheet portals to
 * `document` and must not be mounted in parallel with the inline tree.
 */
export function useLgUp(): boolean {
  const [isLg, setIsLg] = React.useState(false);

  React.useLayoutEffect(() => {
    const query = `(min-width: ${BREAKPOINTS.lg}px)`;
    const mql = window.matchMedia(query);
    const update = () => {
      setIsLg(mql.matches);
    };
    update();
    mql.addEventListener("change", update);
    return () => mql.removeEventListener("change", update);
  }, []);

  return isLg;
}
