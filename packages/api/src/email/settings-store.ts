import { getAdminClient } from "@asym/database/supabase/admin";
import { type ResendValidationSnapshot } from "@asym/email/types";

import { ApiHttpError } from "../shared/http-errors";

const TENANT_EMAIL_SETTINGS_TABLE = "tenant_email_settings";

/**
 * Canonical persisted Resend connection row.
 *
 * Reads that need rich connection state for the admin UI should prefer
 * `validation_snapshot` once it is present and parseable. The scalar
 * deliverability columns are still persisted for compatibility and reporting,
 * but writers must keep them synchronized with the snapshot so they do not
 * drift.
 */
export interface TenantEmailSettingsRow {
  id: string;
  tenant_id: string;
  is_connected: boolean;
  connection_verified_at: string | null;
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
  validation_snapshot: ResendValidationSnapshot | null;
  updated_at: string;
}

type AdminSupabaseClient = NonNullable<
  ReturnType<typeof getAdminClient>["client"]
>;

export class TenantEmailSettingsStorageUnavailableError extends ApiHttpError {
  readonly code = "TENANT_EMAIL_SETTINGS_STORAGE_UNAVAILABLE";

  constructor() {
    super(
      503,
      "Resend settings storage is unavailable in this environment. Apply the email settings migration to persist tenant configuration.",
    );
    this.name = "TenantEmailSettingsStorageUnavailableError";
  }
}

function getAdminSupabaseClient(): AdminSupabaseClient {
  const { client, error } = getAdminClient();
  if (!client) {
    throw new ApiHttpError(503, error || "Admin client unavailable");
  }
  return client;
}

function isTenantEmailSettingsStorageMissing(error: {
  code?: string;
  message?: string;
}): boolean {
  const message = error.message?.toLowerCase() ?? "";

  return (
    message.includes(TENANT_EMAIL_SETTINGS_TABLE) &&
    (error.code === "PGRST205" ||
      error.code === "42P01" ||
      message.includes("schema cache") ||
      message.includes("could not find the table") ||
      message.includes("does not exist"))
  );
}

function toTenantEmailSettingsStorageUnavailableError(error: {
  code?: string;
  message?: string;
}): TenantEmailSettingsStorageUnavailableError | null {
  if (!isTenantEmailSettingsStorageMissing(error)) {
    return null;
  }

  return new TenantEmailSettingsStorageUnavailableError();
}

export function isTenantEmailSettingsStorageUnavailable(
  error: unknown,
): error is TenantEmailSettingsStorageUnavailableError {
  return error instanceof TenantEmailSettingsStorageUnavailableError;
}

export async function readTenantEmailSettings(
  tenantId: string,
): Promise<TenantEmailSettingsRow | null> {
  const supabaseAdmin = getAdminSupabaseClient();
  const { data, error } = await supabaseAdmin
    .from(TENANT_EMAIL_SETTINGS_TABLE)
    .select(
      [
        "id",
        "tenant_id",
        "is_connected",
        "connection_verified_at",
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
        "validation_snapshot",
        "updated_at",
      ].join(", "),
    )
    .eq("tenant_id", tenantId)
    .maybeSingle();

  if (error) {
    const storageError = toTenantEmailSettingsStorageUnavailableError(error);
    if (storageError) {
      throw storageError;
    }
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
  validationSnapshot: ResendValidationSnapshot;
  webhookUrl?: string | null;
}

/**
 * Canonical write path for tenant Resend settings.
 *
 * Callers should persist both the snapshot and the synchronized scalar
 * deliverability columns through this function so the connection UI, reporting,
 * and legacy consumers all read consistent state.
 */
export async function upsertTenantEmailSettings(
  input: UpsertTenantEmailSettingsInput,
): Promise<TenantEmailSettingsRow> {
  const supabaseAdmin = getAdminSupabaseClient();
  const { data, error } = await supabaseAdmin
    .from(TENANT_EMAIL_SETTINGS_TABLE)
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
        validation_snapshot: input.validationSnapshot,
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
        "connection_verified_at",
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
        "validation_snapshot",
        "updated_at",
      ].join(", "),
    )
    .single();

  if (error) {
    const storageError = toTenantEmailSettingsStorageUnavailableError(error);
    if (storageError) {
      throw storageError;
    }
    throw new ApiHttpError(500, error.message);
  }

  return data as unknown as TenantEmailSettingsRow;
}

export async function disconnectTenantEmailSettings(
  tenantId: string,
): Promise<TenantEmailSettingsRow | null> {
  const supabaseAdmin = getAdminSupabaseClient();
  const { data, error } = await supabaseAdmin
    .from(TENANT_EMAIL_SETTINGS_TABLE)
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
      validation_snapshot: null,
      updated_at: new Date().toISOString(),
    })
    .eq("tenant_id", tenantId)
    .select(
      [
        "id",
        "tenant_id",
        "is_connected",
        "connection_verified_at",
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
        "validation_snapshot",
        "updated_at",
      ].join(", "),
    )
    .maybeSingle();

  if (error) {
    const storageError = toTenantEmailSettingsStorageUnavailableError(error);
    if (storageError) {
      throw storageError;
    }
    throw new ApiHttpError(500, error.message);
  }

  return (data as TenantEmailSettingsRow | null) ?? null;
}
