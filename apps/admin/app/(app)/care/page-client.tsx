"use client";

import { MetricGrid } from "@asym/ui/components/primitives/metric-card";
import { PageShell } from "@asym/ui/components/primitives/page-shell";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@asym/ui/components/shadcn/alert";
import { Button, buttonVariants } from "@asym/ui/components/shadcn/button";
import { Skeleton } from "@asym/ui/components/shadcn/skeleton";
import { AlertCircle, Users } from "lucide-react";
import Link from "next/link";

import { CareContactTrend } from "@/features/mission-control/care/components/care-contact-trend";
import { CareOverview } from "@/features/mission-control/care/components/CareDashboard";
import { useCareDashboard } from "@/features/mission-control/care/hooks/use-care";

function CareOverviewSkeleton() {
  return (
    <div className="flex flex-col gap-6" aria-busy="true">
      <MetricGrid>
        {["staff", "follow-up", "check-ins", "urgent"].map((key) => (
          <Skeleton key={key} className="h-24 rounded-xl" />
        ))}
      </MetricGrid>
      <div className="grid gap-6 xl:grid-cols-3">
        <Skeleton className="h-96 rounded-xl xl:col-span-2" />
        <Skeleton className="h-96 rounded-xl" />
      </div>
      <CareContactTrend activities={[]} isLoading />
    </div>
  );
}

export default function MemberCareDashboardPage() {
  const dashboard = useCareDashboard();

  return (
    <PageShell
      title="Member Care"
      description="See how field staff are doing and follow up on care needs."
      density="compact"
      actions={
        <Link
          href="/care/directory"
          className={buttonVariants({ variant: "outline", size: "sm" })}
        >
          <Users aria-hidden="true" />
          Open directory
        </Link>
      }
    >
      {dashboard.isError ? (
        <Alert variant="destructive">
          <AlertCircle aria-hidden="true" />
          <AlertTitle>Member Care could not load</AlertTitle>
          <AlertDescription>
            <p>Check your connection and try again.</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => void dashboard.refetch()}
            >
              Try again
            </Button>
          </AlertDescription>
        </Alert>
      ) : dashboard.isLoading || !dashboard.data ? (
        <CareOverviewSkeleton />
      ) : (
        <CareOverview
          personnel={dashboard.data.personnel}
          personnelTotal={dashboard.data.personnelTotal}
          activities={dashboard.data.activities}
          requirements={dashboard.data.requirements}
          lastContacts={dashboard.data.lastContacts}
        />
      )}
    </PageShell>
  );
}
