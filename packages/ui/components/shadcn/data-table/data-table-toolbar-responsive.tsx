"use client";

import {
  Search,
  X,
  SlidersHorizontal,
  Columns,
  Download,
  RefreshCw,
  ChevronDown,
} from "lucide-react";
import * as React from "react";

import { cn } from "@asym/ui/lib/utils";

import { Badge } from "../badge";
import { Button } from "../button";
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
import { Input } from "../input";
import { Separator } from "../separator";
import { DataTableFacetedFilter } from "./data-table-faceted-filter";
import { FilterBuilder, ActiveFilters } from "./filters/filter-builder";
import {
  createEmptyFilterState,
  type AdvancedFilterState,
  type FilterFieldDefinition,
} from "./filters/types";

import type { RowData, Table } from "./tanstack";
import type { DataTableFilterField } from "./types";

interface DataTableToolbarResponsiveProps<TData extends RowData> {
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
  /** Disable filter/search controls while URL query state is updating (nuqs). */
  urlStatePending?: boolean;
  className?: string;
  children?: React.ReactNode;
}

const EMPTY_FILTER_FIELDS: DataTableFilterField<unknown>[] = [];
const EMPTY_ADVANCED_FILTER_FIELDS: FilterFieldDefinition[] = [];

function DataTableToolbarSearch<TData extends RowData>({
  table,
  searchKey,
  searchPlaceholder,
  urlStatePending,
  searchOpen,
  onSearchOpenChange,
}: {
  table: Table<TData>;
  searchKey?: string;
  searchPlaceholder: string;
  urlStatePending: boolean;
  searchOpen: boolean;
  onSearchOpenChange: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  if (!searchKey) {
    return null;
  }

  return (
    <>
      <div className="relative hidden sm:block flex-1 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          placeholder={searchPlaceholder}
          value={(table.getColumn(searchKey)?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn(searchKey)?.setFilterValue(event.target.value)
          }
          disabled={urlStatePending}
          aria-busy={urlStatePending || undefined}
          className="h-9 pl-9 rounded-xl bg-background"
        />
        {(table.getColumn(searchKey)?.getFilterValue() as string) && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 -translate-y-1/2 size-7"
            onClick={() => table.getColumn(searchKey)?.setFilterValue("")}
            aria-label="Clear search"
          >
            <X className="size-3.5" />
          </Button>
        )}
      </div>
      <Button
        variant="outline"
        size="icon"
        className="sm:hidden size-9 rounded-xl"
        onClick={() => onSearchOpenChange((prev) => !prev)}
        disabled={urlStatePending}
        aria-label={searchOpen ? "Close search" : "Open search"}
        aria-expanded={searchOpen}
      >
        <Search className="size-4" />
      </Button>
    </>
  );
}

function DataTableToolbarFacetFilters<TData extends RowData>({
  table,
  filterFields,
  enableAdvancedFilter,
  advancedFilterFields,
  localFilter,
  onAdvancedFilterChange,
  urlStatePending,
}: {
  table: Table<TData>;
  filterFields: DataTableFilterField<TData>[];
  enableAdvancedFilter: boolean;
  advancedFilterFields: FilterFieldDefinition[];
  localFilter: AdvancedFilterState;
  onAdvancedFilterChange: (filter: AdvancedFilterState) => void;
  urlStatePending: boolean;
}) {
  return (
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
            disabled={urlStatePending}
          />
        );
      })}
      {enableAdvancedFilter && advancedFilterFields.length > 0 && (
        <FilterBuilder
          fields={advancedFilterFields}
          value={localFilter}
          onChange={onAdvancedFilterChange}
          variant="popover"
        />
      )}
    </div>
  );
}

