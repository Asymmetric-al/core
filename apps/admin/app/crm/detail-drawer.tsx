"use client";

import {
  useAdminCrmRecordDetail,
  useCreateLinkedCrmNote,
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
import { Textarea } from "@asym/ui/components/shadcn/textarea";
import { SharedNamedViewTransition } from "@asym/ui/components/view-transitions";
import { cn } from "@asym/ui/lib/utils";
import { FileText, History, Paperclip, User, X } from "lucide-react";
import { useId, useState } from "react";
import { toast } from "sonner";

import { EMPTY_CELL_VALUE, makeDisplayDate } from "./crm-detail-shared";
import { GiftHistorySection } from "./gift-history-section";
import { PORTAL_BADGE_CLASS } from "./types";

import type { CrmRecord } from "./types";

export function DetailDrawer({
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
  const noteFieldId = useId();
  const [summary, setSummary] = useState<{
    category: string;
    focus: string;
    nextMove: string;
  } | null>(null);
  const detailQuery = useAdminCrmRecordDetail(contact.id);
  const createNoteMutation = useCreateLinkedCrmNote(contact.id);

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

                  <GiftHistorySection
                    detail={detail}
                    isLoading={detailQuery.isLoading}
                    onOpenGift={onOpenGift}
                    onRefresh={() => void detailQuery.refetch()}
                  />

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
    </>
  );
}
