import { findMissionaryById } from "@asym/api/missionaries/queries";
import { getAdminClient } from "@asym/database/supabase/admin";

import {
  tenantScopedCreateAccess,
  tenantScopedDeleteAccess,
  tenantScopedReadAccess,
  tenantScopedUpdateAccess,
} from "../access/tenant-access";
import {
  getTenantContext,
  isStaffRole,
  isSuperAdmin,
} from "../access/tenant-context";
import { PAGE_TEMPLATES_SLUG } from "../constants";
import { logCmsChangeAudit, logCmsDeleteAudit } from "../hooks/audit";
import { applyTenantFromContext } from "../hooks/tenant";
import { coreRichTextDocumentSchema } from "../rich-text-document-schema";

import type { Block, Field, PayloadRequest, Validate } from "payload";

export const STANDARD_PAGE_TYPE = "standard";
export const MISSIONARY_GIVING_PAGE_TYPE = "missionary_giving";
export const PROJECT_PAGE_TYPE = "project";
export const MINISTRY_UPDATE_TEMPLATE_PAGE_TYPE = "ministry_update";

export const PAGE_TYPE_OPTIONS = [
  { label: "Standard page", value: STANDARD_PAGE_TYPE },
  { label: "Missionary giving page", value: MISSIONARY_GIVING_PAGE_TYPE },
  { label: "Project page", value: PROJECT_PAGE_TYPE },
] as const;

export const PAGE_TEMPLATE_PAGE_TYPES = [
  ...PAGE_TYPE_OPTIONS,
  {
    label: "Ministry update starter",
    value: MINISTRY_UPDATE_TEMPLATE_PAGE_TYPE,
  },
] as const;

export const PAGE_LAYOUT_BLOCK_SLUGS = {
  callToAction: "call-to-action",
  faq: "faq",
  hero: "hero",
  impactStats: "impact-stats",
  mediaFeature: "media-feature",
  richText: "rich-text",
  testimonial: "testimonial",
} as const;

const UUID_REFERENCE_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function validateUuidReference(value: unknown) {
  if (typeof value === "string" && UUID_REFERENCE_PATTERN.test(value.trim())) {
    return true;
  }

  return "Must be a valid UUID reference.";
}

function readRelationshipId(value: unknown) {
  if (typeof value === "string" || typeof value === "number") {
    return String(value);
  }

  if (value && typeof value === "object" && "id" in value) {
    const id = (value as { id?: unknown }).id;
    if (typeof id === "string" || typeof id === "number") {
      return String(id);
    }
  }

  return null;
}

async function resolvePublicTenantIdFromCmsTenant({
  cmsTenantId,
  req,
}: {
  cmsTenantId: string | null;
  req: PayloadRequest;
}) {
  if (!cmsTenantId) {
    return null;
  }

  const tenant = await req.payload.findByID({
    collection: "tenants",
    depth: 0,
    disableErrors: true,
    id: cmsTenantId,
    overrideAccess: true,
    req,
  });

  const slug =
    tenant && typeof tenant === "object" && "slug" in tenant
      ? tenant.slug
      : null;
  if (typeof slug !== "string" || !slug.trim()) {
    return null;
  }

  const { client: supabase } = getAdminClient();
  if (!supabase) {
    return null;
  }

  const { data } = await supabase
    .from("tenants")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();

  return data && typeof data.id === "string" ? data.id : null;
}

async function resolvePublicTenantIdForValidation(options: {
  data?: Partial<Record<string, unknown>>;
  req: PayloadRequest;
  siblingData?: Partial<Record<string, unknown>>;
}) {
  const context = getTenantContext(options.req);
  if (context.publicTenantId) {
    return context.publicTenantId;
  }

  const cmsTenantId =
    readRelationshipId(options.siblingData?.tenant) ??
    readRelationshipId(options.data?.tenant) ??
    context.tenantId;

  return resolvePublicTenantIdFromCmsTenant({
    cmsTenantId,
    req: options.req,
  });
}

async function validateGivingSourceReference(
  value: unknown,
  options:
    | {
        data?: Partial<Record<string, unknown>>;
        req?: PayloadRequest;
        siblingData?: Partial<Record<string, unknown>>;
      }
    | undefined,
  source: "fund" | "missionary",
) {
  const uuidResult = validateUuidReference(value);
  if (uuidResult !== true) {
    return uuidResult;
  }

  if (!options?.req || typeof value !== "string") {
    return true;
  }

  if (
    typeof options.req.context === "object" &&
    options.req.context !== null &&
    "cmsLocalSeed" in options.req.context &&
    options.req.context.cmsLocalSeed === true
  ) {
    return true;
  }

  const context = getTenantContext(options.req);
  if (!context.isAuthenticated || !isStaffRole(context)) {
    return "Staff access required to validate this reference.";
  }

  const { client: supabase, error } = getAdminClient();
  if (!supabase || error) {
    return "Unable to validate this reference right now.";
  }

  const publicTenantId = await resolvePublicTenantIdForValidation({
    data: options.data,
    req: options.req,
    siblingData: options.siblingData,
  });

  if (!publicTenantId && !isSuperAdmin(context)) {
    return "This organization is not linked to giving data.";
  }

  if (!publicTenantId) {
    return "Choose an organization before checking this reference.";
  }

  if (source === "missionary") {
    const { data } = await findMissionaryById(supabase, value, publicTenantId);
    return data?.id ? true : "Missionary not found in this organization.";
  }

  const { data } = await supabase
    .from("funds")
    .select("id")
    .eq("id", value)
    .eq("tenant_id", publicTenantId)
    .maybeSingle();

  return data?.id ? true : "Fund not found in this organization.";
}

