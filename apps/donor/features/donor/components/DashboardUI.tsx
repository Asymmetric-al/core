"use client";

import React, { useSyncExternalStore } from "react";
import { Skeleton } from "@asym/ui/components/shadcn/skeleton";

export function DashboardSkeleton() {
  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20 pt-4 px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-end">
        <div className="space-y-2">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-6 w-64" />
        </div>
        <Skeleton className="h-10 w-32 rounded-full" />
      </div>
      <Skeleton className="h-48 w-full rounded-3xl" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Skeleton className="h-32 w-full rounded-2xl" />
        <Skeleton className="h-32 w-full rounded-2xl" />
        <Skeleton className="h-32 w-full rounded-2xl" />
      </div>
    </div>
  );
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

function subscribe() {
  return () => {};
}

function getServerSnapshot(): null {
  return null;
}

function getClientSnapshot(): string {
  return getGreeting();
}

export function Greeting() {
  const greeting = useSyncExternalStore(
    subscribe,
    getClientSnapshot,
    getServerSnapshot,
  );

  if (!greeting) return null;
  return <>{greeting}</>;
}
