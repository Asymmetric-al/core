import { appendSupportAudit } from "../../admin/support-hub/audit";
import { extractEmailAddress } from "../../email/address";
import { EMAIL_INBOUND_PROCESS_EVENT } from "../events";
import {
  requestWorkflowDispatch,
  type CreateDispatchRequestInput,
  type RequestWorkflowDispatchDeps,
  type RequestWorkflowDispatchResult,
} from "../ledger";

import type { InboundEmailRow } from "./inbound-email";
import type { getAdminClient } from "@asym/database/supabase/admin";

type RoutingClient = NonNullable<ReturnType<typeof getAdminClient>["client"]>;

export type InboundRouteScope = "recipient" | "alias" | "domain_default";

export interface SupportInboundRoute {
  id: string;
  tenant_id: string;
  scope: InboundRouteScope;
  match_value: string;
  inbox_id: string;
  is_active: boolean;
}

export type InboundRouteDecision =
  | { kind: "inbox"; inboxId: string; source: string }
  | {
      kind: "review";
      reason: "no_route" | "ambiguous";
      candidateInboxIds: string[];
    };

function recipientAddresses(row: InboundEmailRow): string[] {
  return [
    ...new Set(
      [...row.to_recipients, ...row.cc_recipients, ...row.bcc_recipients]
        .map((value) => extractEmailAddress(value))
        .filter((value): value is string => Boolean(value)),
    ),
  ];
}

function recipientDomains(recipients: string[]): string[] {
  return [
    ...new Set(
      recipients
        .map((address) => address.split("@")[1])
        .filter((domain): domain is string => Boolean(domain)),
    ),
  ];
}

/**
 * Resolve the route for a tenant-owned inbound email. Known routes —
 * thread replies into existing conversations, configured Support Hub inbox
 * addresses, saved recipient/alias routes, and explicitly approved
 * tenant-domain defaults — route automatically. New sender, unusual subject,
 * or attachments alone never force review: the decision uses recipients and
 * threading only. Unknown or ambiguous safe routes hold for tenant review.
 */
export async function resolveInboundRouteDecision(
  client: RoutingClient,
  row: InboundEmailRow,
): Promise<InboundRouteDecision> {
  // 1. Thread reply into an existing conversation: route to that inbox.
  if (row.in_reply_to_header) {
    const { data: threadParent } = await client
      .from("email_inbound_messages")
      .select("conversation_id")
      .eq("tenant_id", row.tenant_id)
      .eq("message_id_header", row.in_reply_to_header)
      .not("conversation_id", "is", null)
      .limit(1)
      .maybeSingle();

    const conversationId = threadParent?.conversation_id as string | null;

    if (conversationId) {
      const { data: conversation } = await client
        .from("support_conversations")
        .select("inbox_id")
        .eq("tenant_id", row.tenant_id)
        .eq("id", conversationId)
        .maybeSingle();

      if (conversation?.inbox_id) {
        return {
          kind: "inbox",
          inboxId: String(conversation.inbox_id),
          source: "thread_reply",
        };
      }
    }
  }

  const recipients = recipientAddresses(row);

  // 2. Configured Support Hub inbox addresses.
  const { data: inboxes, error: inboxError } = await client
    .from("support_inboxes")
    .select("id, inbound_address")
    .eq("tenant_id", row.tenant_id);

  if (inboxError) {
    throw new Error(`inbound_route_inbox_lookup_failed: ${inboxError.message}`);
  }

  const inboxMatches = new Set<string>();
  for (const inbox of inboxes ?? []) {
    const address = String(inbox.inbound_address ?? "").toLowerCase();
    if (address && recipients.includes(address)) {
      inboxMatches.add(String(inbox.id));
    }
  }

  if (inboxMatches.size === 1) {
    return {
      kind: "inbox",
      inboxId: [...inboxMatches][0]!,
      source: "inbox_address",
    };
  }

  if (inboxMatches.size > 1) {
    return {
      kind: "review",
      reason: "ambiguous",
      candidateInboxIds: [...inboxMatches].sort(),
    };
  }

  // 3. Saved tenant routes: exact recipient/alias first, then approved
  //    tenant-domain defaults.
  const { data: routes, error: routesError } = await client
    .from("support_inbound_routes")
    .select("id, tenant_id, scope, match_value, inbox_id, is_active")
    .eq("tenant_id", row.tenant_id)
    .eq("is_active", true);

  if (routesError) {
    throw new Error(`inbound_route_lookup_failed: ${routesError.message}`);
  }

  const savedRoutes = (routes ?? []) as SupportInboundRoute[];
  const domains = recipientDomains(recipients);

  const exactMatches = new Set<string>();
  for (const route of savedRoutes) {
    if (
      (route.scope === "recipient" || route.scope === "alias") &&
      recipients.includes(route.match_value.toLowerCase())
    ) {
      exactMatches.add(route.inbox_id);
    }
  }

  if (exactMatches.size === 1) {
    return {
      kind: "inbox",
      inboxId: [...exactMatches][0]!,
      source: "saved_route",
    };
  }

  if (exactMatches.size > 1) {
    return {
      kind: "review",
      reason: "ambiguous",
      candidateInboxIds: [...exactMatches].sort(),
    };
  }

  const domainMatches = new Set<string>();
  for (const route of savedRoutes) {
    if (
      route.scope === "domain_default" &&
      domains.includes(route.match_value.toLowerCase())
    ) {
      domainMatches.add(route.inbox_id);
    }
  }

  if (domainMatches.size === 1) {
    return {
      kind: "inbox",
      inboxId: [...domainMatches][0]!,
      source: "domain_default",
    };
  }

  if (domainMatches.size > 1) {
    return {
      kind: "review",
      reason: "ambiguous",
      candidateInboxIds: [...domainMatches].sort(),
    };
  }

  return { kind: "review", reason: "no_route", candidateInboxIds: [] };
}

