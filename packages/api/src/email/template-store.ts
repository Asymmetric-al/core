import { getAdminClient } from "@asym/database/supabase/admin";
import { getContributionCorrectionRequiredTags } from "@asym/email/contribution-correction-tags";

import {
  getContributionCorrectionTemplateBinding,
  isContributionCorrectionTemplateFamily,
  isContributionCorrectionTemplateVariantForFamily,
} from "./contribution-correction-template-validation";
import { ApiHttpError } from "../shared/http-errors";

import type { EmailBuilderKind } from "@asym/email/email-builder-types";
import type { EmailTemplateCategory } from "@asym/email/types";

const EMAIL_TEMPLATES_TABLE = "email_templates";
const EMAIL_TEMPLATE_VERSIONS_TABLE = "email_template_versions";
const EMAIL_TEMPLATE_SYSTEM_BINDINGS_TABLE = "email_template_system_bindings";

const TEMPLATE_COLUMNS = [
  "id",
  "tenant_id",
  "name",
  "description",
  "category",
  "builder",
  "builder_version",
  "design_json",
  "html_content",
  "html_exported_at",
  "text_content",
  "text_exported_at",
  "editor_metadata",
  "legacy_unlayer_project_id",
  "default_subject",
  "default_preheader",
  "is_active",
  "is_system",
  "version",
  "created_at",
  "updated_at",
  "created_by",
].join(", ");

const TEMPLATE_VERSION_COLUMNS = [
  "id",
  "template_id",
  "tenant_id",
  "version",
  "builder",
  "builder_version",
  "design_json",
  "html_content",
  "text_content",
  "subject",
  "preheader",
  "editor_metadata",
  "created_at",
  "created_by",
].join(", ");

type AdminSupabaseClient = NonNullable<
  ReturnType<typeof getAdminClient>["client"]
>;

export interface EmailTemplateRow {
  id: string;
  tenant_id: string;
  name: string;
  description: string | null;
  category: EmailTemplateCategory;
  builder: EmailBuilderKind;
  builder_version: string | null;
  design_json: Record<string, unknown>;
  html_content: string | null;
  html_exported_at: string | null;
  text_content: string | null;
  text_exported_at: string | null;
  editor_metadata: Record<string, unknown>;
  legacy_unlayer_project_id: number | null;
  default_subject: string | null;
  default_preheader: string | null;
  is_active: boolean;
  is_system: boolean;
  version: number;
  created_at: string;
  updated_at: string;
  created_by: string | null;
}

export interface EmailTemplateVersionRow {
  id: string;
  template_id: string;
  tenant_id: string;
  version: number;
  builder: EmailBuilderKind;
  builder_version: string | null;
  design_json: Record<string, unknown>;
  html_content: string | null;
  text_content: string | null;
  subject: string | null;
  preheader: string | null;
  editor_metadata: Record<string, unknown>;
  created_at: string;
  created_by: string | null;
}

export interface EmailTemplateMutationInput {
  name: string;
  description?: string | null;
  category?: EmailTemplateCategory;
  builder: EmailBuilderKind;
  builderVersion?: string | null;
  designJson: Record<string, unknown>;
  htmlContent?: string | null;
  textContent?: string | null;
  defaultSubject?: string | null;
  defaultPreheader?: string | null;
  editorMetadata?: Record<string, unknown>;
  legacyUnlayerProjectId?: number | null;
  isActive?: boolean;
  isSystem?: boolean;
}

export interface EmailTemplatePatchInput {
  name?: string;
  description?: string | null;
  category?: EmailTemplateCategory;
  builder?: EmailBuilderKind;
  builderVersion?: string | null;
  designJson?: Record<string, unknown>;
  htmlContent?: string | null;
  textContent?: string | null;
  defaultSubject?: string | null;
  defaultPreheader?: string | null;
  editorMetadata?: Record<string, unknown>;
  legacyUnlayerProjectId?: number | null;
  isActive?: boolean;
}

export class EmailTemplateStorageUnavailableError extends ApiHttpError {
  readonly code = "EMAIL_TEMPLATE_STORAGE_UNAVAILABLE";

  constructor() {
    super(
      503,
      "Email template storage is unavailable in this environment. Apply the Email Studio template migration before saving templates.",
    );
    this.name = "EmailTemplateStorageUnavailableError";
  }
}

function getAdminSupabaseClient(): AdminSupabaseClient {
  const { client, error } = getAdminClient();
  if (!client) {
    throw new ApiHttpError(503, error || "Admin client unavailable");
  }
  return client;
}

