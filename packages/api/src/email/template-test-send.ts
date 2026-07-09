import {
  getAuthContext,
  requireRole,
  type AuthenticatedContext,
} from "@asym/auth/context";
import { getAdminClient } from "@asym/database/supabase/admin";
import {
  getFirstBlockingDeliverabilityWarning,
  RESEND_ERROR_CODES,
  sendEmail,
  toTestSendBlockingErrorCode,
  validateResendApiKey,
} from "@asym/email";
import { renderTemplateForRecipient } from "@asym/email/merge-tag-render";
import { getMergeTagSamples } from "@asym/email/merge-tags";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { evaluateEmailConsent, type EmailConsentDecision } from "./consent";
import { decryptResendApiKey } from "./crypto";
import {
  isTenantEmailSettingsStorageUnavailable,
  readTenantEmailSettings,
} from "./settings-store";
import {
  listEmailTemplateVersions,
  requireEmailTemplate,
} from "./template-store";
import {
  ApiHttpError,
  ensureJsonBody,
  toErrorResponse,
} from "../shared/http-errors";

import type { EmailBuilderKind } from "@asym/email/email-builder-types";
import type { EmailMessageType } from "@asym/email/types";

const emailBuilderSchema = z.enum(["unlayer", "react_email"]);
const jsonRecordSchema = z.record(z.string(), z.unknown());

const templateTestSendSchema = z.object({
  toEmail: z.string().email("Recipient email must be a valid email address"),
  fromEmail: z
    .string()
    .email("From email must be a valid email address")
    .optional(),
  fromName: z.string().min(1).max(120).optional(),
  replyToEmail: z
    .string()
    .email("Reply-to email must be a valid email address")
    .optional(),
  subject: z.string().min(1, "Subject is required").max(240).optional(),
  preheader: z.string().max(320).optional(),
  builder: emailBuilderSchema.optional(),
  builderVersion: z.string().max(80).nullable().optional(),
  designJson: jsonRecordSchema.optional(),
  html: z.string().min(1, "HTML content is required").optional(),
  text: z.string().min(1, "Plain text content is required").optional(),
  sampleMergeTags: z.record(z.string(), z.string()).optional(),
  messageType: z.enum(["transactional", "marketing"]).optional(),
});

function testSendConsentMessage(
  decision: Extract<EmailConsentDecision, { allowed: false }>,
): string {
  switch (decision.reason) {
    case "do_not_contact":
      return "This recipient has opted out of all contact and cannot be emailed.";
    case "do_not_email":
      return "This recipient has opted out of marketing email, so this campaign-type test cannot be sent to them.";
    case "suppressed":
      return `This address is on the suppression list (${
        decision.suppressionType ?? "suppressed"
      }) and cannot be emailed.`;
  }
}

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
    case RESEND_ERROR_CODES.DOMAIN_NOT_AUTHENTICATED:
    case RESEND_ERROR_CODES.SENDER_NOT_VERIFIED:
      return 422;
    case RESEND_ERROR_CODES.SERVER_ERROR:
      return 502;
    default:
      return 500;
  }
}

async function requireAdminContext(
  request?: Request,
): Promise<AuthenticatedContext> {
  const auth = await getAuthContext(request);
  requireRole(auth, ["admin", "super_admin"]);
  return auth as AuthenticatedContext;
}

async function resolveTenantResendSettings(input: {
  tenantId: string;
  fromEmail?: string;
  fromName?: string;
  replyToEmail?: string;
}) {
  let storedSettings = null;

  try {
    storedSettings = await readTenantEmailSettings(input.tenantId);
  } catch (error) {
    if (!isTenantEmailSettingsStorageUnavailable(error)) {
      throw error;
    }
  }

  const apiKey = storedSettings?.resend_api_key_encrypted
    ? decryptResendApiKey(storedSettings.resend_api_key_encrypted)
    : null;
  if (!apiKey) {
    throw new ApiHttpError(
      400,
      "Connect Resend before sending template tests.",
    );
  }

  const fromEmail = input.fromEmail ?? storedSettings?.default_from_email;
  if (!fromEmail) {
    throw new ApiHttpError(400, "From email is required.");
  }

  const fromName = input.fromName ?? storedSettings?.default_from_name;
  if (!fromName) {
    throw new ApiHttpError(400, "From name is required.");
  }

  return {
    apiKey,
    fromEmail,
    fromName,
    replyToEmail: input.replyToEmail ?? storedSettings?.reply_to_email ?? null,
  };
}

