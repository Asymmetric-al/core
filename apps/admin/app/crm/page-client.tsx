"use client";

import {
  formatSharedContributionAmount,
  SHARED_CRM_POST_STATUS_LABELS,
  SHARED_RECEIPT_STATUS_LABELS,
} from "@asym/api/admin/contribution-shared";
import {
  useAdminCrmRecordDetail,
  useAdminCrmRecordsInfiniteGrid,
  useCreateLinkedCrmNote,
  useResendCrmGiftReceipt,
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
  MoreHorizontal,
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
import { PORTAL_BADGE_CLASS, toCrmRecord } from "./types";
import { ContributionDetailOverlay } from "../contributions/contribution-detail-overlay";

import type { CrmGridRow, CrmRecord } from "./types";

const EMPTY_CELL_VALUE = "N/A";

function makeDisplayDate(value?: string | number | Date): Date {
  return value === undefined
    ? new globalThis.Date()
    : new globalThis.Date(value);
}

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
  const receiptMutation = useResendCrmGiftReceipt(contact.id);

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

  const resendReceipt = async (input: {
    contributionId: string;
    stagedGiftId: string;
  }) => {
    try {
      await receiptMutation.mutateAsync(input);
      toast.success("Receipt resend queued.");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to resend receipt.",
      );
    }
  };

  return (
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
                    <span className="text-muted-foreground">No title set</span>
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
                      {createNoteMutation.isPending ? "Saving..." : "Save Note"}
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
                        <p key={warning.id} className="text-xs leading-relaxed">
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
                      <Badge variant="secondary" className="text-[10px]">
                        {detail.giftHistory.length}
                      </Badge>
                    </div>
                    <div className="mt-3 divide-y divide-border">
                      {detail.giftHistory.slice(0, 6).map((gift) => (
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
                            <p className="truncate text-xs text-muted-foreground">
                              {gift.shared.designationSummary.fundName}
                            </p>
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
                          </button>
                          {gift.canResendReceipt && gift.stagedGiftId ? (
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 shrink-0 gap-2 text-xs"
                              disabled={receiptMutation.isPending}
                              onClick={() =>
                                void resendReceipt({
                                  contributionId: gift.donationId,
                                  stagedGiftId: gift.stagedGiftId!,
                                })
                              }
                            >
                              <Receipt className="size-3.5" />
                              Resend
                            </Button>
                          ) : null}
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
                      No timeline entries yet. Activity from donations and tasks
                      will appear here as the CRM read model expands.
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
  );
}

function KanbanView({
  rows,
  onSelectRow,
}: {
  rows: CrmGridRow[];
  onSelectRow: (row: CrmGridRow) => void;
}) {
  const columns = useMemo(() => {
    const set = new Set<string>();
    for (const r of rows) {
      set.add(r.lifecycleStatus ?? "Unknown");
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [rows]);

  if (rows.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground text-sm">
        Load records in table view first, or adjust filters, nothing to show on
        the board yet.
      </div>
    );
  }

  return (
    <div className="h-full overflow-x-auto flex p-4 md:p-6 gap-4 items-start">
      {columns.map((status) => (
        <div
          key={status}
          className="flex-shrink-0 w-80 flex flex-col h-full bg-muted/30 rounded-xl border border-border/50 overflow-hidden"
        >
          <div className="p-3 bg-muted/50 border-b border-border flex items-center justify-between">
            <Badge
              variant="secondary"
              className="px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.15em] rounded shadow-none border"
            >
              {status}
            </Badge>
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
              {
                rows.filter((r) => (r.lifecycleStatus ?? "Unknown") === status)
                  .length
              }
            </span>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {rows
              .filter((r) => (r.lifecycleStatus ?? "Unknown") === status)
              .map((c) => {
                const name = c.displayName || "Unnamed";
                const org = c.primaryOrganization ?? "";
                const orgInitial = org.trim()[0] ?? "?";
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => onSelectRow(c)}
                    className="w-full bg-card p-3 rounded-lg border border-border shadow-sm hover:shadow-md transition-all cursor-pointer space-y-3 text-left"
                  >
                    <div className="flex justify-between items-start">
                      <SharedNamedViewTransition
                        name={crmRecordTitleTransitionName(c.id)}
                      >
                        <span className="font-semibold text-foreground text-xs truncate leading-none inline-block max-w-[85%]">
                          {name}
                        </span>
                      </SharedNamedViewTransition>
                      <MoreHorizontal
                        className="size-3.5 text-muted-foreground"
                        aria-hidden="true"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="size-4 rounded bg-muted flex items-center justify-center text-[8px] font-semibold text-muted-foreground border border-border">
                        {orgInitial}
                      </div>
                      <span className="text-[10px] text-muted-foreground font-medium truncate">
                        {org || EMPTY_CELL_VALUE}
                      </span>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-muted">
                      <span className="text-[10px] font-semibold text-foreground tabular-nums">
                        {formatCurrency(c.lifetimeGiving)}
                      </span>
                      <SharedNamedViewTransition
                        name={crmRecordAvatarTransitionName(c.id)}
                      >
                        <Avatar className="size-4">
                          <AvatarImage src={c.avatarUrl ?? undefined} />
                          <AvatarFallback className="text-[8px] font-semibold">
                            {name[0] ?? "?"}
                          </AvatarFallback>
                        </Avatar>
                      </SharedNamedViewTransition>
                    </div>
                  </button>
                );
              })}
          </div>
        </div>
      ))}
    </div>
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