/**
 * Hold an inbound email for tenant routing review. Idempotent: replays reuse
 * the open review for the same inbound email.
 *
 * The pending-uniqueness guarantee comes from the PARTIAL unique index
 * idx_support_inbound_routing_reviews_pending (WHERE status = 'pending'),
 * which Postgres cannot use as an ON CONFLICT arbiter through PostgREST.
 * A plain insert with 23505 tolerance gives the same idempotency.
 */
export async function ensureRoutingReview(
  client: RoutingClient,
  row: InboundEmailRow,
  decision: Extract<InboundRouteDecision, { kind: "review" }>,
): Promise<void> {
  const { error } = await client
    .from("support_inbound_routing_reviews")
    .insert({
      tenant_id: row.tenant_id,
      inbound_email_id: row.id,
      status: "pending",
      reason: decision.reason,
      candidate_inbox_ids: decision.candidateInboxIds,
    });

  // 23505: an open pending review already exists — an idempotent replay.
  if (error && error.code !== "23505") {
    throw new Error(`inbound_routing_review_failed: ${error.message}`);
  }
}

export interface SaveInboundRouteDeps {
  client: RoutingClient;
  requestDispatch?: (
    deps: RequestWorkflowDispatchDeps,
    input: CreateDispatchRequestInput,
  ) => Promise<RequestWorkflowDispatchResult>;
}

export interface SaveInboundRouteInput {
  tenantId: string;
  inboundEmailRowId: string;
  inboxId: string;
  scope: InboundRouteScope;
  matchValue: string;
  domainDefaultConfirmed?: boolean;
  actorProfileId: string;
}

export interface SaveInboundRouteResult {
  status: "saved" | "confirmation_required";
  routeId: string | null;
  dispatch: RequestWorkflowDispatchResult["outcome"] | null;
  resumedPendingReviews: number;
}

/**
 * Route Save And Continue: any authenticated support agent in the owning
 * tenant saves the reviewed route, the save is audit logged (including the
 * domain-default confirmation result), the same email immediately continues
 * toward Support Hub routing, and other pending reviews that the new route
 * resolves resume without waiting for a scheduled scan.
 */
