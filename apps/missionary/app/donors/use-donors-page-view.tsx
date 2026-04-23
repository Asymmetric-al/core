"use client";
"use no memo";

import { useMissionaryDonorRows } from "@asym/database/hooks";
import { invalidateSupabaseTableQuery } from "@asym/database/query-keys";
import { createBrowserClient } from "@asym/database/supabase";
import { useAuth } from "@asym/lib/hooks";
import { motion, AnimatePresence } from "@asym/lib/motion";
import { AddPartnerDialog } from "@asym/missionary/components/add-partner-dialog";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@asym/ui/components/shadcn/avatar";
import { Badge } from "@asym/ui/components/shadcn/badge";
import { Button } from "@asym/ui/components/shadcn/button";
import { Card, CardContent } from "@asym/ui/components/shadcn/card";
import {
  type ColumnDef,
  DataTableColumnHeader,
  DataTableResponsive,
} from "@asym/ui/components/shadcn/data-table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@asym/ui/components/shadcn/dialog";
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
import { Skeleton } from "@asym/ui/components/shadcn/skeleton";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@asym/ui/components/shadcn/tabs";
import { Textarea } from "@asym/ui/components/shadcn/textarea";
import { cn } from "@asym/ui/lib/utils";
import { useQueryClient } from "@tanstack/react-query";
import { format, formatDistanceToNow, differenceInMonths } from "date-fns";
import {
  Search,
  Filter,
  Mail,
  Phone,
  MapPin,
  Plus,
  Download,
  Heart,
  MessageSquare,
  Send,
  Copy,
  ExternalLink,
  Pencil,
  User,
  ArrowLeft,
  ArrowUpRight,
  ArrowDownUp,
  Calendar,
  Briefcase,
  Clock,
  AlertCircle,
  RefreshCw,
  MoreHorizontal,
  Tag,
  X,
  Check,
  Building2,
  Globe,
  Users,
  Star,
  Home,
  Loader2,
  Repeat,
} from "lucide-react";
import * as React from "react";
import { toast } from "sonner";

import { DonorTasks } from "./donor-tasks";
import {
  AVAILABLE_TAGS,
  formatCurrency,
  getActivityBg,
  getActivityIcon,
  getGiftTypeIcon,
  getPaymentMethodIcon,
  getRecurringStatusBadge,
  getStatusBadge,
  getStatusColor,
  getTagLabel,
  getTagStyle,
} from "./donors-model";
import { EditDonorDialog } from "./edit-donor-dialog";

import type {
  Activity,
  ActivityType,
  Address,
  Donor,
  RecurringStatus,
} from "./donors-model";

import { PageHeader } from "@/components/page-header";

const fadeInUp = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const scaleIn = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 },
};

const slideInRight = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
};

const springTransition = {
  type: "spring" as const,
  stiffness: 300,
  damping: 30,
};

const smoothTransition = {
  duration: 0.2,
  ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number],
};

function DonorListSkeleton() {
  return (
    <div className="p-3 space-y-2">
      {Array.from({ length: 12 }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: i * 0.03 }}
          className="flex items-center gap-3 p-4 rounded-2xl bg-white border border-zinc-100"
        >
          <Skeleton className="h-11 w-11 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <motion.div
      {...fadeInUp}
      transition={smoothTransition}
      className="flex flex-col items-center justify-center h-64 text-center p-6"
    >
      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={springTransition}
        className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center mb-4 border border-rose-100"
      >
        <AlertCircle className="h-7 w-7 text-rose-500" />
      </motion.div>
      <p className="text-sm font-bold text-zinc-900 mb-1">
        Something went wrong
      </p>
      <p className="text-xs text-zinc-500 mb-4">{message}</p>
      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
        <Button
          variant="outline"
          size="sm"
          onClick={onRetry}
          className="h-9 rounded-2xl border-zinc-200 bg-white text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-zinc-900"
        >
          <RefreshCw className="h-3.5 w-3.5 mr-2" />
          Try Again
        </Button>
      </motion.div>
    </motion.div>
  );
}

const MotionCard = motion.create(Card);

function StatCard({
  label,
  value,
  subtext,
  icon: Icon,
  iconBg,
  iconColor,
  onClick,
  isActive,
  delay = 0,
}: {
  label: string;
  value: string | number;
  subtext: string;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  onClick?: () => void;
  isActive?: boolean;
  delay?: number;
}) {
  const content = (
    <MotionCard
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...smoothTransition, delay }}
      whileHover={{ y: -2, boxShadow: "0 8px 30px rgba(0,0,0,0.08)" }}
      whileTap={onClick ? { scale: 0.98 } : undefined}
      className={cn(
        "border-zinc-200 bg-white shadow-sm transition-all rounded-xl",
        onClick && "cursor-pointer",
        isActive && "border-blue-400 ring-2 ring-blue-100",
      )}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="space-y-0.5">
            <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
              {label}
            </p>
            <motion.p
              key={value}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xl font-bold tracking-tight text-zinc-900"
            >
              {value}
            </motion.p>
            <span className="text-[10px] font-medium text-zinc-400 uppercase tracking-wider">
              {subtext}
            </span>
          </div>
          <motion.div
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={springTransition}
            className={cn(
              "h-9 w-9 rounded-lg border flex items-center justify-center",
              iconBg,
            )}
          >
            <Icon className={cn("h-4 w-4", iconColor)} />
          </motion.div>
        </div>
      </CardContent>
    </MotionCard>
  );

  if (onClick) {
    return (
      <button onClick={onClick} className="text-left w-full">
        {content}
      </button>
    );
  }
  return content;
}

type SortOption = "name" | "last_gift" | "total_given" | "joined_date";

type DonorActivityType = "note" | "call" | "meeting" | "email";
type DonorMutationResult = { ok: true } | { ok: false; error: unknown };

const DONOR_ACTIVITY_TITLES: Record<DonorActivityType, string> = {
  note: "Note",
  call: "Phone Call",
  meeting: "Meeting",
  email: "Email",
};

async function insertDonorActivity(options: {
  supabase: ReturnType<typeof createBrowserClient>;
  donorId: string;
  activityType: DonorActivityType;
  note: string;
}): Promise<DonorMutationResult> {
  try {
    const { error: insertError } = await options.supabase
      .from("donor_activities")
      .insert({
        donor_id: options.donorId,
        type: options.activityType,
        title: DONOR_ACTIVITY_TITLES[options.activityType],
        description: options.note,
        date: new Date().toISOString(),
      });
    if (insertError) return { ok: false, error: insertError };
    return { ok: true };
  } catch (error) {
    return { ok: false, error };
  }
}

async function updateDonorTags(options: {
  supabase: ReturnType<typeof createBrowserClient>;
  donorId: string;
  tags: string[];
}): Promise<DonorMutationResult> {
  try {
    const { error: updateError } = await options.supabase
      .from("donors")
      .update({
        tags: options.tags,
        updated_at: new Date().toISOString(),
      })
      .eq("id", options.donorId);
    if (updateError) return { ok: false, error: updateError };
    return { ok: true };
  } catch (error) {
    return { ok: false, error };
  }
}

export type DonorsPageViewModel = {
  activeCount: number;
  activePledgeCount: number;
  activeTab: string;
  activityType: "note" | "call" | "meeting" | "email";
  atRiskCount: number;
  clearAllFilters: () => void;
  copyToClipboard: (text: string, label: string) => void;
  donorColumns: ColumnDef<Donor>[];
  donors: Donor[];
  error: string | null;
  filteredDonors: Donor[];
  formatAddress: (address: Address) => string[];
  givingHistoryColumns: ColumnDef<Activity>[];
  givingHistoryRows: Activity[];
  handleAddNote: () => Promise<void>;
  handleRefreshDonors: () => void;
  handleSaveTags: () => Promise<void>;
  handleStatCardClick: (
    filterType: "atRisk" | "activePledge" | "lapsed" | "new",
  ) => void;
  hasActiveFilters: boolean;
  isEditDialogOpen: boolean;
  isLoading: boolean;
  isNoteDialogOpen: boolean;
  isSavingNote: boolean;
  isSavingTags: boolean;
  isTagDialogOpen: boolean;
  lapsedCount: number;
  monthlyPledgeTotal: number;
  noteInput: string;
  openEditDialog: () => void;
  pledgeFilter: string;
  profile: ReturnType<typeof useAuth>["profile"];
  searchTerm: string;
  selectedDonor: Donor | null;
  selectedTags: string[];
  setActiveTab: React.Dispatch<React.SetStateAction<string>>;
  setActivityType: React.Dispatch<
    React.SetStateAction<"note" | "call" | "meeting" | "email">
  >;
  setIsEditDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setIsNoteDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setIsTagDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setNoteInput: React.Dispatch<React.SetStateAction<string>>;
  setPledgeFilter: React.Dispatch<React.SetStateAction<string>>;
  setSearchTerm: React.Dispatch<React.SetStateAction<string>>;
  setSelectedDonorId: React.Dispatch<React.SetStateAction<string | null>>;
  setSortAsc: React.Dispatch<React.SetStateAction<boolean>>;
  setSortBy: React.Dispatch<React.SetStateAction<SortOption>>;
  setStatusFilter: React.Dispatch<React.SetStateAction<string>>;
  setTagFilter: React.Dispatch<React.SetStateAction<string[]>>;
  sortAsc: boolean;
  sortBy: SortOption;
  statusFilter: string;
  tagFilter: string[];
  toggleTag: (tagId: string) => void;
  totalGiven: number;
};

