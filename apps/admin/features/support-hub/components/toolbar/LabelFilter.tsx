"use client";

import { Badge } from "@asym/ui/components/shadcn/badge";
import { Button } from "@asym/ui/components/shadcn/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@asym/ui/components/shadcn/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@asym/ui/components/shadcn/popover";
import { cn } from "@asym/ui/lib/utils";
import { Check, Settings2, Tag } from "lucide-react";
import * as React from "react";

import { useSupportLabels } from "../../hooks/use-support-labels";
import { LabelManagerDialog } from "../labels/LabelManagerDialog";

interface LabelFilterProps {
  value: string[];
  onValueChange: (next: string[]) => void;
}

/**
 * Multi-select label filter. Stays out of `data-table-faceted-filter` so the
 * URL contract for `?label=` (comma-separated slugs) lives in one place
 * driven by the support route-state hook.
 */
export function LabelFilter({ value, onValueChange }: LabelFilterProps) {
  const { data: labels } = useSupportLabels();
  const [open, setOpen] = React.useState(false);
  const [isManagerOpen, setIsManagerOpen] = React.useState(false);

  const valueSet = React.useMemo(() => new Set(value), [value]);

  const toggle = (slug: string) => {
    const next = new Set(valueSet);
    if (next.has(slug)) {
      next.delete(slug);
    } else {
      next.add(slug);
    }
    onValueChange(Array.from(next));
  };

  const activeCount = value.length;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          aria-haspopup="listbox"
          aria-expanded={open}
          className={cn(
            "h-10 gap-2 rounded-xl border-zinc-200 bg-white px-3 text-[13px] font-medium text-zinc-700",
            activeCount > 0 && "border-zinc-300 text-zinc-900",
          )}
        >
          <Tag className="size-3.5 text-zinc-400" />
          <span>Labels</span>
          {activeCount > 0 ? (
            <Badge
              variant="secondary"
              className="h-5 min-w-[1.25rem] justify-center rounded-md border-transparent bg-zinc-900 px-1.5 text-[11px] font-semibold tabular-nums text-white"
            >
              {activeCount}
            </Badge>
          ) : null}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-64 p-0">
        <Command>
          <CommandInput placeholder="Search labels..." className="h-9" />
          <CommandList>
            <CommandEmpty>No labels.</CommandEmpty>
            <CommandGroup>
              {labels.map((label) => {
                const isActive = valueSet.has(label.slug);
                return (
                  <CommandItem
                    key={label.id}
                    value={label.slug}
                    onSelect={() => toggle(label.slug)}
                    className="flex items-center gap-2"
                  >
                    <span
                      className={cn(
                        "flex size-4 items-center justify-center rounded border",
                        isActive
                          ? "border-zinc-900 bg-zinc-900 text-white"
                          : "border-zinc-200",
                      )}
                      aria-hidden
                    >
                      {isActive ? <Check className="size-3" /> : null}
                    </span>
                    <span className="flex-1 text-[13px] text-zinc-800">
                      {label.name}
                    </span>
                  </CommandItem>
                );
              })}
            </CommandGroup>
            {activeCount > 0 ? (
              <div className="border-t border-zinc-100 p-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-full justify-center text-xs font-medium"
                  onClick={() => onValueChange([])}
                >
                  Clear filters
                </Button>
              </div>
            ) : null}
            <div className="border-t border-zinc-100 p-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setOpen(false);
                  setIsManagerOpen(true);
                }}
                className="h-8 w-full justify-center gap-1.5 text-xs font-medium text-zinc-600"
              >
                <Settings2 className="size-3.5" />
                Manage labels
              </Button>
            </div>
          </CommandList>
        </Command>
      </PopoverContent>
      <LabelManagerDialog
        open={isManagerOpen}
        onOpenChange={setIsManagerOpen}
      />
    </Popover>
  );
}
