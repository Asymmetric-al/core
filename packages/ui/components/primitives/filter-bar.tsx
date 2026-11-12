"use client";

import { Search, X } from "lucide-react";
import * as React from "react";

import { cn } from "@asym/ui/lib/utils";

import { Badge } from "../shadcn/badge";
import { Button } from "../shadcn/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "../shadcn/input-group";

interface FilterBarProps {
  search?: {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    label?: string;
  };
  filters?: React.ReactNode;
  activeFilters?: {
    label: string;
    onRemove: () => void;
  }[];
  onReset?: () => void;
  actions?: React.ReactNode;
  className?: string;
}

const EMPTY_ACTIVE_FILTERS: { label: string; onRemove: () => void }[] = [];

export function FilterBar({
  search,
  filters,
  activeFilters = EMPTY_ACTIVE_FILTERS,
  onReset,
  actions,
  className,
}: FilterBarProps) {
  const rootRef = React.useRef<HTMLDivElement | null>(null);
  const searchRef = React.useRef<HTMLInputElement | null>(null);
  const chipsRef = React.useRef<HTMLDivElement | null>(null);
  // Removing a chip (or Clear all) unmounts the focused button. Once the
  // filters update, move focus to the next chip's remove control, else the
  // search field, else the bar itself, so keyboard users keep their place.
  const pendingFocusIndex = React.useRef<number | null>(null);
  React.useEffect(() => {
    const index = pendingFocusIndex.current;
    if (index === null) return;
    pendingFocusIndex.current = null;
    const removeButtons =
      chipsRef.current?.querySelectorAll<HTMLButtonElement>(
        "button[data-filter-remove]",
      ) ?? [];
    const next = removeButtons[Math.min(index, removeButtons.length - 1)];
    (next ?? searchRef.current ?? rootRef.current)?.focus();
  }, [activeFilters, search?.value]);

  return (
    <div
      ref={rootRef}
      tabIndex={-1}
      className={cn("flex flex-col gap-4 w-full outline-none", className)}
    >
      <div className="flex flex-col md:flex-row items-start md:items-center gap-4 justify-between">
        <div className="flex flex-1 flex-col md:flex-row items-start md:items-center gap-3 w-full md:w-auto">
          {search && (
            <div className="relative w-full md:w-80">
              <InputGroup>
                <InputGroupAddon>
                  <Search aria-hidden="true" />
                </InputGroupAddon>
                <InputGroupInput
                  ref={searchRef}
                  aria-label={search.label ?? "Search"}
                  placeholder={search.placeholder || "Search..."}
                  value={search.value}
                  onChange={(e) => search.onChange(e.target.value)}
                />
              </InputGroup>
            </div>
          )}

          {filters && (
            <div className="flex flex-wrap items-center gap-2">{filters}</div>
          )}
        </div>

        {actions && (
          <div className="flex w-full flex-wrap items-center justify-end gap-3 md:w-auto">
            {actions}
          </div>
        )}
      </div>

      {(activeFilters.length > 0 || onReset) && (
        <div ref={chipsRef} className="flex flex-wrap items-center gap-2">
          {activeFilters.map((filter, index) => {
            const handleFilterOnRemove = () => {
              pendingFocusIndex.current = index;
              filter.onRemove();
            };
            return (
              <Badge key={filter.label} variant="secondary">
                {filter.label}
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  onClick={handleFilterOnRemove}
                  aria-label={`Remove ${filter.label} filter`}
                  data-filter-remove=""
                  className="ml-1"
                >
                  <X className="size-3" />
                </Button>
              </Badge>
            );
          })}

          {onReset && (activeFilters.length > 0 || search?.value) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                pendingFocusIndex.current = Number.MAX_SAFE_INTEGER;
                onReset();
              }}
            >
              Clear all
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
