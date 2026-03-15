import {
  getAuthContext,
  requireRole,
  type AuthenticatedContext,
} from "@asym/auth/context";
import { getAdminClient } from "@asym/database/supabase/admin";
import { RESEND_ERROR_CODES, sendTestEmail } from "@asym/email";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { decryptResendApiKey } from "./crypto";
import { readTenantEmailSettings } from "./settings-store";
import {
  ApiHttpError,
  ensureJsonBody,
  toErrorResponse,
} from "../shared/http-errors";

const sendTestEmailSchema = z.object({
  apiKey: z.string().min(1, "Resend API key is required").optional(),
  toEmail: z.string().email("Recipient email must be a valid email address"),
  fromEmail: z
    .string()
    .email("From email must be a valid email address")
    .optional(),
  fromName: z
    .string()
    .min(1, "From name is required")
    .max(120, "From name is too long")
    .optional(),
});

function statusFromErrorCode(errorCode?: string): number {
  switch (errorCode) {
    case RESEND_ERROR_CODES.UNAUTHORIZED:
      return 401;
    case RESEND_ERROR_CODES.FORBIDDEN:
      return 403;
    case RESEND_ERROR_CODES.RATE_LIMITED:
      return 429;
    case RESEND_ERROR_CODES.CONFLICT:
      return 409;
    case RESEND_ERROR_CODES.INVALID_EMAIL:
    case RESEND_ERROR_CODES.VALIDATION_ERROR:
    case RESEND_ERROR_CODES.INVALID_API_KEY:
      return 400;
    case RESEND_ERROR_CODES.SENDER_NOT_VERIFIED:
      return 422;
    case RESEND_ERROR_CODES.SERVER_ERROR:
      return 502;
    default:
      return 500;
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await getAuthContext();
    requireRole(auth, ["admin", "super_admin"]);
    const ctx = auth as AuthenticatedContext;

    const body = sendTestEmailSchema.parse(await ensureJsonBody(request));
    const storedSettings = await readTenantEmailSettings(ctx.tenantId);

    const resolvedApiKey =
      body.apiKey ??
      (storedSettings?.resend_api_key_encrypted
        ? decryptResendApiKey(storedSettings.resend_api_key_encrypted)
        : null);
    if (!resolvedApiKey) {
      throw new ApiHttpError(
        400,
        "Resend API key is required. Connect Resend first or pass apiKey explicitly.",
      );
    }

    const resolvedFromEmail =
      body.fromEmail ?? storedSettings?.default_from_email;
    if (!resolvedFromEmail) {
      throw new ApiHttpError(
        400,
        "From email is required. Configure a default sender or pass fromEmail.",
      );
    }

    const resolvedFromName = body.fromName ?? storedSettings?.default_from_name;
    if (!resolvedFromName) {
      throw new ApiHttpError(
        400,
        "From name is required. Configure a default sender or pass fromName.",
      );
    }

    const result = await sendTestEmail(
      resolvedApiKey,
      body.toEmail,
      resolvedFromEmail,
      resolvedFromName,
    );
    const idempotencyKey = `test-send/${ctx.tenantId}/${Date.now()}`;
    const { client: supabaseAdmin } = getAdminClient();
    if (supabaseAdmin) {
      await supabaseAdmin.from("email_send_logs").insert({
        tenant_id: ctx.tenantId,
        idempotency_key: idempotencyKey,
        correlation_id: result.correlationId,
        status: result.success ? "sent" : "failed",
        resend_message_id: result.messageId ?? null,
        recipient_count: 1,
        message_type: "transactional",
        requested_at: new Date().toISOString(),
        sent_at: result.success ? new Date().toISOString() : null,
        error_code: result.errors?.[0]?.code ?? null,
        error_message: result.errors?.[0]?.message ?? null,
        retry_count: 0,
        metadata: {
          toEmail: body.toEmail,
          fromEmail: resolvedFromEmail,
          fromName: resolvedFromName,
          source: "admin_test_send",
        },
      });
    }

    if (!result.success) {
      const firstError = result.errors?.[0];
      return NextResponse.json(
        {
          success: false,
          error: firstError?.message ?? "Failed to send test email",
          code: firstError?.code,
          correlationId: result.correlationId,
        },
        { status: statusFromErrorCode(firstError?.code) },
      );
    }

    return NextResponse.json(
      {
        success: true,
        messageId: result.messageId,
        correlationId: result.correlationId,
      },
      { status: 200 },
    );
  } catch (error) {
    return toErrorResponse(error);
  }
}
