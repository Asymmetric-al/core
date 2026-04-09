"use client";

import { Check, ChevronsUpDown, X } from "lucide-react";
import { useState, useMemo, useCallback, useId } from "react";

import { cn } from "@asym/ui/lib/utils";

import { Badge } from "../../badge";
import { Button } from "../../button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../../command";
import { Popover, PopoverContent, PopoverTrigger } from "../../popover";

import type {
  FilterFieldDefinition,
  FilterOperator,
  FilterValue,
} from "./types";

interface FilterSelectInputProps {
  field: FilterFieldDefinition;
  operator: FilterOperator;
  value: FilterValue;
  onChange: (value: FilterValue) => void;
  className?: string;
}

export function FilterSelectInput({
  field,
  value,
  onChange,
  className,
}: FilterSelectInputProps) {
  const [open, setOpen] = useState(false);
  const listboxId = useId();

  const options = useMemo(() => field.options ?? [], [field.options]);

  const selectedOption = useMemo(() => {
    return options.find((opt) => opt.value === value);
  }, [options, value]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          aria-controls={listboxId}
          className={cn(
            "h-9 w-[180px] justify-between rounded-xl border-border/70 bg-background px-3 text-sm font-normal shadow-sm hover:bg-muted/40 data-[state=open]:border-border data-[state=open]:bg-muted/50",
            !selectedOption && "text-muted-foreground",
            className,
          )}
        >
          <span className="truncate">
            {selectedOption ? (
              <span className="flex items-center gap-2">
                {selectedOption.icon && (
                  <selectedOption.icon className="size-3.5 shrink-0" />
                )}
                {selectedOption.label}
              </span>
            ) : (
              (field.placeholder ?? "Select...")
            )}
          </span>
          <ChevronsUpDown className="ml-2 size-3.5 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[220px] overflow-hidden rounded-2xl border border-border/60 bg-popover p-0 shadow-xl"
        align="start"
        sideOffset={8}
      >
        <Command className="rounded-[inherit] bg-transparent">
          <CommandInput
            placeholder="Search..."
            className="h-full bg-transparent text-sm"
            wrapperClassName="m-2 mb-0 rounded-xl border border-border/70 bg-background px-3 shadow-xs focus-within:border-ring/50 focus-within:ring-2 focus-within:ring-ring/20"
          />
          <CommandList id={listboxId}>
            <CommandEmpty className="py-8 text-xs text-muted-foreground">
              No options found.
            </CommandEmpty>
            <CommandGroup className="p-2">
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  onSelect={() => {
                    onChange(option.value === value ? "" : option.value);
                    setOpen(false);
                  }}
                  className="rounded-xl px-3 py-2.5 text-sm font-medium"
                >
                  <Check
                    className={cn(
                      "mr-2 size-4",
                      value === option.value ? "opacity-100" : "opacity-0",
                    )}
                  />
                  {option.icon && (
                    <option.icon className="mr-2 size-4 text-muted-foreground" />
                  )}
                  <span>{option.label}</span>
                  {option.count !== undefined && (
                    <span className="ml-auto min-w-6 text-right font-mono text-[11px] font-medium text-muted-foreground/80">
                      {option.count}
                    </span>
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

export function FilterMultiSelectInput({
  field,
  value,
  onChange,
  className,
}: FilterSelectInputProps) {
  const [open, setOpen] = useState(false);
  const listboxId = useId();

  const options = useMemo(() => field.options ?? [], [field.options]);
  const selectedValues = useMemo(() => (value as string[]) ?? [], [value]);

  const selectedOptions = useMemo(() => {
    return options.filter((opt) => selectedValues.includes(opt.value));
  }, [options, selectedValues]);

  const toggleOption = useCallback(
    (optionValue: string) => {
      const newValues = selectedValues.includes(optionValue)
        ? selectedValues.filter((v) => v !== optionValue)
        : [...selectedValues, optionValue];
      onChange(newValues);
    },
    [selectedValues, onChange],
  );

  const removeValue = useCallback(
    (optionValue: string, e: React.MouseEvent) => {
      e.stopPropagation();
      onChange(selectedValues.filter((v) => v !== optionValue));
    },
    [selectedValues, onChange],
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          aria-controls={listboxId}
          className={cn(
            "h-auto min-h-9 w-[240px] justify-between rounded-xl border-border/70 bg-background px-3 text-sm font-normal shadow-sm hover:bg-muted/40 data-[state=open]:border-border data-[state=open]:bg-muted/50",
            !selectedOptions.length && "text-muted-foreground",
            className,
          )}
        >
          {selectedOptions.length > 0 ? (
            <div className="flex flex-wrap gap-1 py-0.5">
              {selectedOptions.length <= 2 ? (
                selectedOptions.map((option) => (
                  <Badge
                    key={option.value}
                    variant="secondary"
                    className="rounded-md px-1.5 py-0 text-xs font-normal"
                  >
                    {option.label}
                    <button
                      type="button"
                      onClick={(e) => removeValue(option.value, e)}
                      className="ml-1 rounded-full hover:bg-muted-foreground/20"
                    >
                      <X className="size-3" />
                    </button>
                  </Badge>
                ))
              ) : (
                <Badge
                  variant="secondary"
                  className="rounded-md px-1.5 py-0 text-xs font-normal"
                >
                  {selectedOptions.length} selected
                </Badge>
              )}
            </div>
          ) : (
            <span>{field.placeholder ?? "Select options..."}</span>
          )}
          <ChevronsUpDown className="ml-2 size-3.5 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[260px] overflow-hidden rounded-2xl border border-border/60 bg-popover p-0 shadow-xl"
        align="start"
        sideOffset={8}
      >
        <Command className="rounded-[inherit] bg-transparent">
          <CommandInput
            placeholder="Search..."
            className="h-full bg-transparent text-sm"
            wrapperClassName="m-2 mb-0 rounded-xl border border-border/70 bg-background px-3 shadow-xs focus-within:border-ring/50 focus-within:ring-2 focus-within:ring-ring/20"
          />
          <CommandList id={listboxId}>
            <CommandEmpty className="py-8 text-xs text-muted-foreground">
              No options found.
            </CommandEmpty>
            <CommandGroup className="p-2">
              {options.map((option) => {
                const isSelected = selectedValues.includes(option.value);
                return (
                  <CommandItem
                    key={option.value}
                    value={option.value}
                    onSelect={() => toggleOption(option.value)}
                    className="rounded-xl px-3 py-2.5 text-sm font-medium"
                  >
                    <div
                      className={cn(
                        "mr-2 flex size-4 items-center justify-center rounded-full border border-border/70 transition-colors",
                        isSelected
                          ? "border-primary bg-primary text-primary-foreground"
                          : "bg-background",
                      )}
                    >
                      {isSelected && <Check className="size-3" />}
                    </div>
                    {option.icon && (
                      <option.icon className="mr-2 size-4 text-muted-foreground" />
                    )}
                    <span>{option.label}</span>
                    {option.count !== undefined && (
                      <span className="ml-auto min-w-6 text-right font-mono text-[11px] font-medium text-muted-foreground/80">
                        {option.count}
                      </span>
                    )}
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
        {selectedValues.length > 0 && (
          <div className="border-t border-border/60 p-2 pt-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onChange([])}
              className="h-8 w-full rounded-xl text-xs font-medium"
            >
              Clear all
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
