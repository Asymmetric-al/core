"use client";

import { PageShell } from "@asym/ui/components/primitives/page-shell";
import {
  Alert,
  AlertTitle,
  AlertDescription,
} from "@asym/ui/components/shadcn/alert";
import { Badge } from "@asym/ui/components/shadcn/badge";
import { Button, buttonVariants } from "@asym/ui/components/shadcn/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@asym/ui/components/shadcn/card";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@asym/ui/components/shadcn/empty";
import { Skeleton } from "@asym/ui/components/shadcn/skeleton";
import { Flag, UserX } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useId, useSyncExternalStore } from "react";

import type {
  ActivityLogEntry,
  CarePersonnel,
} from "@/features/mission-control/care/types";
import type {
  MemberCareGoal,
  MemberCareRequirement,
} from "@asym/database/hooks";

import {
  CareStatusBadge,
  ACTIVITY_TYPE_LABELS,
  formatLastContact,
} from "@/features/mission-control/care/components/care-display";
import {
  PersonnelProfile,
  PersonnelProfileActions,
} from "@/features/mission-control/care/components/PersonnelProfile";
import { useMemberCareDetailQuery } from "@/features/mission-control/care/hooks/use-care";
import {
  getLastContactDate,
  DEFAULT_ROUTINE_INTERVAL_DAYS,
  toCareRequirements,
} from "@/features/mission-control/care/member-care.derived";
import { formatDate } from "@/features/mission-control/care/utils";

const minuteClock = {
  subscribe(onChange: () => void) {
    const timer = setInterval(onChange, 60_000);
    return () => clearInterval(timer);
  },
  getSnapshot: () => Math.floor(Date.now() / 60_000),
  getServerSnapshot: () => null,
};

function useLocalTime(timeZone: string) {
  const minute = useSyncExternalStore(
    minuteClock.subscribe,
    minuteClock.getSnapshot,
    minuteClock.getServerSnapshot,
  );
  if (minute === null) return null;
  const now = new Date(minute * 60_000);
  try {
    const time = new Intl.DateTimeFormat("en-US", {
      timeZone,
      hour: "numeric",
      minute: "2-digit",
    }).format(now);
    const hour = Number(
      new Intl.DateTimeFormat("en-US", {
        timeZone,
        hour: "numeric",
        hourCycle: "h23",
      }).format(now),
    );
    return { time, workingHours: hour >= 9 && hour < 17 };
  } catch {
    return null;
  }
}

function CareFactsCard({
  title,
  rows,
}: {
  title: string;
  rows: Array<[string, React.ReactNode]>;
}) {
  const headingId = useId();
  return (
    <section aria-labelledby={headingId}>
      <Card>
        <CardHeader>
          <CardTitle>
            <h2 id={headingId}>{title}</h2>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="flex flex-col gap-3 text-sm">
            {rows.map(([label, value]) => (
              <div
                key={label}
                className="flex items-start justify-between gap-4"
              >
                <dt className="text-muted-foreground">{label}</dt>
                <dd className="text-right">{value}</dd>
              </div>
            ))}
          </dl>
        </CardContent>
      </Card>
    </section>
  );
}

function CareDetailsCard({
  personnel,
  activities,
  requirements,
  goals,
}: {
  personnel: CarePersonnel;
  activities: ActivityLogEntry[];
  requirements: MemberCareRequirement[];
  goals: MemberCareGoal[];
}) {
  const local = useLocalTime(personnel.timezone);
  return (
    <CareFactsCard
      title="Details"
      rows={[
        [
          "Status",
          <div key="status" className="flex flex-wrap justify-end gap-1">
            <CareStatusBadge status={personnel.status} />
            {personnel.manualAttention ? (
              <Badge variant="outline">
                <Flag aria-hidden="true" />
                Flagged
              </Badge>
            ) : null}
          </div>,
        ],
        [
          "Contact schedule",
          requirements.length
            ? toCareRequirements(requirements).map((requirement) => (
                <div key={requirement.id}>
                  {ACTIVITY_TYPE_LABELS[requirement.activityType]} every{" "}
                  {requirement.intervalDays} days
                </div>
              ))
            : `Check-in every ${DEFAULT_ROUTINE_INTERVAL_DAYS} days (default)`,
        ],
        [
          "Open goals",
          goals.filter((goal) => goal.status !== "completed").length,
        ],
        [
          "Last contact",
          formatLastContact(getLastContactDate(personnel, activities)),
        ],
        ["Birthday", formatDate(personnel.birthDate ?? null) || "Not recorded"],
        [
          "Local time",
          local
            ? `${local.time} · ${local.workingHours ? "working hours" : "outside working hours"}`
            : "—",
        ],
      ]}
    />
  );
}

