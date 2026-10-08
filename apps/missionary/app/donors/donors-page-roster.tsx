"use client";

import { motion, AnimatePresence } from "@asym/lib/motion";
import { Badge } from "@asym/ui/components/shadcn/badge";
import { Button } from "@asym/ui/components/shadcn/button";
import { Card, CardHeader, CardTitle } from "@asym/ui/components/shadcn/card";
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
import { Spinner } from "@asym/ui/components/shadcn/spinner";
import { Search, Filter, ArrowDownUp, X } from "lucide-react";
import * as React from "react";

import { AVAILABLE_TAGS, getTagLabel, getTagVariant } from "./donors-model";
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
      <Card className="overflow-hidden h-full flex flex-col">
        <CardHeader className="flex flex-col gap-4 shrink-0">
          <div className="flex items-center justify-between">
            <CardTitle role="heading" aria-level={2}>
              Partner List{" "}
              {hasActiveFilters && (
                <span className="text-primary">({filteredDonors.length})</span>
              )}
            </CardTitle>
            <div className="flex gap-1">
              <DonorRosterSorting
                sortBy={sortBy}
                setSortBy={setSortBy}
                sortAsc={sortAsc}
                toggleSortAsc={toggleSortAsc}
              />
              <DonorRosterFilterMenu
                hasActiveFilters={hasActiveFilters}
                statusFilter={statusFilter}
                setStatusFilter={setStatusFilter}
                pledgeFilter={pledgeFilter}
                setPledgeFilter={setPledgeFilter}
                tagFilter={tagFilter}
                toggleFilterTag={toggleFilterTag}
                clearAllFilters={clearAllFilters}
              />
            </div>
          </div>
          <DonorRosterSearch
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
          />
          <DonorRosterActiveFilters
            hasActiveFilters={hasActiveFilters}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            pledgeFilter={pledgeFilter}
            setPledgeFilter={setPledgeFilter}
            tagFilter={tagFilter}
            removeFilterTag={removeFilterTag}
            clearAllFilters={clearAllFilters}
          />
        </CardHeader>

        <DonorRosterResults
          error={error}
          refreshDonors={refreshDonors}
          isLoading={isLoading}
          filteredDonors={filteredDonors}
          hasActiveFilters={hasActiveFilters}
          clearAllFilters={clearAllFilters}
          donorColumns={donorColumns}
          selectById={selectById}
        />
        <DonorRosterLoadMore
          hasMoreDonors={hasMoreDonors}
          error={error}
          isLoading={isLoading}
          loadMoreDonors={loadMoreDonors}
          isLoadingMoreDonors={isLoadingMoreDonors}
        />
      </Card>
    </motion.div>
  );
}

