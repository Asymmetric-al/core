"use client";

import {
  MetricCard,
  MetricGrid,
} from "@asym/ui/components/primitives/metric-card";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@asym/ui/components/shadcn/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@asym/ui/components/shadcn/empty";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@asym/ui/components/shadcn/item";
import { format, formatDistanceToNowStrict, parseISO } from "date-fns";
import { ChevronRight, HeartHandshake, MessageSquareText } from "lucide-react";
import Link from "next/link";
import { useId, useMemo } from "react";

import {
  getRecentCheckInCount,
  getUpcomingBirthdays,
  getPeopleNeedingAttention,
  isLoggedContact,
} from "../member-care.derived";
import { CareContactTrend } from "./care-contact-trend";
import { CareDirectoryLimitNote } from "./care-directory-limit-note";
import {
  ACTIVITY_TYPE_LABELS,
  CarePersonAvatar,
  careProfileHref,
  CareStatusBadge,
  careMemberContext,
} from "./care-display";

import type {
  CareRequirement,
  MemberCareDerivationInput,
} from "../member-care.types";
import type { ActivityLogEntry, CarePersonnel } from "../types";

type FollowUp = { person: CarePersonnel; reason: string; rank: number };

export function getCareFollowUps(
  personnel: CarePersonnel[],
  activities: ActivityLogEntry[] = [],
  requirements: CareRequirement[] = [],
  lastContacts?: MemberCareDerivationInput["lastContacts"],
): FollowUp[] {
  const people = new Map(personnel.map((person) => [person.id, person]));
  return getPeopleNeedingAttention({
    personnel,
    activities,
    requirements,
    lastContacts,
  }).map((gap, rank) => ({
    person: people.get(gap.personnelId)!,
    reason: gap.reasonLabel,
    rank,
  }));
}

function OverviewSection({
  title,
  description,
  className,
  children,
}: {
  title: string;
  description: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}) {
  const headingId = useId();
  return (
    <section aria-labelledby={headingId} className={className}>
      <Card className="h-full">
        <CardHeader>
          <CardTitle>
            <h2 id={headingId}>{title}</h2>
          </CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>{children}</CardContent>
      </Card>
    </section>
  );
}

function FollowUpList({ followUps }: { followUps: FollowUp[] }) {
  if (followUps.length === 0) {
    return (
      <Empty className="py-8">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <HeartHandshake aria-hidden="true" />
          </EmptyMedia>
          <EmptyTitle>Everyone is up to date</EmptyTitle>
          <EmptyDescription>
            No one is flagged, in crisis, at risk or due for contact under their
            contact schedule.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }
  return (
    <ul className="flex flex-col gap-2">
      {followUps.map(({ person, reason }) => (
        <li key={person.id}>
          <Item
            variant="outline"
            size="sm"
            render={<Link href={careProfileHref(person.id)} />}
          >
            <ItemMedia>
              <CarePersonAvatar person={person} size="sm" />
            </ItemMedia>
            <ItemContent className="min-w-0">
              {person.nameMissing ? (
                <ItemDescription>{person.name}</ItemDescription>
              ) : (
                <ItemTitle>{person.name}</ItemTitle>
              )}
              <ItemDescription>{reason}</ItemDescription>
              <ItemDescription>{careMemberContext(person)}</ItemDescription>
              <span className="sm:hidden">
                <CareStatusBadge status={person.status} />
              </span>
            </ItemContent>
            <ItemActions>
              <span className="hidden sm:flex">
                <CareStatusBadge status={person.status} />
              </span>
              <ChevronRight
                aria-hidden="true"
                className="size-4 text-muted-foreground"
              />
            </ItemActions>
          </Item>
        </li>
      ))}
    </ul>
  );
}

function nextBirthday(birthDate: string, now = new Date()) {
  const parsed = parseISO(birthDate);
  const next = new Date(now.getFullYear(), parsed.getMonth(), parsed.getDate());
  if (next < new Date(now.getFullYear(), now.getMonth(), now.getDate())) {
    next.setFullYear(now.getFullYear() + 1);
  }
  return next;
}

function BirthdayList({ people }: { people: CarePersonnel[] }) {
  if (people.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No birthdays in the next two weeks.
      </p>
    );
  }
  return (
    <ul className="flex flex-col gap-1">
      {people.map((person) => {
        const birthDate = person.birthDate;
        const date = birthDate ? nextBirthday(birthDate) : null;
        return (
          <li key={person.id}>
            <Item size="sm" render={<Link href={careProfileHref(person.id)} />}>
              <ItemMedia>
                <CarePersonAvatar person={person} size="sm" />
              </ItemMedia>
              <ItemContent className="min-w-0">
                {person.nameMissing ? (
                  <ItemDescription>{person.name}</ItemDescription>
                ) : (
                  <ItemTitle>{person.name}</ItemTitle>
                )}
                {person.nameMissing ? (
                  <ItemDescription>{careMemberContext(person)}</ItemDescription>
                ) : null}
                <ItemDescription>
                  {date ? format(date, "EEEE, MMMM d") : "Birthday"}
                </ItemDescription>
              </ItemContent>
            </Item>
          </li>
        );
      })}
    </ul>
  );
}

