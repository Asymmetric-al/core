import { sendEmail } from "@asym/email";
import { logSystemAuditEvent } from "@asym/lib/audit/logger";

import { loadStagedGiftById } from "./staged-gifts";
import {
  evaluateEmailConsent,
  type EmailConsentBlockReason,
  type EmailConsentDecision,
} from "../email/consent";
import { decryptResendApiKey } from "../email/crypto";
import { readTenantEmailSettings } from "../email/settings-store";
import { ApiHttpError } from "../shared/http-errors";
import { asString, isRecord } from "../shared/json-coerce";

import type { ReceiptSnapshotContentV1 } from "../admin/contribution-operations/receipt-delivery";
import type { getAdminClient } from "@asym/database/supabase/admin";

type SupabaseAdminClient = NonNullable<
  ReturnType<typeof getAdminClient>["client"]
>;

type JsonRecord = Record<string, unknown>;

interface DonorReceiptIdentity {
  email: string;
  name: string;
}

export interface DonationReceiptEmail {
  subject: string;
  html: string;
  text: string;
  idempotencyKey: string;
}

interface ReceiptGiftIdentity {
  id: string;
  tenantId: string;
  donationId: string;
  donorId: string | null;
}

interface ReceiptSendResult {
  sendLogId: string | null;
  status: "sent" | "failed" | "suppressed";
}

function formatMoney(cents: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    currency: currency.toUpperCase(),
    style: "currency",
  }).format(cents / 100);
}

function formatReceiptDate(value: Date) {
  return value.toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatSnapshotGiftDate(giftDate: string): string {
  const parsed = new Date(giftDate);
  if (Number.isNaN(parsed.getTime())) {
    return giftDate;
  }

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "long",
    timeZone: "UTC",
  }).format(parsed);
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

async function loadDonorReceiptIdentity(input: {
  supabaseAdmin: SupabaseAdminClient;
  donorId: string | null;
}): Promise<DonorReceiptIdentity> {
  if (!input.donorId) {
    throw new ApiHttpError(409, "Cannot send a receipt without a donor.");
  }

  const donorResult = await input.supabaseAdmin
    .from("donors")
    .select("id, profile_id, name, email")
    .eq("id", input.donorId)
    .single();

  if (donorResult.error || !isRecord(donorResult.data)) {
    throw new ApiHttpError(404, "Receipt donor not found.");
  }

  const donor = donorResult.data;
  let email = asString(donor.email);
  let name = asString(donor.name);

  const profileId = asString(donor.profile_id);
  if (profileId && (!email || !name)) {
    const profileResult = await input.supabaseAdmin
      .from("profiles")
      .select("email, display_name, first_name, last_name")
      .eq("id", profileId)
      .maybeSingle();
    if (profileResult.error) {
      throw new Error(profileResult.error.message);
    }
    const profile: JsonRecord = isRecord(profileResult.data)
      ? profileResult.data
      : {};
    email ??= asString(profile.email);
    name ??=
      asString(profile.display_name) ??
      [asString(profile.first_name), asString(profile.last_name)]
        .filter(Boolean)
        .join(" ")
        .trim();
  }

  if (!email) {
    throw new ApiHttpError(409, "Cannot send a receipt without donor email.");
  }

  return {
    email,
    name: name || "Donor",
  };
}

export function buildDonationReceiptEmail(input: {
  tenantId: string;
  donationId: string;
  stagedGiftId: string;
  donorName: string;
  amount: number;
  currency: string;
  receiptDate: Date;
}): DonationReceiptEmail {
  const formattedAmount = formatMoney(input.amount, input.currency);
  const receiptDate = formatReceiptDate(input.receiptDate);
  const safeName = escapeHtml(input.donorName);

  return {
    html: [
      `<p>Hello ${safeName},</p>`,
      `<p>Thank you for your gift of <strong>${formattedAmount}</strong> on ${receiptDate}.</p>`,
      `<p>Donation ID: <code>${escapeHtml(input.donationId)}</code></p>`,
    ].join("\n"),
    idempotencyKey: `donation-receipt/${input.tenantId}/${input.donationId}/${input.stagedGiftId}`,
    subject: `Your donation receipt for ${formattedAmount}`,
    text: [
      `Hello ${input.donorName},`,
      `Thank you for your gift of ${formattedAmount} on ${receiptDate}.`,
      `Donation ID: ${input.donationId}`,
    ].join("\n\n"),
  };
}

