import { loadSupportTicketDetail } from "@asym/api/admin/support/loaders";
import { PageShell } from "@asym/ui/components/primitives/page-shell";
import { Button } from "@asym/ui/components/shadcn/button";
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

interface SupportTicketDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function SupportTicketDetailPage({
  params,
}: SupportTicketDetailPageProps) {
  const { id } = await params;
  const model = await loadSupportTicketDetail(id);
  const { ticket } = model;

  if (!ticket) {
    return (
      <PageShell
        title="Support Ticket Not Found"
        description="The requested support ticket could not be found."
      >
        <Card className="rounded-3xl">
          <CardHeader>
            <CardTitle>Missing ticket</CardTitle>
            <CardDescription>
              Ticket {id} does not exist in the current Support Hub data set.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline">
              <Link href={supportHubRoutes.tickets}>Back to tickets</Link>
            </Button>
          </CardContent>
        </Card>
      </PageShell>
    );
  }

  const contact = model.contacts.find((item) => item.id === ticket.contactId);
  const queue = model.queues.find((item) => item.id === ticket.queueId);
  const macro = model.macros.find((item) => item.queueId === ticket.queueId);

  return (
    <PageShell
      title={ticket.subject}
      description={`${ticket.id} · ${queue?.label ?? ticket.queueId} · ${ticket.status}`}
      actions={
        <Button asChild variant="outline">
          <Link href={supportHubRoutes.tickets}>Back to tickets</Link>
        </Button>
      }
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <Card className="rounded-3xl">
          <CardHeader>
            <CardTitle>Thread summary</CardTitle>
            <CardDescription>{ticket.summary}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-4">
              {[
                ["Status", ticket.status],
                ["Priority", ticket.priority],
                ["Track", queue?.label ?? ticket.queueId],
                [
                  "Follow-up",
                  ticket.followUpAt
                    ? formatSupportRelativeTime(
                        ticket.followUpAt,
                        model.generatedAt,
                      )
                    : "Not scheduled",
                ],
              ].map(([label, value]) => (
                <div className="rounded-2xl bg-muted p-3" key={label}>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">
                    {label}
                  </p>
                  <p className="mt-1 font-semibold">{value}</p>
                </div>
              ))}
            </div>

            <div className="rounded-2xl border border-border p-4">
              <p className="text-sm font-bold">Latest activity</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {ticket.assignedTo ?? "Support"} is responsible for the next
                response. Tags: {ticket.tags.join(", ") || "none"}.
              </p>
            </div>
          </CardContent>
        </Card>

        <aside className="space-y-4">
          <Card className="rounded-3xl">
            <CardHeader>
              <CardTitle>Contact context</CardTitle>
              <CardDescription>
                {contact?.relationship ?? "No linked contact"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p className="font-semibold text-foreground">
                {contact?.name ?? ticket.contactName ?? "Unknown contact"}
              </p>
              <p>{contact?.email ?? ticket.contactEmail}</p>
              <p>{contact?.organization}</p>
              <p>{contact?.givingSummary}</p>
            </CardContent>
          </Card>

          <Card className="rounded-3xl">
            <CardHeader>
              <CardTitle>Suggested macro</CardTitle>
              <CardDescription>
                {macro?.title ?? "No macro found"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-6 text-muted-foreground">
                {macro?.preview ??
                  "Create a track-specific macro before replying."}
              </p>
            </CardContent>
          </Card>
        </aside>
      </div>
    </PageShell>
  );
}
