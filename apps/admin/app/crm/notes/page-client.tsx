"use client";

import { useAdminCrmNotesGrid } from "@asym/database/hooks";
import { PageShell } from "@asym/ui/components/primitives/page-shell";
import { Alert } from "@asym/ui/components/shadcn/alert";
import { Badge } from "@asym/ui/components/shadcn/badge";
import { Button } from "@asym/ui/components/shadcn/button";
import { DataTableResponsive } from "@asym/ui/components/shadcn/data-table";
import { Input } from "@asym/ui/components/shadcn/input";
import { Label } from "@asym/ui/components/shadcn/label";
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
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { getCrmNoteColumns } from "./columns";

import type { FormEvent } from "react";

export default function CrmNotesPageClient() {
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
      toast.success("CRM note queued", {
        description: "It will sync through the CRM queue.",
      });
    } catch (error) {
      toast.error("CRM note was not queued", {
        description:
          error instanceof Error ? error.message : "Unexpected CRM error.",
      });
    }
  }

  return (
    <PageShell
      title="CRM Notes"
      description="Relationship notes for staff follow-up."
      actions={
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2" asChild>
            <Link href="/crm">
              <ArrowLeft className="size-4" />
              CRM
            </Link>
          </Button>
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => void onRefresh()}
          >
            <RefreshCcw className="size-4" />
            Refresh
          </Button>
        </div>
      }
    >
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <section className="min-w-0 space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className={cn(
                  "h-6 rounded-md text-[10px] font-semibold uppercase tracking-wide shadow-none",
                  configured
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                    : "border-amber-200 bg-amber-50 text-amber-700",
                )}
              >
                {mode === "twenty" ? "CRM live" : "Queue only"}
              </Badge>
              {rollback ? (
                <Badge
                  variant="outline"
                  className="h-6 rounded-md text-[10px] font-semibold uppercase tracking-wide shadow-none"
                >
                  Rollback: {rollback.existingCrmPath}
                </Badge>
              ) : null}
            </div>
            <div className="relative w-full sm:max-w-sm">
              <FileText className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                aria-label="Search CRM notes"
                className="pl-9"
                placeholder="Search notes"
                value={search}
                onChange={(event) => onSearchChange(event.target.value)}
              />
            </div>
          </div>

          {missing.length > 0 ? (
            <Alert className="rounded-lg border-amber-200 bg-amber-50 text-amber-900">
              <ShieldAlert className="size-4" />
              <div className="text-sm">
                CRM reads are not configured in this environment. New notes can
                still be queued.
              </div>
            </Alert>
          ) : null}

          {isPermissionDenied ? (
            <Alert className="rounded-lg border-destructive/30 bg-destructive/10 text-destructive">
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
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="mb-4 rounded-lg bg-muted p-4">
                  <FileText className="size-10 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold">No CRM notes</h3>
                <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                  {tableError
                    ? tableError.message
                    : "No Twenty notes match the current tenant and search."}
                </p>
              </div>
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
                      <Badge
                        variant="outline"
                        className="rounded-md text-[9px]"
                      >
                        {note.source}
                      </Badge>
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
                Queued with staff context for CRM sync.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="crm-note-title">Title</Label>
              <Input
                id="crm-note-title"
                maxLength={160}
                value={title}
                onChange={(event) => setTitle(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="crm-note-body">Body</Label>
              <Textarea
                id="crm-note-body"
                className="min-h-40 resize-y"
                maxLength={10000}
                value={body}
                onChange={(event) => setBody(event.target.value)}
              />
            </div>
            <Button
              type="submit"
              className="w-full gap-2"
              disabled={!canSubmit || isCreatingNote}
            >
              <Send className="size-4" />
              {isCreatingNote ? "Queueing..." : "Queue note"}
            </Button>
          </form>
        </aside>
      </div>
    </PageShell>
  );
}
