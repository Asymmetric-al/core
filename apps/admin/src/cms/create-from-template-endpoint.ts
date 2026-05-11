/**
 * Payload `config.endpoints` handler: **POST** `/api/web-studio/create-from-template`
 *
 * Instantiates **draft** CMS documents from `page-templates` while reusing Payload `req`
 * (staff auth, tenant access, audit hooks). Validates canonical IDs against Supabase when needed.
 *
 * @see docs/guides/architecture/web-studio-living-spec.md
 */
import { findMissionaryById } from "@asym/api/missionaries/queries";
import { getAdminClient } from "@asym/database/supabase/admin";
import { defaultRichTextValue } from "@payloadcms/richtext-lexical";
import { z } from "zod";

import {
  getTenantContext,
  isStaffRole,
  isSuperAdmin,
} from "./access/tenant-context";
import {
  MISSIONARY_GIVING_PAGE_TYPE,
  MINISTRY_UPDATE_TEMPLATE_PAGE_TYPE,
  PROJECT_PAGE_TYPE,
  STANDARD_PAGE_TYPE,
} from "./collections/page-builders";
import {
  MISSIONARY_GIVING_PAGES_SLUG,
  PAGE_TEMPLATES_SLUG,
  PROJECT_PAGES_SLUG,
} from "./constants";

import type {
  CmsLayoutBlocks,
  CmsRichTextValue,
  MinistryUpdateCreateFields,
  MissionaryGivingPageCreateFields,
  PageCreateFields,
  PageTemplateForCreate,
  ProjectPageCreateFields,
} from "./create-from-template-payload-shapes";
import type { Endpoint, PayloadRequest } from "payload";

const bodySchema = z.discriminatedUnion("targetCollection", [
  z.object({
    targetCollection: z.literal("pages"),
    templateId: z.string().min(1),
    title: z.string().min(1),
    slug: z.string().min(1),
    tenantId: z.string().optional(),
  }),
  z.object({
    targetCollection: z.literal(MISSIONARY_GIVING_PAGES_SLUG),
    templateId: z.string().min(1),
    missionaryId: z.string().uuid(),
    tenantId: z.string().optional(),
  }),
  z.object({
    targetCollection: z.literal(PROJECT_PAGES_SLUG),
    templateId: z.string().min(1),
    fundId: z.string().uuid(),
    tenantId: z.string().optional(),
  }),
  z.object({
    targetCollection: z.literal("ministry-updates"),
    templateId: z.string().min(1),
    missionaryProfileId: z.string().min(1),
    title: z.string().min(1),
    slug: z.string().min(1),
    tenantId: z.string().optional(),
  }),
]);

type ParsedBody = z.infer<typeof bodySchema>;
type TenantCtx = ReturnType<typeof getTenantContext>;
type PageCreateData = PageCreateFields;
type MissionaryGivingPageCreateData = MissionaryGivingPageCreateFields;
type ProjectPageCreateData = ProjectPageCreateFields;
type MinistryUpdateCreateData = MinistryUpdateCreateFields;

const emptyRichTextContent = defaultRichTextValue as CmsRichTextValue;

function jsonResponse(body: unknown, status = 200) {
  return Response.json(body, { status });
}

type StaffAuthResult =
  | { ok: true; ctx: TenantCtx }
  | { ok: false; response: Response };

async function requireStaff(req: PayloadRequest): Promise<StaffAuthResult> {
  const ctx = getTenantContext(req);
  if (!ctx.isAuthenticated || !isStaffRole(ctx)) {
    return { ok: false, response: jsonResponse({ error: "Forbidden" }, 403) };
  }
  if (!isSuperAdmin(ctx) && !ctx.tenantId) {
    return {
      ok: false,
      response: jsonResponse({ error: "Tenant context required" }, 400),
    };
  }
  return { ok: true, ctx };
}

