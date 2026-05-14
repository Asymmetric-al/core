import { sendEmail } from "@asym/email";

import { loadStagedGiftById } from "./staged-gifts";
import { decryptResendApiKey } from "../email/crypto";
import { readTenantEmailSettings } from "../email/settings-store";
import { ApiHttpError } from "../shared/http-errors";

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

function isJsonRecord(value: unknown): value is JsonRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function asString(value: unknown): string | null {
  return typeof value === "string" && value.trim().length > 0 ? value : null;
}

function formatMoney(cents: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    currency: currency.toUpperCase(),
    style: "currency",
  }).format(cents / 100);
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

  if (donorResult.error || !isJsonRecord(donorResult.data)) {
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
    const profile: JsonRecord = isJsonRecord(profileResult.data)
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
  const receiptDate = input.receiptDate.toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
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

  const receipt = buildDonationReceiptEmail({
    tenantId: gift.tenantId,
    donationId: gift.donationId,
    stagedGiftId: gift.id,
    donorName: donor.name,
    amount: gift.amount,
    currency: gift.currency,
    receiptDate: new Date(),
  });
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
      customArgs: {
        donationId: gift.donationId,
        source: "donation_receipt",
        stagedGiftId: gift.id,
      },
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
      metadata: {
        donationId: gift.donationId,
        source: "donation_receipt",
        stagedGiftId: gift.id,
      },
    })
    .select("id")
    .single();

  if (logInsert.error) {
    throw new Error(logInsert.error.message);
  }

  const sendLogId = isJsonRecord(logInsert.data)
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
