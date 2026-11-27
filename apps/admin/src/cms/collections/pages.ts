import { isReservedPublicPageSlug } from "@asym/lib/cms/public-page";

import {
  createLegacyRichTextField,
  createPageLayoutField,
  PAGE_FAMILY_OPTIONS,
  sameTenantOptions,
  webStudioCreateFlowView,
} from "./page-builders";
import { pagesGeneratePreviewURL } from "../../cms-ui/web-studio/adapters/preview-url";
import { isNativePagesWebStudioEnabled } from "../../cms-ui/web-studio/feature-flags";
import { studioDocumentEditViews } from "../../cms-ui/web-studio/shell/document-tabs";
import { coreRichTextDocumentSchema } from "../rich-text-document-schema";
import {
  pageFamilyRule,
  pageKeepsSiteRule,
  recordPageWriteMode,
  refuseLiveWrite,
  refusePublishedStatus,
  refuseRestoreUnderLock,
} from "../tenancy/page-rules";
import { tenantScoped } from "../tenancy/tenant-scoped";

import type { CollectionConfig } from "payload";

const nativePagesAdmin = isNativePagesWebStudioEnabled()
  ? {
      components: {
        views: {
          list: {
            Component:
              "/src/cms-ui/web-studio/pages/list/PagesNativeListView.tsx#PagesNativeListView",
          },
          edit: studioDocumentEditViews(
            "/src/cms-ui/web-studio/pages/document/PagesNativeEditView.tsx#PagesNativeEditView",
          ),
          ...webStudioCreateFlowView(
            "/src/cms-ui/web-studio/flows/StandardPageFromTemplateView.tsx#StandardPageFromTemplateView",
          ),
        },
      },
    }
  : {};

export const Pages: CollectionConfig = tenantScoped(
  {
    slug: "pages",
    authorship: true,
    hooks: { beforeOperation: [refuseRestoreUnderLock, recordPageWriteMode] },
    admin: {
      defaultColumns: ["title", "slug", "family", "updatedAt"],
      useAsTitle: "title",
      preview: pagesGeneratePreviewURL,
      enableRichTextRelationship: false,
      ...nativePagesAdmin,
    },
    versions: {
      maxPerDoc: 50,
      drafts: {
        autosave: {
          interval: 2000,
          showSaveDraftButton: true,
        },
        validate: true,
      },
    },
    fields: [
      {
        name: "site",
        label: "Site",
        type: "relationship",
        relationTo: "site-presentations",
        required: true,
        filterOptions: sameTenantOptions,
      },
      {
        name: "family",
        type: "select",
        required: true,
        defaultValue: "standard",
        admin: { isClearable: false },
        options: [...PAGE_FAMILY_OPTIONS],
      },
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
      {
        name: "templateKey",
        type: "text",
        label: "Starter",
        index: true,
        admin: {
          readOnly: true,
          position: "sidebar",
          description: "The starter this page began from.",
        },
      },
      {
        name: "missionaryId",
        type: "text",
        label: "Missionary ID",
        index: true,
        admin: {
          readOnly: true,
          position: "sidebar",
          condition: (data) => data?.family === "missionary",
        },
      },
      {
        name: "fundId",
        type: "text",
        label: "Fund ID",
        index: true,
        admin: {
          readOnly: true,
          position: "sidebar",
          condition: (data) => data?.family === "project",
        },
      },
      createPageLayoutField(),
      {
        name: "content",
        type: "richText",
        jsonSchema: [coreRichTextDocumentSchema],
        label: "Body text",
        admin: {
          description:
            "Shown on the public page only when it has no layout sections.",
          disabled: { column: true, filter: true, groupBy: true },
        },
      },
      createLegacyRichTextField(),
    ],
  },
  {
    actorCreate: true,
    actorUpdate: true,
    actorDelete: true,
    keepsServiceId: false,
    rules: [
      refusePublishedStatus,
      refuseLiveWrite,
      ({ merged }) =>
        typeof merged.slug === "string" && isReservedPublicPageSlug(merged.slug)
          ? [
              {
                path: "slug",
                message: "This address is reserved. Choose another page slug.",
              },
            ]
          : [],
      pageKeepsSiteRule,
      pageFamilyRule,
    ],
  },
);