function slugifySegment(input: string) {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function readTemplateTenant(template: PageTemplateForCreate): string | null {
  const t = template.tenant;
  if (typeof t === "string") {
    return t;
  }
  if (typeof t === "number") {
    return String(t);
  }
  if (t && typeof t === "object" && "id" in t) {
    return String((t as { id: string | number }).id);
  }
  return null;
}

function readDefaultLayout(template: PageTemplateForCreate): CmsLayoutBlocks {
  return "defaultLayout" in template && Array.isArray(template.defaultLayout)
    ? (template.defaultLayout as CmsLayoutBlocks)
    : [];
}

function readTemplateKey(template: PageTemplateForCreate): string {
  return typeof template.templateKey === "string"
    ? template.templateKey
    : "template";
}

function readTenantIdFromDoc(doc: {
  tenant?: number | { id: string | number } | null;
}): string | null {
  if (typeof doc.tenant === "number") {
    return String(doc.tenant);
  }
  if (doc.tenant && typeof doc.tenant === "object" && "id" in doc.tenant) {
    return String(doc.tenant.id);
  }
  return null;
}

async function resolveRequestedTenantId(
  req: PayloadRequest,
  ctx: TenantCtx,
  parsed: ParsedBody,
): Promise<{ ok: true; tenantId: string } | { ok: false; response: Response }> {
  if (!isSuperAdmin(ctx)) {
    if (!ctx.tenantId) {
      return {
        ok: false,
        response: jsonResponse({ error: "Tenant context required" }, 400),
      };
    }

    if (parsed.tenantId && parsed.tenantId !== ctx.tenantId) {
      return {
        ok: false,
        response: jsonResponse({ error: "Tenant mismatch" }, 403),
      };
    }

    return { ok: true, tenantId: ctx.tenantId };
  }

  if (!parsed.tenantId) {
    return {
      ok: false,
      response: jsonResponse(
        { error: "Super-admin must choose a tenant" },
        400,
      ),
    };
  }

  const tenant = await req.payload.findByID({
    collection: "tenants",
    id: parsed.tenantId,
    depth: 0,
    req,
  });

  if (!tenant) {
    return {
      ok: false,
      response: jsonResponse({ error: "Tenant not found" }, 404),
    };
  }

  return { ok: true, tenantId: String(tenant.id) };
}

async function createPageFromTemplate(
  req: PayloadRequest,
  tenantId: string,
  parsed: Extract<ParsedBody, { targetCollection: "pages" }>,
  template: PageTemplateForCreate,
  defaultLayout: CmsLayoutBlocks,
  _templateKey: string,
): Promise<Response> {
  const { payload } = req;
  const pageType =
    typeof template.pageType === "string"
      ? template.pageType
      : STANDARD_PAGE_TYPE;
  if (
    pageType !== STANDARD_PAGE_TYPE &&
    pageType !== MISSIONARY_GIVING_PAGE_TYPE &&
    pageType !== PROJECT_PAGE_TYPE
  ) {
    return jsonResponse(
      { error: "This template is not valid for standard pages collection" },
      400,
    );
  }

  const data: PageCreateData = {
    tenant: Number(tenantId),
    title: parsed.title,
    slug: slugifySegment(parsed.slug),
    summary:
      typeof template.defaultSummary === "string"
        ? template.defaultSummary
        : undefined,
    pageType,
    template: Number(parsed.templateId),
    layout: defaultLayout,
    content: emptyRichTextContent,
    legacyContentFallback: true,
  };

  const doc = await payload.create({
    collection: "pages",
    data,
    draft: true,
    req,
  });

  return jsonResponse({
    id: String(doc.id),
    collectionSlug: "pages" as const,
  });
}

async function createMissionaryGivingPageFromTemplate(
  req: PayloadRequest,
  tenantId: string,
  parsed: Extract<
    ParsedBody,
    { targetCollection: typeof MISSIONARY_GIVING_PAGES_SLUG }
  >,
  template: PageTemplateForCreate,
  templateTenant: string | null,
  defaultLayout: CmsLayoutBlocks,
  templateKey: string,
): Promise<Response> {
  const { payload } = req;

  if (templateTenant && templateTenant !== tenantId) {
    return jsonResponse({ error: "Template is not in your tenant" }, 403);
  }

  if (template.pageType !== MISSIONARY_GIVING_PAGE_TYPE) {
    return jsonResponse(
      { error: "Template page type must be missionary_giving" },
      400,
    );
  }

  const { client: supabase, error: adminError } = getAdminClient();
  if (!supabase || adminError) {
    return jsonResponse(
      { error: adminError ?? "Admin client unavailable" },
      503,
    );
  }

  const { data: missionaryRowForTenant, error: missionaryError } =
    await findMissionaryById(supabase, parsed.missionaryId, tenantId);
  if (missionaryError || !missionaryRowForTenant?.id) {
    return jsonResponse({ error: "Missionary not found for tenant" }, 404);
  }

  const dup = await payload.find({
    collection: MISSIONARY_GIVING_PAGES_SLUG,
    limit: 1,
    pagination: false,
    req,
    where: {
      and: [
        { missionaryId: { equals: parsed.missionaryId } },
        { tenant: { equals: tenantId } },
      ],
    },
  });
  if (dup.docs[0]) {
    return jsonResponse(
      {
        error: "A missionary giving page already exists for this missionary",
        existingId: String(dup.docs[0].id),
      },
      409,
    );
  }

  const missionaryRowQuery = supabase
    .from("missionaries")
    .select("id, profile_id")
    .eq("id", parsed.missionaryId);

  const scopedMissionaryRowQuery = missionaryRowQuery.eq("tenant_id", tenantId);

  const missionaryLookupResult = await scopedMissionaryRowQuery.single();
  const missionaryRow = missionaryLookupResult?.data;
  const missionaryRowError = missionaryLookupResult?.error;

  if (missionaryRowError || !missionaryRow?.id) {
    return jsonResponse({ error: "Missionary not found" }, 404);
  }
  if (!missionaryRow.profile_id) {
    return jsonResponse({ error: "Missionary has no linked profile" }, 422);
  }

  const { data: profileRow } = await supabase
    .from("profiles")
    .select("full_name, display_name")
    .eq("id", missionaryRow.profile_id)
    .maybeSingle();

  const display =
    (typeof profileRow?.full_name === "string" &&
      profileRow.full_name.trim()) ||
    (typeof profileRow?.display_name === "string" &&
      profileRow.display_name.trim()) ||
    "Missionary";
  const titleBase = `${display} — Give`;
  const slugBase =
    slugifySegment(`${display}-${parsed.missionaryId.slice(0, 8)}`) ||
    slugifySegment(`give-${parsed.missionaryId}`);

  const profileMatch = await payload.find({
    collection: "missionary-profiles",
    limit: 1,
    pagination: false,
    req,
    where: {
      and: [
        { tenant: { equals: tenantId } },
        { supabaseMissionaryId: { equals: parsed.missionaryId } },
      ],
    },
  });

  const matchedProfile = profileMatch.docs[0] as
    | { id?: string | number }
    | undefined;
  const missionaryProfileId =
    matchedProfile &&
    typeof matchedProfile === "object" &&
    "id" in matchedProfile
      ? matchedProfile.id
      : undefined;

  const data: MissionaryGivingPageCreateData = {
    tenant: Number(tenantId),
    missionaryId: parsed.missionaryId,
    missionaryProfile:
      missionaryProfileId === undefined || missionaryProfileId === null
        ? undefined
        : Number(missionaryProfileId),
    templateKey,
    template: Number(parsed.templateId),
    title: titleBase,
    slug: slugBase || slugifySegment("give"),
    summary:
      typeof template.defaultSummary === "string"
        ? template.defaultSummary
        : undefined,
    pageType: MISSIONARY_GIVING_PAGE_TYPE,
    layout: defaultLayout,
  };

  let doc: { id: string | number };
  try {
    doc = await payload.create({
      collection: MISSIONARY_GIVING_PAGES_SLUG,
      data,
      draft: true,
      req,
    });
  } catch {
    const race = await payload.find({
      collection: MISSIONARY_GIVING_PAGES_SLUG,
      limit: 1,
      pagination: false,
      req,
      where: {
        and: [
          { missionaryId: { equals: parsed.missionaryId } },
          { tenant: { equals: tenantId } },
        ],
      },
    });
    if (race.docs[0]) {
      return jsonResponse(
        {
          error: "A missionary giving page already exists for this missionary",
          existingId: String(race.docs[0].id),
        },
        409,
      );
    }
    throw new Error("Failed to create missionary giving page");
  }

  return jsonResponse({
    id: String(doc.id),
    collectionSlug: MISSIONARY_GIVING_PAGES_SLUG,
  });
}

async function createProjectPageFromTemplate(
  req: PayloadRequest,
  tenantId: string,
  parsed: Extract<ParsedBody, { targetCollection: typeof PROJECT_PAGES_SLUG }>,
  template: PageTemplateForCreate,
  templateTenant: string | null,
  defaultLayout: CmsLayoutBlocks,
  templateKey: string,
): Promise<Response> {
  const { payload } = req;

  if (templateTenant && templateTenant !== tenantId) {
    return jsonResponse({ error: "Template is not in your tenant" }, 403);
  }

  if (template.pageType !== PROJECT_PAGE_TYPE) {
    return jsonResponse({ error: "Template page type must be project" }, 400);
  }

  const { client: supabase, error: adminError } = getAdminClient();
  if (!supabase || adminError) {
    return jsonResponse(
      { error: adminError ?? "Admin client unavailable" },
      503,
    );
  }

  const fundQuery = supabase
    .from("funds")
    .select("id, name, description, missionary_id")
    .eq("id", parsed.fundId);

  const scopedFundQuery = fundQuery.eq("tenant_id", tenantId);

  const { data: fund, error: fundError } = await scopedFundQuery.single();
  if (fundError || !fund?.id) {
    return jsonResponse({ error: "Fund not found for tenant" }, 404);
  }

  const dup = await payload.find({
    collection: PROJECT_PAGES_SLUG,
    limit: 1,
    pagination: false,
    req,
    where: {
      and: [
        { fundId: { equals: parsed.fundId } },
        { tenant: { equals: tenantId } },
      ],
    },
  });
  if (dup.docs[0]) {
    return jsonResponse(
      {
        error: "A project page already exists for this fund",
        existingId: String(dup.docs[0].id),
      },
      409,
    );
  }

  const titleBase =
    typeof fund.name === "string" && fund.name.trim().length > 0
      ? fund.name
      : "Project page";
  const slugBase =
    slugifySegment(`${titleBase}-${parsed.fundId.slice(0, 8)}`) ||
    slugifySegment(parsed.fundId);

  const data: ProjectPageCreateData = {
    tenant: Number(tenantId),
    fundId: parsed.fundId,
    templateKey,
    template: Number(parsed.templateId),
    title: titleBase,
    slug: slugBase || slugifySegment(parsed.fundId),
    summary:
      typeof fund.description === "string"
        ? fund.description
        : typeof template.defaultSummary === "string"
          ? template.defaultSummary
          : undefined,
    pageType: PROJECT_PAGE_TYPE,
    layout: defaultLayout,
  };

  let doc: { id: string | number };
  try {
    doc = await payload.create({
      collection: PROJECT_PAGES_SLUG,
      data,
      draft: true,
      req,
    });
  } catch {
    const race = await payload.find({
      collection: PROJECT_PAGES_SLUG,
      limit: 1,
      pagination: false,
      req,
      where: {
        and: [
          { fundId: { equals: parsed.fundId } },
          { tenant: { equals: tenantId } },
        ],
      },
    });
    if (race.docs[0]) {
      return jsonResponse(
        {
          error: "A project page already exists for this fund",
          existingId: String(race.docs[0].id),
        },
        409,
      );
    }
    throw new Error("Failed to create project page");
  }

  return jsonResponse({
    id: String(doc.id),
    collectionSlug: PROJECT_PAGES_SLUG,
  });
}

async function createMinistryUpdateFromTemplate(
  req: PayloadRequest,
  tenantId: string,
  parsed: Extract<ParsedBody, { targetCollection: "ministry-updates" }>,
  template: PageTemplateForCreate,
  templateTenant: string | null,
): Promise<Response> {
  const { payload } = req;

  if (templateTenant && templateTenant !== tenantId) {
    return jsonResponse({ error: "Template is not in your tenant" }, 403);
  }

  if (template.pageType !== MINISTRY_UPDATE_TEMPLATE_PAGE_TYPE) {
    return jsonResponse(
      {
        error:
          "Template page type must be ministry_update for ministry updates",
      },
      400,
    );
  }

  const profileCheck = await payload.findByID({
    collection: "missionary-profiles",
    id: parsed.missionaryProfileId,
    depth: 0,
    req,
  });
  const profileTenant = profileCheck
    ? readTenantIdFromDoc(
        profileCheck as { tenant?: number | { id: string | number } | null },
      )
    : null;
  if (!profileCheck || profileTenant !== tenantId) {
    return jsonResponse({ error: "Missionary profile not found" }, 404);
  }

  const data: MinistryUpdateCreateData = {
    tenant: Number(tenantId),
    missionary: Number(parsed.missionaryProfileId),
    title: parsed.title,
    slug: slugifySegment(parsed.slug),
    excerpt:
      typeof template.defaultSummary === "string"
        ? template.defaultSummary
        : undefined,
    content: emptyRichTextContent,
  };

  const doc = await payload.create({
    collection: "ministry-updates",
    data,
    draft: true,
    req,
  });

  return jsonResponse({
    id: String(doc.id),
    collectionSlug: "ministry-updates" as const,
  });
}

export const webStudioCreateFromTemplateEndpoint: Endpoint = {
  method: "post",
  path: "/web-studio/create-from-template",
  handler: async (req): Promise<Response> => {
    const auth = await requireStaff(req);
    if (!auth.ok) {
      return auth.response;
    }

    const { ctx } = auth;

    let parsed: ParsedBody;
    try {
      const json = (await (req as Request).json()) as unknown;
      parsed = bodySchema.parse(json);
    } catch {
      return jsonResponse({ error: "Invalid request body" }, 400);
    }

    const { payload } = req;
    const template = await payload.findByID({
      collection: PAGE_TEMPLATES_SLUG,
      id: parsed.templateId,
      depth: 0,
      req,
    });

    if (!template) {
      return jsonResponse({ error: "Template not found" }, 404);
    }

    const templateDoc = template as unknown as PageTemplateForCreate;

    const templateTenant = readTemplateTenant(templateDoc);

    const tenantResolution = await resolveRequestedTenantId(req, ctx, parsed);
    if (!tenantResolution.ok) {
      return tenantResolution.response;
    }

    const { tenantId } = tenantResolution;

    if (templateTenant && templateTenant !== tenantId) {
      return jsonResponse({ error: "Template is not in your tenant" }, 403);
    }

    const defaultLayout = readDefaultLayout(templateDoc);
    const templateKey = readTemplateKey(templateDoc);

    if (parsed.targetCollection === "pages") {
      return createPageFromTemplate(
        req,
        tenantId,
        parsed,
        templateDoc,
        defaultLayout,
        templateKey,
      );
    }

    if (parsed.targetCollection === MISSIONARY_GIVING_PAGES_SLUG) {
      return createMissionaryGivingPageFromTemplate(
        req,
        tenantId,
        parsed,
        templateDoc,
        templateTenant,
        defaultLayout,
        templateKey,
      );
    }

    if (parsed.targetCollection === PROJECT_PAGES_SLUG) {
      return createProjectPageFromTemplate(
        req,
        tenantId,
        parsed,
        templateDoc,
        templateTenant,
        defaultLayout,
        templateKey,
      );
    }

    if (parsed.targetCollection === "ministry-updates") {
      return createMinistryUpdateFromTemplate(
        req,
        tenantId,
        parsed,
        templateDoc,
        templateTenant,
      );
    }

    return jsonResponse({ error: "Unsupported target" }, 400);
  },
};
