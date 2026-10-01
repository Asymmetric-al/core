// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  NumberField,
  NumberFieldGroup,
  NumberFieldInput,
  NumberFieldIncrement,
  NumberFieldDecrement,
} from "../../../../packages/ui/components/shadcn/number-field";

afterEach(cleanup);

describe("shared Base UI Number Field", () => {
  it("steps through decimals and preserves bounded values and form serialization", () => {
    render(
      <form aria-label="Amount form">
        <label htmlFor="amount">Amount</label>
        <NumberField
          id="amount"
          name="amount"
          defaultValue={1.5}
          step={0.5}
          min={1}
          max={2}
        >
          <NumberFieldGroup>
            <NumberFieldDecrement />
            <NumberFieldInput />
            <NumberFieldIncrement />
          </NumberFieldGroup>
        </NumberField>
      </form>,
    );
    const input = screen.getByRole("textbox", { name: "Amount" });
    fireEvent.keyDown(input, { key: "ArrowUp" });
    expect(input).toHaveProperty("value", "2");
    expect(
      screen.getByRole("button", { name: "Increase value" }),
    ).toHaveProperty("disabled", true);
    fireEvent.keyDown(input, { key: "ArrowDown" });
    expect(input).toHaveProperty("value", "1.5");
    const form = screen.getByRole("form", { name: "Amount form" });
    if (!(form instanceof HTMLFormElement)) throw new Error("Expected form");
    expect(new FormData(form).get("amount")).toBe("1.5");
  });

  it("supports empty values and caller state classes without coercing empty to zero", () => {
    const onValueChange = vi.fn();
    render(
      <NumberField defaultValue={12} onValueChange={onValueChange}>
        <NumberFieldInput
          aria-label="Optional amount"
          className={(state) => (state.value === null ? "empty" : "filled")}
        />
      </NumberField>,
    );
    const input = screen.getByRole("textbox", { name: "Optional amount" });
    fireEvent.change(input, { target: { value: "" } });
    expect(input).toHaveProperty("value", "");
    expect(input.className).toContain("empty");
    expect(onValueChange).toHaveBeenLastCalledWith(
      null,
      expect.objectContaining({ reason: "input-clear" }),
    );
  });
});
