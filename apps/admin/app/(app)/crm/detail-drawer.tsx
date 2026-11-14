"use client";

import { formatSharedContributionAmount } from "@asym/api/admin/contribution-shared";
import {
  useAdminCrmRecordDetail,
  useCreateLinkedCrmNote,
} from "@asym/database/hooks";
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
  Field,
  FieldDescription,
  FieldLabel,
} from "@asym/ui/components/shadcn/field";
import { ScrollArea } from "@asym/ui/components/shadcn/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from "@asym/ui/components/shadcn/sheet";
import { Skeleton } from "@asym/ui/components/shadcn/skeleton";
import { Spinner } from "@asym/ui/components/shadcn/spinner";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@asym/ui/components/shadcn/tabs";
import { Textarea } from "@asym/ui/components/shadcn/textarea";
import { SharedNamedViewTransition } from "@asym/ui/components/view-transitions";
import {
  AlertCircle,
  FileText,
  Link2,
  RotateCw,
  TriangleAlert,
  X,
} from "lucide-react";
import Link from "next/link";
import { useId, useRef, useState } from "react";
import { toast } from "sonner";

import {
  CRM_LOAD_ERROR_NEXT_STEP,
  CrmEmptyValue,
  CrmStatusBadge,
  crmInitials,
  crmLoadErrorMessage,
  formatCrmDate,
  formatCrmMoneyCents,
  toCrmLabel,
} from "./crm-display";
import { GiftHistorySection } from "./gift-history-section";
import { GivingByYearChart } from "./giving-by-year-chart";

import type { CrmRecord } from "./types";
import type { CrmDonorDetailResponse } from "@asym/database/types";
import type { FormEvent, ReactNode, RefObject } from "react";

/** Where the record's detail read stands; the grid row covers the header. */
type DetailState = "loading" | "error" | "ready";

type DrawerTimelineEntry = {
  kind: string;
  /** Only a settled gift ("completed") is money received and gets a plus. */
  paymentStatus: CrmDonorDetailResponse["timeline"][number]["paymentStatus"];
  amountCents: number | null;
  currencyCode: string | null;
  description: string | null;
  id: string;
  occurredAt: string;
  title: string;
};

function DetailDrawerTitleLine({
  organization,
  title,
}: {
  organization: string | null | undefined;
  title: string | null | undefined;
}) {
  if (title) {
    return (
      <>
        {title}
        {organization ? (
          <>
            {" "}
            at <span className="text-foreground">{organization}</span>
          </>
        ) : null}
      </>
    );
  }

  if (organization) {
    return <span className="text-foreground">{organization}</span>;
  }

  return <>No title set</>;
}

function DetailDrawerHeader({
  closeButtonRef,
  onClose,
}: {
  closeButtonRef: RefObject<HTMLButtonElement | null>;
  onClose: () => void;
}) {
  return (
    <div className="flex shrink-0 items-center justify-between gap-3 border-b px-4 py-3 sm:px-6">
      <p className="text-sm font-medium text-muted-foreground">CRM record</p>
      <Button
        ref={closeButtonRef}
        variant="ghost"
        size="icon-sm"
        onClick={onClose}
        aria-label="Close CRM record details"
      >
        <X aria-hidden="true" />
      </Button>
    </div>
  );
}

function DetailDrawerStat({
  label,
  children,
  note,
  className,
}: {
  label: string;
  children: ReactNode;
  /** A short line under the value, e.g. what the figure includes. */
  note?: ReactNode;
  className?: string;
}) {
  return (
    <div className={className ?? "flex min-w-0 flex-col gap-1"}>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="truncate text-sm font-medium text-foreground tabular-nums">
        {children}
      </dd>
      {note ? (
        <dd className="text-xs text-muted-foreground tabular-nums">{note}</dd>
      ) : null}
    </div>
  );
}

/**
 * Lifetime giving is the donor record's stored total, which can include
 * giving from before the tracked gifts (an import's baseline). Says how much
 * of it the gift list below does not show, so the two never seem to
 * disagree. Null when the list accounts for it, or can't be compared.
 */
