/** @vitest-environment jsdom */

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import {
  IMAGE_RESIZE_MIN_PX,
  ImageResizeHandle,
  resolveImageResizeAriaValues,
} from "../../../../packages/ui/components/shadcn/rich-text-editor/image-view";

afterEach(() => {
  cleanup();
});

describe("image resize aria values", () => {
  it("clamps the current value between the functional min and max", () => {
    expect(
      resolveImageResizeAriaValues({
        currentWidthPx: 240,
        maxWidthPx: 800,
      }),
    ).toEqual({
      min: IMAGE_RESIZE_MIN_PX,
      max: 800,
      now: 240,
    });

    expect(
      resolveImageResizeAriaValues({
        currentWidthPx: 40,
        maxWidthPx: Number.POSITIVE_INFINITY,
      }),
    ).toMatchObject({
      min: IMAGE_RESIZE_MIN_PX,
      now: IMAGE_RESIZE_MIN_PX,
    });
  });

  it("exposes bounds and the current value on a focusable separator", () => {
    render(
      <ImageResizeHandle
        side="right"
        ariaValues={{ min: 150, max: 800, now: 240 }}
        onResizeKeyDown={() => undefined}
        onMouseDown={() => undefined}
        onTouchStart={() => undefined}
      />,
    );

    const handle = screen.getByRole("separator", {
      name: "Resize image from the right",
    });

    expect(handle.getAttribute("aria-valuemin")).toBe("150");
    expect(handle.getAttribute("aria-valuemax")).toBe("800");
    expect(handle.getAttribute("aria-valuenow")).toBe("240");
    expect(handle.getAttribute("tabindex")).toBe("0");
    expect(handle.className).toMatch(/focus-visible/);
  });
});
