import { getAdminClient } from "@asym/database/supabase/admin";

import { ApiHttpError } from "../shared/http-errors";

const PDF_TEMPLATES_TABLE = "pdf_templates";

const PDF_TEMPLATE_COLUMNS = [
  "id",
  "tenant_id",
  "name",
  "description",
  "thumbnail",
  "design",
  "html",
  "category",
  "page_size",
  "orientation",
  "margins",
  "tags",
  "status",
  "is_default",
  "created_by",
  "created_at",
  "updated_at",
].join(", ");

type AdminSupabaseClient = NonNullable<
  ReturnType<typeof getAdminClient>["client"]
>;

export type PdfTemplateCategory =
  | "tax_receipt"
  | "donation_receipt"
  | "annual_statement"
  | "letter"
  | "certificate"
  | "report"
  | "invoice"
  | "custom";

export type PdfTemplateStatus = "draft" | "published" | "archived";
export type PdfTemplatePageSize = "A4" | "Letter" | "Legal";
export type PdfTemplateOrientation = "portrait" | "landscape";

export interface PdfTemplateMargins {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface PdfTemplateRow {
  id: string;
  tenant_id: string;
  name: string;
  description: string | null;
  thumbnail: string | null;
  design: Record<string, unknown>;
  html: string | null;
  category: PdfTemplateCategory;
  page_size: PdfTemplatePageSize;
  orientation: PdfTemplateOrientation;
  margins: PdfTemplateMargins;
  tags: string[];
  status: PdfTemplateStatus;
  is_default: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface PdfTemplateMutationInput {
  name: string;
  description?: string | null;
  thumbnail?: string | null;
  design: Record<string, unknown>;
  html?: string | null;
  category?: PdfTemplateCategory;
  page_size?: PdfTemplatePageSize;
  orientation?: PdfTemplateOrientation;
  margins?: PdfTemplateMargins;
  tags?: string[];
  status?: PdfTemplateStatus;
  is_default?: boolean;
}

export interface PdfTemplatePatchInput extends Partial<PdfTemplateMutationInput> {
  name?: string;
  design?: Record<string, unknown>;
}

export interface PdfTemplateListFilters {
  category?: PdfTemplateCategory;
  status?: PdfTemplateStatus;
  includeArchived?: boolean;
}

export class PdfTemplateStorageUnavailableError extends ApiHttpError {
  readonly code = "PDF_TEMPLATE_STORAGE_UNAVAILABLE";

