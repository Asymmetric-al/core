"use client";

import { Badge } from "@asym/ui/components/shadcn/badge";
import { Button } from "@asym/ui/components/shadcn/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@asym/ui/components/shadcn/card";
import { cn } from "@asym/ui/lib/utils";
import {
  Heart,
  Users,
  AlertTriangle,
  ArrowUpRight,
  Clock,
  ShieldCheck,
} from "lucide-react";
import React from "react";

import {
  getAttentionGaps,
  getCriticalCarePriorities,
  getDashboardNotifications,
  getOpenInterventionsCount,
  getRecentCheckInCount,
} from "../member-care.derived";
import { PersonnelList } from "./PersonnelList";

import type { CarePersonnel, ActivityLogEntry } from "../types";

interface CareDashboardProps {
  personnel: CarePersonnel[];
  activities: ActivityLogEntry[];
}

export function CareDashboard({ personnel, activities }: CareDashboardProps) {
  const attentionGaps = React.useMemo(
    () => getAttentionGaps({ personnel, activities }),
    [personnel, activities],
  );
  const criticalPriorities = React.useMemo(
    () => getCriticalCarePriorities(attentionGaps),
    [attentionGaps],
  );
  const notifications = React.useMemo(
    () => getDashboardNotifications({ personnel, activities }),
    [personnel, activities],
  );
  const upcomingBirthdayNotifications = React.useMemo(
    () => notifications.filter((note) => note.type === "birthday"),
    [notifications],
  );
  const openInterventionsCount = React.useMemo(
    () => getOpenInterventionsCount(personnel),
    [personnel],
  );
  const recentCheckIns = React.useMemo(
    () => getRecentCheckInCount(activities),
    [activities],
  );

  const atRiskCount = personnel.filter(
    (p) => p.status === "At Risk" || p.status === "Crisis",
  ).length;

  const stats = [
    {
      label: "Active Team",
      value: personnel.length,
      icon: Users,
      color: "text-primary",
      bg: "bg-primary/5",
      sub: "tracked personnel",
    },
    {
      label: "Open Interventions",
      value: openInterventionsCount,
      icon: ShieldCheck,
      color: "text-info",
      bg: "bg-info/5",
      sub: "care plans in progress",
    },
    {
      label: "Check-ins (30d)",
      value: recentCheckIns,
      icon: Heart,
      color: "text-success",
      bg: "bg-success/5",
      sub: "wellness updates",
    },
    {
      label: "Risk Alerts",
      value: criticalPriorities.length || atRiskCount,
      icon: AlertTriangle,
      color: atRiskCount > 0 ? "text-destructive" : "text-muted-foreground",
      bg: atRiskCount > 0 ? "bg-destructive/5" : "bg-muted/30",
      sub: atRiskCount > 0 ? "immediate attention" : "all systems clear",
    },
  ];

  return (
    // Entrance is owned by the page wrapper (care/page-client.tsx motion.div).
    <div className="space-y-5">
      {/* Stats Row */}
      <div className="grid-responsive-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="overflow-hidden">
            <CardContent className="p-4">
              <div className="group flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="text-2xl font-black text-primary tracking-tight tabular-nums">
                    {stat.value}
                  </div>
                  <p className="text-sm font-semibold text-foreground">
                    {stat.label}
                  </p>
                  <p className="text-xs font-medium text-muted-foreground">
                    {stat.sub}
                  </p>
                </div>
                <div
                  className={cn(
                    "size-9 rounded-xl flex items-center justify-center transition-transform [@media(hover:hover)_and_(pointer:fine)]:group-hover:scale-105",
                    stat.bg,
                  )}
                >
                  <stat.icon className={cn("size-4", stat.color)} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid-12">
        {/* Personnel List (Main) */}
        <Card className="lg:col-span-8 flex flex-col">
          <CardHeader>
            <div className="flex items-center justify-between gap-4">
              <div>
                <CardTitle className="text-lg font-bold tracking-tight">
                  Health Status Feed
                </CardTitle>
                <CardDescription className="text-xs font-medium">
                  Recent activity and wellness updates across the team.
                </CardDescription>
              </div>
              <Button variant="ghost" size="sm">
                View History
                <ArrowUpRight className="ml-2 size-3.5" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0 flex-1">
            <PersonnelList data={personnel} />
          </CardContent>
        </Card>

        {/* Sidebar Tools */}
        <div className="lg:col-span-4 space-y-5">
          {/* Urgent Alerts */}
          <Card className="overflow-hidden">
            <CardHeader>
              <CardTitle className="text-base font-bold">
                <div className="flex items-center gap-2">
                  <div className="size-2 rounded-full bg-destructive animate-pulse" />
                  Urgent Care Alerts
                </div>
              </CardTitle>
              <CardDescription className="text-xs font-semibold">
                Personnel requiring immediate follow-up.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              {attentionGaps.length > 0 ? (
                attentionGaps.slice(0, 3).map((alert) => (
                  <div
                    key={`${alert.personnelId}-${alert.reason}`}
                    className="p-3 rounded-xl border border-destructive/15 bg-background shadow-sm flex items-start gap-3 hover:border-destructive/35 transition-colors cursor-pointer group"
                  >
                    <div className="size-9 rounded-xl bg-destructive/5 text-destructive flex items-center justify-center border border-destructive/10 shrink-0">
                      <AlertTriangle className="size-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-primary">
                          {alert.reasonLabel}
                        </span>
                        <Badge variant="destructive">
                          {alert.daysOverdue}d
                        </Badge>
                      </div>
                      <p className="text-xs font-medium text-muted-foreground mt-0.5">
                        {alert.personnelName}
                      </p>
                      <p className="text-xs text-destructive mt-1">
                        Follow up today
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-border/50 bg-background p-5 text-xs font-semibold text-muted-foreground">
                  No urgent care gaps right now.
                </div>
              )}
              <Button variant="destructive" className="mt-2 w-full">
                Review All Alerts ({attentionGaps.length})
              </Button>
            </CardContent>
          </Card>

          {/* Upcoming Birthdays */}
          <Card className="overflow-hidden">
            <CardHeader>
              <CardTitle className="text-sm font-semibold">
                Upcoming Birthdays
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-3">
                {upcomingBirthdayNotifications.slice(0, 3).map((note) => {
                  const p = personnel.find(
                    (item) => item.id === note.personnelId,
                  );
                  if (!p) return null;
                  return (
                    <div
                      key={note.id}
                      className="flex items-center justify-between group cursor-pointer hover:bg-muted/30 p-2 -m-2 rounded-xl transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <div className="size-10 rounded-full bg-primary/5 flex items-center justify-center text-xs font-bold text-primary border border-primary/10">
                            {p.initials}
                          </div>
                          <div className="absolute -bottom-0.5 -right-0.5 size-3.5 rounded-full bg-background flex items-center justify-center border border-border/50 shadow-sm">
                            <Clock className="size-2 text-muted-foreground" />
                          </div>
                        </div>
                        <div>
                          <p className="text-sm font-bold text-primary leading-tight">
                            {p.name}
                          </p>
                          <p className="text-xs font-medium text-muted-foreground mt-1">
                            {note.title} • {note.detail}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`Open ${p.name} care profile`}
                      >
                        <ArrowUpRight className="size-4" />
                      </Button>
                    </div>
                  );
                })}
                {upcomingBirthdayNotifications.length === 0 && (
                  <div className="rounded-2xl border border-border/50 bg-background p-5 text-xs font-semibold text-muted-foreground">
                    No upcoming birthdays yet. Care task scheduling is coming
                    soon.
                  </div>
                )}
              </div>
              <div className="mt-5 text-xs font-medium text-muted-foreground">
                Care task scheduling coming soon
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
