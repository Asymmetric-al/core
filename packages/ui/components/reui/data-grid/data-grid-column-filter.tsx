"use no memo";

import { CirclePlusIcon, CheckIcon } from "lucide-react";
import { useMemo, useRef, useState } from "react";

import { cn } from "@asym/ui/lib/utils";

import { useDataGrid } from "./data-grid";
import { Badge } from "../../shadcn/badge";
import { Button } from "../../shadcn/button";
import { Input } from "../../shadcn/input";
import { Popover, PopoverContent, PopoverTrigger } from "../../shadcn/popover";
import { Separator } from "../../shadcn/separator";

import type { DataGridFeatures } from "./data-grid";
import type { Column } from "@tanstack/react-table";

// Core: options and Clear are real buttons. These classes undo the shared
// Button's geometry and ring so the rows keep the registry's menu-row look.
const filterRowClassName =
  "relative flex h-auto w-full rounded-xl px-2 py-1.5 font-normal whitespace-normal outline-hidden select-none focus:bg-accent focus:text-accent-foreground focus-visible:ring-0 has-[>svg]:px-2 dark:hover:bg-accent";

interface DataGridColumnFilterProps<TData extends object, TValue> {
  column?: Column<DataGridFeatures, TData, TValue>;
  title?: string;
  options: {
    label: string;
    value: string;
    icon?: React.ComponentType<{ className?: string }>;
  }[];
}

function DataGridColumnFilter<TData extends object, TValue>({
  column,
  title,
  options,
}: DataGridColumnFilterProps<TData, TValue>) {
  const { i18n } = useDataGrid();
  const facets = column?.getFacetedUniqueValues();
  const filterValue = column?.getFilterValue();
  const selectedValues = new Set(
    Array.isArray(filterValue) ? (filterValue as string[]) : [],
  );
  const [searchQuery, setSearchQuery] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);

  const filteredOptions = useMemo(() => {
    if (!searchQuery) return options;
    return options.filter((option) =>
      option.label.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [options, searchQuery]);

  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button variant="outline" size="sm">
            <CirclePlusIcon className="size-4" />
            {title}
            {selectedValues?.size > 0 && (
              <>
                <Separator orientation="vertical" className="mx-2 h-4" />
                <Badge
                  variant="secondary"
                  className="px-1 font-normal lg:hidden"
                >
                  {selectedValues.size}
                </Badge>
                <div className="hidden gap-x-1 lg:flex">
                  {selectedValues.size > 2 ? (
                    <Badge variant="secondary" className="px-1 font-normal">
                      {i18n.labels.filterSelectedCount(selectedValues.size)}
                    </Badge>
                  ) : (
                    options
                      .filter((option) => selectedValues.has(option.value))
                      .map((option) => (
                        <Badge
                          variant="secondary"
                          key={option.value}
                          className="px-1 font-normal"
                        >
                          {option.label}
                        </Badge>
                      ))
                  )}
                </div>
              </>
            )}
          </Button>
        }
      />
      {/* Core: the popover is a dialog, so it is named after its filter,
          and its search box has a real label rather than a bare title. */}
      <PopoverContent
        className="w-[200px] p-0"
        align="start"
        aria-label={title ? `Filter by ${title}` : "Filter"}
      >
        <div className="p-2">
          <Input
            ref={searchRef}
            aria-label={title ? `Search ${title} options` : "Search options"}
            placeholder={title ? `Search ${title.toLowerCase()}…` : "Search…"}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-8"
          />
        </div>
        <div className="max-h-[300px] overflow-y-auto">
          {filteredOptions.length === 0 ? (
            <div className="text-muted-foreground py-6 text-center text-sm">
              {i18n.labels.filterNoResults}
            </div>
          ) : (
            <div className="p-1">
              {filteredOptions.map((option) => {
                const isSelected = selectedValues.has(option.value);
                const facetCount = facets?.get(option.value);
                const toggleOption = () => {
                  if (isSelected) {
                    selectedValues.delete(option.value);
                  } else {
                    selectedValues.add(option.value);
                  }
                  const filterValues = Array.from(selectedValues);
                  column?.setFilterValue(
                    filterValues.length ? filterValues : undefined,
                  );
                };
                return (
                  <Button
                    key={option.value}
                    type="button"
                    variant="ghost"
                    aria-pressed={isSelected}
                    onClick={toggleOption}
                    className={cn(
                      filterRowClassName,
                      "justify-start text-start",
                    )}
                  >
                    <span
                      className={cn(
                        "border-primary rounded-md flex h-4 w-4 items-center justify-center border",
                        isSelected
                          ? "bg-primary text-primary-foreground"
                          : "opacity-50 [&_svg]:invisible",
                      )}
                    >
                      <CheckIcon className="h-4 w-4" />
                    </span>
                    {option.icon && (
                      <option.icon className="text-muted-foreground h-4 w-4" />
                    )}
                    <span>{option.label}</span>
                    {facetCount !== undefined && (
                      <span className="ms-auto flex h-4 w-4 items-center justify-center font-mono text-xs">
                        {facetCount}
                      </span>
                    )}
                  </Button>
                );
              })}
            </div>
          )}
          {selectedValues.size > 0 && (
            <>
              <div className="bg-border -mx-1 my-1 h-px" />
              <div className="p-1">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    // Clearing unmounts this button, so focus moves first.
                    searchRef.current?.focus();
                    column?.setFilterValue(undefined);
                  }}
                  className={filterRowClassName}
                >
                  {i18n.labels.filterClear}
                </Button>
              </div>
            </>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

export { DataGridColumnFilter, type DataGridColumnFilterProps };