function CareAssignmentCard({ personnel }: { personnel: CarePersonnel }) {
  return (
    <CareFactsCard
      title="Assignment"
      rows={[
        ["Role", personnel.role],
        ["Location", personnel.location],
        ["Region", personnel.region],
      ]}
    />
  );
}

export default function CareProfilePage() {
  const { id } = useParams<{ id: string }>();
  const profile = useMemberCareDetailQuery(id);
  const personnel = profile.data?.personnel;
  const activities = profile.data?.activities ?? [];

  if (profile.isPending) {
    return (
      <div className="flex flex-col gap-6 p-4 sm:p-6 lg:p-7" aria-busy="true">
        <Skeleton className="h-12 w-72" />
        <div className="grid gap-6 xl:grid-cols-3">
          <Skeleton className="h-72 rounded-xl xl:col-start-3 xl:row-start-1" />
          <Skeleton className="h-96 rounded-xl xl:col-span-2 xl:col-start-1 xl:row-start-1" />
        </div>
      </div>
    );
  }

  if (profile.isError) {
    return (
      <PageShell title="Care profile" density="compact">
        <Alert variant="destructive">
          <AlertTitle>Couldn&apos;t load this care profile</AlertTitle>
          <AlertDescription>
            {profile.error instanceof Error
              ? profile.error.message
              : "The care record is unavailable."}
            <Button variant="outline" onClick={() => void profile.refetch()}>
              Try again
            </Button>
          </AlertDescription>
        </Alert>
      </PageShell>
    );
  }

  if (!personnel) {
    return (
      <PageShell title="Person not found" density="compact">
        <div className="rounded-xl border">
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <UserX />
              </EmptyMedia>
              <EmptyTitle>This care profile does not exist</EmptyTitle>
              <EmptyDescription>
                It may have been removed, or the link is out of date.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Link
                href="/care/directory"
                className={buttonVariants({ variant: "outline" })}
              >
                Back to the directory
              </Link>
            </EmptyContent>
          </Empty>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell
      title={personnel.nameMissing ? "Member profile" : personnel.name}
      description={`${personnel.nameMissing ? "Name not set · " : ""}${personnel.role} · ${personnel.location}`}
      density="compact"
      actions={<PersonnelProfileActions personnel={personnel} />}
    >
      <div className="grid items-start gap-6 xl:grid-cols-3">
        <div className="flex min-w-0 flex-col gap-6 xl:col-start-3 xl:row-start-1">
          <CareDetailsCard
            personnel={personnel}
            activities={activities}
            requirements={profile.data?.requirements ?? []}
            goals={profile.data?.goals ?? []}
          />
          <div className="hidden xl:block">
            <CareAssignmentCard personnel={personnel} />
          </div>
        </div>
        <div className="min-w-0 xl:col-span-2 xl:col-start-1 xl:row-start-1">
          <PersonnelProfile
            personnel={personnel}
            activities={activities}
            privateNotes={profile.data?.privateNotes ?? []}
            goals={profile.data?.goals ?? []}
            requirements={profile.data?.requirements ?? []}
          />
        </div>
        <div className="min-w-0 xl:hidden">
          <CareAssignmentCard personnel={personnel} />
        </div>
      </div>
    </PageShell>
  );
}
