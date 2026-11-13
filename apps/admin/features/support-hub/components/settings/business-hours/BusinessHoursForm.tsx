"use client";

import { Button } from "@asym/ui/components/shadcn/button";
import { FieldError, FieldLabel } from "@asym/ui/components/shadcn/field";
import { Input } from "@asym/ui/components/shadcn/input";
import { Switch } from "@asym/ui/components/shadcn/switch";
import { Plus, Trash2 } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";

import { useSaveSupportBusinessHours } from "../../../hooks/use-support-mutations";
import { SettingsEditorForm } from "../SettingsEditorSheet";
import { SettingsRow } from "../SettingsRow";

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
  const fieldsRef = React.useRef<HTMLDivElement>(null);
  const holidayNameRefs = React.useRef(new Map<string, HTMLInputElement>());
  const [submitted, setSubmitted] = React.useState(false);
  const errors = businessHoursIssues(draft);

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
    setSubmitted(true);
    if (Object.keys(errors).length > 0) {
      requestAnimationFrame(() =>
        fieldsRef.current
          ?.querySelector<HTMLElement>('[aria-invalid="true"]')
          ?.focus(),
      );
      return;
    }
    try {
      const id = await saveHours.mutateAsync({
        id: hours?.id,
        name: name.trim(),
        timezone: timezone.trim(),
        weeklySchedule: schedule,
        holidays: holidays.map((holiday) => ({
          ...holiday,
          label: holiday.label.trim(),
        })),
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
    <SettingsEditorForm
      draft={draft}
      canSave={isDirty}
      isNew={!hours}
      isSaving={saveHours.isPending}
      noun="schedule"
      onSave={() => void handleSave()}
      onCancel={() => onCancel?.()}
    >
      <div ref={fieldsRef} className="contents">
        <SettingsRow
          label="Name"
          htmlFor="biz-name"
          error={submitted ? errors["biz-name"] : undefined}
        >
          <Input
            id="biz-name"
            aria-invalid={submitted && Boolean(errors["biz-name"])}
            value={name}
            onChange={(event) =>
              dispatch({ type: "name", value: event.target.value })
            }
            maxLength={60}
          />
        </SettingsRow>
        <SettingsRow
          label="Timezone"
          htmlFor="biz-tz"
          description="Stored with the schedule. The reports filter reads the times as UTC for now."
          error={submitted ? errors["biz-tz"] : undefined}
        >
          <Input
            id="biz-tz"
            aria-invalid={submitted && Boolean(errors["biz-tz"])}
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
              const entry = schedule.find((row) => row.day === day) ?? {
                day,
                enabled: false,
                openTime: "09:00",
                closeTime: "17:00",
              };
              const dayLabel = day.charAt(0).toUpperCase() + day.slice(1);
              return (
                <li
                  key={day}
                  className="flex flex-wrap items-center gap-3 px-3 py-2"
                >
                  <span className="w-24 text-xs font-medium text-foreground">
                    {dayLabel}
                  </span>
                  <Switch
                    checked={entry.enabled}
                    onCheckedChange={(enabled) =>
                      dispatch({
                        type: "schedule",
                        value: (previous) =>
                          upsertDay(previous, day, { enabled }),
                      })
                    }
                    aria-label={`Open on ${dayLabel}`}
                  />
                  {(["open", "close"] as const).map((part) => {
                    const fieldId = `${day}-${part}`;
                    const error = submitted ? errors[fieldId] : undefined;
                    return (
                      <div key={part} className="flex flex-col gap-1">
                        <FieldLabel htmlFor={fieldId}>
                          {dayLabel} {part === "open" ? "opening" : "closing"}{" "}
                          time
                        </FieldLabel>
                        <Input
                          id={fieldId}
                          type="time"
                          value={
                            part === "open" ? entry.openTime : entry.closeTime
                          }
                          disabled={!entry.enabled}
                          aria-invalid={Boolean(error)}
                          aria-describedby={
                            error ? `${fieldId}-error` : undefined
                          }
                          onChange={(event) =>
                            dispatch({
                              type: "schedule",
                              value: (previous) =>
                                upsertDay(
                                  previous,
                                  day,
                                  part === "open"
                                    ? { openTime: event.target.value }
                                    : { closeTime: event.target.value },
                                ),
                            })
                          }
                          className="h-8 w-27.5 font-mono"
                        />
                        {error ? (
                          <FieldError id={`${fieldId}-error`}>
                            {error}
                          </FieldError>
                        ) : null}
                      </div>
                    );
                  })}
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
              onClick={() => {
                const id = `holiday-${makeDisplayTimestamp()}`;
                const today = makeDisplayDate();
                const date = [
                  today.getFullYear(),
                  String(today.getMonth() + 1).padStart(2, "0"),
                  String(today.getDate()).padStart(2, "0"),
                ].join("-");
                dispatch({
                  type: "holidays",
                  value: (previous) => [
                    ...previous,
                    { id, date: `${date}T00:00:00.000Z`, label: "" },
                  ],
                });
                requestAnimationFrame(() =>
                  holidayNameRefs.current.get(id)?.focus(),
                );
              }}
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
                  <div className="flex flex-col gap-1">
                    <FieldLabel htmlFor={`${holiday.id}-date`}>
                      Holiday {index + 1} date
                    </FieldLabel>
                    <Input
                      id={`${holiday.id}-date`}
                      type="date"
                      value={holiday.date.slice(0, 10)}
                      aria-invalid={
                        submitted && Boolean(errors[`${holiday.id}-date`])
                      }
                      aria-describedby={
                        submitted && errors[`${holiday.id}-date`]
                          ? `${holiday.id}-date-error`
                          : undefined
                      }
                      onChange={(event) => {
                        const date = event.target.value;
                        dispatch({
                          type: "holidays",
                          value: (previous) =>
                            previous.map((row) =>
                              row.id === holiday.id
                                ? {
                                    ...row,
                                    date: date ? `${date}T00:00:00.000Z` : "",
                                  }
                                : row,
                            ),
                        });
                      }}
                      className="h-8 w-40 font-mono"
                    />
                    {submitted && errors[`${holiday.id}-date`] ? (
                      <FieldError id={`${holiday.id}-date-error`}>
                        {errors[`${holiday.id}-date`]}
                      </FieldError>
                    ) : null}
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <FieldLabel htmlFor={`${holiday.id}-name`}>
                      Holiday {index + 1} name
                    </FieldLabel>
                    <Input
                      id={`${holiday.id}-name`}
                      ref={(element) => {
                        if (element)
                          holidayNameRefs.current.set(holiday.id, element);
                        else holidayNameRefs.current.delete(holiday.id);
                      }}
                      placeholder="Holiday name"
                      value={holiday.label}
                      aria-invalid={
                        submitted && Boolean(errors[`${holiday.id}-name`])
                      }
                      aria-describedby={
                        submitted && errors[`${holiday.id}-name`]
                          ? `${holiday.id}-name-error`
                          : undefined
                      }
                      onChange={(event) =>
                        dispatch({
                          type: "holidays",
                          value: (previous) =>
                            previous.map((row) =>
                              row.id === holiday.id
                                ? { ...row, label: event.target.value }
                                : row,
                            ),
                        })
                      }
                      className="h-8 min-w-0"
                    />
                    {submitted && errors[`${holiday.id}-name`] ? (
                      <FieldError id={`${holiday.id}-name-error`}>
                        {errors[`${holiday.id}-name`]}
                      </FieldError>
                    ) : null}
                  </div>
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
                    aria-label={`Remove holiday ${index + 1}`}
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
          control
          label="Default for workspace"
          description="The reports business-hours filter uses the workspace default schedule."
        >
          <div className="flex items-center gap-2">
            <Switch
              checked={isDefault}
              onCheckedChange={(value) =>
                dispatch({ type: "isDefault", value })
              }
              aria-label="Default business hours"
            />
            <span className="text-xs text-muted-foreground">
              {isDefault ? "Default" : "Not default"}
            </span>
          </div>
        </SettingsRow>
        <p className="text-xs text-muted-foreground">
          Times use 24-hour format.
        </p>
      </div>
    </SettingsEditorForm>
  );
}

function businessHoursIssues(
  draft: BusinessHoursDraft,
): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!draft.name.trim()) errors["biz-name"] = "Enter a schedule name.";
  if (!draft.timezone.trim()) errors["biz-tz"] = "Enter a timezone.";
  const validTime = (time: string) => /^([01]\d|2[0-3]):[0-5]\d$/.test(time);
  for (const day of draft.schedule) {
    if (!day.enabled) continue;
    if (!validTime(day.openTime))
      errors[`${day.day}-open`] = "Choose an opening time.";
    if (!validTime(day.closeTime))
      errors[`${day.day}-close`] = "Choose a closing time.";
    else if (validTime(day.openTime) && day.closeTime <= day.openTime)
      errors[`${day.day}-close`] = "Closing time must be after opening time.";
  }
  for (const holiday of draft.holidays) {
    const date = holiday.date.slice(0, 10);
    const parsed = makeDisplayDate(holiday.date);
    if (
      !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
      !Number.isFinite(parsed.getTime()) ||
      parsed.toISOString().slice(0, 10) !== date
    )
      errors[`${holiday.id}-date`] = "Choose a valid holiday date.";
    if (!holiday.label.trim())
      errors[`${holiday.id}-name`] = "Enter a holiday name.";
  }
  return errors;
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
type BusinessHoursDraftAction = {
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
