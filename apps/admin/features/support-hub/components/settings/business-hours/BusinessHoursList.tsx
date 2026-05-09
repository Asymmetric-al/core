"use client";

import { useSupportBusinessHoursLive } from "@asym/database/hooks";
import { Button } from "@asym/ui/components/shadcn/button";
import { Clock, Pencil, Plus, Trash2 } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";

import { BusinessHoursForm } from "./BusinessHoursForm";
import { useDeleteSupportBusinessHours } from "../../../hooks/use-support-mutations";
import { SupportEmptySection } from "../../workspace/SupportEmptySection";
import { SettingsPanel } from "../SettingsPanel";

import type { SupportBusinessHours } from "../../../types";

export function BusinessHoursList() {
  const query = useSupportBusinessHoursLive();
  const deleteHours = useDeleteSupportBusinessHours();
  const [editing, setEditing] = React.useState<
    SupportBusinessHours | "new" | null
  >(null);

  const rows = (query.data ?? []) as SupportBusinessHours[];
  const editingHours = editing && editing !== "new" ? editing : null;

  const handleDelete = async (row: SupportBusinessHours) => {
    if (!window.confirm(`Delete business hours "${row.name}"?`)) return;
    try {
      await deleteHours.mutateAsync({ id: row.id });
      toast.success("Business hours deleted.");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Could not delete business hours.",
      );
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <SettingsPanel
        title="Business hours"
        description="Define when donor care staff are on the clock. Drives SLA timers and off-hours automation."
        actions={
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setEditing("new")}
            className="h-8 gap-1.5 rounded-lg px-3 text-xs"
          >
            <Plus className="size-3.5" />
            New schedule
          </Button>
        }
      >
        {rows.length === 0 ? (
          <SupportEmptySection
            icon={<Clock className="size-4" />}
            title="No business hours yet"
            description="Create a schedule to enable SLA timers and the business-hours report filter."
          />
        ) : (
          <ul className="flex flex-col divide-y divide-zinc-100">
            {rows.map((row) => (
              <li
                key={row.id}
                className="flex flex-wrap items-center gap-3 py-2"
              >
                <span className="flex size-8 items-center justify-center rounded-lg bg-zinc-100 text-zinc-500">
                  <Clock className="size-4" />
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
                    {row.timezone} ·{" "}
                    {row.weeklySchedule.filter((entry) => entry.enabled).length}{" "}
                    working days · {row.holidays.length} holidays
                  </span>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setEditing(row)}
                  aria-label={`Edit ${row.name}`}
                  className="size-8 text-zinc-500 hover:text-zinc-900"
                >
                  <Pencil className="size-3.5" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => void handleDelete(row)}
                  aria-label={`Delete ${row.name}`}
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
        <BusinessHoursForm
          hours={editingHours}
          onSaved={() => setEditing(null)}
          onCancel={() => setEditing(null)}
        />
      ) : null}
    </div>
  );
}
