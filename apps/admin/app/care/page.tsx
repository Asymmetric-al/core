"use client";

import { Button } from "@asym/ui/components/shadcn/button";
import { PageShell } from "@asym/ui/components/shadcn/page-shell";
import { Skeleton } from "@asym/ui/components/shadcn/skeleton";
import { Heart, BookOpen } from "lucide-react";
import React from "react";

import { CareDashboard } from "@/features/mission-control/care/components/CareDashboard";
import { CareTools } from "@/features/mission-control/care/components/CareTools";
import {
  useCarePersonnel,
  useCareActivity,
} from "@/features/mission-control/care/hooks/use-care";

export default function MemberCareDashboardPage() {
  const { data: personnel, isLoading: loadingPersonnel } = useCarePersonnel();
  const { data: activities, isLoading: loadingActivities } = useCareActivity();

  if (loadingPersonnel || loadingActivities) {
    return (
      <div className="container-responsive py-responsive-section section-gap animate-in fade-in duration-500">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-responsive-md">
          <div className="space-y-2">
            <Skeleton className="h-10 w-48 rounded-xl" />
            <Skeleton className="h-4 w-72 rounded-lg" />
          </div>
          <div className="flex gap-responsive-sm">
            <Skeleton className="h-10 w-28 rounded-xl" />
            <Skeleton className="h-10 w-36 rounded-xl" />
          </div>
        </div>
        <div className="grid-responsive-4">
          {["skeleton-1", "skeleton-2", "skeleton-3", "skeleton-4"].map(
            (skeletonId) => (
              <Skeleton key={skeletonId} className="h-32 w-full rounded-2xl" />
            ),
          )}
        </div>
        <div className="grid-12">
          <Skeleton className="lg:col-span-8 h-[600px] w-full rounded-2xl" />
          <Skeleton className="lg:col-span-4 h-[600px] w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <PageShell
      title="Member Care"
      description="Holistic support and health monitoring for your global team."
      actions={
        <>
          <Button
            variant="outline"
            className="rounded-xl border-zinc-200 font-bold uppercase tracking-widest text-[10px]"
          >
            <BookOpen className="mr-2 h-4 w-4 text-muted-foreground" />
            <span className="hide-mobile">Knowledge Base</span>
            <span className="show-mobile-only">Docs</span>
          </Button>
          <Button className="rounded-xl bg-zinc-900 text-white hover:bg-zinc-800 font-black uppercase tracking-widest text-[10px]">
            <Heart className="mr-2 h-4 w-4 fill-current" />
            New Care Record
          </Button>
        </>
      }
    >
      <div className="space-y-6 animate-in fade-in duration-500 pb-32">
        <CareDashboard
          personnel={personnel || []}
          activities={activities || []}
        />
        <CareTools personnel={personnel || []} />
      </div>
    </PageShell>
  );
}