export function useDonorsPageView(): DonorsPageViewModel {
  const { profile, loading: authLoading } = useAuth();
  const queryClient = useQueryClient();
  const supabase = React.useMemo(
    () => (typeof window === "undefined" ? null : createBrowserClient()),
    [],
  );
  const donorsQuery = useMissionaryDonorRows(profile?.id);
  const [selectedDonorId, setSelectedDonorId] = React.useState<string | null>(
    null,
  );
  const [searchTerm, setSearchTerm] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string>("All");
  const [tagFilter, setTagFilter] = React.useState<string[]>([]);
  const [pledgeFilter, setPledgeFilter] = React.useState<string>("All");
  const [sortBy, setSortBy] = React.useState<SortOption>("last_gift");
  const [sortAsc, setSortAsc] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState("overview");
  const [noteInput, setNoteInput] = React.useState("");
  const [isNoteDialogOpen, setIsNoteDialogOpen] = React.useState(false);
  const [isTagDialogOpen, setIsTagDialogOpen] = React.useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
  const [selectedTags, setSelectedTags] = React.useState<string[]>([]);
  const [isSavingTags, setIsSavingTags] = React.useState(false);
  const [isSavingNote, setIsSavingNote] = React.useState(false);
  const [activityType, setActivityType] = React.useState<
    "note" | "call" | "meeting" | "email"
  >("note");
  const donors = React.useMemo(
    () => (donorsQuery.data ?? []) as Donor[],
    [donorsQuery.data],
  );
  const error =
    donorsQuery.error instanceof Error
      ? donorsQuery.error.message
      : donorsQuery.error
        ? String(donorsQuery.error)
        : null;
  const handleRefreshDonors = React.useCallback(() => {
    void Promise.all([
      invalidateSupabaseTableQuery(queryClient, "donors"),
      invalidateSupabaseTableQuery(queryClient, "donor_activities"),
      invalidateSupabaseTableQuery(queryClient, "donor_pledges"),
    ]);
  }, [queryClient]);

  const filteredDonors = React.useMemo(() => {
    const result = donors.filter((donor) => {
      const matchesSearch =
        (donor.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (donor.email || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (donor.location || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        (donor.organization || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase());
      const matchesStatus =
        statusFilter === "All" || donor.status === statusFilter;
      const matchesTags =
        tagFilter.length === 0 || tagFilter.some((t) => donor.tags.includes(t));
      const matchesPledge =
        pledgeFilter === "All" ||
        (pledgeFilter === "Active" && donor.has_active_pledge) ||
        (pledgeFilter === "Inactive" && !donor.has_active_pledge);
      return matchesSearch && matchesStatus && matchesTags && matchesPledge;
    });

    result.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case "name":
          comparison = (a.name || "").localeCompare(b.name || "");
          break;
        case "last_gift":
          const dateA = a.last_gift_date
            ? new Date(a.last_gift_date).getTime()
            : 0;
          const dateB = b.last_gift_date
            ? new Date(b.last_gift_date).getTime()
            : 0;
          comparison = dateB - dateA;
          break;
        case "total_given":
          comparison = (b.total_given || 0) - (a.total_given || 0);
          break;
        case "joined_date":
          const joinA = a.joined_date ? new Date(a.joined_date).getTime() : 0;
          const joinB = b.joined_date ? new Date(b.joined_date).getTime() : 0;
          comparison = joinB - joinA;
          break;
      }
      return sortAsc ? -comparison : comparison;
    });

    return result;
  }, [
    donors,
    searchTerm,
    statusFilter,
    tagFilter,
    pledgeFilter,
    sortBy,
    sortAsc,
  ]);

  const selectedDonor = React.useMemo(
    () => donors.find((d) => d.id === selectedDonorId) || null,
    [donors, selectedDonorId],
  );

  const donorColumns = React.useMemo<ColumnDef<Donor>[]>(
    () => [
      {
        accessorKey: "name",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Partner" />
        ),
        cell: ({ row }) => {
          const donor = row.original;
          const isSelected = selectedDonorId === donor.id;

          return (
            <div className="flex items-center gap-3 py-1">
              <div className="relative shrink-0">
                <Avatar
                  className={cn(
                    "h-10 w-10 border-2",
                    isSelected ? "border-zinc-700" : "border-white shadow-sm",
                  )}
                >
                  <AvatarImage src={donor.avatar_url} />
                  <AvatarFallback
                    className={cn(
                      "text-xs font-bold",
                      isSelected
                        ? "bg-zinc-800 text-zinc-300"
                        : "bg-zinc-100 text-zinc-500",
                    )}
                  >
                    {donor.initials}
                  </AvatarFallback>
                </Avatar>
                <div
                  className={cn(
                    "absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2",
                    isSelected ? "border-zinc-900" : "border-white",
                    getStatusColor(donor.status),
                  )}
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <span className="font-bold text-sm truncate text-zinc-900">
                    {donor.name}
                  </span>
                  {donor.has_active_pledge && (
                    <div
                      className="h-2 w-2 rounded-full shrink-0 ml-1 bg-emerald-500"
                      title="Active recurring donation"
                    />
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] truncate max-w-[100px] font-medium uppercase tracking-wider text-zinc-400">
                    {donor.location || "Unknown"}
                  </span>
                  <span className="text-xs font-black text-zinc-900">
                    {formatCurrency(donor.total_given)}
                  </span>
                </div>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "status",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Status" />
        ),
        cell: ({ row }) => getStatusBadge(row.original.status),
      },
      {
        accessorKey: "total_given",
        header: ({ column }) => (
          <div className="text-right">
            <DataTableColumnHeader
              className="justify-end"
              column={column}
              title="Given"
            />
          </div>
        ),
        cell: ({ row }) => (
          <div className="text-right font-black text-zinc-900 tabular-nums">
            {formatCurrency(row.original.total_given)}
          </div>
        ),
      },
      {
        accessorKey: "frequency",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Frequency" />
        ),
      },
    ],
    [selectedDonorId],
  );

  React.useEffect(() => {
    if (!selectedDonor) return;
    setSelectedTags(selectedDonor.tags || []);
    // Key on id only: refreshing donor rows must not wipe in-progress tag edits for the same partner.
  }, [selectedDonor?.id]); // eslint-disable-line react-hooks/exhaustive-deps -- sync when selected partner id changes

  const copyToClipboard = React.useCallback((text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  }, []);

  const handleAddNote = React.useCallback(async () => {
    if (!selectedDonor || !noteInput.trim() || !supabase) return;

    setIsSavingNote(true);
    const outcome = await insertDonorActivity({
      supabase,
      donorId: selectedDonor.id,
      activityType,
      note: noteInput.trim(),
    });
    if (outcome.ok) {
      toast.success("Activity logged successfully");
      setNoteInput("");
      setIsNoteDialogOpen(false);
      handleRefreshDonors();
    } else {
      toast.error("Failed to add activity");
      console.error(outcome.error);
    }
    setIsSavingNote(false);
  }, [selectedDonor, noteInput, activityType, supabase, handleRefreshDonors]);

  const handleSaveTags = React.useCallback(async () => {
    if (!selectedDonor || !supabase) return;

    setIsSavingTags(true);
    const outcome = await updateDonorTags({
      supabase,
      donorId: selectedDonor.id,
      tags: selectedTags,
    });
    if (outcome.ok) {
      toast.success("Tags updated successfully");
      setIsTagDialogOpen(false);
      handleRefreshDonors();
    } else {
      toast.error("Failed to update tags");
      console.error(outcome.error);
    }
    setIsSavingTags(false);
  }, [selectedDonor, selectedTags, supabase, handleRefreshDonors]);

  const toggleTag = React.useCallback((tagId: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagId) ? prev.filter((t) => t !== tagId) : [...prev, tagId],
    );
  }, []);

  const openEditDialog = React.useCallback(() => {
    if (!selectedDonor) return;
    setIsEditDialogOpen(true);
  }, [selectedDonor]);

  const handleStatCardClick = React.useCallback(
    (filterType: "atRisk" | "activePledge" | "lapsed" | "new") => {
      setSearchTerm("");
      setTagFilter([]);

      switch (filterType) {
        case "atRisk":
          setStatusFilter("At Risk");
          setPledgeFilter("All");
          break;
        case "activePledge":
          setStatusFilter("All");
          setPledgeFilter("Active");
          break;
        case "lapsed":
          setStatusFilter("Lapsed");
          setPledgeFilter("All");
          break;
        case "new":
          setStatusFilter("New");
          setPledgeFilter("All");
          break;
      }
      setSelectedDonorId(null);
    },
    [],
  );

  const clearAllFilters = React.useCallback(() => {
    setStatusFilter("All");
    setTagFilter([]);
    setPledgeFilter("All");
    setSearchTerm("");
  }, []);

  const isLoading = authLoading || donorsQuery.isLoading;

  const activeCount = donors.filter((d) => d.status === "Active").length;
  const atRiskCount = donors.filter((d) => d.status === "At Risk").length;
  const lapsedCount = donors.filter((d) => d.status === "Lapsed").length;
  const activePledgeCount = donors.filter((d) => d.has_active_pledge).length;
  const totalGiven = donors.reduce((sum, d) => sum + (d.total_given || 0), 0);
  const monthlyPledgeTotal = donors.reduce((sum, d) => {
    const activeRecurring = d.recurring_donations.find(
      (p) => p.status === "active",
    );
    if (!activeRecurring) return sum;
    const monthly =
      activeRecurring.frequency === "Monthly"
        ? activeRecurring.amount
        : activeRecurring.frequency === "Quarterly"
          ? activeRecurring.amount / 3
          : activeRecurring.amount / 12;
    return sum + monthly;
  }, 0);

  const formatAddress = (address: Address) => {
    const parts = [];
    if (address.street) parts.push(address.street);
    if (address.street2) parts.push(address.street2);
    const cityLine = [address.city, address.state, address.zip]
      .filter(Boolean)
      .join(", ");
    if (cityLine) parts.push(cityLine);
    if (
      address.country &&
      address.country !== "United States" &&
      address.country !== "USA"
    )
      parts.push(address.country);
    return parts;
  };

  const hasActiveFilters =
    statusFilter !== "All" ||
    tagFilter.length > 0 ||
    pledgeFilter !== "All" ||
    searchTerm.length > 0;

  const givingHistoryRows = React.useMemo(
    () =>
      (selectedDonor?.activities ?? []).filter(
        (activity) => activity.type === "gift",
      ),
    [selectedDonor],
  );

  const givingHistoryColumns = React.useMemo<ColumnDef<Activity>[]>(
    () => [
      {
        accessorKey: "date",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Date" />
        ),
        cell: ({ row }) => format(new Date(row.original.date), "MMM d, yyyy"),
      },
      {
        accessorKey: "title",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Type" />
        ),
      },
      {
        accessorKey: "gift_type",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Method" />
        ),
        cell: ({ row }) => (
          <span className="flex items-center gap-1.5 text-zinc-500">
            {row.original.gift_type && getGiftTypeIcon(row.original.gift_type)}
            {row.original.gift_type || "Online"}
          </span>
        ),
      },
      {
        accessorKey: "amount",
        header: ({ column }) => (
          <div className="text-right">
            <DataTableColumnHeader
              className="justify-end"
              column={column}
              title="Amount"
            />
          </div>
        ),
        cell: ({ row }) => (
          <div className="text-right font-bold text-zinc-900">
            {formatCurrency(row.original.amount || 0)}
          </div>
        ),
      },
      {
        accessorKey: "status",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Status" />
        ),
        cell: ({ row }) => (
          <Badge
            className={cn(
              "font-black rounded-full text-[9px] uppercase tracking-widest border-0",
              row.original.status === "Failed"
                ? "bg-rose-50 text-rose-600"
                : "bg-emerald-50 text-emerald-700",
            )}
          >
            {row.original.status || "Succeeded"}
          </Badge>
        ),
      },
    ],
    [],
  );

  return {
    activeCount,
    activePledgeCount,
    activeTab,
    activityType,
    atRiskCount,
    clearAllFilters,
    copyToClipboard,
    donorColumns,
    donors,
    error,
    filteredDonors,
    formatAddress,
    givingHistoryColumns,
    givingHistoryRows,
    handleAddNote,
    handleRefreshDonors,
    handleSaveTags,
    handleStatCardClick,
    hasActiveFilters,
    isEditDialogOpen,
    isLoading,
    isNoteDialogOpen,
    isSavingNote,
    isSavingTags,
    isTagDialogOpen,
    lapsedCount,
    monthlyPledgeTotal,
    noteInput,
    openEditDialog,
    pledgeFilter,
    profile,
    searchTerm,
    selectedDonor,
    selectedTags,
    setActiveTab,
    setActivityType,
    setIsEditDialogOpen,
    setIsNoteDialogOpen,
    setIsTagDialogOpen,
    setNoteInput,
    setPledgeFilter,
    setSearchTerm,
    setSelectedDonorId,
    setSortAsc,
    setSortBy,
    setStatusFilter,
    setTagFilter,
    sortAsc,
    sortBy,
    statusFilter,
    tagFilter,
    toggleTag,
    totalGiven,
  };
}

