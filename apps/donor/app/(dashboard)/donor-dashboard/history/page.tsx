"use client";

import { motion } from "@asym/lib/motion";
import { formatCurrency } from "@asym/lib/utils";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@asym/ui/components/shadcn/avatar";
import { Badge } from "@asym/ui/components/shadcn/badge";
import { Button } from "@asym/ui/components/shadcn/button";
import { Card, CardContent } from "@asym/ui/components/shadcn/card";
import { useDataTableVirtualization } from "@asym/ui/components/shadcn/data-table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "@asym/ui/components/shadcn/dropdown-menu";
import { Input } from "@asym/ui/components/shadcn/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@asym/ui/components/shadcn/select";
import { cn } from "@asym/ui/lib/utils";
import {
  Calendar,
  FileText,
  CheckCircle2,
  DollarSign,
  TrendingUp,
  MoreHorizontal,
  DownloadCloud,
  ExternalLink,
  SlidersHorizontal,
  XCircle,
  Clock,
  Search,
} from "lucide-react";
import React, { useEffect, useMemo, useReducer, useState } from "react";

// --- Types ---
interface Transaction {
  id: string;
  date: string; // ISO string
  amount: number;
  recipient: string;
  recipientAvatar?: string;
  category: string;
  type: "Recurring" | "One-Time";
  method: string;
  last4: string;
  status: "Succeeded" | "Processing" | "Failed";
  receiptUrl: string;
}

async function importRechartsModule() {
  return import("recharts");
}

type RechartsImport = Awaited<ReturnType<typeof importRechartsModule>>;
type RechartsModule = {
  Bar: RechartsImport["Bar"];
  BarChart: RechartsImport["BarChart"];
  Cell: RechartsImport["Cell"];
  ResponsiveContainer: RechartsImport["ResponsiveContainer"];
  Tooltip: RechartsImport["Tooltip"];
};
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

// --- Mock Data ---
const TRANSACTIONS: Transaction[] = [
  {
    id: "TX-10492",
    date: "2024-10-24T10:30:00",
    amount: 100.0,
    recipient: "The Miller Family",
    recipientAvatar:
      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?fit=facearea&facepad=2&w=256&h=256&q=80",
    category: "Missionary",
    type: "Recurring",
    method: "Visa",
    last4: "4242",
    status: "Succeeded",
    receiptUrl: "#",
  },
  {
    id: "TX-10491",
    date: "2024-09-24T10:30:00",
    amount: 100.0,
    recipient: "The Miller Family",
    recipientAvatar:
      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?fit=facearea&facepad=2&w=256&h=256&q=80",
    category: "Missionary",
    type: "Recurring",
    method: "Visa",
    last4: "4242",
    status: "Succeeded",
    receiptUrl: "#",
  },
  {
    id: "TX-10355",
    date: "2024-09-12T14:15:00",
    amount: 500.0,
    recipient: "Clean Water Initiative",
    recipientAvatar:
      "https://images.unsplash.com/photo-1538300342682-cf57afb97285?fit=crop&w=256&h=256&q=80",
    category: "Project",
    type: "One-Time",
    method: "Mastercard",
    last4: "8821",
    status: "Succeeded",
    receiptUrl: "#",
  },
  {
    id: "TX-10290",
    date: "2024-08-24T10:30:00",
    amount: 100.0,
    recipient: "The Miller Family",
    recipientAvatar:
      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?fit=facearea&facepad=2&w=256&h=256&q=80",
    category: "Missionary",
    type: "Recurring",
    method: "Visa",
    last4: "4242",
    status: "Succeeded",
    receiptUrl: "#",
  },
  {
    id: "TX-10210",
    date: "2024-07-24T10:30:00",
    amount: 100.0,
    recipient: "The Miller Family",
    recipientAvatar:
      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?fit=facearea&facepad=2&w=256&h=256&q=80",
    category: "Missionary",
    type: "Recurring",
    method: "Visa",
    last4: "4242",
    status: "Succeeded",
    receiptUrl: "#",
  },
  {
    id: "TX-10150",
    date: "2024-06-15T09:00:00",
    amount: 250.0,
    recipient: "Refugee Crisis Fund",
    recipientAvatar:
      "https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?fit=crop&w=256&h=256&q=80",
    category: "Emergency",
    type: "One-Time",
    method: "Bank",
    last4: "9921",
    status: "Processing",
    receiptUrl: "#",
  },
  {
    id: "TX-9982",
    date: "2024-05-24T10:30:00",
    amount: 100.0,
    recipient: "The Miller Family",
    recipientAvatar:
      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?fit=facearea&facepad=2&w=256&h=256&q=80",
    category: "Missionary",
    type: "Recurring",
    method: "Visa",
    last4: "4242",
    status: "Failed",
    receiptUrl: "#",
  },
  {
    id: "TX-9840",
    date: "2024-04-10T16:20:00",
    amount: 1000.0,
    recipient: "Building Fund",
    recipientAvatar:
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?fit=crop&w=256&h=256&q=80",
    category: "Capital",
    type: "One-Time",
    method: "Check",
    last4: "1024",
    status: "Succeeded",
    receiptUrl: "#",
  },
];

