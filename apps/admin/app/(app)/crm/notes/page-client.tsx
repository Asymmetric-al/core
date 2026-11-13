"use client";

import { useAdminCrmNotesGrid } from "@asym/database/hooks";
import { useIsMobile } from "@asym/lib/hooks/use-mobile";
import {
  DataGridPanel,
  DataGridRowPrimary,
  DataGridSearch,
  DataGridToolbarSpacer,
  DataGridViewOptions,
  dataGridFeatures,
  useTable,
  DataGridSortSelect,
} from "@asym/ui/components/data-grid-panel";
import { PageShell } from "@asym/ui/components/primitives/page-shell";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@asym/ui/components/shadcn/alert";
import { Button, buttonVariants } from "@asym/ui/components/shadcn/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@asym/ui/components/shadcn/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@asym/ui/components/shadcn/dialog";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@asym/ui/components/shadcn/empty";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@asym/ui/components/shadcn/field";
import { Input } from "@asym/ui/components/shadcn/input";
import {
  Item,
  ItemContent,
  ItemDescription,
} from "@asym/ui/components/shadcn/item";
import { Spinner } from "@asym/ui/components/shadcn/spinner";
import { Textarea } from "@asym/ui/components/shadcn/textarea";
import {
  ArrowLeft,
  FileText,
  Network,
  Plus,
  SearchX,
  ShieldAlert,
  X,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useId, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import {
  CRM_NOTE_COLUMN_TIERS,
  CRM_NOTE_FILL_COLUMN_ID,
  CrmNoteLinkedRecord,
  CrmNoteRestrictedBadge,
  CrmNoteVisibility,
  getCrmNoteColumns,
} from "./columns";
import {
  CrmDataSources,
  CrmRefreshButton,
  CrmSkipLink,
  crmPanelError,
  isCrmPermissionError,
  formatCrmDate,
} from "../crm-display";
import { crmVirtualOptions, useCrmVirtualAllowance } from "../crm-virtual";
import { useCrmGridLayout } from "../use-crm-grid-layout";

import type { CrmNoteRow } from "@asym/database/hooks";
import type { DataGridRow } from "@asym/ui/components/data-grid-panel";
import type { FormEvent } from "react";

import {
  CRM_NOTES_PAGE_META,
  CRM_PAGE_META,
} from "@/components/table-page-meta";

/** Estimated note row height (title plus a two-line preview). */
const NOTE_ROW_HEIGHT = 68;

/** Server sort choices for phones, where the table headers are not shown. */
const CRM_NOTE_SORT_LABELS: Record<string, string> = {
  "updatedAt:desc": "Updated: newest",
  "updatedAt:asc": "Updated: oldest",
  "title:asc": "Title: A–Z",
  "title:desc": "Title: Z–A",
};
const TITLE_MAX = 160;
const NOTE_TITLE_FIELD_ID = "crm-note-title";

/** The notes list's box: the "Skip to notes" link's target. */
const CRM_NOTES_LIST_ID = "crm-notes-list";
const BODY_MAX = 10_000;

function CrmNoteMobileRow({
  note,
  onOpen,
}: {
  note: CrmNoteRow;
  onOpen: (note: CrmNoteRow) => void;
}) {
  return (
    // The title control stretches over the card, so the whole card opens it.
    <div className="relative rounded-md transition-colors hover:bg-accent/40 has-focus-visible:ring-3 has-focus-visible:ring-ring/50">
      <Item variant="outline" size="sm" render={<div />}>
        <ItemContent className="min-w-0">
          <div className="flex min-w-0 items-center justify-between gap-2">
            <DataGridRowPrimary
              className="after:absolute after:inset-0"
              onClick={() => onOpen(note)}
            >
              <span className="truncate text-sm font-medium">{note.title}</span>
            </DataGridRowPrimary>
            <CrmNoteRestrictedBadge note={note} />
          </div>
          <ItemDescription>{note.bodyPreview}</ItemDescription>
          {/* The linked record has its own line (wrapping to two), so a long
              name is not cut off after the author and date. */}
          {note.linkedRecordLabel ? (
            <p className="line-clamp-2 text-xs wrap-break-word text-muted-foreground">
              {`Linked to ${note.linkedRecordLabel}`}
            </p>
          ) : null}
          <p className="truncate text-xs text-muted-foreground">
            {note.authorName || "Mission Control"} ·{" "}
            {formatCrmDate(note.updatedAt) ?? "—"}
          </p>
        </ItemContent>
      </Item>
    </div>
  );
}

function CrmNotesCount({
  count,
  searching,
}: {
  count: number;
  searching: boolean;
}) {
  if (count === 0) return null;
  return (
    <p className="text-xs text-muted-foreground tabular-nums">
      {`${count} ${count === 1 ? "note" : "notes"}${
        searching ? " match this search" : ""
      }`}
    </p>
  );
}

function CrmNoteDialog({
  note,
  onClose,
}: {
  note: CrmNoteRow | null;
  onClose: () => void;
}) {
  // A long note opens at its title, not scrolled to the Close button.
  const headerRef = useRef<HTMLDivElement>(null);
  return (
    <Dialog open={note !== null} onOpenChange={(open) => !open && onClose()}>
      {note ? (
        // The title, author, linked record and Close stay pinned while a
        // long note (up to 10,000 characters) scrolls between them.
        <DialogContent
          scrollable
          // The pinned header holds the close button: the dialog's own one
          // would scroll away with the note.
          showCloseButton={false}
          initialFocus={headerRef}
          className="sm:max-w-lg"
        >
          <div
            ref={headerRef}
            tabIndex={-1}
            data-slot="crm-note-dialog-header"
            className="sticky -top-6 z-10 -mx-6 -mt-6 flex flex-col gap-4 border-b bg-background px-6 pt-6 pb-4 outline-none"
          >
            <div className="flex items-start gap-2">
              <DialogHeader className="min-w-0 flex-1">
                <DialogTitle>{note.title}</DialogTitle>
                <DialogDescription>
                  {note.authorName || "Mission Control"} · Updated{" "}
                  {formatCrmDate(note.updatedAt) ?? "—"}
                </DialogDescription>
              </DialogHeader>
              <DialogClose
                render={
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Close"
                    className="-me-3 -mt-3 shrink-0"
                  />
                }
              >
                <X aria-hidden="true" />
              </DialogClose>
            </div>
            <dl className="grid grid-cols-2 gap-4 rounded-lg border px-4 py-3">
              <div className="flex min-w-0 flex-col gap-1">
                <dt className="text-xs text-muted-foreground">Linked record</dt>
                <dd className="text-sm">
                  <CrmNoteLinkedRecord note={note} />
                </dd>
              </div>
              <div className="flex min-w-0 flex-col gap-1">
                <dt className="text-xs text-muted-foreground">Visibility</dt>
                <dd className="text-sm">
                  <CrmNoteVisibility note={note} />
                </dd>
              </div>
            </dl>
          </div>
          <p className="text-sm leading-relaxed whitespace-pre-wrap text-foreground">
            {note.body || note.bodyPreview}
          </p>
          {/* The negative inset cancels the dialog's padding, so the row sits
              flush with its bottom edge. */}
          <div
            data-slot="crm-note-dialog-footer"
            className="sticky -bottom-6 z-10 -mx-6 -mb-6 border-t bg-background px-6 pt-4 pb-6"
          >
            <DialogFooter showCloseButton />
          </div>
        </DialogContent>
      ) : null}
    </Dialog>
  );
}

/**
 * Why notes cannot be written right now, or null when they can. The server
 * still authorizes every save; this only keeps the page from offering a form
 * that cannot work. A failed read that is not an access denial keeps writing
 * on, since the save may still succeed.
 */
function crmNoteWriteBlocker(input: {
  configured: boolean;
  missing: readonly string[];
  isLoading: boolean;
  hasNotes: boolean;
  tableError: Error | null | undefined;
}): string | null {
  if (!input.configured || input.missing.length > 0) {
    return "CRM notes are not available in this environment.";
  }
  if (isCrmPermissionError(input.tableError)) {
    return "You need staff CRM access to add notes.";
  }
  if (input.isLoading && !input.hasNotes && !input.tableError) {
    return "Checking your CRM access…";
  }
  return null;
}

/** The muted "(required)" after a field label; the input says it too. */
function RequiredMark() {
  return (
    <span aria-hidden="true" className="font-normal text-muted-foreground">
      (required)
    </span>
  );
}

function CrmNoteComposer({
  createNote,
  isCreatingNote,
  writeBlocker,
}: {
  createNote: ReturnType<typeof useAdminCrmNotesGrid>["createNote"];
  isCreatingNote: boolean;
  writeBlocker: string | null;
}) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const hasInput = title.trim().length > 0 && body.trim().length > 0;
  const canSubmit = hasInput && !writeBlocker;
  const saveHintId = useId();
  const saveHint =
    writeBlocker ?? (hasInput ? null : "Add a title and note to save.");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit) {
      return;
    }

    try {
      await createNote({
        body,
        title,
      });
      setBody("");
      setTitle("");
      toast.success("CRM note saved", {
        description: "Everyone with CRM access can read it now.",
      });
    } catch (error) {
      toast.error("CRM note was not saved", {
        description:
          error instanceof Error ? error.message : "Unexpected CRM error.",
      });
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <h2>New note</h2>
        </CardTitle>
        <CardDescription>
          Saved to your organization&apos;s CRM right away.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <FieldGroup>
            <Field data-disabled={writeBlocker ? true : undefined}>
              <FieldLabel htmlFor={NOTE_TITLE_FIELD_ID}>
                Title <RequiredMark />
              </FieldLabel>
              <Input
                id={NOTE_TITLE_FIELD_ID}
                required
                disabled={!!writeBlocker}
                maxLength={TITLE_MAX}
                aria-describedby="crm-note-title-count"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
              />
              <FieldDescription id="crm-note-title-count">
                {title.length.toLocaleString()} / {TITLE_MAX.toLocaleString()}{" "}
                characters
              </FieldDescription>
            </Field>
            <Field data-disabled={writeBlocker ? true : undefined}>
              <FieldLabel htmlFor="crm-note-body">
                Body <RequiredMark />
              </FieldLabel>
              <Textarea
                id="crm-note-body"
                required
                disabled={!!writeBlocker}
                rows={6}
                maxLength={BODY_MAX}
                aria-describedby="crm-note-body-count"
                value={body}
                onChange={(event) => setBody(event.target.value)}
              />
              <FieldDescription id="crm-note-body-count">
                {body.length.toLocaleString()} / {BODY_MAX.toLocaleString()}{" "}
                characters
              </FieldDescription>
            </Field>
          </FieldGroup>
          <div className="flex flex-col gap-2">
            <Button
              type="submit"
              className="w-full"
              disabled={!canSubmit || isCreatingNote}
              focusableWhenDisabled={isCreatingNote}
              aria-describedby={saveHint ? saveHintId : undefined}
            >
              {isCreatingNote ? <Spinner /> : null}
              {isCreatingNote ? "Saving..." : "Save note"}
            </Button>
            {saveHint ? (
              <p id={saveHintId} className="text-sm text-muted-foreground">
                {saveHint}
              </p>
            ) : null}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

export default function CrmNotesPageClient() {
  const {
    configured,
    createNote,
    hasMore,
    isCreatingNote,
    isFetchingMore,
    isLoading,
    loadMore,
    missing,
    mode,
    notes,
    onRefresh,
    onSearchChange,
    onSortingChange,
    search,
    sorting,
    tableError,
  } = useAdminCrmNotesGrid();
  const isMobile = useIsMobile();
  const writeBlocker = crmNoteWriteBlocker({
    configured,
    hasNotes: notes.length > 0,
    isLoading,
    missing,
    tableError,
  });
  const [openNote, setOpenNoteState] = useState<CrmNoteRow | null>(null);
  // A save toast lingers a few seconds; on phones it would sit over the
  // bottom of the note just opened, so opening a note clears it.
  const setOpenNote = useCallback((note: CrmNoteRow | null) => {
    if (note) toast.dismiss();
    setOpenNoteState(note);
  }, []);
  const columns = useMemo(
    () => getCrmNoteColumns({ onOpenNote: setOpenNote }),
    [setOpenNote],
  );
  const { panelRef, columnVisibility, columnSizing, onColumnVisibilityChange } =
    useCrmGridLayout({
      columns,
      fillColumnId: CRM_NOTE_FILL_COLUMN_ID,
      tiers: CRM_NOTE_COLUMN_TIERS,
    });
  const virtualAllowance = useCrmVirtualAllowance(panelRef);
  const table = useTable({
    features: dataGridFeatures,
    data: notes,
    columns,
    getRowId: (row) => row.id,
    state: { sorting, columnVisibility, columnSizing },
    onSortingChange,
    onColumnVisibilityChange,
    manualSorting: true,
    // The notes hook pages by cursor; show every loaded note.
    manualPagination: true,
  });
  const searching = search.trim().length > 0;
  const searchBox = (
    <DataGridSearch
      label="Search CRM notes"
      placeholder="Search notes…"
      value={search}
      onValueChange={onSearchChange}
      className={isMobile ? "min-w-0 flex-1" : undefined}
    />
  );

  return (
    <PageShell
      title={CRM_NOTES_PAGE_META.title}
      description={CRM_NOTES_PAGE_META.description}
      density={CRM_PAGE_META.density}
      actions={
        <div className="flex flex-wrap items-center gap-2">
          {/* Below xl the composer sits after the list; jump straight to it. */}
          <Button
            size="sm"
            className="xl:hidden"
            disabled={!!writeBlocker}
            onClick={() =>
              document.getElementById(NOTE_TITLE_FIELD_ID)?.focus()
            }
          >
            <Plus aria-hidden="true" />
            New note
          </Button>
          <Link
            href="/crm"
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            <ArrowLeft aria-hidden="true" />
            CRM
          </Link>
          <Link
            href="/crm/relationships"
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            <Network aria-hidden="true" />
            Relationships
          </Link>
        </div>
      }
    >
      <div className="grid items-start gap-6 xl:grid-cols-3">
        <section
          aria-label="Notes list"
          className="relative flex min-w-0 flex-col gap-4 xl:col-span-2"
        >
          {/* The page actions and the toolbar put dozens of Tab stops
              before the first note. */}
          <CrmSkipLink targetId={CRM_NOTES_LIST_ID}>Skip to notes</CrmSkipLink>
          {missing.length > 0 ? (
            <Alert variant="warning">
              <ShieldAlert />
              <AlertTitle>CRM notes unavailable</AlertTitle>
              <AlertDescription>
                CRM notes are not available in this environment.
              </AlertDescription>
            </Alert>
          ) : null}

          {/* Measured so the note column can take the width the others
              leave; the skip link's target. */}
          <div
            ref={panelRef}
            id={CRM_NOTES_LIST_ID}
            tabIndex={-1}
            className="min-w-0 scroll-mt-4 outline-none"
          >
            <DataGridPanel
              table={table}
              recordCount={notes.length}
              label="CRM notes"
              isLoading={isLoading}
              tableLayout={{ width: "fixed" }}
              // Long lists scroll inside the panel and load the next page
              // near the end; phones get a "Load more" button.
              virtual={crmVirtualOptions({
                rowCount: notes.length,
                rowHeight: NOTE_ROW_HEIGHT,
                hasMore,
                isFetchingMore,
                loadMore,
                noun: ["note", "notes"],
                allowance: virtualAllowance,
              })}
              // An access denial reads "Access required", without a Retry.
              error={crmPanelError(tableError, {
                resource: "CRM notes",
                onRetry: () => void onRefresh(),
              })}
              empty={
                <Empty>
                  <EmptyHeader>
                    <EmptyMedia variant="icon">
                      {searching ? (
                        <SearchX aria-hidden="true" />
                      ) : (
                        <FileText aria-hidden="true" />
                      )}
                    </EmptyMedia>
                    <EmptyTitle>No CRM notes</EmptyTitle>
                    <EmptyDescription>
                      {searching
                        ? "No notes match this search."
                        : "Notes you save appear here."}
                    </EmptyDescription>
                  </EmptyHeader>
                </Empty>
              }
              renderMobileRow={(row: DataGridRow<CrmNoteRow>) => (
                <CrmNoteMobileRow note={row.original} onOpen={setOpenNote} />
              )}
              toolbar={
                <>
                  {isMobile ? (
                    // Phones keep Refresh beside the search as a named icon
                    // button; the cards have no headers, so sorting follows.
                    <>
                      <div className="flex w-full min-w-0 items-center gap-2">
                        {searchBox}
                        <CrmRefreshButton
                          compact
                          refreshing={isLoading}
                          onRefresh={onRefresh}
                        />
                      </div>
                      <DataGridSortSelect
                        label="Sort notes"
                        options={CRM_NOTE_SORT_LABELS}
                        fallback="updatedAt:desc"
                        sorting={sorting}
                        onSortingChange={onSortingChange}
                      />
                    </>
                  ) : (
                    <>
                      {searchBox}
                      <DataGridToolbarSpacer />
                      <div className="ms-auto flex items-center gap-2">
                        <CrmRefreshButton
                          refreshing={isLoading}
                          onRefresh={onRefresh}
                        />
                        {/* Columns only exist in the table layout. */}
                        <DataGridViewOptions table={table} />
                      </div>
                    </>
                  )}
                </>
              }
              // Only with something to say: an empty list ends at the card
              // edge rather than a blank footer band.
              footer={
                notes.length > 0 || !configured ? (
                  <div className="flex flex-col gap-4">
                    <CrmNotesCount count={notes.length} searching={searching} />
                    {/* Provenance only when it needs attention. */}
                    {configured ? null : (
                      <CrmDataSources mode={mode} configured={configured} />
                    )}
                  </div>
                ) : undefined
              }
            />
          </div>
        </section>

        <aside aria-label="New note" className="min-w-0">
          <CrmNoteComposer
            createNote={createNote}
            isCreatingNote={isCreatingNote}
            writeBlocker={writeBlocker}
          />
        </aside>
      </div>

      <CrmNoteDialog note={openNote} onClose={() => setOpenNote(null)} />
    </PageShell>
  );
}
