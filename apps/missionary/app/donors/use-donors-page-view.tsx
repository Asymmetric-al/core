"use client";

import { useMissionaryDonorRows } from "@asym/database/hooks";
import { invalidateSupabaseTableQuery } from "@asym/database/query-keys";
import { useAuth } from "@asym/lib/hooks";
import { useQueryClient } from "@tanstack/react-query";
import * as React from "react";
import { toast } from "sonner";

import {
  insertDonorActivity,
  type DonorActivityType,
  updateDonorTags,
} from "./donor-mutation-client";
import { filterAndSortDonors, type SortOption } from "./donors-list-model";
import {
  applyDonorsStatFilter,
  createDefaultDonorsFilters,
  createDonorsPageSummary,
  createTagEditorDraft,
  formatDonorAddress,
  hasDonorsActiveFilters,
  removeTagSelection,
  toPartnerSafeDonor,
  toggleTagSelection,
  type DonorsPageSummary,
  type DonorsStatFilterType,
} from "./donors-page-model";

import type { Address, Donor } from "./donor-types";
import type { Profile } from "@asym/database/types";

type DonorsPageViewModel = {
  profile: Profile | null;
  status: {
    isLoading: boolean;
    error: string | null;
  };
  summary: DonorsPageSummary;
  tabs: {
    activeTab: string;
    setActiveTab: (value: string) => void;
  };
  donors: {
    all: Donor[];
    filtered: Donor[];
    selected: Donor | null;
    selectById: (id: string) => void;
    clearSelection: () => void;
    hasMore: boolean;
    isLoadingMore: boolean;
    loadMore: () => Promise<void>;
  };
  filters: {
    searchTerm: string;
    statusFilter: string;
    tagFilter: string[];
    pledgeFilter: string;
    hasActiveFilters: boolean;
    setSearchTerm: (value: string) => void;
    setStatusFilter: (value: string) => void;
    setPledgeFilter: (value: string) => void;
    toggleTag: (tagId: string) => void;
    removeTag: (tagId: string) => void;
    clearAll: () => void;
  };
  sorting: {
    sortBy: SortOption;
    sortAsc: boolean;
    setSortBy: (value: SortOption) => void;
    toggleSortAsc: () => void;
  };
  noteComposer: {
    isOpen: boolean;
    isSaving: boolean;
    noteInput: string;
    activityType: DonorActivityType;
    setNoteInput: (value: string) => void;
    setActivityType: (value: DonorActivityType) => void;
    open: (activityType?: DonorActivityType) => void;
    close: () => void;
    save: () => Promise<void>;
  };
  tagEditor: {
    isOpen: boolean;
    isSaving: boolean;
    selectedTags: string[];
    open: () => void;
    close: () => void;
    toggleTag: (tagId: string) => void;
    save: () => Promise<void>;
  };
  editDialog: {
    isOpen: boolean;
    open: () => void;
    close: () => void;
  };
  actions: {
    refreshDonors: () => void;
    copyToClipboard: (text: string, label: string) => void;
    applyStatFilter: (filterType: DonorsStatFilterType) => void;
    formatAddress: (address: Address) => string[];
  };
};

