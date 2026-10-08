"use client";

import { Badge } from "@asym/ui/components/shadcn/badge";
import { Button } from "@asym/ui/components/shadcn/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@asym/ui/components/shadcn/card";
import { cn } from "@asym/ui/lib/utils";
import { Clock, ArrowRightLeft } from "lucide-react";
import React from "react";

interface TimezoneSchedulerProps {
  remoteTimezone: string;
  remoteName: string;
}

function createClockStore() {
  let timestamp: number | null = null;

  return {
    getSnapshot: () => timestamp,
    subscribe(onStoreChange: () => void) {
      timestamp = Date.now();
      const timer = setInterval(() => {
        timestamp = Date.now();
        onStoreChange();
      }, 1000);
      return () => clearInterval(timer);
    },
  };
}

const getServerTimeSnapshot = () => null;

export function TimezoneScheduler({
  remoteTimezone,
  remoteName,
}: TimezoneSchedulerProps) {
  const [clock] = React.useState(createClockStore);
  const timestamp = React.useSyncExternalStore(
    clock.subscribe,
    clock.getSnapshot,
    getServerTimeSnapshot,
  );
  const localTime = timestamp === null ? null : new Date(timestamp);

  const hasLocalTime = localTime !== null;
  const remoteTimeFormatter = React.useMemo(
    () =>
      hasLocalTime
        ? new Intl.DateTimeFormat("en-US", {
            timeZone: remoteTimezone,
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: true,
          })
        : null,
    [hasLocalTime, remoteTimezone],
  );
  const remoteHourFormatter = React.useMemo(
    () =>
      hasLocalTime
        ? new Intl.DateTimeFormat("en-US", {
            timeZone: remoteTimezone,
            hour: "numeric",
            hour12: false,
          })
        : null,
    [hasLocalTime, remoteTimezone],
  );

  const remoteTime =
    localTime && remoteTimeFormatter
      ? remoteTimeFormatter.format(localTime)
      : "--:--:-- --";

  const localTimeStr = localTime
    ? localTime.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      })
    : "--:--:-- --";

  const isRemoteWorkingHours = () => {
    if (!localTime || !remoteHourFormatter) return false;
    const hour = parseInt(remoteHourFormatter.format(localTime));
    return hour >= 9 && hour <= 17;
  };

  const working = isRemoteWorkingHours();

  return (
    <Card className="border-border shadow-sm overflow-hidden bg-muted/50">
      <CardHeader className="pb-2 border-b border-border bg-card">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
            <Clock className="size-3.5" /> Timezone Check
          </CardTitle>
          <Badge variant={working ? "success" : "secondary"}>
            {working ? "Within Working Hours" : "Outside Working Hours"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0 flex-1 space-y-1">
            <p className="text-xs font-bold text-muted-foreground uppercase">
              My Time
            </p>
            <p className="text-base font-semibold text-foreground tabular-nums sm:text-xl">
              {localTimeStr}
            </p>
            <p className="text-xs text-muted-foreground font-medium truncate">
              Local Timezone
            </p>
          </div>

          <div className="hidden size-10 rounded-full bg-card sm:flex border border-border items-center justify-center shadow-sm">
            <ArrowRightLeft className="size-4 text-muted-foreground" />
          </div>

          <div className="min-w-0 flex-1 space-y-1 sm:text-right">
            <p className="text-xs font-bold text-muted-foreground uppercase">
              {remoteName}&apos;s Time
            </p>
            <p className="text-base font-semibold text-foreground tabular-nums sm:text-xl">
              {remoteTime}
            </p>
            <p className="text-xs text-muted-foreground font-medium truncate">
              {remoteTimezone}
            </p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card p-3">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "size-2 rounded-full",
                working ? "bg-success" : "bg-muted-foreground",
              )}
            />
            <span className="text-xs font-bold text-muted-foreground">
              Recommended contact: 2PM - 4PM (Your Time)
            </span>
          </div>
          <Button variant="ghost" size="sm" className="text-info">
            Schedule Call
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