export async function saveInboundRouteAndResume(
  deps: SaveInboundRouteDeps,
  input: SaveInboundRouteInput,
): Promise<SaveInboundRouteResult> {
  if (input.scope === "domain_default" && !input.domainDefaultConfirmed) {
    // Domain Default Confirmation: a broad catch-all is never created by
    // accident. The refusal is also audit logged.
    await appendSupportAudit(deps.client, {
      tenantId: input.tenantId,
      actorProfileId: input.actorProfileId,
      verb: "inbound_route_confirmation_required",
      body: `Tenant-domain default route for ${input.matchValue} requires explicit confirmation.`,
      metadata: {
        savedScope: input.scope,
        savedValue: input.matchValue,
        domainDefaultConfirmationAccepted: false,
        inboundEmailId: input.inboundEmailRowId,
      },
    });

    return {
      status: "confirmation_required",
      routeId: null,
      dispatch: null,
      resumedPendingReviews: 0,
    };
  }

  const matchValue = input.matchValue.trim().toLowerCase();

  // The one-active-route guarantee comes from the PARTIAL unique index
  // idx_support_inbound_routes_active_match (WHERE is_active), which cannot
  // serve as an ON CONFLICT arbiter through PostgREST. Insert first; on a
  // 23505 conflict, redirect the existing active route instead.
  const inserted = await deps.client
    .from("support_inbound_routes")
    .insert({
      tenant_id: input.tenantId,
      scope: input.scope,
      match_value: matchValue,
      inbox_id: input.inboxId,
      is_active: true,
      created_by_profile_id: input.actorProfileId,
    })
    .select("id")
    .single();

  let routeId: string;

  if (!inserted.error && inserted.data) {
    routeId = String(inserted.data.id);
  } else if (inserted.error?.code === "23505") {
    // An active route for this (scope, value) already exists: redirect it.
    // The is_active filter is load-bearing — only one such row can exist,
    // and disabled historical rows must never be resurrected here.
    const updated = await deps.client
      .from("support_inbound_routes")
      .update({
        inbox_id: input.inboxId,
        created_by_profile_id: input.actorProfileId,
      })
      .eq("tenant_id", input.tenantId)
      .eq("scope", input.scope)
      .eq("match_value", matchValue)
      .eq("is_active", true)
      .select("id")
      .single();

    if (updated.error || !updated.data) {
      throw new Error(
        `inbound_route_save_failed: ${updated.error?.message ?? "missing row"}`,
      );
    }

    routeId = String(updated.data.id);
  } else {
    throw new Error(
      `inbound_route_save_failed: ${inserted.error?.message ?? "missing row"}`,
    );
  }

  await appendSupportAudit(deps.client, {
    tenantId: input.tenantId,
    actorProfileId: input.actorProfileId,
    verb: "inbound_route_saved",
    body: `Saved ${input.scope} inbound route ${matchValue}.`,
    metadata: {
      savedScope: input.scope,
      savedValue: matchValue,
      savedInboxId: input.inboxId,
      domainDefaultConfirmationAccepted:
        input.scope === "domain_default" ? true : null,
      inboundEmailId: input.inboundEmailRowId,
      routeId,
    },
  });

  // Resolve this email's pending review and continue routing immediately.
  await deps.client
    .from("support_inbound_routing_reviews")
    .update({
      status: "resolved",
      resolved_by_profile_id: input.actorProfileId,
      resolved_route_id: routeId,
      resolved_at: new Date().toISOString(),
    })
    .eq("tenant_id", input.tenantId)
    .eq("inbound_email_id", input.inboundEmailRowId)
    .eq("status", "pending");

  const requestDispatch = deps.requestDispatch ?? requestWorkflowDispatch;
  const dispatch = await requestDispatch(
    { client: deps.client },
    {
      tenantId: input.tenantId,
      productArea: "email",
      workflowName: EMAIL_INBOUND_PROCESS_EVENT,
      subject: { type: "email_inbound_message", id: input.inboundEmailRowId },
      idempotencyKey: `inbound-email-route-resume/${input.inboundEmailRowId}/route-${routeId}`,
      context: { resumedByRouteId: routeId },
    },
  );

  // Latest Active Route For Pending Email: other pending reviews whose
  // recipients match the new route resume now instead of waiting.
  const resumed = await resumeMatchingPendingReviews(deps, {
    tenantId: input.tenantId,
    routeId,
    scope: input.scope,
    matchValue,
    excludeInboundEmailId: input.inboundEmailRowId,
    actorProfileId: input.actorProfileId,
  });

  return {
    status: "saved",
    routeId,
    dispatch: dispatch.outcome,
    resumedPendingReviews: resumed,
  };
}

