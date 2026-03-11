import {
  getAuthContext,
  requireRole,
  type AuthenticatedContext,
} from "@asym/auth/context";
import { RESEND_ERROR_CODES, validateResendApiKey } from "@asym/email";
import {
  type ConnectResendRequest,
  type ConnectResendResponse,
  type ResendConnectionStateResponse,
} from "@asym/email/types";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { decryptResendApiKey, encryptResendApiKey } from "./crypto";
import {
  disconnectTenantEmailSettings,
  readTenantEmailSettings,
  upsertTenantEmailSettings,
} from "./settings-store";
import { ensureJsonBody, toErrorResponse } from "../shared/http-errors";

const connectResendSchema = z.object({
  apiKey: z.string().min(1, "Resend API key is required"),
  defaultFromEmail: z
    .string()
    .email("Default from email must be a valid email address"),
  defaultFromName: z
    .string()
    .min(1, "Default from name is required")
    .max(120, "Default from name is too long"),
  replyToEmail: z
    .string()
    .email("Reply-to email must be a valid email address")
    .optional(),
});

function statusFromResendCode(errorCode?: string): number {
  switch (errorCode) {
    case RESEND_ERROR_CODES.UNAUTHORIZED:
      return 401;
    case RESEND_ERROR_CODES.FORBIDDEN:
      return 403;
    case RESEND_ERROR_CODES.RATE_LIMITED:
      return 429;
    case RESEND_ERROR_CODES.CONFLICT:
      return 409;
    case RESEND_ERROR_CODES.INVALID_API_KEY:
    case RESEND_ERROR_CODES.VALIDATION_ERROR:
      return 400;
    case RESEND_ERROR_CODES.SERVER_ERROR:
      return 502;
    default:
      return 400;
  }
}

async function requireAdminContext(): Promise<AuthenticatedContext> {
  const auth = await getAuthContext();
  requireRole(auth, ["admin", "super_admin"]);
  return auth as AuthenticatedContext;
}

function getApiKeyHint(apiKey: string): string {
  const suffix = apiKey.slice(-4);
  return suffix.padStart(4, "*");
}

export async function GET() {
  try {
    const ctx = await requireAdminContext();
    const storedSettings = await readTenantEmailSettings(ctx.tenantId);

    if (!storedSettings || !storedSettings.is_connected) {
      return NextResponse.json(
        {
          success: true,
          connected: false,
        } satisfies ResendConnectionStateResponse,
        { status: 200 },
      );
    }

    let senderIdentities: ConnectResendResponse["senderIdentities"] = [];
    let domainAuthentication: ConnectResendResponse["domainAuthentication"] =
      [];
    let deliverabilityScore = storedSettings.deliverability_score ?? 0;
    let warnings: ConnectResendResponse["warnings"] = [];
    let connected = true;
    let error: string | undefined;

    if (storedSettings.resend_api_key_encrypted) {
      const decryptedApiKey = decryptResendApiKey(
        storedSettings.resend_api_key_encrypted,
      );
      const validation = await validateResendApiKey(decryptedApiKey);

      if (validation.valid) {
        senderIdentities = validation.senderIdentities ?? [];
        domainAuthentication = validation.domainAuthentication ?? [];
        deliverabilityScore =
          validation.deliverabilityScore ?? deliverabilityScore;
        warnings = validation.warnings ?? [];
      } else {
        connected = false;
        error = validation.error ?? "Stored Resend API key is no longer valid.";
      }
    } else {
      connected = false;
      error = "No encrypted API key is stored for this tenant.";
    }

    return NextResponse.json(
      {
        success: true,
        connected,
        apiKeyHint: storedSettings.resend_api_key_hint,
        defaultFromEmail: storedSettings.default_from_email,
        defaultFromName: storedSettings.default_from_name,
        replyToEmail: storedSettings.reply_to_email,
        senderIdentities,
        domainAuthentication,
        deliverabilityScore,
        warnings,
        error,
      } satisfies ResendConnectionStateResponse,
      { status: 200 },
    );
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const ctx = await requireAdminContext();

    const body = connectResendSchema.parse(
      await ensureJsonBody(request),
    ) as ConnectResendRequest;
    const validation = await validateResendApiKey(body.apiKey);

    if (!validation.valid) {
      return NextResponse.json(
        {
          success: false,
          error: validation.error ?? "Failed to validate Resend API key",
        } satisfies ConnectResendResponse,
        { status: statusFromResendCode(validation.errorCode) },
      );
    }

    await upsertTenantEmailSettings({
      tenantId: ctx.tenantId,
      defaultFromEmail: body.defaultFromEmail,
      defaultFromName: body.defaultFromName,
      replyToEmail: body.replyToEmail,
      encryptedApiKey: encryptResendApiKey(body.apiKey),
      apiKeyHint: getApiKeyHint(body.apiKey),
      domainAuthenticated:
        (validation.domainAuthentication ?? []).filter((domain) => domain.valid)
          .length > 0,
      dkimVerified:
        (validation.domainAuthentication ?? []).filter((domain) => domain.valid)
          .length > 0,
      spfVerified:
        (validation.domainAuthentication ?? []).filter((domain) => domain.valid)
          .length > 0,
      deliverabilityScore: validation.deliverabilityScore ?? 0,
    });

    return NextResponse.json(
      {
        success: true,
        connectionId: `${ctx.tenantId}:resend`,
        apiKeyHint: getApiKeyHint(body.apiKey),
        senderIdentities: validation.senderIdentities ?? [],
        domainAuthentication: validation.domainAuthentication ?? [],
        deliverabilityScore: validation.deliverabilityScore ?? 0,
        warnings: validation.warnings ?? [],
      } satisfies ConnectResendResponse,
      { status: 200 },
    );
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function DELETE() {
  try {
    const ctx = await requireAdminContext();
    await disconnectTenantEmailSettings(ctx.tenantId);

    return NextResponse.json(
      {
        success: true,
        connected: false,
      } satisfies ResendConnectionStateResponse,
      { status: 200 },
    );
  } catch (error) {
    return toErrorResponse(error);
  }
}
