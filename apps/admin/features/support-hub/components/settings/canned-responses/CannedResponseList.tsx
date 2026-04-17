"use client";

import { Button } from "@asym/ui/components/shadcn/button";
import { MessageSquareText, Pencil, Plus, Trash2 } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";

import { CannedResponseForm } from "./CannedResponseForm";
import { useSupportCannedResponses } from "../../../hooks/use-support-canned-responses";
import { useDeleteSupportCannedResponse } from "../../../hooks/use-support-mutations";
import { SupportEmptySection } from "../../workspace/SupportEmptySection";
import { SettingsPanel } from "../SettingsPanel";

import type { SupportCannedResponse } from "../../../types";

export function CannedResponseList() {
  const { data: responses } = useSupportCannedResponses();
  const deleteResponse = useDeleteSupportCannedResponse();
  const [editing, setEditing] = React.useState<
    SupportCannedResponse | "new" | null
  >(null);

  const editingResponse = editing && editing !== "new" ? editing : null;

  const handleDelete = async (row: SupportCannedResponse) => {
    if (!window.confirm(`Delete canned response "${row.title}"?`)) return;
    try {
      await deleteResponse.mutateAsync({ id: row.id });
      toast.success("Canned response deleted.");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Could not delete the canned response.",
      );
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <SettingsPanel
        title="Canned responses"
        description="Library of reusable replies. Insert with / inside the composer."
        actions={
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setEditing("new")}
            className="h-8 gap-1.5 rounded-lg px-3 text-xs"
          >
            <Plus className="size-3.5" />
            New response
          </Button>
        }
      >
        {responses.length === 0 ? (
          <SupportEmptySection
            icon={<MessageSquareText className="size-4" />}
            title="No canned responses yet"
            description="Create your first reply template to speed up donor care work."
          />
        ) : (
          <ul className="flex flex-col divide-y divide-zinc-100">
            {responses.map((row) => (
              <li
                key={row.id}
                className="flex flex-wrap items-start gap-3 py-3"
              >
                <span className="flex size-8 items-center justify-center rounded-lg bg-zinc-100 text-zinc-500">
                  <MessageSquareText className="size-4" />
                </span>
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <span className="text-[13px] font-semibold text-zinc-900">
                    {row.title}
                    <span className="ml-2 inline-flex items-center rounded-md border border-zinc-200 bg-zinc-50 px-1.5 py-0.5 font-mono text-[10px] text-zinc-500">
                      /{row.shortCode}
                    </span>
                  </span>
                  <span className="truncate text-[11px] text-zinc-500">
                    {row.bodyText.slice(0, 160)}
                    {row.bodyText.length > 160 ? "…" : ""}
                  </span>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setEditing(row)}
                  aria-label={`Edit ${row.title}`}
                  className="size-8 text-zinc-500 hover:text-zinc-900"
                >
                  <Pencil className="size-3.5" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => void handleDelete(row)}
                  aria-label={`Delete ${row.title}`}
                  className="size-8 text-rose-500 hover:bg-rose-50 hover:text-rose-700"
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </SettingsPanel>

      {editing ? (
        <CannedResponseForm
          response={editingResponse}
          onSaved={() => setEditing(null)}
          onCancel={() => setEditing(null)}
        />
      ) : null}
    </div>
  );
}
