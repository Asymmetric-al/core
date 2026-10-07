/** @vitest-environment jsdom */

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";

import {
  FormField,
  PreviewToggle,
} from "../../../../apps/missionary/app/profile/profile-primitives";
import { Input } from "../../../../packages/ui/components/shadcn/input";
import { Textarea } from "../../../../packages/ui/components/shadcn/textarea";

afterEach(cleanup);

it("associates a profile field's label, help, and validation error with its control", () => {
  const { rerender } = render(
    <FormField label="First name" helperText="Shown to supporters">
      <Input />
    </FormField>,
  );
  const control = screen.getByRole("textbox", { name: "First name" });
  expect(screen.getByLabelText("First name")).toBe(control);
  expect(
    document.getElementById(control.getAttribute("aria-describedby")!)
      ?.textContent,
  ).toBe("Shown to supporters");
  rerender(
    <FormField label="First name" error="Name is too long">
      <Input />
    </FormField>,
  );
  expect(control.getAttribute("aria-invalid")).toBe("true");
  expect(
    document.getElementById(control.getAttribute("aria-errormessage")!)
      ?.textContent,
  ).toBe("Name is too long");
});

it("labels the native textarea through the same shared field relationships", () => {
  render(
    <FormField label="About you" error="Add more detail">
      <Textarea />
    </FormField>,
  );
  const control = screen.getByRole("textbox", { name: "About you" });
  expect(control.getAttribute("aria-invalid")).toBe("true");
  expect(
    document.getElementById(control.getAttribute("aria-describedby")!)
      ?.textContent,
  ).toBe("Add more detail");
});

it("exposes the selected profile preview and preserves the requested mode", () => {
  const onChange = vi.fn();
  const view = render(<PreviewToggle value="mobile" onChange={onChange} />);
  expect(
    screen.getByRole("button", { name: "Mobile preview", pressed: true }),
  ).toBeTruthy();
  fireEvent.click(
    screen.getByRole("button", { name: "Desktop preview", pressed: false }),
  );
  expect(onChange).toHaveBeenCalledWith("desktop");
  view.rerender(<PreviewToggle value="desktop" onChange={onChange} />);
  expect(
    screen.getByRole("button", { name: "Desktop preview", pressed: true }),
  ).toBeTruthy();
});
