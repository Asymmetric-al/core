"use client";

import { useCallback, useMemo } from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@asym/ui/lib/utils";
import { Input } from "../../input";
import { Button } from "../../button";
import { Calendar } from "../../calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../popover";
import type {
  FilterFieldDefinition,
  FilterOperator,
  FilterValue,
} from "./types";

interface FilterValueInputProps {
  field: FilterFieldDefinition;
  operator: FilterOperator;
  value: FilterValue;
  onChange: (value: FilterValue) => void;
  className?: string;
}

export function FilterTextInput({
  field,
  value,
  onChange,
  className,
}: FilterValueInputProps) {
  return (
    <Input
      type="text"
      value={(value as string) ?? ""}
      onChange={(e) => onChange(e.target.value)}
      placeholder={field.placeholder ?? `Enter ${field.label.toLowerCase()}...`}
      className={cn("h-8 text-sm", className)}
    />
  );
}

export function FilterNumberInput({
  field,
  operator,
  value,
  onChange,
  className,
}: FilterValueInputProps) {
  const isBetween = operator === "between";

  if (isBetween) {
    const rangeValue = value as {
      min: number | null;
      max: number | null;
    } | null;
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <Input
          type="number"
          value={rangeValue?.min ?? ""}
          onChange={(e) =>
            onChange({
              min: e.target.value ? Number(e.target.value) : null,
              max: rangeValue?.max ?? null,
            })
          }
          placeholder="Min"
          min={field.min}
          max={field.max}
          step={field.step}
          className="h-8 text-sm w-24"
        />
        <span className="text-sm text-muted-foreground">and</span>
        <Input
          type="number"
          value={rangeValue?.max ?? ""}
          onChange={(e) =>
            onChange({
              min: rangeValue?.min ?? null,
              max: e.target.value ? Number(e.target.value) : null,
            })
          }
          placeholder="Max"
          min={field.min}
          max={field.max}
          step={field.step}
          className="h-8 text-sm w-24"
        />
      </div>
    );
  }

  return (
    <Input
      type="number"
      value={(value as number) ?? ""}
      onChange={(e) => onChange(e.target.value ? Number(e.target.value) : null)}
      placeholder={field.placeholder ?? "Enter number..."}
      min={field.min}
      max={field.max}
      step={field.step}
      className={cn("h-8 text-sm", className)}
    />
  );
}

export function FilterCurrencyInput({
  field,
  operator,
  value,
  onChange,
  className,
}: FilterValueInputProps) {
  const isBetween = operator === "between";
  const currency = field.currency ?? "USD";
  const symbol = currency === "USD" ? "$" : currency;

  if (isBetween) {
    const rangeValue = value as {
      min: number | null;
      max: number | null;
    } | null;
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <div className="relative">
          <span className="absolute left-2 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
            {symbol}
          </span>
          <Input
            type="number"
            value={rangeValue?.min ?? ""}
            onChange={(e) =>
              onChange({
                min: e.target.value ? Number(e.target.value) : null,
                max: rangeValue?.max ?? null,
              })
            }
            placeholder="0.00"
            min={0}
            step={0.01}
            className="h-8 text-sm w-28 pl-6"
          />
        </div>
        <span className="text-sm text-muted-foreground">and</span>
        <div className="relative">
          <span className="absolute left-2 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
            {symbol}
          </span>
          <Input
            type="number"
            value={rangeValue?.max ?? ""}
            onChange={(e) =>
              onChange({
                min: rangeValue?.min ?? null,
                max: e.target.value ? Number(e.target.value) : null,
              })
            }
            placeholder="0.00"
            min={0}
            step={0.01}
            className="h-8 text-sm w-28 pl-6"
          />
        </div>
      </div>
    );
  }

  return (
    <div className={cn("relative", className)}>
      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
        {symbol}
      </span>
      <Input
        type="number"
        value={(value as number) ?? ""}
        onChange={(e) =>
          onChange(e.target.value ? Number(e.target.value) : null)
        }
        placeholder="0.00"
        min={0}
        step={0.01}
        className="h-8 text-sm pl-6"
      />
    </div>
  );
}

export function FilterDateInput({
  field,
  operator,
  value,
  onChange,
  className,
}: FilterValueInputProps) {
  const isBetween = operator === "between";

  if (isBetween) {
    const rangeValue = value as { from: Date | null; to: Date | null } | null;
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <DatePickerButton
          value={rangeValue?.from ?? null}
          onChange={(date) =>
            onChange({
              from: date,
              to: rangeValue?.to ?? null,
            })
          }
          placeholder="Start date"
        />
        <span className="text-sm text-muted-foreground">to</span>
        <DatePickerButton
          value={rangeValue?.to ?? null}
          onChange={(date) =>
            onChange({
              from: rangeValue?.from ?? null,
              to: date,
            })
          }
          placeholder="End date"
        />
      </div>
    );
  }

  return (
    <DatePickerButton
      value={value instanceof Date ? value : null}
      onChange={onChange}
      placeholder={field.placeholder ?? "Select date..."}
      className={className}
    />
  );
}

interface DatePickerButtonProps {
  value: Date | null;
  onChange: (date: Date | null) => void;
  placeholder?: string;
  className?: string;
}

function DatePickerButton({
  value,
  onChange,
  placeholder = "Select date",
  className,
}: DatePickerButtonProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "h-8 w-[160px] justify-start px-2 text-left text-sm font-normal",
            !value && "text-muted-foreground",
            className,
          )}
        >
          <CalendarIcon className="mr-2 size-3.5" />
          {value ? format(value, "MMM d, yyyy") : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={value ?? undefined}
          onSelect={(date) => onChange(date ?? null)}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}
