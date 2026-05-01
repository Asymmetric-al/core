import { loadSupportTicketList } from "@asym/api/admin/support/loaders";
import { PageShell } from "@asym/ui/components/primitives/page-shell";
import { Button } from "@asym/ui/components/shadcn/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@asym/ui/components/shadcn/card";
import { Input } from "@asym/ui/components/shadcn/input";
import { Label } from "@asym/ui/components/shadcn/label";
import Link from "next/link";

import { deriveSupportQueueSummaries } from "../support-hub.derived";
import { supportHubRoutes } from "../support-hub.routes";

interface SupportTicketsPageProps {
  searchParams?: Promise<{
    queueId?: string;
    search?: string;
    status?: string;
  }>;
}

function toSearchParams(params: Record<string, string | undefined>) {
  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value) {
      searchParams.set(key, value);
    }
  }

  return searchParams;
}

export default async function SupportTicketsPage({
  searchParams,
}: SupportTicketsPageProps) {
  const params = (await searchParams) ?? {};
  const model = await loadSupportTicketList(toSearchParams(params));
  const queueSummaries = deriveSupportQueueSummaries(model);
  const tickets = model.tickets;

  return (
    <PageShell
      title="Support Tickets"
      description="Review Donor Care, Mobilization, and Existing Missionary Support requests."
    >
      <div className="space-y-6">
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline">
            <Link href={supportHubRoutes.home}>Back to Support Hub</Link>
          </Button>
          <Button asChild>
            <Link href={supportHubRoutes.newTicket}>New ticket</Link>
          </Button>
        </div>

        <form className="grid gap-3 rounded-3xl border border-border bg-card p-4 md:grid-cols-[minmax(0,1fr)_180px_180px_auto]">
          <div className="space-y-2">
            <Label className="sr-only" htmlFor="support-ticket-search">
              Search tickets
            </Label>
            <Input
              defaultValue={params.search ?? ""}
              id="support-ticket-search"
              name="search"
              placeholder="Search tickets, contacts, tags"
              type="search"
            />
          </div>
          <div className="space-y-2">
            <Label className="sr-only" htmlFor="support-ticket-queue">
              Support track
            </Label>
            <select
              className="min-h-11 w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm"
              defaultValue={params.queueId ?? ""}
              id="support-ticket-queue"
              name="queueId"
            >
              <option value="">All tracks</option>
              {model.queues.map((queue) => (
                <option key={queue.id} value={queue.id}>
                  {queue.label}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label className="sr-only" htmlFor="support-ticket-status">
              Status
            </Label>
            <select
              className="min-h-11 w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm"
              defaultValue={params.status ?? ""}
              id="support-ticket-status"
              name="status"
            >
              <option value="">All statuses</option>
              {["open", "waiting", "resolved", "escalated"].map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
          <Button type="submit">Filter</Button>
        </form>

        <div className="grid gap-3 md:grid-cols-5">
          {queueSummaries.map((queue) => (
            <Card className="rounded-2xl" key={queue.id}>
              <CardContent className="p-4">
                <p className="text-sm font-bold">{queue.label}</p>
                <p className="mt-1 text-2xl font-black tabular-nums">
                  {queue.total}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {queue.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="rounded-3xl">
          <CardHeader>
            <CardTitle>All tickets</CardTitle>
            <CardDescription>
              Live tenant-scoped tickets from the support workspace.
            </CardDescription>
          </CardHeader>
          <CardContent className="divide-y divide-border/70 p-0">
            {tickets.length > 0 ? (
              tickets.map((ticket) => (
                <article className="p-4" key={ticket.id}>
                  <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                    <div>
                      <p className="font-mono text-xs font-bold text-muted-foreground">
                        {ticket.id}
                      </p>
                      <h2 className="mt-1 font-bold">{ticket.subject}</h2>
                      <p className="mt-1 max-w-3xl text-sm leading-6 text-muted-foreground">
                        {ticket.summary}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs font-bold">
                      <span className="rounded-full bg-muted px-2 py-1">
                        {ticket.queueId}
                      </span>
                      <span className="rounded-full bg-muted px-2 py-1">
                        {ticket.status}
                      </span>
                      {ticket.followUpAt ? (
                        <span className="rounded-full bg-muted px-2 py-1">
                          follow-up
                        </span>
                      ) : null}
                    </div>
                    <Button asChild size="sm" variant="outline">
                      <Link href={supportHubRoutes.ticket(ticket.id)}>
                        Open thread
                      </Link>
                    </Button>
                  </div>
                </article>
              ))
            ) : (
              <div className="p-6 text-sm text-muted-foreground">
                No support tickets match the current filters.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PageShell>
  );
}
