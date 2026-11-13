"use client";

import {
  ArrowDown,
  ArrowUp,
  ChevronDown,
  ChevronsUpDown,
  EyeOff,
  Pin,
  PinOff,
} from "lucide-react";

import { cn } from "@asym/ui/lib/utils";

import { Button } from "../button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../dropdown-menu";

import type { Column, RowData } from "./tanstack";

interface DataTableColumnHeaderProps<
  TData extends RowData,
  TValue,
> extends React.HTMLAttributes<HTMLDivElement> {
  column: Column<TData, TValue>;
  title: string;
}

const SORT_STATE_LABEL = {
  asc: "sorted ascending",
  desc: "sorted descending",
  none: "not sorted",
} as const;

export function DataTableColumnHeader<TData extends RowData, TValue>({
  column,
  title,
  className,
}: DataTableColumnHeaderProps<TData, TValue>) {
  const canSort = column.getCanSort();
  const canHide = column.getCanHide();
  const canPin = column.getCanPin();

  if (!canSort && !canHide) {
    return <div className={cn(className)}>{title}</div>;
  }

  const sorted = column.getIsSorted() || "none";
  const isPinned = Boolean(column.getIsPinned());
  const triggerLabel = canSort
    ? `${title}, ${SORT_STATE_LABEL[sorted]}, column options`
    : `${title}, column options`;

  const groups = [
    canSort ? (
      <DropdownMenuGroup key="sort">
        <DropdownMenuItem
          onClick={() => column.toggleSorting(false)}
          className="gap-2 rounded-lg"
        >
          <ArrowUp className="size-4 text-muted-foreground" aria-hidden />
          Sort ascending
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => column.toggleSorting(true)}
          className="gap-2 rounded-lg"
        >
          <ArrowDown className="size-4 text-muted-foreground" aria-hidden />
          Sort descending
        </DropdownMenuItem>
      </DropdownMenuGroup>
    ) : null,
    canPin ? (
      <DropdownMenuGroup key="pin">
        {isPinned ? (
          <DropdownMenuItem
            onClick={() => column.pin(false)}
            className="gap-2 rounded-lg"
          >
            <PinOff className="size-4 text-muted-foreground" aria-hidden />
            Unpin
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem
            onClick={() => column.pin("start")}
            className="gap-2 rounded-lg"
          >
            <Pin className="size-4 text-muted-foreground" aria-hidden />
            Pin to left
          </DropdownMenuItem>
        )}
      </DropdownMenuGroup>
    ) : null,
    canHide ? (
      <DropdownMenuGroup key="hide">
        <DropdownMenuItem
          onClick={() => column.toggleVisibility(false)}
          className="gap-2 rounded-lg"
        >
          <EyeOff className="size-4 text-muted-foreground" aria-hidden />
          Hide column
        </DropdownMenuItem>
      </DropdownMenuGroup>
    ) : null,
  ].filter((group) => group !== null);

  const TriggerIcon = !canSort
    ? ChevronDown
    : sorted === "desc"
      ? ArrowDown
      : sorted === "asc"
        ? ArrowUp
        : ChevronsUpDown;

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              aria-label={triggerLabel}
              variant="ghost"
              size="sm"
              className="-ml-3 h-8 gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground aria-expanded:bg-accent aria-expanded:text-foreground"
            >
              <span className="uppercase tracking-wide">{title}</span>
              <TriggerIcon
                className={cn(
                  "size-3.5",
                  canSort && sorted === "none" && "opacity-50",
                )}
                aria-hidden
              />
            </Button>
          }
        />
        <DropdownMenuContent align="start" className="min-w-36 rounded-xl">
          {groups.flatMap((group, index) =>
            index === 0
              ? [group]
              : [<DropdownMenuSeparator key={`separator-${index}`} />, group],
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
