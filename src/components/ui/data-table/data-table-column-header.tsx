"use client";

import type { Column } from "@tanstack/react-table";
import {
  ArrowDown,
  ArrowUp,
  ChevronsUpDown,
  EyeOff,
  Pin,
  PinOff,
} from "lucide-react";

import { cn } from "@asym/lib/utils";
import { Button } from "@asym/ui/components/shadcn/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@asym/ui/components/shadcn/dropdown-menu";

interface DataTableColumnHeaderProps<
  TData,
  TValue,
> extends React.HTMLAttributes<HTMLDivElement> {
  column: Column<TData, TValue>;
  title: string;
}

export function DataTableColumnHeader<TData, TValue>({
  column,
  title,
  className,
}: DataTableColumnHeaderProps<TData, TValue>) {
  if (!column.getCanSort() && !column.getCanHide()) {
    return <div className={cn(className)}>{title}</div>;
  }

  return (
    <div className={cn("flex items-center space-x-2", className)}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            aria-label={
              column.getIsSorted() === "desc"
                ? "Sorted descending. Click to sort ascending."
                : column.getIsSorted() === "asc"
                  ? "Sorted ascending. Click to sort descending."
                  : "Not sorted. Click to sort ascending."
            }
            variant="ghost"
            size="sm"
            className="-ml-3 h-8 gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground data-[state=open]:bg-accent data-[state=open]:text-foreground"
          >
            <span className="uppercase tracking-wide">{title}</span>
            {column.getCanSort() && column.getIsSorted() === "desc" ? (
              <ArrowDown className="size-3.5" aria-hidden="true" />
            ) : column.getIsSorted() === "asc" ? (
              <ArrowUp className="size-3.5" aria-hidden="true" />
            ) : (
              <ChevronsUpDown
                className="size-3.5 opacity-50"
                aria-hidden="true"
              />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="min-w-36 rounded-xl">
          {column.getCanSort() && (
            <>
              <DropdownMenuItem
                aria-label="Sort ascending"
                onClick={() => column.toggleSorting(false)}
                className="gap-2 rounded-lg"
              >
                <ArrowUp
                  className="size-4 text-muted-foreground"
                  aria-hidden="true"
                />
                Ascending
              </DropdownMenuItem>
              <DropdownMenuItem
                aria-label="Sort descending"
                onClick={() => column.toggleSorting(true)}
                className="gap-2 rounded-lg"
              >
                <ArrowDown
                  className="size-4 text-muted-foreground"
                  aria-hidden="true"
                />
                Descending
              </DropdownMenuItem>
            </>
          )}
          {column.getCanSort() && column.getCanHide() && (
            <DropdownMenuSeparator />
          )}
          {column.getCanPin() && (
            <>
              <DropdownMenuItem
                aria-label="Pin to left"
                onClick={() => column.pin("left")}
                className="gap-2 rounded-lg"
              >
                <Pin
                  className="size-4 text-muted-foreground"
                  aria-hidden="true"
                />
                Pin to left
              </DropdownMenuItem>
              <DropdownMenuItem
                aria-label="Unpin"
                onClick={() => column.pin(false)}
                className="gap-2 rounded-lg"
              >
                <PinOff
                  className="size-4 text-muted-foreground"
                  aria-hidden="true"
                />
                Unpin
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </>
          )}
          {column.getCanHide() && (
            <DropdownMenuItem
              aria-label="Hide column"
              onClick={() => column.toggleVisibility(false)}
              className="gap-2 rounded-lg"
            >
              <EyeOff
                className="size-4 text-muted-foreground"
                aria-hidden="true"
              />
              Hide column
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
