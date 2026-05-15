import {
  getAuthContext,
  requireRole,
  type AuthenticatedContext,
} from "@asym/auth/context";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import {
  archivePdfTemplate,
  createPdfTemplate,
  listPdfTemplates,
  readPdfTemplate,
  updatePdfTemplate,
  type PdfTemplateListFilters,
} from "./store";
import {
  ApiHttpError,
  ensureJsonBody,
  toErrorResponse,
} from "../shared/http-errors";

const pdfTemplateCategorySchema = z.enum([
  "tax_receipt",
  "donation_receipt",
  "annual_statement",
  "letter",
  "certificate",
  "missionary_report",
  "report",
  "invoice",
  "custom",
]);

const pdfTemplateStatusSchema = z.enum(["draft", "published", "archived"]);
const pdfTemplateEngineSchema = z.enum([
  "unlayer",
  "asym_pdf_document_builder",
]);
const pdfTemplateMigrationStatusSchema = z.enum([
  "not_started",
  "manual_rebuild_required",
  "in_progress",
  "rebuilt",
  "validated",
  "published",
  "archived",
]);
const pdfTemplatePageSizeSchema = z.enum(["A4", "Letter", "Legal"]);
const pdfTemplateOrientationSchema = z.enum(["portrait", "landscape"]);
const jsonRecordSchema = z.record(z.string(), z.unknown());

const pdfTemplateMarginsSchema = z.object({
  top: z.number().nonnegative(),
  right: z.number().nonnegative(),
  bottom: z.number().nonnegative(),
  left: z.number().nonnegative(),
});

const pdfTemplateMutationSchema = z.object({
  name: z.string().min(1, "Template name is required").max(160),
  description: z.string().max(1000).nullable().optional(),
  thumbnail: z.string().url().nullable().optional(),
  design: jsonRecordSchema,
  html: z.string().nullable().optional(),
  category: pdfTemplateCategorySchema.optional(),
  page_size: pdfTemplatePageSizeSchema.optional(),
  orientation: pdfTemplateOrientationSchema.optional(),
  margins: pdfTemplateMarginsSchema.optional(),
  tags: z.array(z.string().min(1).max(80)).max(24).optional(),
  status: pdfTemplateStatusSchema.optional(),
  is_default: z.boolean().optional(),
  engine: pdfTemplateEngineSchema.optional(),
  native_schema_version: z.number().int().positive().nullable().optional(),
  native_template_current_draft_version_id: z
    .string()
    .uuid()
    .nullable()
    .optional(),
  native_template_current_published_version_id: z
    .string()
    .uuid()
    .nullable()
    .optional(),
  legacy_unlayer_project_id: z.string().max(160).nullable().optional(),
  migration_status: pdfTemplateMigrationStatusSchema.optional(),
  migration_report: jsonRecordSchema.optional(),
});

const pdfTemplatePatchSchema = pdfTemplateMutationSchema.partial().extend({
  name: z.string().min(1, "Template name is required").max(160).optional(),
  design: jsonRecordSchema.optional(),
});

const templateIdSchema = z.string().uuid("Template id must be a UUID");

async function requireAdminContext(
  request?: Request,
): Promise<AuthenticatedContext> {
  const auth = await getAuthContext(request);
  requireRole(auth, ["admin", "super_admin"]);
  return auth as AuthenticatedContext;
}

function parseTemplateFilters(request: NextRequest): PdfTemplateListFilters {
  const category = request.nextUrl.searchParams.get("category");
  const status = request.nextUrl.searchParams.get("status");
  const includeArchived =
    request.nextUrl.searchParams.get("includeArchived") === "true";

  return {
    category: category ? pdfTemplateCategorySchema.parse(category) : undefined,
    status: status ? pdfTemplateStatusSchema.parse(status) : undefined,
    includeArchived,
  };
}

type TemplateContext = { params: Promise<{ templateId: string }> };

async function parseTemplateId(context: TemplateContext): Promise<string> {
  const { templateId } = await context.params;
  return templateIdSchema.parse(templateId);
}

export async function GET(request: NextRequest) {
  try {
    const ctx = await requireAdminContext(request);
    const filters = parseTemplateFilters(request);
    const templates = await listPdfTemplates(ctx.tenantId, filters);

    return NextResponse.json({ success: true, templates }, { status: 200 });
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const ctx = await requireAdminContext(request);
    const body = pdfTemplateMutationSchema.parse(await ensureJsonBody(request));
    const template = await createPdfTemplate({
      tenantId: ctx.tenantId,
      profileId: ctx.profileId,
      template: body,
    });

    return NextResponse.json({ success: true, template }, { status: 201 });
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function GET_TEMPLATE(
  request: NextRequest,
  context: TemplateContext,
) {
  try {
    const ctx = await requireAdminContext(request);
    const templateId = await parseTemplateId(context);
    const template = await readPdfTemplate(ctx.tenantId, templateId);

    if (!template || template.status === "archived") {
      throw new ApiHttpError(404, "PDF template not found");
    }

    return NextResponse.json({ success: true, template }, { status: 200 });
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function PUT_TEMPLATE(
  request: NextRequest,
  context: TemplateContext,
) {
  try {
    const ctx = await requireAdminContext(request);
    const templateId = await parseTemplateId(context);
    const body = pdfTemplatePatchSchema.parse(await ensureJsonBody(request));
    const template = await updatePdfTemplate({
      tenantId: ctx.tenantId,
      templateId,
      patch: body,
    });

    return NextResponse.json({ success: true, template }, { status: 200 });
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function PATCH_TEMPLATE(
  request: NextRequest,
  context: TemplateContext,
) {
  return PUT_TEMPLATE(request, context);
}

export async function DELETE_TEMPLATE(
  request: NextRequest,
  context: TemplateContext,
) {
  try {
    const ctx = await requireAdminContext(request);
    const templateId = await parseTemplateId(context);
    await archivePdfTemplate(ctx.tenantId, templateId);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return toErrorResponse(error);
  }
}
