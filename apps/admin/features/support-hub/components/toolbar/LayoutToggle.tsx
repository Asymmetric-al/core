"use client";

import {
  ToggleGroup,
  ToggleGroupItem,
} from "@asym/ui/components/shadcn/toggle-group";
import { cn } from "@asym/ui/lib/utils";
import { LayoutGrid, Table as TableIcon } from "lucide-react";

import type { SupportInboxLayout } from "../../types";

interface LayoutToggleProps {
  value: SupportInboxLayout;
  onValueChange: (next: SupportInboxLayout) => void;
}

const OPTIONS: {
  value: SupportInboxLayout;
  label: string;
  icon: typeof LayoutGrid;
}[] = [
  { value: "board", label: "Board", icon: LayoutGrid },
  { value: "table", label: "Table", icon: TableIcon },
];

/**
 * Segmented control bound to `?layout=` with Base UI roving keyboard focus.
 */
export function LayoutToggle({ value, onValueChange }: LayoutToggleProps) {
  return (
    <ToggleGroup
      value={[value]}
      onValueChange={(values) => {
        const next = values[0];
        if (next === "board" || next === "table") onValueChange(next);
      }}
      variant="outline"
      size="sm"
      spacing={0}
      aria-label="Inbox layout"
    >
      {OPTIONS.map((option) => {
        const isActive = option.value === value;
        const Icon = option.icon;
        return (
          <ToggleGroupItem
            key={option.value}
            type="button"
            value={option.value}
            aria-label={option.label}
          >
            {/* The shared pressed tint is faint; muting the inactive option
                keeps the selected layout readable at a glance. */}
            <Icon
              className={cn("size-3.5", !isActive && "text-muted-foreground")}
            />
            <span
              className={cn(
                "hidden sm:inline",
                !isActive && "text-muted-foreground",
              )}
            >
              {option.label}
            </span>
          </ToggleGroupItem>
        );
      })}
    </ToggleGroup>
  );
}
