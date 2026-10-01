import React, { useRef, useState } from "react";

import { useAsymForm } from "../../../packages/ui/components/primitives/tanstack-form";
import { Button } from "../../../packages/ui/components/shadcn/button";
import { Checkbox } from "../../../packages/ui/components/shadcn/checkbox";
import { Meter } from "../../../packages/ui/components/shadcn/meter";
import { Progress } from "../../../packages/ui/components/shadcn/progress";
import {
  RadioGroup,
  RadioGroupItem,
} from "../../../packages/ui/components/shadcn/radio-group";
import { SearchableSelect } from "../../../packages/ui/components/shadcn/searchable-select";
import { Slider } from "../../../packages/ui/components/shadcn/slider";
import { Switch } from "../../../packages/ui/components/shadcn/switch";

const records = Array.from({ length: 200 }, (_, index) => ({
  value: `tenant-${index}`,
  label:
    index === 20 || index === 21 ? "Shared tenant name" : `Tenant ${index}`,
  disabled: index === 199,
}));

// Load the real application composition only inside this isolated browser fixture.
const { SettingsRow } =
  await import("../../../apps/admin/features/support-hub/components/settings/SettingsRow");

export function ControlsContracts() {
  const finishSave = useRef<(() => void) | null>(null);
  const [tenant, setTenant] = useState<string | null>("tenant-20");
  const [range, setRange] = useState([10, 80]);
  const [saved, setSaved] = useState("");
  const form = useAsymForm({
    defaultValues: {
      name: "",
      amount: 5 as number | undefined,
      optional: 8 as number | undefined,
      notes: "",
      plan: "p",
      alerts: false,
      locked: "Read only",
    },
    onSubmit: async ({ value }) => {
      await new Promise<void>((resolve) => {
        finishSave.current = resolve;
      });
      setSaved(JSON.stringify(value));
    },
  });
  return (
    <section
      id="controls-contracts"
      className="mt-12 grid gap-6 rounded-xl border p-6"
      style={{ maxWidth: 720 }}
    >
      <h2 className="text-xl font-semibold">Controls and forms contracts</h2>
      <SettingsRow
        control
        label="Tenant directory"
        description="Choose from all 200 tenant records."
      >
        <SearchableSelect
          aria-label="Tenant directory"
          items={records}
          value={tenant}
          onValueChange={setTenant}
        />
      </SettingsRow>
      <output aria-label="Selected tenant ID">{tenant}</output>
      <div className="grid gap-4">
        <Slider
          defaultValue={20}
          thumbProps={{
            "aria-label": "Contract volume",
            getAriaValueText: (_formatted, value) => `${value} percent`,
          }}
          className={(state) =>
            state.values[0]! > 20 ? "slider-changed" : "slider-original"
          }
        />
        <Slider
          value={range}
          onValueChange={(next) => {
            if (Array.isArray(next)) setRange(next);
          }}
          thumbProps={(index) => ({
            "aria-label": index === 0 ? "Contract minimum" : "Contract maximum",
            getAriaValueText: (_formatted, value) => `${value} dollars`,
          })}
        />
        <output aria-label="Contract range">{range.join(",")}</output>
      </div>
      <Meter aria-label="Capacity used" min={0} max={20} value={7} />
      <Progress aria-label="Training progress" value={40} />
      <Progress aria-label="Loading records" value={null} />
      <div className="flex flex-wrap gap-4">
        <label className="flex items-center gap-2">
          <Checkbox
            className={(state) =>
              state.checked ? "contract-checked" : "contract-unchecked"
            }
          />
          Contract consent
        </label>
        <label className="flex items-center gap-2">
          <Switch
            className={(state) =>
              state.checked ? "contract-on" : "contract-off"
            }
          />
          Contract feature
        </label>
      </div>
      <RadioGroup
        aria-label="Contract delivery"
        defaultValue="email"
        className="flex flex-wrap gap-4"
      >
        <label className="flex items-center gap-2">
          <RadioGroupItem value="email" />
          Contract email
        </label>
        <label className="flex items-center gap-2">
          <RadioGroupItem value="paper" />
          Contract paper
        </label>
      </RadioGroup>
      <form.AppForm>
        <form
          aria-label="Contract form"
          className="grid gap-4"
          onSubmit={(event) => {
            event.preventDefault();
            void form.handleSubmit();
          }}
        >
          <form.AppField
            name="name"
            validators={{
              onBlur: ({ value }) =>
                value ? undefined : "Contract name is required",
            }}
          >
            {(field) => (
              <field.TextField
                label="Contract name"
                description="Visible to donors"
              />
            )}
          </form.AppField>
          <form.AppField name="amount">
            {(field) => (
              <field.NumberField label="Contract amount" min={0} max={10} />
            )}
          </form.AppField>
          <form.AppField name="optional">
            {(field) => (
              <field.NumberField label="Contract optional amount" allowEmpty />
            )}
          </form.AppField>
          <form.AppField name="notes">
            {(field) => (
              <field.TextareaField
                label="Contract notes"
                description="Additional context"
              />
            )}
          </form.AppField>
          <form.AppField name="plan">
            {(field) => (
              <field.SelectField
                label="Contract plan"
                options={[
                  { value: "p", label: "Premium plan" },
                  { value: "b", label: "Basic plan" },
                ]}
              />
            )}
          </form.AppField>
          <form.AppField name="alerts">
            {(field) => (
              <field.SwitchField
                label="Contract alerts"
                description="Receive updates"
              />
            )}
          </form.AppField>
          <form.AppField name="locked">
            {(field) => (
              <field.TextField label="Contract locked field" disabled />
            )}
          </form.AppField>
          <form.SubmitButton pendingChildren="Saving contract">
            Save contract
          </form.SubmitButton>
        </form>
      </form.AppForm>
      <output className="break-all" aria-label="Saved contract">
        {saved || "Not saved"}
      </output>
      <Button onClick={() => finishSave.current?.()}>
        Complete fixture save
      </Button>
      <Button>After controls</Button>
    </section>
  );
}
