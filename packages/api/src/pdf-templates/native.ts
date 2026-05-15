import {
  getAuthContext,
  requireRole,
  type AuthenticatedContext,
} from "@asym/auth/context";
import {
  DocumentTemplateV1Schema,
  UnlayerUnsupportedFeatureSchema,
} from "@asym/pdf-template-schema";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import {
  createCorePdfSecurityContext,
  createCorePdfStudioAdapter,
  createNativePdfStudioMigrationReport,
} from "./native-adapter";
import { readPdfTemplate } from "./store";
import { ensureJsonBody, toErrorResponse } from "../shared/http-errors";

const jsonRecordSchema = z.record(z.string(), z.unknown());

const previewRequestSchema = z.object({
  template: z.unknown(),
  dataContext: jsonRecordSchema.optional(),
  previewId: z.string().min(1).max(160).optional(),
});

const renderRequestSchema = previewRequestSchema.extend({
  renderId: z.string().min(1).max(160),
});

const migrationReportRequestSchema = z.object({
  templateId: z.string().uuid(),
  unsupportedFeatures: z.array(UnlayerUnsupportedFeatureSchema).optional(),
});

async function requireAdminContext(
  request?: Request,
): Promise<AuthenticatedContext> {
  const auth = await getAuthContext(request);
  requireRole(auth, ["admin", "super_admin"]);
  return auth as AuthenticatedContext;
}

export async function POST_NATIVE_PREVIEW(request: NextRequest) {
  try {
    const auth = await requireAdminContext(request);
    const body = previewRequestSchema.parse(await ensureJsonBody(request));
    const template = DocumentTemplateV1Schema.parse(body.template);
    const adapter = createCorePdfStudioAdapter({ auth });
    const result = await adapter.previewTemplate({
      context: createCorePdfSecurityContext(auth),
      dataContext: body.dataContext,
      previewId: body.previewId,
      template,
    });

    return NextResponse.json({ success: true, ...result }, { status: 200 });
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function POST_NATIVE_RENDER(request: NextRequest) {
  try {
    const auth = await requireAdminContext(request);
    const body = renderRequestSchema.parse(await ensureJsonBody(request));
    const template = DocumentTemplateV1Schema.parse(body.template);
    const adapter = createCorePdfStudioAdapter({ auth });
    const result = await adapter.renderTemplate({
      context: createCorePdfSecurityContext(auth),
      dataContext: body.dataContext,
      renderId: body.renderId,
      template,
    });

    return NextResponse.json({ success: true, ...result }, { status: 200 });
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function POST_NATIVE_MIGRATION_REPORT(request: NextRequest) {
  try {
    const auth = await requireAdminContext(request);
    const body = migrationReportRequestSchema.parse(
      await ensureJsonBody(request),
    );
    const row = await readPdfTemplate(auth.tenantId, body.templateId);

    if (!row) {
      return NextResponse.json(
        { success: false, error: "PDF template not found" },
        { status: 404 },
      );
    }

    const report = createNativePdfStudioMigrationReport({
      createdAt: new Date().toISOString(),
      createdByActorId: auth.userId,
      row,
      unsupportedFeatures: body.unsupportedFeatures,
    });

    return NextResponse.json({ success: true, report }, { status: 200 });
  } catch (error) {
    return toErrorResponse(error);
  }
}