function lifetimeGivingNote(
  detail: CrmDonorDetailResponse | undefined,
): string | null {
  if (!detail) return null;
  if (detail.giftHistoryTruncated) {
    return "Includes gifts beyond the 100 listed";
  }
  let listedCents = 0;
  for (const gift of detail.giftHistory) {
    // Lifetime giving is shown in USD; another currency can't be compared.
    if (gift.shared.currencyCode.toUpperCase() !== "USD") return null;
    if (gift.shared.paymentStatus !== "completed") continue;
    listedCents += gift.shared.amountCents - gift.shared.refundedAmountCents;
  }
  const beyondCents = detail.support.lifetimeGivingCents - listedCents;
  return beyondCents > 0
    ? `Includes ${formatCrmMoneyCents(beyondCents)} not in the gift list`
    : null;
}

type CrmRecordOwner =
  | { status: "named"; name: string }
  | { status: "unavailable" }
  | { status: "none" };

/**
 * The record owner (`donors.missionary_id`), matching the grid's Owner
 * column; never the missionary most gifts went to. Grid rows and the detail
 * read both name it from profiles; only when the profile cannot be read does
 * the field say an owner is assigned without the name.
 */
function crmRecordOwner(record: CrmRecord): CrmRecordOwner {
  if (record.assignedMissionaryName) {
    return { status: "named", name: record.assignedMissionaryName };
  }
  return record.assignedMissionaryId
    ? { status: "unavailable" }
    : { status: "none" };
}

function DetailDrawerOwner({ owner }: { owner: CrmRecordOwner }) {
  switch (owner.status) {
    case "named":
      return <>{owner.name}</>;
    case "unavailable":
      return (
        <span className="font-normal text-muted-foreground">
          Assigned (name unavailable)
        </span>
      );
    default:
      return <CrmEmptyValue />;
  }
}

function DetailDrawerIdentity({
  contact,
  detail,
  display,
  owner,
}: {
  contact: CrmRecord;
  detail: CrmDonorDetailResponse | undefined;
  display: string;
  owner: CrmRecordOwner;
}) {
  const lifetimeGivingCents =
    detail?.support.lifetimeGivingCents ?? contact.lifetimeGiving;
  const lastGift = formatCrmDate(
    detail?.support.lastGiftAt ?? contact.lastGiftAt,
  );
  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-start gap-4">
        <SharedNamedViewTransition
          name={crmRecordAvatarTransitionName(contact.id)}
        >
          <Avatar className="size-14" aria-hidden="true">
            <AvatarImage src={contact.avatarUrl ?? undefined} alt="" />
            <AvatarFallback>{crmInitials(display)}</AvatarFallback>
          </Avatar>
        </SharedNamedViewTransition>
        {/* wrap-break-word: long names wrap in the title (it inherits). */}
        <div className="flex min-w-0 flex-col gap-1.5 wrap-break-word">
          <SharedNamedViewTransition
            name={crmRecordTitleTransitionName(contact.id)}
          >
            {/* The record name is the sheet's accessible title. */}
            <SheetTitle className="text-xl tracking-tight">
              {display}
            </SheetTitle>
          </SharedNamedViewTransition>
          <p className="text-sm text-muted-foreground">
            <DetailDrawerTitleLine
              organization={contact.primaryOrganization}
              title={contact.title}
            />
          </p>
          <div className="flex flex-wrap items-center gap-1.5">
            <CrmStatusBadge status={contact.lifecycleStatus} />
            {contact.recordType ? (
              <Badge variant="outline">{toCrmLabel(contact.recordType)}</Badge>
            ) : null}
            <Badge variant="outline">
              {contact.portalAccessLabel === "linked" ? (
                <>
                  <Link2 aria-hidden="true" />
                  Portal linked
                </>
              ) : (
                "No portal"
              )}
            </Badge>
          </div>
        </div>
      </div>
      {/* Two columns on phones, so the owner gets its own full-width line. */}
      <dl className="grid grid-cols-2 gap-4 rounded-lg border px-4 py-3 sm:grid-cols-3">
        <DetailDrawerStat
          label="Lifetime giving"
          note={lifetimeGivingNote(detail)}
        >
          {formatCrmMoneyCents(lifetimeGivingCents)}
        </DetailDrawerStat>
        <DetailDrawerStat label="Last gift">
          {lastGift ?? <CrmEmptyValue />}
        </DetailDrawerStat>
        <DetailDrawerStat
          label="Owner"
          className="col-span-2 flex min-w-0 flex-col gap-1 sm:col-span-1"
        >
          <DetailDrawerOwner owner={owner} />
        </DetailDrawerStat>
      </dl>
    </div>
  );
}

