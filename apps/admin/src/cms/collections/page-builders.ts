import {
  tenantScopedCreateAccess,
  tenantScopedDeleteAccess,
  tenantScopedReadAccess,
  tenantScopedUpdateAccess,
} from "../access/tenant-access";
import { PAGE_TEMPLATES_SLUG } from "../constants";
import { logCmsChangeAudit, logCmsDeleteAudit } from "../hooks/audit";
import { applyTenantFromContext } from "../hooks/tenant";

import type { Block, Field } from "payload";

export const STANDARD_PAGE_TYPE = "standard";
export const MISSIONARY_GIVING_PAGE_TYPE = "missionary_giving";
export const PROJECT_PAGE_TYPE = "project";
export const MINISTRY_UPDATE_TEMPLATE_PAGE_TYPE = "ministry_update";

export const PAGE_TYPE_OPTIONS = [
  { label: "Standard Page", value: STANDARD_PAGE_TYPE },
  { label: "Missionary Giving Page", value: MISSIONARY_GIVING_PAGE_TYPE },
  { label: "Project Page", value: PROJECT_PAGE_TYPE },
] as const;

export const PAGE_TEMPLATE_PAGE_TYPES = [
  ...PAGE_TYPE_OPTIONS,
  {
    label: "Ministry Update Starter",
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
      singular: "Layout Section",
      plural: "Layout Sections",
    },
  };
}

export function createTenantField(): Field {
  return {
    name: "tenant",
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

export function createLegacyRichTextField(name = "legacyContentFallback"): Field {
  return {
    name,
    type: "checkbox",
    defaultValue: true,
    admin: {
      description:
        "When enabled, public rendering may fall back to the legacy content field if no layout blocks are configured.",
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
          admin: {
            description:
              "Canonical missionary ID from public.missionaries. Prefilled by the create flow.",
          },
        } satisfies Field)
      : ({
          name: "fundId",
          type: "text",
          required: true,
          index: true,
          admin: {
            description:
              "Canonical fund ID from public.funds. Prefilled by the create flow.",
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
                "Optional link to the CMS missionary profile used for ministry updates and editorial cross-navigation.",
            },
          },
        ] satisfies Field[])
      : []),
    createPageTypeField(pageTypeValue),
    {
      name: "templateKey",
      type: "text",
      required: true,
      index: true,
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
    },
    createPageLayoutField(),
  ];
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