const MONTHLY_DATA = [
  { month: "May", amount: 100 },
  { month: "Jun", amount: 350 },
  { month: "Jul", amount: 100 },
  { month: "Aug", amount: 100 },
  { month: "Sep", amount: 600 },
  { month: "Oct", amount: 100 },
];

const DEFAULT_HISTORY_FILTERS: HistoryFiltersState = {
  searchTerm: "",
  yearFilter: "2024",
  typeFilter: "All",
  statusFilter: "All",
};

// --- Helpers ---
const getStatusColor = (status: Transaction["status"]) => {
  switch (status) {
    case "Succeeded":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "Processing":
      return "bg-blue-50 text-blue-700 border-blue-200";
    case "Failed":
      return "bg-red-50 text-red-700 border-red-200";
    default:
      return "bg-zinc-50 text-zinc-700 border-zinc-200";
  }
};

const getStatusIcon = (status: Transaction["status"]) => {
  switch (status) {
    case "Succeeded":
      return <CheckCircle2 className="w-3.5 h-3.5" />;
    case "Processing":
      return <Clock className="w-3.5 h-3.5" />;
    case "Failed":
      return <XCircle className="w-3.5 h-3.5" />;
    default:
      return null;
  }
};

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

function HistoryChartFallback() {
  return (
    <div
      className="h-24 w-full rounded-md bg-white/5 animate-pulse"
      aria-hidden="true"
    />
  );
}

function MonthlyGivingChart({
  rechartsModule,
}: {
  rechartsModule: RechartsModule | null;
}) {
  if (!rechartsModule) {
    return <HistoryChartFallback />;
  }

  const {
    Bar,
    BarChart,
    Cell,
    ResponsiveContainer,
    Tooltip: RechartsTooltip,
  } = rechartsModule;

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={MONTHLY_DATA}>
        <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
          {MONTHLY_DATA.map((entry) => (
            <Cell
              key={entry.month}
              fill={entry.amount > 300 ? "#10b981" : "rgba(255,255,255,0.2)"}
              className="transition-all duration-300 hover:opacity-80"
            />
          ))}
        </Bar>
        <RechartsTooltip
          cursor={{ fill: "rgba(255,255,255,0.05)" }}
          contentStyle={{
            background: "#09090b",
            border: "1px solid #27272a",
            borderRadius: "8px",
            color: "#fff",
            fontSize: "12px",
          }}
          itemStyle={{ color: "#fff" }}
          formatter={(value: number) => [formatCurrency(value), "Given"]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}

const HISTORY_CONTAINER_VARIANTS = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const HISTORY_ITEM_VARIANTS = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
};

