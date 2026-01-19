"use client";

import { useState, useMemo, useCallback } from "react";
import { CalendarIcon } from "lucide-react";
import { format as formatDate, parse, isValid } from "date-fns";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { DateCellProps } from "./types";

export function DateCell<TData>({
  value,
  isEditing = false,
  onValueChange,
  onEditComplete,
  className,
  disabled = false,
  format = "MMM d, yyyy",
  showTime = false,
  minDate,
  maxDate,
  placeholder = "Pick a date",
}: DateCellProps<TData>) {
  const [open, setOpen] = useState(false);

  const dateValue = useMemo(() => {
    if (!value) return undefined;
    if (value instanceof Date) return value;
    if (typeof value === "string") {
      const parsed = new Date(value);
      return isValid(parsed) ? parsed : undefined;
    }
    return undefined;
  }, [value]);

  const displayFormat = showTime ? "MMM d, yyyy h:mm a" : format;

  const formattedValue = useMemo(() => {
    if (!dateValue) return null;
    try {
      return formatDate(dateValue, displayFormat);
    } catch {
      return null;
    }
  }, [dateValue, displayFormat]);

  const handleSelect = useCallback(
    (date: Date | undefined) => {
      if (date) {
        onValueChange?.(date);
      } else {
        onValueChange?.(null);
      }
      setOpen(false);
      onEditComplete?.();
    },
    [onValueChange, onEditComplete],
  );

  if (isEditing && !disabled) {
    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "h-8 w-full justify-start px-2 text-left text-sm font-normal",
              !dateValue && "text-muted-foreground",
              className,
            )}
          >
            <CalendarIcon className="mr-2 size-3.5 shrink-0" />
            <span className="truncate">{formattedValue ?? placeholder}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={dateValue}
            onSelect={handleSelect}
            disabled={(date) => {
              if (minDate && date < minDate) return true;
              if (maxDate && date > maxDate) return true;
              return false;
            }}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    );
  }

  if (!formattedValue) {
    return (
      <span
        className={cn("block text-sm text-muted-foreground italic", className)}
      >
        —
      </span>
    );
  }

  return (
    <span
      className={cn("block truncate text-sm", className)}
      title={formattedValue}
    >
      {formattedValue}
    </span>
  );
}
