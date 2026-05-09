"use client";

import { Button } from "@asym/ui/components/shadcn/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@asym/ui/components/shadcn/command";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@asym/ui/components/shadcn/dialog";
import { cn } from "@asym/ui/lib/utils";
import { Check, Clock, Tag, UserCheck } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";

import { useSupportLabels } from "../../hooks/use-support-labels";
import {
  useAssignSupportConversation,
  useSetSupportConversationStatus,
  useSnoozeSupportConversation,
  useToggleSupportLabel,
} from "../../hooks/use-support-mutations";
import {
  runBulkMutations,
  type BulkMutationReport,
} from "../../lib/bulk-mutations";
import { useCurrentSupportAgentId } from "../../lib/current-agent";

import type {
  SupportConversation,
  SupportLabel,
  SupportLabelTone,
} from "../../types";

interface FloatingBarAction {
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  onClick: (rows: SupportConversation[]) => void;
  variant?: "default" | "destructive";
}

interface UseBulkActionsReturn {
  actions: FloatingBarAction[];
  /** Overlays (label popover, etc.) the table view must render once. */
  overlays: React.ReactNode;
}

const HOUR_MS = 60 * 60 * 1000;

const TONE_CLASSES: Record<SupportLabelTone, string> = {
  zinc: "bg-zinc-100 text-zinc-700 ring-zinc-200",
  blue: "bg-blue-50 text-blue-700 ring-blue-200",
  amber: "bg-amber-50 text-amber-700 ring-amber-200",
  rose: "bg-rose-50 text-rose-700 ring-rose-200",
  emerald: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  violet: "bg-violet-50 text-violet-700 ring-violet-200",
};

function toastBulkReport(
  report: BulkMutationReport,
  successMessage: string,
  failureMessage: string,
) {
  if (report.total === 0) return;
  if (report.failed === 0) {
    toast.success(successMessage);
    return;
  }
  if (report.succeeded > 0) {
    toast.warning(
      `${failureMessage} ${report.succeeded}/${report.total} succeeded.`,
    );
    return;
  }
  toast.error(report.firstError?.message ?? failureMessage);
}

/**
 * Bulk action bar wired into `DataTableResponsive.floatingBarActions`. Each
 * action delegates to one of the Phase 2 mutation hooks; each hook already
 * invalidates the right cache keys so the table and board converge on the
 * next paint.
 *
 * Phase 5 adds the "Add label..." action, which opens a managed dialog so
 * the agent can pick a label before any mutation fires.
 */
export function useSupportBulkActions(): UseBulkActionsReturn {
  const currentAgentId = useCurrentSupportAgentId();
  const setStatus = useSetSupportConversationStatus();
  const snooze = useSnoozeSupportConversation();
  const assign = useAssignSupportConversation();
  const toggleLabel = useToggleSupportLabel();
  const { data: labels } = useSupportLabels();

  const [pendingLabelRows, setPendingLabelRows] = React.useState<
    SupportConversation[]
  >([]);
  const isLabelDialogOpen = pendingLabelRows.length > 0;

  const closeLabelDialog = () => setPendingLabelRows([]);

  const applyLabel = async (label: SupportLabel) => {
    const rows = pendingLabelRows;
    closeLabelDialog();
    if (rows.length === 0) return;
    const report = await runBulkMutations(rows, (row) =>
      toggleLabel.mutateAsync({
        conversationId: row.id,
        labelId: label.id,
        mode: "add",
      }),
    );
    toastBulkReport(
      report,
      rows.length === 1
        ? `Added "${label.name}" to 1 conversation.`
        : `Added "${label.name}" to ${rows.length} conversations.`,
      `Could not apply "${label.name}" to every conversation.`,
    );
  };

  const actions: FloatingBarAction[] = [
    {
      label: "Mark resolved",
      icon: Check,
      onClick: (rows) => {
        void runBulkMutations(rows, (row) =>
          setStatus.mutateAsync({
            conversationId: row.id,
            status: "resolved",
          }),
        ).then((report) =>
          toastBulkReport(
            report,
            rows.length === 1
              ? "Marked 1 conversation resolved."
              : `Marked ${rows.length} conversations resolved.`,
            "Could not mark every conversation resolved.",
          ),
        );
      },
    },
    {
      label: "Mark pending",
      icon: Clock,
      onClick: (rows) => {
        void runBulkMutations(rows, (row) =>
          setStatus.mutateAsync({
            conversationId: row.id,
            status: "pending",
          }),
        ).then((report) =>
          toastBulkReport(
            report,
            rows.length === 1
              ? "Marked 1 conversation pending."
              : `Marked ${rows.length} conversations pending.`,
            "Could not mark every conversation pending.",
          ),
        );
      },
    },
    {
      label: "Snooze 24h",
      icon: Clock,
      onClick: (rows) => {
        const snoozedUntil = new Date(Date.now() + 24 * HOUR_MS).toISOString();
        void runBulkMutations(rows, (row) =>
          snooze.mutateAsync({
            conversationId: row.id,
            snoozedUntil,
          }),
        ).then((report) =>
          toastBulkReport(
            report,
            rows.length === 1
              ? "Snoozed 1 conversation for 24h."
              : `Snoozed ${rows.length} conversations for 24h.`,
            "Could not snooze every conversation.",
          ),
        );
      },
    },
    {
      label: "Assign to me",
      icon: UserCheck,
      onClick: (rows) => {
        if (!currentAgentId) {
          toast.error("No agent matched the current Mission Control user yet.");
          return;
        }
        void runBulkMutations(rows, (row) =>
          assign.mutateAsync({
            conversationId: row.id,
            assigneeAgentId: currentAgentId,
          }),
        ).then((report) =>
          toastBulkReport(
            report,
            rows.length === 1
              ? "Assigned 1 conversation to you."
              : `Assigned ${rows.length} conversations to you.`,
            "Could not assign every conversation.",
          ),
        );
      },
    },
    {
      label: "Add label...",
      icon: Tag,
      onClick: (rows) => {
        if (rows.length === 0) return;
        setPendingLabelRows(rows);
      },
    },
  ];

  const overlays = (
    <Dialog
      open={isLabelDialogOpen}
      onOpenChange={(open) => {
        if (!open) closeLabelDialog();
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add a label</DialogTitle>
          <DialogDescription>
            Apply a label to{" "}
            <span className="font-medium">{pendingLabelRows.length}</span>{" "}
            selected conversation
            {pendingLabelRows.length === 1 ? "" : "s"}.
          </DialogDescription>
        </DialogHeader>
        <Command>
          <CommandInput placeholder="Search labels..." className="h-9" />
          <CommandList>
            <CommandEmpty>No labels.</CommandEmpty>
            <CommandGroup>
              {labels.map((label) => (
                <CommandItem
                  key={label.id}
                  value={label.slug}
                  onSelect={() => void applyLabel(label)}
                  className="flex items-center gap-2"
                >
                  <span
                    className={cn(
                      "inline-flex h-5 items-center rounded-md px-1.5 text-[10px] font-semibold ring-1 ring-inset",
                      TONE_CLASSES[label.tone],
                    )}
                  >
                    {label.name}
                  </span>
                  {label.description ? (
                    <span className="truncate text-[11px] text-zinc-500">
                      {label.description}
                    </span>
                  ) : null}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={closeLabelDialog}
          >
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  return { actions, overlays };
}
