import {
  createLegacyRichTextField,
  createPageLayoutField,
  createPageTypeField,
  createTemplateRelationshipField,
  webStudioCreateFlowView,
} from "./page-builders";
import { pagesGeneratePreviewURL } from "../../cms-ui/web-studio/adapters/preview-url";
import { isNativePagesWebStudioEnabled } from "../../cms-ui/web-studio/feature-flags";
import { studioDocumentEditViews } from "../../cms-ui/web-studio/shell/document-tabs";
import {
  PUBLIC_COLLECTION_CAPABILITIES,
  publishedPublicReadAccess,
} from "../access/public-read";
import {
  tenantScopedCreateAccess,
  tenantScopedDeleteAccess,
  tenantScopedUpdateAccess,
} from "../access/tenant-access";
import { logCmsChangeAudit, logCmsDeleteAudit } from "../hooks/audit";
import { applyTenantFromContext } from "../hooks/tenant";
import { coreRichTextDocumentSchema } from "../rich-text-document-schema";

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

export const Pages: CollectionConfig = {
  slug: "pages",
  authorship: false,
  admin: {
    defaultColumns: ["title", "slug", "tenant", "updatedAt"],
    useAsTitle: "title",
    preview: pagesGeneratePreviewURL,
    ...nativePagesAdmin,
  },
  access: {
    read: publishedPublicReadAccess(
      "tenant",
      PUBLIC_COLLECTION_CAPABILITIES["pages"],
    ),
    create: tenantScopedCreateAccess("tenant"),
    update: tenantScopedUpdateAccess("tenant"),
    delete: tenantScopedDeleteAccess("tenant"),
  },
  hooks: {
    beforeValidate: [applyTenantFromContext("tenant")],
    afterChange: [logCmsChangeAudit],
    afterDelete: [logCmsDeleteAudit],
  },
  versions: {
    drafts: {
      autosave: {
        interval: 300,
        showSaveDraftButton: true,
      },
    },
  },
  fields: [
    {
      name: "tenant",
      label: "Organization",
      type: "relationship",
      relationTo: "tenants",
      required: true,
      index: true,
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
    createPageTypeField(),
    createTemplateRelationshipField(),
    createPageLayoutField(),
    {
      name: "content",
      type: "richText",
      required: true,
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
};
