"use client";

import { useCallback, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
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
  const checkboxRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (checkboxRef.current && indeterminate) {
      checkboxRef.current.dataset.state = "indeterminate";
    }
  }, [indeterminate]);

  const handleChange = useCallback(
    (checked: boolean | "indeterminate") => {
      if (checked === "indeterminate") return;
      onValueChange?.(checked);
      onEditComplete?.();
    },
    [onValueChange, onEditComplete],
  );

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Checkbox
        ref={checkboxRef}
        checked={indeterminate ? "indeterminate" : value}
        onCheckedChange={handleChange}
        disabled={disabled}
        className="shrink-0"
        aria-label={label ?? "Toggle"}
      />
      {label && <span className="text-sm truncate">{label}</span>}
    </div>
  );
}
