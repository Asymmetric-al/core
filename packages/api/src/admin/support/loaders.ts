import { getAuthContext, requireRole } from "@asym/auth/context";
import { getAdminClient } from "@asym/database/supabase/admin";

import { parseSupportTicketListParams } from "./query";
import {
  getSupportSummary,
  getSupportTicket,
  listSupportTickets,
} from "./service";

import type {
  SupportContact,
  SupportHubReadModel,
  SupportKnowledgeEntry,
  SupportMacro,
  SupportQueue,
  SupportTicket,
} from "./types";
import type { AdminSupabaseClient } from "@asym/database/supabase/admin";

const SUPPORT_ADMIN_ROLES = ["staff", "admin", "super_admin"] as const;

interface SupportLoaderContext {
  supabaseAdmin: AdminSupabaseClient;
  tenantId: string;
}

export interface SupportTicketDetailReadModel {
  contacts: SupportContact[];
  generatedAt: string;
  knowledge: SupportKnowledgeEntry[];
  macros: SupportMacro[];
  queues: SupportQueue[];
  ticket: SupportTicket | null;
}

async function getSupportLoaderContext(): Promise<SupportLoaderContext> {
  const auth = await getAuthContext();
  requireRole(auth, [...SUPPORT_ADMIN_ROLES]);

  const { client, error } = getAdminClient();
  if (error || !client) {
    throw new Error(error ?? "Support Hub requires an admin Supabase client.");
  }

  return {
    supabaseAdmin: client,
    tenantId: auth.tenantId,
  };
}

export async function loadSupportHubReadModel(): Promise<SupportHubReadModel> {
  const { supabaseAdmin, tenantId } = await getSupportLoaderContext();

  return getSupportSummary(supabaseAdmin, tenantId);
}

export async function loadSupportTicketList(
  searchParams: URLSearchParams,
): Promise<SupportHubReadModel> {
  const { supabaseAdmin, tenantId } = await getSupportLoaderContext();
  const params = parseSupportTicketListParams(searchParams);
  const [model, tickets] = await Promise.all([
    getSupportSummary(supabaseAdmin, tenantId),
    listSupportTickets(supabaseAdmin, tenantId, params),
  ]);

  return {
    ...model,
    tickets,
  };
}

export async function loadSupportTicketDetail(
  id: string,
): Promise<SupportTicketDetailReadModel> {
  const { supabaseAdmin, tenantId } = await getSupportLoaderContext();
  const [model, ticket] = await Promise.all([
    getSupportSummary(supabaseAdmin, tenantId),
    getSupportTicket(supabaseAdmin, tenantId, id),
  ]);

  return {
    contacts: model.contacts,
    generatedAt: model.generatedAt,
    knowledge: model.knowledge,
    macros: model.macros,
    queues: model.queues,
    ticket,
  };
}
