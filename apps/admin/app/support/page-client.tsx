"use client";

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
import {
  AlertTriangle,
  ArrowUpRight,
  BookOpen,
  CheckCircle2,
  Clock,
  Inbox,
  Mail,
  MessageSquare,
  PhoneCall,
  Reply,
  Search,
  Send,
  ShieldAlert,
  Sparkles,
  Tag,
  UserRound,
  Users,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

import {
  deriveSupportHubStats,
  deriveSupportQueueSummaries,
  filterSupportTickets,
  formatSupportRelativeTime,
} from "./support-hub.derived";
import { supportHubRoutes } from "./support-hub.routes";

import type {
  SupportHubReadModel,
  SupportQueueId,
  SupportTicketChannel,
  SupportTicketPriority,
  SupportTicketStatus,
} from "./support-hub.types";

const channelIcons: Record<SupportTicketChannel, typeof Mail> = {
  chat: MessageSquare,
  email: Mail,
  form: Inbox,
  phone: PhoneCall,
};

const priorityClasses: Record<SupportTicketPriority, string> = {
  low: "border-border bg-muted text-muted-foreground",
  normal: "border-border bg-primary/10 text-primary",
  high: "border-border bg-primary/10 text-primary",
  urgent: "border-destructive/30 bg-destructive/10 text-destructive",
};

const statusClasses: Record<SupportTicketStatus, string> = {
  escalated: "border-destructive/30 bg-destructive/10 text-destructive",
  open: "border-border bg-primary/10 text-primary",
  resolved: "border-border bg-muted text-muted-foreground",
  waiting: "border-border bg-muted text-muted-foreground",
};

interface SupportHubPageProps {
  model: SupportHubReadModel;
}

export default function SupportHubPage({ model }: SupportHubPageProps) {
  const [activeQueueId, setActiveQueueId] =
    useState<SupportQueueId>("donor_care");
  const [search, setSearch] = useState("");
  const [now] = useState(() => new Date().toISOString());
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const stats = useMemo(() => deriveSupportHubStats(model, now), [model, now]);
  const queueSummaries = useMemo(
    () => deriveSupportQueueSummaries(model, now),
    [model, now],
  );
  const contactById = useMemo(
    () => new Map(model.contacts.map((contact) => [contact.id, contact])),
    [model.contacts],
  );
  const visibleTickets = useMemo(
    () =>
      filterSupportTickets(
        model.tickets,
        {
          queueId: activeQueueId,
          search,
        },
        model.contacts,
      ),
    [activeQueueId, model.contacts, model.tickets, search],
  );
  const selectedTicket =
    (selectedTicketId
      ? visibleTickets.find((ticket) => ticket.id === selectedTicketId)
      : undefined) ??
    visibleTickets[0] ??
    null;
  const selectedContact = selectedTicket
    ? contactById.get(selectedTicket.contactId)
    : undefined;
  const suggestedMacro =
    model.macros.find((macro) => macro.queueId === selectedTicket?.queueId) ??
    model.macros[0];

  return (
    <PageShell
      title="Support Hub"
      description="Route Donor Care, Mobilization, and Existing Missionary Support requests to the right track."
      actions={
        <>
          <Button asChild className="rounded-2xl">
            <Link href={supportHubRoutes.newTicket}>
              <Send className="mr-2 h-4 w-4" aria-hidden="true" />
              New ticket
            </Link>
          </Button>
          <Button asChild className="rounded-2xl" variant="outline">
            <Link href={supportHubRoutes.knowledge}>
              <BookOpen className="mr-2 h-4 w-4" aria-hidden="true" />
              Knowledge base
            </Link>
          </Button>
        </>
      }
    >
      <div className="space-y-8">
        <section className="grid grid-cols-2 md:grid-cols-6 gap-3">
          {[
            { label: "Open", value: stats.open, icon: Inbox },
            { label: "Urgent", value: stats.urgent, icon: AlertTriangle },
            { label: "Waiting", value: stats.waiting, icon: Clock },
            { label: "Resolved", value: stats.resolved, icon: CheckCircle2 },
            { label: "Escalated", value: stats.escalated, icon: ShieldAlert },
            { label: "Needs follow-up", value: stats.needsFollowUp, icon: Zap },
          ].map((stat) => {
            const Icon = stat.icon;

            return (
              <Card key={stat.label} className="min-h-24 rounded-2xl">
                <CardContent className="flex h-full items-center justify-between py-3 pl-4 pr-3">
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-[0.16em] text-muted-foreground">
                      {stat.label}
                    </p>
                    <p className="mt-1 text-2xl font-black tabular-nums">
                      {stat.value}
                    </p>
                  </div>
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-muted-foreground">
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </section>

        <div className="grid gap-6 xl:grid-cols-[260px_minmax(0,1fr)_340px]">
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-[0.16em] text-muted-foreground">
                Support tracks
              </h3>
              <Link
                className="text-xs font-semibold text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                href={supportHubRoutes.tickets}
              >
                Manage
              </Link>
            </div>
            <div className="space-y-2">
              {queueSummaries.map((queue) => {
                const isActive = queue.id === activeQueueId;

                return (
                  <button
                    aria-pressed={isActive}
                    className={`w-full rounded-2xl border p-3 text-left transition-colors ${
                      isActive
                        ? "border-foreground bg-foreground text-background"
                        : "border-border bg-card hover:bg-muted"
                    }`}
                    key={queue.id}
                    onClick={() => setActiveQueueId(queue.id)}
                    type="button"
                  >
                    <span className="flex items-center justify-between gap-3">
                      <span className="font-semibold">{queue.label}</span>
                      <span className="rounded-full bg-background/20 px-2 py-0.5 text-xs font-bold tabular-nums">
                        {queue.total}
                      </span>
                    </span>
                    <span className="mt-1 block text-xs opacity-80">
                      {queue.description}
                    </span>
                    {queue.needsFollowUp > 0 ? (
                      <span className="mt-2 inline-flex rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-semibold text-destructive">
                        {queue.needsFollowUp} need follow-up
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>
          </section>

          <section className="space-y-3">
            <Card className="rounded-3xl">
              <CardHeader className="border-b border-border/70">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <CardTitle>Support Inbox</CardTitle>
                    <CardDescription>
                      {visibleTickets.length} requests in{" "}
                      {queueSummaries.find(
                        (queue) => queue.id === activeQueueId,
                      )?.label ?? "this track"}
                    </CardDescription>
                  </div>
                  <label className="flex items-center gap-2 rounded-full border border-border bg-muted px-3 py-2 text-sm text-muted-foreground">
                    <Search className="h-4 w-4" aria-hidden="true" />
                    <span className="sr-only">Search support tickets</span>
                    <Input
                      className="h-auto border-0 bg-transparent p-0 shadow-none focus-visible:ring-0"
                      onChange={(event) => setSearch(event.target.value)}
                      placeholder="Search tickets, contacts, tags"
                      value={search}
                    />
                  </label>
                </div>
              </CardHeader>
              <CardContent className="divide-y divide-border/70 p-0">
                {visibleTickets.length > 0 ? (
                  visibleTickets.map((ticket) => {
                    const contact = contactById.get(ticket.contactId);
                    const ChannelIcon = channelIcons[ticket.channel];
                    return (
                      <article className="p-4" key={ticket.id}>
                        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                          <div className="min-w-0 space-y-2">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-mono text-xs font-bold text-muted-foreground">
                                {ticket.id}
                              </span>
                              <span
                                aria-label={`Priority: ${ticket.priority}`}
                                className={`rounded-full border px-2 py-0.5 text-xs font-bold ${priorityClasses[ticket.priority]}`}
                              >
                                Priority: {ticket.priority}
                              </span>
                              <span
                                aria-label={`Status: ${ticket.status}`}
                                className={`rounded-full border px-2 py-0.5 text-xs font-bold ${statusClasses[ticket.status]}`}
                              >
                                Status: {ticket.status}
                              </span>
                              {ticket.followUpAt ? (
                                <span className="rounded-full border border-border bg-muted px-2 py-0.5 text-xs font-bold text-muted-foreground">
                                  Follow-up{" "}
                                  {formatSupportRelativeTime(
                                    ticket.followUpAt,
                                    now,
                                  )}
                                </span>
                              ) : null}
                            </div>
                            <h3 className="text-base font-bold text-foreground">
                              {ticket.subject}
                            </h3>
                            <p className="text-sm leading-6 text-muted-foreground">
                              {ticket.summary}
                            </p>
                            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                              <span className="inline-flex items-center gap-1">
                                <UserRound
                                  className="h-3.5 w-3.5"
                                  aria-hidden="true"
                                />
                                {contact?.name ?? "Unknown contact"}
                              </span>
                              <span className="inline-flex items-center gap-1">
                                <ChannelIcon
                                  className="h-3.5 w-3.5"
                                  aria-hidden="true"
                                />
                                {ticket.channel}
                              </span>
                              <span>
                                Updated{" "}
                                {formatSupportRelativeTime(
                                  ticket.updatedAt,
                                  now,
                                )}
                              </span>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <Button
                              aria-pressed={selectedTicket?.id === ticket.id}
                              className="rounded-2xl"
                              onClick={() => setSelectedTicketId(ticket.id)}
                              size="sm"
                              type="button"
                              variant={
                                selectedTicket?.id === ticket.id
                                  ? "default"
                                  : "outline"
                              }
                            >
                              Preview
                            </Button>
                            <Button
                              asChild
                              className="rounded-2xl"
                              size="sm"
                              variant="outline"
                            >
                              <Link href={supportHubRoutes.ticket(ticket.id)}>
                                Open thread
                                <ArrowUpRight
                                  className="ml-2 h-4 w-4"
                                  aria-hidden="true"
                                />
                              </Link>
                            </Button>
                          </div>
                        </div>
                      </article>
                    );
                  })
                ) : (
                  <div className="p-6 text-sm text-muted-foreground">
                    No support tickets match this track and search.
                  </div>
                )}
              </CardContent>
            </Card>
          </section>

          <aside className="space-y-4">
            <Card className="rounded-3xl">
              <CardHeader>
                <CardTitle>Active Thread</CardTitle>
                <CardDescription>
                  Suggested context for the next response
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {selectedTicket ? (
                  <>
                    <div>
                      <p className="font-mono text-xs font-bold text-muted-foreground">
                        {selectedTicket.id}
                      </p>
                      <h3 className="mt-1 font-bold">
                        {selectedTicket.subject}
                      </h3>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">
                        {selectedTicket.summary}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-muted p-3">
                      <p className="text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">
                        Contact
                      </p>
                      <p className="mt-1 font-semibold">
                        {selectedContact?.name ?? "Unknown contact"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {selectedContact?.relationship}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {selectedContact?.givingSummary}
                      </p>
                    </div>
                    <Link
                      className="block rounded-2xl border border-border p-3 hover:bg-muted"
                      href={supportHubRoutes.macros}
                    >
                      <div className="flex items-center gap-2">
                        <Sparkles
                          className="h-4 w-4 text-primary"
                          aria-hidden="true"
                        />
                        <p className="text-sm font-bold">Suggested macro</p>
                      </div>
                      <p className="mt-2 text-sm text-muted-foreground">
                        {suggestedMacro?.title}
                      </p>
                      <p className="mt-1 text-xs leading-5 text-muted-foreground">
                        {suggestedMacro?.preview}
                      </p>
                    </Link>
                    <Button
                      aria-describedby="draft-response-disabled-reason"
                      className="w-full rounded-2xl"
                      disabled
                    >
                      <Reply className="mr-2 h-4 w-4" aria-hidden="true" />
                      Draft response
                    </Button>
                    <p
                      className="text-xs leading-5 text-muted-foreground"
                      id="draft-response-disabled-reason"
                    >
                      Response drafting will be enabled when ticket messages are
                      connected to the selected support track.
                    </p>
                  </>
                ) : (
                  <div className="rounded-2xl border border-dashed border-border p-4 text-sm text-muted-foreground">
                    Select a track or clear the search to preview a ticket.
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="rounded-3xl">
              <CardHeader>
                <CardTitle>Knowledge</CardTitle>
                <CardDescription>
                  Articles linked to recent support tracks
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {model.knowledge.map((entry) => (
                  <Link
                    className="block rounded-2xl border border-border p-3 hover:bg-muted"
                    href={`${supportHubRoutes.knowledge}?article=${entry.id}`}
                    key={entry.id}
                  >
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">
                      <Tag className="h-3.5 w-3.5" aria-hidden="true" />
                      {entry.category}
                    </div>
                    <p className="mt-1 text-sm font-semibold">{entry.title}</p>
                    <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted-foreground">
                      {entry.summary}
                    </p>
                  </Link>
                ))}
              </CardContent>
            </Card>

            <Card className="rounded-3xl">
              <CardHeader>
                <CardTitle>Contact Pulse</CardTitle>
                <CardDescription>
                  Recent people in support flows
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {model.contacts.slice(0, 3).map((contact) => (
                  <Link
                    className="flex items-start gap-3 rounded-2xl bg-muted p-3 hover:bg-muted/70"
                    href={supportHubRoutes.contacts}
                    key={contact.id}
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-background">
                      <Users className="h-4 w-4" aria-hidden="true" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">
                        {contact.name}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {contact.relationship}
                      </p>
                    </div>
                  </Link>
                ))}
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
    </PageShell>
  );
}
