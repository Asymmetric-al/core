import { loadSupportTicketList } from "@asym/api/admin/support/loaders";
import {
  MetricCard,
  MetricGrid,
} from "@asym/ui/components/primitives/metric-card";
import { PageShell } from "@asym/ui/components/primitives/page-shell";
import { Button, ButtonLink } from "@asym/ui/components/shadcn/button";
import { Input } from "@asym/ui/components/shadcn/input";
import { Label } from "@asym/ui/components/shadcn/label";
import {
  Select,
  SelectContent,
  SelectControlLabel,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@asym/ui/components/shadcn/select";
import Link from "next/link";

import { SUPPORT_TICKETS_PAGE_META } from "../../../../components/table-page-meta";
import { SupportTicketsTable } from "../../../../features/support-hub/components/tickets/SupportTicketsTable";
import { SupportSubNav } from "../../../../features/support-hub/components/workspace/SupportSubNav";
import {
  SUPPORT_TICKET_STATUS_LABELS,
  deriveSupportQueueSummaries,
} from "../support-hub.derived";
import { supportHubRoutes } from "../support-hub.routes";

interface SupportTicketsPageProps {
  searchParams?: Promise<{
    queueId?: string;
    search?: string;
    status?: string;
  }>;
}

const ticketStatuses = ["open", "waiting", "resolved", "escalated"];

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
  const filtered = Boolean(
    params.search?.trim() || params.queueId || params.status,
  );

  return (
    <PageShell
      title={SUPPORT_TICKETS_PAGE_META.title}
      description={SUPPORT_TICKETS_PAGE_META.description}
      density={SUPPORT_TICKETS_PAGE_META.density}
    >
      <div className="space-y-6">
        <SupportSubNav section="tickets" />
        <p className="text-sm text-muted-foreground">
          Tickets track requests and follow-ups. The Inbox holds email
          conversations.
        </p>
        <div className="flex flex-wrap gap-2">
          <ButtonLink
            variant="outline"
            render={
              <Link href={supportHubRoutes.home}>Back to Support Hub</Link>
            }
          />
          <ButtonLink
            render={<Link href={supportHubRoutes.newTicket}>New ticket</Link>}
          />
        </div>

        <form
          role="search"
          aria-label="Filter tickets"
          className="grid gap-3 rounded-3xl border border-border bg-card p-4 md:grid-cols-[minmax(0,1fr)_180px_180px_auto]"
        >
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
          <div className="space-y-2 md:w-45 md:shrink-0">
            <Select
              items={[
                { value: "", label: "All tracks" },
                ...model.queues.map((queue) => ({
                  value: queue.id,
                  label: queue.label,
                })),
              ]}
              defaultValue={
                model.queues.some((queue) => queue.id === params.queueId)
                  ? params.queueId
                  : ""
              }
              id="support-ticket-queue"
              name="queueId"
            >
              <SelectControlLabel className="sr-only">
                Support track
              </SelectControlLabel>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All tracks</SelectItem>
                {model.queues.map((queue) => (
                  <SelectItem key={queue.id} value={queue.id}>
                    {queue.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2 md:w-45 md:shrink-0">
            <Select
              items={[
                { value: "", label: "All statuses" },
                ...ticketStatuses.map((status) => ({
                  value: status,
                  label:
                    SUPPORT_TICKET_STATUS_LABELS[
                      status as keyof typeof SUPPORT_TICKET_STATUS_LABELS
                    ],
                })),
              ]}
              defaultValue={
                ticketStatuses.includes(params.status ?? "")
                  ? params.status
                  : ""
              }
              id="support-ticket-status"
              name="status"
            >
              <SelectControlLabel className="sr-only">
                Status
              </SelectControlLabel>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All statuses</SelectItem>
                {ticketStatuses.map((status) => (
                  <SelectItem key={status} value={status}>
                    {
                      SUPPORT_TICKET_STATUS_LABELS[
                        status as keyof typeof SUPPORT_TICKET_STATUS_LABELS
                      ]
                    }
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button type="submit">Filter</Button>
        </form>

        <MetricGrid
          label={filtered ? "Tickets matching filters" : "Tickets by track"}
        >
          {queueSummaries.map((queue) => (
            <MetricCard
              key={queue.id}
              label={queue.label}
              value={queue.total}
              detail={filtered ? "Matching filters" : queue.description}
            />
          ))}
        </MetricGrid>
        <SupportTicketsTable
          tickets={tickets}
          queues={model.queues}
          filtered={filtered}
        />
      </div>
    </PageShell>
  );
}

export const metadata = { title: "Support tickets" };
