import { NextResponse } from "next/server";
import { z } from "zod";

import { ensureJsonBody, toErrorResponse } from "../../shared/http-errors";
import { withOperation } from "../../shared/with-operation";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type QueryError = { code?: string; message: string } | null;

type SourceCodeRow = {
  id: string;
  tenant_id: string;
  code: string;
  label: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

interface SourceCodesSessionClient {
  from(table: "giving_source_codes"): {
    select(columns: string): {
      order(
        column: string,
        options?: { ascending?: boolean },
      ): PromiseLike<{ data: SourceCodeRow[] | null; error: QueryError }>;
    };
  };
  rpc(
    fn: "create_giving_source_code",
    args: {
      p_tenant_id: string;
      p_code: string;
      p_label: string;
      p_reason: string;
    },
  ): Promise<{ data: Record<string, unknown> | null; error: QueryError }>;
  rpc(
    fn: "update_giving_source_code",
    args: {
      p_tenant_id: string;
      p_source_code_id: string;
      p_label: string | null;
      p_is_active: boolean | null;
      p_reason: string;
    },
  ): Promise<{ data: Record<string, unknown> | null; error: QueryError }>;
}

const createSourceCodeSchema = z.object({
  code: z.string().trim().min(1, "Source code is required.").max(64),
  label: z.string().trim().min(1, "Label is required.").max(120),
  reason: z.string().trim().min(1, "A non-blank reason is required.").max(500),
});

const updateSourceCodeSchema = z
  .object({
    id: z.string().regex(UUID_PATTERN, "Valid source code id is required."),
    label: z.string().trim().min(1).max(120).optional(),
    is_active: z.boolean().optional(),
    reason: z
      .string()
      .trim()
      .min(1, "A non-blank reason is required.")
      .max(500),
  })
  .refine(
    (value) => value.label !== undefined || value.is_active !== undefined,
    { message: "Supply label or is_active to update." },
  );

function mapDatabaseErrorStatus(code: string | undefined): number {
  if (code === "42501") return 403;
  if (code === "P0002") return 404;
  if (code === "22023") return 400;
  if (code === "23505" || code === "23503") return 409;
  return 500;
}

export const GET = withOperation(
  async ({ sessionClient, requestId }) => {
    try {
      const session = sessionClient as unknown as SourceCodesSessionClient;
      const { data, error } = await session
        .from("giving_source_codes")
        .select("id, tenant_id, code, label, is_active, created_at, updated_at")
        .order("code", { ascending: true });

      if (error) {
        return NextResponse.json(
          { error: error.message, requestId },
          { status: mapDatabaseErrorStatus(error.code) },
        );
      }

      return NextResponse.json({
        sourceCodes: data ?? [],
        requestId,
      });
    } catch (error) {
      return toErrorResponse(error, "Failed to load source codes.", requestId);
    }
  },
  { capability: "contributions.manage_settings" },
);

export const POST = withOperation(
  async ({ auth, request, sessionClient, requestId }) => {
    try {
      const rawBody = await ensureJsonBody(request);
      const parsed = createSourceCodeSchema.safeParse(rawBody);
      if (!parsed.success) {
        return NextResponse.json(
          {
            error: parsed.error.issues[0]?.message ?? "Invalid request body.",
            requestId,
          },
          { status: 400 },
        );
      }

      const session = sessionClient as unknown as SourceCodesSessionClient;
      const { data, error } = await session.rpc("create_giving_source_code", {
        p_tenant_id: auth.tenantId,
        p_code: parsed.data.code,
        p_label: parsed.data.label,
        p_reason: parsed.data.reason,
      });

      if (error || !data) {
        const status = mapDatabaseErrorStatus(error?.code);
        return NextResponse.json(
          {
            error:
              status >= 500
                ? "Failed to create source code."
                : (error?.message ?? "Failed to create source code."),
            requestId,
          },
          { status },
        );
      }

      return NextResponse.json(
        { sourceCode: data, requestId },
        { status: 201 },
      );
    } catch (error) {
      return toErrorResponse(error, "Failed to create source code.", requestId);
    }
  },
  { capability: "contributions.manage_settings" },
);

export const PATCH = withOperation(
  async ({ auth, request, sessionClient, requestId }) => {
    try {
      const rawBody = await ensureJsonBody(request);
      const parsed = updateSourceCodeSchema.safeParse(rawBody);
      if (!parsed.success) {
        return NextResponse.json(
          {
            error: parsed.error.issues[0]?.message ?? "Invalid request body.",
            requestId,
          },
          { status: 400 },
        );
      }

      const session = sessionClient as unknown as SourceCodesSessionClient;
      const { data, error } = await session.rpc("update_giving_source_code", {
        p_tenant_id: auth.tenantId,
        p_source_code_id: parsed.data.id,
        p_label: parsed.data.label ?? null,
        p_is_active: parsed.data.is_active ?? null,
        p_reason: parsed.data.reason,
      });

      if (error || !data) {
        const status = mapDatabaseErrorStatus(error?.code);
        return NextResponse.json(
          {
            error:
              status >= 500
                ? "Failed to update source code."
                : (error?.message ?? "Failed to update source code."),
            requestId,
          },
          { status },
        );
      }

      return NextResponse.json({ sourceCode: data, requestId });
    } catch (error) {
      return toErrorResponse(error, "Failed to update source code.", requestId);
    }
  },
  { capability: "contributions.manage_settings" },
);
