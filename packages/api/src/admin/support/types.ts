export type {
  SupportContact,
  SupportHubReadModel,
  SupportKnowledgeEntry,
  SupportMacro,
  SupportQueue,
  SupportQueueId,
  SupportTicket,
  SupportTicketChannel,
  SupportTicketPriority,
  SupportTicketStatus,
} from "@asym/database/collections/support-workspace";

import type {
  SupportTicketPriority,
  SupportQueueId,
  SupportTicketStatus,
} from "@asym/database/collections/support-workspace";

export interface SupportTicketListParams {
  queueId?: SupportQueueId;
  status?: SupportTicketStatus;
  search?: string;
}

export interface CreateSupportTicketInput {
  contactId?: string;
  contactEmail?: string;
  contactName: string;
  priority: SupportTicketPriority;
  queueId: SupportQueueId;
  subject: string;
  summary: string;
}