/** The fund with the most giving, from the detail read's per-fund totals. */
function topFundName(
  detail: CrmDonorDetailResponse | undefined,
): string | null {
  let top: { fundName: string; amountCents: number } | null = null;
  for (const fund of detail?.support.byFund ?? []) {
    if (fund.amountCents > 0 && (!top || fund.amountCents > top.amountCents)) {
      top = fund;
    }
  }
  return top?.fundName ?? null;
}

/**
 * Facts the rest of the drawer does not show: the record's notes and the
 * fund it gives most to. Shown only when the data has them, so a missing or
 * failed read never reads as "no notes".
 */
function DetailDrawerHighlights({
  notes,
  topFund,
}: {
  notes: string | null;
  topFund: string | null;
}) {
  if (!notes && !topFund) return null;
  return (
    <section
      aria-label="Highlights"
      className="flex flex-col gap-3 rounded-lg border bg-muted/40 p-4"
    >
      <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
        <FileText aria-hidden="true" className="size-4 text-muted-foreground" />
        Highlights
      </h3>
      <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {notes ? (
          <div className="flex flex-col gap-1">
            <dt className="text-xs text-muted-foreground">Notes</dt>
            <dd className="text-sm">{notes}</dd>
          </div>
        ) : null}
        {topFund ? (
          <div className="flex flex-col gap-1">
            <dt className="text-xs text-muted-foreground">Gives most to</dt>
            <dd className="text-sm font-medium">{topFund}</dd>
          </div>
        ) : null}
      </dl>
    </section>
  );
}

function DetailDrawerNoteComposer({
  isSaving,
  noteBody,
  noteFieldId,
  onNoteBodyChange,
  onSave,
}: {
  isSaving: boolean;
  noteBody: string;
  noteFieldId: string;
  onNoteBodyChange: (value: string) => void;
  onSave: () => void;
}) {
  const hintId = useId();
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSave();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-2 rounded-lg border p-3"
    >
      <Field>
        <FieldLabel htmlFor={noteFieldId}>Add a note</FieldLabel>
        <Textarea
          id={noteFieldId}
          placeholder="Log a note, call, or meeting…"
          value={noteBody}
          aria-describedby={hintId}
          onChange={(event) => onNoteBodyChange(event.target.value)}
        />
        {/* Standard notes; restricted notes keep their own access rules. */}
        <FieldDescription id={hintId}>
          Staff with CRM access in your organization can read it. It&apos;s also
          listed in <Link href="/crm/notes">CRM notes</Link>.
        </FieldDescription>
      </Field>
      <div className="flex items-center justify-end gap-3">
        <Button
          type="submit"
          size="sm"
          disabled={isSaving || !noteBody.trim()}
          focusableWhenDisabled={isSaving}
        >
          {isSaving ? <Spinner /> : null}
          {isSaving ? "Saving..." : "Save note"}
        </Button>
      </div>
    </form>
  );
}

