"use client";

import { useCallback } from "react";

import { cn } from "@asym/ui/lib/utils";

import { Checkbox } from "../../checkbox";

import type { CheckboxCellProps } from "./types";

export function CheckboxCell<TData>({
  value,
  onValueChange,
  onEditComplete,
  className,
  disabled = false,
  label,
  indeterminate = false,
}: CheckboxCellProps<TData>) {
  const handleChange = useCallback(
    (checked: boolean) => {
      onValueChange?.(checked);
      onEditComplete?.();
    },
    [onValueChange, onEditComplete],
  );

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Checkbox
        checked={value}
        indeterminate={indeterminate}
        onCheckedChange={handleChange}
        disabled={disabled}
        className="shrink-0"
        aria-label={label ?? "Toggle"}
      />
      {label && <span className="text-sm truncate">{label}</span>}
    </div>
  );
}
