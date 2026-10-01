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
      spacing={1}
      aria-label="Inbox layout"
      className="inline-flex h-10 items-center gap-0 rounded-xl border border-border bg-background p-1"
    >
      {OPTIONS.map((option) => {
        const isActive = option.value === value;
        const Icon = option.icon;
        return (
          <ToggleGroupItem
            key={option.value}
            type="button"
            size="sm"
            value={option.value}
            aria-label={option.label}
            className={cn(
              "h-8 gap-1.5 rounded-lg px-3 text-xs font-semibold uppercase tracking-wider data-pressed:bg-foreground data-pressed:text-background",
              isActive
                ? "hover:bg-foreground hover:text-background"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Icon className="size-3.5" />
            <span className="hidden sm:inline">{option.label}</span>
          </ToggleGroupItem>
        );
      })}
    </ToggleGroup>
  );
}
