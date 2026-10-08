"use client";

import { Button } from "@asym/ui/components/shadcn/button";
import { Pencil, PenLine, Plus, Star, Trash2 } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";

import { SignatureForm } from "./SignatureForm";
import { useSupportAgents } from "../../../hooks/use-support-agents";
import {
  useDeleteSupportSignature,
  useSetDefaultSupportSignature,
} from "../../../hooks/use-support-mutations";
import { useSupportSignatures } from "../../../hooks/use-support-signatures";
import { SupportEmptySection } from "../../workspace/SupportEmptySection";
import { SettingsPanel } from "../SettingsPanel";

import type { SupportSignature } from "../../../types";

export function SignatureList() {
  const { data: signatures } = useSupportSignatures();
  const { data: agents } = useSupportAgents();
  const deleteSig = useDeleteSupportSignature();
  const setDefault = useSetDefaultSupportSignature();
  const [editing, setEditing] = React.useState<SupportSignature | "new" | null>(
    null,
  );

  const editingRow = editing && editing !== "new" ? editing : null;

  const ownerName = (ownerAgentId: string | null): string => {
    if (!ownerAgentId) return "Workspace";
    return agents.find((agent) => agent.id === ownerAgentId)?.name ?? "Unknown";
  };

  const handleDelete = async (row: SupportSignature) => {
    if (!window.confirm(`Delete signature "${row.name}"?`)) return;
    try {
      await deleteSig.mutateAsync({ id: row.id });
      toast.success("Signature deleted.");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Could not delete the signature.",
      );
    }
  };

  const handleMakeDefault = async (row: SupportSignature) => {
    try {
      await setDefault.mutateAsync({ id: row.id });
      toast.success(
        row.ownerAgentId
          ? `Default signature for ${ownerName(row.ownerAgentId)} updated.`
          : "Workspace signature set as default.",
      );
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Could not update the default.",
      );
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <SettingsPanel
        title="Signatures"
        description="Outbound replies append the default signature. Agent-owned signatures override the workspace default."
        actions={
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setEditing("new")}
            className="rounded-lg text-xs"
          >
            <Plus className="size-3.5" />
            New signature
          </Button>
        }
      >
        {signatures.length === 0 ? (
          <SupportEmptySection
            icon={<PenLine className="size-4" />}
            title="No signatures yet"
            description="Create a workspace signature first, then override per agent."
          />
        ) : (
          <ul className="flex flex-col divide-y divide-border">
            {signatures.map((row) => (
              <li
                key={row.id}
                className="flex flex-wrap items-center gap-3 py-2"
              >
                <span className="flex size-8 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                  <PenLine className="size-4" />
                </span>
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="text-xs font-semibold text-foreground">
                    {row.name}{" "}
                    {row.isDefault ? (
                      <span className="ml-1 inline-flex h-4 items-center rounded-md bg-primary px-1.5 text-xs font-black uppercase tracking-wider text-primary-foreground">
                        Default
                      </span>
                    ) : null}
                  </span>
                  <span className="truncate text-xs text-muted-foreground">
                    {ownerName(row.ownerAgentId)} · {row.bodyText.slice(0, 80)}
                    {row.bodyText.length > 80 ? "…" : ""}
                  </span>
                </div>
                {!row.isDefault ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => void handleMakeDefault(row)}
                    aria-label={`Make ${row.name} default`}
                    className="size-8 text-warning hover:bg-warning/10 hover:text-warning"
                  >
                    <Star className="size-3.5" />
                  </Button>
                ) : null}
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setEditing(row)}
                  aria-label={`Edit ${row.name}`}
                  className="size-8 text-muted-foreground hover:text-foreground"
                >
                  <Pencil className="size-3.5" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => void handleDelete(row)}
                  aria-label={`Delete ${row.name}`}
                  className="size-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </SettingsPanel>
      {editing ? (
        <SignatureForm
          signature={editingRow}
          onSaved={() => setEditing(null)}
          onCancel={() => setEditing(null)}
        />
      ) : null}
    </div>
  );
}
