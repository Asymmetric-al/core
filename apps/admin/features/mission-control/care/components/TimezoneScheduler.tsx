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

export function TimezoneScheduler({
  remoteTimezone,
  remoteName,
}: TimezoneSchedulerProps) {
  const [localTime, setLocalTime] = React.useState<Date | null>(null);

  React.useEffect(() => {
    setLocalTime(new Date());
    const timer = setInterval(() => setLocalTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const remoteTime = localTime
    ? new Intl.DateTimeFormat("en-US", {
        timeZone: remoteTimezone,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      }).format(localTime)
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
    if (!localTime) return false;
    const hour = parseInt(
      new Intl.DateTimeFormat("en-US", {
        timeZone: remoteTimezone,
        hour: "numeric",
        hour12: false,
      }).format(localTime),
    );
    return hour >= 9 && hour <= 17;
  };

  const working = isRemoteWorkingHours();

  return (
    <Card className="border-zinc-200 shadow-sm overflow-hidden bg-zinc-50/50">
      <CardHeader className="pb-2 border-b border-zinc-100 bg-white">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
            <Clock className="size-3.5" /> Timezone Check
          </CardTitle>
          <Badge
            variant={working ? "default" : "outline"}
            className={cn(
              "text-[10px] font-bold h-5",
              working
                ? "bg-emerald-500 text-white border-none"
                : "bg-zinc-100 text-zinc-500 border-zinc-200",
            )}
          >
            {working ? "Within Working Hours" : "Outside Working Hours"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 space-y-1">
            <p className="text-[10px] font-bold text-zinc-400 uppercase">
              My Time
            </p>
            <p className="text-xl font-bold text-zinc-900 tabular-nums">
              {localTimeStr}
            </p>
            <p className="text-[10px] text-zinc-500 font-medium truncate">
              Local Timezone
            </p>
          </div>

          <div className="size-10 rounded-full bg-white border border-zinc-200 flex items-center justify-center shadow-sm">
            <ArrowRightLeft className="size-4 text-zinc-400" />
          </div>

          <div className="flex-1 text-right space-y-1">
            <p className="text-[10px] font-bold text-zinc-400 uppercase">
              {remoteName}&apos;s Time
            </p>
            <p className="text-xl font-bold text-zinc-900 tabular-nums">
              {remoteTime}
            </p>
            <p className="text-[10px] text-zinc-500 font-medium truncate">
              {remoteTimezone}
            </p>
          </div>
        </div>

        <div className="mt-6 p-3 rounded-lg bg-white border border-zinc-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "size-2 rounded-full",
                working ? "bg-emerald-500" : "bg-zinc-300",
              )}
            />
            <span className="text-xs font-bold text-zinc-700">
              Recommended contact: 2PM - 4PM (Your Time)
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-[10px] font-bold uppercase text-blue-600 hover:text-blue-700 hover:bg-blue-50"
          >
            Schedule Call
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
