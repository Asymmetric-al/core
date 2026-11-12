"use client";

import { useDonorHistoryTransactions } from "@asym/database/hooks";
import { formatCurrency } from "@asym/lib/utils";
import { useWithinViewTransitionRouteLayer } from "@asym/lib/view-transitions";
import { PageHeader } from "@asym/ui/components/page-header";
import { Button, buttonVariants } from "@asym/ui/components/shadcn/button";
import { Card, CardContent } from "@asym/ui/components/shadcn/card";
import { DataTableResponsive } from "@asym/ui/components/shadcn/data-table";
import {
  flexRender,
  type Row,
} from "@asym/ui/components/shadcn/data-table/tanstack";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@asym/ui/components/shadcn/dropdown-menu";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@asym/ui/components/shadcn/input-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@asym/ui/components/shadcn/select";
import { Skeleton } from "@asym/ui/components/shadcn/skeleton";
import { cn } from "@asym/ui/lib/utils";
import { ChevronDown, Download, Search } from "lucide-react";
import dynamic from "next/dynamic";
import React, { useMemo, useReducer } from "react";

import { columns, ReceiptLink } from "./columns";
import { getHistoryYearOptions } from "./history-year-options";
import { MonthlyGivingTable } from "./monthly-giving-table";
import { GIFT_TYPE_LABELS, type Transaction } from "./types";

import type { MonthlyGivingPoint } from "./monthly-giving-chart";

import { makeDisplayDate } from "@/lib/dates";

// Recharts loads only when the summary chart is on screen.
const MonthlyGivingChart = dynamic(() => import("./monthly-giving-chart"), {
  ssr: false,
  loading: () => <Skeleton className="size-full" />,
});

type HistoryFiltersState = {
  searchTerm: string;
  yearFilter: string;
  typeFilter: string;
  statusFilter: string;
};
type HistoryFiltersAction =
  | { type: "set_search_term"; value: string }
  | { type: "set_year_filter"; value: string }
  | { type: "set_type_filter"; value: string }
  | { type: "set_status_filter"; value: string };

function createDefaultHistoryFilters(): HistoryFiltersState {
  return {
    searchTerm: "",
    yearFilter: getHistoryYearOptions()[0]!,
    typeFilter: "All",
    statusFilter: "All",
  };
}

function historyFiltersReducer(
  state: HistoryFiltersState,
  action: HistoryFiltersAction,
): HistoryFiltersState {
  switch (action.type) {
    case "set_search_term":
      return { ...state, searchTerm: action.value };
    case "set_year_filter":
      return { ...state, yearFilter: action.value };
    case "set_type_filter":
      return { ...state, typeFilter: action.value };
    case "set_status_filter":
      return { ...state, statusFilter: action.value };
    default:
      return state;
  }
}

const TYPE_OPTIONS = [
  { value: "All", label: "All types" },
  { value: "Recurring", label: GIFT_TYPE_LABELS.Recurring },
  { value: "One-Time", label: GIFT_TYPE_LABELS["One-Time"] },
];

const STATUS_OPTIONS = [
  { value: "All", label: "All statuses" },
  { value: "Paid", label: "Paid" },
  { value: "Processing", label: "Processing" },
  { value: "Failed", label: "Failed" },
  { value: "Refunded", label: "Refunded" },
];

/**
 * "1 processing · 1 failed" for gifts that are in the year but not in the
 * paid total or receipts; null when every gift was paid.
 */
export function unsettledNote(
  transactions: { status: string }[],
): string | null {
  const count = (status: string) =>
    transactions.filter((t) => t.status === status).length;
  const parts = [
    ["processing", count("Processing")],
    ["failed", count("Failed")],
    ["refunded", count("Refunded")],
  ]
    .filter(([, n]) => Number(n) > 0)
    .map(([label, n]) => `${n} ${label}`);
  return parts.length > 0 ? parts.join(" · ") : null;
}

/**
 * Paid giving for every month of `year`, zero-filled so one or two gifts read
 * as months rather than a block. Months use the same local calendar as the
 * year filter, so an evening gift on 31 December stays in December instead of
 * landing in the next year's January.
 */
