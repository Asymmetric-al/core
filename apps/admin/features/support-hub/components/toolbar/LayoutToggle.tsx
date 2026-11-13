"use client";

import {
  ToggleGroup,
  ToggleGroupItem,
} from "@asym/ui/components/shadcn/toggle-group";
import { LayoutGrid, Table as TableIcon } from "lucide-react";

import { INBOX_LAYOUT_LABELS } from "../../lib/status-labels";

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
  { value: "board", label: INBOX_LAYOUT_LABELS.board, icon: LayoutGrid },
  { value: "table", label: INBOX_LAYOUT_LABELS.table, icon: TableIcon },
];

/**
 * Segmented control bound to `?layout=` with Base UI roving keyboard focus.
 */
export function LayoutToggle({ value, onValueChange }: LayoutToggleProps) {
  return (
    // Same outline segmented control as the shared grid's layout toggle.
    <ToggleGroup
      value={[value]}
      onValueChange={(values) => {
        const next = values[0];
        if (next === "board" || next === "table") onValueChange(next);
      }}
      variant="outline"
      size="sm"

      aria-label="Inbox layout"
    >
      {OPTIONS.map((option) => {
        const Icon = option.icon;
        return (
          <ToggleGroupItem
            key={option.value}
            value={option.value}
            aria-label={option.label}
          >
            <Icon aria-hidden="true" />
            <span className="hidden sm:inline">{option.label}</span>
          </ToggleGroupItem>
        );
      })}
    </ToggleGroup>
  );
}
