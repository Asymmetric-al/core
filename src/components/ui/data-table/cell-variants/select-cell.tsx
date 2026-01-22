"use client";

import { useState, useMemo, useCallback } from "react";
import { CheckIcon, ChevronsUpDownIcon, XIcon } from "lucide-react";
import { cn } from "@asym/lib/utils";
import { Button } from "@asym/ui/components/shadcn/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@asym/ui/components/shadcn/select";
import type { SelectCellProps, SelectOption } from "./types";

export function SelectCell<TData>({
  value,
  isEditing = false,
  onValueChange,
  onEditComplete,
  className,
  disabled = false,
  options,
  placeholder = "Select...",
  clearable = false,
}: SelectCellProps<TData>) {
  const [open, setOpen] = useState(false);

  const selectedOption = useMemo(() => {
    return options.find((opt) => opt.value === value);
  }, [options, value]);

  const handleSelect = useCallback(
    (newValue: string) => {
      onValueChange?.(newValue);
      setOpen(false);
      onEditComplete?.();
    },
    [onValueChange, onEditComplete],
  );

  const handleClear = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onValueChange?.(null);
      onEditComplete?.();
    },
    [onValueChange, onEditComplete],
  );

  if (isEditing && !disabled) {
    return (
      <Select
        value={value ?? ""}
        onValueChange={handleSelect}
        open={open}
        onOpenChange={setOpen}
      >
        <SelectTrigger
          className={cn(
            "h-8 w-full px-2 text-sm",
            !selectedOption && "text-muted-foreground",
            className,
          )}
        >
          <SelectValue placeholder={placeholder}>
            {selectedOption ? (
              <div className="flex items-center gap-2">
                {selectedOption.icon && (
                  <selectedOption.icon className="size-3.5 shrink-0" />
                )}
                <span className="truncate">{selectedOption.label}</span>
              </div>
            ) : (
              placeholder
            )}
          </SelectValue>
          {clearable && value && (
            <Button
              variant="ghost"
              size="icon"
              className="ml-auto size-5 shrink-0 hover:bg-muted"
              onClick={handleClear}
            >
              <XIcon className="size-3" />
            </Button>
          )}
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem
              key={option.value}
              value={option.value}
              disabled={option.disabled}
              className="cursor-pointer"
            >
              <div className="flex items-center gap-2">
                {option.icon && <option.icon className="size-3.5 shrink-0" />}
                <span>{option.label}</span>
                {option.description && (
                  <span className="text-muted-foreground text-xs ml-auto">
                    {option.description}
                  </span>
                )}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }

  if (!selectedOption) {
    return (
      <span
        className={cn("block text-sm text-muted-foreground italic", className)}
      >
        —
      </span>
    );
  }

  return (
    <div className={cn("flex items-center gap-2 text-sm", className)}>
      {selectedOption.icon && (
        <selectedOption.icon className="size-3.5 shrink-0 text-muted-foreground" />
      )}
      <span className="truncate">{selectedOption.label}</span>
    </div>
  );
}
