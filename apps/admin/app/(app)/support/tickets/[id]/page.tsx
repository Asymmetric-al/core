import { loadSupportTicketDetail } from "@asym/api/admin/support/loaders";
import { PageShell } from "@asym/ui/components/primitives/page-shell";
import { ButtonLink } from "@asym/ui/components/shadcn/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@asym/ui/components/shadcn/card";
import Link from "next/link";

import { formatSupportRelativeTime } from "../../support-hub.derived";
import { supportHubRoutes } from "../../support-hub.routes";

import type {
  SupportContact,
  SupportMacro,
  SupportQueue,
  SupportTicket,
} from "@asym/api/admin/support/types";

interface SupportTicketDetailPageProps {
  params: Promise<{ id: string }>;
}

function SupportTicketNotFoundPage({ id }: { id: string }) {
  return (
    <PageShell
      title="Support Ticket Not Found"
      description="The requested support ticket could not be found."
    >
      <Card>
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
        ["Status", ticket.status],
        ["Priority", ticket.priority],
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
      <CardContent>
        <div className="space-y-2 text-sm text-muted-foreground">
          <p className="font-semibold text-foreground">
            {contact?.name ??
              ticket.contactName ??
              ticket.contactNameSnapshot ??
              "Unknown contact"}
          </p>
          <p>
            {contact?.email ??
              ticket.contactEmail ??
              ticket.contactEmailSnapshot}
          </p>
          <p>{contact?.organization}</p>
          <p>{contact?.givingSummary}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function SupportTicketMacroCard({
  macro,
}: {
  macro: SupportMacro | undefined;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Suggested macro</CardTitle>
        <CardDescription>{macro?.title ?? "No macro found"}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm leading-6 text-muted-foreground">
          {macro?.preview ?? "Create a track-specific macro before replying."}
        </p>
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
  const macro = model.macros.find((item) => item.queueId === ticket.queueId);

  return (
    <PageShell
      title={ticket.subject}
      description={`${ticket.id} · ${queue?.label ?? ticket.queueId} · ${ticket.status}`}
      actions={
        <ButtonLink
          variant="outline"
          render={<Link href={supportHubRoutes.tickets}>Back to tickets</Link>}
        />
      }
    >
      <div className="flex flex-col gap-6 lg:flex-row">
        <Card className="min-w-0 flex-1">
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
                {ticket.assignedTo ?? "Support"} is responsible for the next
                response. Tags: {ticket.tags.join(", ") || "none"}.
              </p>
            </div>
          </CardContent>
        </Card>

        <aside className="space-y-4 lg:w-90 lg:shrink-0">
          <SupportTicketContactCard contact={contact} ticket={ticket} />
          <SupportTicketMacroCard macro={macro} />
        </aside>
      </div>
    </PageShell>
  );
}
