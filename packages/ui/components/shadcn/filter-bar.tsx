"use client";

import { Search, X } from "lucide-react";
import * as React from "react";

import { cn } from "@asym/ui/lib/utils";

import { Badge } from "./badge";
import { Button } from "./button";
import { Input } from "./input";

interface FilterBarProps {
  search?: {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
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
              <Search className="text-muted-foreground absolute left-3 top-1/2 size-4 -translate-y-1/2" />
              <Input
                placeholder={search.placeholder || "Search..."}
                value={search.value}
                onChange={(e) => search.onChange(e.target.value)}
                className="placeholder:text-muted-foreground h-12 rounded-xl border-border/60 bg-background/60 pr-4 pl-10 font-medium transition-all focus:bg-background placeholder:text-[10px] placeholder:font-bold placeholder:uppercase placeholder:tracking-widest"
              />
            </div>
          )}

          {filters && (
            <div className="flex flex-wrap items-center gap-2">{filters}</div>
          )}
        </div>

        {actions && (
          <div className="flex items-center gap-3 w-full md:w-auto justify-end">
            {actions}
          </div>
        )}
      </div>

      {(activeFilters.length > 0 || onReset) && (
        <div className="flex flex-wrap items-center gap-2">
          {activeFilters.map((filter) => (
            <Badge
              key={filter.label}
              variant="secondary"
              className="text-muted-foreground h-7 cursor-default rounded-lg border-none bg-muted px-3 text-[9px] font-bold uppercase tracking-widest transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              {filter.label}
              <button
                type="button"
                onClick={filter.onRemove}
                className="ml-2 transition-colors hover:text-foreground"
              >
                <X className="size-3" />
              </button>
            </Badge>
          ))}

          {onReset && (activeFilters.length > 0 || search?.value) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onReset}
              className="text-muted-foreground h-7 px-3 text-[9px] font-black uppercase tracking-widest hover:text-foreground"
            >
              Clear all
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
