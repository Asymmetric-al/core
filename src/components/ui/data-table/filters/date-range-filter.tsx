"use client";

import { useState, useMemo, useCallback } from "react";
import {
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfQuarter,
  endOfQuarter,
  startOfYear,
  endOfYear,
  subDays,
  subWeeks,
  subMonths,
  subQuarters,
  subYears,
  format,
} from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@asym/lib/utils";
import { Button } from "@asym/ui/components/shadcn/button";
import { Calendar } from "@asym/ui/components/shadcn/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@asym/ui/components/shadcn/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@asym/ui/components/shadcn/select";
import type { DateRange } from "react-day-picker";
import type { DateRangePreset } from "./types";

export const DATE_RANGE_PRESETS: DateRangePreset[] = [
  {
    id: "today",
    label: "Today",
    getValue: () => ({
      from: startOfDay(new Date()),
      to: endOfDay(new Date()),
    }),
  },
  {
    id: "yesterday",
    label: "Yesterday",
    getValue: () => {
      const yesterday = subDays(new Date(), 1);
      return {
        from: startOfDay(yesterday),
        to: endOfDay(yesterday),
      };
    },
  },
  {
    id: "last_7_days",
    label: "Last 7 days",
    getValue: () => ({
      from: startOfDay(subDays(new Date(), 6)),
      to: endOfDay(new Date()),
    }),
  },
  {
    id: "last_14_days",
    label: "Last 14 days",
    getValue: () => ({
      from: startOfDay(subDays(new Date(), 13)),
      to: endOfDay(new Date()),
    }),
  },
  {
    id: "last_30_days",
    label: "Last 30 days",
    getValue: () => ({
      from: startOfDay(subDays(new Date(), 29)),
      to: endOfDay(new Date()),
    }),
  },
  {
    id: "last_90_days",
    label: "Last 90 days",
    getValue: () => ({
      from: startOfDay(subDays(new Date(), 89)),
      to: endOfDay(new Date()),
    }),
  },
  {
    id: "this_week",
    label: "This week",
    getValue: () => ({
      from: startOfWeek(new Date(), { weekStartsOn: 0 }),
      to: endOfWeek(new Date(), { weekStartsOn: 0 }),
    }),
  },
  {
    id: "last_week",
    label: "Last week",
    getValue: () => {
      const lastWeek = subWeeks(new Date(), 1);
      return {
        from: startOfWeek(lastWeek, { weekStartsOn: 0 }),
        to: endOfWeek(lastWeek, { weekStartsOn: 0 }),
      };
    },
  },
  {
    id: "this_month",
    label: "This month",
    getValue: () => ({
      from: startOfMonth(new Date()),
      to: endOfMonth(new Date()),
    }),
  },
  {
    id: "last_month",
    label: "Last month",
    getValue: () => {
      const lastMonth = subMonths(new Date(), 1);
      return {
        from: startOfMonth(lastMonth),
        to: endOfMonth(lastMonth),
      };
    },
  },
  {
    id: "this_quarter",
    label: "This quarter",
    getValue: () => ({
      from: startOfQuarter(new Date()),
      to: endOfQuarter(new Date()),
    }),
  },
  {
    id: "last_quarter",
    label: "Last quarter",
    getValue: () => {
      const lastQuarter = subQuarters(new Date(), 1);
      return {
        from: startOfQuarter(lastQuarter),
        to: endOfQuarter(lastQuarter),
      };
    },
  },
  {
    id: "this_year",
    label: "This year",
    getValue: () => ({
      from: startOfYear(new Date()),
      to: endOfYear(new Date()),
    }),
  },
  {
    id: "last_year",
    label: "Last year",
    getValue: () => {
      const lastYear = subYears(new Date(), 1);
      return {
        from: startOfYear(lastYear),
        to: endOfYear(lastYear),
      };
    },
  },
];

interface DateRangeFilterProps {
  value: { from: Date | null; to: Date | null } | null;
  onChange: (value: { from: Date | null; to: Date | null } | null) => void;
  presets?: DateRangePreset[];
  placeholder?: string;
  className?: string;
  align?: "start" | "center" | "end";
}

