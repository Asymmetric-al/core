"use client";
import { FieldError } from "@asym/ui/components/shadcn/field";
import { Input } from "@asym/ui/components/shadcn/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@asym/ui/components/shadcn/select";

import { DURATION_ERROR, type DurationParts } from "../../../lib/duration";

export function DurationField({
  id,
  label,
  value,
  onChange,
  invalid,
}: {
  id: string;
  label: string;
  value: DurationParts;
  onChange: (value: DurationParts) => void;
  invalid: boolean;
}) {
  const units = [
    { value: "minutes", label: "Minutes" },
    { value: "hours", label: "Hours" },
    { value: "days", label: "Days" },
  ] as const;
  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <div className="max-w-32">
          <Input
            id={id}
            type="number"
            min={0}
            step="any"
            value={value.amount}
            aria-label={label + " amount"}
            aria-invalid={invalid}
            aria-describedby={invalid ? id + "-error" : undefined}
            onChange={(event) =>
              onChange({ ...value, amount: event.target.value })
            }
          />
        </div>
        <Select
          items={units}
          value={value.unit}
          onValueChange={(unit) => {
            if (unit) onChange({ ...value, unit });
          }}
        >
          <SelectTrigger aria-label={label + " unit"}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {units.map((unit) => (
              <SelectItem key={unit.value} value={unit.value}>
                {unit.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {invalid ? (
        <FieldError id={id + "-error"}>{DURATION_ERROR}</FieldError>
      ) : null}
    </div>
  );
}
