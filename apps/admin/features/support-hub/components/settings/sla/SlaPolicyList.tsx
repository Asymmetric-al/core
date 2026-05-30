"use client";

import { Button } from "@asym/ui/components/shadcn/button";
import { Gauge, Pencil, Plus, Star, Trash2 } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";

import { SlaPolicyForm } from "./SlaPolicyForm";
import { useSupportSlaPolicies } from "../../../hooks/use-support-inbox-settings";
import {
  useDeleteSupportSlaPolicy,
  useSetDefaultSupportSlaPolicy,
} from "../../../hooks/use-support-mutations";
import { SupportEmptySection } from "../../workspace/SupportEmptySection";
import { SettingsPanel } from "../SettingsPanel";

import type { SupportSlaPolicy } from "../../../types";

export function SlaPolicyList() {
  const query = useSupportSlaPolicies();
  const deletePolicy = useDeleteSupportSlaPolicy();
  const setDefault = useSetDefaultSupportSlaPolicy();
  const [editing, setEditing] = React.useState<SupportSlaPolicy | "new" | null>(
    null,
  );

  const rows = (query.data ?? []) as SupportSlaPolicy[];
  const editingRow = editing && editing !== "new" ? editing : null;

  const handleDelete = async (row: SupportSlaPolicy) => {
    if (!window.confirm(`Delete SLA policy "${row.name}"?`)) return;
    try {
      await deletePolicy.mutateAsync({ id: row.id });
      toast.success("SLA policy deleted.");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Could not delete the SLA policy.",
      );
    }
  };

  const handleMakeDefault = async (row: SupportSlaPolicy) => {
    try {
      await setDefault.mutateAsync({ id: row.id });
      toast.success(`"${row.name}" is now the default policy.`);
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
        title="SLA policies"
        description="First reply, next reply, and resolution targets for donor conversations."
        actions={
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setEditing("new")}
            className="h-8 gap-1.5 rounded-lg px-3 text-xs"
          >
            <Plus className="size-3.5" />
            New policy
          </Button>
        }
      >
        {rows.length === 0 ? (
          <SupportEmptySection
            icon={<Gauge className="size-4" />}
            title="No SLA policies yet"
            description="Create a policy to set response and resolution targets."
          />
        ) : (
          <ul className="flex flex-col divide-y divide-zinc-100">
            {rows.map((row) => (
              <li
                key={row.id}
                className="flex flex-wrap items-center gap-3 py-2"
              >
                <span className="flex size-8 items-center justify-center rounded-lg bg-zinc-100 text-zinc-500">
                  <Gauge className="size-4" />
                </span>
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="text-[13px] font-semibold text-zinc-900">
                    {row.name}{" "}
                    {row.isDefault ? (
                      <span className="ml-1 inline-flex h-4 items-center rounded-md bg-zinc-900 px-1.5 text-[9px] font-black uppercase tracking-wider text-white">
                        Default
                      </span>
                    ) : null}
                  </span>
                  <span className="text-[11px] text-zinc-500">
                    First {row.firstResponseMinutes}min · Next{" "}
                    {row.nextResponseMinutes}min · Resolve{" "}
                    {row.resolutionMinutes}min
                  </span>
                </div>
                {!row.isDefault ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => void handleMakeDefault(row)}
                    aria-label={`Make ${row.name} default`}
                    className="size-8 text-amber-500 hover:bg-amber-50 hover:text-amber-700"
                  >
                    <Star className="size-3.5" aria-hidden="true" />
                  </Button>
                ) : null}
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setEditing(row)}
                  aria-label={`Edit ${row.name}`}
                  className="size-8 text-zinc-500 hover:text-zinc-900"
                >
                  <Pencil className="size-3.5" aria-hidden="true" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => void handleDelete(row)}
                  aria-label={`Delete ${row.name}`}
                  className="size-8 text-rose-500 hover:bg-rose-50 hover:text-rose-700"
                >
                  <Trash2 className="size-3.5" aria-hidden="true" />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </SettingsPanel>
      {editing ? (
        <SlaPolicyForm
          policy={editingRow}
          onSaved={() => setEditing(null)}
          onCancel={() => setEditing(null)}
        />
      ) : null}
    </div>
  );
}
