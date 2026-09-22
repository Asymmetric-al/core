"use client";

import { Check, PlusCircle, Search } from "lucide-react";
import { useMemo } from "react";

import { Badge } from "../badge";
import { Button } from "../button";
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
} from "../combobox";
import { InputGroup, InputGroupAddon } from "../input-group";
import { Separator } from "../separator";

import type { Column, RowData } from "./tanstack";
import type { DataTableFilterOption } from "./types";

interface DataTableFacetedFilterProps<TData extends RowData, TValue> {
  column?: Column<TData, TValue>;
  title?: string;
  options: DataTableFilterOption[];
  disabled?: boolean;
}

export function DataTableFacetedFilter<TData extends RowData, TValue>({
  column,
  title,
  options,
  disabled = false,
}: DataTableFacetedFilterProps<TData, TValue>) {
  const facets = column?.getFacetedUniqueValues();
  const selectedValues = new Set(column?.getFilterValue() as string[]);
  const items = useMemo(
    () =>
      createComboboxItems(options, {
        getValue: (option) => option.value,
        getLabel: (option) => option.label,
      }),
    [options],
  );
  const searchLabel = title
    ? `Search ${title.toLowerCase()}`
    : "Search filters";

  return (
    <Combobox
      multiple
      disabled={disabled}
      items={items}
      value={Array.from(selectedValues)}
      onValueChange={(values) =>
        column?.setFilterValue(values.length ? values : undefined)
      }
      onInputValueChange={(_query, details) => {
        if (details.isItemPress) details.cancel();
      }}
    >
      <ComboboxTrigger
        aria-label={title ?? "Filter"}
        render={<Button variant="outline" size="sm" />}
        className="h-9 rounded-xl border-dashed border-border/70 bg-background px-3 shadow-sm hover:bg-muted/40 aria-expanded:border-border aria-expanded:bg-muted/50"
      >
        <PlusCircle className="mr-2 size-4" />
        {title}
        {selectedValues.size > 0 && (
          <>
            <Separator orientation="vertical" className="mx-2 h-4" />
            <Badge
              variant="secondary"
              className="rounded-lg px-1.5 font-normal lg:hidden"
            >
              {selectedValues.size}
            </Badge>
            <div className="hidden gap-x-1 lg:flex">
              {selectedValues.size > 2 ? (
                <Badge
                  variant="secondary"
                  className="rounded-lg px-1.5 font-normal"
                >
                  {selectedValues.size} selected
                </Badge>
              ) : (
                options
                  .filter((option) => selectedValues.has(option.value))
                  .map((option) => (
                    <Badge
                      variant="secondary"
                      key={option.value}
                      className="rounded-lg px-1.5 font-normal"
                    >
                      {option.label}
                    </Badge>
                  ))
              )}
            </div>
          </>
        )}
      </ComboboxTrigger>
      <ComboboxContent
        aria-label={title ?? "Filter"}
        className="w-56 border border-border/60 p-0 shadow-xl"
        sideOffset={8}
      >
        <InputGroup className="m-2 mb-0 h-10 w-auto rounded-xl border-2 border-border/70 bg-background shadow-none">
          <InputGroupAddon>
            <Search className="text-muted-foreground/60" />
          </InputGroupAddon>
          <ComboboxInput
            aria-label={searchLabel}
            placeholder={`${searchLabel}...`}
            className="text-sm"
          />
        </InputGroup>
        <ComboboxEmpty>No results found.</ComboboxEmpty>
        <ComboboxList className="p-2">
          {(option: DataTableFilterOption) => (
            <ComboboxItem key={option.value} value={option.value}>
              <span className="flex size-4 shrink-0 items-center justify-center rounded-full border border-border/70 bg-background transition-colors in-data-selected:border-primary in-data-selected:bg-primary in-data-selected:text-primary-foreground">
                <ComboboxItemIndicator>
                  <Check className="size-3" />
                </ComboboxItemIndicator>
              </span>
              {option.icon && (
                <option.icon className="size-4 text-muted-foreground" />
              )}
              <span>{option.label}</span>
              {facets?.get(option.value) && (
                <span className="ml-auto min-w-6 text-right font-mono text-[11px] font-medium text-muted-foreground/80">
                  {facets.get(option.value)}
                </span>
              )}
            </ComboboxItem>
          )}
        </ComboboxList>
        {selectedValues.size > 0 && (
          <div className="border-t border-border/60 p-2 pt-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => column?.setFilterValue(undefined)}
              className="h-8 w-full rounded-xl text-sm font-medium"
            >
              Clear filters
            </Button>
          </div>
        )}
      </ComboboxContent>
    </Combobox>
  );
}
