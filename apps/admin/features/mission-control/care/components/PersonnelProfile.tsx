"use client";

import { useLocaleFormat } from "@asym/lib/hooks/use-locale-format";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@asym/ui/components/shadcn/alert";
import { Button } from "@asym/ui/components/shadcn/button";
import { Calendar } from "@asym/ui/components/shadcn/calendar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@asym/ui/components/shadcn/card";
import { Input } from "@asym/ui/components/shadcn/input";
import { Meter } from "@asym/ui/components/shadcn/meter";
import {
  Popover,
  PopoverContent,
  PopoverTitle,
  PopoverTrigger,
} from "@asym/ui/components/shadcn/popover";
import {
  LegacyRichTextEditor,
  RichTextViewer,
  isRichText,
  isPostContentEmpty,
  extractPlainText,
} from "@asym/ui/components/shadcn/rich-text-editor";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@asym/ui/components/shadcn/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@asym/ui/components/shadcn/tabs";
import { format } from "date-fns";
import {
  CalendarDays,
  Flag,
  FlagOff,
  ListChecks,
  Lock,
  MessageSquareText,
} from "lucide-react";
import { useId, useState, type ReactNode } from "react";
import { toast } from "sonner";

import { ACTIVITY_TYPE_LABELS, CHECK_IN_INTERVAL_DAYS } from "./care-display";
import { LogCareContactDialog } from "./log-care-contact-dialog";
import {
  useCreateCarePrivateNote,
  useCreateCareThreadPost,
  useCreateOrUpdateCareGoal,
  useSetManualAttentionFlag,
  useUpsertCareRequirement,
} from "../hooks/use-care";
import { isLoggedContact } from "../member-care.derived";

import type { ActivityLogEntry, CarePersonnel } from "../types";
import type {
  MemberCarePrivateNote,
  MemberCareGoal,
  MemberCareRequirement,
} from "@asym/database/hooks";

interface PersonnelProfileProps {
  personnel: CarePersonnel;
  activities: ActivityLogEntry[];
  privateNotes: MemberCarePrivateNote[];
  goals?: MemberCareGoal[];
  requirements?: MemberCareRequirement[];
}

const HEALTH_SIGNAL_LABELS: Record<
  keyof CarePersonnel["healthSignals"],
  string
> = {
  emotional: "Emotional",
  spiritual: "Spiritual",
  physical: "Physical",
  financial: "Financial",
};

async function runCareAction(
  action: () => Promise<unknown>,
  { success, failure }: { success: string; failure: string },
): Promise<boolean> {
  try {
    await action();
    toast.success(success);
    return true;
  } catch {
    toast.error(failure);
    return false;
  }
}

export function PersonnelProfileActions({
  personnel,
}: {
  personnel: CarePersonnel;
}) {
  const setManualAttention = useSetManualAttentionFlag();
  const flagged = Boolean(personnel.manualAttention);

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        disabled={setManualAttention.isPending}
        onClick={() =>
          void runCareAction(
            () =>
              setManualAttention.mutateAsync({
                personnelId: personnel.id,
                manualAttention: !flagged,
              }),
            {
              success: flagged
                ? "Attention flag cleared"
                : "Flagged for attention",
              failure: "The flag could not be updated. Try again.",
            },
          )
        }
      >
        {flagged ? <FlagOff aria-hidden="true" /> : <Flag aria-hidden="true" />}
        {flagged ? "Clear attention flag" : "Flag for attention"}
      </Button>
      <LogCareContactDialog personnel={personnel} />
    </>
  );
}

