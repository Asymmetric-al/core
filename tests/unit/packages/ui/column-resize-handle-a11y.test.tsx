/** @vitest-environment jsdom */

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ColumnResizeHandle } from "../../../../packages/ui/components/shadcn/data-table/hooks/use-column-resizing";

afterEach(() => {
  cleanup();
});

describe("ColumnResizeHandle keyboard access", () => {
  it("is not a tab stop when no keyboard handler is provided", () => {
    render(<ColumnResizeHandle onResize={vi.fn()} />);

    const handle = screen.getByRole("separator", { name: "Resize column" });
    expect(handle.getAttribute("tabindex")).toBe("-1");
  });

  it("is keyboard-focusable and resizes when a handler is provided", () => {
    const onKeyboardResize = vi.fn();

    render(
      <ColumnResizeHandle
        onResize={vi.fn()}
        onKeyboardResize={onKeyboardResize}
      />,
    );

    const handle = screen.getByRole("separator", { name: "Resize column" });
    expect(handle.getAttribute("tabindex")).toBe("0");

    fireEvent.keyDown(handle, { key: "ArrowRight" });
    fireEvent.keyDown(handle, { key: "ArrowLeft", shiftKey: true });

    expect(onKeyboardResize).toHaveBeenNthCalledWith(1, 10);
    expect(onKeyboardResize).toHaveBeenNthCalledWith(2, -50);
  });
});
