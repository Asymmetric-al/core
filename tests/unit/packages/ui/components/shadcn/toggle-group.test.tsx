// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  ToggleGroup,
  ToggleGroupItem,
} from "../../../../../../packages/ui/components/shadcn/toggle-group";

afterEach(() => {
  cleanup();
});

describe("ToggleGroup", () => {
  it("routes item presses through the group value callback", () => {
    const onValueChange = vi.fn();

    render(
      <ToggleGroup value={["desktop"]} onValueChange={onValueChange}>
        <ToggleGroupItem value="desktop">Desktop</ToggleGroupItem>
        <ToggleGroupItem value="mobile">Mobile</ToggleGroupItem>
      </ToggleGroup>,
    );

    expect(
      screen
        .getByRole("button", { name: "Desktop" })
        .getAttribute("data-pressed"),
    ).toBe("");
    expect(
      screen
        .getByRole("button", { name: "Mobile" })
        .getAttribute("data-pressed"),
    ).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "Mobile" }));

    expect(onValueChange).toHaveBeenCalledWith(["mobile"], expect.any(Object));
  });
});
