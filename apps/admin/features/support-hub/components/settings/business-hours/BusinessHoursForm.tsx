"use client";

import { Button } from "@asym/ui/components/shadcn/button";
import { Input } from "@asym/ui/components/shadcn/input";
import { Label } from "@asym/ui/components/shadcn/label";
import { Switch } from "@asym/ui/components/shadcn/switch";
import { Plus, Trash2 } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";

import { useSaveSupportBusinessHours } from "../../../hooks/use-support-mutations";
import { SettingsPanel } from "../SettingsPanel";
import { SettingsRow } from "../SettingsRow";
import { SettingsToolbar } from "../SettingsToolbar";

import type { SupportBusinessHours } from "../../../types";

function makeDisplayDate(value?: string | number | Date): Date {
  return value === undefined
    ? new globalThis.Date()
    : new globalThis.Date(value);
}

function makeDisplayTimestamp(): number {
  return globalThis.Date.now();
}

const DAYS = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
] as const;

interface BusinessHoursFormProps {
  hours?: SupportBusinessHours | null;
  onSaved?: (id: string) => void;
  onCancel?: () => void;
}

export function BusinessHoursForm({
  hours,
  onSaved,
  onCancel,
}: BusinessHoursFormProps) {
  const saveHours = useSaveSupportBusinessHours();
  const [name, setName] = React.useState(
    hours?.name ?? "Standard support hours",
  );
  const [timezone, setTimezone] = React.useState(hours?.timezone ?? "UTC");
  const [schedule, setSchedule] = React.useState(
    hours?.weeklySchedule ?? defaultSchedule(),
  );
  const [holidays, setHolidays] = React.useState(hours?.holidays ?? []);
  const [isDefault, setIsDefault] = React.useState(hours?.isDefault ?? false);

  const isDirty = React.useMemo(
    () =>
      !hours ||
      name !== hours.name ||
      timezone !== hours.timezone ||
      JSON.stringify(schedule) !== JSON.stringify(hours.weeklySchedule) ||
      JSON.stringify(holidays) !== JSON.stringify(hours.holidays) ||
      isDefault !== hours.isDefault,
    [hours, name, timezone, schedule, holidays, isDefault],
  );

  const handleSave = async () => {
    try {
      const id = await saveHours.mutateAsync({
        id: hours?.id,
        name: name.trim(),
        timezone: timezone.trim(),
        weeklySchedule: schedule,
        holidays,
        isDefault,
      });
      toast.success(
        hours ? "Business hours updated." : "Business hours created.",
      );
      onSaved?.(id);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Could not save the business hours.",
      );
    }
  };

  return (
    <SettingsPanel
      title={hours ? `Edit "${hours.name}"` : "New business hours"}
      description="Weekly schedule + holidays used by SLA timers and reports."
    >
      <SettingsRow label="Name" htmlFor="biz-name">
        <Input
          id="biz-name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          maxLength={60}
        />
      </SettingsRow>
      <SettingsRow label="Timezone" htmlFor="biz-tz">
        <Input
          id="biz-tz"
          value={timezone}
          onChange={(event) => setTimezone(event.target.value)}
          placeholder="America/Chicago"
          maxLength={60}
        />
      </SettingsRow>
      <div className="rounded-xl border border-zinc-100">
        <div className="border-b border-zinc-100 px-3 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">
          Weekly schedule
        </div>
        <ul className="flex flex-col divide-y divide-zinc-100">
          {DAYS.map((day) => {
            const entry =
              schedule.find((e) => e.day === day) ??
              ({
                day,
                enabled: false,
                openTime: "09:00",
                closeTime: "17:00",
              } as const);
            return (
              <li
                key={day}
                className="flex flex-wrap items-center gap-3 px-3 py-2"
              >
                <span className="w-24 text-[12px] font-medium capitalize text-zinc-700">
                  {day}
                </span>
                <Switch
                  checked={entry.enabled}
                  onCheckedChange={(value) =>
                    setSchedule((prev) =>
                      upsertDay(prev, day, { enabled: value }),
                    )
                  }
                  aria-label={`Toggle ${day}`}
                />
                <Input
                  type="time"
                  value={entry.openTime}
                  disabled={!entry.enabled}
                  onChange={(event) =>
                    setSchedule((prev) =>
                      upsertDay(prev, day, { openTime: event.target.value }),
                    )
                  }
                  className="h-8 w-[110px] font-mono text-[12px]"
                />
                <span className="text-[12px] text-zinc-400">→</span>
                <Input
                  type="time"
                  value={entry.closeTime}
                  disabled={!entry.enabled}
                  onChange={(event) =>
                    setSchedule((prev) =>
                      upsertDay(prev, day, { closeTime: event.target.value }),
                    )
                  }
                  className="h-8 w-[110px] font-mono text-[12px]"
                />
              </li>
            );
          })}
        </ul>
      </div>

      <div className="rounded-xl border border-zinc-100">
        <div className="flex items-center justify-between border-b border-zinc-100 px-3 py-2">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">
            Holidays
          </span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() =>
              setHolidays((prev) => [
                ...prev,
                {
                  id: `holiday-${makeDisplayTimestamp()}`,
                  date: makeDisplayDate().toISOString(),
                  label: "New holiday",
                },
              ])
            }
            className="h-7 gap-1 rounded-lg px-2 text-[10px] font-bold uppercase tracking-wider"
          >
            <Plus className="size-3" />
            Add
          </Button>
        </div>
        {holidays.length === 0 ? (
          <p className="p-3 text-[12px] text-zinc-500">
            No holidays set, business hours apply year-round.
          </p>
        ) : (
          <ul className="flex flex-col divide-y divide-zinc-100">
            {holidays.map((holiday, index) => (
              <li
                key={holiday.id}
                className="flex flex-wrap items-center gap-2 px-3 py-2"
              >
                <Input
                  type="date"
                  value={holiday.date.slice(0, 10)}
                  onChange={(event) => {
                    const iso = makeDisplayDate(
                      `${event.target.value}T00:00:00.000Z`,
                    ).toISOString();
                    setHolidays((prev) =>
                      prev.map((row, i) =>
                        i === index ? { ...row, date: iso } : row,
                      ),
                    );
                  }}
                  className="h-8 w-[160px] font-mono text-[12px]"
                />
                <Input
                  value={holiday.label}
                  onChange={(event) =>
                    setHolidays((prev) =>
                      prev.map((row, i) =>
                        i === index
                          ? { ...row, label: event.target.value }
                          : row,
                      ),
                    )
                  }
                  className="h-8 min-w-[200px] text-[12px]"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() =>
                    setHolidays((prev) => prev.filter((_, i) => i !== index))
                  }
                  aria-label="Remove holiday"
                  className="size-7 text-rose-500 hover:bg-rose-50"
                >
                  <Trash2 className="size-3.5" aria-hidden="true" />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <SettingsRow
        label="Default for workspace"
        description="Applied to inboxes that don't specify their own business hours."
      >
        <div className="flex items-center gap-2">
          <Switch
            checked={isDefault}
            onCheckedChange={setIsDefault}
            aria-label="Default business hours"
          />
          <span className="text-[12px] text-zinc-500">
            {isDefault ? "Default" : "Not default"}
          </span>
        </div>
      </SettingsRow>

      <div className="flex items-center justify-between gap-2 pt-2">
        {onCancel ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onCancel}
            className="h-8 rounded-lg px-3 text-xs"
          >
            <span className="sr-only">Cancel</span>
            Cancel
          </Button>
        ) : (
          <span />
        )}
        <Label className="inline-flex items-center gap-2 text-[11px] text-zinc-500">
          Times use 24-hour format.
        </Label>
      </div>

      <SettingsToolbar
        isDirty={isDirty}
        isSaving={saveHours.isPending}
        onSave={handleSave}
        onCancel={() => {
          if (hours) {
            setName(hours.name);
            setTimezone(hours.timezone);
            setSchedule(hours.weeklySchedule);
            setHolidays(hours.holidays);
            setIsDefault(hours.isDefault);
          } else {
            setName("Standard support hours");
            setTimezone("UTC");
            setSchedule(defaultSchedule());
            setHolidays([]);
            setIsDefault(false);
          }
        }}
      />
    </SettingsPanel>
  );
}

function defaultSchedule(): SupportBusinessHours["weeklySchedule"] {
  return DAYS.map((day) => ({
    day,
    enabled: day !== "saturday" && day !== "sunday",
    openTime: "09:00",
    closeTime: "17:00",
  }));
}

function upsertDay(
  schedule: SupportBusinessHours["weeklySchedule"],
  day: SupportBusinessHours["weeklySchedule"][number]["day"],
  patch: Partial<SupportBusinessHours["weeklySchedule"][number]>,
): SupportBusinessHours["weeklySchedule"] {
  const exists = schedule.some((entry) => entry.day === day);
  if (!exists) {
    return [
      ...schedule,
      {
        day,
        enabled: false,
        openTime: "09:00",
        closeTime: "17:00",
        ...patch,
      },
    ];
  }
  return schedule.map((entry) =>
    entry.day === day ? { ...entry, ...patch } : entry,
  );
}
