import type {
  SupportContact,
  SupportHubReadModel,
  SupportHubStats,
  SupportQueueSummary,
  SupportTicket,
  SupportTicketFilter,
} from "./support-hub.types";

export function formatSupportRelativeTime(
  input: string,
  nowInput: string | Date = new Date(),
) {
  const diffMs = new Date(nowInput).getTime() - new Date(input).getTime();
  const isFuture = diffMs < 0;
  const minutes = Math.max(1, Math.round(Math.abs(diffMs) / 60_000));

  if (minutes < 60) {
    return isFuture ? `in ${minutes}m` : `${minutes}m ago`;
  }

  const hours = Math.round(minutes / 60);

  return isFuture ? `in ${hours}h` : `${hours}h ago`;
}

function needsFollowUp(ticket: SupportTicket): boolean {
  return ticket.status !== "resolved";
}

export function deriveSupportHubStats(
  model: SupportHubReadModel,
  _nowInput: string | Date = model.generatedAt,
): SupportHubStats {
  return model.tickets.reduce<SupportHubStats>(
    (stats, ticket) => {
      if (ticket.status === "open") {
        stats.open += 1;
      }

      if (ticket.status === "waiting") {
        stats.waiting += 1;
      }

      if (ticket.status === "resolved") {
        stats.resolved += 1;
      }

      if (ticket.status === "escalated") {
        stats.escalated += 1;
      }

      if (ticket.priority === "urgent") {
        stats.urgent += 1;
      }

      if (needsFollowUp(ticket)) {
        stats.needsFollowUp += 1;
      }

      return stats;
    },
    {
      open: 0,
      urgent: 0,
      waiting: 0,
      resolved: 0,
      escalated: 0,
      needsFollowUp: 0,
    },
  );
}

export function filterSupportTickets(
  tickets: SupportTicket[],
  filter: SupportTicketFilter,
  contacts: SupportContact[] = [],
): SupportTicket[] {
  const search = filter.search?.trim().toLowerCase();
  const contactById = new Map(contacts.map((contact) => [contact.id, contact]));

  return tickets.filter((ticket) => {
    if (filter.queueId && ticket.queueId !== filter.queueId) {
      return false;
    }

    if (filter.status && ticket.status !== filter.status) {
      return false;
    }

    if (filter.priority && ticket.priority !== filter.priority) {
      return false;
    }

    if (search) {
      const contact = ticket.contactId
        ? contactById.get(ticket.contactId)
        : undefined;
      const searchable = [
        ticket.subject,
        ticket.summary,
        ticket.assignedTo ?? "",
        contact?.email ??
          ticket.contactEmail ??
          ticket.contactEmailSnapshot ??
          "",
        contact?.name ?? ticket.contactName ?? ticket.contactNameSnapshot ?? "",
        contact?.organization ?? "",
        contact?.relationship ?? "",
        ...ticket.tags,
      ]
        .join(" ")
        .toLowerCase();

      return searchable.includes(search);
    }

    return true;
  });
}

export function deriveSupportQueueSummaries(
  model: SupportHubReadModel,
  _nowInput: string | Date = model.generatedAt,
): SupportQueueSummary[] {
  return model.queues.map((queue) => {
    const queueTickets = filterSupportTickets(model.tickets, {
      queueId: queue.id,
    });

    return {
      id: queue.id,
      label: queue.label,
      description: queue.description,
      total: queueTickets.length,
      urgent: queueTickets.filter((ticket) => ticket.priority === "urgent")
        .length,
      needsFollowUp: queueTickets.filter(needsFollowUp).length,
    };
  });
}