const validateMissionarySourceReference: Validate = (value, options) =>
  validateGivingSourceReference(value, options, "missionary");

const validateFundSourceReference: Validate = (value, options) =>
  validateGivingSourceReference(value, options, "fund");

const pageLayoutBlocks: Block[] = [
  {
    slug: PAGE_LAYOUT_BLOCK_SLUGS.hero,
    labels: {
      singular: "Hero Section",
      plural: "Hero Sections",
    },
    fields: [
      {
        name: "eyebrow",
        type: "text",
      },
      {
        name: "headline",
        type: "text",
        required: true,
      },
      {
        name: "subheading",
        type: "textarea",
      },
      {
        name: "backgroundImage",
        type: "relationship",
        relationTo: "media",
      },
      {
        name: "primaryCtaLabel",
        type: "text",
      },
      {
        name: "primaryCtaHref",
        type: "text",
      },
    ],
  },
  {
    slug: PAGE_LAYOUT_BLOCK_SLUGS.richText,
    labels: {
      singular: "Rich Text Section",
      plural: "Rich Text Sections",
    },
    fields: [
      {
        name: "heading",
        type: "text",
      },
      {
        name: "body",
        type: "richText",
        required: true,
        jsonSchema: [coreRichTextDocumentSchema],
      },
    ],
  },
  {
    slug: PAGE_LAYOUT_BLOCK_SLUGS.mediaFeature,
    labels: {
      singular: "Media Feature",
      plural: "Media Features",
    },
    fields: [
      {
        name: "title",
        type: "text",
      },
      {
        name: "body",
        type: "textarea",
      },
      {
        name: "media",
        type: "relationship",
        relationTo: "media",
        required: true,
      },
      {
        name: "mediaCaption",
        type: "text",
      },
    ],
  },
  {
    slug: PAGE_LAYOUT_BLOCK_SLUGS.callToAction,
    labels: {
      singular: "Call To Action",
      plural: "Calls To Action",
    },
    fields: [
      {
        name: "headline",
        type: "text",
        required: true,
      },
      {
        name: "copy",
        type: "textarea",
      },
      {
        name: "buttonLabel",
        type: "text",
        required: true,
      },
      {
        name: "buttonHref",
        type: "text",
        required: true,
      },
      {
        name: "openInNewTab",
        type: "checkbox",
        defaultValue: false,
      },
    ],
  },
  {
    slug: PAGE_LAYOUT_BLOCK_SLUGS.faq,
    labels: {
      singular: "FAQ",
      plural: "FAQs",
    },
    fields: [
      {
        name: "heading",
        type: "text",
      },
      {
        name: "items",
        type: "array",
        required: true,
        fields: [
          {
            name: "question",
            type: "text",
            required: true,
          },
          {
            name: "answer",
            type: "textarea",
            required: true,
          },
        ],
      },
    ],
  },
  {
    slug: PAGE_LAYOUT_BLOCK_SLUGS.impactStats,
    labels: {
      singular: "Impact Stats",
      plural: "Impact Stats",
    },
    fields: [
      {
        name: "heading",
        type: "text",
      },
      {
        name: "items",
        type: "array",
        required: true,
        fields: [
          {
            name: "label",
            type: "text",
            required: true,
          },
          {
            name: "value",
            type: "text",
            required: true,
          },
          {
            name: "description",
            type: "text",
          },
        ],
      },
    ],
  },
  {
    slug: PAGE_LAYOUT_BLOCK_SLUGS.testimonial,
    labels: {
      singular: "Testimonial",
      plural: "Testimonials",
    },
    fields: [
      {
        name: "quote",
        type: "textarea",
        required: true,
      },
      {
        name: "attribution",
        type: "text",
        required: true,
      },
      {
        name: "role",
        type: "text",
      },
    ],
  },
];

export function createPageLayoutField(name = "layout"): Field {
  return {
    name,
    type: "blocks",
    blocks: pageLayoutBlocks,
    labels: {
      singular: "Layout section",
      plural: "Layout sections",
    },
    // Sections are edited in the page, not listed, filtered or grouped.
    admin: { disabled: { column: true, filter: true, groupBy: true } },
  };
}

