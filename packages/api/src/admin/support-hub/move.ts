import {
  getAuthContext,
  requireRole,
  type AuthenticatedContext,
} from "@asym/auth/context";
import { getAdminClient } from "@asym/database/supabase/admin";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import {
  bulkMoveSupportConversations,
  moveSupportConversation,
  retryFailedBulkMove,
} from "./move-service";
import { toErrorResponse } from "../../shared/http-errors";

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

function requireSupportAgent(request: NextRequest) {
  return getAuthContext(request).then((auth) => {
    requireRole(auth, ["admin", "staff", "super_admin"]);
    return auth as AuthenticatedContext;
  });
}

/**
 * Explicit audited Support Hub conversation move. Tenant scoping, reason
 * validation, retention rules, markers, and audit live in the move service.
 */
export async function POST(request: NextRequest) {
  try {
    const ctx = await requireSupportAgent(request);

    const { client: supabaseAdmin, error: adminError } = getAdminClient();
    if (!supabaseAdmin) {
      return NextResponse.json({ error: adminError }, { status: 503 });
    }

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
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function bulkMovePOST(request: NextRequest) {
  try {
    const ctx = await requireSupportAgent(request);

    const { client: supabaseAdmin, error: adminError } = getAdminClient();
    if (!supabaseAdmin) {
      return NextResponse.json({ error: adminError }, { status: 503 });
    }

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
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function retryPOST(request: NextRequest) {
  try {
    const ctx = await requireSupportAgent(request);

    const { client: supabaseAdmin, error: adminError } = getAdminClient();
    if (!supabaseAdmin) {
      return NextResponse.json({ error: adminError }, { status: 503 });
    }

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
  } catch (error) {
    return toErrorResponse(error);
  }
}
