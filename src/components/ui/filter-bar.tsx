"use client";

import * as React from "react";
import { Search, X, SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

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

export function FilterBar({
  search,
  filters,
  activeFilters = [],
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
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-400" />
              <Input
                placeholder={search.placeholder || "Search..."}
                value={search.value}
                onChange={(e) => search.onChange(e.target.value)}
                className="h-12 pl-10 pr-4 rounded-xl border-zinc-100 bg-white/50 focus:bg-white transition-all font-medium placeholder:text-zinc-400 placeholder:font-bold placeholder:uppercase placeholder:tracking-widest placeholder:text-[10px]"
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
          {activeFilters.map((filter, index) => (
            <Badge
              key={index}
              variant="secondary"
              className="h-7 px-3 rounded-lg bg-zinc-100 text-zinc-600 border-none font-bold uppercase tracking-widest text-[9px] hover:bg-zinc-200 transition-colors cursor-default"
            >
              {filter.label}
              <button
                onClick={filter.onRemove}
                className="ml-2 hover:text-zinc-900 transition-colors"
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
              className="h-7 px-3 text-[9px] font-black uppercase tracking-widest text-zinc-400 hover:text-zinc-900"
            >
              Clear all
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
