import { loadSupportTicketDetail } from "@asym/api/admin/support/loaders";
import { PageShell } from "@asym/ui/components/primitives/page-shell";
import {
  Alert,
  AlertTitle,
  AlertDescription,
} from "@asym/ui/components/shadcn/alert";
import { ButtonLink } from "@asym/ui/components/shadcn/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@asym/ui/components/shadcn/card";
import Link from "next/link";

import { SupportSubNav } from "../../../../../features/support-hub/components/workspace/SupportSubNav";
import { formatSupportRelativeTime } from "../../support-hub.derived";
import { supportHubRoutes } from "../../support-hub.routes";

import type {
  SupportContact,
  SupportQueue,
  SupportTicket,
} from "@asym/api/admin/support/types";

interface SupportTicketDetailPageProps {
  params: Promise<{ id: string }>;
}

function SupportTicketNotFoundPage({ id }: { id: string }) {
  return (
    <PageShell
      title="Support ticket not found"
      description="The requested support ticket could not be found."
    >
      <SupportSubNav section="tickets" />
      <Card className="rounded-3xl">
        <CardHeader>
          <CardTitle>Missing ticket</CardTitle>
          <CardDescription>
            Ticket {id} does not exist in the current Support Hub data set.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ButtonLink
            variant="outline"
            render={
              <Link href={supportHubRoutes.tickets}>Back to tickets</Link>
            }
          />
        </CardContent>
      </Card>
    </PageShell>
  );
}

export const metadata = { title: "Support ticket" };

function SupportTicketMetrics({
  ticket,
  queue,
  generatedAt,
}: {
  ticket: SupportTicket;
  queue: SupportQueue | undefined;
  generatedAt: string;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-4">
      {[
        [
          "Status",
          ticket.status.charAt(0).toUpperCase() +
            ticket.status.slice(1).replaceAll("_", " "),
        ],
        [
          "Priority",
          ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1),
        ],
        ["Track", queue?.label ?? ticket.queueId],
        [
          "Follow-up",
          ticket.followUpAt
            ? formatSupportRelativeTime(ticket.followUpAt, generatedAt)
            : "Not scheduled",
        ],
      ].map(([label, value]) => (
        <div className="rounded-2xl bg-muted p-3" key={label}>
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            {label}
          </p>
          <p className="mt-1 font-semibold">{value}</p>
        </div>
      ))}
    </div>
  );
}

function SupportTicketContactCard({
  contact,
  ticket,
}: {
  contact: SupportContact | undefined;
  ticket: SupportTicket;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Contact context</CardTitle>
        <CardDescription>
          {contact?.relationship ?? "No linked contact"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2 text-sm text-muted-foreground">
        <p className="font-semibold text-foreground">
          {contact?.name ??
            ticket.contactName ??
            ticket.contactNameSnapshot ??
            "Unknown contact"}
        </p>
        <p>
          <a
            href={
              "mailto:" +
              (contact?.email ??
                ticket.contactEmail ??
                ticket.contactEmailSnapshot ??
                "")
            }
          >
            {contact?.email ??
              ticket.contactEmail ??
              ticket.contactEmailSnapshot}
          </a>
        </p>
        <p>{contact?.organization}</p>
        <p>{contact?.givingSummary}</p>
      </CardContent>
    </Card>
  );
}

export default async function SupportTicketDetailPage({
  params,
}: SupportTicketDetailPageProps) {
  const { id } = await params;
  const model = await loadSupportTicketDetail(id);
  const { ticket } = model;

  if (!ticket) {
    return <SupportTicketNotFoundPage id={id} />;
  }

  const contact = ticket.contactId
    ? model.contacts.find((item) => item.id === ticket.contactId)
    : undefined;
  const queue = model.queues.find((item) => item.id === ticket.queueId);

  return (
    <PageShell
      title={ticket.subject}
      description={`${ticket.id} · ${queue?.label ?? ticket.queueId} · ${ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1).replaceAll("_", " ")}`}
      actions={
        <ButtonLink
          variant="outline"
          render={<Link href={supportHubRoutes.tickets}>Back to tickets</Link>}
        />
      }
    >
      <Alert variant="info" className="mb-4">
        <AlertTitle>View only for now</AlertTitle>
        <AlertDescription>
          Status changes, assignment, and replies aren’t available from this
          ticket page yet.
        </AlertDescription>
      </Alert>
      <SupportSubNav section="tickets" />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <Card className="rounded-3xl">
          <CardHeader>
            <CardTitle>Thread summary</CardTitle>
            <CardDescription>{ticket.summary}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <SupportTicketMetrics
              ticket={ticket}
              queue={queue}
              generatedAt={model.generatedAt}
            />

            <div className="rounded-2xl border border-border p-4">
              <p className="text-sm font-bold">Latest activity</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {ticket.assignedToName ??
                  (ticket.assignedTo ? "Name unavailable" : "Unassigned")}{" "}
                is responsible for the next response. Tags:{" "}
                {ticket.tags.join(", ") || "none"}.
              </p>
            </div>
          </CardContent>
        </Card>

        <aside className="space-y-4 lg:w-90 lg:shrink-0">
          <SupportTicketContactCard contact={contact} ticket={ticket} />
        </aside>
      </div>
    </PageShell>
  );
}