async function resumeMatchingPendingReviews(
  deps: SaveInboundRouteDeps,
  input: {
    tenantId: string;
    routeId: string;
    scope: InboundRouteScope;
    matchValue: string;
    excludeInboundEmailId: string;
    actorProfileId: string;
  },
): Promise<number> {
  const pending = await deps.client
    .from("support_inbound_routing_reviews")
    .select(
      "id, inbound_email_id, email_inbound_messages(to_recipients, cc_recipients, bcc_recipients)",
    )
    .eq("tenant_id", input.tenantId)
    .eq("status", "pending")
    .neq("inbound_email_id", input.excludeInboundEmailId)
    .limit(50);

  if (pending.error || !pending.data) {
    return 0;
  }

  const requestDispatch = deps.requestDispatch ?? requestWorkflowDispatch;

  const matched = pending.data.filter((review) => {
    const email = review.email_inbound_messages as unknown as {
      to_recipients: string[];
      cc_recipients: string[];
      bcc_recipients: string[];
    } | null;
    if (!email) return false;

    const recipients = [
      ...(email.to_recipients ?? []),
      ...(email.cc_recipients ?? []),
      ...(email.bcc_recipients ?? []),
    ]
      .map((value) => extractEmailAddress(value))
      .filter((value): value is string => Boolean(value));

    return input.scope === "domain_default"
      ? recipients.some((address) => address.split("@")[1] === input.matchValue)
      : recipients.includes(input.matchValue);
  });

  if (matched.length === 0) {
    return 0;
  }

  // One UPDATE resolves every matched review before the dispatch loop.
  await deps.client
    .from("support_inbound_routing_reviews")
    .update({
      status: "resolved",
      resolved_by_profile_id: input.actorProfileId,
      resolved_route_id: input.routeId,
      resolved_at: new Date().toISOString(),
    })
    .in(
      "id",
      matched.map((review) => review.id),
    );

  for (const review of matched) {
    await requestDispatch(
      { client: deps.client },
      {
        tenantId: input.tenantId,
        productArea: "email",
        workflowName: EMAIL_INBOUND_PROCESS_EVENT,
        subject: {
          type: "email_inbound_message",
          id: String(review.inbound_email_id),
        },
        idempotencyKey: `inbound-email-route-resume/${review.inbound_email_id}/route-${input.routeId}`,
        context: { resumedByRouteId: input.routeId },
      },
    );
  }

  return matched.length;
}

export interface ManageInboundRouteInput {
  tenantId: string;
  routeId: string;
  actorProfileId: string;
}

export async function listInboundRoutes(
  client: RoutingClient,
  tenantId: string,
): Promise<SupportInboundRoute[]> {
  const { data, error } = await client
    .from("support_inbound_routes")
    .select("id, tenant_id, scope, match_value, inbox_id, is_active")
    .eq("tenant_id", tenantId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`inbound_route_list_failed: ${error.message}`);
  }

  return (data ?? []) as SupportInboundRoute[];
}

export async function updateInboundRoute(
  client: RoutingClient,
  input: ManageInboundRouteInput & {
    patch: Partial<Pick<SupportInboundRoute, "inbox_id" | "is_active">>;
  },
): Promise<void> {
  const patch: Record<string, unknown> = { ...input.patch };
  if (input.patch.is_active === false) {
    patch.disabled_at = new Date().toISOString();
  }

  const { error } = await client
    .from("support_inbound_routes")
    .update(patch)
    .eq("tenant_id", input.tenantId)
    .eq("id", input.routeId);

  if (error) {
    throw new Error(`inbound_route_update_failed: ${error.message}`);
  }

  await appendSupportAudit(client, {
    tenantId: input.tenantId,
    actorProfileId: input.actorProfileId,
    verb:
      input.patch.is_active === false
        ? "inbound_route_disabled"
        : "inbound_route_updated",
    body: `Inbound route ${input.routeId} updated.`,
    metadata: { routeId: input.routeId, patch: input.patch },
  });
}

/**
 * Deleting a route removes the future active rule. Historical audit entries
 * in support_audit_log are never deleted.
 */
export async function deleteInboundRoute(
  client: RoutingClient,
  input: ManageInboundRouteInput,
): Promise<void> {
  const { error } = await client
    .from("support_inbound_routes")
    .delete()
    .eq("tenant_id", input.tenantId)
    .eq("id", input.routeId);

  if (error) {
    throw new Error(`inbound_route_delete_failed: ${error.message}`);
  }

  await appendSupportAudit(client, {
    tenantId: input.tenantId,
    actorProfileId: input.actorProfileId,
    verb: "inbound_route_deleted",
    body: `Inbound route ${input.routeId} deleted.`,
    metadata: { routeId: input.routeId },
  });
}