async function sendTemplateTestEmail(input: {
  ctx: AuthenticatedContext;
  templateId?: string | null;
  templateVersionId?: string | null;
  templateVersion?: number | null;
  builder: EmailBuilderKind;
  builderVersion?: string | null;
  designJson?: Record<string, unknown>;
  html: string;
  text: string;
  subject: string;
  preheader?: string | null;
  messageType: EmailMessageType;
  toEmail: string;
  fromEmail?: string;
  fromName?: string;
  replyToEmail?: string | null;
  sampleMergeTags?: Record<string, string>;
}) {
  const settings = await resolveTenantResendSettings({
    tenantId: input.ctx.tenantId,
    fromEmail: input.fromEmail,
    fromName: input.fromName,
    replyToEmail: input.replyToEmail ?? undefined,
  });

  const validation = await validateResendApiKey(settings.apiKey, {
    defaultFromEmail: settings.fromEmail,
  });

  if (!validation.valid) {
    return NextResponse.json(
      {
        success: false,
        error: validation.error ?? "Failed to validate Resend API key",
        code: validation.errorCode,
      },
      { status: statusFromErrorCode(validation.errorCode) },
    );
  }

  const blockingWarning = getFirstBlockingDeliverabilityWarning(
    validation.warnings,
  );
  if (blockingWarning) {
    return NextResponse.json(
      {
        success: false,
        error: blockingWarning.message,
        code: toTestSendBlockingErrorCode(blockingWarning),
      },
      { status: 422 },
    );
  }

  const sampleValues = {
    ...getMergeTagSamples(),
    ...input.sampleMergeTags,
  };
  const rendered = renderTemplateForRecipient(
    {
      html: input.html,
      text: input.text,
    },
    sampleValues,
    {},
    {
      messageType: input.messageType,
    },
  );
  const idempotencyKey = `template-test-send/${input.ctx.tenantId}/${
    input.templateId ?? "draft"
  }/${crypto.randomUUID()}`;

  const { client: supabaseAdmin } = getAdminClient();

  // Consent gate: never test-send to an address the donor opted out of or that
  // is on the suppression list. Uses the template's message type, so a
  // transactional-template test still respects hard bounces/complaints and
  // do_not_contact while bypassing marketing-only opt-outs. Skipped only when
  // the admin client is unavailable (mirrors the audit-log tolerance below).
  if (supabaseAdmin) {
    const consent = await evaluateEmailConsent({
      supabaseAdmin,
      tenantId: input.ctx.tenantId,
      email: input.toEmail,
      messageType: input.messageType,
    });
    if (!consent.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: testSendConsentMessage(consent),
          code: `consent_${consent.reason}`,
        },
        { status: 422 },
      );
    }
  }

  const result = await sendEmail(settings.apiKey, {
    to: { email: input.toEmail },
    from: { email: settings.fromEmail, name: settings.fromName },
    replyTo: settings.replyToEmail
      ? { email: settings.replyToEmail }
      : undefined,
    subject: input.subject,
    html: rendered.html,
    text: rendered.text,
    idempotencyKey,
    customArgs: {
      source: "email_studio_template_test_send",
      templateId: input.templateId ?? "draft",
      builder: input.builder,
    },
  });
  let auditLogged = true;
  let auditLogWarning: string | undefined;

  if (supabaseAdmin) {
    const { error: auditLogError } = await supabaseAdmin
      .from("email_send_logs")
      .insert({
        tenant_id: input.ctx.tenantId,
        idempotency_key: idempotencyKey,
        correlation_id: result.correlationId,
        status: result.success ? "sent" : "failed",
        resend_message_id: result.messageId ?? null,
        recipient_count: 1,
        message_type: input.messageType,
        template_id: input.templateId ?? null,
        template_version_id: input.templateVersionId ?? null,
        template_builder: input.builder,
        requested_at: new Date().toISOString(),
        sent_at: result.success ? new Date().toISOString() : null,
        error_code: result.errors?.[0]?.code ?? null,
        error_message: result.errors?.[0]?.message ?? null,
        retry_count: 0,
        metadata: {
          source: "email_studio_template_test_send",
          toEmail: input.toEmail,
          fromEmail: settings.fromEmail,
          fromName: settings.fromName,
          builder: input.builder,
          builderVersion: input.builderVersion,
          templateVersion: input.templateVersion,
          preheader: input.preheader,
          mergeTags: rendered.validation.tags,
        },
      });

    if (auditLogError) {
      auditLogged = false;
      auditLogWarning =
        "The template test email was sent, but the audit log could not be saved. Check server logs before relying on audit history.";
      console.error("Failed to persist template test email audit log", {
        tenantId: input.ctx.tenantId,
        correlationId: result.correlationId,
        idempotencyKey,
        code: auditLogError.code,
        message: auditLogError.message,
      });
    }
  } else {
    auditLogged = false;
    auditLogWarning =
      "The template test email was sent, but audit logging is unavailable in this environment.";
  }

  if (!result.success) {
    const firstError = result.errors?.[0];
    return NextResponse.json(
      {
        success: false,
        error: firstError?.message ?? "Failed to send template test email",
        code: firstError?.code,
        correlationId: result.correlationId,
        auditLogged,
        warning: auditLogWarning,
      },
      { status: statusFromErrorCode(firstError?.code) },
    );
  }

  return NextResponse.json(
    {
      success: true,
      messageId: result.messageId,
      correlationId: result.correlationId,
      auditLogged,
      warning: auditLogWarning,
      warnings: validation.warnings,
    },
    { status: 200 },
  );
}

