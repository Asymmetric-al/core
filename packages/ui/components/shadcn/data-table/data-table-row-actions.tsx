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

import type { DataTableInteractiveRowAction } from "./types";
import type { Row } from "@tanstack/react-table";

interface DataTableRowActionsProps<TData> {
  row: Row<TData>;
  actions: DataTableInteractiveRowAction<TData>[];
  className?: string;
}

export function DataTableRowActions<TData>({
  row,
  actions,
  className,
}: DataTableRowActionsProps<TData>) {
  if (actions.length === 0) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className={cn("size-8 rounded-lg", className)}
            onClick={(event) => event.stopPropagation()}
          />
        }
      >
        <MoreHorizontal className="size-4" />
        <span className="sr-only">Open row actions</span>
      </DropdownMenuTrigger>
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