function RecentActivity({
  activities,
  people,
}: {
  activities: ActivityLogEntry[];
  people: Map<string, CarePersonnel>;
}) {
  if (activities.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Calls, visits and notes appear here as the team logs them.
      </p>
    );
  }
  return (
    <ol className="flex flex-col gap-1">
      {activities.map((activity) => {
        const person = people.get(activity.personnelId);
        const when = formatDistanceToNowStrict(parseISO(activity.date), {
          addSuffix: true,
        });
        const content = (
          <>
            <ItemMedia variant="icon">
              <MessageSquareText aria-hidden="true" />
            </ItemMedia>
            <ItemContent className="min-w-0">
              <ItemTitle>
                {ACTIVITY_TYPE_LABELS[activity.type]}
                {person
                  ? ` with ${person.nameMissing ? `this member · ${careMemberContext(person)}` : person.name}`
                  : ""}
              </ItemTitle>
              <ItemDescription>
                {activity.authorName} · {when}
              </ItemDescription>
            </ItemContent>
          </>
        );
        return (
          <li key={activity.id}>
            {person ? (
              <Item
                size="sm"
                render={<Link href={careProfileHref(person.id)} />}
              >
                {content}
              </Item>
            ) : (
              <Item size="sm" render={<div />}>
                {content}
              </Item>
            )}
          </li>
        );
      })}
    </ol>
  );
}

export function CareOverview({
  personnel,
  activities,
  personnelTotal = personnel.length,
  requirements = [],
  lastContacts,
}: {
  personnel: CarePersonnel[];
  activities: ActivityLogEntry[];
  personnelTotal?: number;
  requirements?: CareRequirement[];
  lastContacts?: MemberCareDerivationInput["lastContacts"];
}) {
  const people = useMemo(
    () => new Map(personnel.map((person) => [person.id, person])),
    [personnel],
  );
  const followUps = useMemo(
    () => getCareFollowUps(personnel, activities, requirements, lastContacts),
    [personnel, activities, requirements, lastContacts],
  );
  const birthdays = useMemo(() => getUpcomingBirthdays(personnel), [personnel]);
  const recentCheckIns = useMemo(
    () => getRecentCheckInCount(activities),
    [activities],
  );
  const recent = useMemo(
    () =>
      [...activities]
        .filter(isLoggedContact)
        .filter((activity) => Number.isFinite(Date.parse(activity.date)))
        .sort((a, b) => Date.parse(b.date) - Date.parse(a.date))
        .slice(0, 6),
    [activities],
  );
  const healthy = personnel.filter(
    (person) => person.status === "Healthy",
  ).length;
  const urgent = personnel.filter(
    (person) => person.status === "Crisis" || person.status === "At Risk",
  ).length;

  return (
    <div className="flex flex-col gap-6">
      <CareDirectoryLimitNote shown={personnel.length} total={personnelTotal} />
      <MetricGrid label="Member Care summary">
        <MetricCard
          label="Field staff"
          compactOnPhone
          value={personnelTotal}
          detail={
            personnelTotal > personnel.length
              ? `Newest ${personnel.length} listed`
              : `${healthy} healthy`
          }
        />
        <MetricCard
          label="Need follow-up"
          compactOnPhone
          value={followUps.length}
          detail="Contact schedules, flags and care status"
        />
        <MetricCard
          label="Check-ins, last 30 days"
          compactOnPhone
          value={recentCheckIns}
          detail={
            activities.length >= 500
              ? "From the latest 500 saved entries"
              : "Calls, visits and notes"
          }
        />
        <MetricCard
          label="Crisis or at risk"
          compactOnPhone
          value={urgent}
          detail={urgent > 0 ? "Highest priority" : "No one at risk"}
        />
      </MetricGrid>

      <div className="grid items-start gap-6 xl:grid-cols-3">
        <div className="flex min-w-0 flex-col gap-6 xl:col-span-2">
          <OverviewSection
            title="Follow-up due"
            description={
              <>
                Flagged, in crisis or at risk, or due for contact under their
                contact schedule.{" "}
                <Link
                  href="/care/settings"
                  className="underline underline-offset-4 hover:text-foreground"
                >
                  Care rules
                </Link>
              </>
            }
          >
            <FollowUpList followUps={followUps} />
          </OverviewSection>
          <CareContactTrend activities={activities} />
        </div>
        <div className="flex min-w-0 flex-col gap-6">
          <OverviewSection
            title="Upcoming birthdays"
            description="The next two weeks."
          >
            <BirthdayList people={birthdays} />
          </OverviewSection>
          <OverviewSection
            title="Recent activity"
            description="The latest care logged by the team."
          >
            <RecentActivity activities={recent} people={people} />
          </OverviewSection>
        </div>
      </div>
    </div>
  );
}
