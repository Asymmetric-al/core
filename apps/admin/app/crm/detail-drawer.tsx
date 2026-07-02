"use client";

import {
  formatSharedContributionAmount,
  hasSharedContributionIssue,
  matchesSharedContributionFilter,
  SHARED_CRM_POST_STATUS_LABELS,
  SHARED_RECEIPT_STATUS_LABELS,
} from "@asym/api/admin/contribution-shared";
import {
  CRM_GIFT_HISTORY_TABLE_ID,
  previewCrmViewSettingsReset,
  resolveCrmGiftHistoryViewSettings,
} from "@asym/api/admin/crm/table-preferences";
import {
  useAdminCrmRecordDetail,
  useCreateCrmNamedView,
  useCreateLinkedCrmNote,
  useCrmNamedViews,
  useCrmTablePreferences,
  useDeleteCrmNamedView,
  useSaveCrmRowActionPin,
  useSaveCrmViewSettings,
  useUpdateCrmNamedView,
} from "@asym/database/hooks";
import { motion, AnimatePresence } from "@asym/lib/motion";
import { formatCurrency } from "@asym/lib/utils";
import {
  crmRecordAvatarTransitionName,
  crmRecordTitleTransitionName,
} from "@asym/lib/view-transitions";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@asym/ui/components/shadcn/alert";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@asym/ui/components/shadcn/avatar";
import { Badge } from "@asym/ui/components/shadcn/badge";
import { Button } from "@asym/ui/components/shadcn/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@asym/ui/components/shadcn/dialog";
import { Input } from "@asym/ui/components/shadcn/input";
import { Label } from "@asym/ui/components/shadcn/label";
import {
  RadioGroup,
  RadioGroupItem,
} from "@asym/ui/components/shadcn/radio-group";
import { ScrollArea } from "@asym/ui/components/shadcn/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from "@asym/ui/components/shadcn/sheet";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@asym/ui/components/shadcn/tabs";
import { Textarea } from "@asym/ui/components/shadcn/textarea";
import { SharedNamedViewTransition } from "@asym/ui/components/view-transitions";
import { cn } from "@asym/ui/lib/utils";
import { FileText, History, Paperclip, User, X } from "lucide-react";
import React, { useEffect, useId, useMemo, useState } from "react";
import { toast } from "sonner";

import {
  EMPTY_CELL_VALUE,
  makeDisplayDate,
  viewMutationErrorToast,
  type ViewSettingsPatch,
} from "./crm-detail-shared";
import { GiftHistoryViewSettingsMenu } from "./gift-history-view-settings-menu";
import { GiftHistoryViewSwitcher } from "./gift-history-view-switcher";
import { GiftInlineActionControls } from "./gift-inline-action-controls";
import { PORTAL_BADGE_CLASS } from "./types";
import {
  ContributionOperationShell,
  type OperationDefinition,
} from "../contributions/operation-shell";

import type { CrmRecord } from "./types";
import type { CrmNamedView, CrmViewSettingsScope } from "@asym/database/types";