export function buildUpdatedDonationReceiptEmail(input: {
  tenantId: string;
  snapshotId: string;
  content: ReceiptSnapshotContentV1;
}): DonationReceiptEmail {
  const formattedAmount = formatMoney(
    input.content.effective.amountCents,
    input.content.currencyCode,
  );
  const giftDate = formatSnapshotGiftDate(input.content.giftDate);
  const safeName = escapeHtml(input.content.donorName);
  const affectedFields =
    input.content.affectedFields.length > 0
      ? input.content.affectedFields.join(", ")
      : "gift details";
  const designationItems = input.content.designationLines
    .map((line) => {
      const lineAmount = formatMoney(
        line.amountCents,
        input.content.currencyCode,
      );
      const parts = [
        line.fundName,
        line.missionaryName ? `Missionary: ${line.missionaryName}` : null,
        line.memo ? `Memo: ${line.memo}` : null,
      ].filter((part): part is string => Boolean(part));
      return `<li>${escapeHtml(parts.join(" | "))}: <strong>${escapeHtml(
        lineAmount,
      )}</strong></li>`;
    })
    .join("\n");
  const textDesignationLines = input.content.designationLines
    .map((line) => {
      const lineAmount = formatMoney(
        line.amountCents,
        input.content.currencyCode,
      );
      const parts = [
        line.fundName,
        line.missionaryName ? `Missionary: ${line.missionaryName}` : null,
        line.memo ? `Memo: ${line.memo}` : null,
      ].filter((part): part is string => Boolean(part));
      return `- ${parts.join(" | ")}: ${lineAmount}`;
    })
    .join("\n");

  return {
    html: [
      `<p>Hello ${safeName},</p>`,
      `<p>We corrected ${escapeHtml(affectedFields)} for your gift. Your updated receipt amount is <strong>${formattedAmount}</strong>.</p>`,
      `<p>Gift date: ${escapeHtml(giftDate)}</p>`,
      designationItems ? `<ul>${designationItems}</ul>` : "",
      `<p>Donation ID: <code>${escapeHtml(input.content.donationId)}</code></p>`,
      `<p>This updated receipt replaces the receipt previously sent for this gift.</p>`,
    ]
      .filter(Boolean)
      .join("\n"),
    idempotencyKey: `contribution-receipt-snapshot/${input.tenantId}/${input.snapshotId}/email`,
    subject: `Updated donation receipt for ${formattedAmount}`,
    text: [
      `Hello ${input.content.donorName},`,
      `We corrected ${affectedFields} for your gift. Your updated receipt amount is ${formattedAmount}.`,
      `Gift date: ${giftDate}`,
      textDesignationLines,
      `Donation ID: ${input.content.donationId}`,
      "This updated receipt replaces the receipt previously sent for this gift.",
    ]
      .filter(Boolean)
      .join("\n\n"),
  };
}

function consentSkipMessage(reason: EmailConsentBlockReason): string {
  switch (reason) {
    case "do_not_contact":
      return "Recipient has opted out of all outbound contact (do_not_contact).";
    case "do_not_email":
      return "Recipient has opted out of email (do_not_email).";
    case "suppressed":
      return "Recipient address is on the email suppression list.";
  }
}

