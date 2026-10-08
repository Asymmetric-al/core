"use client";

import { Check, ChevronsUpDown, Search, X } from "lucide-react";
import { useMemo, useRef, type Ref } from "react";

import { cn } from "../../../../lib/utils";
import { Badge } from "../../badge";
import { Button } from "../../button";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxItemIndicator,
  ComboboxList,
  ComboboxTrigger,
  createComboboxItems,
} from "../../combobox";
import { InputGroup, InputGroupAddon } from "../../input-group";

import type {
  FilterFieldDefinition,
  FilterOperator,
  FilterOption,
  FilterValue,
} from "./types";

interface FilterSelectInputProps {
  field: FilterFieldDefinition;
  operator: FilterOperator;
  value: FilterValue;
  onChange: (value: FilterValue) => void;
  className?: string;
}

function useFilterItems(field: FilterFieldDefinition) {
  return useMemo(
    () =>
      createComboboxItems(field.options ?? [], {
        getValue: (option) => option.value,
        getLabel: (option) => option.label,
      }),
    [field.options],
  );
}

function matchesFilterOption(option: FilterOption, query: string) {
  const search = query.trim().toLocaleLowerCase();
  return (
    option.label.toLocaleLowerCase().includes(search) ||
    option.value.toLocaleLowerCase().includes(search)
  );
}

function FilterSearch({
  label,
  inputRef,
}: {
  label: string;
  inputRef?: Ref<HTMLInputElement>;
}) {
  return (
    <div className="m-2 mb-0">
      <InputGroup>
        <InputGroupAddon>
          <Search className="text-muted-foreground/60" />
        </InputGroupAddon>
        <ComboboxInput
          ref={inputRef}
          aria-label={`Search ${label}`}
          placeholder="Search..."
        />
      </InputGroup>
    </div>
  );
}

function FilterOptions({ multiple = false }: { multiple?: boolean }) {
  return (
    <>
      <ComboboxEmpty>No options found.</ComboboxEmpty>
      <ComboboxList>
        {(option: FilterOption) => (
          <ComboboxItem key={option.value} value={option.value}>
            <span
              className={cn(
                "flex size-4 shrink-0 items-center justify-center",
                multiple &&
                  "rounded-full border border-border/70 bg-background in-data-selected:border-primary in-data-selected:bg-primary in-data-selected:text-primary-foreground",
              )}
            >
              <ComboboxItemIndicator>
                <Check className={multiple ? "size-3" : "size-4"} />
              </ComboboxItemIndicator>
            </span>
            {option.icon && (
              <option.icon className="size-4 text-muted-foreground" />
            )}
            <span>{option.label}</span>
            {option.count !== undefined && (
              <span className="ml-auto min-w-6 text-right font-mono text-xs font-medium text-muted-foreground/80">
                {option.count}
              </span>
            )}
          </ComboboxItem>
        )}
      </ComboboxList>
    </>
  );
}

export function FilterSelectInput({
  field,
  value,
  onChange,
  className,
}: FilterSelectInputProps) {
  const items = useFilterItems(field);
  const selectedOption = field.options?.find(
    (option) => option.value === value,
  );

  return (
    <Combobox
      items={items}
      value={typeof value === "string" ? value : null}
      onValueChange={(nextValue) =>
        onChange(nextValue === value ? "" : (nextValue ?? ""))
      }
      filter={matchesFilterOption}
    >
      <ComboboxTrigger
        aria-label={field.label}
        render={<Button variant="outline" />}
        className={className}
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
      </ComboboxTrigger>
      <ComboboxContent aria-label={field.label} sideOffset={8}>
        <FilterSearch label={field.label} />
        <FilterOptions />
      </ComboboxContent>
    </Combobox>
  );
}

export function FilterMultiSelectInput({
  field,
  value,
  onChange,
  className,
}: FilterSelectInputProps) {
  const items = useFilterItems(field);
  const anchorRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const selectedValues = Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
  const selectedValueSet = new Set(selectedValues);
  const selectedOptions =
    field.options?.filter((option) => selectedValueSet.has(option.value)) ?? [];

  return (
    <Combobox
      multiple
      items={items}
      value={selectedValues}
      onValueChange={onChange}
      filter={matchesFilterOption}
      onInputValueChange={(_query, details) => {
        if (details.isItemPress) details.cancel();
      }}
    >
      <div
        ref={anchorRef}
        className={cn(
          "flex min-h-9 w-60 items-center gap-1 rounded-xl border border-border/70 bg-background px-3 text-sm font-normal hover:bg-muted/40 has-aria-expanded:border-border has-aria-expanded:bg-muted/50",
          className,
        )}
      >
        {selectedOptions.length > 0 && selectedOptions.length <= 2 && (
          <div className="flex flex-wrap gap-1 py-0.5">
            {selectedOptions.map((option) => (
              <Badge key={option.value} variant="secondary">
                {option.label}
                <Button
                  variant="ghost"
                  size="icon-xs"
                  aria-label={`Remove ${option.label}`}
                  onClick={() => {
                    onChange(
                      selectedValues.filter(
                        (selected) => selected !== option.value,
                      ),
                    );
                    triggerRef.current?.focus();
                  }}
                  className="ml-1"
                >
                  <X className="size-3" />
                </Button>
              </Badge>
            ))}
          </div>
        )}
        <ComboboxTrigger
          ref={triggerRef}
          aria-label={field.label}
          render={<Button variant="ghost" size="sm" className="grow" />}
        >
          {selectedOptions.length > 2 ? (
            <Badge variant="secondary">{selectedOptions.length} selected</Badge>
          ) : !selectedOptions.length ? (
            <span>{field.placeholder ?? "Select options..."}</span>
          ) : null}
          <ChevronsUpDown className="ml-auto size-3.5 shrink-0 opacity-50" />
        </ComboboxTrigger>
      </div>
      <ComboboxContent
        anchor={anchorRef}
        aria-label={field.label}
        sideOffset={8}
      >
        <FilterSearch label={field.label} inputRef={searchInputRef} />
        <FilterOptions multiple />
        {selectedValues.length > 0 && (
          <div className="border-t border-border/60 p-2 pt-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                searchInputRef.current?.focus();
                onChange([]);
              }}
              className="w-full"
            >
              Clear all
            </Button>
          </div>
        )}
      </ComboboxContent>
    </Combobox>
  );
}
