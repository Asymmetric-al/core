"use client";

import { useIsMobile } from "@asym/lib/hooks/use-mobile";
import {
  SortableList,
  SortableListHandle,
  SortableListItem,
} from "@asym/ui/components/primitives/sortable-list";
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
import { useId, useMemo } from "react";

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
 * the viewer's list preferences). Movable columns are a sortable list: drag
 * a row's handle, pick it up from the keyboard, or press its named Move
 * buttons; each move is announced.
 */
export function GridViewMenu({
  columns,
  onToggle,
  onReorder,
}: {
  /** Columns in their current order; fixed columns come first. */
  columns: readonly GridViewColumn[];
  onToggle: (id: string, visible: boolean) => void;
  /** The movable columns' ids in their new order. */
  onReorder: (order: string[]) => void;
}) {
  const descriptionId = useId();
  const isMobile = useIsMobile();
  const fixed = columns.filter((column) => !column.movable);
  const byId = new Map(columns.map((column) => [column.id, column]));
  // `columns` is rebuilt on every render; hand the list the same array until
  // the order really changes.
  const movableKey = columns
    .filter((column) => column.movable)
    .map((column) => column.id)
    .join("\n");
  const movableIds = useMemo(
    () => (movableKey ? movableKey.split("\n") : []),
    [movableKey],
  );
  // Phones show cards, not columns: the menu would only take a toolbar row.
  if (isMobile) return null;

  const visibility = (column: GridViewColumn, lockedId?: string) => (
    <label className="flex min-w-0 flex-1 items-center gap-2 text-sm">
      <Checkbox
        checked={column.visible}
        disabled={!column.canHide}
        aria-describedby={lockedId}
        onCheckedChange={(value) => onToggle(column.id, Boolean(value))}
      />
      <span className="truncate">{column.label}</span>
    </label>
  );

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
        <div className="flex flex-col gap-1">
          {fixed.length > 0 ? (
            <ul className="flex flex-col gap-1">
              {fixed.map((column) => {
                const lockedId = column.canHide
                  ? undefined
                  : `${descriptionId}-${column.id}-locked`;
                return (
                  // One row height (the move buttons' size-8) for every row,
                  // and the handle's width before the checkbox, so fixed
                  // columns line up with the movable ones.
                  <li
                    key={column.id}
                    className="flex min-h-8 items-center gap-2"
                  >
                    <span
                      aria-hidden="true"
                      className="size-8 shrink-0 pointer-coarse:size-11"
                    />
                    {visibility(column, lockedId)}
                    {!column.canHide ? (
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
          ) : null}
          {movableIds.length > 0 ? (
            <SortableList
              aria-label="Column order"
              className="flex flex-col gap-1"
              value={movableIds}
              onValueChange={onReorder}
            >
              {({ order, move }) =>
                order.map((id, position) => {
                  const column = byId.get(id);
                  if (!column) return null;
                  return (
                    <SortableListItem
                      key={id}
                      value={id}
                      label={column.label}
                      className="flex min-h-8 items-center gap-2 rounded-md bg-popover"
                    >
                      <SortableListHandle
                        aria-label={`Reorder ${column.label}`}
                        className="size-8"
                      />
                      {visibility(column)}
                      {/* Disabled at an end but still focusable, so focus
                          stays on the button that was pressed. */}
                      <span className="flex shrink-0 items-center">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label={`Move ${column.label} up`}
                          disabled={position === 0}
                          focusableWhenDisabled
                          onClick={() => move(id, position - 1)}
                        >
                          <ArrowUp aria-hidden="true" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label={`Move ${column.label} down`}
                          disabled={position === order.length - 1}
                          focusableWhenDisabled
                          onClick={() => move(id, position + 1)}
                        >
                          <ArrowDown aria-hidden="true" />
                        </Button>
                      </span>
                    </SortableListItem>
                  );
                })
              }
            </SortableList>
          ) : null}
        </div>
      </PopoverContent>
    </Popover>
  );
}