function HistoryPageHeader({
  yearFilter,
  onYearFilterChange,
}: {
  yearFilter: string;
  onYearFilterChange: (value: string) => void;
}) {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 text-left">
      <div>
        <h1 className="text-3xl font-bold text-zinc-900 tracking-tight uppercase">
          Giving History
        </h1>
        <p className="text-zinc-500 mt-2 text-lg font-bold uppercase tracking-widest text-[10px]">
          Your complete record of impact and tax-deductible contributions.
        </p>
      </div>
      <div className="flex flex-wrap gap-3">
        <div className="relative w-[140px]">
          <Select value={yearFilter} onValueChange={onYearFilterChange}>
            <SelectTrigger className="pl-10 bg-white border-zinc-200 shadow-sm">
              <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500 z-10 pointer-events-none" />
              <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2024">2024</SelectItem>
              <SelectItem value="2023">2023</SelectItem>
              <SelectItem value="2022">2022</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button className="bg-zinc-900 hover:bg-zinc-800 text-white shadow-md font-bold uppercase tracking-widest text-[10px] h-10 px-6 rounded-lg">
          <DownloadCloud className="mr-2 h-4 w-4" /> Download Statement
        </Button>
      </div>
    </div>
  );
}

function HistoryStatsColumn({
  filteredTransactionCount,
  receiptCount,
  rechartsModule,
  totalGiven,
  yearFilter,
}: {
  filteredTransactionCount: number;
  receiptCount: number;
  rechartsModule: RechartsModule | null;
  totalGiven: number;
  yearFilter: string;
}) {
  return (
    <div className="lg:col-span-1 space-y-6">
      <Card className="bg-zinc-950 text-white border-none shadow-2xl overflow-hidden relative group rounded-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 to-zinc-950 z-0" />
        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity duration-700">
          <TrendingUp className="w-40 h-40 text-emerald-400" />
        </div>

        <CardContent className="p-8 relative z-10 text-left">
          <div className="flex items-center justify-between mb-6">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 bg-white/5 px-2.5 py-1 rounded-md">
              Total Giving {yearFilter}
            </span>
            <DollarSign className="h-5 w-5 text-emerald-400" />
          </div>
          <div className="text-5xl font-bold tracking-tighter mb-2">
            {formatCurrency(totalGiven)}
          </div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-8">
            100% Tax Deductible
          </p>

          <div className="h-24 w-full">
            <MonthlyGivingChart rechartsModule={rechartsModule} />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-4">
        <Card className="bg-white border-zinc-100 shadow-sm hover:shadow-md transition-shadow rounded-xl">
          <CardContent className="p-5 flex flex-col items-center text-center justify-center h-full">
            <div className="w-10 h-10 rounded-full bg-zinc-50 text-zinc-900 flex items-center justify-center mb-3 border border-zinc-100 shadow-sm">
              <FileText className="h-5 w-5" />
            </div>
            <div className="text-2xl font-bold text-zinc-900">
              {receiptCount}
            </div>
            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mt-1">
              Receipts
            </p>
          </CardContent>
        </Card>
        <Card className="bg-white border-zinc-100 shadow-sm hover:shadow-md transition-shadow rounded-xl">
          <CardContent className="p-5 flex flex-col items-center text-center justify-center h-full">
            <div className="w-10 h-10 rounded-full bg-zinc-50 text-zinc-900 flex items-center justify-center mb-3 border border-zinc-100 shadow-sm">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div className="text-2xl font-bold text-zinc-900">
              {filteredTransactionCount}
            </div>
            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mt-1">
              Total Gifts
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function HistoryFiltersToolbar({
  searchTerm,
  statusFilter,
  typeFilter,
  onSearchTermChange,
  onStatusFilterChange,
  onTypeFilterChange,
}: {
  searchTerm: string;
  statusFilter: string;
  typeFilter: string;
  onSearchTermChange: (value: string) => void;
  onStatusFilterChange: (value: string) => void;
  onTypeFilterChange: (value: string) => void;
}) {
  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
        <Input
          placeholder="Search recipient or transaction ID..."
          className="pl-10 bg-white border-zinc-200 h-10 shadow-sm focus:ring-2 focus:ring-zinc-100 rounded-lg text-xs font-bold uppercase tracking-tight"
          value={searchTerm}
          onChange={(e) => onSearchTermChange(e.target.value)}
        />
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1 sm:pb-0">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="h-10 border-zinc-200 bg-white text-zinc-700 shadow-sm text-[10px] font-bold uppercase tracking-widest px-4 rounded-lg"
            >
              <SlidersHorizontal className="mr-2 h-3.5 w-3.5" /> Type{" "}
              {typeFilter !== "All" && (
                <Badge variant="secondary" className="ml-2 h-4 px-1">
                  {typeFilter}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
              Filter by Type
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuCheckboxItem
              checked={typeFilter === "All"}
              onCheckedChange={() => onTypeFilterChange("All")}
              className="text-xs font-bold uppercase tracking-widest"
            >
              All Types
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={typeFilter === "Recurring"}
              onCheckedChange={() => onTypeFilterChange("Recurring")}
              className="text-xs font-bold uppercase tracking-widest"
            >
              Recurring
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={typeFilter === "One-Time"}
              onCheckedChange={() => onTypeFilterChange("One-Time")}
              className="text-xs font-bold uppercase tracking-widest"
            >
              One-Time
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="h-10 border-zinc-200 bg-white text-zinc-700 shadow-sm text-[10px] font-bold uppercase tracking-widest px-4 rounded-lg"
            >
              Status{" "}
              {statusFilter !== "All" && (
                <Badge variant="secondary" className="ml-2 h-4 px-1">
                  {statusFilter}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
              Filter by Status
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuCheckboxItem
              checked={statusFilter === "All"}
              onCheckedChange={() => onStatusFilterChange("All")}
              className="text-xs font-bold uppercase tracking-widest"
            >
              All Statuses
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={statusFilter === "Succeeded"}
              onCheckedChange={() => onStatusFilterChange("Succeeded")}
              className="text-xs font-bold uppercase tracking-widest text-emerald-600"
            >
              Succeeded
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={statusFilter === "Processing"}
              onCheckedChange={() => onStatusFilterChange("Processing")}
              className="text-xs font-bold uppercase tracking-widest text-blue-600"
            >
              Processing
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={statusFilter === "Failed"}
              onCheckedChange={() => onStatusFilterChange("Failed")}
              className="text-xs font-bold uppercase tracking-widest text-rose-600"
            >
              Failed
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

function HistoryTransactionsCard({
  filteredTransactions,
}: {
  filteredTransactions: Transaction[];
}) {
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);
  const shouldVirtualize = filteredTransactions.length > 30;
  const getVirtualItemKey = React.useCallback(
    (index: number) => filteredTransactions[index]?.id ?? index,
    [filteredTransactions],
  );
  const {
    config: resolvedVirtualization,
    virtualizer,
    virtualItems,
    totalSize,
    isEnabled: isVirtualized,
  } = useDataTableVirtualization({
    count: filteredTransactions.length,
    scrollElementRef: scrollContainerRef,
    virtualization: {
      enabled: shouldVirtualize,
      estimateSize: 84,
      overscan: 8,
      containerHeight: 640,
      getItemKey: getVirtualItemKey,
    },
    defaults: {
      enabled: false,
      estimateSize: 84,
      overscan: 8,
      containerHeight: 640,
    },
  });

  const renderTransactionContent = (tx: Transaction) => (
    <>
      <div className="flex justify-between md:hidden mb-3">
        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
          {new Date(tx.date).toLocaleDateString()}
        </span>
        <Badge
          variant="outline"
          className={cn(
            "text-[9px] h-5 uppercase font-black tracking-widest rounded-md border-transparent",
            getStatusColor(tx.status),
          )}
        >
          {getStatusIcon(tx.status)}
          <span className="ml-1">{tx.status}</span>
        </Badge>
      </div>

      <div className="hidden md:block col-span-2 px-4 text-[11px] font-bold text-zinc-500 uppercase">
        {new Date(tx.date).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })}
      </div>

      <div className="md:col-span-4 md:px-0 mb-3 md:mb-0">
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9 border border-zinc-100 shadow-sm">
            <AvatarImage src={tx.recipientAvatar} alt={tx.recipient} />
            <AvatarFallback className="bg-zinc-100 text-zinc-400 font-bold text-xs uppercase">
              {tx.recipient[0]}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="text-sm font-bold text-zinc-900 leading-none mb-1 uppercase tracking-tight">
              {tx.recipient}
            </div>
            <div className="text-[9px] font-bold text-zinc-400 flex items-center gap-1.5 uppercase tracking-widest">
              <span className="bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-500">
                {tx.type}
              </span>
              <span className="text-zinc-200">•</span>
              <span>
                {tx.method} ••{tx.last4}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center md:block md:col-span-2 md:px-0">
        <span className="text-[10px] font-black text-zinc-300 md:hidden uppercase tracking-widest">
          Amount
        </span>
        <span className="text-sm font-bold text-zinc-900 tabular-nums">
          {formatCurrency(tx.amount)}
        </span>
      </div>

      <div className="hidden md:flex col-span-2 items-center">
        <Badge
          variant="outline"
          className={cn(
            "pl-1.5 pr-2.5 h-6 gap-1.5 font-black uppercase text-[9px] tracking-widest rounded-md border-transparent",
            getStatusColor(tx.status),
          )}
        >
          {getStatusIcon(tx.status)}
          {tx.status}
        </Badge>
      </div>

      <div className="md:col-span-2 flex justify-end md:px-4 mt-4 md:mt-0 border-t md:border-none pt-4 md:pt-0 gap-2">
        {tx.status === "Succeeded" && (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded-md"
          >
            <DownloadCloud className="w-3.5 h-3.5 mr-1.5" /> Receipt
          </Button>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-zinc-300 hover:text-zinc-900"
            >
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem className="text-[10px] font-bold uppercase tracking-widest">
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem className="text-[10px] font-bold uppercase tracking-widest">
              Manage Recurring
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-[10px] font-bold uppercase tracking-widest">
              <ExternalLink className="w-3 h-3 mr-2" /> Open Statement
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </>
  );

  return (
    <Card className="border-zinc-100 shadow-sm overflow-hidden flex-1 flex flex-col rounded-xl text-left bg-white">
      <div className="hidden md:grid grid-cols-12 gap-4 p-4 bg-zinc-50 border-b border-zinc-100 text-[10px] font-black text-zinc-400 uppercase tracking-widest">
        <div className="col-span-2">Date</div>
        <div className="col-span-4">Recipient</div>
        <div className="col-span-2">Amount</div>
        <div className="col-span-2">Status</div>
        <div className="col-span-2 text-right">Receipt</div>
      </div>

      <div
        ref={scrollContainerRef}
        className="flex-1 min-h-[400px] overflow-y-auto"
        style={
          isVirtualized
            ? { maxHeight: resolvedVirtualization.containerHeight }
            : undefined
        }
      >
        {filteredTransactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-zinc-400">
            <div className="w-16 h-16 bg-zinc-50 rounded-full flex items-center justify-center mb-4">
              <Search className="h-8 w-8 text-zinc-200" />
            </div>
            <p className="font-bold text-zinc-900 uppercase tracking-tighter">
              No transactions found
            </p>
            <p className="text-[10px] font-bold uppercase tracking-widest">
              Try adjusting your filters.
            </p>
          </div>
        ) : isVirtualized ? (
          <div
            style={{
              height: totalSize,
              position: "relative",
            }}
          >
            {virtualItems.map((virtualItem) => {
              const tx = filteredTransactions[virtualItem.index];
              if (!tx) return null;

              return (
                <div
                  key={tx.id}
                  className="absolute left-0 top-0 w-full"
                  style={{
                    transform: `translateY(${virtualItem.start}px)`,
                  }}
                >
                  <div
                    data-index={virtualItem.index}
                    ref={virtualizer.measureElement}
                    className="group bg-white hover:bg-zinc-50/50 transition-colors p-4 md:p-0 md:h-16 md:grid md:grid-cols-12 md:gap-4 md:items-center relative border-b border-zinc-50"
                  >
                    {renderTransactionContent(tx)}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <motion.div
            variants={HISTORY_CONTAINER_VARIANTS}
            initial="hidden"
            animate="visible"
            className="divide-y divide-zinc-50"
          >
            {filteredTransactions.map((tx, index) => (
              <motion.div
                key={tx.id}
                variants={HISTORY_ITEM_VARIANTS}
                transition={{ delay: index * 0.02 }}
                className="group bg-white hover:bg-zinc-50/50 transition-colors p-4 md:p-0 md:h-16 md:grid md:grid-cols-12 md:gap-4 md:items-center relative"
              >
                {renderTransactionContent(tx)}
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </Card>
  );
}

// --- Main Component ---
export default function DonorHistoryPage() {
  const [filters, dispatchFilters] = useReducer(
    historyFiltersReducer,
    DEFAULT_HISTORY_FILTERS,
  );
  const [rechartsModule, setRechartsModule] = useState<RechartsModule | null>(
    null,
  );
  const { searchTerm, statusFilter, typeFilter, yearFilter } = filters;

  useEffect(() => {
    let isMounted = true;

    importRechartsModule()
      .then((module) => {
        if (isMounted) {
          setRechartsModule({
            Bar: module.Bar,
            BarChart: module.BarChart,
            Cell: module.Cell,
            ResponsiveContainer: module.ResponsiveContainer,
            Tooltip: module.Tooltip,
          });
        }
      })
      .catch((error) => {
        console.error("Failed to load Recharts for donor history:", error);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredTransactions = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    return TRANSACTIONS.filter((t) => {
      const matchesSearch =
        normalizedSearch.length === 0 ||
        t.recipient.toLowerCase().includes(normalizedSearch) ||
        t.id.toLowerCase().includes(normalizedSearch);
      const matchesYear =
        new Date(t.date).getFullYear().toString() === yearFilter;
      const matchesType = typeFilter === "All" || t.type === typeFilter;
      const matchesStatus = statusFilter === "All" || t.status === statusFilter;
      return matchesSearch && matchesYear && matchesType && matchesStatus;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [searchTerm, yearFilter, typeFilter, statusFilter]);

  const totalGiven = useMemo(
    () =>
      filteredTransactions.reduce(
        (sum, t) => (t.status === "Succeeded" ? sum + t.amount : sum),
        0,
      ),
    [filteredTransactions],
  );
  const receiptCount = filteredTransactions.filter(
    (t) => t.status === "Succeeded",
  ).length;

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700 pb-20">
      <HistoryPageHeader
        yearFilter={yearFilter}
        onYearFilterChange={(value) =>
          dispatchFilters({ type: "set_year_filter", value })
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <HistoryStatsColumn
          filteredTransactionCount={filteredTransactions.length}
          receiptCount={receiptCount}
          rechartsModule={rechartsModule}
          totalGiven={totalGiven}
          yearFilter={yearFilter}
        />

        <div className="lg:col-span-2 flex flex-col gap-6">
          <HistoryFiltersToolbar
            searchTerm={searchTerm}
            statusFilter={statusFilter}
            typeFilter={typeFilter}
            onSearchTermChange={(value) =>
              dispatchFilters({ type: "set_search_term", value })
            }
            onStatusFilterChange={(value) =>
              dispatchFilters({ type: "set_status_filter", value })
            }
            onTypeFilterChange={(value) =>
              dispatchFilters({ type: "set_type_filter", value })
            }
          />
          <HistoryTransactionsCard
            filteredTransactions={filteredTransactions}
          />
        </div>
      </div>
    </div>
  );
}
