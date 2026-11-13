"use client";

import { useMediaQuery } from "@asym/lib/hooks";
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
import { cn } from "@asym/ui/lib/utils";
import { Search, Filter, ArrowDownUp, X } from "lucide-react";
import * as React from "react";

import { AVAILABLE_TAGS, getTagLabel, getTagVariant } from "./donors-model";
import {
  createDonorColumns,
  PartnerCard,
  RosterOpenPartnerContext,
} from "./donors-page-columns";
import {
  scaleIn,
  smoothTransition,
  springTransition,
} from "./donors-page-motion";
import { DonorListSkeleton, ErrorState } from "./donors-page-states";
import { useDonorsPageViewFields } from "./use-donors-page-view";

import type { SortOption } from "./donors-list-model";
import type { RowSelectionState } from "@asym/ui/components/shadcn/data-table/tanstack";

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
  // Below lg the list is hidden (not unmounted) while a partner is open. On
  // "Back", return focus to the row that opened the partner so keyboard users
  // keep their place in the list.
  const isStacked = useMediaQuery("(max-width: 1023px)");
  const selectedId = selectedDonor?.id ?? null;
  const openedFromRef = React.useRef<HTMLElement | null>(null);
  const previousSelectedIdRef = React.useRef<string | null>(null);
  React.useEffect(() => {
    const previous = previousSelectedIdRef.current;
    previousSelectedIdRef.current = selectedId;
    if (!isStacked || selectedId || !previous) return;
    const origin = openedFromRef.current;
    if (origin?.isConnected) origin.focus();
  }, [isStacked, selectedId]);
  const selectFromRow = React.useCallback(
    (id: string) => {
      openedFromRef.current =
        document.activeElement instanceof HTMLElement
          ? document.activeElement
          : null;
      selectById(id);
    },
    [selectById],
  );
  const rosterOpenPartner = React.useMemo(
    () => ({ openId: selectedId, open: selectFromRow }),
    [selectedId, selectFromRow],
  );
  const tableState = React.useMemo(
    (): { rowSelection: RowSelectionState } => ({
      rowSelection: selectedId ? { [selectedId]: true } : {},
    }),
    [selectedId],
  );
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ ...smoothTransition, delay: 0.2 }}
      // Phones swap list and detail (the detail has a "Back to partner list"
      // control), so the roster steps aside while a partner is open.
      className={cn(
        "lg:col-span-5 xl:col-span-4",
        selectedDonor && "max-lg:hidden",
      )}
    >
      <Card className="overflow-hidden h-full flex flex-col">
        <CardHeader className="flex flex-col gap-4 shrink-0">
          <div className="flex items-center justify-between">
            <CardTitle role="heading" aria-level={2}>
              All partners{" "}
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

        <RosterOpenPartnerContext.Provider value={rosterOpenPartner}>
          <DonorRosterResults
            error={error}
            refreshDonors={refreshDonors}
            isLoading={isLoading}
            filteredDonors={filteredDonors}
            hasActiveFilters={hasActiveFilters}
            clearAllFilters={clearAllFilters}
            tableState={tableState}
            selectById={selectFromRow}
          />
        </RosterOpenPartnerContext.Provider>
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
          <DropdownMenuLabel>Sort by</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {[
            { value: "last_gift", label: "Last gift" },
            { value: "total_given", label: "Total given" },
            { value: "name", label: "Name" },
            { value: "joined_date", label: "Partner since" },
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
          <DropdownMenuLabel>Status</DropdownMenuLabel>
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
          <DropdownMenuLabel>Monthly giving</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {["All", "Active", "Inactive"].map((p) => (
            <DropdownMenuCheckboxItem
              key={p}
              checked={pledgeFilter === p}
              onCheckedChange={() => setPledgeFilter(p)}
            >
              {p === "Active"
                ? "Gives monthly"
                : p === "Inactive"
                  ? "Doesn’t give monthly"
                  : "All"}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuLabel>Tags</DropdownMenuLabel>
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
                Clear all filters
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
                {pledgeFilter === "Active"
                  ? "Gives monthly"
                  : "Doesn’t give monthly"}
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
              Clear all
            </Button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Static: cells read the open partner from RosterOpenPartnerContext.
const DONOR_COLUMNS = createDonorColumns();

function DonorRosterResults({
  error,
  refreshDonors,
  isLoading,
  filteredDonors,
  hasActiveFilters,
  clearAllFilters,
  tableState,
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
  tableState: { rowSelection: RowSelectionState };
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
                Clear filters
              </Button>
            </EmptyContent>
          ) : null}
        </Empty>
      ) : (
        <DataTableResponsive
          columns={DONOR_COLUMNS}
          data={filteredDonors}
          // The open partner's row is the selected row: a muted fill, with a
          // primary edge on its photo.
          state={tableState}
          // The Partner cell already carries lifetime giving; the narrow list
          // keeps Partner + Status so neither is clipped.
          initialState={{
            columnVisibility: { total_given: false, frequency: false },
          }}
          config={{
            enableRowSelection: false,
            enableColumnVisibility: true,
            enablePagination: false,
            manualPagination: true,
            enableFilters: false,
            enableSorting: false,
            // Each partner is a button (Tab, Enter, Space). The shared row
            // navigation would add a second model that no Tab reaches, and
            // its ring stays on the last row clicked, reading as a heavy
            // selected border.
            enableKeyboardNavigation: false,
            virtualization: {
              enabled: true,
              estimateSize: 88,
              overscan: 10,
              containerHeight: 640,
            },
          }}
          mobileCardConfig={{
            renderCard: (row) => (
              <PartnerCard
                donor={row.original}
                onOpen={() => selectById(row.original.id)}
              />
            ),
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
