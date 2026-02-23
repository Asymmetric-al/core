import { getAdminClient } from "@asym/database/supabase/admin";

import { ApiHttpError } from "../shared/http-errors";

export interface TenantEmailSettingsRow {
  id: string;
  tenant_id: string;
  is_connected: boolean;
  default_from_email: string | null;
  default_from_name: string | null;
  reply_to_email: string | null;
  resend_api_key_encrypted: string | null;
  resend_api_key_hint: string | null;
  domain_authenticated: boolean;
  dkim_verified: boolean;
  spf_verified: boolean;
  deliverability_score: number | null;
  webhook_url: string | null;
  updated_at: string;
}

type AdminSupabaseClient = NonNullable<
  ReturnType<typeof getAdminClient>["client"]
>;

function getAdminSupabaseClient(): AdminSupabaseClient {
  const { client, error } = getAdminClient();
  if (!client) {
    throw new ApiHttpError(503, error || "Admin client unavailable");
  }
  return client;
}

export async function readTenantEmailSettings(
  tenantId: string,
): Promise<TenantEmailSettingsRow | null> {
  const supabaseAdmin = getAdminSupabaseClient();
  const { data, error } = await supabaseAdmin
    .from("tenant_email_settings")
    .select(
      [
        "id",
        "tenant_id",
        "is_connected",
        "default_from_email",
        "default_from_name",
        "reply_to_email",
        "resend_api_key_encrypted",
        "resend_api_key_hint",
        "domain_authenticated",
        "dkim_verified",
        "spf_verified",
        "deliverability_score",
        "webhook_url",
        "updated_at",
      ].join(", "),
    )
    .eq("tenant_id", tenantId)
    .maybeSingle();

  if (error) {
    throw new ApiHttpError(500, error.message);
  }

  return (data as TenantEmailSettingsRow | null) ?? null;
}

interface UpsertTenantEmailSettingsInput {
  tenantId: string;
  defaultFromEmail: string;
  defaultFromName: string;
  replyToEmail?: string;
  encryptedApiKey: string;
  apiKeyHint: string;
  domainAuthenticated: boolean;
  dkimVerified: boolean;
  spfVerified: boolean;
  deliverabilityScore: number;
  webhookUrl?: string | null;
}

export async function upsertTenantEmailSettings(
  input: UpsertTenantEmailSettingsInput,
): Promise<TenantEmailSettingsRow> {
  const supabaseAdmin = getAdminSupabaseClient();
  const { data, error } = await supabaseAdmin
    .from("tenant_email_settings")
    .upsert(
      {
        tenant_id: input.tenantId,
        is_connected: true,
        connection_verified_at: new Date().toISOString(),
        last_error: null,
        default_from_email: input.defaultFromEmail,
        default_from_name: input.defaultFromName,
        reply_to_email: input.replyToEmail ?? null,
        resend_api_key_encrypted: input.encryptedApiKey,
        resend_api_key_hint: input.apiKeyHint,
        domain_authenticated: input.domainAuthenticated,
        dkim_verified: input.dkimVerified,
        spf_verified: input.spfVerified,
        deliverability_score: input.deliverabilityScore,
        webhook_url: input.webhookUrl ?? null,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "tenant_id",
      },
    )
    .select(
      [
        "id",
        "tenant_id",
        "is_connected",
        "default_from_email",
        "default_from_name",
        "reply_to_email",
        "resend_api_key_encrypted",
        "resend_api_key_hint",
        "domain_authenticated",
        "dkim_verified",
        "spf_verified",
        "deliverability_score",
        "webhook_url",
        "updated_at",
      ].join(", "),
    )
    .single();

  if (error) {
    throw new ApiHttpError(500, error.message);
  }

  return data as unknown as TenantEmailSettingsRow;
}

export async function disconnectTenantEmailSettings(
  tenantId: string,
): Promise<TenantEmailSettingsRow | null> {
  const supabaseAdmin = getAdminSupabaseClient();
  const { data, error } = await supabaseAdmin
    .from("tenant_email_settings")
    .update({
      is_connected: false,
      last_error: null,
      resend_api_key_encrypted: null,
      resend_api_key_hint: null,
      connection_verified_at: null,
      domain_authenticated: false,
      dkim_verified: false,
      spf_verified: false,
      deliverability_score: null,
      updated_at: new Date().toISOString(),
    })
    .eq("tenant_id", tenantId)
    .select(
      [
        "id",
        "tenant_id",
        "is_connected",
        "default_from_email",
        "default_from_name",
        "reply_to_email",
        "resend_api_key_encrypted",
        "resend_api_key_hint",
        "domain_authenticated",
        "dkim_verified",
        "spf_verified",
        "deliverability_score",
        "webhook_url",
        "updated_at",
      ].join(", "),
    )
    .maybeSingle();

  if (error) {
    throw new ApiHttpError(500, error.message);
  }

  return (data as TenantEmailSettingsRow | null) ?? null;
}
