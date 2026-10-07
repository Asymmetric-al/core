"use client";

import { useAdminCrmNotesGrid } from "@asym/database/hooks";
import { PageShell } from "@asym/ui/components/primitives/page-shell";
import { Alert } from "@asym/ui/components/shadcn/alert";
import { Badge } from "@asym/ui/components/shadcn/badge";
import { Button, buttonVariants } from "@asym/ui/components/shadcn/button";
import { DataTableResponsive } from "@asym/ui/components/shadcn/data-table";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@asym/ui/components/shadcn/empty";
import {
  Field,
  FieldGroup,
  FieldLabel,
} from "@asym/ui/components/shadcn/field";
import { Input } from "@asym/ui/components/shadcn/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@asym/ui/components/shadcn/input-group";
import { Textarea } from "@asym/ui/components/shadcn/textarea";
import { cn } from "@asym/ui/lib/utils";
import {
  ArrowLeft,
  FileText,
  RefreshCcw,
  Send,
  ShieldAlert,
} from "lucide-react";
import Link from "next/link";
import { useId, useMemo, useState } from "react";
import { toast } from "sonner";

import { getCrmNoteColumns } from "./columns";

import type { FormEvent } from "react";

import { CRM_NOTES_PAGE_META } from "@/components/table-page-meta";

export default function CrmNotesPageClient() {
  const saveLabelId = useId();
  const {
    configured,
    createNote,
    isCreatingNote,
    isLoading,
    missing,
    mode,
    notes,
    onRefresh,
    onSearchChange,
    onSortingChange,
    rollback,
    search,
    sorting,
    tableError,
  } = useAdminCrmNotesGrid();
  const columns = useMemo(() => getCrmNoteColumns(), []);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const canSubmit = title.trim().length > 0 && body.trim().length > 0;
  const isPermissionDenied =
    tableError?.message.toLowerCase().includes("forbidden") ||
    tableError?.message.toLowerCase().includes("unauthorized");

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
        description: "The note is immediately readable for this tenant.",
      });
    } catch (error) {
      toast.error("CRM note was not saved", {
        description:
          error instanceof Error ? error.message : "Unexpected CRM error.",
      });
    }
  }

  return (
    <PageShell
      title={CRM_NOTES_PAGE_META.title}
      description={CRM_NOTES_PAGE_META.description}
      density={CRM_NOTES_PAGE_META.density}
      actions={
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/crm"
            className={cn(buttonVariants({ variant: "outline" }), "gap-2")}
          >
            <ArrowLeft className="size-4" />
            CRM
          </Link>
          <Button variant="outline" onClick={() => void onRefresh()}>
            <RefreshCcw className="size-4" />
            Refresh
          </Button>
        </div>
      }
    >
      <div className="grid gap-6 xl:grid-cols-3">
        <section className="min-w-0 space-y-4 xl:col-span-2">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <Badge variant={configured ? "success" : "warning"}>
                {mode === "local" ? "Asym Postgres" : "CRM"}
              </Badge>
              {rollback ? (
                <Badge variant="outline">
                  Rollback: {rollback.existingCrmPath}
                </Badge>
              ) : null}
            </div>
            <InputGroup className="w-full sm:max-w-sm">
              <InputGroupAddon>
                <FileText />
              </InputGroupAddon>
              <InputGroupInput
                aria-label="Search CRM notes"
                placeholder="Search notes"
                value={search}
                onChange={(event) => onSearchChange(event.target.value)}
              />
            </InputGroup>
          </div>

          {missing.length > 0 ? (
            <Alert variant="warning">
              <ShieldAlert className="size-4" />
              <div className="text-sm">
                CRM notes are not available in this environment. Notes remain
                owned by Asym Postgres.
              </div>
            </Alert>
          ) : null}

          {isPermissionDenied ? (
            <Alert variant="destructive">
              <ShieldAlert className="size-4" />
              <div className="text-sm">
                Your account does not have staff CRM access for this tenant.
              </div>
            </Alert>
          ) : null}

          <DataTableResponsive
            columns={columns}
            data={notes}
            getRowId={(row) => row.id}
            isLoading={isLoading}
            onRefresh={() => void onRefresh()}
            onSortingChange={onSortingChange}
            emptyState={
              <Empty>
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <FileText />
                  </EmptyMedia>
                  <EmptyTitle>No CRM notes</EmptyTitle>
                  <EmptyDescription>
                    {tableError
                      ? tableError.message
                      : "No CRM notes match the current tenant and search."}
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            }
            config={{
              enableColumnVisibility: true,
              enableFilters: false,
              enablePagination: false,
              enableRowSelection: false,
              enableSorting: true,
              enableViewToggle: false,
              manualSorting: true,
              mobileBreakpoint: 0,
              stickyHeader: true,
              virtualization: {
                containerHeight: 640,
                enabled: true,
                estimateSize: 76,
                overscan: 10,
              },
            }}
            initialState={{
              sorting,
            }}
            mobileCardConfig={{
              primaryField: "title",
              secondaryField: "bodyPreview",
              badgeField: "source",
              renderCard: (row) => {
                const note = row.original;
                return (
                  <div className="space-y-3 p-4 text-left">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">
                          {note.title}
                        </p>
                        <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                          {note.bodyPreview}
                        </p>
                      </div>
                      <Badge variant="outline">{note.source}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {note.authorName ?? "Mission Control"}
                    </p>
                  </div>
                );
              },
            }}
          />
        </section>

        <aside className="rounded-lg border border-border bg-card p-4">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-1">
              <h2 className="text-base font-semibold">New note</h2>
              <p className="text-xs text-muted-foreground">
                Saved immediately in Asym Postgres for this tenant.
              </p>
            </div>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="crm-note-title">Title</FieldLabel>
                <Input
                  id="crm-note-title"
                  maxLength={160}
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="crm-note-body">Body</FieldLabel>
                <Textarea
                  id="crm-note-body"
                  className="min-h-40 resize-y"
                  maxLength={10000}
                  value={body}
                  onChange={(event) => setBody(event.target.value)}
                />
              </Field>
            </FieldGroup>
            <Button
              type="submit"
              className="w-full"
              disabled={!canSubmit || isCreatingNote}
              focusableWhenDisabled={isCreatingNote}
              aria-labelledby={saveLabelId}
            >
              <Send className="size-4" />
              <span id={saveLabelId}>
                {isCreatingNote ? "Saving..." : "Save note"}
              </span>
            </Button>
          </form>
        </aside>
      </div>
    </PageShell>
  );
}
