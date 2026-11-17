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

function Pane({ recordKey }: { recordKey: string }) {
  const container = React.useRef<HTMLDivElement | null>(null);
  useFocusReturn(true, { key: recordKey, container });
  return (
    <div ref={container}>
      <button type="button">Close</button>
    </div>
  );
}

function button(name: string) {
  const element = document.createElement("button");
  element.textContent = name;
  document.body.appendChild(element);
  return element;
}

describe("useFocusReturn with a record key", () => {
  it("returns focus to the element focused when the open record last changed", async () => {
    const first = button("Card one");
    const third = button("Card three");
    first.focus();
    const { rerender, unmount, getByRole } = render(<Pane recordKey="one" />);

    // j from the board focuses the next card, then the pane shows it.
    third.focus();
    rerender(<Pane recordKey="three" />);
    getByRole("button", { name: "Close" }).focus();

    await act(async () => {
      unmount();
    });
    expect(document.activeElement).toBe(third);
  });

  it("keeps the earlier element when focus is inside the pane as the record changes", async () => {
    const first = button("Card one");
    first.focus();
    const { rerender, unmount, getByRole } = render(<Pane recordKey="one" />);

    getByRole("button", { name: "Close" }).focus();
    rerender(<Pane recordKey="two" />);

    await act(async () => {
      unmount();
    });
    expect(document.activeElement).toBe(first);
  });

  it("keeps the earlier element when nothing has focus as the record changes", async () => {
    const first = button("Card one");
    first.focus();
    const { rerender, unmount } = render(<Pane recordKey="one" />);

    first.blur();
    rerender(<Pane recordKey="two" />);
    expect(document.activeElement).toBe(document.body);

    await act(async () => {
      unmount();
    });
    expect(document.activeElement).toBe(first);
  });
});