function DonorRosterSorting({
  sortBy,
  setSortBy,
  sortAsc,
  toggleSortAsc,
}: {
  sortBy: ReturnType<typeof useDonorsPageViewFields>["sorting"]["sortBy"];
  setSortBy: ReturnType<typeof useDonorsPageViewFields>["sorting"]["setSortBy"];
  sortAsc: ReturnType<typeof useDonorsPageViewFields>["sorting"]["sortAsc"];
  toggleSortAsc: ReturnType<
    typeof useDonorsPageViewFields
  >["sorting"]["toggleSortAsc"];
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="ghost" size="icon" aria-label="Sort partners">
            <ArrowDownUp data-icon="inline-start" />
          </Button>
        }
      />
      <DropdownMenuContent align="end">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Sort By</DropdownMenuLabel>
          <DropdownMenuSeparator />
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
            >
              {opt.label}
            </DropdownMenuCheckboxItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuCheckboxItem
            checked={sortAsc}
            onCheckedChange={toggleSortAsc}
          >
            Ascending
          </DropdownMenuCheckboxItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function DonorRosterFilterMenu({
  hasActiveFilters,
  statusFilter,
  setStatusFilter,
  pledgeFilter,
  setPledgeFilter,
  tagFilter,
  toggleFilterTag,
  clearAllFilters,
}: {
  hasActiveFilters: ReturnType<
    typeof useDonorsPageViewFields
  >["filters"]["hasActiveFilters"];
  statusFilter: ReturnType<
    typeof useDonorsPageViewFields
  >["filters"]["statusFilter"];
  setStatusFilter: ReturnType<
    typeof useDonorsPageViewFields
  >["filters"]["setStatusFilter"];
  pledgeFilter: ReturnType<
    typeof useDonorsPageViewFields
  >["filters"]["pledgeFilter"];
  setPledgeFilter: ReturnType<
    typeof useDonorsPageViewFields
  >["filters"]["setPledgeFilter"];
  tagFilter: ReturnType<typeof useDonorsPageViewFields>["filters"]["tagFilter"];
  toggleFilterTag: ReturnType<
    typeof useDonorsPageViewFields
  >["filters"]["toggleTag"];
  clearAllFilters: ReturnType<
    typeof useDonorsPageViewFields
  >["filters"]["clearAll"];
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant={hasActiveFilters ? "secondary" : "ghost"}
            size="icon"
            aria-label="Filter partners"
          >
            <Filter data-icon="inline-start" />
          </Button>
        }
      />
      <DropdownMenuContent align="end">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {["All", "Active", "New", "Lapsed", "At Risk", "Needs Attention"].map(
            (s) => (
              <DropdownMenuCheckboxItem
                key={s}
                checked={statusFilter === s}
                onCheckedChange={() => setStatusFilter(s)}
              >
                {s}
              </DropdownMenuCheckboxItem>
            ),
          )}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuLabel>Filter by Recurring</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {["All", "Active", "Inactive"].map((p) => (
            <DropdownMenuCheckboxItem
              key={p}
              checked={pledgeFilter === p}
              onCheckedChange={() => setPledgeFilter(p)}
            >
              {p === "Active"
                ? "Has Recurring"
                : p === "Inactive"
                  ? "No Recurring"
                  : "All"}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuLabel>Filter by Tag</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {AVAILABLE_TAGS.map((tag) => (
            <DropdownMenuCheckboxItem
              key={tag.id}
              checked={tagFilter.includes(tag.id)}
              onCheckedChange={() => toggleFilterTag(tag.id)}
            >
              {tag.label}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuGroup>
        {hasActiveFilters && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={clearAllFilters}>
                Clear All Filters
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function DonorRosterSearch({
  searchTerm,
  setSearchTerm,
}: {
  searchTerm: ReturnType<
    typeof useDonorsPageViewFields
  >["filters"]["searchTerm"];
  setSearchTerm: ReturnType<
    typeof useDonorsPageViewFields
  >["filters"]["setSearchTerm"];
}) {
  return (
    <Field>
      <FieldLabel htmlFor="partners-search" className="sr-only">
        Search partners
      </FieldLabel>
      <InputGroup>
        <InputGroupInput
          id="partners-search"
          placeholder="Search partners..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <InputGroupAddon align="inline-start">
          <Search className="size-4 text-muted-foreground" />
        </InputGroupAddon>
      </InputGroup>
    </Field>
  );
}

function DonorRosterActiveFilters({
  hasActiveFilters,
  statusFilter,
  setStatusFilter,
  pledgeFilter,
  setPledgeFilter,
  tagFilter,
  removeFilterTag,
  clearAllFilters,
}: {
  hasActiveFilters: ReturnType<
    typeof useDonorsPageViewFields
  >["filters"]["hasActiveFilters"];
  statusFilter: ReturnType<
    typeof useDonorsPageViewFields
  >["filters"]["statusFilter"];
  setStatusFilter: ReturnType<
    typeof useDonorsPageViewFields
  >["filters"]["setStatusFilter"];
  pledgeFilter: ReturnType<
    typeof useDonorsPageViewFields
  >["filters"]["pledgeFilter"];
  setPledgeFilter: ReturnType<
    typeof useDonorsPageViewFields
  >["filters"]["setPledgeFilter"];
  tagFilter: ReturnType<typeof useDonorsPageViewFields>["filters"]["tagFilter"];
  removeFilterTag: ReturnType<
    typeof useDonorsPageViewFields
  >["filters"]["removeTag"];
  clearAllFilters: ReturnType<
    typeof useDonorsPageViewFields
  >["filters"]["clearAll"];
}) {
  return (
    <AnimatePresence mode="popLayout">
      {hasActiveFilters && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          className="flex flex-wrap gap-1.5 overflow-hidden"
        >
          {statusFilter !== "All" && (
            <motion.div
              layout
              initial={scaleIn.initial}
              animate={scaleIn.animate}
              exit={scaleIn.exit}
              transition={springTransition}
            >
              <Badge variant="outline">
                {statusFilter}
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  aria-label={`Clear ${statusFilter} status filter`}
                  onClick={() => setStatusFilter("All")}
                  className="ml-1"
                >
                  <X aria-hidden />
                </Button>
              </Badge>
            </motion.div>
          )}
          {pledgeFilter !== "All" && (
            <motion.div
              layout
              initial={scaleIn.initial}
              animate={scaleIn.animate}
              exit={scaleIn.exit}
              transition={springTransition}
            >
              <Badge variant="outline">
                {pledgeFilter === "Active" ? "Recurring" : "No Recurring"}
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  aria-label="Clear recurring filter"
                  onClick={() => setPledgeFilter("All")}
                  className="ml-1"
                >
                  <X aria-hidden />
                </Button>
              </Badge>
            </motion.div>
          )}
          {tagFilter.map((tag) => (
            <motion.div
              key={tag}
              layout
              initial={scaleIn.initial}
              animate={scaleIn.animate}
              exit={scaleIn.exit}
              transition={springTransition}
            >
              <Badge variant={getTagVariant(tag)}>
                {getTagLabel(tag)}
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  aria-label={`Clear ${getTagLabel(tag)} tag filter`}
                  onClick={() => removeFilterTag(tag)}
                  className="ml-1"
                >
                  <X aria-hidden />
                </Button>
              </Badge>
            </motion.div>
          ))}
          <motion.div layout>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
            >
              Clear All
            </Button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function DonorRosterResults({
  error,
  refreshDonors,
  isLoading,
  filteredDonors,
  hasActiveFilters,
  clearAllFilters,
  donorColumns,
  selectById,
}: {
  error: ReturnType<typeof useDonorsPageViewFields>["status"]["error"];
  refreshDonors: ReturnType<
    typeof useDonorsPageViewFields
  >["actions"]["refreshDonors"];
  isLoading: ReturnType<typeof useDonorsPageViewFields>["status"]["isLoading"];
  filteredDonors: ReturnType<
    typeof useDonorsPageViewFields
  >["donors"]["filtered"];
  hasActiveFilters: ReturnType<
    typeof useDonorsPageViewFields
  >["filters"]["hasActiveFilters"];
  clearAllFilters: ReturnType<
    typeof useDonorsPageViewFields
  >["filters"]["clearAll"];
  donorColumns: ReturnType<typeof createDonorColumns>;
  selectById: ReturnType<
    typeof useDonorsPageViewFields
  >["donors"]["selectById"];
}) {
  return (
    <div className="flex-1 min-h-0">
      {error ? (
        <ErrorState message={error} onRetry={refreshDonors} />
      ) : isLoading ? (
        <DonorListSkeleton />
      ) : filteredDonors.length === 0 ? (
        <Empty className="h-64">
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
              <Button variant="outline" size="sm" onClick={clearAllFilters}>
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
            manualPagination: true,
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
  );
}

function DonorRosterLoadMore({
  hasMoreDonors,
  error,
  isLoading,
  loadMoreDonors,
  isLoadingMoreDonors,
}: {
  hasMoreDonors: ReturnType<
    typeof useDonorsPageViewFields
  >["donors"]["hasMore"];
  error: ReturnType<typeof useDonorsPageViewFields>["status"]["error"];
  isLoading: ReturnType<typeof useDonorsPageViewFields>["status"]["isLoading"];
  loadMoreDonors: ReturnType<
    typeof useDonorsPageViewFields
  >["donors"]["loadMore"];
  isLoadingMoreDonors: ReturnType<
    typeof useDonorsPageViewFields
  >["donors"]["isLoadingMore"];
}) {
  return (
    hasMoreDonors &&
    !error &&
    !isLoading && (
      <div className="border-t border-border p-3 shrink-0">
        <Button
          variant="outline"
          size="sm"
          onClick={loadMoreDonors}
          disabled={isLoadingMoreDonors}
          className="w-full"
        >
          {isLoadingMoreDonors ? (
            <>
              <Spinner data-icon="inline-start" />
              Loading partners
            </>
          ) : (
            "Load more partners"
          )}
        </Button>
      </div>
    )
  );
}
