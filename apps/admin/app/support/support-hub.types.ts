export type SupportQueueId =
  | "donor_care"
  | "missionary_support"
  | "mobilization";

export type SupportTicketStatus = "open" | "waiting" | "resolved" | "escalated";

export type SupportTicketPriority = "low" | "normal" | "high" | "urgent";

export type SupportTicketChannel = "email" | "chat" | "form" | "phone";

export interface SupportQueue {
  id: SupportQueueId;
  label: string;
  description: string;
}

export interface SupportContact {
  id: string;
  name: string;
  email: string;
  relationship: string;
  organization?: string;
  lastSeenAt: string;
  givingSummary?: string;
}

export interface SupportTicket {
  id: string;
  subject: string;
  contactId: string;
  queueId: SupportQueueId;
  status: SupportTicketStatus;
  priority: SupportTicketPriority;
  channel: SupportTicketChannel;
  followUpAt?: string;
  updatedAt: string;
  summary: string;
  tags: string[];
  assignedTo?: string;
}

export interface SupportMacro {
  id: string;
  title: string;
  queueId: SupportQueueId;
  preview: string;
}

export interface SupportKnowledgeEntry {
  id: string;
  title: string;
  category: string;
  updatedAt: string;
  summary: string;
}

export interface SupportHubReadModel {
  generatedAt: string;
  queues: SupportQueue[];
  tickets: SupportTicket[];
  contacts: SupportContact[];
  macros: SupportMacro[];
  knowledge: SupportKnowledgeEntry[];
}

export interface SupportTicketFilter {
  queueId?: SupportQueueId;
  status?: SupportTicketStatus;
  priority?: SupportTicketPriority;
  search?: string;
}

export interface SupportHubStats {
  open: number;
  urgent: number;
  waiting: number;
  resolved: number;
  escalated: number;
  needsFollowUp: number;
}

export interface SupportQueueSummary {
  id: SupportQueueId;
  label: string;
  description: string;
  total: number;
  urgent: number;
  needsFollowUp: number;
}
