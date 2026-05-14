"use client";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@asym/ui/components/shadcn/avatar";
import { Badge } from "@asym/ui/components/shadcn/badge";
import { Button } from "@asym/ui/components/shadcn/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@asym/ui/components/shadcn/card";
import {
  LegacyRichTextEditor,
  RichTextViewer,
} from "@asym/ui/components/shadcn/rich-text-editor";
import {
  Tabs,
  TabsContent,
  TabsTrigger,
} from "@asym/ui/components/shadcn/tabs";
import { cn } from "@asym/ui/lib/utils";
import {
  Heart,
  MessageCircle,
  Lock,
  Clock,
  MapPin,
  Globe,
  Phone,
  AlertTriangle,
  Plus,
} from "lucide-react";
import React, { useMemo, useState, useEffect } from "react";

import { HealthHeatmap } from "./HealthHeatmap";
import {
  useCreateCareThreadPost,
  useCreateCarePrivateNote,
  useCreateOrUpdateCareGoal,
  useLogCareActivity,
  useSetManualAttentionFlag,
  useUpsertCareRequirement,
} from "../hooks/use-care";

import type { CarePersonnel, ActivityLogEntry } from "../types";
import type { MemberCarePrivateNote } from "@asym/database/hooks";

function makeDisplayDate(value?: string | number | Date): Date {
  return value === undefined
    ? new globalThis.Date()
    : new globalThis.Date(value);
}

interface PersonnelProfileProps {
  personnel: CarePersonnel;
  activities: ActivityLogEntry[];
  privateNotes: MemberCarePrivateNote[];
}

