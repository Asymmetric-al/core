import { readEditingActor } from "../access/tenant-context";
import { coreRichTextDocumentSchema } from "../rich-text-document-schema";
import { idOf } from "../tenancy/reference-guard";

import type {
  Block,
  Field,
  FilterOptions,
  PayloadRequest,
  Where,
} from "payload";

export const PAGE_LAYOUT_BLOCK_SLUGS = {
  callToAction: "call-to-action",
  faq: "faq",
  hero: "hero",
  impactStats: "impact-stats",
  mediaFeature: "media-feature",
  richText: "rich-text",
  testimonial: "testimonial",
} as const;

export const PAGE_FAMILY_OPTIONS = [
  { label: "Standard page", value: "standard" },
  { label: "Missionary page", value: "missionary" },
  { label: "Project page", value: "project" },
] as const;

const UUID_REFERENCE_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function validateUuidReference(value: unknown) {
  if (typeof value === "string" && UUID_REFERENCE_PATTERN.test(value.trim())) {
    return true;
  }

  return "Must be a valid UUID reference.";
}

function documentTenant(data: unknown, req: PayloadRequest) {
  const tenant = (data as { tenant?: unknown } | undefined)?.tenant;
  if (typeof tenant === "string" && tenant.length > 0) return tenant;
  return readEditingActor(req)?.tenantId ?? null;
}

export const sameTenantOptions: FilterOptions = ({ data, req }) => {
  const tenant = documentTenant(data, req);
  return tenant ? { tenant: { equals: tenant } } : false;
};

export const sameSitePageOptions: FilterOptions = ({ data, req }) => {
  const tenant = documentTenant(data, req);
  const site = idOf((data as { site?: unknown } | undefined)?.site);
  if (!tenant || !site) return false;
  const where: Where = {
    and: [{ tenant: { equals: tenant } }, { site: { equals: site } }],
  };
  return where;
};

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
        filterOptions: sameTenantOptions,
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
        filterOptions: sameTenantOptions,
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
    admin: { disabled: { column: true, filter: true, groupBy: true } },
  };
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
      disabled: { column: true, filter: true, groupBy: true },
    },
  };
}

export function webStudioCreateFlowView(Component: string) {
  return {
    webStudioCreate: { Component, path: "/create", exact: true },
  };
}