function isStorageMissing(error: { code?: string; message?: string }): boolean {
  const message = error.message?.toLowerCase() ?? "";
  return (
    (message.includes(EMAIL_TEMPLATES_TABLE) ||
      message.includes(EMAIL_TEMPLATE_SYSTEM_BINDINGS_TABLE) ||
      message.includes(EMAIL_TEMPLATE_VERSIONS_TABLE)) &&
    (error.code === "PGRST205" ||
      error.code === "42P01" ||
      message.includes("schema cache") ||
      message.includes("could not find the table") ||
      message.includes("does not exist"))
  );
}

function getValidContributionCorrectionBinding(
  metadata: Record<string, unknown>,
) {
  const binding = getContributionCorrectionTemplateBinding(metadata);

  if (!binding || !isContributionCorrectionTemplateFamily(binding.family)) {
    return null;
  }

  const variantRef = {
    family: binding.family,
    variant: binding.variant,
  };

  return isContributionCorrectionTemplateVariantForFamily(variantRef)
    ? variantRef
    : null;
}

async function deactivateContributionCorrectionTemplateBindings(input: {
  supabaseAdmin: AdminSupabaseClient;
  tenantId: string;
  templateId: string;
}) {
  const { error } = await input.supabaseAdmin
    .from(EMAIL_TEMPLATE_SYSTEM_BINDINGS_TABLE)
    .update({
      is_active: false,
      updated_at: new Date().toISOString(),
    })
    .eq("tenant_id", input.tenantId)
    .eq("template_id", input.templateId);

  if (error) throwSupabaseError(error);
}

async function syncContributionCorrectionTemplateBinding(input: {
  supabaseAdmin: AdminSupabaseClient;
  template: EmailTemplateRow;
  previousTemplate?: EmailTemplateRow | null;
}) {
  const binding = getValidContributionCorrectionBinding(
    input.template.editor_metadata,
  );
  const previousBinding = input.previousTemplate
    ? getValidContributionCorrectionBinding(
        input.previousTemplate.editor_metadata,
      )
    : null;

  if (!binding && !previousBinding) {
    return;
  }

  await deactivateContributionCorrectionTemplateBindings({
    supabaseAdmin: input.supabaseAdmin,
    tenantId: input.template.tenant_id,
    templateId: input.template.id,
  });

  if (!input.template.is_active || !binding) {
    return;
  }

  const { error } = await input.supabaseAdmin
    .from(EMAIL_TEMPLATE_SYSTEM_BINDINGS_TABLE)
    .upsert(
      {
        tenant_id: input.template.tenant_id,
        template_id: input.template.id,
        family_key: binding.family,
        variant_key: binding.variant,
        required_merge_tags: getContributionCorrectionRequiredTags(binding),
        is_active: true,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "tenant_id,family_key,variant_key",
      },
    );

  if (error) throwSupabaseError(error);
}

function normalizeStorageError(error: {
  code?: string;
  message?: string;
}): EmailTemplateStorageUnavailableError | null {
  return isStorageMissing(error)
    ? new EmailTemplateStorageUnavailableError()
    : null;
}

function throwSupabaseError(error: { code?: string; message?: string }): never {
  const storageError = normalizeStorageError(error);
  if (storageError) {
    throw storageError;
  }
  throw new ApiHttpError(500, error.message ?? "Email template storage error");
}

function toTemplatePayload(
  tenantId: string,
  profileId: string | null,
  input: EmailTemplateMutationInput,
) {
  const exportedAt = new Date().toISOString();
  return {
    tenant_id: tenantId,
    name: input.name,
    description: input.description ?? null,
    category: input.category ?? "campaign",
    builder: input.builder,
    builder_version: input.builderVersion ?? null,
    design_json: input.designJson,
    html_content: input.htmlContent ?? null,
    html_exported_at: input.htmlContent ? exportedAt : null,
    text_content: input.textContent ?? null,
    text_exported_at: input.textContent ? exportedAt : null,
    default_subject: input.defaultSubject ?? null,
    default_preheader: input.defaultPreheader ?? null,
    editor_metadata: input.editorMetadata ?? {},
    legacy_unlayer_project_id: input.legacyUnlayerProjectId ?? null,
    is_active: input.isActive ?? true,
    is_system: input.isSystem ?? false,
    created_by: profileId,
    updated_at: exportedAt,
  };
}

