"use client";

import React, { useMemo, useState, useEffect } from "react";
import {
  CarePersonnel,
  ActivityLogEntry,
  CareThread,
  CarePlan,
} from "../types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { HealthHeatmap } from "./HealthHeatmap";
import {
  Heart,
  MessageCircle,
  ClipboardList,
  Lock,
  Clock,
  MapPin,
  Globe,
  Phone,
  Mail,
  Calendar,
  AlertTriangle,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface PersonnelProfileProps {
  personnel: CarePersonnel;
  activities: ActivityLogEntry[];
}

export function PersonnelProfile({
  personnel,
  activities,
}: PersonnelProfileProps) {
  const [localTime, setLocalTime] = useState<string | null>(null);

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
        new Date().toLocaleTimeString("en-US", {
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
      {/* Header Card */}
      <Card className="border-slate-200 shadow-sm overflow-hidden">
        <div className="h-24 bg-gradient-to-r from-slate-900 to-slate-800" />
        <CardContent className="relative pt-0 pb-6 px-6">
          <div className="flex flex-col md:flex-row items-start md:items-end gap-4 -mt-10">
            <Avatar className="h-24 w-24 border-4 border-white shadow-lg bg-white">
              <AvatarImage src={personnel.avatarUrl} />
              <AvatarFallback className="text-2xl font-bold">
                {personnel.initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold text-slate-900">
                  {personnel.name}
                </h2>
                <Badge
                  className={cn(
                    "font-bold",
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
              <div className="flex flex-wrap gap-4 text-xs text-slate-500 font-medium">
                <div className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5" /> {personnel.location}
                </div>
                <div className="flex items-center gap-1.5">
                  <Globe className="h-3.5 w-3.5" /> {personnel.region}
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" /> {localTime || "--:--"}{" "}
                  (Local)
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-9 px-4 font-bold border-slate-200"
              >
                <Phone className="mr-2 h-4 w-4 text-slate-400" /> Call
              </Button>
              <Button className="h-9 px-4 font-bold bg-slate-900 text-white hover:bg-slate-800 shadow-lg shadow-slate-200">
                <Heart className="mr-2 h-4 w-4" /> Log Check-in
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="overview" className="w-full">
        <div className="flex items-center justify-between border-b border-slate-200 mb-6 pb-px">
          <div className="flex gap-8">
            {["overview", "threads", "care-plans", "private-notes"].map(
              (tab) => (
                <TabsTrigger
                  key={tab}
                  value={tab}
                  className="px-0 py-3 text-sm font-bold text-slate-500 data-[state=active]:text-slate-900 data-[state=active]:shadow-[0_2px_0_0_#0f172a] rounded-none transition-none capitalize"
                >
                  {tab.replace("-", " ")}
                </TabsTrigger>
              ),
            )}
          </div>
        </div>

        <TabsContent
          value="overview"
          className="space-y-6 animate-in fade-in duration-300"
        >
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="md:col-span-2 border-slate-200 shadow-sm">
              <CardHeader className="pb-3 border-b border-slate-50">
                <CardTitle className="text-base font-bold">
                  Wellness Heatmap
                </CardTitle>
                <CardDescription className="text-xs">
                  Interaction frequency and intensity over the last 90 days.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <HealthHeatmap data={heatmapData} />
                <div className="mt-6 space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Recent Activity
                  </h4>
                  <div className="space-y-3">
                    {activities.map((activity) => (
                      <div
                        key={activity.id}
                        className="flex gap-3 p-3 rounded-lg border border-slate-100 bg-slate-50/30"
                      >
                        <div className="mt-0.5">
                          {activity.type === "Video Call" ? (
                            <Phone className="h-4 w-4 text-blue-500" />
                          ) : (
                            <MessageCircle className="h-4 w-4 text-emerald-500" />
                          )}
                        </div>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-bold text-slate-900">
                              {activity.type}
                            </span>
                            <span className="text-[10px] text-slate-400 font-medium">
                              {new Date(activity.date).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 leading-relaxed">
                            {activity.content}
                          </p>
                          <div className="text-[10px] text-slate-400 font-bold uppercase">
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
              <Card className="border-slate-200 shadow-sm">
                <CardHeader className="pb-3 border-b border-slate-50">
                  <CardTitle className="text-base font-bold">
                    Health Signals
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  {Object.entries(personnel.healthSignals).map(
                    ([key, value]) => (
                      <div key={key} className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs font-bold capitalize">
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
                        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
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
                    ),
                  )}
                </CardContent>
              </Card>

              {personnel.careGaps.length > 0 && (
                <Card className="border-rose-100 bg-rose-50/30 shadow-sm">
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2 text-rose-900">
                      <AlertTriangle className="h-4 w-4" />
                      <CardTitle className="text-sm font-bold uppercase">
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
                          <div className="h-1 w-1 rounded-full bg-rose-400" />
                          {gap}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent
          value="threads"
          className="animate-in fade-in duration-300"
        >
          <Card className="border-slate-200 shadow-sm min-h-[400px]">
            <CardHeader className="flex flex-row items-center justify-between border-b border-slate-50">
              <div>
                <CardTitle className="text-base font-bold">
                  Care Threads
                </CardTitle>
                <CardDescription className="text-xs">
                  Collaborative discussions regarding {personnel.name}&apos;s
                  wellbeing.
                </CardDescription>
              </div>
              <Button
                size="sm"
                className="h-8 font-bold bg-slate-900 text-white"
              >
                <Plus className="mr-2 h-3.5 w-3.5" /> New Thread
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                <MessageCircle className="h-12 w-12 mb-4 opacity-20" />
                <p className="text-sm font-medium">No active care threads</p>
                <p className="text-xs">
                  Start a conversation with the team about this personnel.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent
          value="care-plans"
          className="animate-in fade-in duration-300"
        >
          <Card className="border-slate-200 shadow-sm min-h-[400px]">
            <CardHeader className="flex flex-row items-center justify-between border-b border-slate-50">
              <div>
                <CardTitle className="text-base font-bold">
                  Active Care Plans
                </CardTitle>
                <CardDescription className="text-xs">
                  Structured support and intervention strategies.
                </CardDescription>
              </div>
              <Button
                size="sm"
                className="h-8 font-bold bg-slate-900 text-white"
              >
                <ClipboardList className="mr-2 h-3.5 w-3.5" /> Create Plan
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                <ClipboardList className="h-12 w-12 mb-4 opacity-20" />
                <p className="text-sm font-medium">No active care plans</p>
                <p className="text-xs">
                  Plans help track goals and intervention steps.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent
          value="private-notes"
          className="animate-in fade-in duration-300"
        >
          <Card className="border-slate-200 shadow-sm min-h-[400px] border-amber-100 bg-amber-50/5">
            <CardHeader className="flex flex-row items-center justify-between border-b border-amber-50">
              <div>
                <div className="flex items-center gap-2">
                  <CardTitle className="text-base font-bold">
                    Private Pastoral Notes
                  </CardTitle>
                  <Lock className="h-3.5 w-3.5 text-amber-600" />
                </div>
                <CardDescription className="text-xs text-amber-700/60">
                  Only visible to Care Leads and Directors.
                </CardDescription>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="h-8 font-bold border-amber-200 text-amber-700 hover:bg-amber-100"
              >
                <Plus className="mr-2 h-3.5 w-3.5" /> Add Private Note
              </Button>
            </CardHeader>
            <CardContent className="p-6">
              {activities.filter((a) => a.isPrivate).length > 0 ? (
                <div className="space-y-4">
                  {activities
                    .filter((a) => a.isPrivate)
                    .map((note) => (
                      <div
                        key={note.id}
                        className="p-4 rounded-xl border border-amber-100 bg-white shadow-sm space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-amber-900">
                            {note.authorName}
                          </span>
                          <span className="text-[10px] text-slate-400 font-medium">
                            {new Date(note.date).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm text-slate-700 italic font-medium leading-relaxed">
                          &ldquo;{note.content}&rdquo;
                        </p>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-amber-400">
                  <Lock className="h-12 w-12 mb-4 opacity-20" />
                  <p className="text-sm font-medium">No private notes yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