export function DonorsPageContent({
  activeCount,
  activePledgeCount,
  activeTab,
  activityType,
  atRiskCount,
  clearAllFilters,
  copyToClipboard,
  donorColumns,
  donors,
  error,
  filteredDonors,
  formatAddress,
  givingHistoryColumns,
  givingHistoryRows,
  handleAddNote,
  handleRefreshDonors,
  handleSaveTags,
  handleStatCardClick,
  hasActiveFilters,
  isEditDialogOpen,
  isLoading,
  isNoteDialogOpen,
  isSavingNote,
  isSavingTags,
  isTagDialogOpen,
  lapsedCount,
  monthlyPledgeTotal,
  noteInput,
  openEditDialog,
  pledgeFilter,
  profile,
  searchTerm,
  selectedDonor,
  selectedTags,
  setActiveTab,
  setActivityType,
  setIsEditDialogOpen,
  setIsNoteDialogOpen,
  setIsTagDialogOpen,
  setNoteInput,
  setPledgeFilter,
  setSearchTerm,
  setSelectedDonorId,
  setSortAsc,
  setSortBy,
  setStatusFilter,
  setTagFilter,
  sortAsc,
  sortBy,
  statusFilter,
  tagFilter,
  toggleTag,
  totalGiven,
}: DonorsPageViewModel) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <PageHeader
        title="Partners"
        description="Manage your support network and donor relationships."
      >
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button
            variant="outline"
            size="sm"
            className="h-9 px-4 text-xs font-medium"
          >
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </motion.div>
        {profile?.id && (
          <AddPartnerDialog
            missionaryId={profile.id}
            onSuccess={handleRefreshDonors}
            trigger={
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button size="sm" className="h-9 px-4 text-xs font-medium">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Partner
                </Button>
              </motion.div>
            }
          />
        )}
      </PageHeader>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Partners"
          value={donors.length}
          subtext={`${activeCount} active`}
          icon={Users}
          iconBg="bg-zinc-50 border-zinc-100"
          iconColor="text-zinc-900"
          delay={0}
        />
        <StatCard
          label="Total Given"
          value={formatCurrency(totalGiven)}
          subtext="Lifetime"
          icon={Heart}
          iconBg="bg-emerald-50 border-emerald-100"
          iconColor="text-emerald-600"
          delay={0.05}
        />
        <StatCard
          label="Recurring Donations"
          value={activePledgeCount}
          subtext={`${formatCurrency(monthlyPledgeTotal)}/mo`}
          icon={Repeat}
          iconBg="bg-blue-50 border-blue-100"
          iconColor="text-blue-600"
          onClick={() => handleStatCardClick("activePledge")}
          isActive={pledgeFilter === "Active"}
          delay={0.1}
        />
        <StatCard
          label="Needs Attention"
          value={atRiskCount + lapsedCount}
          subtext={`${atRiskCount} at risk, ${lapsedCount} lapsed`}
          icon={AlertCircle}
          iconBg="bg-amber-50 border-amber-100"
          iconColor="text-amber-600"
          onClick={() => handleStatCardClick("atRisk")}
          isActive={statusFilter === "At Risk"}
          delay={0.15}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ ...smoothTransition, delay: 0.2 }}
          className="lg:col-span-4 xl:col-span-3"
        >
          <Card className="border-zinc-200 bg-white rounded-2xl overflow-hidden shadow-sm h-full flex flex-col">
            <div className="p-4 border-b border-zinc-100 space-y-4 shrink-0">
              <div className="flex items-center justify-between">
                <h2 className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                  Partner List{" "}
                  {hasActiveFilters && (
                    <span className="text-blue-600">
                      ({filteredDonors.length})
                    </span>
                  )}
                </h2>
                <div className="flex gap-1">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-zinc-400 hover:text-zinc-900 rounded-lg"
                      >
                        <ArrowDownUp className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="w-48 rounded-xl border-zinc-100 shadow-xl"
                    >
                      <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
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
                        onCheckedChange={() => setSortAsc(!sortAsc)}
                        className="text-xs font-medium"
                      >
                        Ascending
                      </DropdownMenuCheckboxItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className={cn(
                          "h-8 w-8 rounded-lg",
                          hasActiveFilters
                            ? "text-blue-600 bg-blue-50"
                            : "text-zinc-400 hover:text-zinc-900",
                        )}
                      >
                        <Filter className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="w-56 rounded-xl border-zinc-100 shadow-xl max-h-[400px] overflow-y-auto"
                    >
                      <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                        Filter by Status
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator className="bg-zinc-100" />
                      {["All", "Active", "New", "Lapsed", "At Risk"].map(
                        (s) => (
                          <DropdownMenuCheckboxItem
                            key={s}
                            checked={statusFilter === s}
                            onCheckedChange={() => setStatusFilter(s)}
                            className="text-xs font-medium"
                          >
                            {s}
                          </DropdownMenuCheckboxItem>
                        ),
                      )}
                      <DropdownMenuSeparator className="bg-zinc-100" />
                      <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
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
                      <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                        Filter by Tag
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator className="bg-zinc-100" />
                      {AVAILABLE_TAGS.map((tag) => (
                        <DropdownMenuCheckboxItem
                          key={tag.id}
                          checked={tagFilter.includes(tag.id)}
                          onCheckedChange={() =>
                            setTagFilter((prev) =>
                              prev.includes(tag.id)
                                ? prev.filter((t) => t !== tag.id)
                                : [...prev, tag.id],
                            )
                          }
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
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
                <Input
                  placeholder="Search partners..."
                  className="pl-9 bg-zinc-50 border-zinc-100 focus:bg-white focus:border-zinc-300 transition-all h-10 rounded-xl text-sm"
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
                      <motion.div
                        layout
                        {...scaleIn}
                        transition={springTransition}
                      >
                        <Badge
                          variant="outline"
                          className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-600 border-zinc-200"
                        >
                          {statusFilter}
                          <button
                            onClick={() => setStatusFilter("All")}
                            className="ml-1 hover:text-zinc-900"
                          >
                            <X className="h-2.5 w-2.5" />
                          </button>
                        </Badge>
                      </motion.div>
                    )}
                    {pledgeFilter !== "All" && (
                      <motion.div
                        layout
                        {...scaleIn}
                        transition={springTransition}
                      >
                        <Badge
                          variant="outline"
                          className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border-blue-200"
                        >
                          {pledgeFilter === "Active"
                            ? "Recurring"
                            : "No Recurring"}
                          <button
                            onClick={() => setPledgeFilter("All")}
                            className="ml-1 hover:text-blue-900"
                          >
                            <X className="h-2.5 w-2.5" />
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
                            "text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border",
                            getTagStyle(tag),
                          )}
                        >
                          {getTagLabel(tag)}
                          <button
                            onClick={() =>
                              setTagFilter((prev) =>
                                prev.filter((t) => t !== tag),
                              )
                            }
                            className="ml-1"
                          >
                            <X className="h-2.5 w-2.5" />
                          </button>
                        </Badge>
                      </motion.div>
                    ))}
                    <motion.button
                      layout
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={clearAllFilters}
                      className="text-[9px] font-black uppercase tracking-widest text-rose-500 hover:text-rose-700 px-2"
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
                  <ErrorState message={error} onRetry={handleRefreshDonors} />
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
                      className="w-14 h-14 bg-zinc-100 rounded-2xl flex items-center justify-center mb-4"
                    >
                      <Search className="h-6 w-6 text-zinc-300" />
                    </motion.div>
                    <p className="text-sm font-bold text-zinc-900">
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
                    onRowClick={(row) => setSelectedDonorId(row.original.id)}
                    emptyState={
                      <div className="flex flex-col items-center justify-center py-12 text-center">
                        <p className="text-sm font-bold text-zinc-900">
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
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ ...smoothTransition, delay: 0.25 }}
          className="lg:col-span-8 xl:col-span-9"
        >
          <AnimatePresence mode="wait">
            {selectedDonor ? (
              <motion.div
                key={selectedDonor.id}
                {...slideInRight}
                transition={smoothTransition}
              >
                <Card className="border-zinc-200 bg-white rounded-2xl overflow-hidden shadow-sm h-full flex flex-col">
                  <div className="border-b border-zinc-100 p-6 shrink-0">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Button
                            variant="ghost"
                            size="icon"
                            className="lg:hidden h-9 w-9 text-zinc-400 rounded-xl hover:bg-zinc-100"
                            onClick={() => setSelectedDonorId(null)}
                          >
                            <ArrowLeft className="h-5 w-5" />
                          </Button>
                        </motion.div>
                        <motion.div
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={springTransition}
                        >
                          <Avatar className="h-14 w-14 border-2 border-white shadow-lg rounded-2xl">
                            <AvatarImage src={selectedDonor.avatar_url} />
                            <AvatarFallback className="text-lg font-bold bg-zinc-100 text-zinc-500">
                              {selectedDonor.initials}
                            </AvatarFallback>
                          </Avatar>
                        </motion.div>
                        <motion.div
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ ...smoothTransition, delay: 0.1 }}
                        >
                          <div className="flex items-center gap-3 mb-1">
                            <h2 className="text-lg font-bold text-zinc-900 tracking-tight">
                              {selectedDonor.name}
                            </h2>
                            {getStatusBadge(selectedDonor.status)}
                          </div>
                          <div className="flex items-center gap-3 text-xs text-zinc-500">
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />{" "}
                              {selectedDonor.location || "Unknown"}
                            </span>
                            <span className="flex items-center gap-1 capitalize">
                              {selectedDonor.type === "Church" ? (
                                <Building2 className="h-3 w-3" />
                              ) : selectedDonor.type === "Organization" ? (
                                <Briefcase className="h-3 w-3" />
                              ) : (
                                <User className="h-3 w-3" />
                              )}
                              {selectedDonor.type}
                            </span>
                          </div>
                        </motion.div>
                      </div>
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ ...smoothTransition, delay: 0.15 }}
                        className="flex items-center gap-2 w-full sm:w-auto"
                      >
                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="flex-1 sm:flex-none"
                        >
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full h-9 px-4 text-xs font-medium rounded-xl border-zinc-200 hover:bg-zinc-50"
                            onClick={() => {
                              setActivityType("note");
                              setIsNoteDialogOpen(true);
                            }}
                          >
                            <Pencil className="h-3.5 w-3.5 mr-1.5" /> Note
                          </Button>
                        </motion.div>
                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="flex-1 sm:flex-none"
                        >
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full h-9 px-4 text-xs font-medium rounded-xl border-zinc-200 hover:bg-zinc-50"
                            asChild
                          >
                            <a
                              href={`tel:${selectedDonor.phone || selectedDonor.mobile}`}
                            >
                              <Phone className="h-3.5 w-3.5 mr-1.5" /> Call
                            </a>
                          </Button>
                        </motion.div>
                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="flex-1 sm:flex-none"
                        >
                          <Button
                            size="sm"
                            className="w-full h-9 px-4 text-xs font-medium rounded-xl"
                            asChild
                          >
                            <a href={`mailto:${selectedDonor.email}`}>
                              <Mail className="h-3.5 w-3.5 mr-1.5" /> Email
                            </a>
                          </Button>
                        </motion.div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-9 w-9 text-zinc-400 rounded-xl hover:bg-zinc-100"
                            >
                              <MoreHorizontal className="h-5 w-5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="end"
                            className="rounded-xl border-zinc-100 shadow-xl"
                          >
                            <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                              Actions
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator className="bg-zinc-100" />
                            <DropdownMenuItem
                              onClick={openEditDialog}
                              className="text-xs font-medium"
                            >
                              <Pencil className="h-3.5 w-3.5 mr-2" /> Edit
                              Profile
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => setIsTagDialogOpen(true)}
                              className="text-xs font-medium"
                            >
                              <Tag className="h-3.5 w-3.5 mr-2" /> Manage Tags
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-zinc-100" />
                            <DropdownMenuItem
                              onClick={() => {
                                setActivityType("call");
                                setIsNoteDialogOpen(true);
                              }}
                              className="text-xs font-medium"
                            >
                              <Phone className="h-3.5 w-3.5 mr-2" /> Log Call
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                setActivityType("meeting");
                                setIsNoteDialogOpen(true);
                              }}
                              className="text-xs font-medium"
                            >
                              <Briefcase className="h-3.5 w-3.5 mr-2" /> Log
                              Meeting
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                setActivityType("email");
                                setIsNoteDialogOpen(true);
                              }}
                              className="text-xs font-medium"
                            >
                              <Mail className="h-3.5 w-3.5 mr-2" /> Log Email
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </motion.div>
                    </div>

                    <motion.div
                      variants={staggerContainer}
                      initial="initial"
                      animate="animate"
                      className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6"
                    >
                      {[
                        {
                          label: "Lifetime",
                          value: formatCurrency(selectedDonor.total_given),
                        },
                        {
                          label: "Last Gift",
                          value: formatCurrency(selectedDonor.last_gift_amount),
                          extra: selectedDonor.last_gift_date
                            ? formatDistanceToNow(
                                new Date(selectedDonor.last_gift_date),
                                { addSuffix: true },
                              )
                            : null,
                          showPulse:
                            selectedDonor.last_gift_date &&
                            differenceInMonths(
                              new Date(),
                              new Date(selectedDonor.last_gift_date),
                            ) < 1,
                        },
                        {
                          label: "Frequency",
                          value: selectedDonor.frequency || "N/A",
                          icon: ArrowUpRight,
                        },
                        {
                          label: "Partner Since",
                          value: selectedDonor.joined_date
                            ? format(
                                new Date(selectedDonor.joined_date),
                                "MMM yyyy",
                              )
                            : "N/A",
                        },
                      ].map((stat, i) => (
                        <motion.div
                          key={stat.label}
                          variants={fadeInUp}
                          transition={{
                            ...smoothTransition,
                            delay: 0.2 + i * 0.05,
                          }}
                          whileHover={{ y: -2 }}
                          className="bg-zinc-50 p-4 rounded-2xl border border-zinc-100"
                        >
                          <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
                            {stat.label}
                          </p>
                          <div className="flex items-center gap-2">
                            {stat.icon && (
                              <stat.icon className="h-3.5 w-3.5 text-emerald-600" />
                            )}
                            <p
                              className={cn(
                                stat.label === "Lifetime" ||
                                  stat.label === "Last Gift"
                                  ? "text-lg"
                                  : "text-sm",
                                "font-bold text-zinc-900",
                              )}
                            >
                              {stat.value}
                            </p>
                            {stat.showPulse && (
                              <motion.div
                                animate={{
                                  scale: [1, 1.3, 1],
                                  opacity: [1, 0.7, 1],
                                }}
                                transition={{ duration: 1.5, repeat: Infinity }}
                                className="w-2 h-2 bg-emerald-500 rounded-full"
                              />
                            )}
                          </div>
                          {stat.extra && (
                            <p className="text-[10px] text-zinc-400 mt-0.5">
                              {stat.extra}
                            </p>
                          )}
                        </motion.div>
                      ))}
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.4 }}
                      className="flex flex-wrap items-center gap-1.5 mt-4"
                    >
                      <AnimatePresence mode="popLayout">
                        {(selectedDonor.tags || []).map((tag, i) => (
                          <motion.div
                            key={tag}
                            layout
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            transition={{
                              ...springTransition,
                              delay: i * 0.03,
                            }}
                          >
                            <Badge
                              variant="outline"
                              className={cn(
                                "text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border",
                                getTagStyle(tag),
                              )}
                            >
                              {getTagLabel(tag)}
                            </Badge>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2 text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-zinc-900"
                          onClick={() => setIsTagDialogOpen(true)}
                        >
                          <Plus className="h-3 w-3 mr-1" /> Add Tag
                        </Button>
                      </motion.div>
                    </motion.div>
                  </div>

                  <Tabs
                    value={activeTab}
                    onValueChange={setActiveTab}
                    className="flex-1 flex flex-col min-h-0"
                  >
                    <div className="px-6 py-4 border-b border-zinc-100 shrink-0">
                      <TabsList className="bg-zinc-100/50 border border-zinc-100 p-1.5 h-auto rounded-2xl w-full sm:w-auto grid grid-cols-5 sm:flex">
                        {[
                          "overview",
                          "tasks",
                          "contact",
                          "recurring",
                          "giving",
                        ].map((tab) => (
                          <TabsTrigger
                            key={tab}
                            value={tab}
                            className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm px-4 sm:px-6 py-2 text-[10px] font-black uppercase tracking-widest text-zinc-400 data-[state=active]:text-zinc-900 transition-all"
                          >
                            {tab === "overview"
                              ? "Overview"
                              : tab === "tasks"
                                ? "Tasks"
                                : tab === "contact"
                                  ? "Contact"
                                  : tab === "recurring"
                                    ? "Recurring"
                                    : "Giving"}
                          </TabsTrigger>
                        ))}
                      </TabsList>
                    </div>

                    <ScrollArea className="flex-1 min-h-0">
                      <div className="p-6">
                        <AnimatePresence mode="wait">
                          <TabsContent
                            value="overview"
                            className="mt-0 space-y-6"
                          >
                            <motion.div
                              {...fadeInUp}
                              transition={smoothTransition}
                              className="bg-zinc-50 p-4 rounded-2xl border border-zinc-100"
                            >
                              <Textarea
                                placeholder="Log a call, meeting notes, or observation..."
                                className="min-h-[80px] border-none bg-white focus:ring-0 resize-none text-sm p-3 rounded-xl shadow-sm"
                                value={noteInput}
                                onChange={(e) => setNoteInput(e.target.value)}
                              />
                              <div className="flex justify-between items-center mt-3 pt-3 border-t border-zinc-100">
                                <div className="flex gap-2">
                                  {[
                                    {
                                      type: "call",
                                      icon: Phone,
                                      bg: "bg-blue-50 text-blue-600",
                                    },
                                    {
                                      type: "meeting",
                                      icon: Briefcase,
                                      bg: "bg-emerald-50 text-emerald-600",
                                    },
                                    {
                                      type: "note",
                                      icon: MessageSquare,
                                      bg: "bg-zinc-200 text-zinc-700",
                                      hidden: "hidden sm:flex",
                                    },
                                  ].map(({ type, icon: Icon, bg, hidden }) => (
                                    <motion.div
                                      key={type}
                                      whileHover={{ scale: 1.02 }}
                                      whileTap={{ scale: 0.98 }}
                                    >
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className={cn(
                                          "h-8 rounded-lg text-[10px] font-black uppercase tracking-widest",
                                          hidden,
                                          activityType === type
                                            ? bg
                                            : "text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100",
                                        )}
                                        onClick={() =>
                                          setActivityType(
                                            type as typeof activityType,
                                          )
                                        }
                                      >
                                        <Icon className="h-3.5 w-3.5 mr-1.5" />{" "}
                                        {type.charAt(0).toUpperCase() +
                                          type.slice(1)}
                                      </Button>
                                    </motion.div>
                                  ))}
                                </div>
                                <motion.div
                                  whileHover={{ scale: 1.02 }}
                                  whileTap={{ scale: 0.98 }}
                                >
                                  <Button
                                    size="sm"
                                    className="h-8 rounded-xl px-4 text-[10px] font-black uppercase tracking-widest"
                                    onClick={handleAddNote}
                                    disabled={!noteInput.trim() || isSavingNote}
                                  >
                                    {isSavingNote ? (
                                      <Loader2 className="h-3 w-3 animate-spin" />
                                    ) : (
                                      <>
                                        Post <Send className="h-3 w-3 ml-1.5" />
                                      </>
                                    )}
                                  </Button>
                                </motion.div>
                              </div>
                            </motion.div>

                            <div className="space-y-4 relative">
                              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-zinc-100" />

                              {selectedDonor.activities.length === 0 ? (
                                <motion.div
                                  {...fadeInUp}
                                  className="flex flex-col items-center justify-center py-16 text-center ml-8"
                                >
                                  <motion.div
                                    initial={{ scale: 0.8 }}
                                    animate={{ scale: 1 }}
                                    transition={springTransition}
                                    className="w-16 h-16 bg-zinc-100 rounded-2xl flex items-center justify-center mb-4"
                                  >
                                    <Calendar className="h-7 w-7 text-zinc-300" />
                                  </motion.div>
                                  <p className="text-sm font-bold text-zinc-900">
                                    No activity recorded yet
                                  </p>
                                  <p className="text-xs text-zinc-400 mt-1">
                                    Start by logging your first interaction
                                  </p>
                                </motion.div>
                              ) : (
                                <AnimatePresence>
                                  {selectedDonor.activities.map(
                                    (activity, i) => (
                                      <motion.div
                                        key={activity.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{
                                          ...smoothTransition,
                                          delay: i * 0.05,
                                        }}
                                        className="relative pl-10 group"
                                      >
                                        <motion.div
                                          whileHover={{ scale: 1.15 }}
                                          className={cn(
                                            "absolute left-0 top-1 h-8 w-8 rounded-xl flex items-center justify-center shadow-sm z-10",
                                            getActivityBg(
                                              activity.type as ActivityType,
                                            ),
                                          )}
                                        >
                                          {getActivityIcon(
                                            activity.type as ActivityType,
                                          )}
                                        </motion.div>

                                        <motion.div
                                          whileHover={{
                                            y: -2,
                                            boxShadow:
                                              "0 8px 30px rgba(0,0,0,0.08)",
                                          }}
                                          className="bg-white p-4 rounded-2xl border border-zinc-200 hover:border-zinc-300 transition-all"
                                        >
                                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-1">
                                            <div className="space-y-1">
                                              <div className="flex flex-wrap items-center gap-2">
                                                <span className="text-sm font-bold text-zinc-900">
                                                  {activity.title}
                                                </span>
                                                {activity.amount && (
                                                  <Badge
                                                    className={cn(
                                                      "font-black px-2 h-5 rounded-lg text-[9px] uppercase tracking-widest border-0",
                                                      activity.status ===
                                                        "Failed"
                                                        ? "bg-rose-50 text-rose-600"
                                                        : "bg-emerald-50 text-emerald-700",
                                                    )}
                                                  >
                                                    {formatCurrency(
                                                      activity.amount,
                                                    )}
                                                  </Badge>
                                                )}
                                                {activity.gift_type && (
                                                  <span className="flex items-center gap-1 text-[10px] font-medium text-zinc-400">
                                                    {getGiftTypeIcon(
                                                      activity.gift_type,
                                                    )}
                                                    {activity.gift_type}
                                                  </span>
                                                )}
                                                {activity.status ===
                                                  "Failed" && (
                                                  <Badge className="bg-rose-50 text-rose-600 border-0 text-[9px] font-black uppercase tracking-widest">
                                                    Failed
                                                  </Badge>
                                                )}
                                              </div>
                                              {activity.description && (
                                                <p className="text-sm text-zinc-500 leading-relaxed">
                                                  {activity.description}
                                                </p>
                                              )}
                                              {activity.note && (
                                                <p className="text-xs text-zinc-400 italic">
                                                  {activity.note}
                                                </p>
                                              )}
                                            </div>
                                            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 whitespace-nowrap">
                                              {format(
                                                new Date(activity.date),
                                                "MMM d, yyyy",
                                              )}
                                            </span>
                                          </div>
                                        </motion.div>
                                      </motion.div>
                                    ),
                                  )}
                                </AnimatePresence>
                              )}
                            </div>
                          </TabsContent>

                          <TabsContent value="tasks" className="mt-0 space-y-6">
                            <DonorTasks
                              donorId={selectedDonor.id}
                              donorName={selectedDonor.name}
                            />
                          </TabsContent>

                          <TabsContent
                            value="contact"
                            className="mt-0 space-y-6"
                          >
                            <motion.div
                              {...fadeInUp}
                              transition={smoothTransition}
                              className="flex items-center justify-between mb-2"
                            >
                              <h3 className="text-sm font-bold text-zinc-900">
                                Contact Information
                              </h3>
                              <motion.div
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                              >
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={openEditDialog}
                                  className="h-8 px-3 text-xs rounded-xl border-zinc-200"
                                >
                                  <Pencil className="h-3.5 w-3.5 mr-1.5" /> Edit
                                </Button>
                              </motion.div>
                            </motion.div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                              <motion.div
                                variants={staggerContainer}
                                initial="initial"
                                animate="animate"
                                className="space-y-3"
                              >
                                {[
                                  {
                                    icon: Mail,
                                    label: "Email",
                                    value: selectedDonor.email,
                                    preferred:
                                      selectedDonor.preferred_contact ===
                                      "email",
                                    color: "blue",
                                  },
                                  {
                                    icon: Phone,
                                    label: "Primary Phone",
                                    value: selectedDonor.phone,
                                    preferred:
                                      selectedDonor.preferred_contact ===
                                      "phone",
                                    color: "emerald",
                                  },
                                  {
                                    icon: MessageSquare,
                                    label: "Mobile / Text",
                                    value: selectedDonor.mobile,
                                    preferred:
                                      selectedDonor.preferred_contact ===
                                      "text",
                                    color: "purple",
                                  },
                                  {
                                    icon: Briefcase,
                                    label: "Work Phone",
                                    value: selectedDonor.work_phone,
                                    color: "zinc",
                                  },
                                ].map((item, i) => (
                                  <motion.div
                                    key={item.label}
                                    variants={fadeInUp}
                                    transition={{ delay: i * 0.05 }}
                                    whileHover={{ y: -2 }}
                                    className="flex items-center justify-between p-4 bg-zinc-50 rounded-2xl border border-zinc-100 group hover:border-zinc-200 transition-all"
                                  >
                                    <div className="flex items-center gap-3">
                                      <div
                                        className={cn(
                                          "h-10 w-10 rounded-xl flex items-center justify-center shrink-0",
                                          `bg-${item.color}-50 text-${item.color}-600`,
                                        )}
                                      >
                                        <item.icon className="h-4 w-4" />
                                      </div>
                                      <div className="min-w-0">
                                        <div className="flex items-center gap-2">
                                          <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                                            {item.label}
                                          </p>
                                          {item.preferred && (
                                            <Badge
                                              className={cn(
                                                `bg-${item.color}-50 text-${item.color}-600`,
                                                "border-0 text-[8px] font-black uppercase tracking-widest px-1.5 py-0",
                                              )}
                                            >
                                              Preferred
                                            </Badge>
                                          )}
                                        </div>
                                        <p className="text-sm font-medium text-zinc-900 truncate">
                                          {item.value || "Not provided"}
                                        </p>
                                      </div>
                                    </div>
                                    {item.value && (
                                      <motion.div
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.97 }}
                                      >
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className={cn(
                                            "h-9 w-9 rounded-xl shrink-0",
                                            `text-zinc-400 hover:text-${item.color}-600 hover:bg-${item.color}-50`,
                                          )}
                                          onClick={() =>
                                            copyToClipboard(
                                              item.value!,
                                              item.label,
                                            )
                                          }
                                        >
                                          <Copy className="h-4 w-4" />
                                        </Button>
                                      </motion.div>
                                    )}
                                  </motion.div>
                                ))}
                                {selectedDonor.website && (
                                  <motion.div
                                    variants={fadeInUp}
                                    whileHover={{ y: -2 }}
                                    className="flex items-center justify-between p-4 bg-zinc-50 rounded-2xl border border-zinc-100 group hover:border-zinc-200 transition-all"
                                  >
                                    <div className="flex items-center gap-3">
                                      <div className="h-10 w-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                                        <Globe className="h-4 w-4" />
                                      </div>
                                      <div className="min-w-0">
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                                          Website
                                        </p>
                                        <p className="text-sm font-medium text-zinc-900 truncate">
                                          {selectedDonor.website}
                                        </p>
                                      </div>
                                    </div>
                                    <motion.div
                                      whileHover={{ scale: 1.1 }}
                                      whileTap={{ scale: 0.97 }}
                                    >
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-9 w-9 text-zinc-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl shrink-0"
                                        asChild
                                      >
                                        <a
                                          href={
                                            selectedDonor.website.startsWith(
                                              "http",
                                            )
                                              ? selectedDonor.website
                                              : `https://${selectedDonor.website}`
                                          }
                                          target="_blank"
                                          rel="noopener noreferrer"
                                        >
                                          <ExternalLink className="h-4 w-4" />
                                        </a>
                                      </Button>
                                    </motion.div>
                                  </motion.div>
                                )}
                              </motion.div>

                              <motion.div
                                variants={staggerContainer}
                                initial="initial"
                                animate="animate"
                                className="space-y-4"
                              >
                                <motion.div
                                  variants={fadeInUp}
                                  whileHover={{ y: -2 }}
                                  className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100"
                                >
                                  <div className="flex items-start justify-between">
                                    <div className="flex items-start gap-3">
                                      <div className="h-10 w-10 rounded-xl bg-zinc-100 text-zinc-500 flex items-center justify-center shrink-0">
                                        <Home className="h-4 w-4" />
                                      </div>
                                      <div>
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1">
                                          Mailing Address
                                        </p>
                                        {selectedDonor.address?.street ? (
                                          <>
                                            {formatAddress(
                                              selectedDonor.address,
                                            ).map((line, i) => (
                                              <p
                                                key={`${line}-${selectedDonor.id}`}
                                                className={cn(
                                                  "text-sm",
                                                  i === 0
                                                    ? "font-medium text-zinc-900"
                                                    : "text-zinc-500",
                                                )}
                                              >
                                                {line}
                                              </p>
                                            ))}
                                          </>
                                        ) : (
                                          <p className="text-sm text-zinc-400 italic">
                                            No address on file
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                    {selectedDonor.address?.street && (
                                      <motion.div
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.97 }}
                                      >
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-9 w-9 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded-xl shrink-0"
                                          asChild
                                        >
                                          <a
                                            href={`https://maps.google.com/?q=${encodeURIComponent(formatAddress(selectedDonor.address).join(", "))}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                          >
                                            <ExternalLink className="h-4 w-4" />
                                          </a>
                                        </Button>
                                      </motion.div>
                                    )}
                                  </div>
                                </motion.div>

                                {(selectedDonor.organization ||
                                  selectedDonor.title) && (
                                  <motion.div
                                    variants={fadeInUp}
                                    whileHover={{ y: -2 }}
                                    className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100"
                                  >
                                    <div className="flex items-start gap-3">
                                      <div className="h-10 w-10 rounded-xl bg-zinc-100 text-zinc-500 flex items-center justify-center shrink-0">
                                        <Building2 className="h-4 w-4" />
                                      </div>
                                      <div>
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1">
                                          Organization
                                        </p>
                                        {selectedDonor.organization && (
                                          <p className="text-sm font-medium text-zinc-900">
                                            {selectedDonor.organization}
                                          </p>
                                        )}
                                        {selectedDonor.title && (
                                          <p className="text-sm text-zinc-500">
                                            {selectedDonor.title}
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                  </motion.div>
                                )}

                                <div className="grid grid-cols-2 gap-3">
                                  {selectedDonor.spouse && (
                                    <motion.div
                                      variants={fadeInUp}
                                      whileHover={{ y: -2 }}
                                      className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100"
                                    >
                                      <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center shrink-0">
                                          <Heart className="h-4 w-4" />
                                        </div>
                                        <div>
                                          <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                                            Spouse
                                          </p>
                                          <p className="text-sm font-medium text-zinc-900">
                                            {selectedDonor.spouse}
                                          </p>
                                        </div>
                                      </div>
                                    </motion.div>
                                  )}
                                  {selectedDonor.birthday && (
                                    <motion.div
                                      variants={fadeInUp}
                                      whileHover={{ y: -2 }}
                                      className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100"
                                    >
                                      <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center shrink-0">
                                          <Star className="h-4 w-4" />
                                        </div>
                                        <div>
                                          <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                                            Birthday
                                          </p>
                                          <p className="text-sm font-medium text-zinc-900">
                                            {format(
                                              new Date(selectedDonor.birthday),
                                              "MMMM d",
                                            )}
                                          </p>
                                        </div>
                                      </div>
                                    </motion.div>
                                  )}
                                  {selectedDonor.anniversary && (
                                    <motion.div
                                      variants={fadeInUp}
                                      whileHover={{ y: -2 }}
                                      className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100"
                                    >
                                      <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-xl bg-purple-50 text-purple-500 flex items-center justify-center shrink-0">
                                          <Calendar className="h-4 w-4" />
                                        </div>
                                        <div>
                                          <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                                            Anniversary
                                          </p>
                                          <p className="text-sm font-medium text-zinc-900">
                                            {format(
                                              new Date(
                                                selectedDonor.anniversary,
                                              ),
                                              "MMMM d",
                                            )}
                                          </p>
                                        </div>
                                      </div>
                                    </motion.div>
                                  )}
                                </div>

                                {selectedDonor.notes && (
                                  <motion.div
                                    variants={fadeInUp}
                                    whileHover={{ y: -2 }}
                                    className="p-4 bg-amber-50/50 rounded-2xl border border-amber-100"
                                  >
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-amber-600 mb-2">
                                      Internal Notes
                                    </p>
                                    <p className="text-sm text-zinc-700">
                                      {selectedDonor.notes}
                                    </p>
                                  </motion.div>
                                )}
                              </motion.div>
                            </div>
                          </TabsContent>

                          <TabsContent
                            value="recurring"
                            className="mt-0 space-y-6"
                          >
                            <motion.div
                              {...fadeInUp}
                              transition={smoothTransition}
                              className="flex items-center justify-between mb-2"
                            >
                              <div>
                                <h3 className="text-sm font-bold text-zinc-900">
                                  Recurring Donations
                                </h3>
                                <p className="text-xs text-zinc-500 mt-0.5">
                                  Scheduled giving commitments for this partner
                                </p>
                              </div>
                            </motion.div>

                            {selectedDonor.recurring_donations.length === 0 ? (
                              <motion.div
                                {...fadeInUp}
                                className="flex flex-col items-center justify-center py-16 text-center bg-zinc-50 rounded-2xl border border-zinc-100"
                              >
                                <motion.div
                                  initial={{ scale: 0.8 }}
                                  animate={{ scale: 1 }}
                                  transition={springTransition}
                                  className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-4 shadow-sm"
                                >
                                  <Repeat className="h-7 w-7 text-zinc-300" />
                                </motion.div>
                                <p className="text-sm font-bold text-zinc-900">
                                  No recurring donations
                                </p>
                                <p className="text-xs text-zinc-400 mt-1 max-w-[280px]">
                                  When this partner sets up a recurring gift, it
                                  will appear here with all the details.
                                </p>
                              </motion.div>
                            ) : (
                              <motion.div
                                variants={staggerContainer}
                                initial="initial"
                                animate="animate"
                                className="space-y-4"
                              >
                                {selectedDonor.recurring_donations.map(
                                  (recurring, i) => (
                                    <motion.div
                                      key={recurring.id}
                                      variants={fadeInUp}
                                      transition={{ delay: i * 0.1 }}
                                      whileHover={{ y: -2 }}
                                      className={cn(
                                        "p-5 rounded-2xl border transition-all",
                                        recurring.status === "active"
                                          ? "bg-linear-to-br from-emerald-50/80 to-emerald-50/30 border-emerald-200"
                                          : "bg-zinc-50 border-zinc-200",
                                      )}
                                    >
                                      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 mb-5">
                                        <div className="flex items-start gap-4">
                                          <motion.div
                                            whileHover={{
                                              scale: 1.1,
                                              rotate: 5,
                                            }}
                                            className={cn(
                                              "h-12 w-12 rounded-xl flex items-center justify-center shrink-0",
                                              recurring.status === "active"
                                                ? "bg-emerald-100"
                                                : "bg-zinc-100",
                                            )}
                                          >
                                            {getPaymentMethodIcon(
                                              recurring.payment_method,
                                            )}
                                          </motion.div>
                                          <div>
                                            <div className="flex items-center gap-3 mb-1">
                                              <h4 className="text-xl font-bold text-zinc-900">
                                                {formatCurrency(
                                                  Number(recurring.amount),
                                                )}
                                              </h4>
                                              <span className="text-sm font-medium text-zinc-500">
                                                /{" "}
                                                {recurring.frequency.toLowerCase()}
                                              </span>
                                              {getRecurringStatusBadge(
                                                recurring.status as RecurringStatus,
                                              )}
                                            </div>
                                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-zinc-500">
                                              <span className="flex items-center gap-1">
                                                <Calendar className="h-3.5 w-3.5" />
                                                Started{" "}
                                                {format(
                                                  new Date(
                                                    recurring.start_date,
                                                  ),
                                                  "MMM d, yyyy",
                                                )}
                                              </span>
                                              {recurring.end_date ? (
                                                <span className="flex items-center gap-1 text-amber-600">
                                                  <Clock className="h-3.5 w-3.5" />
                                                  Ends{" "}
                                                  {format(
                                                    new Date(
                                                      recurring.end_date,
                                                    ),
                                                    "MMM d, yyyy",
                                                  )}
                                                </span>
                                              ) : (
                                                <span className="text-emerald-600">
                                                  No end date
                                                </span>
                                              )}
                                            </div>
                                          </div>
                                        </div>
                                        {recurring.status === "active" &&
                                          recurring.next_payment_date && (
                                            <motion.div
                                              initial={{
                                                opacity: 0,
                                                scale: 0.9,
                                              }}
                                              animate={{ opacity: 1, scale: 1 }}
                                              className="bg-white p-3 rounded-xl border border-emerald-100 text-center lg:text-right"
                                            >
                                              <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                                                Next Payment
                                              </p>
                                              <p className="text-lg font-bold text-zinc-900">
                                                {format(
                                                  new Date(
                                                    recurring.next_payment_date,
                                                  ),
                                                  "MMM d",
                                                )}
                                              </p>
                                              <p className="text-xs text-zinc-500">
                                                {formatDistanceToNow(
                                                  new Date(
                                                    recurring.next_payment_date,
                                                  ),
                                                  { addSuffix: true },
                                                )}
                                              </p>
                                            </motion.div>
                                          )}
                                      </div>

                                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 p-4 bg-white/60 rounded-xl border border-zinc-100">
                                        {[
                                          {
                                            label: "Payment Method",
                                            value:
                                              recurring.payment_method ||
                                              "Online",
                                            icon: true,
                                          },
                                          {
                                            label: "Total Paid",
                                            value: formatCurrency(
                                              Number(recurring.total_paid),
                                            ),
                                            color: "text-emerald-600",
                                          },
                                          {
                                            label: "Expected",
                                            value: formatCurrency(
                                              Number(recurring.total_expected),
                                            ),
                                          },
                                          {
                                            label: "Completed",
                                            value: `${recurring.payments_completed} payments`,
                                          },
                                          {
                                            label: "Remaining",
                                            value:
                                              recurring.payments_remaining > 0
                                                ? `${recurring.payments_remaining} payments`
                                                : "Ongoing",
                                          },
                                        ].map((item) => (
                                          <div key={item.label}>
                                            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1">
                                              {item.label}
                                            </p>
                                            <div className="flex items-center gap-1.5">
                                              {item.icon &&
                                                getPaymentMethodIcon(
                                                  recurring.payment_method,
                                                )}
                                              <p
                                                className={cn(
                                                  "text-sm font-bold",
                                                  item.color || "text-zinc-900",
                                                )}
                                              >
                                                {item.value}
                                              </p>
                                            </div>
                                          </div>
                                        ))}
                                      </div>

                                      <div className="mt-4">
                                        <div className="flex items-center justify-between mb-1.5">
                                          <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                                            Progress
                                          </span>
                                          <span className="text-xs font-bold text-zinc-600">
                                            {Number(recurring.total_expected) >
                                            0
                                              ? `${Math.round((Number(recurring.total_paid) / Number(recurring.total_expected)) * 100)}%`
                                              : "Ongoing"}
                                          </span>
                                        </div>
                                        <div className="h-2 bg-zinc-200 rounded-full overflow-hidden">
                                          <motion.div
                                            initial={{ width: 0 }}
                                            animate={{
                                              width:
                                                Number(
                                                  recurring.total_expected,
                                                ) > 0
                                                  ? `${Math.min((Number(recurring.total_paid) / Number(recurring.total_expected)) * 100, 100)}%`
                                                  : "100%",
                                            }}
                                            transition={{
                                              duration: 0.8,
                                              ease: "easeOut",
                                            }}
                                            className={cn(
                                              "h-full rounded-full",
                                              recurring.status === "active"
                                                ? "bg-emerald-500"
                                                : recurring.status ===
                                                    "completed"
                                                  ? "bg-blue-500"
                                                  : "bg-zinc-400",
                                            )}
                                          />
                                        </div>
                                      </div>
                                    </motion.div>
                                  ),
                                )}
                              </motion.div>
                            )}
                          </TabsContent>

                          <TabsContent value="giving" className="mt-0">
                            <DataTableResponsive
                              columns={givingHistoryColumns}
                              data={givingHistoryRows}
                              config={{
                                enableRowSelection: false,
                                enableColumnVisibility: false,
                                enablePagination: true,
                                enableFilters: false,
                                enableSorting: true,
                              }}
                              emptyState={
                                <div className="flex flex-col items-center justify-center py-12 text-center">
                                  <p className="text-sm font-bold text-zinc-900">
                                    No giving history available
                                  </p>
                                  <p className="text-xs text-zinc-400 mt-1">
                                    Gift activity will appear here once
                                    donations are recorded.
                                  </p>
                                </div>
                              }
                            />
                          </TabsContent>
                        </AnimatePresence>
                      </div>
                    </ScrollArea>
                  </Tabs>
                </Card>
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                {...scaleIn}
                transition={smoothTransition}
              >
                <Card className="border-zinc-200 border-dashed bg-zinc-50/30 rounded-[2.5rem] h-full min-h-[600px] flex items-center justify-center">
                  <CardContent className="p-16 text-center">
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={springTransition}
                      className="h-20 w-20 rounded-3xl bg-white shadow-sm border border-zinc-100 flex items-center justify-center mx-auto mb-8"
                    >
                      <User className="h-10 w-10 text-zinc-200" />
                    </motion.div>
                    <motion.h3
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="font-black text-2xl text-zinc-900 tracking-tight"
                    >
                      Select a Partner
                    </motion.h3>
                    <motion.p
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.15 }}
                      className="mt-2 text-sm font-medium text-zinc-400 max-w-[280px] mx-auto"
                    >
                      Choose a donor from the list to view their profile,
                      recurring donations, and giving history.
                    </motion.p>
                    {profile?.id && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <AddPartnerDialog
                          missionaryId={profile.id}
                          onSuccess={handleRefreshDonors}
                          trigger={
                            <Button className="mt-10 h-11 px-8 rounded-2xl bg-zinc-900 text-[10px] font-black uppercase tracking-[0.2em] text-white hover:bg-zinc-800">
                              <Plus className="h-4 w-4 mr-2" /> Add Partner
                            </Button>
                          }
                        />
                      </motion.div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      <Dialog open={isNoteDialogOpen} onOpenChange={setIsNoteDialogOpen}>
        <DialogContent className="sm:max-w-[500px] rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold tracking-tight">
              {activityType === "note"
                ? "Add Note"
                : activityType === "call"
                  ? "Log Call"
                  : activityType === "meeting"
                    ? "Log Meeting"
                    : "Log Email"}
            </DialogTitle>
            <DialogDescription className="text-sm text-zinc-500">
              Add to {selectedDonor?.name}&apos;s timeline.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              value={noteInput}
              onChange={(e) => setNoteInput(e.target.value)}
              placeholder={
                activityType === "call"
                  ? "What did you discuss?"
                  : activityType === "meeting"
                    ? "Meeting notes..."
                    : "Type your note here..."
              }
              className="min-h-[150px] resize-none rounded-xl border-zinc-200"
            />
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setIsNoteDialogOpen(false)}
              className="h-10 px-6 rounded-xl border-zinc-200"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddNote}
              disabled={!noteInput.trim() || isSavingNote}
              className="h-10 px-6 rounded-xl"
            >
              {isSavingNote ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Save"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isTagDialogOpen} onOpenChange={setIsTagDialogOpen}>
        <DialogContent className="sm:max-w-[500px] rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold tracking-tight">
              Manage Tags
            </DialogTitle>
            <DialogDescription className="text-sm text-zinc-500">
              Select tags for {selectedDonor?.name}. Tags help you organize and
              filter your partners.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <motion.div
              variants={staggerContainer}
              initial="initial"
              animate="animate"
              className="flex flex-wrap gap-2"
            >
              {AVAILABLE_TAGS.map((tag, i) => (
                <motion.button
                  key={tag.id}
                  variants={fadeInUp}
                  transition={{ delay: i * 0.02 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => toggleTag(tag.id)}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-xs font-bold border transition-all",
                    selectedTags.includes(tag.id)
                      ? cn(tag.color, "ring-2 ring-offset-1 ring-zinc-400")
                      : "bg-zinc-50 text-zinc-400 border-zinc-200 hover:bg-zinc-100",
                  )}
                >
                  <AnimatePresence mode="wait">
                    {selectedTags.includes(tag.id) && (
                      <motion.span
                        initial={{ width: 0, opacity: 0 }}
                        animate={{ width: "auto", opacity: 1 }}
                        exit={{ width: 0, opacity: 0 }}
                        className="inline-flex overflow-hidden"
                      >
                        <Check className="h-3 w-3 mr-1" />
                      </motion.span>
                    )}
                  </AnimatePresence>
                  {tag.label}
                </motion.button>
              ))}
            </motion.div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setIsTagDialogOpen(false)}
              className="h-10 px-6 rounded-xl border-zinc-200"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveTags}
              disabled={isSavingTags}
              className="h-10 px-6 rounded-xl"
            >
              {isSavingTags ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Save Tags"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <EditDonorDialog
        donor={selectedDonor}
        onOpenChange={setIsEditDialogOpen}
        onSuccess={handleRefreshDonors}
        open={isEditDialogOpen}
      />
    </motion.div>
  );
}