export async function POST(request: NextRequest) {
  try {
    const ctx = await requireAdminContext(request);
    const body = templateTestSendSchema.parse(await ensureJsonBody(request));

    if (!body.html || !body.text || !body.subject) {
      throw new ApiHttpError(
        400,
        "Draft template test-send requires subject, HTML, and text content.",
      );
    }

    return sendTemplateTestEmail({
      ctx,
      templateId: null,
      templateVersionId: null,
      templateVersion: null,
      builder: body.builder ?? "react_email",
      builderVersion: body.builderVersion,
      designJson: body.designJson,
      html: body.html,
      text: body.text,
      subject: body.subject,
      preheader: body.preheader,
      messageType: body.messageType ?? "transactional",
      toEmail: body.toEmail,
      fromEmail: body.fromEmail,
      fromName: body.fromName,
      replyToEmail: body.replyToEmail,
      sampleMergeTags: body.sampleMergeTags,
    });
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function POST_STORED_TEMPLATE(
  request: NextRequest,
  context: { params: Promise<{ templateId: string }> },
) {
  try {
    const ctx = await requireAdminContext(request);
    const { templateId } = await context.params;
    const body = templateTestSendSchema.parse(await ensureJsonBody(request));
    const template = await requireEmailTemplate(ctx.tenantId, templateId);
    const versions = await listEmailTemplateVersions(ctx.tenantId, template.id);
    const currentVersion = versions.find(
      (version) => version.version === template.version,
    );
    const subject = body.subject ?? template.default_subject;

    if (!template.html_content || !template.text_content || !subject) {
      throw new ApiHttpError(
        409,
        "Stored template test-send requires exported HTML, text, and a subject.",
      );
    }

    return sendTemplateTestEmail({
      ctx,
      templateId: template.id,
      templateVersionId: currentVersion?.id ?? null,
      templateVersion: template.version,
      builder: template.builder,
      builderVersion: template.builder_version,
      designJson: template.design_json,
      html: body.html ?? template.html_content,
      text: body.text ?? template.text_content,
      subject,
      preheader: body.preheader ?? template.default_preheader,
      messageType:
        body.messageType ??
        (template.category === "campaign" ? "marketing" : "transactional"),
      toEmail: body.toEmail,
      fromEmail: body.fromEmail,
      fromName: body.fromName,
      replyToEmail: body.replyToEmail,
      sampleMergeTags: body.sampleMergeTags,
    });
  } catch (error) {
    return toErrorResponse(error);
  }
}
