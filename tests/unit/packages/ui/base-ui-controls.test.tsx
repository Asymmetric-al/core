// @vitest-environment jsdom

import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { createRef } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { useAsymForm } from "../../../../packages/ui/components/primitives/tanstack-form";
import { Button } from "../../../../packages/ui/components/shadcn/button";
import { Checkbox } from "../../../../packages/ui/components/shadcn/checkbox";
import { SelectCell } from "../../../../packages/ui/components/shadcn/data-table/cell-variants/select-cell";
import {
  createDataTableRowModels,
  dataTableFeatures,
  useTable,
} from "../../../../packages/ui/components/shadcn/data-table/tanstack";
import { Meter } from "../../../../packages/ui/components/shadcn/meter";
import { Progress } from "../../../../packages/ui/components/shadcn/progress";
import {
  RadioGroup,
  RadioGroupItem,
} from "../../../../packages/ui/components/shadcn/radio-group";
import { Slider } from "../../../../packages/ui/components/shadcn/slider";
import { Switch } from "../../../../packages/ui/components/shadcn/switch";
import { Toggle } from "../../../../packages/ui/components/shadcn/toggle";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "../../../../packages/ui/components/shadcn/toggle-group";

import type {
  Cell,
  ColumnDef,
} from "../../../../packages/ui/components/shadcn/data-table/tanstack";

afterEach(cleanup);

describe("shared Base UI controls", () => {
  it("preserves state classes, render refs and button handlers", () => {
    const ref = createRef<HTMLButtonElement>();
    const renderedRef = createRef<HTMLButtonElement>();
    const onClick = vi.fn();
    const { rerender } = render(
      <Button
        ref={ref}
        className={(state) =>
          state.disabled ? "button-disabled" : "button-enabled"
        }
        render={<button ref={renderedRef} onClick={onClick} />}
      >
        Save
      </Button>,
    );
    const button = screen.getByRole("button", { name: "Save" });
    expect(button.className).toContain("button-enabled");
    expect(ref.current).toBe(button);
    expect(renderedRef.current).toBe(button);
    fireEvent.click(button);
    expect(onClick).toHaveBeenCalledOnce();
    rerender(
      <Button
        disabled
        className={(state) =>
          state.disabled ? "button-disabled" : "button-enabled"
        }
      >
        Save
      </Button>,
    );
    expect(button.className).toContain("button-disabled");
  });

  it("updates checkbox, switch, radio and toggle callback classes with their state", () => {
    render(
      <>
        <Checkbox
          aria-label="Consent"
          className={(state) => (state.checked ? "checked" : "unchecked")}
        />
        <Switch
          aria-label="Alerts"
          className={(state) => (state.checked ? "checked" : "unchecked")}
        />
        <RadioGroup
          aria-label="Plan"
          defaultValue="basic"
          className={() => "radio-root"}
        >
          <RadioGroupItem
            aria-label="Basic"
            value="basic"
            className={(state) => (state.checked ? "checked" : "unchecked")}
          />
          <RadioGroupItem
            aria-label="Premium"
            value="premium"
            className={(state) => (state.checked ? "checked" : "unchecked")}
          />
        </RadioGroup>
        <Toggle
          aria-label="Bold"
          className={(state) => (state.pressed ? "pressed" : "released")}
        >
          B
        </Toggle>
        <ToggleGroup aria-label="Alignment" className={() => "toggle-root"}>
          <ToggleGroupItem
            value="left"
            className={(state) => (state.pressed ? "pressed" : "released")}
          >
            Left
          </ToggleGroupItem>
        </ToggleGroup>
      </>,
    );
    for (const [role, name] of [
      ["checkbox", "Consent"],
      ["switch", "Alerts"],
      ["radio", "Premium"],
    ] as const) {
      const control = screen.getByRole(role, { name });
      expect(control.classList.contains("unchecked")).toBe(true);
      fireEvent.click(control);
      expect(control.classList.contains("checked")).toBe(true);
      expect(control.getAttribute("aria-checked")).toBe("true");
    }
    expect(screen.getByRole("radiogroup").className).toContain("radio-root");
    for (const name of ["Bold", "Left"]) {
      const control = screen.getByRole("button", { name });
      expect(control.className).toContain("released");
      fireEvent.click(control);
      expect(control.className).toContain("pressed");
    }
    expect(
      screen.getByRole("group", { name: "Alignment" }).className,
    ).toContain("toggle-root");
  });

  it("lets a controlled scalar override an array default, including zero", () => {
    render(
      <Slider
        value={0}
        defaultValue={[10, 80]}
        thumbProps={{ "aria-label": "Volume" }}
      />,
    );
    expect(screen.getAllByRole("slider")).toHaveLength(1);
    expect(
      screen
        .getByRole("slider", { name: "Volume" })
        .getAttribute("aria-valuenow"),
    ).toBe("0");
  });

  it("uses one thumb for scalar values and forwards individual range labels and value text", () => {
    const { rerender } = render(
      <Slider defaultValue={20} thumbProps={{ "aria-label": "Volume" }} />,
    );
    expect(screen.getAllByRole("slider")).toHaveLength(1);
    expect(
      screen
        .getByRole("slider", { name: "Volume" })
        .getAttribute("aria-valuenow"),
    ).toBe("20");
    rerender(
      <Slider
        key="range"
        value={[10, 80]}
        thumbProps={(index) => ({
          "aria-label": index === 0 ? "Minimum" : "Maximum",
          getAriaValueText: (_formatted, value) => `${value} dollars`,
        })}
      />,
    );
    expect(screen.getAllByRole("slider")).toHaveLength(2);
    expect(
      screen
        .getByRole("slider", { name: "Minimum" })
        .getAttribute("aria-valuetext"),
    ).toBe("10 dollars");
    expect(
      screen
        .getByRole("slider", { name: "Maximum" })
        .getAttribute("aria-valuetext"),
    ).toBe("80 dollars");
  });

  it("merges state styles with the toggle group's spacing variable", () => {
    render(
      <ToggleGroup
        aria-label="Formatting"
        spacing={2}
        style={() => ({ color: "red" })}
      >
        <ToggleGroupItem value="bold">Bold</ToggleGroupItem>
      </ToggleGroup>,
    );
    const group = screen.getByRole("group", { name: "Formatting" });
    expect(group.style.getPropertyValue("--gap")).toBe("2");
    expect(group.style.color).toBe("red");
  });

  it("retains determinate and indeterminate progress semantics and state classes", () => {
    const { rerender } = render(
      <Progress
        aria-label="Upload"
        value={30}
        className={(state) => state.status}
      />,
    );
    expect(screen.getByRole("progressbar").className).toContain("progressing");
    expect(screen.getByRole("progressbar").getAttribute("aria-valuenow")).toBe(
      "30",
    );
    rerender(
      <Progress
        aria-label="Upload"
        value={null}
        className={(state) => state.status}
      />,
    );
    expect(screen.getByRole("progressbar").className).toContain(
      "indeterminate",
    );
    expect(screen.getByRole("progressbar").hasAttribute("aria-valuenow")).toBe(
      false,
    );
  });

  it("exposes a named bounded measurement separately from task completion", () => {
    render(
      <Meter
        aria-label="Seats occupied"
        min={0}
        max={20}
        value={7}
        className={() => "measurement"}
      />,
    );
    const meter = screen.getByRole("meter", { name: "Seats occupied" });
    expect(meter.getAttribute("aria-valuenow")).toBe("7");
    expect(meter.getAttribute("aria-valuemax")).toBe("20");
    expect(meter.className).toContain("measurement");
    expect(screen.queryByRole("progressbar")).toBeNull();
  });

  it("keeps a select cell's clear action outside its trigger and independently accessible", () => {
    const onValueChange = vi.fn();
    render(<SelectCellFixture onValueChange={onValueChange} />);
    const trigger = screen.getByRole("combobox", { name: "Plan" });
    const clear = screen.getByRole("button", { name: "Clear Plan" });
    expect(trigger.contains(clear)).toBe(false);
    fireEvent.click(clear);
    expect(onValueChange).toHaveBeenCalledWith(null);
    expect(screen.queryByRole("listbox")).toBeNull();
  });
});

