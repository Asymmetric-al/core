// @vitest-environment jsdom

import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import { checkPattern } from "@ui-sdk/core/testing";
import { createPortal } from "react-dom";
import { afterEach, describe, expect, it } from "vitest";

import { Button } from "../../../../../../packages/ui/components/shadcn/button";
import {
  Toolbar,
  ToolbarButton,
} from "../../../../../../packages/ui/components/shadcn/toolbar";

afterEach(() => cleanup());

function Formatting({ portal = false }: { portal?: boolean }) {
  return (
    <Toolbar aria-label="Formatting">
      <ToolbarButton render={<Button variant="ghost" size="sm" />}>
        Bold
      </ToolbarButton>
      <ToolbarButton render={<Button variant="ghost" size="sm" />}>
        Italic
      </ToolbarButton>
      <ToolbarButton render={<Button variant="ghost" size="sm" />}>
        Link
      </ToolbarButton>
      {portal
        ? createPortal(
            <div role="dialog" aria-label="Link details">
              <button type="button">First field action</button>
              <button type="button">Last field action</button>
            </div>,
            document.body,
          )
        : null}
    </Toolbar>
  );
}

describe("Toolbar", () => {
  it("follows the toolbar pattern, Home and End included", async () => {
    render(<Formatting />);
    const toolbar = screen.getByRole("toolbar", { name: "Formatting" });
    await act(async () => {
      await checkPattern(toolbar, "toolbar");
    });
    const [bold, , link] = screen.getAllByRole("button");
    act(() => bold!.focus());
    fireEvent.keyDown(bold!, { key: "End" });
    expect(document.activeElement).toBe(link);
    fireEvent.keyDown(link!, { key: "Home" });
    expect(document.activeElement).toBe(bold);
  });

  it("leaves Home and End to portaled content rendered under it", () => {
    render(<Formatting portal />);
    const inside = screen.getByRole("button", { name: "First field action" });
    act(() => inside.focus());
    const end = fireEvent.keyDown(inside, { key: "End" });
    expect(end).toBe(true);
    expect(document.activeElement).toBe(inside);
  });
});