function ProfileCard({
  title,
  description,
  action,
  children,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  const headingId = useId();
  return (
    <section aria-labelledby={headingId}>
      <Card>
        <CardHeader>
          <CardTitle>
            <h2 id={headingId}>{title}</h2>
          </CardTitle>
          {description ? (
            <CardDescription>{description}</CardDescription>
          ) : null}
          {action}
        </CardHeader>
        <CardContent>{children}</CardContent>
      </Card>
    </section>
  );
}

type CareContentNode = {
  text?: string;
  type?: string;
  content?: CareContentNode[];
};

function plainText(value: string) {
  if (!isRichText(value)) {
    // Legacy editor HTML coexists with literal notes, including angle brackets.
    if (
      !/<\/?(?:p|div|span|br|strong|em|b|i|u|s|a|ul|ol|li|blockquote|h[1-6]|pre|code|img|script|style)\b[^>]*>/i.test(
        value,
      )
    )
      return value;
    const text = extractPlainText(
      value
        .replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1\s*>/gi, "")
        .replace(
          /<br\s*\/?\s*>|<\/(?:p|div|li|blockquote|h[1-6]|pre)\s*>/gi,
          "\n",
        ),
    );
    const entities: Record<string, string> = {
      amp: "&",
      lt: "<",
      gt: ">",
      quot: '"',
      apos: "'",
      nbsp: " ",
    };
    return text
      .replace(
        /&(#x[\da-f]+|#\d+|amp|lt|gt|quot|apos|nbsp);/gi,
        (entity, code: string) => {
          if (!code.startsWith("#"))
            return entities[code.toLowerCase()] ?? entity;
          const point =
            code[1]?.toLowerCase() === "x"
              ? parseInt(code.slice(2), 16)
              : Number(code.slice(1));
          return point > 0 && point <= 0x10ffff
            ? String.fromCodePoint(point)
            : "\uFFFD";
        },
      )
      .trim();
  }
  const readNode = (node: CareContentNode): string => {
    if (node.type === "text") return node.text ?? "";
    if (node.type === "hardBreak") return "\n";
    const text = (node.content ?? []).map(readNode).join("");
    return ["paragraph", "heading", "listItem"].includes(node.type ?? "")
      ? `${text}\n`
      : text;
  };
  try {
    return readNode(JSON.parse(value)).trim();
  } catch {
    return "Content could not be displayed.";
  }
}

/** Entry dates in the viewer's locale, as elsewhere in Mission Control. */
const ENTRY_DATE_OPTIONS: Intl.DateTimeFormatOptions = {
  month: "short",
  day: "numeric",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
};

function useEntryDate() {
  const { formatDateTime } = useLocaleFormat();
  return (value: string) => formatDateTime(value, ENTRY_DATE_OPTIONS);
}

function ActivityTimeline({
  activities,
  emptyText,
  rich = false,
}: {
  activities: ActivityLogEntry[];
  emptyText: string;
  /** Show the full formatted entry (the care thread) instead of its text. */
  rich?: boolean;
}) {
  const entryDate = useEntryDate();
  if (activities.length === 0) {
    return <p className="text-sm text-muted-foreground">{emptyText}</p>;
  }
  return (
    <ol className="flex flex-col gap-4">
      {[...activities]
        .sort((a, b) =>
          rich
            ? Date.parse(a.date) - Date.parse(b.date)
            : Date.parse(b.date) - Date.parse(a.date),
        )
        .map((activity) => (
          <li key={activity.id} className="flex gap-3">
            <MessageSquareText
              aria-hidden="true"
              className="mt-0.5 size-4 shrink-0 text-muted-foreground"
            />
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <div className="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-x-3">
                <p className="text-sm font-medium">
                  {ACTIVITY_TYPE_LABELS[activity.type]}
                </p>
                <p className="text-xs text-muted-foreground">
                  {activity.authorName} · {entryDate(activity.date)}
                </p>
              </div>
              {rich && isRichText(activity.content) ? (
                <RichTextViewer value={activity.content} size="sm" />
              ) : (
                <p className="whitespace-pre-line text-sm text-muted-foreground">
                  {plainText(activity.content)}
                </p>
              )}
            </div>
          </li>
        ))}
    </ol>
  );
}

function OverviewTab({
  personnel,
  activities,
}: {
  personnel: CarePersonnel;
  activities: ActivityLogEntry[];
}) {
  return (
    <TabsContent value="overview" className="flex flex-col gap-6">
      <div className="grid gap-6 md:grid-cols-2">
        <ProfileCard
          title="Health signals"
          description={
            Object.values(personnel.healthSignals).every(
              (value) => value === null,
            )
              ? "No wellbeing assessment has been recorded."
              : "Recorded wellbeing assessments, out of 100."
          }
        >
          <ul className="flex flex-col gap-4">
            {(
              Object.keys(HEALTH_SIGNAL_LABELS) as Array<
                keyof CarePersonnel["healthSignals"]
              >
            ).map((key) => {
              const value = personnel.healthSignals[key];
              return (
                <li key={key} className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span>{HEALTH_SIGNAL_LABELS[key]}</span>
                    <span className="tabular-nums text-muted-foreground">
                      {value ?? "Not assessed"}
                    </span>
                  </div>
                  {/* A measurement on a 0–100 scale, not a task's progress. */}
                  {value !== null ? (
                    <Meter
                      value={value}
                      aria-label={`${HEALTH_SIGNAL_LABELS[key]} health ${value} out of 100`}
                    />
                  ) : null}
                </li>
              );
            })}
          </ul>
        </ProfileCard>
        <ProfileCard
          title="Open care needs"
          description="What the care team is following up on."
        >
          {personnel.careGaps.length === 0 ? (
            <p className="text-sm text-muted-foreground">No open care needs.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {personnel.careGaps.map((gap) => (
                <li key={gap} className="flex items-start gap-2 text-sm">
                  <ListChecks
                    aria-hidden="true"
                    className="mt-0.5 size-4 shrink-0 text-muted-foreground"
                  />
                  {gap}
                </li>
              ))}
            </ul>
          )}
        </ProfileCard>
      </div>
      <ProfileCard
        title="Recent activity"
        description="The last five calls, visits and notes."
      >
        <ActivityTimeline
          activities={[...activities]
            .filter(isLoggedContact)
            .sort((a, b) => Date.parse(b.date) - Date.parse(a.date))
            .slice(0, 5)}
          emptyText="No care activity has been logged yet."
        />
      </ProfileCard>
    </TabsContent>
  );
}

function CareThreadTab({
  personnel,
  activities,
}: {
  personnel: CarePersonnel;
  activities: ActivityLogEntry[];
}) {
  const [draft, setDraft] = useState("");
  const createThreadPost = useCreateCareThreadPost();

  return (
    <TabsContent value="care-thread">
      <ProfileCard
        title="Care thread"
        description={`Shared updates about ${personnel.name} for the care team.`}
      >
        <div className="flex flex-col gap-6">
          <ActivityTimeline
            rich
            activities={activities.filter(
              (activity) => activity.kind === "thread",
            )}
            emptyText="No updates yet. Post the first one below."
          />
          <div className="flex flex-col gap-3 rounded-lg border p-3">
            <LegacyRichTextEditor
              aria-label="Care thread update"
              readOnly={createThreadPost.isPending}
              imagePurpose="care-thread"
              value={draft}
              onChange={setDraft}
              placeholder="Post an update to the care thread…"
            />
            <p className="text-sm text-muted-foreground">
              Shared with the care team. To record a call or visit, use Log
              contact.
            </p>
            <div className="flex justify-end">
              <Button
                size="sm"
                disabled={
                  createThreadPost.isPending || isPostContentEmpty(draft)
                }
                onClick={async () => {
                  if (createThreadPost.isPending || isPostContentEmpty(draft))
                    return;
                  const posted = await runCareAction(
                    () =>
                      createThreadPost.mutateAsync({
                        personnelId: personnel.id,
                        content: draft,
                      }),
                    {
                      success: "Update posted",
                      failure: "The update could not be posted. Try again.",
                    },
                  );
                  if (posted) setDraft("");
                }}
              >
                {createThreadPost.isPending ? "Posting…" : "Post update"}
              </Button>
            </div>
          </div>
        </div>
      </ProfileCard>
    </TabsContent>
  );
}

const RHYTHM_ACTIVITY_LABELS = {
  "Check-in": "Check-in",
  "Video Call": "Video call",
  "In-Person Visit": "In-person visit",
  "Pastoral Note": "Pastoral note",
} as const;
type RhythmActivity = keyof typeof RHYTHM_ACTIVITY_LABELS;

function CareRhythmForm({
  personnelId,
  requirements,
}: {
  personnelId: string;
  requirements: MemberCareRequirement[];
}) {
  const fieldId = useId();
  const initial = requirements.find(
    (requirement) => requirement.activityType === "Check-in",
  );
  const [activity, setActivity] = useState<RhythmActivity>("Check-in");
  const [days, setDays] = useState(
    String(initial?.intervalDays ?? CHECK_IN_INTERVAL_DAYS),
  );
  const [note, setNote] = useState(initial?.notes ?? "");
  const existing = requirements.find(
    (requirement) => requirement.activityType === activity,
  );
  const upsertRequirement = useUpsertCareRequirement();
  const interval = Number(days);
  const valid = Number.isInteger(interval) && interval > 0;

  return (
    <form
      className="flex flex-col gap-3"
      onSubmit={async (event) => {
        event.preventDefault();
        if (!valid || upsertRequirement.isPending) return;
        const trimmed = note.trim();
        const saved = await runCareAction(
          () =>
            upsertRequirement.mutateAsync({
              personnelId,
              ...(existing ? { id: existing.id } : {}),
              activityType: activity,
              intervalDays: interval,
              notes: trimmed,
            }),
          {
            success: "Contact schedule saved",
            failure: "The contact schedule could not be saved. Try again.",
          },
        );
        if (!saved) return;
      }}
    >
      <p className="text-sm font-medium">
        {existing ? "Update a contact schedule" : "Add a contact schedule"}
      </p>
      {existing ? (
        <p className="text-sm text-muted-foreground">
          This replaces the saved {ACTIVITY_TYPE_LABELS[activity].toLowerCase()}{" "}
          interval.
        </p>
      ) : null}
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor={`${fieldId}-activity`}
            className="text-xs text-muted-foreground"
          >
            Contact
          </label>
          <Select<RhythmActivity>
            items={RHYTHM_ACTIVITY_LABELS}
            value={activity}
            onValueChange={(value) => {
              if (!value) return;
              setActivity(value);
              const saved = requirements.find(
                (requirement) => requirement.activityType === value,
              );
              setDays(String(saved?.intervalDays ?? CHECK_IN_INTERVAL_DAYS));
              setNote(saved?.notes ?? "");
            }}
          >
            <SelectTrigger id={`${fieldId}-activity`} aria-label="Contact">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(RHYTHM_ACTIVITY_LABELS) as RhythmActivity[]).map(
                (value) => (
                  <SelectItem key={value} value={value}>
                    {RHYTHM_ACTIVITY_LABELS[value]}
                  </SelectItem>
                ),
              )}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor={`${fieldId}-days`}
            className="text-xs text-muted-foreground"
          >
            Every (days)
          </label>
          <Input
            id={`${fieldId}-days`}
            type="number"
            min={1}
            inputMode="numeric"
            value={days}
            onChange={(event) => setDays(event.target.value)}
            aria-invalid={!valid || undefined}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor={`${fieldId}-note`}
            className="text-xs text-muted-foreground"
          >
            Note (optional)
          </label>
          <Input
            id={`${fieldId}-note`}
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder="For example: while on home assignment"
          />
        </div>
      </div>
      <Button
        type="submit"
        variant="outline"
        className="self-start"
        disabled={upsertRequirement.isPending || !valid}
      >
        {upsertRequirement.isPending
          ? "Saving…"
          : existing
            ? "Update schedule"
            : "Add schedule"}
      </Button>
    </form>
  );
}

