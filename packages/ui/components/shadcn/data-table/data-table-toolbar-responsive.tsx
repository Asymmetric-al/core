"use client";

import * as React from "react";
import type { Table } from "@tanstack/react-table";
import {
  Search,
  X,
  SlidersHorizontal,
  Columns,
  Download,
  RefreshCw,
  ChevronDown,
} from "lucide-react";

import { cn } from "@asym/ui/lib/utils";
import { Button } from "../button";
import { Badge } from "../badge";
import { Input } from "../input";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  DrawerFooter,
} from "../drawer";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../dropdown-menu";
import { Separator } from "../separator";
import { DataTableFacetedFilter } from "./data-table-faceted-filter";
import type { DataTableFilterField } from "./types";
import {
  FilterBuilder,
  ActiveFilters,
  createEmptyFilterState,
  type AdvancedFilterState,
  type FilterFieldDefinition,
} from "./filters";

interface DataTableToolbarResponsiveProps<TData> {
  table: Table<TData>;
  filterFields?: DataTableFilterField<TData>[];
  advancedFilterFields?: FilterFieldDefinition[];
  advancedFilter?: AdvancedFilterState;
  onAdvancedFilterChange?: (filter: AdvancedFilterState) => void;
  searchKey?: string;
  searchPlaceholder?: string;
  enableColumnVisibility?: boolean;
  enableAdvancedFilter?: boolean;
  enableExport?: boolean;
  onExport?: () => void;
  onRefresh?: () => void;
  isLoading?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export function DataTableToolbarResponsive<TData>({
  table,
  filterFields = [],
  advancedFilterFields = [],
  advancedFilter,
  onAdvancedFilterChange,
  searchKey,
  searchPlaceholder = "Search...",
  enableColumnVisibility = true,
  enableAdvancedFilter = false,
  enableExport = false,
  onExport,
  onRefresh,
  isLoading = false,
  className,
  children,
}: DataTableToolbarResponsiveProps<TData>) {
  const [mobileFiltersOpen, setMobileFiltersOpen] = React.useState(false);
  const [searchOpen, setSearchOpen] = React.useState(false);
  const isFiltered = table.getState().columnFilters.length > 0;
  const [localFilter, setLocalFilter] = React.useState<AdvancedFilterState>(
    advancedFilter ?? createEmptyFilterState(),
  );

  const activeFilterCount = React.useMemo(() => {
    let count = table.getState().columnFilters.length;
    if (advancedFilter) {
      count += advancedFilter.conditions.length;
    }
    return count;
  }, [table, advancedFilter]);

  const handleAdvancedFilterChange = React.useCallback(
    (filter: AdvancedFilterState) => {
      setLocalFilter(filter);
      onAdvancedFilterChange?.(filter);
    },
    [onAdvancedFilterChange],
  );

  const resetAllFilters = React.useCallback(() => {
    table.resetColumnFilters();
    if (onAdvancedFilterChange) {
      onAdvancedFilterChange(createEmptyFilterState());
    }
    setLocalFilter(createEmptyFilterState());
  }, [table, onAdvancedFilterChange]);

  const columns = table
    .getAllColumns()
    .filter(
      (column) =>
        typeof column.accessorFn !== "undefined" && column.getCanHide(),
    );

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <div className="flex items-center gap-2">
        {searchKey && (
          <>
            <div className="relative hidden sm:block flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder={searchPlaceholder}
                value={
                  (table.getColumn(searchKey)?.getFilterValue() as string) ?? ""
                }
                onChange={(event) =>
                  table.getColumn(searchKey)?.setFilterValue(event.target.value)
                }
                className="h-9 pl-9 rounded-xl bg-background"
              />
              {(table.getColumn(searchKey)?.getFilterValue() as string) && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2 size-7"
                  onClick={() => table.getColumn(searchKey)?.setFilterValue("")}
                >
                  <X className="size-3.5" />
                </Button>
              )}
            </div>
            <Button
              variant="outline"
              size="icon"
              className="sm:hidden size-9 rounded-xl"
              onClick={() => setSearchOpen(!searchOpen)}
            >
              <Search className="size-4" />
            </Button>
          </>
        )}

        <div className="hidden lg:flex flex-wrap items-center gap-2">
          {filterFields.map((field) => {
            const column = table.getColumn(String(field.id));
            if (!column || !field.options) return null;

            return (
              <DataTableFacetedFilter
                key={String(field.id)}
                column={column}
                title={field.label}
                options={field.options}
              />
            );
          })}
          {enableAdvancedFilter && advancedFilterFields.length > 0 && (
            <FilterBuilder
              fields={advancedFilterFields}
              value={localFilter}
              onChange={handleAdvancedFilterChange}
              variant="popover"
            />
          )}
        </div>

        <div className="lg:hidden">
          <MobileFiltersDrawer
            open={mobileFiltersOpen}
            onOpenChange={setMobileFiltersOpen}
            table={table}
            filterFields={filterFields}
            advancedFilterFields={advancedFilterFields}
            advancedFilter={localFilter}
            onAdvancedFilterChange={handleAdvancedFilterChange}
            activeFilterCount={activeFilterCount}
            onReset={resetAllFilters}
            enableAdvancedFilter={enableAdvancedFilter}
          />
        </div>

