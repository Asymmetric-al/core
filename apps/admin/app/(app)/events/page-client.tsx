import { PageShell } from "@asym/ui/components/primitives/page-shell";
import { buttonVariants } from "@asym/ui/components/shadcn/button";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
} from "@asym/ui/components/shadcn/empty";
import { CalendarDays } from "lucide-react";
import Link from "next/link";

export default function EventsPage() {
  return (
    <PageShell
      title="Events"
      description="Event registration, venues, speakers and attendees will appear here when connected."
      density="compact"
    >
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <CalendarDays aria-hidden="true" />
          </EmptyMedia>
          <EmptyTitle role="heading" aria-level={2}>
            Events is not connected yet
          </EmptyTitle>
          <EmptyDescription>
            Continue managing registrations with your event organizer. Donors
            who give appear in CRM; event attendance and registration totals are
            not available here yet.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Link className={buttonVariants({ variant: "outline" })} href="/crm">
            Open CRM
          </Link>
        </EmptyContent>
      </Empty>
    </PageShell>
  );
}