function CarePlanTab({
  personnel,
  goals,
  requirements,
}: {
  personnel: CarePersonnel;
  goals: MemberCareGoal[];
  requirements: MemberCareRequirement[];
}) {
  const goalFieldId = useId();
  const [goal, setGoal] = useState("");
  const [targetDate, setTargetDate] = useState<Date>();
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const upsertCareGoal = useCreateOrUpdateCareGoal();
  const { formatDate } = useLocaleFormat();
  return (
    <TabsContent value="care-plan">
      <ProfileCard
        title="Care plan"
        description="Goals and contact schedules the care team is working on."
      >
        <div className="flex flex-col gap-6">
          {goals.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No care goals yet. Add a goal when the team agrees on a next step.
            </p>
          ) : (
            <ul className="flex flex-col gap-2">
              {[...goals]
                .sort(
                  (first, second) =>
                    Number(first.status === "completed") -
                    Number(second.status === "completed"),
                )
                .map((savedGoal) => (
                  <li
                    key={savedGoal.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-3 text-sm"
                  >
                    <div className="flex min-w-0 flex-col gap-1">
                      <span className="font-medium">{savedGoal.title}</span>
                      <span className="text-muted-foreground">
                        {savedGoal.status === "completed"
                          ? "Completed"
                          : savedGoal.status === "active"
                            ? "Active"
                            : "Pending"}
                        {savedGoal.targetDate
                          ? ` · Target ${formatDate(savedGoal.targetDate)}`
                          : ""}
                      </span>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={upsertCareGoal.isPending}
                      onClick={() =>
                        void runCareAction(
                          () =>
                            upsertCareGoal.mutateAsync({
                              personnelId: personnel.id,
                              id: savedGoal.id,
                              title: savedGoal.title,
                              status:
                                savedGoal.status === "completed"
                                  ? "active"
                                  : "completed",
                              targetDate: savedGoal.targetDate,
                            }),
                          {
                            success:
                              savedGoal.status === "completed"
                                ? "Goal reopened"
                                : "Goal completed",
                            failure:
                              "The goal could not be updated. Try again.",
                          },
                        )
                      }
                    >
                      {savedGoal.status === "completed"
                        ? "Reopen"
                        : "Mark done"}
                    </Button>
                  </li>
                ))}
            </ul>
          )}
          <form
            className="flex flex-col gap-3"
            onSubmit={async (event) => {
              event.preventDefault();
              if (!goal.trim() || upsertCareGoal.isPending) return;
              const saved = await runCareAction(
                () =>
                  upsertCareGoal.mutateAsync({
                    personnelId: personnel.id,
                    title: goal.trim(),
                    status: "active",
                    ...(targetDate
                      ? { targetDate: format(targetDate, "yyyy-MM-dd") }
                      : {}),
                  }),
                {
                  success: "Care goal added",
                  failure: "The goal could not be saved. Try again.",
                },
              );
              if (saved) {
                setGoal("");
                setTargetDate(undefined);
              }
            }}
          >
            <div className="flex flex-col gap-1.5">
              <label htmlFor={goalFieldId} className="text-sm font-medium">
                Add a goal
              </label>
              <Input
                id={goalFieldId}
                value={goal}
                onChange={(event) => setGoal(event.target.value)}
                placeholder="For example: monthly video call through March"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor={`${goalFieldId}-target`} className="text-sm">
                Target date (optional)
              </label>
              <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
                <PopoverTrigger
                  id={`${goalFieldId}-target`}
                  render={
                    <Button type="button" variant="outline">
                      <CalendarDays aria-hidden="true" />
                      {targetDate ? formatDate(targetDate) : "Select date"}
                    </Button>
                  }
                />
                <PopoverContent align="start" className="w-auto">
                  <PopoverTitle className="sr-only">Target date</PopoverTitle>
                  <Calendar
                    mode="single"
                    selected={targetDate}
                    defaultMonth={targetDate}
                    onSelect={(date) => {
                      setTargetDate(date);
                      setDatePickerOpen(false);
                    }}
                    autoFocus
                  />
                  <div className="flex justify-end">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setTargetDate(undefined);
                        setDatePickerOpen(false);
                      }}
                    >
                      Clear date
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
            <Button
              type="submit"
              variant="outline"
              className="self-start"
              disabled={upsertCareGoal.isPending || !goal.trim()}
            >
              {upsertCareGoal.isPending ? "Saving…" : "Add goal"}
            </Button>
          </form>
          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-medium">Contact schedules</h3>
            {requirements.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No saved contact schedules. Follow-up is due after more than{" "}
                {CHECK_IN_INTERVAL_DAYS} days without contact, or when no
                contact is recorded.
              </p>
            ) : (
              <ul className="flex flex-col gap-2">
                {requirements.map((requirement) => (
                  <li key={requirement.id} className="text-sm">
                    {ACTIVITY_TYPE_LABELS[requirement.activityType]} · Every{" "}
                    {requirement.intervalDays} days
                    {requirement.notes ? ` · ${requirement.notes}` : ""}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <CareRhythmForm
            key={requirements
              .map(
                (requirement) =>
                  `${requirement.id}:${requirement.intervalDays}:${requirement.notes}`,
              )
              .join("|")}
            personnelId={personnel.id}
            requirements={requirements}
          />
        </div>
      </ProfileCard>
    </TabsContent>
  );
}

function ActivityTab({ activities }: { activities: ActivityLogEntry[] }) {
  return (
    <TabsContent value="activity">
      <ProfileCard
        title="Activity"
        description="Every call, visit and note, newest first."
      >
        <ActivityTimeline
          activities={activities.filter(isLoggedContact)}
          emptyText="No care activity has been logged yet."
        />
      </ProfileCard>
    </TabsContent>
  );
}

function PrivateNotesTab({
  personnelId,
  privateNotes,
}: {
  personnelId: string;
  privateNotes: MemberCarePrivateNote[];
}) {
  const [draft, setDraft] = useState("");
  const createPrivateNote = useCreateCarePrivateNote();
  const entryDate = useEntryDate();

  return (
    <TabsContent value="secure-notes">
      <ProfileCard
        title="Private notes"
        description="Visible only to you and platform super admins."
      >
        <div className="flex flex-col gap-6">
          <Alert>
            <Lock aria-hidden="true" />
            <AlertTitle>For internal ministry use</AlertTitle>
            <AlertDescription>
              Do not store regulated or legally protected information unless
              your organization has approved it.
            </AlertDescription>
          </Alert>
          {privateNotes.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No private notes yet.
            </p>
          ) : (
            <ol className="flex flex-col gap-4">
              {privateNotes.map((note) => (
                <li key={note.id} className="flex flex-col gap-1">
                  <p className="text-xs text-muted-foreground">
                    {note.authorName} · {entryDate(note.date)}
                  </p>
                  <div className="text-sm">
                    {isRichText(note.content) ? (
                      <RichTextViewer value={note.content} size="sm" />
                    ) : (
                      <p className="whitespace-pre-line">
                        {plainText(note.content)}
                      </p>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          )}
          <div className="flex flex-col gap-3 rounded-lg border p-3">
            <LegacyRichTextEditor
              aria-label="Private care note"
              readOnly={createPrivateNote.isPending}
              imagePurpose="care-note"
              value={draft}
              onChange={setDraft}
              placeholder="Write a private note…"
            />
            <div className="flex justify-end">
              <Button
                size="sm"
                disabled={
                  createPrivateNote.isPending || isPostContentEmpty(draft)
                }
                onClick={async () => {
                  if (createPrivateNote.isPending || isPostContentEmpty(draft))
                    return;
                  const saved = await runCareAction(
                    () =>
                      createPrivateNote.mutateAsync({
                        personnelId,
                        content: draft,
                      }),
                    {
                      success: "Private note saved",
                      failure: "The note could not be saved. Try again.",
                    },
                  );
                  if (saved) setDraft("");
                }}
              >
                {createPrivateNote.isPending ? "Saving…" : "Save note"}
              </Button>
            </div>
          </div>
        </div>
      </ProfileCard>
    </TabsContent>
  );
}

const PROFILE_TABS = [
  { value: "overview", label: "Overview" },
  { value: "care-thread", label: "Care thread" },
  { value: "care-plan", label: "Care plan" },
  { value: "activity", label: "Activity" },
  { value: "secure-notes", label: "Private notes" },
] as const;

type ProfileTab = (typeof PROFILE_TABS)[number]["value"];

const PROFILE_TAB_LABELS = Object.fromEntries(
  PROFILE_TABS.map((tab) => [tab.value, tab.label]),
) as Record<ProfileTab, string>;

export function PersonnelProfile({
  personnel,
  activities,
  privateNotes,
  goals = [],
  requirements = [],
}: PersonnelProfileProps) {
  const [tab, setTab] = useState<ProfileTab>("overview");
  return (
    <Tabs
      value={tab}
      onValueChange={(next) => setTab(next as ProfileTab)}
      className="flex flex-col gap-6"
    >
      <div className="sm:hidden">
        <Select<ProfileTab>
          items={PROFILE_TAB_LABELS}
          value={tab}
          onValueChange={(next) => next && setTab(next)}
        >
          <SelectTrigger aria-label="Profile section">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PROFILE_TABS.map((entry) => (
              <SelectItem key={entry.value} value={entry.value}>
                {entry.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="hidden overflow-x-auto sm:block">
        <TabsList aria-label="Personnel profile" variant="line">
          {PROFILE_TABS.map((entry) => (
            <TabsTrigger key={entry.value} value={entry.value}>
              {entry.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </div>
      <OverviewTab personnel={personnel} activities={activities} />
      <CareThreadTab personnel={personnel} activities={activities} />
      <CarePlanTab
        personnel={personnel}
        goals={goals}
        requirements={requirements}
      />
      <ActivityTab activities={activities} />
      <PrivateNotesTab personnelId={personnel.id} privateNotes={privateNotes} />
    </Tabs>
  );
}