function toPatchPayload(input: EmailTemplatePatchInput) {
  const exportedAt = new Date().toISOString();
  const payload: Record<string, unknown> = {
    updated_at: exportedAt,
  };

  if (input.name !== undefined) payload.name = input.name;
  if (input.description !== undefined) payload.description = input.description;
  if (input.category !== undefined) payload.category = input.category;
  if (input.builder !== undefined) payload.builder = input.builder;
  if (input.builderVersion !== undefined) {
    payload.builder_version = input.builderVersion;
  }
  if (input.designJson !== undefined) payload.design_json = input.designJson;
  if (input.htmlContent !== undefined) {
    payload.html_content = input.htmlContent;
    payload.html_exported_at = input.htmlContent ? exportedAt : null;
  }
  if (input.textContent !== undefined) {
    payload.text_content = input.textContent;
    payload.text_exported_at = input.textContent ? exportedAt : null;
  }
  if (input.defaultSubject !== undefined) {
    payload.default_subject = input.defaultSubject;
  }
  if (input.defaultPreheader !== undefined) {
    payload.default_preheader = input.defaultPreheader;
  }
  if (input.editorMetadata !== undefined) {
    payload.editor_metadata = input.editorMetadata;
  }
  if (input.legacyUnlayerProjectId !== undefined) {
    payload.legacy_unlayer_project_id = input.legacyUnlayerProjectId;
  }
  if (input.isActive !== undefined) payload.is_active = input.isActive;

  return payload;
}

async function createTemplateVersion(
  supabaseAdmin: AdminSupabaseClient,
  template: EmailTemplateRow,
  profileId: string | null,
): Promise<EmailTemplateVersionRow> {
  const { data, error } = await supabaseAdmin
    .from(EMAIL_TEMPLATE_VERSIONS_TABLE)
    .insert({
      template_id: template.id,
      tenant_id: template.tenant_id,
      version: template.version,
      builder: template.builder,
      builder_version: template.builder_version,
      design_json: template.design_json,
      html_content: template.html_content,
      text_content: template.text_content,
      subject: template.default_subject,
      preheader: template.default_preheader,
      editor_metadata: template.editor_metadata,
      created_by: profileId,
    })
    .select(TEMPLATE_VERSION_COLUMNS)
    .single();

  if (error) throwSupabaseError(error);
  return data as unknown as EmailTemplateVersionRow;
}

export async function listEmailTemplates(
  tenantId: string,
): Promise<EmailTemplateRow[]> {
  const supabaseAdmin = getAdminSupabaseClient();
  const { data, error } = await supabaseAdmin
    .from(EMAIL_TEMPLATES_TABLE)
    .select(TEMPLATE_COLUMNS)
    .eq("tenant_id", tenantId)
    .eq("is_active", true)
    .order("updated_at", { ascending: false });

  if (error) throwSupabaseError(error);
  return (data as unknown as EmailTemplateRow[]) ?? [];
}

export async function readEmailTemplate(
  tenantId: string,
  templateId: string,
): Promise<EmailTemplateRow | null> {
  const supabaseAdmin = getAdminSupabaseClient();
  const { data, error } = await supabaseAdmin
    .from(EMAIL_TEMPLATES_TABLE)
    .select(TEMPLATE_COLUMNS)
    .eq("tenant_id", tenantId)
    .eq("id", templateId)
    .maybeSingle();

  if (error) throwSupabaseError(error);
  return (data as unknown as EmailTemplateRow | null) ?? null;
}

export async function requireEmailTemplate(
  tenantId: string,
  templateId: string,
): Promise<EmailTemplateRow> {
  const template = await readEmailTemplate(tenantId, templateId);
  if (!template) {
    throw new ApiHttpError(404, "Email template not found");
  }
  return template;
}

export async function createEmailTemplate(input: {
  tenantId: string;
  profileId: string | null;
  template: EmailTemplateMutationInput;
}): Promise<{ template: EmailTemplateRow; version: EmailTemplateVersionRow }> {
  const supabaseAdmin = getAdminSupabaseClient();
  const { data, error } = await supabaseAdmin
    .from(EMAIL_TEMPLATES_TABLE)
    .insert(toTemplatePayload(input.tenantId, input.profileId, input.template))
    .select(TEMPLATE_COLUMNS)
    .single();

  if (error) throwSupabaseError(error);
  const template = data as unknown as EmailTemplateRow;
  const version = await createTemplateVersion(
    supabaseAdmin,
    template,
    input.profileId,
  );
  await syncContributionCorrectionTemplateBinding({
    supabaseAdmin,
    template,
  });
  return { template, version };
}

export async function updateEmailTemplate(input: {
  tenantId: string;
  profileId: string | null;
  templateId: string;
  patch: EmailTemplatePatchInput;
}): Promise<{ template: EmailTemplateRow; version: EmailTemplateVersionRow }> {
  const supabaseAdmin = getAdminSupabaseClient();
  const current = await requireEmailTemplate(input.tenantId, input.templateId);
  const { data, error } = await supabaseAdmin
    .from(EMAIL_TEMPLATES_TABLE)
    .update({
      ...toPatchPayload(input.patch),
      version: current.version + 1,
    })
    .eq("tenant_id", input.tenantId)
    .eq("id", input.templateId)
    .select(TEMPLATE_COLUMNS)
    .single();

  if (error) throwSupabaseError(error);
  const template = data as unknown as EmailTemplateRow;
  const version = await createTemplateVersion(
    supabaseAdmin,
    template,
    input.profileId,
  );
  await syncContributionCorrectionTemplateBinding({
    supabaseAdmin,
    template,
    previousTemplate: current,
  });
  return { template, version };
}

