import { randomUUID } from "node:crypto";

import { supportHubReadModel } from "@asym/database/collections/support-workspace";

import { ApiHttpError } from "../../shared/http-errors";

import type {
  CreateSupportTicketInput,
  SupportHubReadModel,
  SupportContact,
  SupportTicket,
  SupportTicketListParams,
} from "./types";
import type { AdminSupabaseClient } from "@asym/database/supabase/admin";

type SupportTicketRow = {
  id: string;
  public_id: string;
  tenant_id: string;
  contact_id: string | null;
  contact_name_snapshot: string | null;
  contact_email_snapshot: string | null;
  created_by: string;
  assigned_to_profile_id: string | null;
  queue_id: SupportTicket["queueId"];
  status: SupportTicket["status"];
  priority: SupportTicket["priority"];
  channel: SupportTicket["channel"];
  subject: string;
  summary: string;
  tags: string[] | null;
  follow_up_at: string | null;
  created_at: string;
  updated_at: string;
};

type SupportContactRow = {
  id: string;
  name: string;
  email: string;
  relationship: string;
  organization: string | null;
  last_seen_at: string | null;
  giving_summary: string | null;
};

function escapeSearchTerm(value: string) {
  return value.replace(/[%(),]/g, " ").trim();
}

function isMissingSupportTableError(error: {
  code?: string;
  message?: string;
}) {
  const message = error.message ?? "";
  const lowerMessage = message.toLowerCase();
  const mentionsSupportTable =
    /\b(?:public\.)?support_(?:contacts|tickets)\b/i.test(message);
  const hasMissingTableCode =
    error.code === "PGRST205" || error.code === "42P01";
  const hasMissingTableMessage =
    lowerMessage.includes("schema cache") ||
    lowerMessage.includes("does not exist") ||
    lowerMessage.includes("undefined_table") ||
    lowerMessage.includes("could not find the table") ||
    lowerMessage.includes("relation");

  return (
    mentionsSupportTable && (hasMissingTableCode || hasMissingTableMessage)
  );
}

function createSupportTicketPublicId() {
  const randomSuffix = randomUUID()
    .replaceAll("-", "")
    .slice(0, 12)
    .toUpperCase();

  return `SUP-${Date.now()}-${randomSuffix}`;
}

function mapTicketRow(row: SupportTicketRow): SupportTicket {
  return {
    id: row.public_id,
    subject: row.subject,
    contactId: row.contact_id ?? undefined,
    contactEmail: row.contact_email_snapshot ?? undefined,
    contactEmailSnapshot: row.contact_email_snapshot ?? undefined,
    contactName: row.contact_name_snapshot ?? undefined,
    contactNameSnapshot: row.contact_name_snapshot ?? undefined,
    queueId: row.queue_id,
    status: row.status,
    priority: row.priority,
    channel: row.channel,
    followUpAt: row.follow_up_at ?? undefined,
    updatedAt: row.updated_at,
    summary: row.summary,
    tags: row.tags ?? [],
    assignedTo: row.assigned_to_profile_id ?? undefined,
  };
}

function mapContactRow(row: SupportContactRow): SupportContact {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    relationship: row.relationship,
    organization: row.organization ?? undefined,
    lastSeenAt: row.last_seen_at ?? "",
    givingSummary: row.giving_summary ?? undefined,
  };
}

export async function getSupportSummary(
  supabaseAdmin: AdminSupabaseClient,
  tenantId: string,
): Promise<SupportHubReadModel> {
  const [metadata, tickets] = await Promise.all([
    getSupportMetadata(supabaseAdmin, tenantId),
    listSupportTickets(supabaseAdmin, tenantId),
  ]);

  return {
    ...metadata,
    tickets,
  };
}

export async function getSupportMetadata(
  supabaseAdmin: AdminSupabaseClient,
  tenantId: string,
): Promise<SupportHubReadModel> {
  const contacts = await listSupportContacts(supabaseAdmin, tenantId);

  return {
    generatedAt: new Date().toISOString(),
    queues: structuredClone(supportHubReadModel.queues),
    tickets: [],
    contacts,
    macros: structuredClone(supportHubReadModel.macros),
    knowledge: structuredClone(supportHubReadModel.knowledge),
  };
}

export async function listSupportTickets(
  supabaseAdmin: AdminSupabaseClient,
  tenantId: string,
  params: SupportTicketListParams = {},
): Promise<SupportTicket[]> {
  let query = supabaseAdmin
    .from("support_tickets")
    .select("*")
    .eq("tenant_id", tenantId);

  if (params.queueId) {
    query = query.eq("queue_id", params.queueId);
  }

  if (params.status) {
    query = query.eq("status", params.status);
  }

  if (params.search) {
    const term = escapeSearchTerm(params.search);
    query = query.or(
      `subject.ilike.%${term}%,summary.ilike.%${term}%,contact_name_snapshot.ilike.%${term}%,contact_email_snapshot.ilike.%${term}%`,
    );
  }

  const { data, error } = await query.order("updated_at", {
    ascending: false,
  });
  if (error) {
    if (isMissingSupportTableError(error)) {
      return [];
    }

    throw new ApiHttpError(500, error.message);
  }

  return ((data ?? []) as SupportTicketRow[]).map(mapTicketRow);
}

export async function getSupportTicket(
  supabaseAdmin: AdminSupabaseClient,
  tenantId: string,
  id: string,
): Promise<SupportTicket | null> {
  const { data, error } = await supabaseAdmin
    .from("support_tickets")
    .select("*")
    .eq("tenant_id", tenantId)
    .eq("public_id", id)
    .maybeSingle();
  if (error) {
    if (isMissingSupportTableError(error)) {
      return null;
    }

    throw new ApiHttpError(500, error.message);
  }

  return data ? mapTicketRow(data as SupportTicketRow) : null;
}

export async function createSupportTicket(
  supabaseAdmin: AdminSupabaseClient,
  tenantId: string,
  userId: string,
  input: CreateSupportTicketInput,
): Promise<SupportTicket> {
  const publicId = createSupportTicketPublicId();
  const { data, error } = await supabaseAdmin
    .from("support_tickets")
    .insert({
      channel: "form",
      contact_id: input.contactId ?? null,
      contact_email_snapshot: input.contactEmail || null,
      contact_name_snapshot: input.contactName,
      created_by: userId,
      priority: input.priority,
      public_id: publicId,
      queue_id: input.queueId,
      status: "open",
      subject: input.subject,
      summary: input.summary,
      tags: [],
      tenant_id: tenantId,
      follow_up_at: null,
    })
    .select("*")
    .single();

  if (error) {
    throw new ApiHttpError(500, error.message);
  }

  return mapTicketRow(data as SupportTicketRow);
}

async function listSupportContacts(
  supabaseAdmin: AdminSupabaseClient,
  tenantId: string,
): Promise<SupportContact[]> {
  const { data, error } = await supabaseAdmin
    .from("support_contacts")
    .select("*")
    .eq("tenant_id", tenantId)
    .order("last_seen_at", { ascending: false });
  if (error) {
    if (isMissingSupportTableError(error)) {
      return [];
    }

    throw new ApiHttpError(500, error.message);
  }

  return ((data ?? []) as SupportContactRow[]).map(mapContactRow);
}