type PlanRow = { plan: string | null };
const planColumns: ColumnDef<PlanRow>[] = [
  { accessorKey: "plan", meta: { label: "Plan" } },
];
const planData: PlanRow[] = [{ plan: "p" }];
function SelectCellFixture({
  onValueChange,
}: {
  onValueChange: (value: string | null) => void;
}) {
  const table = useTable({
    features: dataTableFeatures,
    rowModels: createDataTableRowModels<PlanRow>(),
    data: planData,
    columns: planColumns,
  });
  const row = table.getRowModel().rows[0]!;
  const cell = row.getAllCells()[0]! as Cell<PlanRow, string | null>;
  return (
    <SelectCell
      value="p"
      row={row}
      cell={cell}
      isEditing
      clearable
      options={[{ value: "p", label: "Premium" }]}
      onValueChange={onValueChange}
    />
  );
}

function Fields() {
  const form = useAsymForm({
    defaultValues: {
      title: "",
      notes: "",
      amount: 5,
      plan: "p",
      alerts: false,
    },
  });
  return (
    <form onSubmit={(event) => event.preventDefault()}>
      <form.AppField
        name="title"
        validators={{
          onBlur: ({ value }) => (value ? undefined : "Title is required"),
        }}
      >
        {(field) => (
          <field.TextField label="Title" description="Shown publicly" />
        )}
      </form.AppField>
      <form.AppField name="notes">
        {(field) => (
          <field.TextareaField label="Notes" description="Extra context" />
        )}
      </form.AppField>
      <form.AppField name="amount">
        {(field) => <field.NumberField label="Amount" />}
      </form.AppField>
      <form.AppField name="plan">
        {(field) => (
          <field.SelectField
            label="Plan"
            options={[{ value: "p", label: "Premium plan" }]}
          />
        )}
      </form.AppField>
      <form.AppField name="alerts">
        {(field) => <field.SwitchField label="Alerts" />}
      </form.AppField>
    </form>
  );
}

