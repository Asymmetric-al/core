import { type AuthenticatedContext } from "@asym/auth/context";
import { NextResponse } from "next/server";
import { z } from "zod";

import {
  bulkMoveSupportConversations,
  moveSupportConversation,
  retryFailedBulkMove,
} from "./move-service";
import { withOperation } from "../../shared/with-operation";

const moveSchema = z
  .object({
    conversationId: z.string().min(1),
    destinationInboxId: z.string().min(1),
    reason: z.string(),
    confirmResolved: z.boolean().optional(),
  })
  .strict();

const bulkMoveSchema = z
  .object({
    conversationIds: z.array(z.string().min(1)).min(1).max(100),
    destinationInboxId: z.string().min(1),
    reason: z.string(),
    confirmResolved: z.boolean().optional(),
  })
  .strict();

const retrySchema = z
  .object({
    batchOperationId: z.string().uuid(),
    confirmResolved: z.boolean().optional(),
  })
  .strict();

const SUPPORT_AGENT_ROLES = ["admin", "staff", "super_admin"] as const;

/**
 * Explicit audited Support Hub conversation move. Tenant scoping, reason
 * validation, retention rules, markers, and audit live in the move service.
 */
export const POST = withOperation(
  async ({ supabaseAdmin, auth, request }) => {
    const ctx = auth as AuthenticatedContext;

    const parsed = moveSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid move request." },
        { status: 400 },
      );
    }

    const result = await moveSupportConversation(supabaseAdmin, {
      tenantId: ctx.tenantId,
      conversationId: parsed.data.conversationId,
      destinationInboxId: parsed.data.destinationInboxId,
      reason: parsed.data.reason,
      actorProfileId: ctx.userId,
      confirmResolved: parsed.data.confirmResolved,
    });

    if (result.status === "failed") {
      const statusCode =
        result.code === "resolved_confirmation_required" ? 409 : 400;
      return NextResponse.json(
        { status: result.status, code: result.code, error: result.message },
        { status: statusCode },
      );
    }

    return NextResponse.json(result);
  },
  { roles: [...SUPPORT_AGENT_ROLES] },
);

export const bulkMovePOST = withOperation(
  async ({ supabaseAdmin, auth, request }) => {
    const ctx = auth as AuthenticatedContext;

    const parsed = bulkMoveSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid bulk move request." },
        { status: 400 },
      );
    }

    const result = await bulkMoveSupportConversations(supabaseAdmin, {
      tenantId: ctx.tenantId,
      conversationIds: parsed.data.conversationIds,
      destinationInboxId: parsed.data.destinationInboxId,
      reason: parsed.data.reason,
      actorProfileId: ctx.userId,
      confirmResolved: parsed.data.confirmResolved,
    });

    return NextResponse.json(result);
  },
  { roles: [...SUPPORT_AGENT_ROLES] },
);

export const retryPOST = withOperation(
  async ({ supabaseAdmin, auth, request }) => {
    const ctx = auth as AuthenticatedContext;

    const parsed = retrySchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid retry request." },
        { status: 400 },
      );
    }

    const result = await retryFailedBulkMove(supabaseAdmin, {
      tenantId: ctx.tenantId,
      batchOperationId: parsed.data.batchOperationId,
      actorProfileId: ctx.userId,
      confirmResolved: parsed.data.confirmResolved,
    });

    return NextResponse.json(result);
  },
  { roles: [...SUPPORT_AGENT_ROLES] },
);