/**
 * The consent gate forbade this send. Record the compliance decision and mark
 * the receipt terminally so reconciliation does not retry it. Fail-closed: no
 * email is sent and no email_send_logs row is written (that would collide with
 * the send-path idempotency key on a later retry) — `audit_logs` is the
 * compliance record of record.
 */
async function skipReceiptForConsent(input: {
  supabaseAdmin: SupabaseAdminClient;
  gift: ReceiptGiftIdentity;
  donorEmail: string;
  idempotencyKey: string;
  decision: Extract<EmailConsentDecision, { allowed: false }>;
  source?: string;
}): Promise<{ sendLogId: string | null; status: "suppressed" }> {
  const { gift, decision } = input;
  const message = consentSkipMessage(decision.reason);
  const source = input.source ?? "donation_receipt";

  await logSystemAuditEvent({
    tenantId: gift.tenantId,
    action: "email_send_suppressed",
    resourceType: "email_send",
    resourceId: gift.donationId,
    details: {
      source,
      channel: "email",
      reason: decision.reason,
      suppressionType:
        decision.reason === "suppressed"
          ? (decision.suppressionType ?? null)
          : null,
      donorId: gift.donorId,
      stagedGiftId: gift.id,
      recipientEmail: input.donorEmail,
      idempotencyKey: input.idempotencyKey,
    },
  });

  const updateResult = await input.supabaseAdmin
    .from("staged_gifts")
    .update({
      receipt_status: "suppressed",
      receipt_send_log_id: null,
      last_error_code: decision.reason,
      last_error_message: message,
      updated_at: new Date().toISOString(),
    })
    .eq("id", gift.id);

  if (updateResult.error) {
    throw new Error(updateResult.error.message);
  }

  return { sendLogId: null, status: "suppressed" };
}

