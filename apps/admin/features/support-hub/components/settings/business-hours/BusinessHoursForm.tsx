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
  const [draft, dispatch] = React.useReducer(
    reduceBusinessHoursDraft,
    hours,
    createBusinessHoursDraft,
  );
  const { name, timezone, schedule, holidays, isDefault } = draft;

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
          onChange={(event) =>
            dispatch({ type: "name", value: event.target.value })
          }
          maxLength={60}
        />
      </SettingsRow>
      <SettingsRow label="Timezone" htmlFor="biz-tz">
        <Input
          id="biz-tz"
          value={timezone}
          onChange={(event) =>
            dispatch({ type: "timezone", value: event.target.value })
          }
          placeholder="America/Chicago"
          maxLength={60}
        />
      </SettingsRow>
      <div className="rounded-xl border border-border">
        <div className="border-b border-border px-3 py-2 text-sm font-medium text-muted-foreground">
          Weekly schedule
        </div>
        <ul className="flex flex-col divide-y divide-border">
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
                <span className="w-24 text-xs font-medium capitalize text-foreground">
                  {day}
                </span>
                <Switch
                  checked={entry.enabled}
                  onCheckedChange={(value) =>
                    dispatch({
                      type: "schedule",
                      value: (prev) => upsertDay(prev, day, { enabled: value }),
                    })
                  }
                  aria-label={`Toggle ${day}`}
                />
                <Input
                  type="time"
                  value={entry.openTime}
                  disabled={!entry.enabled}
                  onChange={(event) =>
                    dispatch({
                      type: "schedule",
                      value: (prev) =>
                        upsertDay(prev, day, { openTime: event.target.value }),
                    })
                  }
                  className="h-8 w-27.5 font-mono"
                />
                <span className="text-xs text-muted-foreground">→</span>
                <Input
                  type="time"
                  value={entry.closeTime}
                  disabled={!entry.enabled}
                  onChange={(event) =>
                    dispatch({
                      type: "schedule",
                      value: (prev) =>
                        upsertDay(prev, day, { closeTime: event.target.value }),
                    })
                  }
                  className="h-8 w-27.5 font-mono"
                />
              </li>
            );
          })}
        </ul>
      </div>

      <div className="rounded-xl border border-border">
        <div className="flex items-center justify-between border-b border-border px-3 py-2">
          <span className="text-sm font-medium text-muted-foreground">
            Holidays
          </span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() =>
              dispatch({
                type: "holidays",
                value: (prev) => [
                  ...prev,
                  {
                    id: `holiday-${makeDisplayTimestamp()}`,
                    date: makeDisplayDate().toISOString(),
                    label: "New holiday",
                  },
                ],
              })
            }
            className="h-7 gap-1 rounded-lg px-2 font-bold uppercase tracking-wider"
          >
            <Plus className="size-3" />
            Add
          </Button>
        </div>
        {holidays.length === 0 ? (
          <p className="p-3 text-xs text-muted-foreground">
            No holidays set, business hours apply year-round.
          </p>
        ) : (
          <ul className="flex flex-col divide-y divide-border">
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
                    dispatch({
                      type: "holidays",
                      value: (prev) =>
                        prev.map((row, i) =>
                          i === index ? { ...row, date: iso } : row,
                        ),
                    });
                  }}
                  className="h-8 w-40 font-mono"
                />
                <Input
                  value={holiday.label}
                  onChange={(event) =>
                    dispatch({
                      type: "holidays",
                      value: (prev) =>
                        prev.map((row, i) =>
                          i === index
                            ? { ...row, label: event.target.value }
                            : row,
                        ),
                    })
                  }
                  className="h-8 min-w-50"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() =>
                    dispatch({
                      type: "holidays",
                      value: (prev) => prev.filter((_, i) => i !== index),
                    })
                  }
                  aria-label="Remove holiday"
                  className="size-7 text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="size-3.5" />
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
            onCheckedChange={(value) => dispatch({ type: "isDefault", value })}
            aria-label="Default business hours"
          />
          <span className="text-xs text-muted-foreground">
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
            className="rounded-lg text-xs"
          >
            <span className="sr-only">Cancel</span>
            Cancel
          </Button>
        ) : (
          <span />
        )}
        <Label className="inline-flex items-center gap-2 text-xs text-muted-foreground">
          Times use 24-hour format.
        </Label>
      </div>

      <SettingsToolbar
        isDirty={isDirty}
        isSaving={saveHours.isPending}
        onSave={handleSave}
        onCancel={() => dispatch({ type: "reset", hours })}
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

type BusinessHoursDraft = {
  name: string;
  timezone: string;
  schedule: SupportBusinessHours["weeklySchedule"];
  holidays: SupportBusinessHours["holidays"];
  isDefault: boolean;
};
type BusinessHoursDraftAction =
  | { type: "reset"; hours?: SupportBusinessHours | null }
  | {
      [Key in keyof BusinessHoursDraft]: {
        type: Key;
        value: React.SetStateAction<BusinessHoursDraft[Key]>;
      };
    }[keyof BusinessHoursDraft];
function createBusinessHoursDraft(
  hours?: SupportBusinessHours | null,
): BusinessHoursDraft {
  return {
    name: hours?.name ?? "Standard support hours",
    timezone: hours?.timezone ?? "UTC",
    schedule: hours?.weeklySchedule ?? defaultSchedule(),
    holidays: hours?.holidays ?? [],
    isDefault: hours?.isDefault ?? false,
  };
}
function applyDraftValue<T>(current: T, next: React.SetStateAction<T>): T {
  return typeof next === "function"
    ? (next as (previous: T) => T)(current)
    : next;
}
function reduceBusinessHoursDraft(
  state: BusinessHoursDraft,
  action: BusinessHoursDraftAction,
): BusinessHoursDraft {
  switch (action.type) {
    case "reset":
      return createBusinessHoursDraft(action.hours);
    case "name":
      return { ...state, name: applyDraftValue(state.name, action.value) };
    case "timezone":
      return {
        ...state,
        timezone: applyDraftValue(state.timezone, action.value),
      };
    case "schedule":
      return {
        ...state,
        schedule: applyDraftValue(state.schedule, action.value),
      };
    case "holidays":
      return {
        ...state,
        holidays: applyDraftValue(state.holidays, action.value),
      };
    case "isDefault":
      return {
        ...state,
        isDefault: applyDraftValue(state.isDefault, action.value),
      };
  }
}