        {isFiltered && (
          <Button
            variant="ghost"
            onClick={resetAllFilters}
            className="hidden lg:flex h-9 px-3 rounded-xl text-muted-foreground hover:text-foreground"
          >
            Reset
            <X className="ml-2 size-4" aria-hidden="true" />
          </Button>
        )}

        <div className="flex items-center gap-2 ml-auto">
          {children}

          {onRefresh && (
            <Button
              variant="outline"
              size="icon"
              onClick={onRefresh}
              disabled={isLoading}
              className="size-9 rounded-xl"
            >
              <RefreshCw
                className={cn("size-4", isLoading && "animate-spin")}
              />
            </Button>
          )}

          {enableExport && onExport && (
            <Button
              variant="outline"
              size="sm"
              onClick={onExport}
              className="hidden sm:flex h-9 gap-2 rounded-xl"
            >
              <Download className="size-4" />
              <span className="hidden md:inline">Export</span>
            </Button>
          )}

          {enableColumnVisibility && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 gap-2 rounded-xl"
                >
                  <Columns className="size-4" />
                  <span className="hidden md:inline">Columns</span>
                  <ChevronDown className="size-3.5 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 rounded-xl">
                <DropdownMenuLabel className="font-normal text-xs text-muted-foreground">
                  Toggle columns
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {columns.map((column) => {
                  const columnMeta = column.columnDef.meta;
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize rounded-lg"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {columnMeta?.label ?? column.id}
                    </DropdownMenuCheckboxItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {searchKey && searchOpen && (
        <div className="sm:hidden">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder={searchPlaceholder}
              value={
                (table.getColumn(searchKey)?.getFilterValue() as string) ?? ""
              }
              onChange={(event) =>
                table.getColumn(searchKey)?.setFilterValue(event.target.value)
              }
              className="h-10 pl-9 rounded-xl bg-background"
              autoFocus
            />
            {(table.getColumn(searchKey)?.getFilterValue() as string) && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 size-8"
                onClick={() => table.getColumn(searchKey)?.setFilterValue("")}
              >
                <X className="size-4" />
              </Button>
            )}
          </div>
        </div>
      )}

      {enableAdvancedFilter &&
        advancedFilterFields.length > 0 &&
        localFilter.conditions.length > 0 && (
          <div className="hidden lg:block">
            <ActiveFilters
              fields={advancedFilterFields}
              value={localFilter}
              onChange={handleAdvancedFilterChange}
            />
          </div>
        )}
    </div>
  );
}

interface MobileFiltersDrawerProps<TData> {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  table: Table<TData>;
  filterFields: DataTableFilterField<TData>[];
  advancedFilterFields: FilterFieldDefinition[];
  advancedFilter: AdvancedFilterState;
  onAdvancedFilterChange: (filter: AdvancedFilterState) => void;
  activeFilterCount: number;
  onReset: () => void;
  enableAdvancedFilter: boolean;
}

function MobileFiltersDrawer<TData>({
  open,
  onOpenChange,
  table,
  filterFields,
  advancedFilterFields,
  advancedFilter,
  onAdvancedFilterChange,
  activeFilterCount,
  onReset,
  enableAdvancedFilter,
}: MobileFiltersDrawerProps<TData>) {
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerTrigger asChild>
        <Button variant="outline" size="sm" className="h-9 gap-2 rounded-xl">
          <SlidersHorizontal className="size-4" />
          <span>Filters</span>
          {activeFilterCount > 0 && (
            <Badge
              variant="secondary"
              className="rounded-full px-1.5 py-0 text-xs font-normal"
            >
              {activeFilterCount}
            </Badge>
          )}
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Filters</DrawerTitle>
          <DrawerDescription>
            Refine your results with filters
          </DrawerDescription>
        </DrawerHeader>
        <div className="px-4 pb-4 space-y-4 max-h-[60vh] overflow-y-auto">
          {filterFields.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium">Quick Filters</h4>
              <div className="flex flex-wrap gap-2">
                {filterFields.map((field) => {
                  const column = table.getColumn(String(field.id));
                  if (!column || !field.options) return null;

                  return (
                    <DataTableFacetedFilter
                      key={String(field.id)}
                      column={column}
                      title={field.label}
                      options={field.options}
                    />
                  );
                })}
              </div>
            </div>
          )}

          {enableAdvancedFilter && advancedFilterFields.length > 0 && (
            <>
              {filterFields.length > 0 && <Separator />}
              <div className="space-y-3">
                <h4 className="text-sm font-medium">Advanced Filters</h4>
                <FilterBuilder
                  fields={advancedFilterFields}
                  value={advancedFilter}
                  onChange={onAdvancedFilterChange}
                  variant="inline"
                />
              </div>
            </>
          )}
        </div>
        <DrawerFooter className="flex-row gap-2">
          <Button
            variant="outline"
            onClick={onReset}
            disabled={activeFilterCount === 0}
            className="flex-1 rounded-xl"
          >
            Clear All
          </Button>
          <Button
            onClick={() => onOpenChange(false)}
            className="flex-1 rounded-xl"
          >
            Apply
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