export function DateRangeFilter({
  value,
  onChange,
  presets = DATE_RANGE_PRESETS,
  placeholder = "Select date range",
  className,
  align = "start",
}: DateRangeFilterProps) {
  const [open, setOpen] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);

  const dateRange: DateRange | undefined = useMemo(() => {
    if (!value?.from) return undefined;
    return {
      from: value.from,
      to: value.to ?? undefined,
    };
  }, [value]);

  const displayValue = useMemo(() => {
    if (!value?.from) return null;
    if (!value.to) return format(value.from, "MMM d, yyyy");
    if (value.from.getTime() === value.to.getTime()) {
      return format(value.from, "MMM d, yyyy");
    }
    return `${format(value.from, "MMM d")} - ${format(value.to, "MMM d, yyyy")}`;
  }, [value]);

  const handlePresetSelect = useCallback(
    (presetId: string) => {
      const preset = presets.find((p) => p.id === presetId);
      if (preset) {
        const range = preset.getValue();
        onChange({ from: range.from, to: range.to });
        setSelectedPreset(presetId);
      }
    },
    [presets, onChange],
  );

  const handleCalendarSelect = useCallback(
    (range: DateRange | undefined) => {
      if (!range) {
        onChange(null);
      } else {
        onChange({
          from: range.from ?? null,
          to: range.to ?? null,
        });
      }
      setSelectedPreset(null);
    },
    [onChange],
  );

  const handleClear = useCallback(() => {
    onChange(null);
    setSelectedPreset(null);
  }, [onChange]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "h-8 w-[240px] justify-start px-2 text-left text-sm font-normal",
            !displayValue && "text-muted-foreground",
            className,
          )}
        >
          <CalendarIcon className="mr-2 size-3.5" />
          {displayValue ?? placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align={align}>
        <div className="flex">
          <div className="border-r p-2 w-[140px]">
            <div className="text-xs font-medium text-muted-foreground mb-2 px-2">
              Quick select
            </div>
            <div className="space-y-0.5">
              {presets.map((preset) => (
                <Button
                  key={preset.id}
                  variant={selectedPreset === preset.id ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => handlePresetSelect(preset.id)}
                  className="w-full justify-start h-7 text-xs font-normal"
                >
                  {preset.label}
                </Button>
              ))}
            </div>
          </div>
          <div className="p-2">
            <Calendar
              mode="range"
              selected={dateRange}
              onSelect={handleCalendarSelect}
              numberOfMonths={2}
              initialFocus
            />
            {value && (
              <div className="flex justify-end border-t pt-2 mt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClear}
                  className="h-7 text-xs"
                >
                  Clear
                </Button>
              </div>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

interface QuickDateFilterProps {
  value: { from: Date | null; to: Date | null } | null;
  onChange: (value: { from: Date | null; to: Date | null } | null) => void;
  presets?: DateRangePreset[];
  placeholder?: string;
  className?: string;
}

export function QuickDateFilter({
  value,
  onChange,
  presets = DATE_RANGE_PRESETS.slice(0, 8),
  placeholder = "Any time",
  className,
}: QuickDateFilterProps) {
  const selectedPreset = useMemo(() => {
    if (!value?.from || !value?.to) return "";

    for (const preset of presets) {
      const range = preset.getValue();
      if (
        range.from.getTime() === value.from.getTime() &&
        range.to.getTime() === value.to.getTime()
      ) {
        return preset.id;
      }
    }
    return "custom";
  }, [value, presets]);

  const handleChange = useCallback(
    (presetId: string) => {
      if (!presetId || presetId === "any") {
        onChange(null);
        return;
      }
      const preset = presets.find((p) => p.id === presetId);
      if (preset) {
        const range = preset.getValue();
        onChange({ from: range.from, to: range.to });
      }
    },
    [presets, onChange],
  );

  return (
    <Select value={selectedPreset} onValueChange={handleChange}>
      <SelectTrigger className={cn("h-8 w-[160px] text-sm", className)}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="any">{placeholder}</SelectItem>
        {presets.map((preset) => (
          <SelectItem key={preset.id} value={preset.id}>
            {preset.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