function useDonorsPageView(): DonorsPageViewModel {
  const { profile, loading: authLoading } = useAuth();
  const queryClient = useQueryClient();
  // Gift Anonymity: missionary partner rows are server-redacted. Keep the
  // missionary donor query; do not switch this surface to a client-side live
  // collection of unredacted donor rows.
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
    () =>
      (donorsQuery.data ?? []).map((row) => toPartnerSafeDonor(row as Donor)),
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

  const loadMoreDonors = React.useCallback(async () => {
    try {
      await donorsQuery.loadMore();
    } catch {
      toast.error("Could not load more partners. Please try again.");
    }
  }, [donorsQuery]);

  const filteredDonors = React.useMemo(
    () =>
      filterAndSortDonors(donors, {
        searchTerm,
        statusFilter,
        tagFilter,
        pledgeFilter,
        sortBy,
        sortAsc,
      }),
    [
      donors,
      searchTerm,
      statusFilter,
      tagFilter,
      pledgeFilter,
      sortBy,
      sortAsc,
    ],
  );

  const selectedDonor = React.useMemo(
    () => donors.find((d) => d.id === selectedDonorId) || null,
    [donors, selectedDonorId],
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

  const selectDonorById = React.useCallback((id: string) => {
    setSelectedDonorId(id);
  }, []);

  const clearSelectedDonor = React.useCallback(() => {
    setSelectedDonorId(null);
  }, []);

  const toggleFilterTag = React.useCallback((tagId: string) => {
    setTagFilter((prev) => toggleTagSelection(prev, tagId));
  }, []);

  const removeFilterTag = React.useCallback((tagId: string) => {
    setTagFilter((prev) => removeTagSelection(prev, tagId));
  }, []);

  const toggleSortAsc = React.useCallback(() => {
    setSortAsc((current) => !current);
  }, []);

  const openNoteComposer = React.useCallback(
    (nextActivityType?: DonorActivityType) => {
      if (nextActivityType) {
        setActivityType(nextActivityType);
      }

      setIsNoteDialogOpen(true);
    },
    [],
  );

  const closeNoteComposer = React.useCallback(() => {
    setIsNoteDialogOpen(false);
  }, []);

  const openTagEditor = React.useCallback(() => {
    setSelectedTags(createTagEditorDraft(selectedDonor?.tags));
    setIsTagDialogOpen(true);
  }, [selectedDonor]);

  const closeTagEditor = React.useCallback(() => {
    setSelectedTags(createTagEditorDraft(selectedDonor?.tags));
    setIsTagDialogOpen(false);
  }, [selectedDonor]);

  const handleAddNote = React.useCallback(async () => {
    if (!selectedDonor || !noteInput.trim()) return;

    setIsSavingNote(true);
    try {
      const outcome = await insertDonorActivity({
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
    } finally {
      setIsSavingNote(false);
    }
  }, [selectedDonor, noteInput, activityType, handleRefreshDonors]);

  const handleSaveTags = React.useCallback(async () => {
    if (!selectedDonor) return;

    setIsSavingTags(true);
    try {
      const outcome = await updateDonorTags({
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
    } finally {
      setIsSavingTags(false);
    }
  }, [selectedDonor, selectedTags, handleRefreshDonors]);

  const toggleTag = React.useCallback((tagId: string) => {
    setSelectedTags((prev) => toggleTagSelection(prev, tagId));
  }, []);

  const openEditDialog = React.useCallback(() => {
    if (!selectedDonor) return;
    setIsEditDialogOpen(true);
  }, [selectedDonor]);

  const closeEditDialog = React.useCallback(() => {
    setIsEditDialogOpen(false);
  }, []);

  const applyStatFilter = React.useCallback(
    (filterType: DonorsStatFilterType) => {
      const nextFilterState = applyDonorsStatFilter(filterType);

      setSearchTerm(nextFilterState.searchTerm);
      setStatusFilter(nextFilterState.statusFilter);
      setTagFilter(nextFilterState.tagFilter);
      setPledgeFilter(nextFilterState.pledgeFilter);
      setSelectedDonorId(nextFilterState.selectedDonorId);
    },
    [],
  );

  const clearAllFilters = React.useCallback(() => {
    const defaultFilters = createDefaultDonorsFilters();

    setStatusFilter(defaultFilters.statusFilter);
    setTagFilter(defaultFilters.tagFilter);
    setPledgeFilter(defaultFilters.pledgeFilter);
    setSearchTerm(defaultFilters.searchTerm);
  }, []);

  const isLoading = authLoading || donorsQuery.isLoading;

  const summary = React.useMemo(
    () => createDonorsPageSummary(donors),
    [donors],
  );

  const hasActiveFilters = hasDonorsActiveFilters({
    searchTerm,
    statusFilter,
    tagFilter,
    pledgeFilter,
  });

  return {
    profile,
    status: {
      isLoading,
      error,
    },
    summary,
    tabs: {
      activeTab,
      setActiveTab,
    },
    donors: {
      all: donors,
      filtered: filteredDonors,
      selected: selectedDonor,
      selectById: selectDonorById,
      clearSelection: clearSelectedDonor,
      hasMore: donorsQuery.hasMore,
      isLoadingMore: donorsQuery.isLoadingMore,
      loadMore: loadMoreDonors,
    },
    filters: {
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
    },
    sorting: {
      sortBy,
      sortAsc,
      setSortBy,
      toggleSortAsc,
    },
    noteComposer: {
      isOpen: isNoteDialogOpen,
      isSaving: isSavingNote,
      noteInput,
      activityType,
      setNoteInput,
      setActivityType,
      open: openNoteComposer,
      close: closeNoteComposer,
      save: handleAddNote,
    },
    tagEditor: {
      isOpen: isTagDialogOpen,
      isSaving: isSavingTags,
      selectedTags,
      open: openTagEditor,
      close: closeTagEditor,
      toggleTag,
      save: handleSaveTags,
    },
    editDialog: {
      isOpen: isEditDialogOpen,
      open: openEditDialog,
      close: closeEditDialog,
    },
    actions: {
      refreshDonors: handleRefreshDonors,
      copyToClipboard,
      applyStatFilter,
      formatAddress: formatDonorAddress,
    },
  };
}

const DonorsPageViewContext = React.createContext<DonorsPageViewModel | null>(
  null,
);

export function DonorsPageViewProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const view = useDonorsPageView();
  return (
    <DonorsPageViewContext.Provider value={view}>
      {children}
    </DonorsPageViewContext.Provider>
  );
}

export function useDonorsPageViewFields() {
  const view = React.use(DonorsPageViewContext);
  if (!view) {
    throw new Error(
      "useDonorsPageViewFields must be used within DonorsPageViewProvider",
    );
  }
  return view;
}
