"use client";

import { Badge } from "@asym/ui/components/shadcn/badge";
import { Button } from "@asym/ui/components/shadcn/button";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxItemIndicator,
  ComboboxList,
  ComboboxTrigger,
  createComboboxItems,
} from "@asym/ui/components/shadcn/combobox";
import {
  InputGroup,
  InputGroupAddon,
} from "@asym/ui/components/shadcn/input-group";
import { cn } from "@asym/ui/lib/utils";
import { Check, Search, Settings2, Tag } from "lucide-react";
import * as React from "react";

import { useSupportLabels } from "../../hooks/use-support-labels";
import { LabelManagerDialog } from "../labels/LabelManagerDialog";

import type { SupportLabel } from "@asym/database/hooks";

interface LabelFilterProps {
  value: string[];
  onValueChange: (next: string[]) => void;
}

function matchesLabel(label: SupportLabel, query: string) {
  const search = query.trim().toLocaleLowerCase();
  return (
    label.name.toLocaleLowerCase().includes(search) ||
    label.slug.toLocaleLowerCase().includes(search)
  );
}

/**
 * Multi-select label filter. Stays out of `data-table-faceted-filter` so the
 * URL contract for `?label=` (comma-separated slugs) lives in one place
 * driven by the support route-state hook.
 */
export function LabelFilter({ value, onValueChange }: LabelFilterProps) {
  const searchRef = React.useRef<HTMLInputElement>(null);
  const { data: labels } = useSupportLabels();
  const [open, setOpen] = React.useState(false);
  const [isManagerOpen, setIsManagerOpen] = React.useState(false);
  const items = React.useMemo(
    () =>
      createComboboxItems(labels, {
        getValue: (label) => label.slug,
        getLabel: (label) => label.name,
      }),
    [labels],
  );
  const activeCount = value.length;

  return (
    <>
      <Combobox
        multiple
        items={items}
        value={value}
        onValueChange={(next) => onValueChange(next)}
        open={open}
        onOpenChange={setOpen}
        filter={matchesLabel}
        onInputValueChange={(_query, details) => {
          if (details.isItemPress) details.cancel();
        }}
      >
        <ComboboxTrigger
          aria-label="Labels"
          render={<Button variant="outline" size="sm" />}
          className={cn(
            "h-10 gap-2 rounded-xl border-border bg-background px-3 text-[13px] font-medium text-foreground",
            activeCount > 0 && "border-input",
          )}
        >
          <Tag className="size-3.5 text-muted-foreground" />
          <span>Labels</span>
          {activeCount > 0 && (
            <Badge
              variant="secondary"
              className="h-5 min-w-[1.25rem] justify-center rounded-md border-transparent bg-primary px-1.5 text-[11px] font-semibold tabular-nums text-primary-foreground"
            >
              {activeCount}
            </Badge>
          )}
        </ComboboxTrigger>
        <ComboboxContent aria-label="Labels" className="w-64 p-0">
          <InputGroup className="m-2 mb-0 w-auto shadow-none">
            <InputGroupAddon>
              <Search />
            </InputGroupAddon>
            <ComboboxInput
              ref={searchRef}
              aria-label="Search labels"
              placeholder="Search labels..."
            />
          </InputGroup>
          <ComboboxEmpty>No labels.</ComboboxEmpty>
          <ComboboxList>
            {(label: SupportLabel) => (
              <ComboboxItem key={label.id} value={label.slug} className="gap-2">
                <span className="flex size-4 items-center justify-center rounded border border-border in-data-selected:border-primary in-data-selected:bg-primary in-data-selected:text-primary-foreground">
                  <ComboboxItemIndicator>
                    <Check className="size-3" />
                  </ComboboxItemIndicator>
                </span>
                <span className="flex-1 text-[13px] text-foreground">
                  {label.name}
                </span>
              </ComboboxItem>
            )}
          </ComboboxList>
          {activeCount > 0 && (
            <div className="border-t border-border p-2">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-full justify-center text-xs font-medium"
                onClick={() => {
                  searchRef.current?.focus();
                  onValueChange([]);
                }}
              >
                Clear filters
              </Button>
            </div>
          )}
          <div className="border-t border-border p-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setOpen(false);
                setIsManagerOpen(true);
              }}
              className="h-8 w-full justify-center gap-1.5 text-xs font-medium text-muted-foreground"
            >
              <Settings2 className="size-3.5" />
              Manage labels
            </Button>
          </div>
        </ComboboxContent>
      </Combobox>
      <LabelManagerDialog
        open={isManagerOpen}
        onOpenChange={setIsManagerOpen}
      />
    </>
  );
}