export function monthlyGivingSeries(
  transactions: { date: string; amount: number; status: string }[],
  year: string,
): MonthlyGivingPoint[] {
  const totalsCents = Array.from({ length: 12 }, () => 0);
  for (const transaction of transactions) {
    if (transaction.status !== "Paid") continue;
    const date = makeDisplayDate(transaction.date);
    if (Number.isNaN(date.getTime())) continue;
    if (date.getFullYear().toString() !== year) continue;
    const month = date.getMonth();
    totalsCents[month] =
      (totalsCents[month] ?? 0) + Math.round(transaction.amount * 100);
  }
  return totalsCents.map((cents, monthIndex) => ({
    month: new Date(Number(year), monthIndex, 1).toLocaleString("en-US", {
      month: "short",
    }),
    amount: cents / 100,
  }));
}

/** "to Jordan Hale", "to Jordan Hale and Field Team 1", "… and 2 others". */
function recipientsPhrase(names: string[]) {
  if (names.length === 0) return "";
  if (names.length === 1) return ` to ${names[0]}`;
  if (names.length === 2) return ` to ${names[0]} and ${names[1]}`;
  return ` to ${names[0]} and ${names.length - 1} others`;
}

/** The year in one sentence: how many gifts, and to whom. */
export function yearSummary(
  transactions: Transaction[],
  year: string,
  currentYear: string,
): string {
  const paid = transactions.filter((t) => t.status === "Paid");
  const isCurrent = year === currentYear;
  if (paid.length === 0) {
    return isCurrent
      ? `You haven’t made a gift in ${year} yet.`
      : `You didn’t make any gifts in ${year}.`;
  }
  const gifts = `${paid.length} ${paid.length === 1 ? "gift" : "gifts"}`;
  // Most-supported first, so the sentence names who matters most.
  const byRecipient = new Map<string, number>();
  for (const t of paid) {
    byRecipient.set(
      t.recipient,
      (byRecipient.get(t.recipient) ?? 0) + t.amount,
    );
  }
  const names = [...byRecipient.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([name]) => name);
  // The total is shown just above, so this says how many and to whom.
  return isCurrent
    ? `${gifts}${recipientsPhrase(names)} so far this year.`
    : `${gifts}${recipientsPhrase(names)} in ${year}.`;
}