export function createTenantField(): Field {
  return {
    name: "tenant",
    label: "Organization",
    type: "relationship",
    relationTo: "tenants",
    required: true,
    index: true,
  };
}

export function createPageTypeField(
  defaultValue:
    | typeof STANDARD_PAGE_TYPE
    | typeof MISSIONARY_GIVING_PAGE_TYPE
    | typeof PROJECT_PAGE_TYPE = STANDARD_PAGE_TYPE,
): Field {
  return {
    name: "pageType",
    type: "select",
    required: true,
    defaultValue,
    admin: {
      isClearable: false,
    },
    options: [...PAGE_TYPE_OPTIONS],
  };
}

export function createTemplateRelationshipField(
  name = "template",
  label = "Template",
): Field {
  return {
    name,
    label,
    type: "relationship",
    relationTo: PAGE_TEMPLATES_SLUG,
  };
}

export function createTemplateLayoutField(name = "defaultLayout"): Field {
  return createPageLayoutField(name);
}

export function createLegacyRichTextField(
  name = "legacyContentFallback",
): Field {
  return {
    name,
    type: "checkbox",
    label: "Use body text when there are no sections",
    defaultValue: true,
    admin: {
      description:
        "When the page has no layout sections, the public page shows the body text instead.",
      // A rendering switch, not something staff sort lists by.
      disabled: { column: true, filter: true, groupBy: true },
    },
  };
}

export function buildPageBuilderCollectionFields(
  pageType: "missionary-giving" | "project",
): Field[] {
  const sourceField =
    pageType === "missionary-giving"
      ? ({
          name: "missionaryId",
          type: "text",
          required: true,
          index: true,
          validate: validateMissionarySourceReference,
          label: "Missionary ID",
          admin: {
            description:
              "The missionary this page raises support for. Set when the page is created.",
            readOnly: true,
            // The editor header names the record; the raw ID is a detail.
            position: "sidebar",
          },
        } satisfies Field)
      : ({
          name: "fundId",
          type: "text",
          required: true,
          index: true,
          validate: validateFundSourceReference,
          label: "Fund ID",
          admin: {
            description:
              "The fund this page raises money for. Set when the page is created.",
            readOnly: true,
            // The editor header names the record; the raw ID is a detail.
            position: "sidebar",
          },
        } satisfies Field);

  const pageTypeValue =
    pageType === "missionary-giving"
      ? MISSIONARY_GIVING_PAGE_TYPE
      : PROJECT_PAGE_TYPE;

  return [
    createTenantField(),
    sourceField,
    ...(pageType === "missionary-giving"
      ? ([
          {
            name: "missionaryProfile",
            type: "relationship",
            relationTo: "missionary-profiles",
            admin: {
              description:
                "Optional: the missionary profile this page links to, for their ministry updates.",
            },
          },
        ] satisfies Field[])
      : []),
    createPageTypeField(pageTypeValue),
    {
      name: "templateKey",
      type: "text",
      label: "Template key",
      required: true,
      index: true,
      admin: {
        description: "The template this page started from.",
      },
    },
    createTemplateRelationshipField(),
    {
      name: "title",
      type: "text",
      required: true,
    },
    {
      name: "slug",
      type: "text",
      required: true,
      index: true,
    },
    {
      name: "summary",
      type: "textarea",
    },
    {
      name: "seoDescription",
      type: "textarea",
      label: "Search description",
      admin: {
        description: "Shown under the page title in search results.",
      },
    },
    createPageLayoutField(),
  ];
}

/**
 * Serves a Core create flow on a collection's `/create` route. Payload's
 * stock create view saves an empty draft as soon as it renders for an
 * autosave collection (so every visit left an "Untitled (N)" draft); the
 * Core flow saves nothing until the editor submits it. Pass a flow already
 * registered as a root admin view, so the import map holds it.
 */
export function webStudioCreateFlowView(Component: string) {
  return {
    webStudioCreate: { Component, path: "/create", exact: true },
  };
}

export function buildPageBuilderVersions() {
  return {
    drafts: {
      autosave: {
        interval: 300,
        showSaveDraftButton: true,
      },
    },
  };
}

export function buildPageBuilderHooks() {
  return {
    beforeValidate: [applyTenantFromContext("tenant")],
    afterChange: [logCmsChangeAudit],
    afterDelete: [logCmsDeleteAudit],
  };
}

export function withTenantAccessAndHooks() {
  return {
    access: {
      read: tenantScopedReadAccess("tenant"),
      create: tenantScopedCreateAccess("tenant"),
      update: tenantScopedUpdateAccess("tenant"),
      delete: tenantScopedDeleteAccess("tenant"),
    },
    hooks: buildPageBuilderHooks(),
  };
}