function DataTableToolbarActions<TData extends RowData>({
  table,
  children,
  onRefresh,
  isLoading,
  enableExport,
  onExport,
  enableColumnVisibility,
  urlStatePending,
}: {
  table: Table<TData>;
  children?: React.ReactNode;
  onRefresh?: () => void;
  isLoading: boolean;
  enableExport: boolean;
  onExport?: () => void;
  enableColumnVisibility: boolean;
  urlStatePending: boolean;
}) {
  const columns = table
    .getAllColumns()
    .filter(
      (column) =>
        typeof column.accessorFn !== "undefined" && column.getCanHide(),
    );

  return (
    <div className="flex items-center gap-2 ml-auto">
      {children}

      {onRefresh && (
        <Button
          variant="outline"
          size="icon"
          onClick={onRefresh}
          disabled={isLoading}
          aria-label="Refresh"
          className="size-9 rounded-xl"
        >
          <RefreshCw className={cn("size-4", isLoading && "animate-spin")} />
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
          <DropdownMenuTrigger
            render={
              <Button
                variant="outline"
                size="sm"
                disabled={urlStatePending}
                className="h-9 gap-2 rounded-xl"
              >
                <Columns data-icon="inline-start" />
                <span className="hidden md:inline">Columns</span>
                <ChevronDown data-icon="inline-end" className="opacity-50" />
              </Button>
            }
          />
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
                  onCheckedChange={(value) => column.toggleVisibility(!!value)}
                >
                  {columnMeta?.label ?? column.id}
                </DropdownMenuCheckboxItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}

function DataTableToolbarMobileSearch<TData extends RowData>({
  table,
  searchKey,
  searchOpen,
  searchPlaceholder,
  urlStatePending,
  mobileSearchInputRef,
}: {
  table: Table<TData>;
  searchKey?: string;
  searchOpen: boolean;
  searchPlaceholder: string;
  urlStatePending: boolean;
  mobileSearchInputRef: React.RefObject<HTMLInputElement | null>;
}) {
  if (!searchKey || !searchOpen) {
    return null;
  }

  return (
    <div className="sm:hidden">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          ref={mobileSearchInputRef}
          placeholder={searchPlaceholder}
          value={(table.getColumn(searchKey)?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn(searchKey)?.setFilterValue(event.target.value)
          }
          disabled={urlStatePending}
          aria-busy={urlStatePending || undefined}
          className="h-10 pl-9 rounded-xl bg-background"
        />
        {(table.getColumn(searchKey)?.getFilterValue() as string) && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 -translate-y-1/2 size-8"
            onClick={() => table.getColumn(searchKey)?.setFilterValue("")}
            aria-label="Clear search"
          >
            <X className="size-4" />
          </Button>
        )}
      </div>
    </div>
  );
}

function DataTableToolbarActiveFilters({
  enableAdvancedFilter,
  advancedFilterFields,
  localFilter,
  onChange,
}: {
  enableAdvancedFilter: boolean;
  advancedFilterFields: FilterFieldDefinition[];
  localFilter: AdvancedFilterState;
  onChange: (filter: AdvancedFilterState) => void;
}) {
  if (
    !enableAdvancedFilter ||
    advancedFilterFields.length === 0 ||
    localFilter.conditions.length === 0
  ) {
    return null;
  }

  return (
    <div className="hidden lg:block">
      <ActiveFilters
        fields={advancedFilterFields}
        value={localFilter}
        onChange={onChange}
      />
    </div>
  );
}

export function DataTableToolbarResponsive<TData extends RowData>({
  table,
  filterFields = EMPTY_FILTER_FIELDS as DataTableFilterField<TData>[],
  advancedFilterFields = EMPTY_ADVANCED_FILTER_FIELDS,
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
  urlStatePending = false,
  className,
  children,
}: DataTableToolbarResponsiveProps<TData>) {
  const [mobileFiltersOpen, setMobileFiltersOpen] = React.useState(false);
  const [searchOpen, setSearchOpen] = React.useState(false);
  const mobileSearchInputRef = React.useRef<HTMLInputElement>(null);
  // v9 removed `table.getState()`; `table.state` is the render-read surface.
  const isFiltered = table.state.columnFilters.length > 0;
  const [localFilter, setLocalFilter] = React.useState<AdvancedFilterState>(
    advancedFilter ?? createEmptyFilterState(),
  );

  const activeFilterCount = React.useMemo(() => {
    let count = table.state.columnFilters.length;
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

  React.useEffect(() => {
    if (!searchOpen) return;
    mobileSearchInputRef.current?.focus();
  }, [searchOpen]);

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <div className="flex items-center gap-2">
        <DataTableToolbarSearch
          table={table}
          searchKey={searchKey}
          searchPlaceholder={searchPlaceholder}
          urlStatePending={urlStatePending}
          searchOpen={searchOpen}
          onSearchOpenChange={setSearchOpen}
        />

        <DataTableToolbarFacetFilters
          table={table}
          filterFields={filterFields}
          enableAdvancedFilter={enableAdvancedFilter}
          advancedFilterFields={advancedFilterFields}
          localFilter={localFilter}
          onAdvancedFilterChange={handleAdvancedFilterChange}
          urlStatePending={urlStatePending}
        />

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
            urlStatePending={urlStatePending}
          />
        </div>

        {isFiltered && (
          <Button
            variant="ghost"
            onClick={resetAllFilters}
            disabled={urlStatePending}
            className="hidden lg:flex h-9 px-3 rounded-xl text-muted-foreground hover:text-foreground"
          >
            Reset
            <X className="ml-2 size-4" aria-hidden="true" />
          </Button>
        )}

        <DataTableToolbarActions
          table={table}
          onRefresh={onRefresh}
          isLoading={isLoading}
          enableExport={enableExport}
          onExport={onExport}
          enableColumnVisibility={enableColumnVisibility}
          urlStatePending={urlStatePending}
        >
          {children}
        </DataTableToolbarActions>
      </div>

      <DataTableToolbarMobileSearch
        table={table}
        searchKey={searchKey}
        searchOpen={searchOpen}
        searchPlaceholder={searchPlaceholder}
        urlStatePending={urlStatePending}
        mobileSearchInputRef={mobileSearchInputRef}
      />

      <DataTableToolbarActiveFilters
        enableAdvancedFilter={enableAdvancedFilter}
        advancedFilterFields={advancedFilterFields}
        localFilter={localFilter}
        onChange={handleAdvancedFilterChange}
      />
    </div>
  );
}

interface MobileFiltersDrawerProps<TData extends RowData> {
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
  urlStatePending?: boolean;
}

function MobileFiltersDrawer<TData extends RowData>({
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
  urlStatePending = false,
}: MobileFiltersDrawerProps<TData>) {
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerTrigger
        render={
          <Button
            variant="outline"
            size="sm"
            className="h-9 gap-2 rounded-xl"
            disabled={urlStatePending}
          >
            <SlidersHorizontal data-icon="inline-start" />
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
        }
      />
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
                      disabled={urlStatePending}
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
            disabled={activeFilterCount === 0 || urlStatePending}
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
