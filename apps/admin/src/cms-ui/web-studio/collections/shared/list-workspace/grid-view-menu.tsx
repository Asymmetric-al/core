"use client";

import { useIsMobile } from "@asym/lib/hooks/use-mobile";
import { Button } from "@asym/ui/components/shadcn/button";
import { Checkbox } from "@asym/ui/components/shadcn/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@asym/ui/components/shadcn/popover";
import { ArrowDown, ArrowUp, Settings2 } from "lucide-react";
import { useId } from "react";

export type GridViewColumn = {
  id: string;
  label: string;
  visible: boolean;
  /** Hidden columns can be shown again; the title column cannot be hidden. */
  canHide: boolean;
  /** Columns that keep their place (title, status) offer no moves. */
  movable: boolean;
};

/**
 * The Studio list's View panel: which of Payload's columns show, and in
 * which order, as Payload's own column selector offered (it saves both to
 * the viewer's list preferences). Order changes one step at a time with
 * named buttons, so it works from the keyboard and with a screen reader.
 */
export function GridViewMenu({
  columns,
  onToggle,
  onMove,
}: {
  /** Columns in their current order. */
  columns: readonly GridViewColumn[];
  onToggle: (id: string, visible: boolean) => void;
  onMove: (id: string, direction: "up" | "down") => void;
}) {
  const descriptionId = useId();
  const isMobile = useIsMobile();
  const movable = columns.filter((column) => column.movable);
  // Phones show cards, not columns: the menu would only take a toolbar row.
  if (isMobile) return null;

  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button variant="outline" size="sm">
            <Settings2 aria-hidden="true" />
            View
          </Button>
        }
      />
      <PopoverContent
        align="end"
        aria-describedby={descriptionId}
        className="w-72"
      >
        <PopoverHeader>
          <PopoverTitle>Columns</PopoverTitle>
          <PopoverDescription id={descriptionId}>
            Show columns and set their order. The top of the list is the
            leftmost column.
          </PopoverDescription>
        </PopoverHeader>
        <ul className="flex flex-col gap-1">
          {columns.map((column) => {
            const position = movable.indexOf(column);
            const lockedId = column.canHide
              ? undefined
              : `${descriptionId}-${column.id}-locked`;
            return (
              // One row height (the move buttons' size-8) for every row, so
              // fixed columns line up with the movable ones.
              <li key={column.id} className="flex min-h-8 items-center gap-2">
                <label className="flex min-w-0 flex-1 items-center gap-2 text-sm">
                  <Checkbox
                    checked={column.visible}
                    disabled={!column.canHide}
                    aria-describedby={lockedId}
                    onCheckedChange={(value) =>
                      onToggle(column.id, Boolean(value))
                    }
                  />
                  <span className="truncate">{column.label}</span>
                </label>
                {column.movable ? (
                  <span className="flex shrink-0 items-center">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`Move ${column.label} up`}
                      disabled={position <= 0}
                      onClick={() => onMove(column.id, "up")}
                    >
                      <ArrowUp aria-hidden="true" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`Move ${column.label} down`}
                      disabled={position === movable.length - 1}
                      onClick={() => onMove(column.id, "down")}
                    >
                      <ArrowDown aria-hidden="true" />
                    </Button>
                  </span>
                ) : !column.canHide ? (
                  // Its checkbox is disabled; say why rather than leave a
                  // control that looks broken.
                  <span
                    id={lockedId}
                    className="shrink-0 pe-2 text-xs text-muted-foreground"
                  >
                    Always shown
                  </span>
                ) : null}
              </li>
            );
          })}
        </ul>
      </PopoverContent>
    </Popover>
  );
}
