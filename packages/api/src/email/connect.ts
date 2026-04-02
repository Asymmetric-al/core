import {
  getAuthContext,
  requireRole,
  type AuthenticatedContext,
} from "@asym/auth/context";
import {
  createResendValidationSnapshot,
  isResendValidationSendReady,
  parseResendValidationSnapshot,
  RESEND_ERROR_CODES,
  validateResendApiKey,
} from "@asym/email";
import {
  type ConnectResendRequest,
  type ConnectResendResponse,
  type DeliverabilityWarning,
  type ResendConnectionStateResponse,
} from "@asym/email/types";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { encryptResendApiKey } from "./crypto";
import {
  disconnectTenantEmailSettings,
  isTenantEmailSettingsStorageUnavailable,
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

async function requireAdminContext(
  request?: Request,
): Promise<AuthenticatedContext> {
  const auth = await getAuthContext(request);
  requireRole(auth, ["admin", "super_admin"]);
  return auth as AuthenticatedContext;
}

function getApiKeyHint(apiKey: string): string {
  const suffix = apiKey.slice(-4);
  return suffix.padStart(4, "*");
}

function getStorageUnavailableWarning(): DeliverabilityWarning {
  return {
    code: "EMAIL_SETTINGS_STORAGE_UNAVAILABLE",
    severity: "warning",
    message:
      "This environment cannot persist Resend settings yet. The API key can be validated and used for this session, but the connection will not survive a page refresh until the email settings migration is applied.",
  };
}

function getRevalidationRequiredWarning(): DeliverabilityWarning {
  return {
    code: "RESEND_CONNECTION_REQUIRES_REVALIDATION",
    severity: "warning",
    message:
      "This Resend connection was saved before validation metadata was persisted. Reconnect once to refresh verified domains, sender suggestions, and send readiness.",
  };
}

function getBlockingWarning(
  warnings: DeliverabilityWarning[] | undefined,
): DeliverabilityWarning | undefined {
  return warnings?.find((warning) => warning.severity === "error");
}

export async function GET(request: NextRequest) {
  try {
    const ctx = await requireAdminContext(request);
    let storedSettings;

    try {
      storedSettings = await readTenantEmailSettings(ctx.tenantId);
    } catch (error) {
      if (!isTenantEmailSettingsStorageUnavailable(error)) {
        throw error;
      }

      return NextResponse.json(
        {
          success: true,
          connected: false,
          sendReady: false,
          persisted: false,
          warnings: [getStorageUnavailableWarning()],
        } satisfies ResendConnectionStateResponse,
        { status: 200 },
      );
    }

    if (!storedSettings) {
      return NextResponse.json(
        {
          success: true,
          connected: false,
          sendReady: false,
          persisted: true,
        } satisfies ResendConnectionStateResponse,
        { status: 200 },
      );
    }

    if (!storedSettings.is_connected) {
      return NextResponse.json(
        {
          success: true,
          connected: false,
          sendReady: false,
          defaultFromEmail: storedSettings.default_from_email,
          defaultFromName: storedSettings.default_from_name,
          replyToEmail: storedSettings.reply_to_email,
          persisted: true,
        } satisfies ResendConnectionStateResponse,
        { status: 200 },
      );
    }

    const validationSnapshot = parseResendValidationSnapshot(
      storedSettings.validation_snapshot,
    );

    if (!validationSnapshot) {
      return NextResponse.json(
        {
          success: true,
          connected: true,
          sendReady: false,
          apiKeyHint: storedSettings.resend_api_key_hint,
          defaultFromEmail: storedSettings.default_from_email,
          defaultFromName: storedSettings.default_from_name,
          replyToEmail: storedSettings.reply_to_email,
          warnings: [getRevalidationRequiredWarning()],
          persisted: true,
        } satisfies ResendConnectionStateResponse,
        { status: 200 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        connected: true,
        sendReady: isResendValidationSendReady(validationSnapshot),
        apiKeyHint: storedSettings.resend_api_key_hint,
        defaultFromEmail: storedSettings.default_from_email,
        defaultFromName: storedSettings.default_from_name,
        replyToEmail: storedSettings.reply_to_email,
        senderIdentities: validationSnapshot.senderIdentities,
        domainAuthentication: validationSnapshot.domainAuthentication,
        deliverabilityScore: validationSnapshot.deliverabilityScore,
        warnings: validationSnapshot.warnings,
        persisted: true,
      } satisfies ResendConnectionStateResponse,
      { status: 200 },
    );
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const ctx = await requireAdminContext(request);

    const body = connectResendSchema.parse(
      await ensureJsonBody(request),
    ) as ConnectResendRequest;
    const validation = await validateResendApiKey(body.apiKey, {
      defaultFromEmail: body.defaultFromEmail,
    });

    if (!validation.valid) {
      return NextResponse.json(
        {
          success: false,
          sendReady: false,
          error: validation.error ?? "Failed to validate Resend API key",
        } satisfies ConnectResendResponse,
        { status: statusFromResendCode(validation.errorCode) },
      );
    }

    const blockingWarning = getBlockingWarning(validation.warnings);
    if (blockingWarning) {
      return NextResponse.json(
        {
          success: false,
          sendReady: false,
          error: blockingWarning.message,
          warnings: validation.warnings,
        } satisfies ConnectResendResponse,
        { status: 422 },
      );
    }

    const validationSnapshot = createResendValidationSnapshot(validation);
    let persisted = true;
    let warnings = validationSnapshot.warnings;

    try {
      await upsertTenantEmailSettings({
        tenantId: ctx.tenantId,
        defaultFromEmail: body.defaultFromEmail,
        defaultFromName: body.defaultFromName,
        replyToEmail: body.replyToEmail,
        encryptedApiKey: encryptResendApiKey(body.apiKey),
        apiKeyHint: getApiKeyHint(body.apiKey),
        domainAuthenticated: validationSnapshot.domainAuthenticated,
        dkimVerified: validationSnapshot.dkimVerified,
        spfVerified: validationSnapshot.spfVerified,
        deliverabilityScore: validationSnapshot.deliverabilityScore,
        validationSnapshot,
      });
    } catch (error) {
      if (!isTenantEmailSettingsStorageUnavailable(error)) {
        throw error;
      }

      persisted = false;
      warnings = [...warnings, getStorageUnavailableWarning()];
    }

    return NextResponse.json(
      {
        success: true,
        sendReady: isResendValidationSendReady({
          ...validationSnapshot,
          warnings,
        }),
        connectionId: persisted ? `${ctx.tenantId}:resend` : undefined,
        apiKeyHint: getApiKeyHint(body.apiKey),
        senderIdentities: validationSnapshot.senderIdentities,
        domainAuthentication: validationSnapshot.domainAuthentication,
        deliverabilityScore: validationSnapshot.deliverabilityScore,
        warnings,
        persisted,
      } satisfies ConnectResendResponse,
      { status: 200 },
    );
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const ctx = await requireAdminContext(request);
    let persisted = true;

    try {
      await disconnectTenantEmailSettings(ctx.tenantId);
    } catch (error) {
      if (!isTenantEmailSettingsStorageUnavailable(error)) {
        throw error;
      }

      persisted = false;
    }

    return NextResponse.json(
      {
        success: true,
        connected: false,
        sendReady: false,
        persisted,
      } satisfies ResendConnectionStateResponse,
      { status: 200 },
    );
  } catch (error) {
    return toErrorResponse(error);
  }
}