function NumberForm({ allowEmpty = false }: { allowEmpty?: boolean }) {
  const form = useAsymForm({
    defaultValues: { amount: 5 as number | undefined },
  });
  return (
    <form>
      <form.AppField name="amount">
        {(field) => (
          <field.NumberField
            label="Amount"
            allowEmpty={allowEmpty}
            min={0}
            max={10}
          />
        )}
      </form.AppField>
      <form.Subscribe selector={(state) => state.values.amount}>
        {(value) => (
          <output aria-label="Stored amount">
            {value === undefined ? "empty" : String(value)}
          </output>
        )}
      </form.Subscribe>
    </form>
  );
}

function SubmissionForm({ onSubmit }: { onSubmit: () => Promise<void> }) {
  const form = useAsymForm({ defaultValues: { name: "Conrad" }, onSubmit });
  return (
    <form.AppForm>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          void form.handleSubmit();
        }}
      >
        <form.SubmitButton pendingChildren="Saving">Save</form.SubmitButton>
      </form>
    </form.AppForm>
  );
}

describe("TanStack Base UI field integration", () => {
  it("keeps the submitting button focusable with an explicitly associated changing name and blocks duplicate activation", async () => {
    const onSubmit = vi.fn(() => new Promise<void>(() => {}));
    render(<SubmissionForm onSubmit={onSubmit} />);
    const button = screen.getByRole("button", { name: "Save" });
    button.focus();
    fireEvent.click(button);
    const saving = await screen.findByRole("button", { name: "Saving" });
    expect(saving.getAttribute("aria-disabled")).toBe("true");
    expect(saving.hasAttribute("disabled")).toBe(false);
    expect(saving.getAttribute("aria-labelledby")).toBeTruthy();
    expect(document.activeElement).toBe(saving);
    fireEvent.click(saving);
    expect(onSubmit).toHaveBeenCalledOnce();
  });

  it("restores a required number after an empty edit and retains precise or out-of-range typed values for validation", () => {
    render(<NumberForm />);
    const input = screen.getByLabelText("Amount");
    fireEvent.change(input, { target: { value: "" } });
    expect(screen.getByLabelText("Stored amount").textContent).toBe("5");
    fireEvent.blur(input);
    expect((input as HTMLInputElement).value).toBe("5");
    fireEvent.change(input, { target: { value: "12.1234567" } });
    fireEvent.blur(input);
    expect(screen.getByLabelText("Stored amount").textContent).toBe(
      "12.1234567",
    );
    expect((input as HTMLInputElement).value).toBe("12.1234567");
  });

  it("keeps optional number fields empty after blur", () => {
    render(<NumberForm allowEmpty />);
    const input = screen.getByLabelText("Amount");
    fireEvent.change(input, { target: { value: "" } });
    fireEvent.blur(input);
    expect(screen.getByLabelText("Stored amount").textContent).toBe("empty");
    expect((input as HTMLInputElement).value).toBe("");
  });

  it("connects all control labels, descriptions and TanStack validation errors", async () => {
    render(<Fields />);
    const title = screen.getByRole("textbox", { name: "Title" });
    expect(screen.getByRole("textbox", { name: "Notes" })).toBeTruthy();
    expect(screen.getByLabelText("Amount")).toBeTruthy();
    const select = screen.getByRole("combobox", { name: /Plan/ });
    expect(select.textContent).toContain("Premium plan");
    expect(screen.getByRole("switch", { name: "Alerts" })).toBeTruthy();
    expect(
      title
        .getAttribute("aria-describedby")
        ?.split(" ")
        .map((id) => document.getElementById(id)?.textContent)
        .join(" "),
    ).toContain("Shown publicly");
    fireEvent.blur(title);
    await waitFor(() =>
      expect(title.getAttribute("aria-invalid")).toBe("true"),
    );
    const errorId = title.getAttribute("aria-errormessage");
    expect(errorId).toBeTruthy();
    expect(document.getElementById(errorId!)?.textContent).toBe(
      "Title is required",
    );
    expect(title.getAttribute("aria-describedby")?.split(" ")).toContain(
      errorId,
    );
    fireEvent.change(title, { target: { value: "New title" } });
    fireEvent.blur(title);
    await waitFor(() =>
      expect(title.getAttribute("aria-invalid")).toBe("false"),
    );
    expect(screen.queryByText("Title is required")).toBeNull();
  });
});
