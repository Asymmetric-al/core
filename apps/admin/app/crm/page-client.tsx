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
  useAdminCrmRecordsInfiniteGrid,
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
import { PageShell } from "@asym/ui/components/primitives/page-shell";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@asym/ui/components/shadcn/avatar";
import { Badge } from "@asym/ui/components/shadcn/badge";
import { Button } from "@asym/ui/components/shadcn/button";
import {
  DataTableResponsive,
  type DataTableFilterField,
} from "@asym/ui/components/shadcn/data-table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@asym/ui/components/shadcn/dialog";
import { Input } from "@asym/ui/components/shadcn/input";
import { Label } from "@asym/ui/components/shadcn/label";
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
import { SharedNamedViewTransition } from "@asym/ui/components/view-transitions";
import { cn } from "@asym/ui/lib/utils";
import {
  Plus,
  List,
  Columns,
  X,
  User,
  Paperclip,
  History,
  FileText,
  Network,
  Receipt,
  Trash2,
  StickyNote,
  GitCompareArrows,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { getCrmColumns } from "./columns";
import {
  EMPTY_CELL_VALUE,
  makeDisplayDate,
  viewMutationErrorToast,
  type ViewSettingsPatch,
} from "./crm-detail-shared";
import { GiftHistoryViewSettingsMenu } from "./gift-history-view-settings-menu";
import { GiftHistoryViewSwitcher } from "./gift-history-view-switcher";
import { GiftInlineActionControls } from "./gift-inline-action-controls";
import { KanbanView } from "./kanban-view";
import { PORTAL_BADGE_CLASS, toCrmRecord } from "./types";
import { ContributionDetailOverlay } from "../contributions/contribution-detail-overlay";
import {
  ContributionOperationShell,
  type OperationDefinition,
} from "../contributions/operation-shell";

import type { CrmGridRow, CrmRecord } from "./types";
import type { CrmNamedView, CrmViewSettingsScope } from "@asym/database/types";

function DetailDrawer({
  contact,
  onClose,
  onOpenGift,
}: {
  contact: CrmRecord;
  onClose: () => void;
  onOpenGift: (donationId: string) => void;
}) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [noteBody, setNoteBody] = useState("");
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
    saveViewSettingsMutation.mutate(patch, {
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

  /** Applying a view copies its snapshot into the working preference. */
  const applyNamedView = (view: CrmNamedView) => {
    saveViewSettingsMutation.mutate(
      {
        columns: view.settings?.columns ?? null,
        filtersSort: view.settings?.filtersSort ?? null,
        pinnedActionId: view.pinnedActionId,
        activeViewId: view.id,
      },
      { onError: viewMutationErrorToast },
    );
  };

  // The default named view loads automatically when the user has no working
  // preference record yet (#273). The ref guard keeps this one-shot; the
  // effect runs without a dependency array because its guards are cheap and
  // its inputs include a non-memoized helper.
  const appliedDefaultViewRef = React.useRef(false);
  useEffect(() => {
    if (appliedDefaultViewRef.current) {
      return;
    }
    if (!tablePreferencesQuery.data || tablePreferencesQuery.data.user) {
      return;
    }
    const defaultView = namedViewsQuery.data?.views.find(
      (view) => view.isDefault,
    );
    if (!defaultView) {
      return;
    }
    appliedDefaultViewRef.current = true;
    applyNamedView(defaultView);
  });

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
      if (
        filtersSort.paymentStatus !== "all" &&
        !matchesSharedContributionFilter(
          { shared: gift.shared },
          { id: "payment_status", value: filtersSort.paymentStatus },
        )
      ) {
        return false;
      }
      switch (filtersSort.issue) {
        case "needs_attention":
          return hasSharedContributionIssue({ shared: gift.shared });
        case "receipt_affected":
          return matchesSharedContributionFilter(
            { shared: gift.shared },
            { id: "receipt_affected" },
          );
        case "pending_correction":
          return matchesSharedContributionFilter(
            { shared: gift.shared },
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
          : new Date(left.giftDate).getTime();
      const rightValue =
        filtersSort.sortField === "amountCents"
          ? right.amountCents
          : new Date(right.giftDate).getTime();
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
                    className="bg-transparent border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:text-foreground rounded-none px-0 py-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground shadow-none"
                  >
                    Activity
                  </TabsTrigger>
                  <TabsTrigger
                    value="properties"
                    className="bg-transparent border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:text-foreground rounded-none px-0 py-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground shadow-none"
                  >
                    Properties
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="activity" className="pt-6 space-y-6">
                  <div className="bg-card p-4 rounded-xl border border-border shadow-sm space-y-3">
                    <textarea
                      placeholder="Log a note, call, or meeting..."
                      value={noteBody}
                      onChange={(event) => setNoteBody(event.target.value)}
                      className="w-full h-20 bg-muted border-none focus:ring-0 text-sm resize-none p-3 rounded-lg"
                    />
                    <div className="flex justify-between items-center pt-2 border-t border-muted">
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label="Attach file to note"
                          className="size-7 text-muted-foreground hover:text-foreground"
                        >
                          <Paperclip className="size-3.5" aria-hidden="true" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label="View note history"
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
                    <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-950 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-100">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.18em]">
                        Duplicate warning
                      </p>
                      <div className="mt-2 space-y-2">
                        {detail.duplicateWarnings.map((warning) => (
                          <p
                            key={warning.id}
                            className="text-xs leading-relaxed"
                          >
                            {warning.reason}
                            {warning.score != null ? ` (${warning.score})` : ""}
                          </p>
                        ))}
                      </div>
                    </div>
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
                      <div className="mt-3 divide-y divide-border">
                        {giftRows.length === 0 ? (
                          <p className="py-3 text-xs text-muted-foreground">
                            No gifts match the current view filters.
                          </p>
                        ) : null}
                        {giftRows.slice(0, 6).map((gift) => (
                          <div
                            key={gift.id}
                            className="flex items-center justify-between gap-4 py-3"
                          >
                            <button
                              type="button"
                              onClick={() => onOpenGift(gift.donationId)}
                              className="min-w-0 rounded-lg text-left transition-colors hover:bg-muted/50 focus-visible:outline-2 focus-visible:outline-ring"
                              aria-label={`Open gift detail for ${formatSharedContributionAmount(
                                gift.shared.amountCents,
                                gift.shared.currencyCode,
                              )} to ${gift.shared.designationSummary.fundName}`}
                            >
                              <p className="text-sm font-semibold text-foreground">
                                {formatSharedContributionAmount(
                                  gift.shared.amountCents,
                                  gift.shared.currencyCode,
                                )}
                              </p>
                              {viewSettings.columns.designation ? (
                                <p className="truncate text-xs text-muted-foreground">
                                  {gift.shared.designationSummary.fundName}
                                </p>
                              ) : null}
                              {viewSettings.columns.statusLine ? (
                                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                                  {
                                    SHARED_RECEIPT_STATUS_LABELS[
                                      gift.shared.receiptStatus
                                    ]
                                  }{" "}
                                  /{" "}
                                  {gift.shared.crmPostStatus
                                    ? SHARED_CRM_POST_STATUS_LABELS[
                                        gift.shared.crmPostStatus
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
                        ))}
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
                              <p className="text-xs font-semibold text-emerald-600">
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
        onRowRefresh={() => void detailQuery.refetch()}
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
              <div className="space-y-2">
                {namedViews
                  .filter((view) => view.id !== deleteViewDialog.id)
                  .map((view) => (
                    <label
                      key={view.id}
                      className="flex items-center gap-2 text-sm"
                    >
                      <input
                        type="radio"
                        name="next-default-view"
                        value={view.id}
                        checked={nextDefaultChoice === view.id}
                        onChange={() => setNextDefaultChoice(view.id)}
                      />
                      Make “{view.name}” the default
                    </label>
                  ))}
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    name="next-default-view"
                    value=""
                    checked={nextDefaultChoice === ""}
                    onChange={() => setNextDefaultChoice("")}
                  />
                  No default (use tenant/system default)
                </label>
              </div>
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

export default function MissionControlCRM() {
  const [view, setView] = useState<"table" | "kanban">("table");
  const [selectedRecord, setSelectedRecord] = useState<CrmRecord | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const donorParam = searchParams.get("donor");
  const giftParam = searchParams.get("gift");
  const [openGiftId, setOpenGiftId] = useState<string | null>(() => giftParam);

  useEffect(() => {
    setOpenGiftId(giftParam);
  }, [giftParam]);

  const {
    columnFilters,
    hasMore,
    isFetchingMore,
    isLoading,
    loadMore,
    onFiltersChange,
    onRefresh,
    onSortingChange,
    rows,
    sorting,
    tableError,
  } = useAdminCrmRecordsInfiniteGrid();

  /**
   * Restore the donor drawer from `?donor=` route state when the record is in
   * the loaded grid, so context-preserving CRM gift links reopen in context.
   */
  useEffect(() => {
    if (!donorParam || selectedRecord?.id === donorParam) {
      return;
    }
    const row = rows.find((candidate) => candidate.id === donorParam);
    if (row) {
      setSelectedRecord(toCrmRecord(row));
    }
  }, [donorParam, rows, selectedRecord?.id]);

  const selectRecord = useCallback(
    (record: CrmRecord | null) => {
      setSelectedRecord(record);
      setOpenGiftId(null);
      const params = new URLSearchParams(searchParams.toString());
      params.delete("gift");
      if (record) {
        params.set("donor", record.id);
      } else {
        params.delete("donor");
      }
      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, {
        scroll: false,
      });
    },
    [pathname, router, searchParams],
  );

  const giftOpenerRef = React.useRef<HTMLElement | null>(null);

  const openGift = useCallback(
    (donationId: string) => {
      // Smart close (ADR-CD-023): remember the gift row so closing restores
      // focus to it while the donor drawer context stays untouched.
      giftOpenerRef.current =
        document.activeElement instanceof HTMLElement
          ? document.activeElement
          : null;
      setOpenGiftId(donationId);
      const params = new URLSearchParams(searchParams.toString());
      if (selectedRecord) {
        params.set("donor", selectedRecord.id);
      }
      params.set("gift", donationId);
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [pathname, router, searchParams, selectedRecord],
  );

  const closeGift = useCallback(() => {
    setOpenGiftId(null);
    const params = new URLSearchParams(searchParams.toString());
    params.delete("gift");
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, {
      scroll: false,
    });
    // Restore focus after the sheet unmounts so its focus-trap cleanup
    // cannot clobber the opener focus (ADR-CD-023 focus return).
    const opener = giftOpenerRef.current;
    giftOpenerRef.current = null;
    window.setTimeout(() => opener?.focus(), 0);
  }, [pathname, router, searchParams]);

  const tagOptions = useMemo(() => {
    const s = new Set<string>();
    for (const r of rows) {
      for (const t of r.tags ?? []) {
        s.add(t);
      }
    }
    return Array.from(s)
      .sort()
      .map((t) => ({ label: t, value: t }));
  }, [rows]);

  const filterFields = useMemo((): DataTableFilterField<CrmGridRow>[] => {
    return [
      {
        id: "recordType",
        label: "Record type",
        options: [
          { label: "Individual", value: "individual" },
          { label: "Organization", value: "Organization" },
          { label: "Church", value: "Church" },
        ],
      },
      {
        id: "lifecycleStatus",
        label: "Status",
        options: [
          { label: "Active", value: "active" },
          { label: "Inactive", value: "inactive" },
        ],
      },
      {
        id: "portalAccessLabel",
        label: "Portal",
        options: [
          { label: "Portal linked", value: "linked" },
          { label: "No portal", value: "none" },
        ],
      },
      ...(tagOptions.length > 0
        ? [
            {
              id: "tags",
              label: "Tags",
              options: tagOptions,
            } as DataTableFilterField<CrmGridRow>,
          ]
        : []),
    ];
  }, [tagOptions]);

  const columns = useMemo(
    () =>
      getCrmColumns({
        onViewRecord: (r) => selectRecord(toCrmRecord(r)),
        tagOptions,
      }),
    [selectRecord, tagOptions],
  );

  const handleBulkArchive = (_selected: CrmGridRow[]) => {
    toast.info("Bulk archive is not available yet.");
  };

  const handleBulkExport = (selected: CrmGridRow[]) => {
    const params = new URLSearchParams({ slice: "donors" });
    if (selected.length > 0) {
      toast.info("Export includes the current donor report slice.");
    }
    window.location.assign(`/api/admin/crm/reports/export?${params}`);
  };

  return (
    <>
      <PageShell
        title="CRM"
        description="Manage contacts, donors, and partner relationships."
        density="compact"
        actions={
          <div className="flex items-center gap-3">
            <div className="flex bg-muted p-0.5 rounded-lg border border-border">
              <button
                type="button"
                aria-label="Show CRM table view"
                onClick={() => setView("table")}
                className={cn(
                  "p-1.5 rounded-md transition-colors",
                  view === "table"
                    ? "bg-card shadow-sm text-foreground"
                    : "text-muted-foreground",
                )}
              >
                <List className="size-4" />
              </button>
              <button
                type="button"
                aria-label="Show CRM kanban view"
                onClick={() => setView("kanban")}
                className={cn(
                  "p-1.5 rounded-md transition-colors",
                  view === "kanban"
                    ? "bg-card shadow-sm text-foreground"
                    : "text-muted-foreground",
                )}
              >
                <Columns className="size-4" />
              </button>
            </div>
            <Button className="h-10 gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90">
              <Plus className="size-3.5" /> New Record
            </Button>
            <Button variant="outline" className="h-11 gap-2" asChild>
              <Link href="/crm/relationships">
                <Network className="h-4 w-4" />
                Relationships
              </Link>
            </Button>
            <Button variant="outline" className="h-11 gap-2" asChild>
              <Link href="/crm/notes">
                <StickyNote className="h-4 w-4" />
                Notes
              </Link>
            </Button>
            <Button variant="outline" className="h-11 gap-2" asChild>
              <Link href="/crm/projections">
                <GitCompareArrows className="h-4 w-4" />
                Projections
              </Link>
            </Button>
          </div>
        }
      >
        <div className="flex flex-col min-h-[400px]">
          <AnimatePresence mode="wait">
            {view === "table" ? (
              <motion.div
                key="table"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="h-full"
              >
                <DataTableResponsive
                  columns={columns}
                  data={rows}
                  isLoading={isLoading}
                  filterFields={filterFields}
                  searchColumnId="displayName"
                  searchPlaceholder="Search name, email, or organization..."
                  getRowId={(row) => row.id}
                  onFiltersChange={onFiltersChange}
                  onSortingChange={onSortingChange}
                  onRefresh={() => void onRefresh()}
                  onRowClick={(row) => selectRecord(toCrmRecord(row.original))}
                  infiniteScroll={{
                    hasMore,
                    isFetchingMore,
                    onLoadMore: loadMore,
                    threshold: 10,
                    loadingContent: "Loading more records...",
                  }}
                  emptyState={
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <div className="rounded-2xl bg-muted/50 p-4 mb-4">
                        <User className="size-10 text-muted-foreground" />
                      </div>
                      <h3 className="text-lg font-semibold">No CRM records</h3>
                      {tableError ? (
                        <p className="text-sm text-destructive mt-1 max-w-xl">
                          {tableError.message}
                        </p>
                      ) : (
                        <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                          No donors match the current filters for your
                          workspace.
                        </p>
                      )}
                      <div className="mt-6 flex gap-3">
                        {tableError && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => void onRefresh()}
                          >
                            Retry
                          </Button>
                        )}
                      </div>
                    </div>
                  }
                  config={{
                    enableRowSelection: true,
                    enableColumnVisibility: true,
                    enablePagination: false,
                    enableFilters: true,
                    enableSorting: true,
                    enableViewToggle: false,
                    mobileBreakpoint: 0,
                    manualFiltering: true,
                    manualSorting: true,
                    stickyHeader: true,
                    virtualization: {
                      enabled: true,
                      estimateSize: 72,
                      overscan: 10,
                      containerHeight: 720,
                    },
                  }}
                  initialState={{
                    sorting,
                    columnFilters,
                    columnVisibility: {
                      primaryContactLine: false,
                      fundsGivenToSummary: false,
                      nextTaskSummary: false,
                    },
                  }}
                  floatingBarActions={[
                    {
                      label: "Export",
                      icon: Receipt,
                      onClick: handleBulkExport,
                    },
                    {
                      label: "Archive",
                      icon: Trash2,
                      onClick: handleBulkArchive,
                      variant: "destructive",
                    },
                  ]}
                  mobileCardConfig={{
                    primaryField: "displayName",
                    secondaryField: "primaryOrganization",
                    badgeField: "lifecycleStatus",
                    renderCard: (row) => {
                      const c = row.original;
                      const name = c.displayName || "Unnamed";
                      return (
                        <button
                          type="button"
                          onClick={() => selectRecord(toCrmRecord(c))}
                          className="w-full p-4 cursor-pointer space-y-3 text-left"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <SharedNamedViewTransition
                                name={crmRecordAvatarTransitionName(c.id)}
                              >
                                <Avatar className="size-10 border border-border">
                                  <AvatarImage src={c.avatarUrl ?? undefined} />
                                  <AvatarFallback className="text-xs font-semibold bg-primary text-primary-foreground">
                                    {name[0] ?? "?"}
                                  </AvatarFallback>
                                </Avatar>
                              </SharedNamedViewTransition>
                              <div>
                                <SharedNamedViewTransition
                                  name={crmRecordTitleTransitionName(c.id)}
                                >
                                  <div className="font-semibold text-sm text-foreground">
                                    {name}
                                  </div>
                                </SharedNamedViewTransition>
                                <div className="text-xs text-muted-foreground">
                                  {c.primaryOrganization ?? EMPTY_CELL_VALUE}
                                </div>
                              </div>
                            </div>
                            <Badge
                              variant="outline"
                              className="text-[9px] uppercase"
                            >
                              {c.lifecycleStatus ?? EMPTY_CELL_VALUE}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground line-clamp-1">
                              {c.recordType ?? EMPTY_CELL_VALUE}
                            </span>
                            <span className="font-semibold tabular-nums">
                              {formatCurrency(c.lifetimeGiving)}
                            </span>
                          </div>
                        </button>
                      );
                    },
                  }}
                />
              </motion.div>
            ) : (
              <motion.div
                key="kanban"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="h-full"
              >
                <KanbanView
                  rows={rows}
                  onSelectRow={(r) => selectRecord(toCrmRecord(r))}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </PageShell>

      {selectedRecord && (
        <DetailDrawer
          contact={selectedRecord}
          onClose={() => selectRecord(null)}
          onOpenGift={openGift}
        />
      )}

      <ContributionDetailOverlay
        donationId={openGiftId}
        sourceSurface="donor_crm_record"
        onClose={closeGift}
      />
    </>
  );
}
