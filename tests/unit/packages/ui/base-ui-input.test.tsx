// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { createRef, useState } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { Input } from "../../../../packages/ui/components/shadcn/input";
import {
  InputGroup,
  InputGroupInput,
  InputGroupButton,
} from "../../../../packages/ui/components/shadcn/input-group";

afterEach(cleanup);

describe("shared Base UI Input", () => {
  it("preserves state callbacks through input-group adapters", () => {
    render(
      <InputGroup>
        <InputGroupInput
          aria-label="Grouped name"
          disabled
          className={(state) => (state.disabled ? "group-input-disabled" : "")}
        />
        <InputGroupButton
          disabled
          className={(state) => (state.disabled ? "group-button-disabled" : "")}
        >
          Submit name
        </InputGroupButton>
      </InputGroup>,
    );
    expect(
      screen.getByRole("textbox", { name: "Grouped name" }).className,
    ).toContain("group-input-disabled");
    expect(
      screen.getByRole("button", { name: "Submit name" }).className,
    ).toContain("group-button-disabled");
  });
  it("preserves native onChange and controlled Base UI onValueChange", () => {
    const changed = vi.fn();
    function FormInput() {
      const [value, setValue] = useState("");
      return (
        <Input
          aria-label="Name"
          value={value}
          onValueChange={setValue}
          onChange={changed}
        />
      );
    }
    render(<FormInput />);
    const input = screen.getByRole("textbox", { name: "Name" });
    fireEvent.change(input, { target: { value: "Conrad" } });
    expect(input).toHaveProperty("value", "Conrad");
    expect(changed).toHaveBeenCalledOnce();
  });

  it("preserves state classes, render composition, and both input refs", () => {
    const ref = createRef<HTMLInputElement>();
    const renderedRef = createRef<HTMLInputElement>();
    render(
      <Input
        aria-label="Disabled name"
        disabled
        ref={ref}
        className={(state) =>
          state.disabled ? "consumer-disabled" : "consumer-enabled"
        }
        render={<input ref={renderedRef} data-composed="true" />}
      />,
    );
    const input = screen.getByRole("textbox", { name: "Disabled name" });
    expect(input.className).toContain("consumer-disabled");
    expect(input.className).toContain("rounded-md");
    expect(input.getAttribute("data-composed")).toBe("true");
    expect(ref.current).toBe(input);
    expect(renderedRef.current).toBe(input);
    expect(input).toHaveProperty("disabled", true);
  });
});
