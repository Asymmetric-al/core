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
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@asym/ui/components/shadcn/dropdown-menu";
import { Input } from "@asym/ui/components/shadcn/input";
import { ScrollArea } from "@asym/ui/components/shadcn/scroll-area";
import { cn } from "@asym/ui/lib/utils";
import { Search, Filter, ArrowDownUp, X, Loader2 } from "lucide-react";
import * as React from "react";

import { AVAILABLE_TAGS, getTagLabel, getTagStyle } from "./donors-model";
import { createDonorColumns } from "./donors-page-columns";
import {
  fadeInUp,
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
                  {[
                    { value: "last_gift", label: "Last Gift Date" },
                    { value: "total_given", label: "Total Given" },
                    { value: "name", label: "Name" },
                    { value: "joined_date", label: "Partner Since" },
                  ].map((opt) => (
                    <DropdownMenuCheckboxItem
                      key={opt.value}
                      checked={sortBy === opt.value}
                      onCheckedChange={() => setSortBy(opt.value as SortOption)}
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
                </DropdownMenuContent>
              </DropdownMenu>
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <Button
                      variant="ghost"
                      size="icon"
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
                  {["All", "Active", "New", "Lapsed", "At Risk"].map((s) => (
                    <DropdownMenuCheckboxItem
                      key={s}
                      checked={statusFilter === s}
                      onCheckedChange={() => setStatusFilter(s)}
                      className="text-xs font-medium"
                    >
                      {s}
                    </DropdownMenuCheckboxItem>
                  ))}
                  <DropdownMenuSeparator className="bg-zinc-100" />
                  <DropdownMenuLabel className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400">
                    Filter by Recurring
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-zinc-100" />
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
                  <DropdownMenuSeparator className="bg-zinc-100" />
                  <DropdownMenuLabel className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400">
                    Filter by Tag
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-zinc-100" />
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
          <div className="relative">
            <Search className="absolute left-3 top-2.5 size-4 text-zinc-400" />
            <Input
              placeholder="Search partners..."
              className="pl-9 bg-zinc-50 border-zinc-100 focus:bg-white focus:border-zinc-300 transition-[color,background-color,border-color,box-shadow,transform,opacity] h-10 rounded-xl text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
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
                        onClick={() => removeFilterTag(tag)}
                        className="ml-1"
                      >
                        <X className="size-2.5" />
                      </button>
                    </Badge>
                  </motion.div>
                ))}
                <motion.button
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
          <ScrollArea className="h-full">
            {error ? (
              <ErrorState message={error} onRetry={refreshDonors} />
            ) : isLoading ? (
              <DonorListSkeleton />
            ) : filteredDonors.length === 0 ? (
              <motion.div
                {...fadeInUp}
                transition={smoothTransition}
                className="flex flex-col items-center justify-center h-64 text-center p-6"
              >
                <motion.div
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  transition={springTransition}
                  className="size-14 bg-zinc-100 rounded-2xl flex items-center justify-center mb-4"
                >
                  <Search className="size-6 text-zinc-300" />
                </motion.div>
                <p className="text-sm font-semibold text-zinc-900">
                  No partners found
                </p>
                <p className="text-xs text-zinc-400 mt-1">
                  {hasActiveFilters
                    ? "Try adjusting your filters"
                    : "Add your first partner to get started"}
                </p>
                {hasActiveFilters && (
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={clearAllFilters}
                      className="mt-4 h-8 rounded-xl text-xs"
                    >
                      Clear Filters
                    </Button>
                  </motion.div>
                )}
              </motion.div>
            ) : (
              <DataTableResponsive
                columns={donorColumns}
                data={filteredDonors}
                config={{
                  enableRowSelection: false,
                  enableColumnVisibility: true,
                  enablePagination: true,
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
                emptyState={
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <p className="text-sm font-semibold text-zinc-900">
                      No partners found
                    </p>
                    <p className="text-xs text-zinc-400 mt-1">
                      {hasActiveFilters
                        ? "Try adjusting your filters."
                        : "Add your first partner to get started."}
                    </p>
                  </div>
                }
              />
            )}
          </ScrollArea>
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
                  <Loader2 className="size-3.5 mr-2 animate-spin" />
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
