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
  return (
    <div className={cn("flex flex-col gap-4 w-full", className)}>
      <div className="flex flex-col md:flex-row items-start md:items-center gap-4 justify-between">
        <div className="flex flex-1 flex-col md:flex-row items-start md:items-center gap-3 w-full md:w-auto">
          {search && (
            <div className="relative w-full md:w-80">
              <InputGroup>
                <InputGroupAddon>
                  <Search aria-hidden="true" />
                </InputGroupAddon>
                <InputGroupInput
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
        <div className="flex flex-wrap items-center gap-2">
          {activeFilters.map((filter) => {
            const handleFilterOnRemove = filter.onRemove;
            return (
              <Badge key={filter.label} variant="secondary">
                {filter.label}
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  onClick={handleFilterOnRemove}
                  aria-label={`Remove ${filter.label} filter`}
                  className="ml-1"
                >
                  <X className="size-3" />
                </Button>
              </Badge>
            );
          })}

          {onReset && (activeFilters.length > 0 || search?.value) && (
            <Button variant="ghost" size="sm" onClick={onReset}>
              Clear all
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