export async function deleteEmailTemplate(
  tenantId: string,
  templateId: string,
): Promise<void> {
  const supabaseAdmin = getAdminSupabaseClient();
  const { error } = await supabaseAdmin
    .from(EMAIL_TEMPLATES_TABLE)
    .update({ is_active: false, updated_at: new Date().toISOString() })
    .eq("tenant_id", tenantId)
    .eq("id", templateId);

  if (error) throwSupabaseError(error);
  await deactivateContributionCorrectionTemplateBindings({
    supabaseAdmin,
    tenantId,
    templateId,
  });
}

export async function duplicateEmailTemplate(input: {
  tenantId: string;
  profileId: string | null;
  templateId: string;
}): Promise<{ template: EmailTemplateRow; version: EmailTemplateVersionRow }> {
  const source = await requireEmailTemplate(input.tenantId, input.templateId);
  return createEmailTemplate({
    tenantId: input.tenantId,
    profileId: input.profileId,
    template: {
      name: `${source.name} (Copy)`,
      description: source.description,
      category: source.category,
      builder: source.builder,
      builderVersion: source.builder_version,
      designJson: source.design_json,
      htmlContent: source.html_content,
      textContent: source.text_content,
      defaultSubject: source.default_subject,
      defaultPreheader: source.default_preheader,
      editorMetadata: {
        ...source.editor_metadata,
        duplicatedFromTemplateId: source.id,
      },
      legacyUnlayerProjectId: source.legacy_unlayer_project_id,
      isActive: true,
      isSystem: false,
    },
  });
}

export async function listEmailTemplateVersions(
  tenantId: string,
  templateId: string,
): Promise<EmailTemplateVersionRow[]> {
  const supabaseAdmin = getAdminSupabaseClient();
  const { data, error } = await supabaseAdmin
    .from(EMAIL_TEMPLATE_VERSIONS_TABLE)
    .select(TEMPLATE_VERSION_COLUMNS)
    .eq("tenant_id", tenantId)
    .eq("template_id", templateId)
    .order("version", { ascending: false });

  if (error) throwSupabaseError(error);
  return (data as unknown as EmailTemplateVersionRow[]) ?? [];
}

export async function restoreEmailTemplateVersion(input: {
  tenantId: string;
  profileId: string | null;
  templateId: string;
  version: number;
}): Promise<{ template: EmailTemplateRow; version: EmailTemplateVersionRow }> {
  const supabaseAdmin = getAdminSupabaseClient();
  const current = await requireEmailTemplate(input.tenantId, input.templateId);
  const { data: versionRow, error: versionError } = await supabaseAdmin
    .from(EMAIL_TEMPLATE_VERSIONS_TABLE)
    .select(TEMPLATE_VERSION_COLUMNS)
    .eq("tenant_id", input.tenantId)
    .eq("template_id", input.templateId)
    .eq("version", input.version)
    .maybeSingle();

  if (versionError) throwSupabaseError(versionError);
  if (!versionRow) {
    throw new ApiHttpError(404, "Email template version not found");
  }

  const restored = versionRow as unknown as EmailTemplateVersionRow;
  const { data, error } = await supabaseAdmin
    .from(EMAIL_TEMPLATES_TABLE)
    .update({
      builder: restored.builder,
      builder_version: restored.builder_version,
      design_json: restored.design_json,
      html_content: restored.html_content,
      html_exported_at: restored.html_content ? new Date().toISOString() : null,
      text_content: restored.text_content,
      text_exported_at: restored.text_content ? new Date().toISOString() : null,
      default_subject: restored.subject,
      default_preheader: restored.preheader,
      editor_metadata: {
        ...restored.editor_metadata,
        restoredFromVersion: restored.version,
      },
      version: current.version + 1,
      updated_at: new Date().toISOString(),
    })
    .eq("tenant_id", input.tenantId)
    .eq("id", input.templateId)
    .select(TEMPLATE_COLUMNS)
    .single();

  if (error) throwSupabaseError(error);
  const template = data as unknown as EmailTemplateRow;
  const version = await createTemplateVersion(
    supabaseAdmin,
    template,
    input.profileId,
  );
  await syncContributionCorrectionTemplateBinding({
    supabaseAdmin,
    template,
    previousTemplate: current,
  });
  return { template, version };
}
