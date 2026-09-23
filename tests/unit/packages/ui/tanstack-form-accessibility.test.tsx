/** @vitest-environment jsdom */

import React from "react";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { useAsymForm } from "@asym/ui/components/shadcn/tanstack-form";

function FormExample() {
  const form = useAsymForm({
    defaultValues: {
      name: "",
      amount: 1,
      notes: "",
      frequency: "monthly",
      enabled: false,
    },
  });

  return (
    <form.AppForm>
      <form.AppField
        name="name"
        validators={{
          onBlur: ({ value }) => (value ? undefined : "Name is required"),
        }}
      >
        {(field) => (
          <field.TextField
            label="Full name"
            description="Enter your full name"
          />
        )}
      </form.AppField>
      <form.AppField name="amount">
        {(field) => <field.NumberField id="custom-amount" label="Amount" />}
      </form.AppField>
      <form.AppField name="notes">
        {(field) => <field.TextareaField label="Notes" />}
      </form.AppField>
      <form.AppField name="frequency">
        {(field) => (
          <field.SelectField
            label="Frequency"
            options={[
              { value: "monthly", label: "Every month" },
              { value: "once", label: "One time" },
            ]}
          />
        )}
      </form.AppField>
      <form.AppField name="enabled">
        {(field) => <field.SwitchField label="Enabled" />}
      </form.AppField>
    </form.AppForm>
  );
}

afterEach(cleanup);

describe("shared form accessible relationships", () => {
  it.each([
    ["textbox", "Full name"],
    ["spinbutton", "Amount"],
    ["textbox", "Notes"],
    ["combobox", "Frequency"],
    ["switch", "Enabled"],
  ])("labels the %s control %s", (role, name) => {
    render(<FormExample />);
    const control = screen.getByRole(role, { name });
    // Base UI Switch labels both its focusable root and hidden form input.
    expect(screen.getAllByLabelText(name)).toContain(control);
    expect(control.id).not.toBe("");
    if (name === "Amount") expect(control.id).toBe("custom-amount");
  });

  it("links visible validation errors and descriptions, then removes resolved errors", async () => {
    const { container } = render(<FormExample />);
    const input = container.querySelector('input[name="name"]')!;
    fireEvent.blur(input);
    const error = await screen.findByRole("alert");
    expect(error.textContent).toBe("Name is required");
    expect(error.id).toBe(input.getAttribute("aria-errormessage"));
    const descriptionIds = input.getAttribute("aria-describedby")!.split(" ");
    expect(
      descriptionIds.map((id) => document.getElementById(id)?.textContent),
    ).toEqual(["Enter your full name", "Name is required"]);
    expect(input.getAttribute("aria-invalid")).toBe("true");

    fireEvent.change(input, { target: { value: "Blake" } });
    fireEvent.blur(input);
    await waitFor(() => expect(screen.queryByRole("alert")).toBeNull());
    expect(input.hasAttribute("aria-errormessage")).toBe(false);
    expect(input.getAttribute("aria-invalid")).toBe("false");
    expect(
      document.getElementById(input.getAttribute("aria-describedby")!)
        ?.textContent,
    ).toBe("Enter your full name");
  });

  it("renders the selected option label before the select first opens", () => {
    render(<FormExample />);
    expect(screen.getByRole("combobox").textContent).toContain("Every month");
  });
});
