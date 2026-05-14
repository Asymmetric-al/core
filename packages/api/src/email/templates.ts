import {
  getAuthContext,
  requireRole,
  type AuthenticatedContext,
} from "@asym/auth/context";
import { validateMergeTags } from "@asym/email/merge-tag-render";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import {
  createEmailTemplate,
  deleteEmailTemplate,
  duplicateEmailTemplate,
  listEmailTemplateVersions,
  listEmailTemplates,
  readEmailTemplate,
  requireEmailTemplate,
  restoreEmailTemplateVersion,
  updateEmailTemplate,
} from "./template-store";
import {
  ApiHttpError,
  ensureJsonBody,
  toErrorResponse,
} from "../shared/http-errors";

const emailBuilderSchema = z.enum(["unlayer", "react_email"]);
const emailCategorySchema = z.enum(["transactional", "campaign", "system"]);
const jsonRecordSchema = z.record(z.string(), z.unknown());

const templateMutationSchema = z.object({
  name: z.string().min(1, "Template name is required").max(160),
  description: z.string().max(1000).nullable().optional(),
  category: emailCategorySchema.optional(),
  builder: emailBuilderSchema.default("react_email"),
  builderVersion: z.string().max(80).nullable().optional(),
  designJson: jsonRecordSchema,
  htmlContent: z.string().nullable().optional(),
  textContent: z.string().nullable().optional(),
  defaultSubject: z.string().max(240).nullable().optional(),
  defaultPreheader: z.string().max(320).nullable().optional(),
  editorMetadata: jsonRecordSchema.optional(),
  legacyUnlayerProjectId: z.number().int().positive().nullable().optional(),
  isActive: z.boolean().optional(),
  isSystem: z.boolean().optional(),
});

const templatePatchSchema = templateMutationSchema.partial().extend({
  name: z.string().min(1, "Template name is required").max(160).optional(),
});

function validateTemplateMergeTags(input: {
  htmlContent?: string | null;
  textContent?: string | null;
  defaultSubject?: string | null;
  defaultPreheader?: string | null;
}) {
  const validation = validateMergeTags(
    [
      input.htmlContent ?? "",
      input.textContent ?? "",
      input.defaultSubject ?? "",
      input.defaultPreheader ?? "",
    ].join("\n"),
  );

  if (!validation.valid) {
    throw new ApiHttpError(400, validation.errors.join("; "));
  }
}

async function requireAdminContext(
  request?: Request,
): Promise<AuthenticatedContext> {
  const auth = await getAuthContext(request);
  requireRole(auth, ["admin", "super_admin"]);
  return auth as AuthenticatedContext;
}

export async function GET(request: NextRequest) {
  try {
    const ctx = await requireAdminContext(request);
    const templates = await listEmailTemplates(ctx.tenantId);
    return NextResponse.json({ success: true, templates }, { status: 200 });
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const ctx = await requireAdminContext(request);
    const body = templateMutationSchema.parse(await ensureJsonBody(request));

    validateTemplateMergeTags(body);

    const result = await createEmailTemplate({
      tenantId: ctx.tenantId,
      profileId: ctx.profileId,
      template: body,
    });

    return NextResponse.json({ success: true, ...result }, { status: 201 });
  } catch (error) {
    return toErrorResponse(error);
  }
}

type TemplateContext = { params: Promise<{ templateId: string }> };
type RestoreContext = {
  params: Promise<{ templateId: string; version: string }>;
};

export async function GET_TEMPLATE(
  request: NextRequest,
  context: TemplateContext,
) {
  try {
    const ctx = await requireAdminContext(request);
    const { templateId } = await context.params;
    const template = await readEmailTemplate(ctx.tenantId, templateId);

    if (!template) {
      throw new ApiHttpError(404, "Email template not found");
    }

    return NextResponse.json({ success: true, template }, { status: 200 });
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function PATCH_TEMPLATE(
  request: NextRequest,
  context: TemplateContext,
) {
  try {
    const ctx = await requireAdminContext(request);
    const { templateId } = await context.params;
    const body = templatePatchSchema.parse(await ensureJsonBody(request));

    validateTemplateMergeTags(body);

    const result = await updateEmailTemplate({
      tenantId: ctx.tenantId,
      profileId: ctx.profileId,
      templateId,
      patch: body,
    });

    return NextResponse.json({ success: true, ...result }, { status: 200 });
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function DELETE_TEMPLATE(
  request: NextRequest,
  context: TemplateContext,
) {
  try {
    const ctx = await requireAdminContext(request);
    const { templateId } = await context.params;
    await deleteEmailTemplate(ctx.tenantId, templateId);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function POST_DUPLICATE(
  request: NextRequest,
  context: TemplateContext,
) {
  try {
    const ctx = await requireAdminContext(request);
    const { templateId } = await context.params;
    const result = await duplicateEmailTemplate({
      tenantId: ctx.tenantId,
      profileId: ctx.profileId,
      templateId,
    });

    return NextResponse.json({ success: true, ...result }, { status: 201 });
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function POST_EXPORT(
  request: NextRequest,
  context: TemplateContext,
) {
  try {
    const ctx = await requireAdminContext(request);
    const { templateId } = await context.params;
    const template = await requireEmailTemplate(ctx.tenantId, templateId);

    if (!template.html_content || !template.text_content) {
      throw new ApiHttpError(
        409,
        "Template must be exported by the editor before download or send.",
      );
    }

    return NextResponse.json(
      {
        success: true,
        export: {
          builder: template.builder,
          builderVersion: template.builder_version,
          design: template.design_json,
          html: template.html_content,
          text: template.text_content,
          subject: template.default_subject,
          preheader: template.default_preheader,
          version: template.version,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function GET_VERSIONS(
  request: NextRequest,
  context: TemplateContext,
) {
  try {
    const ctx = await requireAdminContext(request);
    const { templateId } = await context.params;
    await requireEmailTemplate(ctx.tenantId, templateId);
    const versions = await listEmailTemplateVersions(ctx.tenantId, templateId);

    return NextResponse.json({ success: true, versions }, { status: 200 });
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function POST_RESTORE(
  request: NextRequest,
  context: RestoreContext,
) {
  try {
    const ctx = await requireAdminContext(request);
    const { templateId, version } = await context.params;
    const parsedVersion = Number.parseInt(version, 10);

    if (!Number.isInteger(parsedVersion) || parsedVersion <= 0) {
      throw new ApiHttpError(
        400,
        "Template version must be a positive integer",
      );
    }

    const result = await restoreEmailTemplateVersion({
      tenantId: ctx.tenantId,
      profileId: ctx.profileId,
      templateId,
      version: parsedVersion,
    });

    return NextResponse.json({ success: true, ...result }, { status: 200 });
  } catch (error) {
    return toErrorResponse(error);
  }
}