export function DetailDrawer({
  contact,
  onClose,
  onOpenGift,
  onRowRefresh,
}: {
  contact: CrmRecord;
  onClose: () => void;
  onOpenGift: (donationId: string) => void;
  /**
   * Fires after an inline operation succeeds and shared row data refreshes,
   * so the host surface can show its quiet freshness indicator (ADR-CD-022).
   */
  onRowRefresh?: () => void;
}) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [noteBody, setNoteBody] = useState("");
  const noteFieldId = useId();
  const [summary, setSummary] = useState<{
    category: string;
    focus: string;
    nextMove: string;
  } | null>(null);
  const detailQuery = useAdminCrmRecordDetail(contact.id);
  const createNoteMutation = useCreateLinkedCrmNote(contact.id);
  const tablePreferencesQuery = useCrmTablePreferences(
    CRM_GIFT_HISTORY_TABLE_ID,
  );
  const savePinMutation = useSaveCrmRowActionPin(CRM_GIFT_HISTORY_TABLE_ID);
  const saveViewSettingsMutation = useSaveCrmViewSettings(
    CRM_GIFT_HISTORY_TABLE_ID,
  );
  const saveViewSettingsMutate = saveViewSettingsMutation.mutate;
  const [inlineOperation, setInlineOperation] = useState<{
    donationId: string;
    operation: OperationDefinition;
  } | null>(null);
  const [pendingReset, setPendingReset] = useState<CrmViewSettingsScope | null>(
    null,
  );

  const pinRowAction = (actionId: string | null) => {
    savePinMutation.mutate(actionId, {
      onError: (error) => {
        toast.error(
          error instanceof Error
            ? error.message
            : "Failed to save the pinned row action.",
        );
      },
    });
  };

  const saveViewSettings = (patch: ViewSettingsPatch) => {
    saveViewSettingsMutate(patch, {
      onError: (error) => {
        toast.error(
          error instanceof Error
            ? error.message
            : "Failed to save view settings.",
        );
      },
    });
  };

  const tablePreferences = tablePreferencesQuery.data;
  const viewSettings = useMemo(
    () =>
      resolveCrmGiftHistoryViewSettings({
        user: tablePreferences?.user?.settings ?? null,
        tenantDefault: tablePreferences?.tenantDefault?.settings ?? null,
      }).settings,
    [tablePreferences],
  );

  // Named personal views (#273).
  const namedViewsQuery = useCrmNamedViews(CRM_GIFT_HISTORY_TABLE_ID);
  const createViewMutation = useCreateCrmNamedView(CRM_GIFT_HISTORY_TABLE_ID);
  const updateViewMutation = useUpdateCrmNamedView(CRM_GIFT_HISTORY_TABLE_ID);
  const deleteViewMutation = useDeleteCrmNamedView(CRM_GIFT_HISTORY_TABLE_ID);
  const namedViews = useMemo(
    () => namedViewsQuery.data?.views ?? [],
    [namedViewsQuery.data],
  );
  const activeViewId = tablePreferences?.user?.settings?.activeViewId ?? null;
  const [viewNameDialog, setViewNameDialog] = useState<{
    mode: "create" | "rename" | "duplicate";
    view?: CrmNamedView;
  } | null>(null);
  const [viewNameInput, setViewNameInput] = useState("");
  const [deleteViewDialog, setDeleteViewDialog] = useState<CrmNamedView | null>(
    null,
  );
  const [nextDefaultChoice, setNextDefaultChoice] = useState("");

  const viewSettingsPatchFromNamedView = (
    view: CrmNamedView,
  ): ViewSettingsPatch => ({
    columns: view.settings?.columns ?? null,
    filtersSort: view.settings?.filtersSort ?? null,
    pinnedActionId: view.pinnedActionId,
    activeViewId: view.id,
  });

  /** Applying a view copies its snapshot into the working preference. */
  const applyNamedView = (view: CrmNamedView) => {
    saveViewSettingsMutate(viewSettingsPatchFromNamedView(view), {
      onError: viewMutationErrorToast,
    });
  };

  // The default named view loads automatically when the user has no working
  // preference record yet (#273). The guard flips only after a successful save
  // so a transient failure can retry after the preference queries refetch.
  const appliedDefaultViewRef = React.useRef(false);
  const defaultNamedView = useMemo(() => {
    if (!tablePreferencesQuery.data || tablePreferencesQuery.data.user) {
      return null;
    }
    return namedViews.find((view) => view.isDefault) ?? null;
  }, [namedViews, tablePreferencesQuery.data]);
  useEffect(() => {
    if (appliedDefaultViewRef.current || !defaultNamedView) {
      return;
    }
    appliedDefaultViewRef.current = true;
    saveViewSettingsMutate(viewSettingsPatchFromNamedView(defaultNamedView), {
      onError: (error) => {
        appliedDefaultViewRef.current = false;
        viewMutationErrorToast(error);
      },
    });
  }, [defaultNamedView, saveViewSettingsMutate]);

  const submitViewNameDialog = () => {
    if (!viewNameDialog) {
      return;
    }
    const name = viewNameInput.trim();
    if (!name) {
      return;
    }

    if (viewNameDialog.mode === "rename" && viewNameDialog.view) {
      updateViewMutation.mutate(
        { viewId: viewNameDialog.view.id, name },
        { onError: viewMutationErrorToast },
      );
    } else if (viewNameDialog.mode === "duplicate" && viewNameDialog.view) {
      createViewMutation.mutate(
        {
          name,
          pinnedActionId: viewNameDialog.view.pinnedActionId,
          columns: viewNameDialog.view.settings?.columns ?? undefined,
          filtersSort: viewNameDialog.view.settings?.filtersSort ?? undefined,
        },
        { onError: viewMutationErrorToast },
      );
    } else {
      // Save the current working settings and pin as a new view.
      createViewMutation.mutate(
        {
          name,
          pinnedActionId: tablePreferences?.user?.actionId ?? null,
          columns: tablePreferences?.user?.settings?.columns ?? undefined,
          filtersSort:
            tablePreferences?.user?.settings?.filtersSort ?? undefined,
        },
        {
          onError: viewMutationErrorToast,
          onSuccess: ({ view }) => {
            saveViewSettings({ activeViewId: view.id });
          },
        },
      );
    }
    setViewNameDialog(null);
    setViewNameInput("");
  };

  const confirmDeleteView = () => {
    if (!deleteViewDialog) {
      return;
    }
    const deletingActive = deleteViewDialog.id === activeViewId;
    deleteViewMutation.mutate(
      {
        viewId: deleteViewDialog.id,
        nextDefaultViewId:
          deleteViewDialog.isDefault && nextDefaultChoice
            ? nextDefaultChoice
            : undefined,
      },
      {
        onError: viewMutationErrorToast,
        onSuccess: () => {
          if (deletingActive) {
            saveViewSettings({ activeViewId: null });
          }
        },
      },
    );
    setDeleteViewDialog(null);
    setNextDefaultChoice("");
  };

  const resetPreview = pendingReset
    ? previewCrmViewSettingsReset({
        scope: pendingReset,
        user: {
          settings: tablePreferences?.user?.settings ?? null,
          pinnedActionId: tablePreferences?.user?.actionId ?? null,
        },
        tenantDefault: {
          settings: tablePreferences?.tenantDefault?.settings ?? null,
          pinnedActionId: tablePreferences?.tenantDefault?.actionId ?? null,
        },
      })
    : null;

  const confirmPendingReset = () => {
    if (!pendingReset) {
      return;
    }
    const patch: ViewSettingsPatch =
      pendingReset === "columns"
        ? { columns: null }
        : pendingReset === "filtersSort"
          ? { filtersSort: null }
          : pendingReset === "pinnedAction"
            ? { pinnedActionId: null }
            : { columns: null, filtersSort: null, pinnedActionId: null };
    saveViewSettings(patch);
    setPendingReset(null);
  };

  const summarizeContact = async () => {
    setIsAnalyzing(true);
    let detail = detailQuery.data;
    if (!detailQuery.data && !detailQuery.isFetching) {
      const refetched = await detailQuery.refetch();
      detail = refetched.data;
    }
    const primaryFund = detail?.support.byFund[0]?.fundName;
    const duplicateCount = detail?.duplicateWarnings.length ?? 0;
    setSummary({
      category: contact.recordType ?? "Constituent",
      focus:
        detail?.donor.notesPreview ??
        contact.notesPreview ??
        (primaryFund ? `Primary designation: ${primaryFund}.` : null) ??
        "No notes on file yet.",
      nextMove:
        duplicateCount > 0
          ? "Review duplicate warnings before outreach."
          : "Review gift history and schedule the next touchpoint.",
    });
    setIsAnalyzing(false);
  };

  const display = contact.displayName || "Unnamed record";
  const detail = detailQuery.data;

  // Effective view settings drive the gift list (#272): filters and sort
  // apply before display; columns control which row fields render. Filters
  // evaluate through the shared CRM/Hub definitions so the same gift matches
  // identically on both surfaces (#274).
  const giftRows = useMemo(() => {
    const gifts = detail?.giftHistory ?? [];
    const { filtersSort } = viewSettings;
    const filtered = gifts.filter((gift) => {
      const shared = gift.shared;
      if (
        filtersSort.paymentStatus !== "all" &&
        !matchesSharedContributionFilter(
          { shared },
          { id: "payment_status", value: filtersSort.paymentStatus },
        )
      ) {
        return false;
      }
      switch (filtersSort.issue) {
        case "needs_attention":
          return hasSharedContributionIssue({ shared });
        case "receipt_affected":
          return matchesSharedContributionFilter(
            { shared },
            { id: "receipt_affected" },
          );
        case "pending_correction":
          return matchesSharedContributionFilter(
            { shared },
            { id: "pending_correction" },
          );
        default:
          return true;
      }
    });
    return [...filtered].sort((left, right) => {
      const leftValue =
        filtersSort.sortField === "amountCents"
          ? left.amountCents
          : new Date(left.giftDate ?? 0).getTime();
      const rightValue =
        filtersSort.sortField === "amountCents"
          ? right.amountCents
          : new Date(right.giftDate ?? 0).getTime();
      return filtersSort.sortDirection === "asc"
        ? leftValue - rightValue
        : rightValue - leftValue;
    });
  }, [detail?.giftHistory, viewSettings]);

  const timeline =
    detail?.timeline ??
    contact.activities.map((activity) => ({
      amountCents: activity.amount ?? null,
      currencyCode: null,
      description: activity.description ?? null,
      id: activity.id,
      kind: activity.type,
      occurredAt: activity.date,
      source: "platform" as const,
      title: activity.title,
      visibility: "standard" as const,
    }));

  const saveNote = async () => {
    const trimmed = noteBody.trim();
    if (!trimmed) {
      return;
    }

    try {
      await createNoteMutation.mutateAsync({
        body: trimmed,
        linkedRecordId: contact.id,
        linkedRecordType: "donor_profile",
        title: `Donor care note: ${display}`,
        visibility: "standard",
      });
      setNoteBody("");
      toast.success("CRM note queued.");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to save note.",
      );
    }
  };

  return (
    <>
      <Sheet open={!!contact} onOpenChange={(open) => !open && onClose()}>
        <SheetContent className="w-full sm:max-w-2xl p-0 gap-0 border-l border-border bg-background shadow-2xl overflow-hidden flex flex-col h-full text-left">
          <SheetTitle className="sr-only">
            {display}, CRM record details
          </SheetTitle>
          <SheetDescription className="sr-only">
            Constituent summary, activity, and properties for this CRM record.
          </SheetDescription>
          <div className="h-14 bg-card border-b border-border flex items-center justify-between px-4 shrink-0 z-10">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <User className="size-4 text-muted-foreground" />
              <span className="truncate max-w-[200px] sm:max-w-md">
                {display}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-9 gap-2 rounded-xl border border-border bg-card text-xs font-semibold text-muted-foreground hover:bg-muted hover:text-foreground"
                onClick={summarizeContact}
                disabled={isAnalyzing}
              >
                <FileText
                  className={cn("size-3.5", isAnalyzing && "animate-pulse")}
                />
                {isAnalyzing ? "Summarizing..." : "Quick Summary"}
              </Button>
              <div className="h-4 w-px bg-border mx-2" />
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                aria-label="Close CRM record details"
                className="size-8 text-muted-foreground"
              >
                <X className="size-4" aria-hidden="true" />
              </Button>
            </div>
          </div>

          <ScrollArea className="flex-1">
            <div className="p-6 space-y-8">
              <div className="flex gap-6 items-start">
                <SharedNamedViewTransition
                  name={crmRecordAvatarTransitionName(contact.id)}
                >
                  <Avatar className="size-20 border-4 border-background shadow-sm">
                    <AvatarImage src={contact.avatarUrl ?? undefined} />
                    <AvatarFallback className="bg-muted text-muted-foreground font-semibold text-xl">
                      {display[0] ?? "?"}
                    </AvatarFallback>
                  </Avatar>
                </SharedNamedViewTransition>
                <div className="space-y-1 pt-1 min-w-0">
                  <SharedNamedViewTransition
                    name={crmRecordTitleTransitionName(contact.id)}
                  >
                    <h2 className="text-2xl font-semibold text-foreground tracking-tight">
                      {display}
                    </h2>
                  </SharedNamedViewTransition>
                  <p className="text-sm text-muted-foreground font-medium">
                    {contact.title ? (
                      <>
                        {contact.title}
                        {contact.primaryOrganization ? (
                          <>
                            {" "}
                            at{" "}
                            <span className="text-foreground">
                              {contact.primaryOrganization}
                            </span>
                          </>
                        ) : null}
                      </>
                    ) : contact.primaryOrganization ? (
                      <span className="text-foreground">
                        {contact.primaryOrganization}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">
                        No title set
                      </span>
                    )}
                  </p>
                  <div className="flex flex-wrap gap-2 pt-2">
                    <Badge
                      variant="outline"
                      className="text-[10px] font-semibold uppercase"
                    >
                      {contact.lifecycleStatus ?? "Unknown status"}
                    </Badge>
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-[10px] font-semibold uppercase border shadow-none",
                        PORTAL_BADGE_CLASS[contact.portalAccessLabel],
                      )}
                    >
                      {contact.portalAccessLabel === "linked"
                        ? "Portal linked"
                        : "No portal"}
                    </Badge>
                    <Badge
                      variant="secondary"
                      className="h-5 text-[10px] font-semibold uppercase tracking-wider border-none bg-muted text-muted-foreground"
                    >
                      {formatCurrency(contact.lifetimeGiving)}
                    </Badge>
                  </div>
                </div>
              </div>

              <AnimatePresence>
                {summary && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    role="status"
                    aria-live="polite"
                    className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-4"
                  >
                    <div className="flex items-center gap-2 text-foreground font-semibold text-[10px] uppercase tracking-[0.2em]">
                      <FileText className="size-3.5 text-muted-foreground" />{" "}
                      Highlights
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <span className="text-[9px] font-semibold text-muted-foreground uppercase tracking-widest">
                          Type
                        </span>
                        <p className="text-sm font-semibold text-foreground">
                          {summary.category}
                        </p>
                      </div>
                      <div>
                        <span className="text-[9px] font-semibold text-muted-foreground uppercase tracking-widest">
                          Notes
                        </span>
                        <p className="text-xs text-muted-foreground leading-relaxed font-medium">
                          {summary.focus}
                        </p>
                      </div>
                      <div>
                        <span className="text-[9px] font-semibold text-muted-foreground uppercase tracking-widest">
                          Next step
                        </span>
                        <p className="text-xs text-foreground font-semibold">
                          {summary.nextMove}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <Tabs defaultValue="activity">
                <TabsList className="bg-transparent h-9 p-0 gap-6 border-b border-border w-full rounded-none justify-start">
                  <TabsTrigger
                    value="activity"
                    className="bg-transparent border-b-2 border-transparent data-active:border-foreground data-active:text-foreground rounded-none px-0 py-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground shadow-none"
                  >
                    Activity
                  </TabsTrigger>
                  <TabsTrigger
                    value="properties"
                    className="bg-transparent border-b-2 border-transparent data-active:border-foreground data-active:text-foreground rounded-none px-0 py-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground shadow-none"
                  >
                    Properties
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="activity" className="pt-6 space-y-6">
                  <div className="bg-card p-4 rounded-xl border border-border shadow-sm space-y-3">
                    <Label htmlFor={noteFieldId} className="sr-only">
                      Note body
                    </Label>
                    <Textarea
                      id={noteFieldId}
                      placeholder="Log a note, call, or meeting..."
                      value={noteBody}
                      onChange={(event) => setNoteBody(event.target.value)}
                      className="h-20 resize-none text-sm"
                    />
                    <div className="flex justify-between items-center pt-2 border-t border-muted">
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label="Attach file to note"
                          disabled
                          className="size-7 text-muted-foreground hover:text-foreground"
                        >
                          <Paperclip className="size-3.5" aria-hidden="true" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label="View note history"
                          disabled
                          className="size-7 text-muted-foreground hover:text-foreground"
                        >
                          <History className="size-3.5" aria-hidden="true" />
                        </Button>
                      </div>
                      <Button
                        size="sm"
                        className="h-7 px-4 text-[10px] font-semibold uppercase tracking-wider"
                        disabled={
                          createNoteMutation.isPending || !noteBody.trim()
                        }
                        onClick={() => void saveNote()}
                      >
                        {createNoteMutation.isPending
                          ? "Saving..."
                          : "Save Note"}
                      </Button>
                    </div>
                  </div>

                  {detail?.duplicateWarnings.length ? (
                    <Alert>
                      <AlertTitle className="text-[10px] font-semibold uppercase tracking-[0.18em]">
                        Duplicate warning
                      </AlertTitle>
                      <AlertDescription className="mt-2 space-y-2 text-xs">
                        {detail.duplicateWarnings.map((warning) => (
                          <p key={warning.id} className="leading-relaxed">
                            {warning.reason}
                            {warning.score != null ? ` (${warning.score})` : ""}
                          </p>
                        ))}
                      </AlertDescription>
                    </Alert>
                  ) : null}

                  {detail?.giftHistory.length ? (
                    <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                          Gift history
                        </p>
                        <div className="flex items-center gap-1">
                          <Badge variant="secondary" className="text-[10px]">
                            {giftRows.length}
                          </Badge>
                          {detail.giftHistoryTruncated ? (
                            <Badge variant="outline" className="text-[10px]">
                              First 100 shown
                            </Badge>
                          ) : null}
                          <GiftHistoryViewSwitcher
                            views={namedViews}
                            activeViewId={activeViewId}
                            onApplyView={applyNamedView}
                            onSaveCurrentAs={() => {
                              setViewNameInput("");
                              setViewNameDialog({ mode: "create" });
                            }}
                            onRename={(view) => {
                              setViewNameInput(view.name);
                              setViewNameDialog({ mode: "rename", view });
                            }}
                            onDuplicate={(view) => {
                              setViewNameInput(`${view.name} copy`);
                              setViewNameDialog({ mode: "duplicate", view });
                            }}
                            onSetDefault={(view) =>
                              updateViewMutation.mutate(
                                { viewId: view.id, isDefault: true },
                                { onError: viewMutationErrorToast },
                              )
                            }
                            onResetToSaved={applyNamedView}
                            onDelete={(view) => {
                              setNextDefaultChoice("");
                              setDeleteViewDialog(view);
                            }}
                          />
                          <GiftHistoryViewSettingsMenu
                            settings={viewSettings}
                            onPatch={saveViewSettings}
                            onRequestReset={setPendingReset}
                          />
                        </div>
                      </div>
                      {detail.giftHistoryTruncated ? (
                        <p className="mt-3 text-xs text-muted-foreground">
                          Gift history is capped at the 100 most recent gifts.
                        </p>
                      ) : null}
                      <div
                        className="mt-3 divide-y divide-border"
                        aria-live="polite"
                      >
                        {giftRows.length === 0 ? (
                          <p className="py-3 text-xs text-muted-foreground">
                            No gifts match the current view filters.
                          </p>
                        ) : null}
                        {giftRows.slice(0, 6).map((gift) => {
                          const shared = gift.shared;
                          const formattedAmount =
                            formatSharedContributionAmount(
                              shared.amountCents,
                              shared.currencyCode,
                            );

                          return (
                            <div
                              key={gift.id}
                              className="flex items-center justify-between gap-4 py-3"
                            >
                              <button
                                type="button"
                                onClick={() => onOpenGift(gift.donationId)}
                                className="min-w-0 rounded-lg text-left transition-colors hover:bg-muted/50 focus-visible:outline-2 focus-visible:outline-ring"
                                aria-label={`Open gift detail for ${formattedAmount} to ${shared.designationSummary.fundName}`}
                              >
                                <p className="text-sm font-semibold text-foreground">
                                  {formattedAmount}
                                </p>
                                {viewSettings.columns.designation ? (
                                  <p className="truncate text-xs text-muted-foreground">
                                    {shared.designationSummary.fundName}
                                  </p>
                                ) : null}
                                {viewSettings.columns.statusLine ? (
                                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                                    {
                                      SHARED_RECEIPT_STATUS_LABELS[
                                        shared.receiptStatus
                                      ]
                                    }{" "}
                                    /{" "}
                                    {shared.crmPostStatus
                                      ? SHARED_CRM_POST_STATUS_LABELS[
                                          shared.crmPostStatus
                                        ]
                                      : "Not required"}
                                  </p>
                                ) : null}
                              </button>
                              <GiftInlineActionControls
                                inlineActions={gift.inlineActions}
                                preferences={tablePreferencesQuery.data}
                                onPinChange={pinRowAction}
                                onRunOperation={(operation) =>
                                  setInlineOperation({
                                    donationId: gift.donationId,
                                    operation,
                                  })
                                }
                              />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : detailQuery.isLoading ? (
                    <div className="rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">
                      Loading donor workflow history…
                    </div>
                  ) : null}

                  <div className="space-y-6 pl-4 border-l border-border ml-2">
                    {timeline.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        No timeline entries yet. Activity from donations and
                        tasks will appear here as the CRM read model expands.
                      </p>
                    ) : (
                      timeline.map((act) => (
                        <div key={act.id} className="relative group">
                          <div className="absolute -left-[21px] top-0 size-4 rounded-full border-2 border-background bg-muted z-10 transition-colors group-hover:bg-foreground" />
                          <div className="pb-4 space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-semibold text-foreground">
                                {act.title}
                              </span>
                              <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-widest">
                                {makeDisplayDate(
                                  act.occurredAt,
                                ).toLocaleDateString()}
                              </span>
                            </div>
                            {act.description && (
                              <p className="text-xs text-muted-foreground leading-relaxed bg-card p-3 rounded-lg border border-border shadow-sm">
                                {act.description}
                              </p>
                            )}
                            {act.amountCents && (
                              <p className="text-xs font-semibold text-foreground">
                                +{formatCurrency(act.amountCents)}
                              </p>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </TabsContent>

                <TabsContent
                  value="properties"
                  className="pt-6 grid grid-cols-2 gap-8 text-left"
                >
                  <div className="space-y-6">
                    <div className="space-y-1">
                      <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-widest">
                        Email
                      </p>
                      <p className="text-sm font-semibold text-foreground truncate hover:text-primary cursor-pointer">
                        {contact.email ?? EMPTY_CELL_VALUE}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-widest">
                        Phone
                      </p>
                      <p className="text-sm font-semibold text-foreground">
                        {contact.phone ?? EMPTY_CELL_VALUE}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-widest">
                        Location
                      </p>
                      <p className="text-sm font-semibold text-foreground">
                        {contact.location ?? EMPTY_CELL_VALUE}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div className="space-y-1">
                      <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-widest">
                        Assigned missionary
                      </p>
                      <p className="text-sm font-semibold text-foreground">
                        {detail?.support.byMissionary[0]?.missionaryName ??
                          contact.assignedMissionaryName ??
                          EMPTY_CELL_VALUE}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-widest">
                        Support status
                      </p>
                      <div className="space-y-1 text-sm font-semibold text-foreground">
                        <p>
                          {detail
                            ? formatCurrency(detail.support.lifetimeGivingCents)
                            : formatCurrency(contact.lifetimeGiving)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {detail
                            ? `${detail.support.activeRecurringCommitments} recurring / ${detail.support.atRiskCommitments} at risk`
                            : "Recurring support not loaded"}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-widest">
                        Privacy
                      </p>
                      <p className="text-xs font-medium text-muted-foreground">
                        {detail?.privacy.missionaryContactDataExposed === false
                          ? "Missionary users do not receive restricted donor contact data."
                          : "Staff-only donor data."}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-widest">
                        Tags
                      </p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {(contact.tags ?? []).length === 0 ? (
                          <span className="text-sm text-muted-foreground">
                            {EMPTY_CELL_VALUE}
                          </span>
                        ) : (
                          contact.tags.map((t) => (
                            <Badge
                              key={t}
                              variant="secondary"
                              className="text-[9px] px-1.5 h-4 bg-muted text-muted-foreground border-none shadow-none"
                            >
                              {t}
                            </Badge>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>
      <ContributionOperationShell
        open={inlineOperation !== null}
        onClose={() => setInlineOperation(null)}
        operation={inlineOperation?.operation ?? null}
        donationId={inlineOperation?.donationId ?? null}
        sourceSurface="donor_crm_record"
        onOpenFullDetail={(donationId) => {
          setInlineOperation(null);
          onOpenGift(donationId);
        }}
        onRowRefresh={() => {
          void detailQuery.refetch();
          onRowRefresh?.();
        }}
      />
      {pendingReset && resetPreview ? (
        <Dialog open onOpenChange={(open) => !open && setPendingReset(null)}>
          <DialogContent
            className="sm:max-w-md"
            data-testid="view-settings-reset-preview"
          >
            <DialogTitle>Reset view settings</DialogTitle>
            <DialogDescription>{resetPreview.description}</DialogDescription>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                className="h-11"
                onClick={() => setPendingReset(null)}
              >
                Cancel
              </Button>
              <Button className="h-11" onClick={confirmPendingReset}>
                Reset
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      ) : null}
      {viewNameDialog ? (
        <Dialog open onOpenChange={(open) => !open && setViewNameDialog(null)}>
          <DialogContent
            className="sm:max-w-md"
            data-testid="named-view-name-dialog"
          >
            <DialogTitle>
              {viewNameDialog.mode === "rename"
                ? "Rename view"
                : viewNameDialog.mode === "duplicate"
                  ? "Duplicate view"
                  : "Save current as view"}
            </DialogTitle>
            <DialogDescription>
              Named views are personal — they save your columns, filters, sort,
              and pinned row action.
            </DialogDescription>
            <div className="space-y-1.5">
              <Label htmlFor="named-view-name">View name</Label>
              <Input
                id="named-view-name"
                value={viewNameInput}
                onChange={(event) => setViewNameInput(event.target.value)}
                className="h-11"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                className="h-11"
                onClick={() => setViewNameDialog(null)}
              >
                Cancel
              </Button>
              <Button
                className="h-11"
                disabled={!viewNameInput.trim()}
                onClick={submitViewNameDialog}
              >
                Save view
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      ) : null}
      {deleteViewDialog ? (
        <Dialog
          open
          onOpenChange={(open) => !open && setDeleteViewDialog(null)}
        >
          <DialogContent
            className="sm:max-w-md"
            data-testid="named-view-delete-dialog"
          >
            <DialogTitle>Delete “{deleteViewDialog.name}”</DialogTitle>
            <DialogDescription>
              {deleteViewDialog.isDefault
                ? "This is your default view. Choose another default or fall back to the tenant/system default."
                : "This personal view will be removed. Your current working settings stay as they are."}
            </DialogDescription>
            {deleteViewDialog.isDefault ? (
              <RadioGroup
                className="space-y-2"
                value={nextDefaultChoice}
                onValueChange={setNextDefaultChoice}
              >
                {namedViews
                  .filter((view) => view.id !== deleteViewDialog.id)
                  .map((view) => (
                    <div
                      key={view.id}
                      className="flex items-center gap-2 text-sm"
                    >
                      <RadioGroupItem
                        value={view.id}
                        id={`next-default-view-${view.id}`}
                      />
                      <Label htmlFor={`next-default-view-${view.id}`}>
                        Make “{view.name}” the default
                      </Label>
                    </div>
                  ))}
                <div className="flex items-center gap-2 text-sm">
                  <RadioGroupItem value="" id="next-default-view-none" />
                  <Label htmlFor="next-default-view-none">
                    No default (use tenant/system default)
                  </Label>
                </div>
              </RadioGroup>
            ) : null}
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                className="h-11"
                onClick={() => setDeleteViewDialog(null)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                className="h-11"
                onClick={confirmDeleteView}
              >
                Delete view
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      ) : null}
    </>
  );
}
