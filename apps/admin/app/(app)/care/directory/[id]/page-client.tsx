"use client";

import { useWithinViewTransitionRouteLayer } from "@asym/lib/view-transitions";
import { Button } from "@asym/ui/components/shadcn/button";
import { Skeleton } from "@asym/ui/components/shadcn/skeleton";
import { cn } from "@asym/ui/lib/utils";
import { ChevronLeft, MoreVertical, Edit } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import React from "react";

import { PersonnelProfile } from "@/features/mission-control/care/components/PersonnelProfile";
import { TimezoneScheduler } from "@/features/mission-control/care/components/TimezoneScheduler";
import {
  useCareProfile,
  useCareActivity,
  useCarePrivateNotes,
} from "@/features/mission-control/care/hooks/use-care";

export default function CareProfilePage() {
  const { id } = useParams();
  // Route VT owns the entrance when active; only animate on plain mounts.
  const withinRouteVt = useWithinViewTransitionRouteLayer();
  const { data: personnel, isLoading: loadingProfile } = useCareProfile(
    id as string,
  );
  const { data: activities, isLoading: loadingActivities } = useCareActivity(
    id as string,
  );
  const { data: privateNotes, isLoading: loadingPrivateNotes } =
    useCarePrivateNotes(id as string);

  if (loadingProfile || loadingActivities || loadingPrivateNotes) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-64 w-full rounded-xl" />
        <div className="grid gap-6 md:grid-cols-3">
          <Skeleton className="md:col-span-2 h-100 w-full rounded-xl" />
          <Skeleton className="h-100 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  if (!personnel) {
    return (
      <div className="p-20 text-center text-muted-foreground font-semibold">
        Personnel not found
      </div>
    );
  }

  return (
    <div
      className={cn(
        "p-6 space-y-6",
        !withinRouteVt && "animate-in fade-in duration-300",
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/care/directory"
          className="flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors group"
        >
          <ChevronLeft className="size-4 transition-transform group-hover:-translate-x-0.5" />
          Back to Directory
        </Link>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Edit className="mr-2 size-3.5 text-muted-foreground" /> Edit
            Profile
          </Button>
          <Button
            variant="outline"
            size="icon-sm"
            aria-label="More profile actions"
          >
            <MoreVertical className="size-4 text-muted-foreground" />
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <PersonnelProfile
            personnel={personnel}
            activities={activities || []}
            privateNotes={privateNotes || []}
          />
        </div>
        <div className="lg:col-span-4 space-y-6">
          <TimezoneScheduler
            remoteTimezone={personnel.timezone}
            remoteName={personnel.name.split(" ")[0] ?? "Team Member"}
          />

          <div className="p-6 rounded-xl border border-border bg-card shadow-sm space-y-4 text-left">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Quick Stats
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-xs font-semibold text-muted-foreground uppercase">
                  Last Contact
                </p>
                <p className="text-sm font-semibold text-foreground">
                  2 days ago
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-semibold text-muted-foreground uppercase">
                  Frequency
                </p>
                <p className="text-sm font-semibold text-foreground">
                  Every 14d
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-semibold text-muted-foreground uppercase">
                  Care Lead
                </p>
                <p className="text-sm font-semibold text-foreground">
                  David Ross
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-semibold text-muted-foreground uppercase">
                  Support %
                </p>
                <p className="text-sm font-semibold text-success">92%</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
