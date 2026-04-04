"use client";

import * as React from "react";

import { MoreHorizontal } from "lucide-react";

import { cn } from "@asym/ui/lib/utils";

import { Button } from "../button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../dropdown-menu";

import type { Row } from "@tanstack/react-table";

interface DataTableRowAction<TData> {
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  onClick: (row: TData) => void;
  variant?: "default" | "destructive";
}

interface DataTableRowActionsProps<TData> {
  row: Row<TData>;
  actions: DataTableRowAction<TData>[];
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
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={cn("size-8 rounded-lg", className)}
          onClick={(event) => event.stopPropagation()}
        >
          <MoreHorizontal className="size-4" />
          <span className="sr-only">Open row actions</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="rounded-xl">
        {actions.map((action, index) => (
          <React.Fragment key={action.label}>
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