  constructor() {
    super(
      503,
      "PDF template storage is unavailable in this environment. Apply the PDF Studio template table before saving templates.",
    );
    this.name = "PdfTemplateStorageUnavailableError";
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
    message.includes(PDF_TEMPLATES_TABLE) &&
    (error.code === "PGRST205" ||
      error.code === "42P01" ||
      message.includes("schema cache") ||
      message.includes("could not find the table") ||
      message.includes("does not exist"))
  );
}

function throwSupabaseError(error: { code?: string; message?: string }): never {
  if (isStorageMissing(error)) {
    throw new PdfTemplateStorageUnavailableError();
  }
  throw new ApiHttpError(500, error.message ?? "PDF template storage error");
}

function toTemplatePayload(
  tenantId: string,
  profileId: string | null,
  input: PdfTemplateMutationInput,
) {
  const now = new Date().toISOString();
  return {
    tenant_id: tenantId,
    name: input.name,
    description: input.description ?? null,
    thumbnail: input.thumbnail ?? null,
    design: input.design,
    html: input.html ?? null,
    category: input.category ?? "custom",
    page_size: input.page_size ?? "Letter",
    orientation: input.orientation ?? "portrait",
    margins:
      input.margins ?? ({ top: 72, right: 72, bottom: 72, left: 72 } as const),
    tags: input.tags ?? [],
    status: input.status ?? "draft",
    is_default: input.is_default ?? false,
    created_by: profileId,
    updated_at: now,
  };
}

function toPatchPayload(input: PdfTemplatePatchInput) {
  const payload: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (input.name !== undefined) payload.name = input.name;
  if (input.description !== undefined) payload.description = input.description;
  if (input.thumbnail !== undefined) payload.thumbnail = input.thumbnail;
  if (input.design !== undefined) payload.design = input.design;
  if (input.html !== undefined) payload.html = input.html;
  if (input.category !== undefined) payload.category = input.category;
  if (input.page_size !== undefined) payload.page_size = input.page_size;
  if (input.orientation !== undefined) payload.orientation = input.orientation;
  if (input.margins !== undefined) payload.margins = input.margins;
  if (input.tags !== undefined) payload.tags = input.tags;
  if (input.status !== undefined) payload.status = input.status;
  if (input.is_default !== undefined) payload.is_default = input.is_default;

  return payload;
}

export async function listPdfTemplates(
  tenantId: string,
  filters: PdfTemplateListFilters = {},
): Promise<PdfTemplateRow[]> {
  const supabaseAdmin = getAdminSupabaseClient();
  let query = supabaseAdmin
    .from(PDF_TEMPLATES_TABLE)
    .select(PDF_TEMPLATE_COLUMNS)
    .eq("tenant_id", tenantId);

  if (filters.category) {
    query = query.eq("category", filters.category);
  }

  if (filters.status) {
    query = query.eq("status", filters.status);
  } else if (!filters.includeArchived) {
    query = query.neq("status", "archived");
  }

  const { data, error } = await query.order("updated_at", {
    ascending: false,
  });

  if (error) throwSupabaseError(error);
  return (data as unknown as PdfTemplateRow[]) ?? [];
}

export async function readPdfTemplate(
  tenantId: string,
  templateId: string,
): Promise<PdfTemplateRow | null> {
  const supabaseAdmin = getAdminSupabaseClient();
  const { data, error } = await supabaseAdmin
    .from(PDF_TEMPLATES_TABLE)
    .select(PDF_TEMPLATE_COLUMNS)
    .eq("tenant_id", tenantId)
    .eq("id", templateId)
    .maybeSingle();

  if (error) throwSupabaseError(error);
  return (data as unknown as PdfTemplateRow | null) ?? null;
}

export async function requirePdfTemplate(
  tenantId: string,
  templateId: string,
): Promise<PdfTemplateRow> {
  const template = await readPdfTemplate(tenantId, templateId);
  if (!template || template.status === "archived") {
    throw new ApiHttpError(404, "PDF template not found");
  }
  return template;
}

export async function createPdfTemplate(input: {
  tenantId: string;
  profileId: string | null;
  template: PdfTemplateMutationInput;
}): Promise<PdfTemplateRow> {
  const supabaseAdmin = getAdminSupabaseClient();
  const { data, error } = await supabaseAdmin
    .from(PDF_TEMPLATES_TABLE)
    .insert(toTemplatePayload(input.tenantId, input.profileId, input.template))
    .select(PDF_TEMPLATE_COLUMNS)
    .single();

  if (error) throwSupabaseError(error);
  return data as unknown as PdfTemplateRow;
}

export async function updatePdfTemplate(input: {
  tenantId: string;
  templateId: string;
  patch: PdfTemplatePatchInput;
}): Promise<PdfTemplateRow> {
  await requirePdfTemplate(input.tenantId, input.templateId);
  const supabaseAdmin = getAdminSupabaseClient();
  const { data, error } = await supabaseAdmin
    .from(PDF_TEMPLATES_TABLE)
    .update(toPatchPayload(input.patch))
    .eq("tenant_id", input.tenantId)
    .eq("id", input.templateId)
    .select(PDF_TEMPLATE_COLUMNS)
    .single();

  if (error) throwSupabaseError(error);
  return data as unknown as PdfTemplateRow;
}

export async function archivePdfTemplate(
  tenantId: string,
  templateId: string,
): Promise<void> {
  await requirePdfTemplate(tenantId, templateId);
  const supabaseAdmin = getAdminSupabaseClient();
  const { error } = await supabaseAdmin
    .from(PDF_TEMPLATES_TABLE)
    .update({ status: "archived", updated_at: new Date().toISOString() })
    .eq("tenant_id", tenantId)
    .eq("id", templateId);

  if (error) throwSupabaseError(error);
}
