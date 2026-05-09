import * as React from "react";

/** Cleared in tests' `afterEach` — records last `shouldShow` boolean per BubbleMenu render. */
export const bubbleMenuShouldShowResults: boolean[] = [];

export function BubbleMenu({
  children,
  shouldShow,
  editor,
}: {
  children: React.ReactNode;
  shouldShow: (args: {
    editor: unknown;
    element: HTMLElement;
    view: { hasFocus: () => boolean };
  }) => boolean;
  editor: unknown;
}) {
  const element = document.createElement("div");
  const visible = shouldShow({
    editor,
    element,
    view: { hasFocus: () => true },
  });
  bubbleMenuShouldShowResults.push(visible);
  return visible ? <div data-testid="bubble-menu">{children}</div> : null;
}
