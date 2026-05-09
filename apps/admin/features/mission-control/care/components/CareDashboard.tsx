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
      color: "text-indigo-600",
      bg: "bg-indigo-50/50",
      sub: "care plans in progress",
    },
    {
      label: "Check-ins (30d)",
      value: recentCheckIns,
      icon: Heart,
      color: "text-emerald-600",
      bg: "bg-emerald-50/50",
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
    <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Stats Row */}
      <div className="grid-responsive-4">
        {stats.map((stat, i) => (
          <Card
            key={stat.label}
            className={cn(
              "border-border/60 shadow-sm overflow-hidden group",
              `stagger-${i + 1}`,
            )}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-3">
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
                    "h-9 w-9 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105",
                    stat.bg,
                  )}
                >
                  <stat.icon className={cn("h-4 w-4", stat.color)} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid-12">
        {/* Personnel List (Main) */}
        <Card className="lg:col-span-8 border-border/60 shadow-sm flex flex-col">
          <CardHeader className="border-b border-border/40 bg-muted/5 px-5 py-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <CardTitle className="text-lg font-bold text-primary tracking-tight">
                  Health Status Feed
                </CardTitle>
                <CardDescription className="text-xs font-medium text-muted-foreground">
                  Recent activity and wellness updates across the team.
                </CardDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-9 font-semibold text-primary"
              >
                View History
                <ArrowUpRight className="ml-2 h-3.5 w-3.5" />
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
          <Card className="border-destructive/20 shadow-sm bg-destructive/[0.02] overflow-hidden">
            <CardHeader className="border-b border-destructive/10 bg-destructive/[0.03] px-5 py-4">
              <CardTitle className="text-base font-bold text-destructive flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-destructive animate-pulse" />
                Urgent Care Alerts
              </CardTitle>
              <CardDescription className="text-xs font-semibold text-destructive/70">
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
                    <div className="h-9 w-9 rounded-xl bg-destructive/5 text-destructive flex items-center justify-center border border-destructive/10 shrink-0">
                      <AlertTriangle className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-primary">
                          {alert.reasonLabel}
                        </span>
                        <Badge className="h-4 px-1 bg-destructive text-destructive-foreground border-none text-[10px] font-black">
                          {alert.daysOverdue}d
                        </Badge>
                      </div>
                      <p className="text-[11px] font-medium text-muted-foreground mt-0.5">
                        {alert.personnelName}
                      </p>
                      <p className="text-[11px] text-destructive/80 mt-1">
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
              <Button className="w-full h-9 font-semibold bg-destructive text-destructive-foreground hover:opacity-90 shadow-lg shadow-destructive/10 mt-2">
                Review All Alerts ({attentionGaps.length})
              </Button>
            </CardContent>
          </Card>

          {/* Upcoming Birthdays */}
          <Card className="border-border/50 shadow-sm overflow-hidden">
            <CardHeader className="pb-3 border-b border-border/30 bg-muted/5 px-5 py-4">
              <CardTitle className="text-sm font-semibold text-foreground">
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
                          <div className="h-10 w-10 rounded-full bg-primary/5 flex items-center justify-center text-[10px] font-bold text-primary border border-primary/10">
                            {p.initials}
                          </div>
                          <div className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-background flex items-center justify-center border border-border/50 shadow-sm">
                            <Clock className="h-2 w-2 text-muted-foreground" />
                          </div>
                        </div>
                        <div>
                          <p className="text-sm font-bold text-primary leading-tight">
                            {p.name}
                          </p>
                          <p className="text-[11px] font-medium text-muted-foreground mt-1">
                            {note.title} • {note.detail}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-lg opacity-0 group-hover:opacity-100 transition-all text-muted-foreground hover:text-primary"
                        aria-label={`Open ${p.name} care profile`}
                      >
                        <ArrowUpRight className="h-4 w-4" />
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
