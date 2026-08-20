"use client";

import { motion, AnimatePresence } from "@asym/lib/motion";
import { Badge } from "@asym/ui/components/shadcn/badge";
import { Button } from "@asym/ui/components/shadcn/button";
import { Card } from "@asym/ui/components/shadcn/card";
import { DataTableResponsive } from "@asym/ui/components/shadcn/data-table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@asym/ui/components/shadcn/dropdown-menu";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@asym/ui/components/shadcn/empty";
import { Field, FieldLabel } from "@asym/ui/components/shadcn/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@asym/ui/components/shadcn/input-group";
import { cn } from "@asym/ui/lib/utils";
import { Search, Filter, ArrowDownUp, X, Loader2 } from "lucide-react";
import * as React from "react";

import { AVAILABLE_TAGS, getTagLabel, getTagStyle } from "./donors-model";
import { createDonorColumns } from "./donors-page-columns";
import {
  scaleIn,
  smoothTransition,
  springTransition,
} from "./donors-page-motion";
import { DonorListSkeleton, ErrorState } from "./donors-page-states";
import { useDonorsPageViewFields } from "./use-donors-page-view";

import type { SortOption } from "./donors-list-model";

export function DonorsPageRoster() {
  const view = useDonorsPageViewFields();
  const { isLoading, error } = view.status;
  const {
    filtered: filteredDonors,
    selected: selectedDonor,
    selectById,
    hasMore: hasMoreDonors,
    isLoadingMore: isLoadingMoreDonors,
    loadMore: loadMoreDonors,
  } = view.donors;
  const {
    searchTerm,
    statusFilter,
    tagFilter,
    pledgeFilter,
    hasActiveFilters,
    setSearchTerm,
    setStatusFilter,
    setPledgeFilter,
    toggleTag: toggleFilterTag,
    removeTag: removeFilterTag,
    clearAll: clearAllFilters,
  } = view.filters;
  const { sortBy, sortAsc, setSortBy, toggleSortAsc } = view.sorting;
  const { refreshDonors } = view.actions;
  const donorColumns = React.useMemo(
    () => createDonorColumns(selectedDonor?.id ?? null),
    [selectedDonor?.id],
  );
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ ...smoothTransition, delay: 0.2 }}
      className="lg:col-span-4 xl:col-span-3"
    >
      <Card className="border-zinc-200 bg-white rounded-2xl overflow-hidden shadow-sm h-full flex flex-col">
        <div className="p-4 border-b border-zinc-100 space-y-4 shrink-0">
          <div className="flex items-center justify-between">
            <h2 className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400">
              Partner List{" "}
              {hasActiveFilters && (
                <span className="text-blue-600">({filteredDonors.length})</span>
              )}
            </h2>
            <div className="flex gap-1">
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Sort partners"
                      className="size-8 text-zinc-400 hover:text-zinc-900 rounded-lg"
                    >
                      <ArrowDownUp className="size-4" />
                    </Button>
                  }
                />
                <DropdownMenuContent
                  align="end"
                  className="w-48 rounded-xl border-zinc-100 shadow-xl"
                >
                  <DropdownMenuLabel className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400">
                    Sort By
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-zinc-100" />
                  <DropdownMenuGroup>
                    {[
                      { value: "last_gift", label: "Last Gift Date" },
                      { value: "total_given", label: "Total Given" },
                      { value: "name", label: "Name" },
                      { value: "joined_date", label: "Partner Since" },
                    ].map((opt) => (
                      <DropdownMenuCheckboxItem
                        key={opt.value}
                        checked={sortBy === opt.value}
                        onCheckedChange={() =>
                          setSortBy(opt.value as SortOption)
                        }
                        className="text-xs font-medium"
                      >
                        {opt.label}
                      </DropdownMenuCheckboxItem>
                    ))}
                    <DropdownMenuSeparator className="bg-zinc-100" />
                    <DropdownMenuCheckboxItem
                      checked={sortAsc}
                      onCheckedChange={toggleSortAsc}
                      className="text-xs font-medium"
                    >
                      Ascending
                    </DropdownMenuCheckboxItem>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Filter partners"
                      className={cn(
                        "size-8 rounded-lg",
                        hasActiveFilters
                          ? "text-blue-600 bg-blue-50"
                          : "text-zinc-400 hover:text-zinc-900",
                      )}
                    >
                      <Filter className="size-4" />
                    </Button>
                  }
                />
                <DropdownMenuContent
                  align="end"
                  className="w-56 rounded-xl border-zinc-100 shadow-xl max-h-[400px] overflow-y-auto"
                >
                  <DropdownMenuLabel className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400">
                    Filter by Status
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-zinc-100" />
                  <DropdownMenuGroup>
                    {[
                      "All",
                      "Active",
                      "New",
                      "Lapsed",
                      "At Risk",
                      "Needs Attention",
                    ].map((s) => (
                      <DropdownMenuCheckboxItem
                        key={s}
                        checked={statusFilter === s}
                        onCheckedChange={() => setStatusFilter(s)}
                        className="text-xs font-medium"
                      >
                        {s}
                      </DropdownMenuCheckboxItem>
                    ))}
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator className="bg-zinc-100" />
                  <DropdownMenuLabel className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400">
                    Filter by Recurring
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-zinc-100" />
                  <DropdownMenuGroup>
                    {["All", "Active", "Inactive"].map((p) => (
                      <DropdownMenuCheckboxItem
                        key={p}
                        checked={pledgeFilter === p}
                        onCheckedChange={() => setPledgeFilter(p)}
                        className="text-xs font-medium"
                      >
                        {p === "Active"
                          ? "Has Recurring"
                          : p === "Inactive"
                            ? "No Recurring"
                            : "All"}
                      </DropdownMenuCheckboxItem>
                    ))}
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator className="bg-zinc-100" />
                  <DropdownMenuLabel className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400">
                    Filter by Tag
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-zinc-100" />
                  <DropdownMenuGroup>
                    {AVAILABLE_TAGS.map((tag) => (
                      <DropdownMenuCheckboxItem
                        key={tag.id}
                        checked={tagFilter.includes(tag.id)}
                        onCheckedChange={() => toggleFilterTag(tag.id)}
                        className="text-xs font-medium"
                      >
                        {tag.label}
                      </DropdownMenuCheckboxItem>
                    ))}
                  </DropdownMenuGroup>
                  {hasActiveFilters && (
                    <>
                      <DropdownMenuSeparator className="bg-zinc-100" />
                      <DropdownMenuItem
                        onClick={clearAllFilters}
                        className="text-xs font-medium text-rose-600"
                      >
                        Clear All Filters
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          <Field>
            <FieldLabel htmlFor="partners-search" className="sr-only">
              Search partners
            </FieldLabel>
            <InputGroup className="h-10 rounded-xl bg-zinc-50 border-zinc-100">
              <InputGroupInput
                id="partners-search"
                placeholder="Search partners..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <InputGroupAddon align="inline-start">
                <Search className="size-4 text-zinc-400" />
              </InputGroupAddon>
            </InputGroup>
          </Field>
          <AnimatePresence mode="popLayout">
            {hasActiveFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="flex flex-wrap gap-1.5 overflow-hidden"
              >
                {statusFilter !== "All" && (
                  <motion.div layout {...scaleIn} transition={springTransition}>
                    <Badge
                      variant="outline"
                      className="text-[9px] font-semibold uppercase tracking-widest px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-600 border-zinc-200"
                    >
                      {statusFilter}
                      <button
                        type="button"
                        aria-label={`Clear ${statusFilter} status filter`}
                        onClick={() => setStatusFilter("All")}
                        className="ml-1 hover:text-zinc-900"
                      >
                        <X className="size-2.5" />
                      </button>
                    </Badge>
                  </motion.div>
                )}
                {pledgeFilter !== "All" && (
                  <motion.div layout {...scaleIn} transition={springTransition}>
                    <Badge
                      variant="outline"
                      className="text-[9px] font-semibold uppercase tracking-widest px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border-blue-200"
                    >
                      {pledgeFilter === "Active" ? "Recurring" : "No Recurring"}
                      <button
                        type="button"
                        aria-label="Clear recurring filter"
                        onClick={() => setPledgeFilter("All")}
                        className="ml-1 hover:text-blue-900"
                      >
                        <X className="size-2.5" />
                      </button>
                    </Badge>
                  </motion.div>
                )}
                {tagFilter.map((tag) => (
                  <motion.div
                    key={tag}
                    layout
                    {...scaleIn}
                    transition={springTransition}
                  >
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-[9px] font-semibold uppercase tracking-widest px-2 py-0.5 rounded-full border",
                        getTagStyle(tag),
                      )}
                    >
                      {getTagLabel(tag)}
                      <button
                        type="button"
                        aria-label={`Clear ${getTagLabel(tag)} tag filter`}
                        onClick={() => removeFilterTag(tag)}
                        className="ml-1"
                      >
                        <X className="size-2.5" />
                      </button>
                    </Badge>
                  </motion.div>
                ))}
                <motion.button
                  type="button"
                  layout
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={clearAllFilters}
                  className="text-[9px] font-semibold uppercase tracking-widest text-rose-500 hover:text-rose-700 px-2"
                >
                  Clear All
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex-1 min-h-0">
          {error ? (
            <ErrorState message={error} onRetry={refreshDonors} />
          ) : isLoading ? (
            <DonorListSkeleton />
          ) : filteredDonors.length === 0 ? (
            <Empty className="h-64 border-none">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <Search />
                </EmptyMedia>
                <EmptyTitle className="text-sm">No partners found</EmptyTitle>
                <EmptyDescription>
                  {hasActiveFilters
                    ? "Try adjusting your filters"
                    : "Add your first partner to get started"}
                </EmptyDescription>
              </EmptyHeader>
              {hasActiveFilters ? (
                <EmptyContent>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearAllFilters}
                    className="h-8 rounded-xl text-xs"
                  >
                    Clear Filters
                  </Button>
                </EmptyContent>
              ) : null}
            </Empty>
          ) : (
            <DataTableResponsive
              columns={donorColumns}
              data={filteredDonors}
              config={{
                enableRowSelection: false,
                enableColumnVisibility: true,
                enablePagination: false,
                enableFilters: false,
                enableSorting: false,
                virtualization: {
                  enabled: true,
                  estimateSize: 88,
                  overscan: 10,
                  containerHeight: 640,
                },
              }}
              mobileCardConfig={{
                primaryField: "name",
                secondaryField: "location",
                badgeField: "status",
              }}
              onRowClick={(row) => selectById(row.original.id)}
            />
          )}
        </div>
        {hasMoreDonors && !error && !isLoading && (
          <div className="border-t border-zinc-100 p-3 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={loadMoreDonors}
              disabled={isLoadingMoreDonors}
              className="w-full h-9 rounded-xl text-[10px] font-semibold uppercase tracking-widest text-zinc-500 hover:text-zinc-900"
            >
              {isLoadingMoreDonors ? (
                <>
                  <Loader2 data-icon="inline-start" className="animate-spin" />
                  Loading partners
                </>
              ) : (
                "Load more partners"
              )}
            </Button>
          </div>
        )}
      </Card>
    </motion.div>
  );
}