function PersonnelProfileHeaderCard({
  personnel,
  localTime,
  onLogCheckIn,
  onToggleManualAttention,
  isLoggingCheckIn,
  isUpdatingAttention,
}: {
  personnel: CarePersonnel;
  localTime: string | null;
  onLogCheckIn: () => Promise<void>;
  onToggleManualAttention: () => Promise<void>;
  isLoggingCheckIn: boolean;
  isUpdatingAttention: boolean;
}) {
  return (
    <Card className="border-zinc-200 shadow-sm overflow-hidden">
      <div className="h-24 bg-gradient-to-r from-zinc-900 to-zinc-800" />
      <CardContent className="relative pt-0 pb-6 px-6">
        <div className="flex flex-col md:flex-row items-start md:items-end gap-4 -mt-10">
          <Avatar className="size-24 border-4 border-white shadow-lg bg-white">
            <AvatarImage src={personnel.avatarUrl} />
            <AvatarFallback className="text-2xl font-semibold">
              {personnel.initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-semibold text-zinc-900">
                {personnel.name}
              </h2>
              <Badge
                className={cn(
                  "font-semibold",
                  personnel.status === "Healthy"
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : personnel.status === "At Risk"
                      ? "bg-rose-50 text-rose-700 border-rose-200"
                      : "bg-amber-50 text-amber-700 border-amber-200",
                )}
              >
                {personnel.status}
              </Badge>
            </div>
            <div className="flex flex-wrap gap-4 text-xs text-zinc-500 font-medium">
              <div className="flex items-center gap-1.5">
                <MapPin className="size-3.5" /> {personnel.location}
              </div>
              <div className="flex items-center gap-1.5">
                <Globe className="size-3.5" /> {personnel.region}
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="size-3.5" /> {localTime || "--:--"} (Local)
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-9 px-4 font-semibold border-zinc-200"
              onClick={onToggleManualAttention}
              disabled={isUpdatingAttention}
            >
              <AlertTriangle className="mr-2 size-4 text-zinc-400" />
              {isUpdatingAttention
                ? "Updating..."
                : personnel.manualAttention
                  ? "Clear Attention"
                  : "Flag Attention"}
            </Button>
            <Button
              className="h-9 px-4 font-semibold bg-zinc-900 text-white hover:bg-zinc-800 shadow-lg shadow-zinc-200"
              onClick={onLogCheckIn}
              disabled={isLoggingCheckIn}
            >
              <Heart className="mr-2 size-4" /> Log Check-in
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function OverviewTabContentSection({
  personnel,
  activities,
  heatmapData,
}: {
  personnel: CarePersonnel;
  activities: ActivityLogEntry[];
  heatmapData: Array<{ date: string; intensity: number; type: string }>;
}) {
  return (
    <TabsContent
      value="overview"
      className="space-y-6 animate-in fade-in duration-300"
    >
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2 border-zinc-200 shadow-sm">
          <CardHeader className="pb-3 border-b border-zinc-50">
            <CardTitle className="text-base font-semibold">
              Wellness Heatmap
            </CardTitle>
            <CardDescription className="text-xs">
              Interaction frequency and intensity over the last 90 days.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <HealthHeatmap data={heatmapData} />
            <div className="mt-6 space-y-4">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Recent Activity
              </h4>
              <div className="space-y-3">
                {activities.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex gap-3 p-3 rounded-lg border border-zinc-100 bg-zinc-50/30"
                  >
                    <div className="mt-0.5">
                      {activity.type === "Video Call" ? (
                        <Phone className="size-4 text-blue-500" />
                      ) : (
                        <MessageCircle className="size-4 text-emerald-500" />
                      )}
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-zinc-900">
                          {activity.type}
                        </span>
                        <span className="text-[10px] text-zinc-400 font-medium">
                          {makeDisplayDate(activity.date).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-600 leading-relaxed">
                        {activity.content}
                      </p>
                      <div className="text-[10px] text-zinc-400 font-semibold uppercase">
                        By {activity.authorName}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-zinc-200 shadow-sm">
            <CardHeader className="pb-3 border-b border-zinc-50">
              <CardTitle className="text-base font-semibold">
                Health Signals
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              {Object.entries(personnel.healthSignals).map(([key, value]) => (
                <div key={key} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-semibold capitalize">
                    <span>{key}</span>
                    <span
                      className={cn(
                        value > 80
                          ? "text-emerald-600"
                          : value > 50
                            ? "text-amber-600"
                            : "text-rose-600",
                      )}
                    >
                      {value}%
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-zinc-100 rounded-full overflow-hidden">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all",
                        value > 80
                          ? "bg-emerald-500"
                          : value > 50
                            ? "bg-amber-500"
                            : "bg-rose-500",
                      )}
                      style={{ width: `${value}%` }}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {personnel.careGaps.length > 0 && (
            <Card className="border-rose-100 bg-rose-50/30 shadow-sm">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2 text-rose-900">
                  <AlertTriangle className="size-4" />
                  <CardTitle className="text-sm font-semibold uppercase">
                    Active Care Gaps
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {personnel.careGaps.map((gap) => (
                    <li
                      key={gap}
                      className="text-xs font-medium text-rose-700 flex items-center gap-2"
                    >
                      <div className="size-1 rounded-full bg-rose-400" />
                      {gap}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          <Card className="border-zinc-200 shadow-sm">
            <CardHeader className="pb-3 border-b border-zinc-50">
              <CardTitle className="text-base font-semibold">
                Personal & Family Info
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-3 text-xs text-zinc-600">
              <div className="flex justify-between gap-4">
                <span className="font-semibold uppercase tracking-wider text-zinc-400">
                  Household
                </span>
                <span>Not provided</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="font-semibold uppercase tracking-wider text-zinc-400">
                  Dependents
                </span>
                <span>Not provided</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="font-semibold uppercase tracking-wider text-zinc-400">
                  Preferred language
                </span>
                <span>Not provided</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-zinc-200 shadow-sm">
            <CardHeader className="pb-3 border-b border-zinc-50">
              <CardTitle className="text-base font-semibold">
                Emergency Contact
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-2 text-xs">
              <p className="font-semibold text-zinc-900">Not yet recorded</p>
              <p className="text-zinc-500">
                Add emergency contact information in profile editing flows.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </TabsContent>
  );
}

function CareThreadTabContent({
  personnel,
  activities,
}: {
  personnel: CarePersonnel;
  activities: ActivityLogEntry[];
}) {
  const [draft, setDraft] = useState("");
  const createThreadPost = useCreateCareThreadPost();
  const threadEntries = activities;

  return (
    <TabsContent
      value="care-thread"
      className="animate-in fade-in duration-300"
    >
      <Card className="border-zinc-200 shadow-sm min-h-[400px]">
        <CardHeader className="border-b border-zinc-50">
          <CardTitle className="text-base font-semibold">Care Thread</CardTitle>
          <CardDescription className="text-xs">
            Shared updates and contextual care notes for {personnel.name}.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          {threadEntries.length === 0 ? (
            <div className="rounded-xl border border-zinc-100 bg-zinc-50 p-4 text-xs text-zinc-500">
              No thread updates yet.
            </div>
          ) : (
            threadEntries.map((entry) => (
              <div
                key={entry.id}
                className="rounded-xl border border-zinc-100 bg-white p-4 shadow-sm"
              >
                <div className="mb-2 flex items-center justify-between text-[11px]">
                  <span className="font-semibold uppercase tracking-wider text-zinc-500">
                    {entry.authorName}
                  </span>
                  <span className="text-zinc-400">
                    {makeDisplayDate(entry.date).toLocaleString()}
                  </span>
                </div>
                <RichTextViewer value={entry.content} />
              </div>
            ))
          )}

          <div className="rounded-xl border border-zinc-200 p-4">
            <LegacyRichTextEditor
              value={draft}
              onChange={setDraft}
              placeholder="Post an update to the care thread..."
            />
            <div className="mt-3 flex justify-end">
              <Button
                size="sm"
                className="h-8 font-semibold bg-zinc-900 text-white"
                onClick={async () => {
                  if (!draft.trim()) return;
                  await createThreadPost.mutateAsync({
                    personnelId: personnel.id,
                    content: draft,
                  });
                  setDraft("");
                }}
                disabled={createThreadPost.isPending}
              >
                {createThreadPost.isPending ? "Posting..." : "Post Update"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </TabsContent>
  );
}

function CarePlanTabContent({ personnel }: { personnel: CarePersonnel }) {
  const upsertCareGoal = useCreateOrUpdateCareGoal();
  const upsertCareRequirement = useUpsertCareRequirement();
  const planItems = personnel.careGaps.length
    ? personnel.careGaps.map((gap, index) => ({
        id: `${personnel.id}-${index}`,
        title: gap,
        status: index === 0 ? "Overdue" : "Pending",
      }))
    : [
        {
          id: `${personnel.id}-routine`,
          title: "Routine monthly wellness check-in",
          status: "Pending",
        },
      ];

  return (
    <TabsContent value="care-plan" className="animate-in fade-in duration-300">
      <Card className="border-zinc-200 shadow-sm min-h-[400px]">
        <CardHeader className="border-b border-zinc-50">
          <div className="flex items-center justify-between gap-3">
            <div>
              <CardTitle className="text-base font-semibold">
                Care Plan
              </CardTitle>
              <CardDescription className="text-xs">
                Goals, interventions, and due care tasks for this member.
              </CardDescription>
            </div>
            <Button
              size="sm"
              className="h-8 bg-zinc-900 text-white"
              onClick={async () => {
                await upsertCareGoal.mutateAsync({
                  personnelId: personnel.id,
                  title: `Follow-up plan (${makeDisplayDate().toLocaleDateString()})`,
                  status: "active",
                });
              }}
              disabled={upsertCareGoal.isPending}
            >
              {upsertCareGoal.isPending ? "Saving..." : "Add Goal"}
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-8"
              onClick={async () => {
                await upsertCareRequirement.mutateAsync({
                  personnelId: personnel.id,
                  activityType: "Check-in",
                  intervalDays: 30,
                  notes: "Monthly wellness check-in cadence.",
                });
              }}
              disabled={upsertCareRequirement.isPending}
            >
              {upsertCareRequirement.isPending
                ? "Saving..."
                : "Add Requirement"}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-3">
          {planItems.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between rounded-xl border border-zinc-100 bg-white p-4"
            >
              <div>
                <p className="text-sm font-semibold text-zinc-900">
                  {item.title}
                </p>
                <p className="text-[11px] text-zinc-500">
                  Owner: Member Care Team
                </p>
              </div>
              <Badge
                className={cn(
                  "border-none",
                  item.status === "Overdue"
                    ? "bg-destructive text-destructive-foreground"
                    : "bg-sky-500/10 text-sky-700",
                )}
              >
                {item.status}
              </Badge>
            </div>
          ))}
        </CardContent>
      </Card>
    </TabsContent>
  );
}

function ActivityTabContent({
  activities,
  heatmapData,
}: {
  activities: ActivityLogEntry[];
  heatmapData: Array<{ date: string; intensity: number; type: string }>;
}) {
  return (
    <TabsContent
      value="activity"
      className="space-y-6 animate-in fade-in duration-300"
    >
      <Card className="border-zinc-200 shadow-sm">
        <CardHeader className="border-b border-zinc-50">
          <CardTitle className="text-base font-semibold">
            Activity Log
          </CardTitle>
          <CardDescription className="text-xs">
            Full chronological care activity timeline.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-3">
          {activities.map((activity) => (
            <div
              key={activity.id}
              className="rounded-xl border border-zinc-100 bg-zinc-50/40 p-4"
            >
              <div className="mb-1 flex items-center justify-between">
                <p className="text-sm font-semibold text-zinc-900">
                  {activity.type}
                </p>
                <p className="text-[11px] text-zinc-400">
                  {makeDisplayDate(activity.date).toLocaleString()}
                </p>
              </div>
              <p className="text-xs text-zinc-600">{activity.content}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="border-zinc-200 shadow-sm">
        <CardHeader className="border-b border-zinc-50">
          <CardTitle className="text-base font-semibold">
            Activity Heatmap
          </CardTitle>
          <CardDescription className="text-xs">
            Contact intensity over recent weeks.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <HealthHeatmap data={heatmapData} />
        </CardContent>
      </Card>
    </TabsContent>
  );
}

function SecureNotesTabContent({
  personnelId,
  privateNotes,
}: {
  personnelId: string;
  privateNotes: MemberCarePrivateNote[];
}) {
  const [draft, setDraft] = useState("");
  const createPrivateNote = useCreateCarePrivateNote();

  return (
    <TabsContent
      value="secure-notes"
      className="animate-in fade-in duration-300"
    >
      <Card className="border-zinc-200 shadow-sm min-h-[400px] border-amber-100 bg-amber-50/5">
        <CardHeader className="flex flex-row items-center justify-between border-b border-amber-50">
          <div>
            <div className="flex items-center gap-2">
              <CardTitle className="text-base font-semibold">
                Private Pastoral Notes
              </CardTitle>
              <Lock className="size-3.5 text-amber-600" />
            </div>
            <CardDescription className="text-xs text-amber-700/60">
              Only visible to you and platform super admins.
            </CardDescription>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="h-8 font-semibold border-amber-200 text-amber-700 hover:bg-amber-100"
          >
            <Plus className="mr-2 size-3.5" /> Add Private Note
          </Button>
        </CardHeader>
        <CardContent className="space-y-4 p-6">
          <div className="rounded-xl border border-amber-200/60 bg-amber-50 p-4 text-[11px] text-amber-900">
            Private notes are visible only to the author and platform super
            admins. They are for internal ministry/admin use only. Do not store
            regulated or legally protected information unless your organization
            has explicitly approved that use.
          </div>
          {privateNotes.length > 0 ? (
            <div className="space-y-4">
              {privateNotes.map((note) => (
                <div
                  key={note.id}
                  className="p-4 rounded-xl border border-amber-100 bg-white shadow-sm space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-amber-900">
                      {note.authorName}
                    </span>
                    <span className="text-[10px] text-zinc-400 font-medium">
                      {makeDisplayDate(note.date).toLocaleDateString()}
                    </span>
                  </div>
                  <RichTextViewer value={note.content} />
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-amber-400">
              <Lock className="size-12 mb-4 opacity-20" />
              <p className="text-sm font-medium">No private notes yet</p>
            </div>
          )}

          <div className="rounded-xl border border-amber-200/60 bg-white p-4">
            <LegacyRichTextEditor
              value={draft}
              onChange={setDraft}
              placeholder="Add a secure note..."
            />
            <div className="mt-3 flex justify-end">
              <Button
                size="sm"
                className="h-8 font-semibold bg-amber-600 text-white hover:bg-amber-500"
                onClick={async () => {
                  if (!draft.trim()) return;
                  await createPrivateNote.mutateAsync({
                    personnelId,
                    content: draft,
                  });
                  setDraft("");
                }}
                disabled={createPrivateNote.isPending}
              >
                {createPrivateNote.isPending ? "Saving..." : "Save Secure Note"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </TabsContent>
  );
}

export function PersonnelProfile({
  personnel,
  activities,
  privateNotes,
}: PersonnelProfileProps) {
  const [localTime, setLocalTime] = useState<string | null>(null);
  const logCareActivity = useLogCareActivity();
  const setManualAttention = useSetManualAttentionFlag();

  const heatmapData = useMemo(
    () =>
      activities.map((a, index) => ({
        date: a.date.split("T")[0] ?? "",
        intensity: (index % 4) + 1,
        type: a.type,
      })),
    [activities],
  );

  useEffect(() => {
    const updateTime = () => {
      setLocalTime(
        makeDisplayDate().toLocaleTimeString("en-US", {
          timeZone: personnel.timezone,
          hour: "2-digit",
          minute: "2-digit",
        }),
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 60000);
    return () => clearInterval(timer);
  }, [personnel.timezone]);

  return (
    <div className="space-y-6">
      <PersonnelProfileHeaderCard
        personnel={personnel}
        localTime={localTime}
        onLogCheckIn={async () => {
          await logCareActivity.mutateAsync({
            personnelId: personnel.id,
            type: "Check-in",
            content: "Quick wellness check-in logged from profile header.",
          });
        }}
        onToggleManualAttention={async () => {
          await setManualAttention.mutateAsync({
            personnelId: personnel.id,
            manualAttention: !Boolean(personnel.manualAttention),
          });
        }}
        isLoggingCheckIn={logCareActivity.isPending}
        isUpdatingAttention={setManualAttention.isPending}
      />

      <Tabs defaultValue="overview" className="w-full">
        <div className="flex items-center justify-between border-b border-zinc-200 mb-6 pb-px">
          <div className="flex gap-8">
            {[
              "overview",
              "care-thread",
              "care-plan",
              "activity",
              "secure-notes",
            ].map((tab) => (
              <TabsTrigger
                key={tab}
                value={tab}
                className="px-0 py-3 text-sm font-semibold text-zinc-500 data-[state=active]:text-zinc-900 data-[state=active]:shadow-[0_2px_0_0_#0f172a] rounded-none transition-none capitalize"
              >
                {tab.replace("-", " ")}
              </TabsTrigger>
            ))}
          </div>
        </div>

        <OverviewTabContentSection
          personnel={personnel}
          activities={activities}
          heatmapData={heatmapData}
        />

        <CareThreadTabContent personnel={personnel} activities={activities} />

        <CarePlanTabContent personnel={personnel} />

        <ActivityTabContent activities={activities} heatmapData={heatmapData} />

        <SecureNotesTabContent
          personnelId={personnel.id}
          privateNotes={privateNotes}
        />
      </Tabs>
    </div>
  );
}