function DetailDrawerTimeline({
  state,
  timeline,
}: {
  state: Exclude<DetailState, "error">;
  timeline: DrawerTimelineEntry[];
}) {
  const headingId = useId();
  return (
    <section aria-labelledby={headingId} className="flex flex-col gap-3">
      <h3 id={headingId} className="text-sm font-semibold text-foreground">
        Timeline
      </h3>
      {state === "loading" ? (
        // The grid row has no activity; wait for the detail read instead of
        // claiming the timeline is empty.
        <div role="status" className="flex flex-col gap-3">
          <span className="sr-only">Loading timeline…</span>
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-3/4" />
        </div>
      ) : timeline.length === 0 ? (
        <p className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
          No activity recorded yet.
        </p>
      ) : (
        <ol className="flex flex-col">
          {timeline.map((entry) => (
            <li key={entry.id} className="group flex gap-3">
              <div aria-hidden="true" className="flex flex-col items-center">
                <span className="mt-1.5 size-2 shrink-0 rounded-full bg-muted-foreground/60" />
                <span className="mt-1 w-px grow bg-border group-last:hidden" />
              </div>
              <div className="flex min-w-0 flex-1 flex-col gap-1 pb-5 group-last:pb-0">
                <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                  <p className="text-sm font-medium text-foreground">
                    {entry.title}
                  </p>
                  <time
                    dateTime={entry.occurredAt}
                    className="text-xs text-muted-foreground tabular-nums"
                  >
                    {formatCrmDate(entry.occurredAt) ?? entry.occurredAt}
                  </time>
                </div>
                {entry.description ? (
                  <p className="text-sm text-muted-foreground">
                    {entry.description}
                  </p>
                ) : null}
                {entry.amountCents ? (
                  // Pledges, other activity and unsettled gifts carry amounts
                  // that were not received, so only settled gifts read "+$".
                  <p className="text-sm font-medium text-foreground tabular-nums">
                    {entry.kind === "gift" &&
                    entry.paymentStatus === "completed"
                      ? "+"
                      : null}
                    {formatSharedContributionAmount(
                      entry.amountCents,
                      entry.currencyCode ?? "USD",
                    )}
                  </p>
                ) : null}
              </div>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

function DetailDrawerDetailError({
  error,
  onRetry,
}: {
  error: unknown;
  onRetry: () => void;
}) {
  return (
    <Alert variant="destructive">
      <AlertCircle aria-hidden="true" />
      <AlertTitle>Couldn&apos;t load gift history and timeline</AlertTitle>
      <AlertDescription>
        <p>
          {error instanceof Error
            ? crmLoadErrorMessage(error)
            : CRM_LOAD_ERROR_NEXT_STEP}
        </p>
        <Button variant="outline" size="sm" onClick={onRetry}>
          <RotateCw aria-hidden="true" />
          Retry
        </Button>
      </AlertDescription>
    </Alert>
  );
}

function DetailDrawerProperty({
  label,
  children,
  className,
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={className ?? "flex min-w-0 flex-col gap-1"}>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="text-sm text-foreground">{children}</dd>
    </div>
  );
}

function DetailDrawerSupportStatus({
  detail,
  detailState,
}: {
  detail: CrmDonorDetailResponse | undefined;
  detailState: DetailState;
}) {
  if (!detail) {
    return (
      <span className="text-muted-foreground">
        {detailState === "error"
          ? "Support details unavailable"
          : "Loading support details…"}
      </span>
    );
  }
  // Lifetime giving already leads the summary above the tabs; this field
  // describes ongoing support.
  const { activeRecurringCommitments, atRiskCommitments, lapsedCommitments } =
    detail.support;
  return (
    <span className="flex flex-col gap-0.5">
      <span className="font-medium tabular-nums">
        {`${activeRecurringCommitments} recurring / ${atRiskCommitments} at risk`}
      </span>
      <span className="text-xs text-muted-foreground tabular-nums">
        {lapsedCommitments === 1
          ? "1 lapsed commitment"
          : `${lapsedCommitments} lapsed commitments`}
      </span>
    </span>
  );
}

/**
 * Missionaries the donor's settled gifts went to, most support first. Not the
 * record's assigned missionary (who owns the record), and not the
 * "Unassigned missionary" bucket for gifts with no missionary.
 */
function DetailDrawerSupportedMissionaries({
  detail,
  detailState,
}: {
  detail: CrmDonorDetailResponse | undefined;
  detailState: DetailState;
}) {
  if (!detail) {
    return (
      <span className="text-muted-foreground">
        {detailState === "error"
          ? "Giving details unavailable"
          : "Loading giving details…"}
      </span>
    );
  }
  const supported = detail.support.byMissionary
    .filter((row) => row.missionaryId !== null)
    .sort((left, right) => right.amountCents - left.amountCents);
  if (supported.length === 0) {
    return (
      <span className="text-muted-foreground">
        No gifts to a missionary yet
      </span>
    );
  }
  return (
    <span className="flex flex-col gap-0.5">
      <ul className="flex flex-col gap-0.5 font-medium">
        {supported.map((row) => (
          <li key={row.missionaryId}>{row.missionaryName}</li>
        ))}
      </ul>
      {detail.giftHistoryTruncated ? (
        <span className="text-xs text-muted-foreground">
          From the most recent 100 gifts
        </span>
      ) : null}
    </span>
  );
}

function DetailDrawerProperties({
  contact,
  detail,
  detailState,
  owner,
}: {
  contact: CrmRecord;
  detail: CrmDonorDetailResponse | undefined;
  detailState: DetailState;
  owner: CrmRecordOwner;
}) {
  const tags = contact.tags ?? [];

  return (
    <TabsContent value="properties" className="pt-4">
      <dl className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
        <DetailDrawerProperty label="Email">
          {contact.email ? (
            <a
              href={`mailto:${contact.email}`}
              className="break-all font-medium underline-offset-4 hover:underline"
            >
              {contact.email}
            </a>
          ) : (
            <CrmEmptyValue />
          )}
        </DetailDrawerProperty>
        <DetailDrawerProperty label="Phone">
          {contact.phone ? (
            <a
              href={`tel:${contact.phone}`}
              className="font-medium underline-offset-4 hover:underline"
            >
              {contact.phone}
            </a>
          ) : (
            <CrmEmptyValue />
          )}
        </DetailDrawerProperty>
        <DetailDrawerProperty label="Location">
          {contact.location ?? <CrmEmptyValue />}
        </DetailDrawerProperty>
        <DetailDrawerProperty label="Assigned missionary">
          <DetailDrawerOwner owner={owner} />
        </DetailDrawerProperty>
        <DetailDrawerProperty label="Supported missionaries">
          <DetailDrawerSupportedMissionaries
            detail={detail}
            detailState={detailState}
          />
        </DetailDrawerProperty>
        <DetailDrawerProperty label="Support status">
          <DetailDrawerSupportStatus
            detail={detail}
            detailState={detailState}
          />
        </DetailDrawerProperty>
        <DetailDrawerProperty label="Privacy">
          <span className="text-muted-foreground">
            {detail?.privacy.missionaryContactDataExposed === false
              ? "Missionary users do not receive restricted donor contact data."
              : "Staff-only donor data."}
          </span>
        </DetailDrawerProperty>
        <DetailDrawerProperty
          label="Tags"
          className="flex min-w-0 flex-col gap-1 sm:col-span-2"
        >
          {tags.length === 0 ? (
            <CrmEmptyValue />
          ) : (
            <span className="flex flex-wrap gap-1">
              {tags.map((tag) => (
                <Badge key={tag} variant="outline">
                  {tag}
                </Badge>
              ))}
            </span>
          )}
        </DetailDrawerProperty>
      </dl>
    </TabsContent>
  );
}

function DetailDrawerActivityTab({
  detail,
  detailError,
  detailState,
  isSavingNote,
  noteBody,
  noteFieldId,
  onNoteBodyChange,
  onOpenGift,
  onRefreshGifts,
  onRetryDetail,
  onSaveNote,
  timeline,
}: {
  detail: CrmDonorDetailResponse | undefined;
  detailError: unknown;
  detailState: DetailState;
  isSavingNote: boolean;
  noteBody: string;
  noteFieldId: string;
  onNoteBodyChange: (value: string) => void;
  onOpenGift: (donationId: string) => void;
  onRefreshGifts: () => Promise<void>;
  onRetryDetail: () => void;
  onSaveNote: () => void;
  timeline: DrawerTimelineEntry[];
}) {
  const duplicateWarnings = detail?.duplicateWarnings ?? [];

  return (
    <TabsContent value="activity" className="flex flex-col gap-6 pt-4">
      {duplicateWarnings.length > 0 ? (
        <Alert variant="warning">
          <TriangleAlert aria-hidden="true" />
          <AlertTitle>Possible duplicate record</AlertTitle>
          <AlertDescription>
            <ul className="flex flex-col gap-1">
              {duplicateWarnings.map((warning) => (
                <li key={warning.id}>
                  {warning.reason}
                  {warning.score != null ? ` (${warning.score})` : ""}
                </li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      ) : null}

      {/* One failure message covers both detail-backed sections. */}
      {detailState === "error" ? (
        <DetailDrawerDetailError error={detailError} onRetry={onRetryDetail} />
      ) : null}

      {/* The gift list and its receipt and correction actions come first:
          they are the daily work. The chart summarises the same gifts under
          it, and the note box sits over the timeline its notes join. */}
      <GiftHistorySection
        detail={detail}
        isLoading={detailState === "loading"}
        onOpenGift={onOpenGift}
        onRefresh={onRefreshGifts}
      />

      <GivingByYearChart
        detail={detail}
        isLoading={detailState === "loading"}
      />

      <DetailDrawerNoteComposer
        isSaving={isSavingNote}
        noteBody={noteBody}
        noteFieldId={noteFieldId}
        onNoteBodyChange={onNoteBodyChange}
        onSave={onSaveNote}
      />

      {/* Activity already on the record shows while detail loads or fails. */}
      {timeline.length > 0 ? (
        <DetailDrawerTimeline state="ready" timeline={timeline} />
      ) : detailState === "error" ? null : (
        <DetailDrawerTimeline state={detailState} timeline={timeline} />
      )}
    </TabsContent>
  );
}

export function DetailDrawer({
  contact,
  open = true,
  onClose,
  onClosed,
  onOpenGift,
  onRowRefresh,
}: {
  contact: CrmRecord;
  /** False while the sheet animates out; the host keeps it mounted. */
  open?: boolean;
  onClose: () => void;
  /** The close animation has finished: the host can unmount the drawer. */
  onClosed?: () => void;
  onOpenGift: (donationId: string) => void;
  /** Notifies the host after an inline operation refreshes shared row data. */
  onRowRefresh?: () => void;
}) {
  const [noteBody, setNoteBody] = useState("");
  const noteFieldId = useId();
  const detailQuery = useAdminCrmRecordDetail(contact.id);
  const createNoteMutation = useCreateLinkedCrmNote(contact.id);
  const owner = crmRecordOwner(contact);

  const closeButtonRef = useRef<HTMLButtonElement | null>(null);

  const display = contact.displayName || "Unnamed record";
  const detail = detailQuery.data;
  // Cached detail stays on screen through a failed background refresh.
  const detailState: DetailState = detail
    ? "ready"
    : detailQuery.isError
      ? "error"
      : "loading";

  // The timeline is the record's full chronology, gifts included (each
  // with its exact amount); Gift history above is the list staff act on.
  const timeline: DrawerTimelineEntry[] =
    detail?.timeline ??
    contact.activities.map((activity) => ({
      kind: activity.type,
      paymentStatus: null,
      amountCents: activity.amount ?? null,
      currencyCode: null,
      description: activity.description ?? null,
      id: activity.id,
      occurredAt: activity.date,
      title: activity.title,
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
      // Same wording as the CRM notes page.
      toast.success("CRM note saved", {
        description: "Everyone with CRM access can read it now.",
      });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to save note.",
      );
    }
  };

  return (
    <Sheet
      open={open}
      onOpenChange={(next) => !next && onClose()}
      onOpenChangeComplete={(next) => !next && onClosed?.()}
    >
      <SheetContent
        className="w-full sm:max-w-2xl"
        showCloseButton={false}
        // Resend receipt and the other gift confirmations open over the
        // drawer; dim it so they read as separate from the record.
        nestedDialogScrim
        // Land on the close control rather than the first action, so opening
        // a record never looks like an action is selected.
        initialFocus={closeButtonRef}
      >
        <SheetDescription className="sr-only">
          CRM record details: giving, activity, and properties.
        </SheetDescription>
        <div className="flex min-h-0 flex-1 flex-col">
          <DetailDrawerHeader
            closeButtonRef={closeButtonRef}
            onClose={onClose}
          />

          <ScrollArea className="min-h-0 flex-1">
            <div className="flex flex-col gap-6 p-4 sm:p-6">
              <DetailDrawerIdentity
                contact={contact}
                detail={detail}
                display={display}
                owner={owner}
              />
              <DetailDrawerHighlights
                notes={detail?.donor.notesPreview ?? contact.notesPreview}
                topFund={topFundName(detail)}
              />

              <Tabs defaultValue="activity">
                <TabsList variant="line">
                  <TabsTrigger value="activity">Activity</TabsTrigger>
                  <TabsTrigger value="properties">Properties</TabsTrigger>
                </TabsList>

                <DetailDrawerActivityTab
                  detail={detail}
                  detailError={detailQuery.error}
                  detailState={detailState}
                  isSavingNote={createNoteMutation.isPending}
                  noteBody={noteBody}
                  noteFieldId={noteFieldId}
                  onNoteBodyChange={setNoteBody}
                  onOpenGift={onOpenGift}
                  onRefreshGifts={async () => {
                    const refreshed = await detailQuery.refetch();
                    if (refreshed.isError) {
                      throw refreshed.error instanceof Error
                        ? refreshed.error
                        : new Error("Could not refresh the CRM gift history.");
                    }
                    onRowRefresh?.();
                  }}
                  onRetryDetail={() => void detailQuery.refetch()}
                  onSaveNote={() => void saveNote()}
                  timeline={timeline}
                />

                <DetailDrawerProperties
                  contact={contact}
                  detail={detail}
                  detailState={detailState}
                  owner={owner}
                />
              </Tabs>
            </div>
          </ScrollArea>
        </div>
      </SheetContent>
    </Sheet>
  );
}
