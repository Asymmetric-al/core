import { NextResponse } from "next/server";
import { z } from "zod";

import {
  ApiHttpError,
  ensureJsonBody,
  reportOperationFailure,
} from "../../shared/http-errors";

export const SITES_CAPABILITY = "sites.manage";

export const NAME_MAX_CODE_POINTS = 160;

const NAME_EDGE = /^[\p{White_Space}\p{Cf}]|[\p{White_Space}\p{Cf}]$/u;
const NAME_CONTROL = /\p{Cc}/u;

export function isAcceptableName(value: string): boolean {
  const codePoints = [...value].length;
  return (
    codePoints >= 1 &&
    codePoints <= NAME_MAX_CODE_POINTS &&
    !NAME_EDGE.test(value) &&
    !NAME_CONTROL.test(value)
  );
}

const SITE_STATUSES = ["active", "inactive"] as const;

const siteFields = {
  id: z.guid(),
  name: z.string(),
  is_default: z.boolean(),
  status: z.enum(SITE_STATUSES),
  primary_domain: z.string().nullable(),
};

export const siteSettingsRpcSchema = z.strictObject({
  sites: z.array(z.strictObject(siteFields)),
  brand: z.strictObject({ display_name: z.string() }).nullable(),
});

export const siteCommandRowSchema = z.strictObject({
  ...siteFields,
  tenant_id: z.guid(),
});

export const brandCommandRowSchema = z.strictObject({
  tenant_id: z.guid(),
  display_name: z.string(),
});

export const createSiteBodySchema = z.strictObject({ name: z.string() });

export const siteStatusBodySchema = z.strictObject({
  siteId: z.guid(),
  status: z.enum(SITE_STATUSES),
});

export const brandBodySchema = z.strictObject({ displayName: z.string() });

export type SiteSummary = z.infer<
  typeof siteSettingsRpcSchema
>["sites"][number];

export const SITE_ERRORS = {
  NOT_PERMITTED: {
    status: 403,
    text: "You can't manage Sites in this organization.",
  },
  SITE_NOT_FOUND: {
    status: 404,
    text: "This Site isn't in this organization any more. Reload to see the current list.",
  },
  DEFAULT_SITE_ALWAYS_ACTIVE: {
    status: 409,
    text: "The default Site is always active.",
  },
  INVALID_NAME: {
    status: 400,
    text: "Use 1 to 160 characters, with nothing invisible and no spaces at the start or end.",
  },
  INVALID_REQUEST: {
    status: 400,
    text: "This request can't be read. Reload the page and try again.",
  },
  SITES_UNAVAILABLE: {
    status: 500,
    text: "Sites can't be loaded or changed right now. Try again.",
  },
} as const;

export type SiteErrorCode = keyof typeof SITE_ERRORS;

export type SitesOperation = "read" | "create" | "status" | "brand";

export interface SitesRpcClient {
  rpc(
    fn: string,
    args: Record<string, unknown>,
  ): PromiseLike<{ data: unknown; error: { code?: unknown } | null }>;
}

export function siteError(code: SiteErrorCode): NextResponse {
  const { status, text } = SITE_ERRORS[code];
  return NextResponse.json({ error: text, code }, { status });
}

export async function sitesFailure(
  operation: SitesOperation,
  code: string | null,
  requestId: string,
): Promise<NextResponse> {
  const failure = new Error();
  const reported = code === null ? failure : Object.assign(failure, { code });
  await reportOperationFailure(
    `admin.sites.${operation}`,
    reported,
    requestId,
    500,
  );
  return siteError("SITES_UNAVAILABLE");
}

export async function commandRefusal(
  operation: SitesOperation,
  error: { code?: unknown },
  refusals: Readonly<Record<string, SiteErrorCode>>,
  requestId: string,
): Promise<NextResponse> {
  const code = typeof error.code === "string" ? error.code : null;
  if (code === "42501") return siteError("NOT_PERMITTED");
  const refusal = code === null ? undefined : refusals[code];
  if (refusal) return siteError(refusal);
  return sitesFailure(operation, code, requestId);
}

export function sameTenant(left: string, right: string): boolean {
  return left.toLowerCase() === right.toLowerCase();
}

export function siteFromCommand(
  data: unknown,
  tenantId: string,
): SiteSummary | null {
  const parsed = siteCommandRowSchema.safeParse(data);
  if (!parsed.success || !sameTenant(parsed.data.tenant_id, tenantId)) {
    return null;
  }
  const { id, name, is_default, status, primary_domain } = parsed.data;
  return { id, name, is_default, status, primary_domain };
}

export function brandFromCommand(
  data: unknown,
  tenantId: string,
): { display_name: string } | null {
  const parsed = brandCommandRowSchema.safeParse(data);
  if (!parsed.success || !sameTenant(parsed.data.tenant_id, tenantId)) {
    return null;
  }
  return { display_name: parsed.data.display_name };
}

export async function readBody<T extends Record<string, unknown>>(
  request: Request,
  schema: z.ZodType<T>,
  nameField?: keyof T,
): Promise<{ ok: true; data: T } | { ok: false; response: NextResponse }> {
  let raw: unknown;
  try {
    raw = await ensureJsonBody(request);
  } catch (error) {
    const status = error instanceof ApiHttpError ? error.status : 400;
    const message =
      error instanceof ApiHttpError ? error.message : "Invalid JSON body";
    return {
      ok: false,
      response: NextResponse.json({ error: message }, { status }),
    };
  }
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, response: siteError("INVALID_REQUEST") };
  }
  const name = nameField === undefined ? undefined : parsed.data[nameField];
  if (typeof name === "string" && !isAcceptableName(name)) {
    return { ok: false, response: siteError("INVALID_NAME") };
  }
  return { ok: true, data: parsed.data };
}

export function withNoStore<Args extends unknown[], Result extends Response>(
  handler: (...args: Args) => Promise<Result>,
): (...args: Args) => Promise<Result> {
  return async (...args: Args) => {
    const response = await handler(...args);
    response.headers.set("Cache-Control", "no-store");
    return response;
  };
}
