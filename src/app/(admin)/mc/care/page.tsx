"use client";

import React from "react";
import {
  useCarePersonnel,
  useCareActivity,
} from "@/features/mission-control/care/hooks/use-care";
import { CareDashboard } from "@/features/mission-control/care/components/CareDashboard";
import { CareTools } from "@/features/mission-control/care/components/CareTools";
import { Button } from "@asym/ui/components/shadcn/button";
import { Heart, BookOpen } from "lucide-react";
import { Skeleton } from "@asym/ui/components/shadcn/skeleton";
import { cn } from "@asym/lib/utils";

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
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32 w-full rounded-2xl" />
          ))}
        </div>
        <div className="grid-12">
          <Skeleton className="lg:col-span-8 h-[600px] w-full rounded-2xl" />
          <Skeleton className="lg:col-span-4 h-[600px] w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="container-responsive py-responsive-section section-gap animate-in fade-in duration-500 pb-32">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-responsive-md">
        <div className="page-header">
          <h1 className="text-responsive-h1 text-primary tracking-tight">
            Member Care
          </h1>
          <p className="text-responsive-body text-muted-foreground font-medium max-w-2xl">
            Holistic support and health monitoring for your global team.
          </p>
        </div>
        <div className="flex gap-responsive-sm shrink-0">
          <Button
            variant="outline"
            className="btn-responsive font-bold border-border hover:bg-muted"
          >
            <BookOpen className="mr-2 h-4 w-4 text-muted-foreground" />
            <span className="hide-mobile">Resources</span>
            <span className="show-mobile-only">Docs</span>
          </Button>
          <Button className="btn-responsive font-bold bg-primary text-primary-foreground hover:opacity-90 shadow-sm">
            <Heart className="mr-2 h-4 w-4 fill-current" />
            Log Check-in
          </Button>
        </div>
      </div>

      <CareDashboard
        personnel={personnel || []}
        activities={activities || []}
      />

      <CareTools personnel={personnel || []} />
    </div>
  );
}