async function deliverReceiptEmailForGift(input: {
  supabaseAdmin: SupabaseAdminClient;
  gift: ReceiptGiftIdentity;
  donor: DonorReceiptIdentity;
  receipt: DonationReceiptEmail;
  source: string;
  metadata: JsonRecord;
  customArgs: Record<string, string>;
}): Promise<ReceiptSendResult> {
  const { gift, donor, receipt } = input;
  const settings = await readTenantEmailSettings(gift.tenantId);
  if (
    !settings?.is_connected ||
    !settings.resend_api_key_encrypted ||
    !settings.default_from_email ||
    !settings.default_from_name
  ) {
    throw new ApiHttpError(
      409,
      "Connect Resend with a verified sender before sending receipts.",
    );
  }

  // Consent gate. A donation receipt is a transactional/relationship message,
  // so a donor's marketing opt-out (do_not_email / unsubscribe) does not stop
  // it — but a global do_not_contact, a hard bounce, or a spam complaint does
  // (the last two also protect deliverability and sender reputation). See the
  // enforcement table in ../email/consent.ts.
  const consent = await evaluateEmailConsent({
    supabaseAdmin: input.supabaseAdmin,
    tenantId: gift.tenantId,
    email: donor.email,
    donorId: gift.donorId,
    messageType: "transactional",
  });

  if (!consent.allowed) {
    return skipReceiptForConsent({
      supabaseAdmin: input.supabaseAdmin,
      gift: {
        id: gift.id,
        tenantId: gift.tenantId,
        donationId: gift.donationId,
        donorId: gift.donorId,
      },
      donorEmail: donor.email,
      idempotencyKey: receipt.idempotencyKey,
      decision: consent,
      source: input.source,
    });
  }

  const result = await sendEmail(
    decryptResendApiKey(settings.resend_api_key_encrypted),
    {
      to: { email: donor.email, name: donor.name },
      from: {
        email: settings.default_from_email,
        name: settings.default_from_name,
      },
      replyTo: settings.reply_to_email
        ? { email: settings.reply_to_email }
        : undefined,
      subject: receipt.subject,
      html: receipt.html,
      text: receipt.text,
      idempotencyKey: receipt.idempotencyKey,
      customArgs: input.customArgs,
    },
  );

  const logInsert = await input.supabaseAdmin
    .from("email_send_logs")
    .insert({
      tenant_id: gift.tenantId,
      idempotency_key: receipt.idempotencyKey,
      correlation_id: result.correlationId,
      status: result.success ? "sent" : "failed",
      resend_message_id: result.messageId ?? null,
      recipient_count: 1,
      message_type: "transactional",
      requested_at: new Date().toISOString(),
      sent_at: result.success ? new Date().toISOString() : null,
      error_code: result.errors?.[0]?.code ?? null,
      error_message: result.errors?.[0]?.message ?? null,
      retry_count: result.retryCount,
      metadata: input.metadata,
    })
    .select("id")
    .single();

  if (logInsert.error) {
    throw new Error(logInsert.error.message);
  }

  const sendLogId = isRecord(logInsert.data)
    ? asString(logInsert.data.id)
    : null;
  const updateResult = await input.supabaseAdmin
    .from("staged_gifts")
    .update({
      receipt_status: result.success ? "sent" : "failed",
      receipt_send_log_id: sendLogId,
      last_error_code: result.errors?.[0]?.code ?? null,
      last_error_message: result.errors?.[0]?.message ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", gift.id);

  if (updateResult.error) {
    throw new Error(updateResult.error.message);
  }

  return {
    sendLogId,
    status: result.success ? "sent" : "failed",
  };
}

export async function sendStagedGiftReceipt(input: {
  supabaseAdmin: SupabaseAdminClient;
  tenantId: string;
  stagedGiftId: string;
}) {
  const gift = await loadStagedGiftById(input);
  const donor = await loadDonorReceiptIdentity({
    supabaseAdmin: input.supabaseAdmin,
    donorId: gift.donorId,
  });
  const receipt = buildDonationReceiptEmail({
    tenantId: gift.tenantId,
    donationId: gift.donationId,
    stagedGiftId: gift.id,
    donorName: donor.name,
    amount: gift.amount,
    currency: gift.currency,
    receiptDate: new Date(),
  });

  return deliverReceiptEmailForGift({
    supabaseAdmin: input.supabaseAdmin,
    gift,
    donor,
    receipt,
    source: "donation_receipt",
    metadata: {
      donationId: gift.donationId,
      source: "donation_receipt",
      stagedGiftId: gift.id,
    },
    customArgs: {
      donationId: gift.donationId,
      source: "donation_receipt",
      stagedGiftId: gift.id,
    },
  });
}

export async function sendUpdatedReceiptSnapshotEmail(input: {
  supabaseAdmin: SupabaseAdminClient;
  tenantId: string;
  stagedGiftId: string;
  snapshotId: string;
  content: ReceiptSnapshotContentV1;
}) {
  const gift = await loadStagedGiftById(input);
  const donor = await loadDonorReceiptIdentity({
    supabaseAdmin: input.supabaseAdmin,
    donorId: gift.donorId,
  });
  const receipt = buildUpdatedDonationReceiptEmail({
    tenantId: gift.tenantId,
    snapshotId: input.snapshotId,
    content: input.content,
  });
  const metadata: JsonRecord = {
    donationId: gift.donationId,
    source: "updated_donation_receipt",
    stagedGiftId: gift.id,
    receiptSnapshotId: input.snapshotId,
    adjustmentId: input.content.adjustmentId,
  };
  const customArgs: Record<string, string> = {
    donationId: gift.donationId,
    source: "updated_donation_receipt",
    stagedGiftId: gift.id,
    receiptSnapshotId: input.snapshotId,
  };
  if (input.content.adjustmentId) {
    customArgs.adjustmentId = input.content.adjustmentId;
  }

  return deliverReceiptEmailForGift({
    supabaseAdmin: input.supabaseAdmin,
    gift,
    donor,
    receipt,
    source: "updated_donation_receipt",
    metadata,
    customArgs,
  });
}
