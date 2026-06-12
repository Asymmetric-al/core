"use client";

import { Search, X } from "lucide-react";
import * as React from "react";

import { cn } from "@asym/ui/lib/utils";

import { Button } from "../button";
import { Input } from "../input";
import { DataTableFacetedFilter } from "./data-table-faceted-filter";
import { DataTableViewOptions } from "./data-table-view-options";

import type { Table } from "./tanstack";
import type { DataTableFilterField } from "./types";

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
  filterFields?: DataTableFilterField<TData>[];
  searchKey?: string;
  searchPlaceholder?: string;
  enableColumnVisibility?: boolean;
  /** When true, search and filter controls are non-interactive (e.g. nuqs URL sync in flight). */
  urlStatePending?: boolean;
  className?: string;
  children?: React.ReactNode;
}

const EMPTY_FILTER_FIELDS: DataTableFilterField<unknown>[] = [];

export function DataTableToolbar<TData>({
  table,
  filterFields = EMPTY_FILTER_FIELDS as DataTableFilterField<TData>[],
  searchKey,
  searchPlaceholder = "Search...",
  enableColumnVisibility = true,
  urlStatePending = false,
  className,
  children,
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0;

  return (
    <div className={cn("flex flex-col gap-4 py-4", className)}>
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        {searchKey && (
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder={searchPlaceholder}
              value={
                (table.getColumn(searchKey)?.getFilterValue() as string) ?? ""
              }
              onChange={(event) =>
                table.getColumn(searchKey)?.setFilterValue(event.target.value)
              }
              disabled={urlStatePending}
              aria-busy={urlStatePending || undefined}
              className="h-10 pl-10 rounded-xl bg-background border-border"
            />
          </div>
        )}
        <div className="flex flex-1 flex-wrap items-center gap-2">
          {filterFields.map((field) => {
            const column = table.getColumn(String(field.id));
            if (!column || !field.options) return null;

            return (
              <DataTableFacetedFilter
                key={String(field.id)}
                column={column}
                title={field.label}
                options={field.options}
                disabled={urlStatePending}
              />
            );
          })}
          {isFiltered && (
            <Button
              aria-label="Reset filters"
              variant="ghost"
              onClick={() => table.resetColumnFilters()}
              disabled={urlStatePending}
              className="h-9 px-3 rounded-xl text-muted-foreground hover:text-foreground"
            >
              Reset
              <X className="ml-2 size-4" aria-hidden="true" />
            </Button>
          )}
        </div>
        <div className="flex items-center gap-2 ml-auto">
          {children}
          {enableColumnVisibility && (
            <DataTableViewOptions table={table} disabled={urlStatePending} />
          )}
        </div>
      </div>
    </div>
  );
}