function FilterMenu({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
}) {
  const selected = options.find((option) => option.value === value);
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="outline">
            {value === "All" ? label : selected?.label}
            <ChevronDown data-icon="inline-end" aria-hidden />
          </Button>
        }
      />
      <DropdownMenuContent align="end">
        <DropdownMenuGroup>
          <DropdownMenuLabel>{label}</DropdownMenuLabel>
          <DropdownMenuRadioGroup value={value} onValueChange={onChange}>
            {options.map((option) => (
              <DropdownMenuRadioItem key={option.value} value={option.value}>
                {option.label}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function YearSelect({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const years = getHistoryYearOptions();
  return (
    <Select
      items={years.map((year) => ({ value: year, label: year }))}
      value={value}
      onValueChange={(next) => {
        if (next !== null) onChange(next);
      }}
    >
      <SelectTrigger aria-label="Year">
        <SelectValue placeholder="Year" />
      </SelectTrigger>
      <SelectContent>
        {years.map((year) => (
          <SelectItem key={year} value={year}>
            {year}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function YearSummaryCard({
  year,
  currentYear,
  transactions,
}: {
  year: string;
  currentYear: string;
  transactions: Transaction[];
}) {
  const paidTotal = transactions
    .filter((t) => t.status === "Paid")
    .reduce((sum, t) => sum + t.amount, 0);
  const note = unsettledNote(transactions);
  const hasPaid = paidTotal > 0;
  const statementLabel =
    year === currentYear
      ? `Download ${year} summary so far`
      : `Download ${year} statement`;
  const series = monthlyGivingSeries(transactions, year);
  const chartName = `Paid gifts by month in ${year}`;

  return (
    <Card>
      {/* Tighter on phones, so the gift list starts within the first screen. */}
      <CardContent className="grid gap-4 sm:gap-6 lg:grid-cols-5 lg:items-center">
        <div className="flex flex-col gap-2 sm:gap-3 lg:col-span-2">
          <p className="text-sm text-muted-foreground">Paid in {year}</p>
          <p className="text-3xl font-semibold tracking-tight tabular-nums text-foreground sm:text-4xl">
            {formatCurrency(paidTotal)}
          </p>
          <p className="text-sm text-foreground">
            {yearSummary(transactions, year, currentYear)}
          </p>
          {note ? (
            <p className="text-sm text-muted-foreground">
              Not counted: {note}.
            </p>
          ) : null}
          {hasPaid ? (
            <a
              href={`/api/donor/statements/${year}`}
              className={cn(
                buttonVariants({ variant: "outline" }),
                "self-start",
              )}
            >
              <Download data-icon="inline-start" aria-hidden />
              {statementLabel}
            </a>
          ) : null}
        </div>
        <div className="h-28 sm:h-40 lg:col-span-3">
          {hasPaid ? (
            <>
              {/* The picture is for sighted readers; the table below gives
                  screen readers the same months and exact amounts. */}
              <div aria-hidden="true" className="size-full">
                <MonthlyGivingChart
                  data={series}
                  currentMonth={
                    year === currentYear ? new Date().getMonth() : 11
                  }
                />
              </div>
              <MonthlyGivingTable
                caption={chartName}
                year={year}
                data={series}
              />
            </>
          ) : (
            <div className="flex size-full items-center justify-center rounded-lg bg-muted text-sm text-muted-foreground">
              Nothing to chart for {year}.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function renderHistoryTransactionCard(row: Row<Transaction>) {
  const renderCell = (columnId: string) => {
    const cell = row.getAllCells().find((item) => item.column.id === columnId);
    return cell
      ? flexRender(cell.column.columnDef.cell, cell.getContext())
      : null;
  };

  return (
    <Card role="article" aria-label={`Gift to ${row.original.recipient}`}>
      <CardContent className="flex flex-col gap-4">
        {renderCell("recipient")}
        <dl className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <dt className="text-sm text-muted-foreground">Date</dt>
            <dd>{renderCell("date")}</dd>
          </div>
          <div className="flex flex-col gap-1 text-right">
            <dt className="text-sm text-muted-foreground">Amount</dt>
            <dd>{renderCell("amount")}</dd>
          </div>
          <div className="flex flex-col gap-1">
            <dt className="text-sm text-muted-foreground">Fund</dt>
            <dd>{renderCell("fund")}</dd>
          </div>
          <div className="flex flex-col gap-1 text-right">
            <dt className="text-sm text-muted-foreground">Status</dt>
            <dd>{renderCell("status")}</dd>
          </div>
        </dl>
        {row.original.status === "Paid" ? (
          <div className="border-t border-border pt-3">
            <ReceiptLink tx={row.original} />
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

export function HistoryTransactionsCard({
  filteredTransactions,
  isLoading,
  filtersActive = true,
  year,
}: {
  filteredTransactions: Transaction[];
  isLoading?: boolean;
  /** Search, type or status narrows the list (the year alone doesn't). */
  filtersActive?: boolean;
  year?: string;
}) {
  return (
    <DataTableResponsive
      columns={columns}
      data={filteredTransactions}
      isLoading={isLoading}
      mobileCardConfig={{ renderCard: renderHistoryTransactionCard }}
      // "Monthly gift" / "One-time gift" already sits under each name, so
      // the Type column starts hidden; the Type filter still works.
      initialState={{ columnVisibility: { type: false } }}
      config={{
        enableRowSelection: false,
        enableColumnVisibility: true,
        enablePagination: true,
        enableFilters: false,
        enableSorting: true,
        virtualization: {
          enabled: true,
          estimateSize: 72,
          overscan: 8,
          containerHeight: 640,
        },
      }}
      emptyState={
        <div
          role="status"
          aria-atomic="true"
          className="flex flex-col items-center justify-center py-12 text-center"
        >
          {filtersActive ? (
            <>
              <p className="font-medium text-foreground">No gifts match</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Try another search, or clear the filters.
              </p>
            </>
          ) : (
            <>
              <p className="font-medium text-foreground">
                {year ? `No gifts in ${year} yet` : "No gifts yet"}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Gifts you make will appear here with their receipts.
              </p>
            </>
          )}
        </div>
      }
    />
  );
}

export default function DonorHistoryPage() {
  // Route VT owns the entrance when active; only animate on plain mounts.
  const withinRouteVt = useWithinViewTransitionRouteLayer();
  const [filters, dispatchFilters] = useReducer(
    historyFiltersReducer,
    undefined,
    createDefaultHistoryFilters,
  );
  const transactionsQuery = useDonorHistoryTransactions();
  const { searchTerm, statusFilter, typeFilter, yearFilter } = filters;
  const currentYear = getHistoryYearOptions()[0]!;
  const transactions = useMemo(
    () => transactionsQuery.data ?? [],
    [transactionsQuery.data],
  );

  // The summary describes the selected year, so it ignores the table's
  // search, type and status filters.
  const yearTransactions = useMemo(
    () =>
      transactions.filter(
        (t) => makeDisplayDate(t.date).getFullYear().toString() === yearFilter,
      ),
    [transactions, yearFilter],
  );

  const filteredTransactions = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    return yearTransactions
      .filter((t) => {
        const matchesSearch =
          normalizedSearch.length === 0 ||
          t.recipient.toLowerCase().includes(normalizedSearch) ||
          (t.fund?.toLowerCase().includes(normalizedSearch) ?? false) ||
          t.id.toLowerCase().includes(normalizedSearch);
        const matchesType = typeFilter === "All" || t.type === typeFilter;
        const matchesStatus =
          statusFilter === "All" || t.status === statusFilter;
        return matchesSearch && matchesType && matchesStatus;
      })
      .sort(
        (a, b) =>
          makeDisplayDate(b.date).getTime() - makeDisplayDate(a.date).getTime(),
      );
  }, [searchTerm, yearTransactions, typeFilter, statusFilter]);

  return (
    <div
      data-testid={
        transactionsQuery.isError
          ? "giving-history-unlinked"
          : "giving-history-live"
      }
      className={cn(
        "mx-auto flex w-full max-w-6xl flex-col gap-4 pb-20 sm:gap-6",
        !withinRouteVt && "animate-in fade-in duration-300",
      )}
    >
      <PageHeader
        title="Giving history"
        description="Every gift you’ve made, with receipts and yearly statements."
      >
        <YearSelect
          value={yearFilter}
          onChange={(value) =>
            dispatchFilters({ type: "set_year_filter", value })
          }
        />
      </PageHeader>

      {transactionsQuery.isError ? (
        <Card>
          <CardContent>
            <p role="alert" className="text-sm text-foreground">
              We couldn’t load your giving history. Refresh the page to try
              again.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {transactionsQuery.isLoading ? (
            <Skeleton className="h-56 w-full rounded-xl" />
          ) : (
            <YearSummaryCard
              year={yearFilter}
              currentYear={currentYear}
              transactions={yearTransactions}
            />
          )}

          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="flex-1">
              <InputGroup>
                <InputGroupAddon>
                  <Search aria-hidden />
                </InputGroupAddon>
                <InputGroupInput
                  placeholder="Search by name, fund or gift ID"
                  aria-label="Search giving history"
                  value={searchTerm}
                  onChange={(event) =>
                    dispatchFilters({
                      type: "set_search_term",
                      value: event.target.value,
                    })
                  }
                />
              </InputGroup>
            </div>
            <div className="flex gap-2">
              <FilterMenu
                label="Type"
                value={typeFilter}
                options={TYPE_OPTIONS}
                onChange={(value) =>
                  dispatchFilters({ type: "set_type_filter", value })
                }
              />
              <FilterMenu
                label="Status"
                value={statusFilter}
                options={STATUS_OPTIONS}
                onChange={(value) =>
                  dispatchFilters({ type: "set_status_filter", value })
                }
              />
            </div>
          </div>

          <HistoryTransactionsCard
            filteredTransactions={filteredTransactions}
            isLoading={transactionsQuery.isLoading}
            filtersActive={
              searchTerm.trim() !== "" ||
              typeFilter !== "All" ||
              statusFilter !== "All"
            }
            year={yearFilter}
          />
        </>
      )}
    </div>
  );
}
