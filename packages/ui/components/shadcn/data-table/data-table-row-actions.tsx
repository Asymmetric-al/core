"use client";

import { MoreHorizontal } from "lucide-react";
import * as React from "react";

import { cn } from "@asym/ui/lib/utils";

import { Button } from "../button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../dropdown-menu";
import { getDataTableRowActionKey } from "./data-table-row-action-key";

import type { Row, RowData } from "./tanstack";
import type { DataTableInteractiveRowAction } from "./types";

const DEFAULT_ROW_ACTION_ARIA_LABEL = "Open row actions";

interface DataTableRowActionsProps<TData extends RowData> {
  row: Row<TData>;
  actions: DataTableInteractiveRowAction<TData>[];
  className?: string;
  getAriaLabel?: (row: Row<TData>) => string;
}

function getRowActionTriggerLabel<TData extends RowData>(
  row: Row<TData>,
  getAriaLabel?: (row: Row<TData>) => string,
) {
  const customLabel = getAriaLabel?.(row);
  return customLabel?.trim() || DEFAULT_ROW_ACTION_ARIA_LABEL;
}

export function DataTableRowActions<TData extends RowData>({
  row,
  actions,
  className,
  getAriaLabel,
}: DataTableRowActionsProps<TData>) {
  if (actions.length === 0) {
    return null;
  }

  const triggerLabel = getRowActionTriggerLabel(row, getAriaLabel);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className={cn("size-8 rounded-lg", className)}
            aria-label={triggerLabel}
            onClick={(event) => event.stopPropagation()}
          >
            <MoreHorizontal className="size-4" aria-hidden="true" />
            <span className="sr-only">Open row actions</span>
          </Button>
        }
      />
      <DropdownMenuContent align="end" className="rounded-xl">
        {actions.map((action, index) => (
          <React.Fragment key={getDataTableRowActionKey(action, index)}>
            {action.variant === "destructive" && index > 0 && (
              <DropdownMenuSeparator />
            )}
            <DropdownMenuItem
              onClick={(event) => {
                event.stopPropagation();
                action.onClick(row.original);
              }}
              className={cn(
                "rounded-lg gap-2",
                action.variant === "destructive" &&
                  "text-destructive focus:text-destructive",
              )}
            >
              {action.icon && <action.icon className="size-4" />}
              {action.label}
            </DropdownMenuItem>
          </React.Fragment>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
