// @vitest-environment jsdom

import { act, cleanup, render } from "@testing-library/react";
import * as React from "react";
import { afterEach, describe, expect, it } from "vitest";

import { useFocusReturn } from "../../../../../../apps/admin/features/support-hub/lib/use-focus-return";

afterEach(() => {
  cleanup();
  document.body.innerHTML = "";
});

function Detail({ active }: { active: boolean }) {
  useFocusReturn(active);
  return null;
}

describe("useFocusReturn", () => {
  it("restores focus to the originating element after unmount", async () => {
    const trigger = document.createElement("button");
    trigger.textContent = "Open";
    document.body.appendChild(trigger);
    trigger.focus();
    expect(document.activeElement).toBe(trigger);

    const { unmount } = render(<Detail active />);
    // Move focus elsewhere, simulating the detail panel taking focus.
    const decoy = document.createElement("input");
    document.body.appendChild(decoy);
    decoy.focus();
    expect(document.activeElement).toBe(decoy);

    await act(async () => {
      unmount();
    });

    expect(document.activeElement).toBe(trigger);
  });

  it("returns focus when active flips from true to false", async () => {
    const trigger = document.createElement("button");
    trigger.textContent = "Open";
    document.body.appendChild(trigger);
    trigger.focus();

    const { rerender } = render(<Detail active />);
    const decoy = document.createElement("input");
    document.body.appendChild(decoy);
    decoy.focus();
    expect(document.activeElement).toBe(decoy);

    // Flipping active false re-runs the effect cleanup, which restores focus.
    await act(async () => {
      rerender(<Detail active={false} />);
    });
    expect(document.activeElement).toBe(trigger);
  });
});
