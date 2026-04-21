"use client";

import { Button } from "@asym/ui/components/shadcn/button";
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
 * Segmented control bound to `?layout=`. Keyboard-reachable as a normal pair
 * of buttons; `aria-pressed` communicates active state.
 */
export function LayoutToggle({ value, onValueChange }: LayoutToggleProps) {
  return (
    <div
      role="group"
      aria-label="Inbox layout"
      className="inline-flex h-10 items-center rounded-xl border border-zinc-200 bg-white p-1"
    >
      {OPTIONS.map((option) => {
        const isActive = option.value === value;
        const Icon = option.icon;
        return (
          <Button
            key={option.value}
            type="button"
            variant="ghost"
            size="sm"
            aria-pressed={isActive}
            onClick={() => onValueChange(option.value)}
            className={cn(
              "h-8 gap-1.5 rounded-lg px-3 text-xs font-semibold uppercase tracking-wider",
              isActive
                ? "bg-zinc-900 text-white hover:bg-zinc-900 hover:text-white"
                : "text-zinc-500 hover:text-zinc-900",
            )}
          >
            <Icon className="size-3.5" />
            <span className="hidden sm:inline">{option.label}</span>
          </Button>
        );
      })}
    </div>
  );
}
