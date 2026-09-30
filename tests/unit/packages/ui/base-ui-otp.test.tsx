// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator,
} from "../../../../packages/ui/components/shadcn/input-otp";

beforeEach(() => {
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

function Slots() {
  return (
    <>
      <InputOTPGroup>
        <InputOTPSlot />
        <InputOTPSlot aria-label="Character 2 of 4" />
      </InputOTPGroup>
      <InputOTPSeparator />
      <InputOTPGroup>
        <InputOTPSlot aria-label="Character 3 of 4" />
        <InputOTPSlot aria-label="Character 4 of 4" />
      </InputOTPGroup>
    </>
  );
}

describe("shared Base UI OTP Field", () => {
  it("labels real input slots and submits a normalized pasted code once", () => {
    const completed = vi.fn();
    render(
      <form aria-label="Verification">
        <label htmlFor="code">Verification code</label>
        <InputOTP id="code" name="code" length={4} onValueComplete={completed}>
          <Slots />
        </InputOTP>
      </form>,
    );
    const first = screen.getByRole("textbox", { name: "Verification code" });
    expect(first.getAttribute("autocomplete")).toBe("one-time-code");
    expect(screen.getAllByRole("textbox")).toHaveLength(4);
    fireEvent.paste(first, { clipboardData: { getData: () => "12 34" } });
    expect(first).toHaveProperty("value", "1");
    expect(
      screen.getByRole("textbox", { name: "Character 4 of 4" }),
    ).toHaveProperty("value", "4");
    expect(completed).toHaveBeenCalledOnce();
    expect(completed).toHaveBeenCalledWith(
      "1234",
      expect.objectContaining({ reason: "input-paste" }),
    );
    const form = screen.getByRole("form", { name: "Verification" });
    if (!(form instanceof HTMLFormElement)) throw new Error("Expected form");
    expect(new FormData(form).get("code")).toBe("1234");
  });

  it("supports controlled values, validation, and live completion classes", () => {
    const invalid = vi.fn();
    function ControlledCode() {
      const [value, setValue] = useState("");
      return (
        <InputOTP
          aria-label="Recovery code"
          length={4}
          value={value}
          onValueChange={setValue}
          onValueInvalid={invalid}
          validationType="alphanumeric"
          normalizeValue={(text) => text.toUpperCase()}
          className={(state) => (state.complete ? "complete" : "incomplete")}
        >
          <Slots />
        </InputOTP>
      );
    }
    const { container } = render(<ControlledCode />);
    const first = screen.getAllByRole("textbox")[0];
    fireEvent.paste(first, { clipboardData: { getData: () => "a!b12" } });
    expect(first).toHaveProperty("value", "A");
    expect(invalid).toHaveBeenCalledOnce();
    expect(
      container
        .querySelector("[data-slot=input-otp]")
        ?.classList.contains("complete"),
    ).toBe(true);
    fireEvent.keyDown(
      screen.getByRole("textbox", { name: "Character 4 of 4" }),
      { key: "Backspace" },
    );
    expect(
      container
        .querySelector("[data-slot=input-otp]")
        ?.classList.contains("incomplete"),
    ).toBe(true);
  });
});
