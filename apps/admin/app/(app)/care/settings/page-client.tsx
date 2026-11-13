"use client";

import { PageShell } from "@asym/ui/components/primitives/page-shell";
import { buttonVariants } from "@asym/ui/components/shadcn/button";
import Link from "next/link";
import { useId } from "react";

import { CHECK_IN_INTERVAL_DAYS } from "@/features/mission-control/care/components/care-display";
import {
  RECENT_CHECK_IN_WINDOW_DAYS,
  UPCOMING_BIRTHDAY_WINDOW_DAYS,
} from "@/features/mission-control/care/member-care.derived";

function RuleSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const headingId = useId();
  return (
    <section
      aria-labelledby={headingId}
      className="flex flex-col gap-2 p-4 sm:p-5"
    >
      <h2 id={headingId} className="text-sm font-medium">
        {title}
      </h2>
      <div className="flex max-w-prose flex-col gap-2 text-sm text-muted-foreground">
        {children}
      </div>
    </section>
  );
}

export default function CareSettingsPage() {
  return (
    <PageShell
      title="Care rules"
      description="How contact schedules and care status decide who needs follow-up."
      density="compact"
      actions={
        <Link href="/care" className={buttonVariants({ variant: "outline" })}>
          Back to Member Care
        </Link>
      }
    >
      <div className="divide-y rounded-xl border">
        <RuleSection title="Follow-up due">
          <p>
            A person appears under Follow-up due on the overview when they are
            flagged for attention, their care status is Crisis or At risk, or a
            saved contact schedule is overdue. Without a saved schedule,
            follow-up is due after more than {CHECK_IN_INTERVAL_DAYS} days, or
            when they have no recorded contact (&quot;No care contact
            recorded&quot;). Calls, visits and logged notes count as contact;
            shared care-thread posts do not. A Needs attention status alone does
            not add someone: it marks a person to watch in the directory.
          </p>
          <p>
            Flagged people are listed first, then Crisis, then At risk, followed
            by the most urgent contact gaps. Each person appears once with their
            strongest reason. The directory shows a Follow-up due badge using
            the same rule.
          </p>
        </RuleSection>
        <RuleSection title="Upcoming birthdays">
          <p>
            The overview lists birthdays in the next{" "}
            {UPCOMING_BIRTHDAY_WINDOW_DAYS} days.
          </p>
        </RuleSection>
        <RuleSection title="Recent check-ins">
          <p>
            The check-in count on the overview includes every care activity
            logged in the last {RECENT_CHECK_IN_WINDOW_DAYS} days, such as
            calls, visits and notes. Shared care-thread posts are excluded.
          </p>
        </RuleSection>
      </div>
    </PageShell>
  );
}
